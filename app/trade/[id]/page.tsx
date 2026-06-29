import AppShell from "../../components/AppShell";
import PageBackground from "../../components/PageBackground";
import { supabase } from "../../lib/supabase";
import { getCurrentUser } from "../../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;


function ItemOverpayCard({ side }: { side: "orange" | "blue" }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        side === "orange"
          ? "border-orange-500 bg-orange-500/10"
          : "border-blue-500 bg-blue-500/10"
      }`}
    >
      <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-zinc-800 text-4xl">
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

function TradeItemCard({
  item,
  imageUrl,
}: {
  item: any;
  imageUrl?: string | null;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4">
      <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-zinc-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.item_name}
            className="max-h-full object-contain"
          />
        ) : (
          <span className="text-sm text-zinc-500">No Image</span>
        )}
      </div>

      <p className="line-clamp-2 font-bold">{item.item_name}</p>

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

export default async function TradeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const currentUser = await getCurrentUser();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (!listing) {
    return (
      <AppShell>
        <PageBackground leftOffset={256} />

        <div className="relative z-10 rounded-3xl border border-zinc-800 bg-black/80 p-8 backdrop-blur">
          <h1 className="text-5xl font-bold">Listing Not Found</h1>

          <a
            href="/search-trades"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
          >
            Back to Search Trades
          </a>
        </div>
      </AppShell>
    );
  }

  if (currentUser) {
    await supabase.from("listing_views").upsert(
      {
        user_id: currentUser.id,
        listing_id: listing.id,
      },
      {
        onConflict: "user_id,listing_id",
      }
    );
  }

  const { count: viewCount } = await supabase
    .from("listing_views")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", listing.id);

  const { data: trader } = await supabase
    .from("users")
    .select("*")
    .eq("id", listing.user_id)
    .single();

  const { data: offerItems } = await supabase
    .from("listing_offer_items")
    .select("*")
    .eq("listing_id", id);

  const { data: wantedItems } = await supabase
    .from("listing_wanted_items")
    .select("*")
    .eq("listing_id", id);

  const offerInventoryIds = (offerItems || [])
    .map((item) => item.inventory_item_id)
    .filter(Boolean);

  const { data: inventoryItems } =
    offerInventoryIds.length > 0
      ? await supabase
          .from("inventory_items")
          .select("*")
          .in("id", offerInventoryIds)
      : { data: [] };

  const { data: cs2Items } = await supabase
    .from("cs2_items")
    .select("item_name, image_url, weapon_type, rarity")
    .range(0, 25000);

  return (
    <AppShell>
      <PageBackground leftOffset={256} />

      <div className="relative z-10">
        <div className="rounded-3xl border border-zinc-800 bg-black/80 p-8 backdrop-blur">
          <p className="text-sm font-bold uppercase tracking-wide text-orange-400">
            Trade Listing
          </p>

          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-black">{listing.title}</h1>

              <p className="mt-3 text-sm text-zinc-400">
                👁 {viewCount || 0} view{viewCount === 1 ? "" : "s"} •{" "}
                {listing.status || "active"}
              </p>
            </div>

            <a
              href="/search-trades"
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
            >
              Back to Search Trades
            </a>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-zinc-800 bg-black/80 p-6 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <a href={trader?.id ? `/user/${trader.id}` : "#"}>
                <img
                  src={
                    trader?.avatar_url ||
                    trader?.steam_avatar ||
                    "https://avatars.githubusercontent.com/u/9919?s=200&v=4"
                  }
                  alt="Trader Avatar"
                  className="h-20 w-20 rounded-full border-4 border-orange-500 object-cover"
                />
              </a>

              <div>
                <p className="text-sm font-semibold text-zinc-500">
                  Posted by
                </p>

                <a href={trader?.id ? `/user/${trader.id}` : "#"}>
                  <h2 className="text-2xl font-black hover:text-orange-400">
                    {trader?.steam_name || trader?.username || "Unknown Trader"}
                  </h2>
                </a>

                <p className="mt-1 text-zinc-400">
                  Trust Score: {trader?.trust_score ?? 5}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`/messages?user=${trader?.id}`}
                className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
              >
                Message Trader
              </a>

              {trader?.profile_url && (
                <a
                  href={trader.profile_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
                >
                  Steam Profile
                </a>
              )}

              <a
                href={`/report?user=${trader?.id}&listing=${listing.id}`}
                className="rounded-xl border border-red-500 px-5 py-3 font-semibold text-red-400 hover:bg-red-500 hover:text-white"
              >
                Report Listing
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_220px_1fr]">
          <div className="min-h-[360px] rounded-[32px] border border-zinc-800 bg-black/90 p-6 backdrop-blur">
            <h2 className="mb-6 text-3xl font-black text-orange-400">
              Trader Gives
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(offerItems || []).map((item) => {
  const cs2Details = (cs2Items || []).find(
    (cs2) => cs2.item_name === item.item_name
  );

  const inventoryDetails = (inventoryItems || []).find(
    (inv) =>
      inv.id === item.inventory_item_id ||
      inv.item_name === item.item_name
  );

  return (
    <TradeItemCard
      key={item.id}
      item={item}
      imageUrl={
        item.image_url ||
        cs2Details?.image_url ||
        inventoryDetails?.image_url ||
        null
      }
    />
  );
})}

              {listing.give_item_overpay && <ItemOverpayCard side="orange" />}
              {listing.give_open_to_offers && <OpenToOffersCard side="orange" />}

              {(offerItems || []).length === 0 && !listing.give_item_overpay && (
                <p className="text-zinc-500">No offered items listed.</p>
              )}
            </div>
          </div>

          <div className="hidden min-h-[360px] flex-col items-center justify-center gap-8 lg:flex">
            <div className="flex items-center gap-3 text-orange-400">
              <div className="h-1 w-24 bg-orange-500" />
              <span className="text-6xl leading-none">→</span>
            </div>

            <div className="flex items-center gap-3 text-blue-400">
              <span className="text-6xl leading-none">←</span>
              <div className="h-1 w-24 bg-blue-500" />
            </div>
          </div>

          <div className="min-h-[360px] rounded-[32px] border border-zinc-800 bg-black/90 p-6 backdrop-blur">
            <h2 className="mb-6 text-3xl font-black text-blue-400">
              Trader Wants
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(wantedItems || []).map((item) => {
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

              {listing.want_item_overpay && <ItemOverpayCard side="blue" />}
              {listing.want_open_to_offers && <OpenToOffersCard side="blue" />}

              {(wantedItems || []).length === 0 && !listing.want_item_overpay && (
                <p className="text-zinc-500">No wanted items listed.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}