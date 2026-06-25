import { revalidatePath } from "next/cache";
import AppShell from "../components/AppShell";
import InventorySearchGrid from "../components/InventorySearchGrid";
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

function PageBackground() {
  return (
    <div className="fixed inset-y-0 left-64 right-0 -z-0 overflow-hidden bg-[#121318]">
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

export default async function InventoryPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <AppShell>
        <PageBackground />

        <div className="relative z-10">
          <h1 className="text-5xl font-bold">Please sign in</h1>

          <p className="mt-3 text-zinc-300">
            Sign in with your email account to view your inventory page.
          </p>

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

  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("id, item_name, image_url, inspect_link, tradable")
    .eq("user_id", currentUser.id)
    .order("item_name");

  return (
    <AppShell>
      <PageBackground />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold">My Inventory</h1>

            <p className="mt-3 text-zinc-300">
              View your saved items and optionally link Steam to sync your real
              CS2 inventory.
            </p>

            {currentUser.last_inventory_sync && (
              <p className="mt-2 text-sm text-zinc-500">
                Last synced:{" "}
                {new Date(currentUser.last_inventory_sync).toLocaleString()}
              </p>
            )}
          </div>

          {currentUser.steam_id ? (
            <form action={syncInventory}>
              <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400">
                Sync Inventory
              </button>

              <p className="mt-2 text-right text-sm text-zinc-400">
                Updates to your current Steam inventory.
              </p>
            </form>
          ) : (
            <div className="max-w-sm rounded-2xl border border-orange-500/40 bg-black/80 p-5 text-right">
              <p className="font-bold text-orange-400">
                Steam not linked yet
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                Link Steam when you want to sync your CS2 inventory.
              </p>

              <a
                href="/api/auth/steam/login"
                className="mt-4 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
              >
                Link Steam Account
              </a>
            </div>
          )}
        </div>

        {currentUser.steam_id ? (
          <div className="mt-8">
            <InventorySearchGrid items={inventoryItems || []} />
          </div>
        ) : (
          <div className="mt-8 rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
            <h2 className="text-3xl font-black">Inventory sync is optional</h2>

            <p className="mt-3 max-w-3xl text-zinc-300">
              You can still browse trades, message users, save listings, create
              listings, and use your account without linking Steam. Steam is only
              needed if you want your real CS2 inventory to appear here.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/search-trades"
                className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
              >
                Search Trades
              </a>

              <a
                href="/listings"
                className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
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