import { revalidatePath } from "next/cache";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

async function markAllRead() {
  "use server";

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You must be signed in with Steam.");
  }

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", currentUser.id);

  revalidatePath("/notifications");
}

export default async function NotificationsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <AppShell>
        <h1 className="text-4xl font-bold">Please sign in with Steam</h1>

        <a
          href="/api/auth/steam/login"
          className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
        >
          Sign in with Steam
        </a>
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Notifications</h1>

          <p className="mt-2 text-zinc-400">
            You have {unreadCount} unread notification
            {unreadCount === 1 ? "" : "s"}.
          </p>
        </div>

        {(notifications || []).length > 0 && (
          <form action={markAllRead}>
            <button className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400">
              Mark All Read
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {(notifications || []).length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-500">
            No notifications yet.
          </div>
        ) : (
          notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl border p-5 ${
                notification.read
                  ? "border-zinc-800 bg-zinc-900"
                  : "border-orange-500 bg-orange-500/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{notification.title}</h2>

                  {notification.body && (
                    <p className="mt-2 text-zinc-400">
                      {notification.body}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-zinc-500">
                    {notification.created_at
                      ? new Date(notification.created_at).toLocaleString()
                      : "Unknown time"}
                  </p>
                </div>

                {!notification.read && (
                  <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-black">
                    New
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}