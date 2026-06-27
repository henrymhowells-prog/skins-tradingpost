import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  let unreadNotificationCount = 0;
  let unreadMessageCount = 0;

  if (currentUser) {
    const { data: notifications } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", currentUser.id)
      .eq("read", false);

    unreadNotificationCount = notifications?.length || 0;

    const { data: unreadMessages } = await supabase
      .from("messages")
      .select("id")
      .eq("receiver_id", currentUser.id)
      .eq("read", false);

    unreadMessageCount = unreadMessages?.length || 0;
  }

  const isAdmin = currentUser?.role === "admin";

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex">
        <aside className="hidden min-h-screen w-64 border-r border-zinc-800 bg-zinc-900 p-6 md:block">
          <a href="/dashboard" className="text-2xl font-bold leading-tight">
            Skins
            <br />
            TradingPost
          </a>

          <nav className="mt-10 space-y-2">
            <a
              href="/dashboard"
              className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
            >
              Dashboard
            </a>

            <a
              href="/notifications"
              className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-zinc-800"
            >
              <span>Notifications</span>

              {unreadNotificationCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {unreadNotificationCount}
                </span>
              )}
            </a>

            <a
              href="/messages"
              className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-zinc-800"
            >
              <span>Messages</span>

              {unreadMessageCount > 0 && (
                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-black">
                  {unreadMessageCount}
                </span>
              )}
            </a>

            <a
              href="/inventory"
              className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
            >
              Inventory
            </a>

            <a
              href="/listings"
              className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
            >
              My Trades
            </a>

            <a
              href="/search-trades"
              className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
            >
              Search Trades
            </a>

            <a
              href="/saved"
              className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
            >
              Saved Trades
            </a>

            <a
              href="/profile"
              className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
            >
              Profile
            </a>

            <a
              href="/reviews"
              className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
            >
              Reviews
            </a>

            <a
              href="/settings"
              className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
            >
              Settings
            </a>

            {isAdmin && (
              <>
                <div className="my-4 border-t border-zinc-800" />

                <a
                  href="/admin"
                  className="block rounded-lg border border-orange-500/40 bg-orange-500/10 px-4 py-3 font-semibold text-orange-400 hover:bg-orange-500/20"
                >
                  Admin Dashboard
                </a>

                <a
                  href="/admin/reports"
                  className="block rounded-lg px-4 py-3 text-orange-300 hover:bg-zinc-800"
                >
                  Admin Reports
                </a>

                <a
                  href="/admin/users"
                  className="block rounded-lg px-4 py-3 text-orange-300 hover:bg-zinc-800"
                >
                  Admin Users
                </a>

                <a
                  href="/admin/listings"
                  className="block rounded-lg px-4 py-3 text-orange-300 hover:bg-zinc-800"
                >
                  Admin Listings
                </a>
              </>
            )}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-zinc-800 px-8 py-5">
            <h1 className="text-lg font-semibold">Skins TradingPost</h1>

            <div className="flex items-center gap-6">
              {isAdmin && (
                <a
                  href="/admin"
                  className="rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-400 hover:bg-orange-500/20"
                >
                  Admin
                </a>
              )}

              <a
                href="/messages"
                className="relative text-zinc-400 hover:text-white"
              >
                💬

                {unreadMessageCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-black">
                    {unreadMessageCount}
                  </span>
                )}
              </a>

              <a
                href="/notifications"
                className="relative text-zinc-400 hover:text-white"
              >
                🔔

                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadNotificationCount}
                  </span>
                )}
              </a>

              <div className="group relative">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-black">
                  {currentUser?.steam_name?.[0] ||
                    currentUser?.username?.[0] ||
                    "H"}
                </button>

                <div className="absolute right-0 top-10 z-50 hidden w-56 pt-3 group-hover:block">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-xl">
                    <a
                      href="/profile"
                      className="block rounded-lg px-4 py-2 text-sm hover:bg-zinc-800"
                    >
                      Profile
                    </a>

                    <a
                      href="/messages"
                      className="block rounded-lg px-4 py-2 text-sm hover:bg-zinc-800"
                    >
                      Messages
                    </a>

                    <a
                      href="/notifications"
                      className="block rounded-lg px-4 py-2 text-sm hover:bg-zinc-800"
                    >
                      Notifications
                    </a>

                    <a
                      href="/settings"
                      className="block rounded-lg px-4 py-2 text-sm hover:bg-zinc-800"
                    >
                      Settings
                    </a>

                    {isAdmin && (
                      <>
                        <div className="my-2 border-t border-zinc-800" />

                        <a
                          href="/admin"
                          className="block rounded-lg px-4 py-2 text-sm font-semibold text-orange-400 hover:bg-zinc-800"
                        >
                          Admin Dashboard
                        </a>
                      </>
                    )}

                    <div className="my-2 border-t border-zinc-800" />

                    <a
                      href="/"
                      className="block rounded-lg px-4 py-2 text-sm text-red-400 hover:bg-zinc-800"
                    >
                      Sign Out
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="p-8">{children}</section>
        </div>
      </div>
    </main>
  );
}