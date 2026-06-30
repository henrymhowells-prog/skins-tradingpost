import { FaDiscord, FaInstagram } from "react-icons/fa";
import { SiTiktok, SiX } from "react-icons/si";
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
  { href: "/about", label: "About" },
];

const socialLinks = [
  {
    href: "https://instagram.com/skinstradingpost",
    label: "Instagram",
    icon: <FaInstagram size={22} />,
    className: "text-pink-500 hover:text-pink-400",
  },
  {
    href: "https://tiktok.com/@skinstradingpost",
    label: "TikTok",
    icon: <SiTiktok size={22} />,
    className: "text-white hover:text-zinc-300",
  },
  {
    href: "https://discord.gg/YOURINVITE",
    label: "Discord",
    icon: <FaDiscord size={22} />,
    className: "text-indigo-500 hover:text-indigo-400",
  },
  {
    href: "https://x.com/skinstradingpost",
    label: "X",
    icon: <SiX size={22} />,
    className: "text-white hover:text-zinc-300",
  },
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
          <LogoBox />

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

            <SocialLinks />
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <MobileNav
            isAdmin={isAdmin}
            unreadMessageCount={unreadMessageCount}
            unreadNotificationCount={unreadNotificationCount}
          />

          <section className="relative z-10 p-4 sm:p-6 md:p-8">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}

function LogoBox() {
  return (
    <a
      href="/dashboard"
      className="block rounded-2xl border border-white/10 bg-zinc-950/70 px-5 py-4 shadow-xl shadow-black/40"
    >
      <span className="block pl-2 text-[1.55rem] font-black leading-[1.05] tracking-tight text-white">
        Skins
        <br />
        TradingPost
      </span>
    </a>
  );
}

function SocialLinks() {
  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <p className="mb-4 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
        Join Community
      </p>

      <div className="flex items-center justify-center gap-5">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className={`transition hover:scale-110 ${link.className}`}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  );
}

function MobileNav({
  isAdmin,
  unreadMessageCount,
  unreadNotificationCount,
}: {
  isAdmin: boolean;
  unreadMessageCount: number;
  unreadNotificationCount: number;
}) {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black/85 px-4 py-3 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-between gap-3">
        <a href="/dashboard" className="text-lg font-black leading-tight">
          Skins TradingPost
        </a>

        <div className="flex items-center gap-2">
          <MobileIconLink
            href="/messages"
            label="💬"
            count={unreadMessageCount}
            color="orange"
          />

          <MobileIconLink
            href="/notifications"
            label="🔔"
            count={unreadNotificationCount}
            color="red"
          />

          <details className="relative">
            <summary className="list-none rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white">
              Menu
            </summary>

            <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
              <div className="grid gap-1">
                <MobileMenuLink href="/dashboard" label="Dashboard" />
                <MobileMenuLink
                  href="/notifications"
                  label="Notifications"
                  badge={unreadNotificationCount}
                />
                <MobileMenuLink
                  href="/messages"
                  label="Messages"
                  badge={unreadMessageCount}
                />

                <div className="my-2 border-t border-white/10" />

                {mainNavItems.slice(1).map((item) => (
                  <MobileMenuLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                  />
                ))}

                <MobileSocialLinks />

                {isAdmin && (
                  <>
                    <div className="my-2 border-t border-white/10" />

                    <p className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-orange-500/80">
                      Admin
                    </p>

                    <MobileMenuLink href="/admin" label="Admin Dashboard" admin />
                    <MobileMenuLink href="/admin/reports" label="Admin Reports" admin />
                    <MobileMenuLink href="/admin/users" label="Admin Users" admin />
                    <MobileMenuLink href="/admin/listings" label="Admin Listings" admin />
                  </>
                )}
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

function MobileSocialLinks() {
  return (
    <>
      <div className="my-2 border-t border-white/10" />

      <p className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
        Join Community
      </p>

      <div className="flex items-center justify-center gap-6 px-3 py-3">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className={`transition hover:scale-110 ${link.className}`}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </>
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

function MobileMenuLink({
  href,
  label,
  badge,
  admin = false,
}: {
  href: string;
  label: string;
  badge?: number;
  admin?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold ${
        admin
          ? "text-orange-400 hover:bg-orange-500/10"
          : "text-zinc-200 hover:bg-white/5"
      }`}
    >
      <span>{label}</span>

      {badge && badge > 0 && (
        <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-black text-black">
          {badge}
        </span>
      )}
    </a>
  );
}

function MobileIconLink({
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
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
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