import { revalidatePath } from "next/cache";
import AppShell from "../components/AppShell";
import PageBackground from "../components/PageBackground";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function markAllRead() {
  "use server";

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You must be signed in.");
  }

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", currentUser.id);

  revalidatePath("/notifications");
}

function timeLabel(value?: string | null) {
  if (!value) return "Unknown time";

  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleString();
}

export default async function NotificationsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <AppShell>
        <PageBackground leftOffset={256} />

        <div className="relative z-10 rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
          <h1 className="text-5xl font-black">Please sign in</h1>

          <p className="mt-3 text-zinc-300">
            Sign in with your email account to view notifications.
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

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  const unreadCount = (notifications || []).filter(
    (notification) => !notification.read
  ).length;

  return (
    <AppShell>
      <PageBackground leftOffset={256} />

      <div className="relative z-10">
        <div className="mb-6 w-fit">
          <div className="flex items-center gap-3">
            <div className="h-1 w-40 bg-orange-500" />
            <span className="text-4xl leading-none text-orange-500">➜</span>
          </div>

          <div className="my-2 text-3xl font-black italic tracking-tight text-white/80">
            NOTIFICATIONS
          </div>

          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none text-blue-700">⬅</span>
            <div className="h-1 w-40 bg-blue-700" />
          </div>
        </div>

        <div className="rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-black">Notifications</h1>

              <p className="mt-3 max-w-3xl text-zinc-300">
                Stay up to date with messages, new reviews, trading activity and
                important account updates.
              </p>

              <p className="mt-3 text-zinc-300">
                You have{" "}
                <span className="font-bold text-orange-400">
                  {unreadCount}
                </span>{" "}
                unread notification{unreadCount === 1 ? "" : "s"}.
              </p>
            </div>

            {(notifications || []).length > 0 && (
              <form action={markAllRead}>
                <button className="rounded-full bg-orange-500 px-7 py-3 font-black text-white shadow-lg hover:bg-orange-400">
                  Mark All Read
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8">
          {(notifications || []).length === 0 ? (
            <div className="rounded-[32px] border border-zinc-800 bg-black/80 p-10 text-center backdrop-blur">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-4xl">
                🔔
              </div>

              <h2 className="mt-6 text-3xl font-black">
                No notifications yet
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
                You'll receive notifications when traders send you messages,
                leave new reviews, interact with your trades, or when there are
                important updates about your account.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {notifications?.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-[28px] border p-6 backdrop-blur transition ${
                    notification.read
                      ? "border-zinc-800 bg-black/75"
                      : "border-orange-500/70 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.08)]"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                          notification.read
                            ? "bg-zinc-900 text-zinc-400"
                            : "bg-orange-500 text-black"
                        }`}
                      >
                        🔔
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-black">
                            {notification.title || "Notification"}
                          </h2>

                          {!notification.read && (
                            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-wide text-black">
                              New
                            </span>
                          )}
                        </div>

                        {notification.body && (
                          <p className="mt-2 max-w-3xl text-zinc-400">
                            {notification.body}
                          </p>
                        )}

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                          {timeLabel(notification.created_at)}
                        </p>
                      </div>
                    </div>

                    {notification.link && (
                      <a
                        href={notification.link}
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold hover:bg-zinc-800"
                      >
                        Open
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}