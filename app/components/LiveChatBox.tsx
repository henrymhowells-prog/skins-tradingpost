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
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${currentUserId}-${selectedUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newMessage: any = payload.new;

          if (newMessage.sender_id === selectedUserId) {
            setMessages((current) => [...current, newMessage]);
          }
        }
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.userId !== currentUserId) {
          setTyping(true);

          if (typingTimeout.current) clearTimeout(typingTimeout.current);

          typingTimeout.current = setTimeout(() => {
            setTyping(false);
          }, 1800);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedUserId]);

  async function sendMessage() {
    const cleanMessage = message.trim();
    if (!cleanMessage) return;

    setMessage("");

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

    if (data.message) {
      setMessages((current) => [...current, data.message]);
    }
  }

  async function handleTyping(value: string) {
    setMessage(value);

    await supabase
      .channel(`chat-${currentUserId}-${selectedUserId}`)
      .send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId: currentUserId,
        },
      });
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
              <div
                key={msg.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
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

        {typing && (
          <p className="text-sm italic text-zinc-500">Typing...</p>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="mt-6 flex gap-3">
        <input
          value={message}
          onChange={(event) => handleTyping(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type your message..."
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
        />

        <button
          onClick={sendMessage}
          className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-black hover:bg-orange-400"
        >
          Send
        </button>
      </div>
    </>
  );
}