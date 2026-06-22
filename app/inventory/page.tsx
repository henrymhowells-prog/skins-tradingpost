import AppShell from "../components/AppShell";
import InventorySearchGrid from "../components/InventorySearchGrid";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

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
    <h1 className="text-5xl font-bold">My Inventory</h1>

    <p className="mt-3 text-zinc-300">
      Real CS2 items imported from your Steam inventory.
    </p>

    <div className="mt-8">
      <InventorySearchGrid items={inventoryItems || []} />
    </div>
  </div>
</AppShell>
  );
}