import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { getCurrentUser } from "../../../lib/currentUser";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const userId = String(searchParams.get("user") || "");

  if (!currentUser || !userId) {
    return NextResponse.json({ messages: [] });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    messages: [...(data || [])].reverse(),
  });
}