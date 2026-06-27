import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <AppShell>
        <PageBackground />

        <div className="relative z-10">
          <h1 className="text-5xl font-bold">Skins TradingPost</h1>
          <p className="mt-3 text-zinc-300">Sign in to view your dashboard.</p>
        </div>
      </AppShell>
    );
  }

  const nowIso = new Date().toISOString();

  const { count: inventoryCount } = await supabase
    .from("inventory_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", currentUser.id);

  const { count: activeListingsCount } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", currentUser.id)
    .gt("expires_at", nowIso);

  const { count: savedCount } = await supabase
    .from("saved_listings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", currentUser.id);

  const { data: recentListings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", currentUser.id)
    .gt("expires_at", nowIso)
    .order("refreshed_at", { ascending: false })
    .limit(4);

  return (
    <AppShell>
      <PageBackground />

      <div className="relative z-10 -mt-4">
        <div className="mb-6 w-fit">
          <div className="flex items-center gap-3">
            <div className="h-1 w-40 bg-orange-500" />
            <span className="text-4xl leading-none text-orange-500">➜</span>
          </div>

          <div className="my-2 text-3xl font-black italic tracking-tight text-white/80">
            SKINS TRADINGPOST
          </div>

          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none text-blue-700">⬅</span>
            <div className="h-1 w-40 bg-blue-700" />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <div className="rounded-[32px] bg-blue-900/90 p-8 shadow-xl">
            <p className="text-4xl font-black text-white/90">Welcome Back</p>

            <h1 className="mt-6 break-words text-3xl font-black uppercase tracking-wide text-white/90">
              {currentUser.steam_name || currentUser.username || "Trader"}
            </h1>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <MiniStat label="Items" value={inventoryCount || 0} />
              <MiniStat label="Listings" value={activeListingsCount || 0} />
              <MiniStat label="Saved" value={savedCount || 0} />
            </div>
          </div>

          <div className="rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
            <h2 className="max-w-4xl text-3xl font-black text-zinc-200">
              Manage your inventory, refresh active listings and find new CS2
              trade opportunities.
            </h2>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
  href="/listings"
  className="rounded-full bg-orange-500 px-9 py-4 text-xl font-black text-white shadow-lg hover:bg-orange-400"
>
  My Trades
</a>

              <a
                href="/listings"
                className="rounded-full bg-orange-500 px-9 py-4 text-xl font-black text-white shadow-lg hover:bg-orange-400"
              >
                Create Trade
              </a>

              <a
  href="/search-trades"
  className="rounded-full bg-orange-500 px-9 py-4 text-xl font-black text-white shadow-lg hover:bg-orange-400"
>
  Search Trades
</a>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <Panel title="YOUR ACTIVE LISTINGS" type="list">
            {(recentListings || []).length === 0 ? (
              <EmptyState
                title="No active listings"
                text="Create your first listing to start receiving trade interest."
                href="/listings"
                action="Create listing"
              />
            ) : (
              <div className="grid gap-3">
                {(recentListings || []).map((listing) => (
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

          <Panel title="NEWS" type="news">
            <div className="grid gap-3">
              <NewsCard
                title="Listings now refresh to the top"
                text="Refresh each trade every 15 minutes to keep it visible to other traders."
              />

              <NewsCard
                title="Trades expire after 7 days"
                text="Old listings are automatically hidden unless refreshed."
              />

              <NewsCard
                title="Trade safely"
                text="Always check Steam profiles, inspect items, and avoid suspicious offers."
              />
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-black/25 p-3 text-center">
      <p className="text-xl font-black">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

function Panel({
  title,
  type,
  children,
}: {
  title: string;
  type: "list" | "news";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[330px] rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
      <div className="flex items-center gap-4">
        {type === "list" ? <ListIcon /> : <NewsIcon />}

        <h2 className="text-3xl font-black italic tracking-wide text-zinc-200">
          {title}
        </h2>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}

function ListIcon() {
  return (
    <svg
      width="54"
      height="54"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-zinc-300"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <rect x="3" y="4" width="3" height="3" />
      <rect x="3" y="10" width="3" height="3" />
      <rect x="3" y="16" width="3" height="3" />
    </svg>
  );
}

function NewsIcon() {
  return (
    <svg
      width="54"
      height="54"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-zinc-300"
    >
      <rect x="3" y="4" width="18" height="16" />
      <line x1="8" y1="8" x2="18" y2="8" />
      <line x1="8" y1="12" x2="18" y2="12" />
      <line x1="8" y1="16" x2="14" y2="16" />
      <rect x="5" y="7" width="2" height="8" />
    </svg>
  );
}

function NewsCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4">
      <p className="font-bold text-white">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{text}</p>
    </div>
  );
}

function EmptyState({
  title,
  text,
  href,
  action,
}: {
  title: string;
  text: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-5">
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{text}</p>

      <a
        href={href}
        className="mt-4 inline-block rounded-xl bg-orange-500 px-4 py-2 font-semibold text-black hover:bg-orange-400"
      >
        {action}
      </a>
    </div>
  );
}