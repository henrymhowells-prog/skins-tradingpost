import { revalidatePath } from "next/cache";
import AppShell from "../../components/AppShell";
import { supabase } from "../../lib/supabase";
import { getCurrentUser } from "../../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function deleteListing(formData: FormData) {
  "use server";

  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Not allowed.");
  }

  const listingId = String(formData.get("listing_id") || "");

  if (!listingId) return;

  await supabase
    .from("listing_offer_items")
    .delete()
    .eq("listing_id", listingId);

  await supabase
    .from("listing_wanted_items")
    .delete()
    .eq("listing_id", listingId);

  await supabase
    .from("listing_views")
    .delete()
    .eq("listing_id", listingId);

  await supabase
    .from("saved_listings")
    .delete()
    .eq("listing_id", listingId);

  await supabase
    .from("listings")
    .delete()
    .eq("id", listingId);

  revalidatePath("/admin/listings");
  revalidatePath("/search trades");
  revalidatePath("/listings");
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <AppShell>
        <h1 className="text-4xl font-bold">Not Allowed</h1>
      </AppShell>
    );
  }

  const params = searchParams ? await searchParams : {};
  const query = String(params.q || "").trim().toLowerCase();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .order("refreshed_at", { ascending: false });

  const { data: users } = await supabase
    .from("users")
    .select("*");

  const filteredListings = (listings || []).filter((listing) => {
    if (!query) return true;

    const owner = (users || []).find((user) => user.id === listing.user_id);

    return (
      String(listing.title || "").toLowerCase().includes(query) ||
      String(listing.id || "").toLowerCase().includes(query) ||
      String(owner?.steam_name || "").toLowerCase().includes(query) ||
      String(owner?.username || "").toLowerCase().includes(query) ||
      String(owner?.steam_id || "").toLowerCase().includes(query)
    );
  });

  return (
    <AppShell>
      <h1 className="text-4xl font-bold">Admin Listings</h1>

      <p className="mt-2 text-zinc-400">
        Search, review, and remove trade listings.
      </p>

      <form className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <label className="text-sm text-zinc-400">Search Listings</label>

        <div className="mt-2 flex gap-3">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by title, listing ID, owner, or Steam ID..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
          />

          <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400">
            Search
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm text-zinc-500">
        Showing {filteredListings.length} listing
        {filteredListings.length === 1 ? "" : "s"}.
      </p>

      <div className="mt-8 grid gap-5">
        {filteredListings.map((listing) => {
          const owner = (users || []).find(
            (user) => user.id === listing.user_id
          );

          return (
            <div
              key={listing.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{listing.title}</h2>

                  <div className="mt-3 space-y-1 text-sm text-zinc-500">
                    <p>Status: {listing.status || "unknown"}</p>
                    <p>Listing ID: {listing.id}</p>
                    <p>
                      Owner:{" "}
                      {owner?.steam_name ||
                        owner?.username ||
                        listing.user_id ||
                        "Unknown"}
                    </p>
                    <p>Owner Steam ID: {owner?.steam_id || "Unknown"}</p>
                    <p>
                      Posted:{" "}
                      {listing.refreshed_at
                        ? new Date(listing.refreshed_at).toLocaleString()
                        : "Unknown"}
                    </p>
                    <p>
                      Expires:{" "}
                      {listing.expires_at
                        ? new Date(listing.expires_at).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 xl:justify-end">
                  <a
                    href={`/trade/${listing.id}`}
                    className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
                  >
                    View Trade
                  </a>

                  {owner && (
                    <a
                      href={`/user/${owner.id}`}
                      className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
                    >
                      View Owner
                    </a>
                  )}

                  <form action={deleteListing}>
                    <input
                      type="hidden"
                      name="listing_id"
                      value={listing.id}
                    />

                    <button className="rounded-xl border border-red-500 px-5 py-3 font-semibold text-red-400 hover:bg-red-500 hover:text-white">
                      Delete Listing
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}