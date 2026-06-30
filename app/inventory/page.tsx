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
    <div className="rounded-[32px] border border-zinc-800 bg-black/80 p-10 backdrop-blur">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
        Coming Soon
      </p>

      <h1 className="mt-3 text-5xl font-black">
        Steam Inventory Linking
      </h1>

      <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-300">
        Linking your CS2 inventory with Steam is coming soon. For now, you can
        still browse trades, create listings, save trades, message traders and
        use the rest of Skins TradingPost normally.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href="/search-trades"
          className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-black hover:bg-orange-400"
        >
          Search Trades
        </a>

        <a
          href="/listings"
          className="rounded-xl border border-zinc-700 px-6 py-3 font-bold hover:bg-zinc-800"
        >
          My Trades
        </a>
      </div>
    </div>
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