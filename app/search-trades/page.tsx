import { revalidatePath } from "next/cache";
import AppShell from "../components/AppShell";
import PageBackground from "../components/PageBackground";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 50;

async function saveListing(formData: FormData) {
  "use server";

  const listingId = String(formData.get("listing_id") || "");
  const currentUser = await getCurrentUser();

  if (!currentUser || !listingId) return;

  await supabase.from("saved_listings").upsert(
    {
      user_id: currentUser.id,
      listing_id: listingId,
    },
    {
      onConflict: "user_id,listing_id",
    }
  );

  revalidatePath("/search-trades");
  revalidatePath("/saved");
}

async function unsaveListing(formData: FormData) {
  "use server";

  const listingId = String(formData.get("listing_id") || "");
  const currentUser = await getCurrentUser();

  if (!currentUser || !listingId) return;

  await supabase
    .from("saved_listings")
    .delete()
    .eq("user_id", currentUser.id)
    .eq("listing_id", listingId);

  revalidatePath("/search-trades");
  revalidatePath("/saved");
}

function getItemCategory(itemName: string) {
  const name = itemName.toLowerCase();

  if (
    name.includes("knife") ||
    name.includes("karambit") ||
    name.includes("bayonet") ||
    name.includes("butterfly") ||
    name.includes("falchion") ||
    name.includes("flip knife") ||
    name.includes("gut knife") ||
    name.includes("huntsman") ||
    name.includes("navaja") ||
    name.includes("nomad") ||
    name.includes("paracord") ||
    name.includes("shadow daggers") ||
    name.includes("skeleton") ||
    name.includes("stiletto") ||
    name.includes("survival") ||
    name.includes("talon") ||
    name.includes("ursus")
  ) {
    return "knife";
  }

  if (
    name.includes("gloves") ||
    name.includes("hand wraps") ||
    name.includes("driver gloves") ||
    name.includes("sport gloves") ||
    name.includes("specialist gloves") ||
    name.includes("moto gloves") ||
    name.includes("hydra gloves")
  ) {
    return "glove";
  }

  if (name.includes("case")) return "case";

  if (
    name.includes("sticker") ||
    name.includes("music kit") ||
    name.includes("agent") ||
    name.includes("patch") ||
    name.includes("graffiti") ||
    name.includes("capsule") ||
    name.includes("pin") ||
    name.includes("keychain")
  ) {
    return "misc";
  }

  return "skin";
}

function timeAgo(dateValue: string) {
  const date = new Date(dateValue);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
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
      <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-zinc-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.item_name}
            className="max-h-28 object-contain"
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
      <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-zinc-800 text-3xl">
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

function getSideItems({
  searchSide,
  giving,
  wanting,
}: {
  searchSide: string;
  giving: any[];
  wanting: any[];
}) {
  if (searchSide === "give") return giving;
  if (searchSide === "want") return wanting;
  return [...giving, ...wanting];
}

function groupByListingId(items: any[]) {
  const map = new Map<string, any[]>();

  for (const item of items || []) {
    const current = map.get(item.listing_id) || [];
    current.push(item);
    map.set(item.listing_id, current);
  }

  return map;
}

function mapByKey(items: any[], key: string) {
  const map = new Map<string, any>();

  for (const item of items || []) {
    if (item?.[key]) {
      map.set(String(item[key]), item);
    }
  }

  return map;
}

export default async function SearchTradesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    sort?: string;
    category?: string;
    rarity?: string;
    side?: string;
    stattrak?: string;
    souvenir?: string;
    page?: string;
  }>;
}) {
  const params = searchParams ? await searchParams : {};

  const query = String(params.q || "").trim().toLowerCase();
  const sort = params.sort || "newest";
  const category = params.category || "all";
  const rarity = params.rarity || "all";
  const searchSide = params.side || "both";
  const stattrak = params.stattrak || "all";
  const souvenir = params.souvenir || "all";
  const page = Math.max(1, Number(params.page || 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const nowIso = new Date().toISOString();

  const currentUser = await getCurrentUser();

  const { data: savedListings } = currentUser
    ? await supabase
        .from("saved_listings")
        .select("listing_id")
        .eq("user_id", currentUser.id)
    : { data: [] };

  let matchingListingIds: string[] | null = null;

  if (query) {
    const [offerMatches, wantedMatches] = await Promise.all([
      supabase
        .from("listing_offer_items")
        .select("listing_id")
        .ilike("item_name", `%${query}%`)
        .limit(500),

      supabase
        .from("listing_wanted_items")
        .select("listing_id")
        .ilike("item_name", `%${query}%`)
        .limit(500),
    ]);

    matchingListingIds = Array.from(
      new Set([
        ...((offerMatches.data || []).map((item) => item.listing_id) || []),
        ...((wantedMatches.data || []).map((item) => item.listing_id) || []),
      ])
    );
  }

  let listingsQuery = supabase
    .from("listings")
    .select("*")
    .gt("expires_at", nowIso)
    .order("refreshed_at", { ascending: sort === "oldest" });

  if (matchingListingIds) {
    if (matchingListingIds.length === 0) {
      listingsQuery = listingsQuery.in("id", ["00000000-0000-0000-0000-000000000000"]);
    } else {
      listingsQuery = listingsQuery.in("id", matchingListingIds);
    }
  }

  const { data: listingsRaw } = await listingsQuery.range(from, to);

  const listingIds = (listingsRaw || []).map((listing) => listing.id);
  const userIds = Array.from(
    new Set((listingsRaw || []).map((listing) => listing.user_id).filter(Boolean))
  );

  const [{ data: users }, { data: offerItems }, { data: wantedItems }] =
    listingIds.length > 0
      ? await Promise.all([
          userIds.length > 0
            ? supabase.from("users").select("*").in("id", userIds)
            : Promise.resolve({ data: [] } as any),

          supabase
            .from("listing_offer_items")
            .select("*")
            .in("listing_id", listingIds),

          supabase
            .from("listing_wanted_items")
            .select("*")
            .in("listing_id", listingIds),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }];

  const itemNames = Array.from(
    new Set(
      [...(offerItems || []), ...(wantedItems || [])]
        .map((item) => item.item_name)
        .filter(Boolean)
    )
  );

  const [{ data: cs2Items }, { data: inventoryItems }] =
    itemNames.length > 0
      ? await Promise.all([
          supabase
            .from("cs2_items")
            .select("item_name, image_url, weapon_type, rarity")
            .in("item_name", itemNames),

          supabase
            .from("inventory_items")
            .select("id, item_name, image_url, inspect_link")
            .in("item_name", itemNames),
        ])
      : [{ data: [] }, { data: [] }];

  const offerMap = groupByListingId(offerItems || []);
  const wantedMap = groupByListingId(wantedItems || []);
  const userMap = mapByKey(users || [], "id");
  const cs2ItemMap = mapByKey(cs2Items || [], "item_name");
  const inventoryItemMap = mapByKey(inventoryItems || [], "item_name");

  const listings =
    sort === "highest-rated"
      ? [...(listingsRaw || [])].sort((a, b) => {
          const traderA = userMap.get(a.user_id);
          const traderB = userMap.get(b.user_id);

          return (
            Number(traderB?.average_rating || 0) -
            Number(traderA?.average_rating || 0)
          );
        })
      : listingsRaw || [];

  const filteredListings = listings.filter((listing) => {
    const giving = offerMap.get(listing.id) || [];
    const wanting = wantedMap.get(listing.id) || [];

    const sideItems = getSideItems({
      searchSide,
      giving,
      wanting,
    });

    if (query) {
      const matchesQuery = sideItems.some((item) =>
        item.item_name.toLowerCase().includes(query)
      );

      if (!matchesQuery) return false;
    }

    if (category !== "all") {
      const matchesCategory = sideItems.some(
        (item) => getItemCategory(item.item_name) === category
      );

      if (!matchesCategory) return false;
    }

    if (rarity !== "all") {
      const matchesRarity = sideItems.some((item) => {
        const details = cs2ItemMap.get(item.item_name);

        return String(item.rarity || details?.rarity || "")
          .toLowerCase()
          .includes(rarity.toLowerCase());
      });

      if (!matchesRarity) return false;
    }

    if (stattrak !== "all") {
      const matchesStatTrak = sideItems.some((item) => {
        const name = item.item_name.toLowerCase();
        const isStatTrak = name.includes("stattrak");

        return stattrak === "yes" ? isStatTrak : !isStatTrak;
      });

      if (!matchesStatTrak) return false;
    }

    if (souvenir !== "all") {
      const matchesSouvenir = sideItems.some((item) => {
        const name = item.item_name.toLowerCase();
        const isSouvenir = name.includes("souvenir");

        return souvenir === "yes" ? isSouvenir : !isSouvenir;
      });

      if (!matchesSouvenir) return false;
    }

    return true;
  });

  function pageHref(nextPage: number) {
    const search = new URLSearchParams();

    if (query) search.set("q", query);
    if (sort !== "newest") search.set("sort", sort);
    if (category !== "all") search.set("category", category);
    if (rarity !== "all") search.set("rarity", rarity);
    if (searchSide !== "both") search.set("side", searchSide);
    if (stattrak !== "all") search.set("stattrak", stattrak);
    if (souvenir !== "all") search.set("souvenir", souvenir);
    if (nextPage > 1) search.set("page", String(nextPage));

    const queryString = search.toString();
    return queryString ? `/search-trades?${queryString}` : "/search-trades";
  }

  return (
    <AppShell>
      <PageBackground leftOffset={256} />

      <div className="relative z-10">
        <h1 className="text-5xl font-bold">Search Trades</h1>

        <p className="mt-3 text-zinc-300">
          Search active trade listings and find traders offering the items you
          want.
        </p>

        <form className="mt-8 rounded-3xl border border-zinc-800 bg-black/80 p-6 backdrop-blur">
          <div className="grid gap-4 lg:grid-cols-7">
            <div>
              <label className="text-sm text-zinc-400">Search Item</label>
              <input
                name="q"
                defaultValue={query}
                placeholder="AK-47, Karambit, Case..."
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">Search In</label>
              <select
                name="side"
                defaultValue={searchSide}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="both">Give & Want</option>
                <option value="give">They Give</option>
                <option value="want">They Want</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-400">Sort By</label>
              <select
                name="sort"
                defaultValue={sort}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest-rated">Highest Rated Trader</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-400">Item Group</label>
              <select
                name="category"
                defaultValue={category}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="all">All Items</option>
                <option value="skin">Guns</option>
                <option value="knife">Knives</option>
                <option value="glove">Gloves</option>
                <option value="case">Cases</option>
                <option value="misc">Misc</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-400">Rarity</label>
              <select
                name="rarity"
                defaultValue={rarity}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="all">All Rarities</option>
                <option value="consumer">Consumer</option>
                <option value="industrial">Industrial</option>
                <option value="mil-spec">Mil-Spec</option>
                <option value="restricted">Restricted</option>
                <option value="classified">Classified</option>
                <option value="covert">Covert</option>
                <option value="contraband">Contraband</option>
                <option value="extraordinary">Extraordinary</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-400">StatTrak™</label>
              <select
                name="stattrak"
                defaultValue={stattrak}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="all">Any</option>
                <option value="yes">StatTrak™ Only</option>
                <option value="no">No StatTrak™</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-400">Souvenir</label>
              <select
                name="souvenir"
                defaultValue={souvenir}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="all">Any</option>
                <option value="yes">Souvenir Only</option>
                <option value="no">No Souvenir</option>
              </select>
            </div>
          </div>

          <button className="mt-4 rounded-xl bg-orange-500 px-8 py-3 font-semibold text-black hover:bg-orange-400">
            Apply Filters
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-400">
            Showing {filteredListings.length} listing
            {filteredListings.length === 1 ? "" : "s"} on page {page}.
          </p>

          <div className="flex gap-3">
            {page > 1 && (
              <a
                href={pageHref(page - 1)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold hover:bg-zinc-800"
              >
                Previous
              </a>
            )}

            {(listingsRaw || []).length === PAGE_SIZE && (
              <a
                href={pageHref(page + 1)}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400"
              >
                Next Page
              </a>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8">
          {filteredListings.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-black/80 p-8 text-zinc-500 backdrop-blur">
              No trades found. Try a different search.
            </div>
          ) : (
            filteredListings.map((listing) => {
              const giving = offerMap.get(listing.id) || [];
              const wanting = wantedMap.get(listing.id) || [];

              const isSaved = (savedListings || []).some(
                (saved) => saved.listing_id === listing.id
              );

              const postedDate = listing.refreshed_at || listing.created_at;

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

                      <form action={isSaved ? unsaveListing : saveListing}>
                        <input
                          type="hidden"
                          name="listing_id"
                          value={listing.id}
                        />

                        <button className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800">
                          {isSaved ? "🔖 Saved" : "🔖 Save"}
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1fr_220px_1fr]">
                    <div className="min-h-[340px] rounded-[32px] border border-zinc-800 bg-black/90 p-6">
                      <h3 className="mb-6 text-2xl font-bold text-orange-400">
                        They Give
                      </h3>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {giving.map((item) => {
                          const cs2Details = cs2ItemMap.get(item.item_name);
                          const inventoryDetails = inventoryItemMap.get(
                            item.item_name
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

                    <div className="min-h-[340px] rounded-[32px] border border-zinc-800 bg-black/90 p-6">
                      <h3 className="mb-6 text-2xl font-bold text-blue-400">
                        They Want
                      </h3>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {wanting.map((item) => {
                          const details = cs2ItemMap.get(item.item_name);

                          return (
                            <TradeItemCard
                              key={item.id}
                              item={item}
                              imageUrl={item.image_url || details?.image_url || null}
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
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}