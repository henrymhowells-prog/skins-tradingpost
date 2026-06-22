import { cookies } from "next/headers";
import { supabase } from "./supabase";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const steamId = cookieStore.get("steam_id")?.value;

  if (!steamId) {
    return null;
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("steam_id", steamId)
    .single();

  return user;
}