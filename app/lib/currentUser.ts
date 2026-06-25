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
      .maybeSingle();

    if (emailUser?.is_banned) {
      redirect("/banned");
    }

    return emailUser || null;
  }

  return null;
}