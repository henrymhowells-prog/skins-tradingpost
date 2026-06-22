import { revalidatePath } from "next/cache";
import AppShell from "../components/AppShell";
import ListingInventoryPicker from "../components/ListingInventoryPicker";
import WantedItemPicker from "../components/WantedItemPicker";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function createListing(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();

  const giveItemOverpay = formData.get("give_item_overpay") === "on";
  const wantItemOverpay = formData.get("want_item_overpay") === "on";

  const offerItemIds = formData
    .getAll("offer_item_ids")
    .map((id) => String(id).trim())
    .filter(Boolean);

  const wantedItems = formData
    .getAll("wanted_items")
    .map((item) => String(item).trim())
    .filter(Boolean);

  const wantedFloatMin = formData.getAll("wanted_float_min");
  const wantedFloatMax = formData.getAll("wanted_float_max");
  const wantedPatternSeed = formData.getAll("wanted_pattern_seed");

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You must be signed in with Steam to create a listing.");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      user_id: currentUser.id,
      title,
      status: "active",
      give_item_overpay: giveItemOverpay,
      want_item_overpay: wantItemOverpay,
      refreshed_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      last_refresh_at: null,
    })
    .select()
    .single();

  if (error || !listing) {
    throw new Error(error?.message || "Failed to create listing");
  }

  if (offerItemIds.length > 0) {
    const { data: inventoryItems } = await supabase
      .from("inventory_items")
      .select("id, item_name")
      .in("id", offerItemIds);

    await supabase.from("listing_offer_items").insert(
      (inventoryItems || []).map((item) => ({
        listing_id: listing.id,
        inventory_item_id: item.id,
        item_name: item.item_name,
      }))
    );
  }

  if (wantedItems.length > 0) {
    await supabase.from("listing_wanted_items").insert(
      wantedItems.map((item, index) => ({
        listing_id: listing.id,
        item_name: item,
        float_min: wantedFloatMin[index] ? Number(wantedFloatMin[index]) : null,
        float_max: wantedFloatMax[index] ? Number(wantedFloatMax[index]) : null,
        pattern_seed: wantedPatternSeed[index]
          ? Number(wantedPatternSeed[index])
          : null,
      }))
    );
  }

  revalidatePath("/listings");
  revalidatePath("/browse");
}

async function refreshListing(formData: FormData) {
  "use server";

  const listingId = String(formData.get("listing_id") || "");

  const { data: listing } = await supabase
    .from("listings")
    .select("last_refresh_at")
    .eq("id", listingId)
    .single();

  if (listing?.last_refresh_at) {
    const lastRefresh = new Date(listing.last_refresh_at).getTime();
    const fifteenMinutes = 15 * 60 * 1000;

    if (Date.now() - lastRefresh < fifteenMinutes) {
      return;
    }
  }

  const { error } = await supabase.rpc("refresh_listing", {
    listing_uuid: listingId,
  });

  if (error) return;

  revalidatePath("/listings");
  revalidatePath("/browse");
  revalidatePath(`/trade/${listingId}`);
}

async function deleteListing(formData: FormData) {
  "use server";

  const listingId = String(formData.get("listing_id") || "");
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You must be signed in.");
  }

  await supabase.from("listing_offer_items").delete().eq("listing_id", listingId);
  await supabase.from("listing_wanted_items").delete().eq("listing_id", listingId);

  await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("user_id", currentUser.id);

  revalidatePath("/listings");
  revalidatePath("/browse");
}

function PageBackground() {
  return (
    <div className="fixed inset-y-0 left-64 right-0 z-0 overflow-hidden bg-[#121318]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="absolute -left-20 top-0 h-full w-40 -skew-x-12 bg-blue-800" />
      <div className="absolute left-64 top-72 h-[700px] w-72 -skew-x-12 bg-blue-800" />

      <div className="absolute -right-20 top-0 h-full w-44 -skew-x-12 bg-orange-500" />
      <div className="absolute right-12 top-0 h-full w-24 -skew-x-12 bg-orange-400/70" />

      <div className="absolute right-20 top-12 text-4xl font-black italic text-white/70">
        BETA
      </div>
    </div>
  );
}

function ItemOverpayCard({ side }: { side: "orange" | "blue" }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        side === "orange"
          ? "border-orange-500 bg-orange-500/10"
          : "border-blue-500 bg-blue-500/10"
      }`}
    >
      <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-zinc-800 text-3xl">
        💰
      </div>

      <p
        className={`text-center text-sm font-bold ${
          side === "orange" ? "text-orange-400" : "text-blue-400"
        }`}
      >
        Item Overpay
      </p>
    </div>
  );
}

function TradeItemCard({
  item,
  imageUrl,
}: {
  item: any;
  imageUrl?: string | null;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-3">
      <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-zinc-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.item_name}
            className="max-h-full object-contain"
          />
        ) : (
          <span className="text-xs text-zinc-500">No Image</span>
        )}
      </div>

      <p className="line-clamp-2 text-sm font-bold">{item.item_name}</p>

      {(item.float_min || item.float_max || item.pattern_seed) && (
        <div className="mt-2 text-xs text-zinc-400">
          {item.float_min && <p>Min Float: {item.float_min}</p>}
          {item.float_max && <p>Max Float: {item.float_max}</p>}
          {item.pattern_seed && <p>Pattern: {item.pattern_seed}</p>}
        </div>
      )}
    </div>
  );
}

export default async function ListingsPage() {
  const nowIso = new Date().toISOString();

  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("id, item_name, image_url, inspect_link, tradable")
    .order("item_name");

  const { data: cs2Items } = await supabase
    .from("cs2_items")
    .select("id, item_name, image_url, weapon_type, rarity")
    .range(0, 25000);

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .gt("expires_at", nowIso)
    .order("refreshed_at", { ascending: false });

  const { data: offerItems } = await supabase
    .from("listing_offer_items")
    .select("*");

  const { data: wantedItems } = await supabase
    .from("listing_wanted_items")
    .select("*");

  return (
    <AppShell>
      <PageBackground />

      <div className="relative z-10">
        <h1 className="text-5xl font-bold">My Listings</h1>

        <p className="mt-3 text-zinc-300">
          Create, refresh, and manage your active trade listings.
        </p>

        <form
          action={createListing}
          className="mt-8 rounded-3xl border border-zinc-800 bg-black/75 p-8 backdrop-blur"
        >
          <h2 className="text-2xl font-bold">Create Listing</h2>

          <div className="mt-6">
            <label className="text-sm text-zinc-400">Listing Title</label>
            <input
              name="title"
              required
              placeholder="Example: Looking for AK upgrade"
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[32px] border border-zinc-800 bg-black/90 p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-orange-400">
                  You Give
                </h3>

                <label className="flex items-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm text-orange-300">
                  <input type="checkbox" name="give_item_overpay" />
                  Item Overpay
                </label>
              </div>

              <ListingInventoryPicker items={inventoryItems || []} />
            </div>

            <div className="rounded-[32px] border border-zinc-800 bg-black/90 p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-blue-400">
                  You Want
                </h3>

                <label className="flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
                  <input type="checkbox" name="want_item_overpay" />
                  Item Overpay
                </label>
              </div>

              <WantedItemPicker items={cs2Items || []} />
            </div>
          </div>

          <button className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400">
            Create Listing
          </button>
        </form>

        <div className="mt-10">
          <h2 className="text-3xl font-bold">Active Listings</h2>

          <div className="mt-5 grid gap-8">
            {(listings || []).map((listing) => {
              const canRefresh =
                !listing.last_refresh_at ||
                Date.now() -
                  new Date(listing.last_refresh_at).getTime() >
                  15 * 60 * 1000;

              const cooldownMinutes = listing.last_refresh_at
                ? Math.ceil(
                    (15 * 60 * 1000 -
                      (Date.now() -
                        new Date(listing.last_refresh_at).getTime())) /
                      60000
                  )
                : 0;

              const giving = (offerItems || []).filter(
                (item) => item.listing_id === listing.id
              );

              const wanting = (wantedItems || []).filter(
                (item) => item.listing_id === listing.id
              );

              return (
                <div
                  key={listing.id}
                  className="rounded-3xl border border-zinc-800 bg-black/80 p-8 backdrop-blur"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-3xl font-bold">{listing.title}</h3>

                      <p className="mt-2 text-sm text-green-400">
                        Status: {listing.status}
                      </p>

                      {listing.refreshed_at && (
                        <p className="mt-1 text-sm text-zinc-400">
                          Posted:{" "}
                          {new Date(listing.refreshed_at).toLocaleString()}
                        </p>
                      )}

                      {listing.expires_at && (
                        <p className="mt-1 text-sm text-zinc-400">
                          Expires:{" "}
                          {new Date(listing.expires_at).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`/trade/${listing.id}`}
                        className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
                      >
                        View Trade
                      </a>

                      {canRefresh ? (
                        <form action={refreshListing}>
                          <input
                            type="hidden"
                            name="listing_id"
                            value={listing.id}
                          />

                          <button className="rounded-xl border border-green-500 px-5 py-3 font-semibold text-green-400 hover:bg-green-500 hover:text-white">
                            Refresh
                          </button>
                        </form>
                      ) : (
                        <button
                          disabled
                          className="cursor-not-allowed rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-500"
                          title="You can only refresh once every 15 minutes"
                        >
                          Refresh available in {Math.max(cooldownMinutes, 1)}m
                        </button>
                      )}

                      <form action={deleteListing}>
                        <input
                          type="hidden"
                          name="listing_id"
                          value={listing.id}
                        />

                        <button className="rounded-xl border border-red-500 px-5 py-3 font-semibold text-red-400 hover:bg-red-500 hover:text-white">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1fr_220px_1fr]">
                    <div className="min-h-[340px] rounded-[32px] border border-zinc-800 bg-black/90 p-6">
                      <h4 className="mb-6 text-2xl font-bold text-orange-400">
                        You Give
                      </h4>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {giving.map((item) => {
                          const details = (inventoryItems || []).find(
                            (inv) =>
                              inv.id === item.inventory_item_id ||
                              inv.item_name === item.item_name
                          );

                          return (
                            <TradeItemCard
                              key={item.id}
                              item={item}
                              imageUrl={details?.image_url}
                            />
                          );
                        })}

                        {listing.give_item_overpay && (
                          <ItemOverpayCard side="orange" />
                        )}
                      </div>
                    </div>

                    <div className="hidden flex-col items-center justify-center gap-8 lg:flex">
                      <div className="flex items-center gap-3 text-orange-400">
                        <div className="h-1 w-24 bg-orange-500" />
                        <span className="text-6xl leading-none">→</span>
                      </div>

                      <div className="flex items-center gap-3 text-blue-400">
                        <span className="text-6xl leading-none">←</span>
                        <div className="h-1 w-24 bg-blue-500" />
                      </div>
                    </div>

                    <div className="min-h-[340px] rounded-[32px] border border-zinc-800 bg-black/90 p-6">
                      <h4 className="mb-6 text-2xl font-bold text-blue-400">
                        You Want
                      </h4>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {wanting.map((item) => {
                          const details = (cs2Items || []).find(
                            (cs2) => cs2.item_name === item.item_name
                          );

                          return (
                            <TradeItemCard
                              key={item.id}
                              item={item}
                              imageUrl={details?.image_url}
                            />
                          );
                        })}

                        {listing.want_item_overpay && (
                          <ItemOverpayCard side="blue" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}