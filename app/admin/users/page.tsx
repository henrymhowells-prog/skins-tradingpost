import { revalidatePath } from "next/cache";
import AppShell from "../../components/AppShell";
import { supabase } from "../../lib/supabase";
import { getCurrentUser } from "../../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function banUser(formData: FormData) {
  "use server";

  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Not allowed.");
  }

  const userId = String(formData.get("user_id") || "");
  const reason = String(formData.get("ban_reason") || "Banned by admin.");

  if (userId === currentUser.id) {
    throw new Error("You cannot ban yourself.");
  }

  await supabase
    .from("users")
    .update({
      is_banned: true,
      banned_reason: reason,
      banned_at: new Date().toISOString(),
    })
    .eq("id", userId);

  await supabase.from("listings").delete().eq("user_id", userId);

  revalidatePath("/admin/users");
  revalidatePath("/browse");
}

async function unbanUser(formData: FormData) {
  "use server";

  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Not allowed.");
  }

  const userId = String(formData.get("user_id") || "");

  await supabase
    .from("users")
    .update({
      is_banned: false,
      banned_reason: null,
      banned_at: null,
    })
    .eq("id", userId);

  revalidatePath("/admin/users");
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <AppShell>
        <h1 className="text-4xl font-bold">Not Allowed</h1>
      </AppShell>
    );
  }

  const params = searchParams ? await searchParams : {};
  const query = String(params.q || "").trim().toLowerCase();

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  const filteredUsers = (users || []).filter((user) => {
    if (!query) return true;

    return (
      String(user.steam_name || "").toLowerCase().includes(query) ||
      String(user.username || "").toLowerCase().includes(query) ||
      String(user.steam_id || "").toLowerCase().includes(query) ||
      String(user.id || "").toLowerCase().includes(query)
    );
  });

  return (
    <AppShell>
      <h1 className="text-4xl font-bold">Admin Users</h1>

      <p className="mt-2 text-zinc-400">
        Search users, view profiles, and manage bans.
      </p>

      <form className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <label className="text-sm text-zinc-400">Search Users</label>

        <div className="mt-2 flex gap-3">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by Steam name, username, Steam ID, or user ID..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
          />

          <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400">
            Search
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm text-zinc-500">
        Showing {filteredUsers.length} user
        {filteredUsers.length === 1 ? "" : "s"}.
      </p>

      <div className="mt-8 grid gap-5">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex gap-4">
                <img
                  src={
                    user.avatar_url ||
                    user.steam_avatar ||
                    "https://avatars.githubusercontent.com/u/9919?s=200&v=4"
                  }
                  alt="User avatar"
                  className="h-16 w-16 rounded-full"
                />

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold">
                      {user.steam_name || user.username || "Unknown User"}
                    </h2>

                    {user.role === "admin" && (
                      <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
                        Admin
                      </span>
                    )}

                    {user.is_banned && (
                      <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
                        Banned
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-zinc-500">
                    <p>User ID: {user.id}</p>
                    <p>Steam ID: {user.steam_id || "None"}</p>
                    <p>Trust Score: {user.trust_score ?? 5}</p>
                    <p>Trades: {user.trade_count ?? 0}</p>
                    <p>
                      Rating: {user.average_rating ?? 0} / 5 from{" "}
                      {user.review_count ?? 0} reviews
                    </p>
                    <p>
                      Joined:{" "}
                      {user.created_at
                        ? new Date(user.created_at).toLocaleString()
                        : "Unknown"}
                    </p>

                    {user.is_banned && (
                      <>
                        <p className="text-red-400">
                          Ban reason: {user.banned_reason || "No reason"}
                        </p>
                        <p className="text-red-400">
                          Banned at:{" "}
                          {user.banned_at
                            ? new Date(user.banned_at).toLocaleString()
                            : "Unknown"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 xl:justify-end">
                <a
                  href={`/user/${user.id}`}
                  className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
                >
                  View Profile
                </a>

                {user.profile_url && (
                  <a
                    href={user.profile_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
                  >
                    Steam
                  </a>
                )}

                {user.is_banned ? (
                  <form action={unbanUser}>
                    <input type="hidden" name="user_id" value={user.id} />
                    <button className="rounded-xl border border-blue-500 px-5 py-3 font-semibold text-blue-400 hover:bg-blue-500 hover:text-white">
                      Unban
                    </button>
                  </form>
                ) : (
                  <form action={banUser} className="flex gap-2">
                    <input type="hidden" name="user_id" value={user.id} />

                    <input
                      name="ban_reason"
                      placeholder="Ban reason"
                      className="w-40 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
                    />

                    <button className="rounded-xl border border-red-500 px-5 py-3 font-semibold text-red-400 hover:bg-red-500 hover:text-white">
                      Ban
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}