import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
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

  const nowIso = new Date().toISOString();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .gt("expires_at", nowIso)
    .order("refreshed_at", { ascending: false });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("reviewed_user_id", user.id)
    .order("created_at", { ascending: false });

  const averageRating =
    (reviews || []).length > 0
      ? (reviews || []).reduce(
          (total, review) => total + Number(review.rating || 0),
          0
        ) / (reviews || []).length
      : Number(user.average_rating || 0);

  return (
    <AppShell>
      <PageBackground />

      <div className="relative z-10">
        <div className="rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <img
                src={
                  user.avatar_url ||
                  user.steam_avatar ||
                  "https://avatars.githubusercontent.com/u/9919?s=200&v=4"
                }
                alt="Profile"
                className="h-32 w-32 rounded-full border-4 border-orange-500 object-cover"
              />

              <div>
                <p className="text-sm font-semibold text-orange-400">
                  Trader Profile
                </p>

                <h1 className="mt-2 text-5xl font-black">
                  {user.steam_name || user.username || "Unknown User"}
                </h1>

                <p className="mt-3 max-w-2xl text-zinc-300">
                  {user.bio || "No bio added yet."}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {user.steam_profile_url && (
                    <a
                      href={user.steam_profile_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
                    >
                      Steam Profile
                    </a>
                  )}

                  {user.trade_url && (
                    <a
                      href={user.trade_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
                    >
                      Trade URL
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-blue-900/90 p-6 text-center shadow-xl">
              <p className="text-sm text-white/60">Trust Score</p>
              <p className="mt-2 text-5xl font-black">
                {Number(user.trust_score || 5).toFixed(1)}
              </p>
              <p className="mt-1 text-sm text-white/60">out of 10</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <ProfileStat label="Average Rating" value={`${averageRating.toFixed(1)} / 5`} />
            <ProfileStat label="Reviews" value={reviews?.length || 0} />
            <ProfileStat label="Active Listings" value={listings?.length || 0} />
            <ProfileStat label="Trade Count" value={user.trade_count || 0} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <Panel title="Active Listings">
            {(listings || []).length === 0 ? (
              <EmptyState text="No active listings." />
            ) : (
              <div className="grid gap-3">
                {listings?.map((listing) => (
                  <a
                    key={listing.id}
                    href={`/trade/${listing.id}`}
                    className="block rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 hover:border-orange-500"
                  >
                    <p className="font-bold">{listing.title}</p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Posted{" "}
                      {listing.refreshed_at
                        ? timeAgo(listing.refreshed_at)
                        : "recently"}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Latest Reviews">
            {(reviews || []).length === 0 ? (
              <EmptyState text="No reviews yet." />
            ) : (
              <div className="grid gap-3">
                {reviews?.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4"
                  >
                    <div className="mb-2 text-orange-400">
                      {"★".repeat(Number(review.rating || 0))}
                      <span className="text-zinc-700">
                        {"★".repeat(5 - Number(review.rating || 0))}
                      </span>
                    </div>

                    <p className="text-zinc-300">
                      {review.comment || "No comment left."}
                    </p>

                    {review.created_at && (
                      <p className="mt-2 text-xs text-zinc-500">
                        {new Date(review.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function ProfileStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[330px] rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
      <h2 className="text-3xl font-black italic tracking-wide text-zinc-200">
        {title}
      </h2>

      <div className="mt-6">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-5 text-zinc-500">
      {text}
    </div>
  );
}