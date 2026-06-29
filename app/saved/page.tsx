import { revalidatePath } from "next/cache";
import AppShell from "../components/AppShell";
import PageBackground from "../components/PageBackground";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function removeSavedListing(formData: FormData) {
  "use server";

  const listingId = String(formData.get("listing_id") || "");
  const currentUser = await getCurrentUser();

  if (!currentUser || !listingId) return;

  await supabase
    .from("saved_listings")
    .delete()
    .eq("user_id", currentUser.id)
    .eq("listing_id", listingId);

  revalidatePath("/saved");
  revalidatePath("/search-trades");
}

function timeAgo(dateValue: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateValue).getTime()) / 1000
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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

function OpenToOffersCard({ side }: { side: "orange" | "blue" }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        side === "orange"
          ? "border-orange-500 bg-orange-500/10"
          : "border-blue-500 bg-blue-500/10"
      }`}
    >
      <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-zinc-800 text-3xl">
        🤝
      </div>

      <p
        className={`text-center text-sm font-bold ${
          side === "orange" ? "text-orange-400" : "text-blue-400"
        }`}
      >
        Open to Offers
      </p>
    </div>
  );
}

export default async function SavedPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <AppShell>
        <PageBackground leftOffset={256} />

        <div className="relative z-10">
          <h1 className="text-5xl font-bold">Please sign in</h1>

          <a
            href="/login"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
          >
            Sign in
          </a>
        </div>
      </AppShell>
    );
  }

  const { data: savedListings } = await supabase
    .from("saved_listings")
    .select("listing_id")
    .eq("user_id", currentUser.id);

  const listingIds = (savedListings || []).map((saved) => saved.listing_id);

  const { data: listings } =
    listingIds.length > 0
      ? await supabase
          .from("listings")
          .select("*")
          .in("id", listingIds)
          .order("refreshed_at", { ascending: false })
      : { data: [] };

  const { data: offerItems } =
    listingIds.length > 0
      ? await supabase
          .from("listing_offer_items")
          .select("*")
          .in("listing_id", listingIds)
      : { data: [] };

  const { data: wantedItems } =
    listingIds.length > 0
      ? await supabase
          .from("listing_wanted_items")
          .select("*")
          .in("listing_id", listingIds)
      : { data: [] };

  const itemNames = Array.from(
    new Set(
      [...(offerItems || []), ...(wantedItems || [])]
        .map((item) => item.item_name)
        .filter(Boolean)
    )
  );

  const { data: cs2Items } =
    itemNames.length > 0
      ? await supabase
          .from("cs2_items")
          .select("item_name, image_url, weapon_type, rarity")
          .in("item_name", itemNames)
      : { data: [] };

  return (
    <AppShell>
      <PageBackground leftOffset={256} />

      <div className="relative z-10">
        <h1 className="text-5xl font-bold">Saved Trades</h1>

        <p className="mt-3 text-zinc-300">
          Trade posts you saved to view later.
        </p>

        <div className="mt-8 grid gap-8">
          {(listings || []).length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-black/80 p-8 text-zinc-500 backdrop-blur">
              You have no saved trades yet.
            </div>
          ) : (
            listings?.map((listing) => {
              const postedDate = listing.refreshed_at || listing.created_at;

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
                      <h2 className="text-3xl font-bold">{listing.title}</h2>

                      <p className="mt-2 text-sm text-green-400">
                        Status: {listing.status}
                      </p>

                      <p className="mt-1 text-sm text-zinc-400">
                        Posted {postedDate ? timeAgo(postedDate) : "recently"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`/trade/${listing.id}`}
                        className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
                      >
                        View Trade
                      </a>

                      <form action={removeSavedListing}>
                        <input
                          type="hidden"
                          name="listing_id"
                          value={listing.id}
                        />

                        <button className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800">
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1fr_220px_1fr]">
                    <div className="min-h-[300px] rounded-[32px] border border-zinc-800 bg-black/90 p-6">
                      <h3 className="mb-6 text-2xl font-bold text-orange-400">
                        Trader Gives
                      </h3>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {giving.map((item) => {
                          const details = (cs2Items || []).find(
                            (cs2) => cs2.item_name === item.item_name
                          );

                          return (
                            <TradeItemCard
                              key={item.id}
                              item={item}
                              imageUrl={item.image_url || details?.image_url}
                            />
                          );
                        })}

                        {listing.give_item_overpay && (
                          <ItemOverpayCard side="orange" />
                        )}

                        {listing.give_open_to_offers && (
                          <OpenToOffersCard side="orange" />
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

                    <div className="min-h-[300px] rounded-[32px] border border-zinc-800 bg-black/90 p-6">
                      <h3 className="mb-6 text-2xl font-bold text-blue-400">
                        Trader Wants
                      </h3>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {wanting.map((item) => {
                          const details = (cs2Items || []).find(
                            (cs2) => cs2.item_name === item.item_name
                          );

                          return (
                            <TradeItemCard
                              key={item.id}
                              item={item}
                              imageUrl={item.image_url || details?.image_url}
                            />
                          );
                        })}

                        {listing.want_item_overpay && (
                          <ItemOverpayCard side="blue" />
                        )}

                        {listing.want_open_to_offers && (
                          <OpenToOffersCard side="blue" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}