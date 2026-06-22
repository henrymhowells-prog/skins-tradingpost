import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <AppShell>
        <h1 className="text-4xl font-bold">Not Allowed</h1>
      </AppShell>
    );
  }

  const nowIso = new Date().toISOString();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const { count: openReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  const { count: totalReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true });

  const { count: reportsToday } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayIso);

  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const { count: usersToday } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayIso);

  const { count: bannedUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("is_banned", true);

  const { count: activeListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .gt("expires_at", nowIso);

  const { count: listingsToday } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayIso);

  const { count: expiredListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .lte("expires_at", nowIso);

  const { count: savedListings } = await supabase
    .from("saved_listings")
    .select("*", { count: "exact", head: true });

  const { count: messagesToday } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayIso);

  const { data: recentReports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentUsers } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentListings } = await supabase
    .from("listings")
    .select("*")
    .order("refreshed_at", { ascending: false })
    .limit(5);

  return (
    <AppShell>
      <h1 className="text-4xl font-bold">Admin Analytics</h1>

      <p className="mt-2 text-zinc-400">
        Overview of users, listings, reports, and platform activity.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Reports" value={openReports || 0} tone="orange" />
        <StatCard label="Active Listings" value={activeListings || 0} tone="green" />
        <StatCard label="Total Users" value={totalUsers || 0} tone="blue" />
        <StatCard label="Banned Users" value={bannedUsers || 0} tone="red" />
        <StatCard label="Reports Today" value={reportsToday || 0} tone="orange" />
        <StatCard label="Listings Today" value={listingsToday || 0} tone="green" />
        <StatCard label="Users Today" value={usersToday || 0} tone="blue" />
        <StatCard label="Messages Today" value={messagesToday || 0} tone="purple" />
        <StatCard label="Total Reports" value={totalReports || 0} tone="zinc" />
        <StatCard label="Expired Listings" value={expiredListings || 0} tone="red" />
        <StatCard label="Saved Listings" value={savedListings || 0} tone="blue" />
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <AdminLink
          href="/admin/reports"
          title="Manage Reports"
          description="Review open reports, resolve cases, ban users, and delete listings."
        />

        <AdminLink
          href="/admin/users"
          title="Manage Users"
          description="Search users, inspect profiles, ban or unban accounts."
        />

        <AdminLink
          href="/admin/listings"
          title="Manage Listings"
          description="Search active listings, review trades, and remove bad listings."
        />
      </div>

      <div className="mt-10 grid gap-5 xl:grid-cols-3">
        <Panel title="Recent Reports">
          {(recentReports || []).length === 0 ? (
            <EmptyText>No recent reports.</EmptyText>
          ) : (
            recentReports?.map((report) => (
              <a
                key={report.id}
                href="/admin/reports"
                className="block rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-orange-500"
              >
                <p className="font-bold">{report.report_type || "Report"}</p>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                  {report.reason || "No reason"}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  {report.created_at
                    ? new Date(report.created_at).toLocaleString()
                    : "Unknown"}
                </p>
              </a>
            ))
          )}
        </Panel>

        <Panel title="Recent Users">
          {(recentUsers || []).length === 0 ? (
            <EmptyText>No recent users.</EmptyText>
          ) : (
            recentUsers?.map((user) => (
              <a
                key={user.id}
                href={`/user/${user.id}`}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-blue-500"
              >
                <img
                  src={
                    user.avatar_url ||
                    user.steam_avatar ||
                    "https://avatars.githubusercontent.com/u/9919?s=200&v=4"
                  }
                  alt="User avatar"
                  className="h-10 w-10 rounded-full"
                />

                <div>
                  <p className="font-bold">
                    {user.steam_name || user.username || "Unknown User"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>
              </a>
            ))
          )}
        </Panel>

        <Panel title="Recently Refreshed Listings">
          {(recentListings || []).length === 0 ? (
            <EmptyText>No recent listings.</EmptyText>
          ) : (
            recentListings?.map((listing) => (
              <a
                key={listing.id}
                href={`/trade/${listing.id}`}
                className="block rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-green-500"
              >
                <p className="font-bold">{listing.title}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Status: {listing.status || "unknown"}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Refreshed:{" "}
                  {listing.refreshed_at
                    ? new Date(listing.refreshed_at).toLocaleString()
                    : "Unknown"}
                </p>
              </a>
            ))
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "orange" | "green" | "blue" | "red" | "purple" | "zinc";
}) {
  const toneClass =
    tone === "orange"
      ? "text-orange-400"
      : tone === "green"
      ? "text-green-400"
      : tone === "blue"
      ? "text-blue-400"
      : tone === "red"
      ? "text-red-400"
      : tone === "purple"
      ? "text-purple-400"
      : "text-zinc-300";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-2 text-4xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function AdminLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-orange-500"
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-zinc-400">{description}</p>
    </a>
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}