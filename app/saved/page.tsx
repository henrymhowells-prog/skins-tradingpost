import { revalidatePath } from "next/cache";
import AppShell from "../components/AppShell";
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

function PageBackground() {
  return (
    <div className="fixed inset-y-0 left-64 right-0 z-0 overflow-hidden bg-[#121318]">
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

export default async function SavedPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <AppShell>
        <PageBackground />

        <div className="relative z-10">
          <h1 className="text-5xl font-bold">Please sign in with Steam</h1>

          <a
            href="/api/auth/steam/login"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
          >
            Sign in with Steam
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

  return (
    <AppShell>
      <PageBackground />

      <div className="relative z-10">
        <h1 className="text-5xl font-bold">Saved Listings</h1>

        <p className="mt-3 text-zinc-300">
          Trade posts you saved to view later.
        </p>

        <div className="mt-8 grid gap-6">
          {(listings || []).length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-black/80 p-8 text-zinc-500 backdrop-blur">
              You have no saved listings yet.
            </div>
          ) : (
            listings?.map((listing) => {
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
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}