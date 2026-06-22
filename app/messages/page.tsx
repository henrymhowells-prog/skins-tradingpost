import { revalidatePath } from "next/cache";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function sendMessage(formData: FormData) {
  "use server";

  const receiverId = String(formData.get("receiver_id") || "");
  const message = String(formData.get("message") || "").trim();

  if (!receiverId || !message) return;

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You must be signed in with Steam to send messages.");
  }

  const { error: messageError } = await supabase.from("messages").insert({
    sender_id: currentUser.id,
    receiver_id: receiverId,
    message,
    read: false,
  });

  if (messageError) {
    throw new Error(messageError.message);
  }

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: receiverId,
      title: "New Message",
      body: `${
        currentUser.steam_name || currentUser.username || "A trader"
      } sent you a message.`,
      read: false,
    });

  if (notificationError) {
    throw new Error(notificationError.message);
  }

  revalidatePath("/messages");
  revalidatePath("/notifications");
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
        <PageBackground />

        <div className="relative z-10">
          <h1 className="text-5xl font-bold">Please sign in with Steam</h1>

          <a
            href="/api/auth/steam/login"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
          >
            Sign in with Steam
          </a>
        </div>
      </AppShell>
    );
  }

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .neq("id", currentUser.id);

  if (selectedUserId) {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", selectedUserId)
      .eq("receiver_id", currentUser.id)
      .eq("read", false);
  }

  const selectedUser =
    (users || []).find((user) => user.id === selectedUserId) || null;

  const { data: messages } = selectedUserId
    ? await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true })
    : { data: [] };

  return (
    <AppShell>
      <PageBackground />

      <div className="relative z-10">
        <h1 className="text-5xl font-bold">Messages</h1>

        <p className="mt-3 text-zinc-300">
          Message traders about listings, offers, and active trades.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="rounded-3xl border border-zinc-800 bg-black/80 p-5 backdrop-blur">
            <h2 className="text-2xl font-bold">Traders</h2>

            <div className="mt-5 max-h-[680px] space-y-3 overflow-y-auto pr-1">
              {(users || []).length === 0 ? (
                <p className="text-sm text-zinc-500">No traders found.</p>
              ) : (
                (users || []).map((user) => (
                  <a
                    key={user.id}
                    href={`/messages?user=${user.id}`}
                    className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
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
                      className="h-11 w-11 rounded-full"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-bold">
                        {user.steam_name || user.username || "Unknown User"}
                      </p>

                      <p className="text-xs text-zinc-500">
                        ⭐ {user.average_rating || 0} ({user.review_count || 0})
                      </p>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-black/80 p-6 backdrop-blur">
            {selectedUser ? (
              <>
                <div className="flex items-center gap-4 border-b border-zinc-800 pb-5">
                  <img
                    src={
                      selectedUser.avatar_url ||
                      selectedUser.steam_avatar ||
                      "https://avatars.githubusercontent.com/u/9919?s=200&v=4"
                    }
                    alt={selectedUser.steam_name || selectedUser.username || "Trader"}
                    className="h-16 w-16 rounded-full"
                  />

                  <div>
                    <h2 className="text-3xl font-bold">
                      {selectedUser.steam_name ||
                        selectedUser.username ||
                        "Unknown User"}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                      ⭐ {selectedUser.average_rating || 0} (
                      {selectedUser.review_count || 0} reviews)
                    </p>
                  </div>
                </div>

                <div className="mt-6 min-h-[460px] space-y-4">
                  {(messages || []).length === 0 ? (
                    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950/80 text-zinc-500">
                      No messages yet. Start the conversation.
                    </div>
                  ) : (
                    messages?.map((msg) => {
                      const mine = msg.sender_id === currentUser.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            mine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-5 py-3 shadow ${
                              mine
                                ? "bg-orange-500 text-black"
                                : "bg-zinc-800 text-white"
                            }`}
                          >
                            <p>{msg.message}</p>

                            {msg.created_at && (
                              <p
                                className={`mt-2 text-xs ${
                                  mine ? "text-black/60" : "text-zinc-500"
                                }`}
                              >
                                {new Date(msg.created_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form action={sendMessage} className="mt-6 flex gap-3">
                  <input
                    type="hidden"
                    name="receiver_id"
                    value={selectedUser.id}
                  />

                  <input
                    name="message"
                    required
                    placeholder="Type your message..."
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
                  />

                  <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex min-h-[620px] items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950/80">
                <div className="text-center">
                  <p className="text-5xl">💬</p>
                  <h2 className="mt-4 text-2xl font-bold">
                    Select a trader
                  </h2>
                  <p className="mt-2 text-zinc-500">
                    Choose someone from the left to start messaging.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}