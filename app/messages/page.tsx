import AppShell from "../components/AppShell";
import PageBackground from "../components/PageBackground";
import ClientChatBox from "../components/ClientChatBox";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ user?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const selectedUserId = params.user;

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <AppShell>
        <PageBackground leftOffset={256} />

        <div className="relative z-10 rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
          <h1 className="text-5xl font-black">Please sign in</h1>

          <p className="mt-3 text-zinc-300">
            Sign in with your email account to view and send messages.
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

  const { data: allMessages } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, read, created_at")
    .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
    .order("created_at", { ascending: false });

  const conversationStats = new Map<
    string,
    { lastMessageAt: string; unreadCount: number }
  >();

  for (const message of allMessages || []) {
    const otherUserId =
      message.sender_id === currentUser.id
        ? message.receiver_id
        : message.sender_id;

    if (!conversationStats.has(otherUserId)) {
      conversationStats.set(otherUserId, {
        lastMessageAt: message.created_at,
        unreadCount: 0,
      });
    }

    if (message.receiver_id === currentUser.id && message.read === false) {
      const stats = conversationStats.get(otherUserId);

      if (stats) {
        stats.unreadCount += 1;
      }
    }
  }

  const conversationUserIds = Array.from(conversationStats.keys());

  if (selectedUserId && !conversationUserIds.includes(selectedUserId)) {
    conversationUserIds.push(selectedUserId);
  }

  const { data: users } =
    conversationUserIds.length > 0
      ? await supabase.from("users").select("*").in("id", conversationUserIds)
      : { data: [] };

  const sortedUsers = (users || []).sort((a, b) => {
    const aStats = conversationStats.get(a.id);
    const bStats = conversationStats.get(b.id);

    const aTime = aStats?.lastMessageAt
      ? new Date(aStats.lastMessageAt).getTime()
      : 0;

    const bTime = bStats?.lastMessageAt
      ? new Date(bStats.lastMessageAt).getTime()
      : 0;

    return bTime - aTime;
  });

  const selectedUser =
    (users || []).find((user) => user.id === selectedUserId) || null;

  const { data: messagesRaw } = selectedUserId
    ? await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [] };

  const messages = [...(messagesRaw || [])].reverse();

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
            MESSAGES
          </div>

          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none text-blue-700">⬅</span>
            <div className="h-1 w-40 bg-blue-700" />
          </div>
        </div>

        <div className="rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
          <h1 className="text-5xl font-black">Messages</h1>

          <p className="mt-3 max-w-3xl text-zinc-300">
            Message traders about listings, offers and active trades.
          </p>
        </div>

        <div className="mt-8 flex w-full min-w-0 flex-row items-stretch gap-6 overflow-hidden">
          <section
            className={`w-full rounded-[32px] border border-zinc-800 bg-black/80 p-5 backdrop-blur lg:w-[320px] lg:shrink-0 ${
              selectedUser ? "hidden lg:block" : "block"
            }`}
          >
            <h2 className="text-2xl font-black">Traders</h2>

            <div className="mt-5 max-h-[680px] space-y-3 overflow-y-auto pr-1">
              {sortedUsers.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 text-sm text-zinc-500">
                  No conversations yet.
                </div>
              ) : (
                sortedUsers.map((user) => {
                  const unreadCount =
                    conversationStats.get(user.id)?.unreadCount || 0;

                  return (
                    <a
                      key={user.id}
                      href={`/messages/open?user=${user.id}`}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                        user.id === selectedUserId
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-zinc-800 bg-zinc-950/90 hover:border-orange-500"
                      }`}
                    >
                      <img
                        src={
                          user.avatar_url ||
                          user.steam_avatar ||
                          "https://avatars.githubusercontent.com/u/9919?s=200&v=4"
                        }
                        alt={user.steam_name || user.username || "Trader"}
                        className="h-11 w-11 shrink-0 rounded-full"
                      />

                      <div className="min-w-0">
                        <p className="truncate font-bold">
                          {user.steam_name || user.username || "Unknown User"}
                        </p>

                        <p className="text-xs text-zinc-500">
                          ⭐ {(user.average_rating ?? 5).toFixed(1)} / 5
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <span className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 text-xs font-black text-black">
                          {unreadCount}
                        </span>
                      )}
                    </a>
                  );
                })
              )}
            </div>
          </section>

          <section
            className={`min-w-0 flex-1 rounded-[32px] border border-zinc-800 bg-black/80 p-4 backdrop-blur sm:p-6 ${
              selectedUser ? "block" : "hidden lg:block"
            }`}
          >
            {selectedUser && (
              <a
                href="/messages"
                className="mb-4 inline-block rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-300 hover:bg-zinc-800 lg:hidden"
              >
                ← Back to traders
              </a>
            )}

            {selectedUser ? (
              <>
                <div className="flex items-center gap-4 border-b border-zinc-800 pb-5">
                  <a href={`/user/${selectedUser.id}`}>
                    <img
                      src={
                        selectedUser.avatar_url ||
                        selectedUser.steam_avatar ||
                        "https://avatars.githubusercontent.com/u/9919?s=200&v=4"
                      }
                      alt={
                        selectedUser.steam_name ||
                        selectedUser.username ||
                        "Trader"
                      }
                      className="h-16 w-16 rounded-full hover:ring-2 hover:ring-orange-500"
                    />
                  </a>

                  <div className="min-w-0">
                    <a
                      href={`/user/${selectedUser.id}`}
                      className="break-words text-3xl font-black hover:text-orange-400"
                    >
                      {selectedUser.steam_name ||
                        selectedUser.username ||
                        "Unknown User"}
                    </a>

                    <p className="mt-1 text-sm text-zinc-400">
                      ⭐ {(selectedUser.average_rating ?? 5).toFixed(1)} / 5
                    </p>
                  </div>
                </div>

                <ClientChatBox
                  currentUserId={currentUser.id}
                  selectedUserId={selectedUser.id}
                  initialMessages={messages || []}
                />
              </>
            ) : (
              <div className="flex min-h-[620px] items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950/80">
                <div className="text-center">
                  <p className="text-5xl">💬</p>
                  <h2 className="mt-4 text-2xl font-black">Select a trader</h2>
                  <p className="mt-2 text-zinc-500">
                    Choose someone from the left to start messaging.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}