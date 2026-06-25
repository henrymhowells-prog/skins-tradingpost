import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";
import { getCurrentUser } from "../../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const userId = String(searchParams.get("user") || "");

  if (!currentUser || !userId) {
    return NextResponse.redirect(new URL("/messages", request.url));
  }

  await supabase.rpc("mark_conversation_read", {
    p_current_user_id: currentUser.id,
    p_other_user_id: userId,
  });

  return NextResponse.redirect(
    new URL(`/messages?user=${userId}&opened=${Date.now()}`, request.url)
  );
}