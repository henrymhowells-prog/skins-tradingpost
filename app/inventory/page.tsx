import { revalidatePath } from "next/cache";
import AppShell from "../components/AppShell";
import InventorySearchGrid from "../components/InventorySearchGrid";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function syncInventory() {
  "use server";

  const currentUser = await getCurrentUser();

  if (!currentUser?.steam_id) {
    throw new Error("You must be signed in with Steam.");
  }

  const url = `https://steamcommunity.com/inventory/${currentUser.steam_id}/730/2?l=english`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Could not fetch Steam inventory. Your inventory may be private.");
  }

  const data = await response.json();

  const descriptions = data.descriptions || [];
  const assets = data.assets || [];

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

  await supabase
    .from("inventory_items")
    .delete()
    .eq("user_id", currentUser.id);

  if (items.length > 0) {
    const { error } = await supabase.from("inventory_items").insert(items);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/inventory");
}

export default async function InventoryPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <AppShell>
        <h1 className="text-4xl font-bold">Please sign in with Steam</h1>
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

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold">My Inventory</h1>

            <p className="mt-3 text-zinc-300">
              Real CS2 items imported from your Steam inventory.
            </p>
          </div>

          <form action={syncInventory}>
            <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400">
              Sync Inventory
            </button>
          </form>
        </div>

        <div className="mt-8">
          <InventorySearchGrid items={inventoryItems || []} />
        </div>
      </div>
    </AppShell>
  );
}