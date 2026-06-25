import { revalidatePath } from "next/cache";
import AppShell from "../../components/AppShell";
import { supabase } from "../../lib/supabase";
import { getCurrentUser } from "../../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function leaveReview(formData: FormData) {
  "use server";

  const reviewedUserId = String(formData.get("reviewed_user_id") || "");
  const rating = Number(formData.get("rating") || 5);
  const comment = String(formData.get("comment") || "").trim();

  if (!reviewedUserId || !comment) return;

  const safeRating = Math.max(1, Math.min(5, rating));

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You must be signed in with Steam.");
  }

  if (currentUser.id === reviewedUserId) {
    throw new Error("You cannot review yourself.");
  }

  const { error: reviewError } = await supabase.from("reviews").insert({
    reviewer_id: currentUser.id,
    reviewed_user_id: reviewedUserId,
    rating: safeRating,
    comment,
  });

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  await supabase.from("notifications").insert({
    user_id: reviewedUserId,
    title: "New Review",
    body: `${
      currentUser.steam_name || currentUser.username || "A trader"
    } left you a ${safeRating}-star review.`,
    read: false,
  });

  const { data: userReviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewed_user_id", reviewedUserId);

  const reviewCount = userReviews?.length || 0;

  const averageRating =
    reviewCount > 0
      ? (userReviews || []).reduce(
          (sum, review) => sum + Number(review.rating),
          0
        ) / reviewCount
      : 5;

  await supabase
    .from("users")
    .update({
      review_count: reviewCount,
      average_rating: Number(averageRating.toFixed(1)),
    })
    .eq("id", reviewedUserId);

  revalidatePath(`/user/${reviewedUserId}`);
  revalidatePath("/notifications");
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

export default async function PublicUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!user) {
    return (
      <AppShell>
        <PageBackground />

        <div className="relative z-10 rounded-3xl border border-zinc-800 bg-black/80 p-8 backdrop-blur">
          <h1 className="text-5xl font-bold">User Not Found</h1>
        </div>
      </AppShell>
    );
  }

  const nowIso = new Date().toISOString();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", id)
    .gt("expires_at", nowIso)
    .order("refreshed_at", { ascending: false });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("reviewed_user_id", id)
    .order("created_at", { ascending: false });

  const averageRating =
    (reviews || []).length > 0
      ? (reviews || []).reduce(
          (total, review) => total + Number(review.rating || 0),
          0
        ) / (reviews || []).length
      : Number(user.average_rating || 5);

  const roundedRating = Math.max(0, Math.min(5, Math.round(averageRating)));
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <AppShell>
      <PageBackground />

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

                <p className="mt-4 max-w-2xl whitespace-pre-wrap text-zinc-300">
                  {user.bio || "No bio added yet."}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {!isOwnProfile && (
                    <>
                      <a
                        href={`/messages?user=${user.id}`}
                        className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
                      >
                        Message Trader
                      </a>

                      <a
                        href={`/report?user=${user.id}`}
                        className="rounded-xl border border-red-500 px-5 py-3 font-semibold text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        Report User
                      </a>
                    </>
                  )}

                  {isOwnProfile && (
                    <a
                      href="/profile"
                      className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
                    >
                      Edit My Profile
                    </a>
                  )}

                  {user.steam_profile_url && (
                    <a
                      href={user.steam_profile_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
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

          <Panel title="Leave Review">
            {!currentUser ? (
              <EmptyState text="Sign in to leave a review." />
            ) : isOwnProfile ? (
              <EmptyState text="You cannot review yourself." />
            ) : (
              <form action={leaveReview} className="space-y-4">
                <input type="hidden" name="reviewed_user_id" value={user.id} />

                <select
                  name="rating"
                  defaultValue="5"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="5">★★★★★ 5 stars</option>
                  <option value="4">★★★★ 4 stars</option>
                  <option value="3">★★★ 3 stars</option>
                  <option value="2">★★ 2 stars</option>
                  <option value="1">★ 1 star</option>
                </select>

                <textarea
                  name="comment"
                  required
                  placeholder="Write your review..."
                  className="min-h-28 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
                />

                <button className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400">
                  Submit Review
                </button>
              </form>
            )}
          </Panel>
        </div>

        <div className="mt-8">
          <Panel title="Reviews">
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