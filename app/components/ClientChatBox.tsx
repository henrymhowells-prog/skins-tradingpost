"use client";

import { useEffect, useRef, useState } from "react";

export default function ClientChatBox({
  currentUserId,
  selectedUserId,
  initialMessages,
}: {
  currentUserId: string;
  selectedUserId: string;
  initialMessages: any[];
}) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior });
    }, 30);
  }

  useEffect(() => {
    setMessages(initialMessages || []);
    scrollToBottom("auto");
  }, [selectedUserId, initialMessages]);

  useEffect(() => {
    async function fetchMessages() {
      const response = await fetch(
        `/api/messages/thread?user=${selectedUserId}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      if (!data.messages) return;

      setMessages((current) => {
        const currentIds = new Set(current.map((msg: any) => String(msg.id)));
        const hasNewMessage = data.messages.some(
          (msg: any) => !currentIds.has(String(msg.id))
        );

        if (!hasNewMessage && data.messages.length === current.length) {
          return current;
        }

        return data.messages;
      });
    }

    pollTimer.current = setInterval(fetchMessages, 2500);

    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
      }
    };
  }, [selectedUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage) return;

    setError("");

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      id: tempId,
      sender_id: currentUserId,
      receiver_id: selectedUserId,
      message: cleanMessage,
      created_at: new Date().toISOString(),
      pending: true,
    };

    setMessages((current) => [...current, optimisticMessage]);
    setMessage("");
    scrollToBottom();

    setSending(true);

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver_id: selectedUserId,
          message: cleanMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Message failed to send.");
        setMessages((current) => current.filter((msg) => msg.id !== tempId));
        return;
      }

      if (data.message) {
        setMessages((current) =>
          current.map((msg) => (msg.id === tempId ? data.message : msg))
        );
      }
    } catch {
      setError("Message failed to send.");
      setMessages((current) => current.filter((msg) => msg.id !== tempId));
    } finally {
      setSending(false);
      scrollToBottom();
    }
  }

  return (
    <>
      <div className="mt-6 max-h-[560px] min-h-[460px] space-y-4 overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950/80 text-zinc-500">
            No messages yet. Start the conversation.
          </div>
        ) : (
          messages.map((msg: any) => {
            const mine = msg.sender_id === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-5 py-3 shadow ${
                    mine
                      ? "bg-orange-500 text-black"
                      : "bg-zinc-800 text-white"
                  } ${msg.pending ? "opacity-70" : ""}`}
                >
                  <p>{msg.message}</p>

                  {msg.created_at && (
                    <p
                      className={`mt-2 text-xs ${
                        mine ? "text-black/60" : "text-zinc-500"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleString()}
                      {msg.pending ? " • sending..." : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={sendMessage} className="mt-6 flex gap-3">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
        />

        <button
          type="submit"
          className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-black hover:bg-orange-400 disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </>
  );
}