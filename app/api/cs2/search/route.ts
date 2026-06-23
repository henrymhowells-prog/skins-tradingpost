import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const { data, error } = await supabase
    .from("cs2_items")
    .select("id, item_name, image_url, weapon_type, rarity")
    .ilike("item_name", `%${q}%`)
    .order("item_name")
    .limit(60);

  if (error) {
    return NextResponse.json({ items: [] }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}