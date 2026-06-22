import AppShell from "../../components/AppShell";
import { supabase } from "../../lib/supabase";
import { getCurrentUser } from "../../lib/currentUser";

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
        <h1 className="text-4xl font-bold">Listing Not Found</h1>
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

  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("*");

  const { data: cs2Items } = await supabase
    .from("cs2_items")
    .select("item_name, image_url, weapon_type, rarity")
    .range(0, 25000);

  function ItemOverpayCard({ side }: { side: "orange" | "blue" }) {
    return (
      <div
        className={`rounded-xl border p-4 ${
          side === "orange"
            ? "border-orange-500 bg-orange-500/10"
            : "border-blue-500 bg-blue-500/10"
        }`}
      >
        <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-zinc-800 text-4xl">
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

  return (
    <AppShell>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold">{listing.title}</h1>

          <p className="mt-2 text-sm text-zinc-500">
            👁 {viewCount || 0} view{viewCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-4">
          <a href={trader?.id ? `/user/${trader.id}` : "#"}>
            <img
              src={
                trader?.avatar_url ||
                "https://avatars.githubusercontent.com/u/9919?s=200&v=4"
              }
              alt="Trader Avatar"
              className="h-16 w-16 rounded-full"
            />
          </a>

          <div>
            <a href={trader?.id ? `/user/${trader.id}` : "#"}>
              <h2 className="text-xl font-bold hover:text-orange-400">
                {trader?.steam_name || trader?.username || "Unknown Trader"}
              </h2>
            </a>

            <p className="text-zinc-400">
              Trust Score: {trader?.trust_score ?? 5}
            </p>
          </div>

          <div className="ml-auto flex gap-3">
            <a
              href={`/messages?user=${trader?.id}`}
              className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
            >
              Message Trader
            </a>

            <a
              href={`/report?user=${trader?.id}&listing=${listing.id}`}
              className="rounded-xl border border-red-500 px-5 py-3 font-semibold text-red-400 hover:bg-red-500 hover:text-white"
            >
              Report Listing
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
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-start gap-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-2xl font-bold text-orange-400">
            They Give
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {(offerItems || []).map((item) => {
              const details = (inventoryItems || []).find(
                (inv) =>
                  inv.id === item.inventory_item_id ||
                  inv.item_name === item.item_name
              );

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-zinc-800">
                    {details?.image_url ? (
                      <img
                        src={details.image_url}
                        alt={item.item_name}
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-sm text-zinc-500">No Image</span>
                    )}
                  </div>

                  <p className="font-bold">{item.item_name}</p>
                </div>
              );
            })}

            {listing.give_item_overpay && <ItemOverpayCard side="orange" />}
          </div>
        </div>

        <div className="text-6xl text-orange-500">⇄</div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-2xl font-bold text-blue-400">
            They Want
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {(wantedItems || []).map((item) => {
              const details = (cs2Items || []).find(
                (cs2) => cs2.item_name === item.item_name
              );

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-zinc-800">
                    {details?.image_url ? (
                      <img
                        src={details.image_url}
                        alt={item.item_name}
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-sm text-zinc-500">No Image</span>
                    )}
                  </div>

                  <p className="font-bold">{item.item_name}</p>

                  {(item.float_min || item.float_max || item.pattern_seed) && (
                    <div className="mt-2 text-xs text-zinc-400">
                      {item.float_min && <p>Min Float: {item.float_min}</p>}
                      {item.float_max && <p>Max Float: {item.float_max}</p>}
                      {item.pattern_seed && <p>Pattern: {item.pattern_seed}</p>}
                    </div>
                  )}
                </div>
              );
            })}

            {listing.want_item_overpay && <ItemOverpayCard side="blue" />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}