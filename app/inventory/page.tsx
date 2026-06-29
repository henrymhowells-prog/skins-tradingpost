import { revalidatePath } from "next/cache";
import AppShell from "../components/AppShell";
import InventorySearchGrid from "../components/InventorySearchGrid";
import PageBackground from "../components/PageBackground";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchFullSteamInventory(steamId: string) {
  let allAssets: any[] = [];
  let allDescriptions: any[] = [];
  let startAssetId = "";
  let hasMore = true;

  while (hasMore) {
    const steamUrl = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000${
      startAssetId ? `&start_assetid=${startAssetId}` : ""
    }`;

    const response = await fetch(steamUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
      next: {
        revalidate: 0,
      },
    });

    if (!response.ok) {
      break;
    }

    const data = await response.json();

    allAssets = [...allAssets, ...(data.assets || [])];
    allDescriptions = [...allDescriptions, ...(data.descriptions || [])];

    hasMore = Boolean(data.more_items && data.last_assetid);
    startAssetId = data.last_assetid || "";
  }

  return {
    assets: allAssets,
    descriptions: allDescriptions,
  };
}

async function syncInventory() {
  "use server";

  const currentUser = await getCurrentUser();

  if (!currentUser?.steam_id) {
    return;
  }

  const { assets, descriptions } = await fetchFullSteamInventory(
    currentUser.steam_id
  );

  const items = assets.map((asset: any) => {
    const description = descriptions.find(
      (desc: any) =>
        desc.classid === asset.classid &&
        desc.instanceid === asset.instanceid
    );

    const inspectAction = description?.actions?.[0];
    const inspectLink = inspectAction?.link || null;

    return {
      user_id: currentUser.id,
      item_name: description?.market_hash_name || "Unknown Item",
      image_url: description?.icon_url
        ? `https://community.cloudflare.steamstatic.com/economy/image/${description.icon_url}`
        : null,
      steam_asset_id: asset.assetid,
      inspect_link: inspectLink,
      tradable: description?.tradable === 1,
    };
  });

  await supabase.from("inventory_items").delete().eq("user_id", currentUser.id);

  if (items.length > 0) {
    const { error } = await supabase.from("inventory_items").insert(items);

    if (error) {
      console.error(error);
      revalidatePath("/inventory");
      return;
    }
  }

  await supabase
    .from("users")
    .update({
      last_inventory_sync: new Date().toISOString(),
    })
    .eq("id", currentUser.id);

  revalidatePath("/inventory");
}

export default async function InventoryPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <AppShell>
        <PageBackground leftOffset={256} />

        <div className="relative z-10 rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
          <h1 className="text-5xl font-black">Please sign in</h1>

          <p className="mt-3 text-zinc-300">
            Sign in with your email account to view your inventory page.
          </p>

          <a
            href="/login"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-bold text-black hover:bg-orange-400"
          >
            Sign in
          </a>
        </div>
      </AppShell>
    );
  }

  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("id, item_name, image_url, inspect_link, tradable")
    .eq("user_id", currentUser.id)
    .order("item_name");

  const itemCount = inventoryItems?.length || 0;

  return (
    <AppShell>
      <PageBackground leftOffset={256} />

      <div className="relative z-10">
        <div className="mb-6 w-fit">
          <div className="flex items-center gap-3">
            <div className="h-1 w-40 bg-orange-500" />
            <span className="text-4xl leading-none text-orange-500">➜</span>
          </div>

          <div className="my-2 text-3xl font-black italic tracking-tight text-white/80">
            INVENTORY
          </div>

          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none text-blue-700">⬅</span>
            <div className="h-1 w-40 bg-blue-700" />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
            <h1 className="text-5xl font-black">My Inventory</h1>

            <p className="mt-3 max-w-3xl text-zinc-300">
              View your saved items and optionally link Steam to sync your real
              CS2 inventory.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <InventoryStat label="Items" value={itemCount} />
              <InventoryStat
                label="Steam"
                value={currentUser.steam_id ? "Linked" : "Optional"}
              />
              <InventoryStat
                label="Last Sync"
                value={
                  currentUser.last_inventory_sync
                    ? new Date(currentUser.last_inventory_sync).toLocaleDateString()
                    : "Never"
                }
              />
            </div>
          </div>

          <div className="rounded-[32px] border border-zinc-800 bg-black/80 p-6 backdrop-blur">
            {currentUser.steam_id ? (
              <form action={syncInventory}>
                <p className="text-2xl font-black text-orange-400">
                  Steam inventory linked
                </p>

                <p className="mt-3 text-sm text-zinc-400">
                  Sync your latest CS2 inventory from Steam. This may take a
                  moment if you have many items.
                </p>

                {currentUser.last_inventory_sync && (
                  <p className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-400">
                    Last synced:{" "}
                    <span className="text-zinc-200">
                      {new Date(currentUser.last_inventory_sync).toLocaleString()}
                    </span>
                  </p>
                )}

                <button className="mt-6 w-full rounded-full bg-orange-500 px-6 py-4 font-black text-white shadow-lg hover:bg-orange-400">
                  Sync Inventory
                </button>
              </form>
            ) : (
              <div>
                <p className="text-2xl font-black text-orange-400">
                  Steam not linked yet
                </p>

                <p className="mt-3 text-sm text-zinc-400">
                  Link Steam when you want to sync your real CS2 inventory.
                  Steam linking is optional.
                </p>

                <a
                  href="/api/auth/steam/login"
                  className="mt-6 block rounded-full bg-orange-500 px-6 py-4 text-center font-black text-white shadow-lg hover:bg-orange-400"
                >
                  Link Steam Account
                </a>
              </div>
            )}
          </div>
        </div>

        {currentUser.steam_id ? (
          <div className="mt-8 rounded-[32px] border border-zinc-800 bg-black/80 p-6 backdrop-blur">
            <InventorySearchGrid items={inventoryItems || []} />
          </div>
        ) : (
          <div className="mt-8 rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
            <h2 className="text-3xl font-black">Inventory sync is optional</h2>

            <p className="mt-3 max-w-3xl text-zinc-300">
              You can still browse trades, message users, save listings, create
              listings, and use your account without linking Steam. Steam is
              only needed if you want your real CS2 inventory to appear here.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/search-trades"
                className="rounded-full bg-orange-500 px-6 py-3 font-black text-white hover:bg-orange-400"
              >
                Search Trades
              </a>

              <a
                href="/listings"
                className="rounded-full border border-zinc-700 px-6 py-3 font-black hover:bg-zinc-800"
              >
                Create Listing
              </a>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function InventoryStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
    </div>
  );
}