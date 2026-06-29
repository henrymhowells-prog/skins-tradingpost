"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export default function LiveChatBox({
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
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${currentUserId}-${selectedUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage: any = payload.new;

          const belongsToConversation =
            (newMessage.sender_id === currentUserId &&
              newMessage.receiver_id === selectedUserId) ||
            (newMessage.sender_id === selectedUserId &&
              newMessage.receiver_id === currentUserId);

          if (!belongsToConversation) return;

          setMessages((current) => {
            if (current.some((msg) => msg.id === newMessage.id)) return current;
            return [...current, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedUserId]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMessage = message.trim();
    if (!cleanMessage) return;

    setError("");

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
      return;
    }

    setMessage("");

    if (data.message) {
      setMessages((current) => {
        if (current.some((msg) => msg.id === data.message.id)) return current;
        return [...current, data.message];
      });
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
          messages.map((msg) => {
            const mine = msg.sender_id === currentUserId;

            return (
              <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-5 py-3 shadow ${
                    mine ? "bg-orange-500 text-black" : "bg-zinc-800 text-white"
                  }`}
                >
                  <p>{msg.message}</p>

                  {msg.created_at && (
                    <p className={`mt-2 text-xs ${mine ? "text-black/60" : "text-zinc-500"}`}>
                      {new Date(msg.created_at).toLocaleString()}
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
          className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-black hover:bg-orange-400"
        >
          Send
        </button>
      </form>
    </>
  );
}