import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { getCurrentUser } from "../../../lib/currentUser";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();

  const receiverId = String(body.receiver_id || "");
  const message = String(body.message || "").trim();

  if (!receiverId || !message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: currentUser.id,
      receiver_id: receiverId,
      message,
      read: false,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data });
}