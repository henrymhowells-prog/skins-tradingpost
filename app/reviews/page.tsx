import AppShell from "../components/AppShell";
import PageBackground from "../components/PageBackground";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReviewsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <AppShell>
        <PageBackground leftOffset={256} />

        <div className="relative z-10">
          <h1 className="text-5xl font-bold">Reviews</h1>
          <p className="mt-3 text-zinc-300">Sign in to view your reviews.</p>
        </div>
      </AppShell>
    );
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .or(`reviewed_user_id.eq.${currentUser.id},reviewer_id.eq.${currentUser.id}`)
    .order("created_at", { ascending: false });

  const { data: users } = await supabase.from("users").select("*");

  const receivedReviews = (reviews || []).filter(
    (review) => review.reviewed_user_id === currentUser.id
  );

  const givenReviews = (reviews || []).filter(
    (review) => review.reviewer_id === currentUser.id
  );

  const averageRating =
    receivedReviews.length > 0
      ? receivedReviews.reduce(
          (total, review) => total + Number(review.rating || 0),
          0
        ) / receivedReviews.length
      : 0;

  return (
    <AppShell>
      <PageBackground leftOffset={256} />

      <div className="relative z-10">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-400">
                Reputation
              </p>

              <h1 className="mt-2 text-5xl font-bold">Reviews</h1>

              <p className="mt-3 max-w-2xl text-zinc-300">
                Track your trading reputation, ratings, and feedback from other users.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-6 py-4">
              <p className="text-sm text-zinc-400">Average Rating</p>
              <p className="mt-1 text-4xl font-bold text-orange-400">
                {averageRating.toFixed(1)} / 5
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard label="Reviews Received" value={receivedReviews.length} />
            <StatCard label="Reviews Given" value={givenReviews.length} />
            <StatCard
              label="Trust Score"
              value={Number(currentUser.trust_score || 5)}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <ReviewPanel title="Reviews You Received">
            {receivedReviews.length === 0 ? (
              <EmptyState text="You have not received any reviews yet." />
            ) : (
              receivedReviews.map((review) => {
                const reviewer = (users || []).find(
                  (user) => user.id === review.reviewer_id
                );

                return (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    user={reviewer}
                    userLabel="From"
                  />
                );
              })
            )}
          </ReviewPanel>

          <ReviewPanel title="Reviews You Gave">
            {givenReviews.length === 0 ? (
              <EmptyState text="You have not left any reviews yet." />
            ) : (
              givenReviews.map((review) => {
                const reviewedUser = (users || []).find(
                  (user) => user.id === review.reviewed_user_id
                );

                return (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    user={reviewedUser}
                    userLabel="For"
                  />
                );
              })
            )}
          </ReviewPanel>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function ReviewPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-5 grid gap-4">{children}</div>
    </div>
  );
}

function ReviewCard({
  review,
  user,
  userLabel,
}: {
  review: any;
  user: any;
  userLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold">
            {userLabel}: {user?.steam_name || user?.username || "Unknown User"}
          </p>

          <p className="mt-2 text-orange-400">
            {"★".repeat(Number(review.rating || 0))}
            <span className="text-zinc-700">
              {"★".repeat(5 - Number(review.rating || 0))}
            </span>
          </p>
        </div>

        <p className="text-sm text-zinc-500">
          {review.created_at
            ? new Date(review.created_at).toLocaleDateString()
            : "Unknown"}
        </p>
      </div>

      {review.comment && (
        <p className="mt-4 text-zinc-300">{review.comment}</p>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-500">
      {text}
    </div>
  );
}