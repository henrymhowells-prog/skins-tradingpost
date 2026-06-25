import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";
import { getCurrentUser } from "../../lib/currentUser";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const userId = String(searchParams.get("user") || "");

  if (!currentUser || !userId) {
    return NextResponse.redirect(new URL("/messages", request.url));
  }

  await supabase
    .from("messages")
    .update({ read: true })
    .eq("sender_id", userId)
    .eq("receiver_id", currentUser.id)
    .eq("read", false);

  return NextResponse.redirect(new URL(`/messages?user=${userId}`, request.url));
}