import { revalidatePath } from "next/cache";
import AppShell from "../../components/AppShell";
import { supabase } from "../../lib/supabase";
import { getCurrentUser } from "../../lib/currentUser";

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
      : 0;

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

export default async function PublicUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("reviewed_user_id", id)
    .order("created_at", { ascending: false });

  if (!user) {
    return (
      <AppShell>
        <h1 className="text-4xl font-bold">User Not Found</h1>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <img
            src={
              user.avatar_url ||
              "https://avatars.githubusercontent.com/u/9919?s=200&v=4"
            }
            alt="Profile"
            className="h-28 w-28 rounded-full"
          />

          <div>
            <h1 className="text-4xl font-bold">
              {user.steam_name || user.username || "Unknown User"}
            </h1>

            <p className="mt-2 text-zinc-400">
              {user.bio || "No bio added yet."}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-xl bg-zinc-800 px-4 py-2">
                ⭐ {user.average_rating || 0}
              </div>

              <div className="rounded-xl bg-zinc-800 px-4 py-2">
                Reviews: {user.review_count || reviews?.length || 0}
              </div>

              <div className="rounded-xl bg-zinc-800 px-4 py-2">
                Active Listings: {listings?.length || 0}
              </div>
            </div>

            <div className="mt-5 flex gap-3">
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
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-2xl font-bold">Active Listings</h2>

          {(listings || []).length === 0 ? (
            <p className="text-zinc-500">No active listings.</p>
          ) : (
            <div className="space-y-3">
              {listings?.map((listing) => (
                <a
                  key={listing.id}
                  href={`/trade/${listing.id}`}
                  className="block rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-orange-500"
                >
                  {listing.title}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-2xl font-bold">Leave Review</h2>

          <form action={leaveReview} className="space-y-4">
            <input type="hidden" name="reviewed_user_id" value={user.id} />

            <select
              name="rating"
              defaultValue="5"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
            >
              <option value="5">⭐⭐⭐⭐⭐ 5 stars</option>
              <option value="4">⭐⭐⭐⭐ 4 stars</option>
              <option value="3">⭐⭐⭐ 3 stars</option>
              <option value="2">⭐⭐ 2 stars</option>
              <option value="1">⭐ 1 star</option>
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
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-2xl font-bold">Reviews</h2>

        {(reviews || []).length === 0 ? (
          <p className="text-zinc-500">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews?.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="mb-2 text-yellow-400">
                  {"⭐".repeat(review.rating)}
                </div>

                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}