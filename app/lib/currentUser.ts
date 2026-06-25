import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "./supabase";
import { createSupabaseServerClient } from "./supabaseServer";

export async function getCurrentUser() {
  const supabaseServer = await createSupabaseServerClient();

  const {
    data: { user: authUser },
  } = await supabaseServer.auth.getUser();

  if (authUser) {
    const { data: emailUser } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", authUser.id)
      .single();

    if (emailUser?.is_banned) {
      redirect("/banned");
    }

    return emailUser || null;
  }

  const cookieStore = await cookies();
  const steamId = cookieStore.get("steam_id")?.value;

  if (steamId) {
    const { data: steamUser } = await supabase
      .from("users")
      .select("*")
      .eq("steam_id", steamId)
      .single();

    if (steamUser?.is_banned) {
      redirect("/banned");
    }

    return steamUser || null;
  }

  return null;
}