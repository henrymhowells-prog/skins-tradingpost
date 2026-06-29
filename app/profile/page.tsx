import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";
import PageBackground from "../components/PageBackground";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function updateBio(formData: FormData) {
  "use server";

  const currentUser = await getCurrentUser();
  if (!currentUser) return;

  const bio = String(formData.get("bio") || "").trim();
  const wordCount = bio.split(/\s+/).filter(Boolean).length;

  if (wordCount > 100) {
    throw new Error("Bio must be 100 words or fewer.");
  }

  const { error } = await supabase
    .from("users")
    .update({ bio })
    .eq("id", currentUser.id);

  if (error) throw new Error(error.message);

  revalidatePath("/profile");
  redirect("/profile");
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

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ editBio?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const editingBio = params.editBio === "1";

  const user = await getCurrentUser();

  if (!user) {
    return (
      <AppShell>
        <PageBackground leftOffset={256} />
        <div className="relative z-10">
          <h1 className="text-5xl font-bold">Please sign in</h1>

          <a
            href="/login"
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
      : Number(user.average_rating || 5);

  const roundedRating = Math.max(0, Math.min(5, Math.round(averageRating)));

  return (
    <AppShell>
      <PageBackground leftOffset={256} />

      <div className="relative z-10">
        <div className="rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
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

                {!editingBio ? (
                  <div className="mt-4 max-w-2xl">
                    <p className="whitespace-pre-wrap text-zinc-300">
                      {user.bio || "No bio added yet."}
                    </p>

                    <a
                      href="/profile?editBio=1"
                      className="mt-3 inline-block rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold hover:bg-zinc-800"
                    >
                      Edit Bio
                    </a>
                  </div>
                ) : (
                  <form action={updateBio} className="mt-4 max-w-2xl">
                    <label className="text-sm font-semibold text-zinc-400">
                      Edit Bio
                    </label>

                    <textarea
                      name="bio"
                      defaultValue={user.bio || ""}
                      placeholder="Tell other traders a little about yourself..."
                      maxLength={700}
                      className="mt-2 h-28 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                    />

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-zinc-500">
                        Maximum 100 words.
                      </p>

                      <div className="flex gap-2">
                        <a
                          href="/profile"
                          className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
                        >
                          Cancel
                        </a>

                        <button
                          type="submit"
                          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
                        >
                          Save Bio
                        </button>
                      </div>
                    </div>
                  </form>
                )}

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
              <p className="text-sm font-semibold text-white/70">
                Trader Rating
              </p>

              <p className="mt-2 text-5xl font-black">
                {averageRating.toFixed(1)}
              </p>

              <p className="mt-1 text-sm text-white/60">out of 5</p>

              <div className="mt-3 text-xl text-orange-400">
                {"★".repeat(roundedRating)}
                <span className="text-white/20">
                  {"★".repeat(5 - roundedRating)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <ProfileStat
              label="Average Rating"
              value={`${averageRating.toFixed(1)} / 5`}
            />
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
                {reviews?.map((review) => {
                  const reviewRating = Number(review.rating || 0);

                  return (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4"
                    >
                      <div className="mb-2 text-orange-400">
                        {"★".repeat(reviewRating)}
                        <span className="text-zinc-700">
                          {"★".repeat(5 - reviewRating)}
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
                  );
                })}
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