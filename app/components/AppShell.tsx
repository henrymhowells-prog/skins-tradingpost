import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/listings", label: "My Trades" },
  { href: "/search-trades", label: "Search Trades" },
  { href: "/saved", label: "Saved Trades" },
  { href: "/profile", label: "Profile" },
  { href: "/reviews", label: "Reviews" },
  { href: "/settings", label: "Settings" },
];

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  let unreadNotificationCount = 0;
  let unreadMessageCount = 0;

  if (currentUser) {
    const [{ count: notificationsCount }, { count: messagesCount }] =
  await Promise.all([
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", currentUser.id)
      .eq("read", false),

    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", currentUser.id)
      .eq("read", false),
  ]);

unreadNotificationCount = notificationsCount || 0;
unreadMessageCount = messagesCount || 0;
  }

  const isAdmin = currentUser?.role === "admin";

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex">
        <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/10 bg-black/80 p-5 backdrop-blur-xl md:block">
          <a
  href="/dashboard"
  className="block rounded-2xl border border-white/15 bg-zinc-950/70 px-8 py-5"
>
  <span className="block text-[1.85rem] font-black leading-[1.05] tracking-tight">
    Skins
    <br />
    TradingPost
  </span>
</a>

          <nav className="mt-14 space-y-3">
            <SidebarLink href="/dashboard" label="Dashboard" />

            <SidebarLink
              href="/notifications"
              label="Notifications"
              badge={unreadNotificationCount}
              badgeColor="red"
            />

            <SidebarLink
              href="/messages"
              label="Messages"
              badge={unreadMessageCount}
              badgeColor="orange"
            />

            <div className="my-7 border-t border-white/10" />

            {mainNavItems.slice(1).map((item) => (
              <SidebarLink key={item.href} href={item.href} label={item.label} />
            ))}

            {isAdmin && (
              <>
                <div className="my-5 border-t border-white/10" />

                <p className="px-4 text-[11px] font-black uppercase tracking-[0.2em] text-orange-500/80">
                  Admin
                </p>

                <div className="mt-2 space-y-1.5">
                  <SidebarLink href="/admin" label="Admin Dashboard" admin />
                  <SidebarLink href="/admin/reports" label="Admin Reports" admin />
                  <SidebarLink href="/admin/users" label="Admin Users" admin />
                  <SidebarLink href="/admin/listings" label="Admin Listings" admin />
                </div>
              </>
            )}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
         

          <section className="relative z-10 p-8">{children}</section>
        </div>
      </div>
    </main>
  );
}

function SidebarLink({
  href,
  label,
  badge,
  badgeColor,
  admin = false,
}: {
  href: string;
  label: string;
  badge?: number;
  badgeColor?: "orange" | "red";
  admin?: boolean;
}) {
  return (
    <a
      href={href}
      className={`group flex items-center justify-between rounded-xl px-4 py-4 text-[17px] font-semibold transition ${
        admin
          ? "border border-orange-500/20 bg-orange-500/5 text-orange-300 hover:bg-orange-500/15"
          : "text-zinc-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span>{label}</span>

      {badge && badge > 0 && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-black ${
            badgeColor === "red"
              ? "bg-red-500 text-white"
              : "bg-orange-500 text-black"
          }`}
        >
          {badge}
        </span>
      )}
    </a>
  );
}

function TopIconLink({
  href,
  label,
  count,
  color,
}: {
  href: string;
  label: string;
  count: number;
  color: "orange" | "red";
}) {
  return (
    <a
      href={href}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
    >
      <span>{label}</span>

      {count > 0 && (
        <span
          className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-black ${
            color === "red" ? "bg-red-500 text-white" : "bg-orange-500 text-black"
          }`}
        >
          {count}
        </span>
      )}
    </a>
  );
}

function DropdownLink({
  href,
  label,
  admin = false,
}: {
  href: string;
  label: string;
  admin?: boolean;
}) {
  return (
    <a
      href={href}
      className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        admin
          ? "text-orange-400 hover:bg-orange-500/10"
          : "text-zinc-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </a>
  );
}