import { redirect } from "next/navigation";
import { supabase } from "./supabase";
import { createSupabaseServerClient } from "./supabaseServer";

export async function getCurrentUser() {
  const supabaseServer = await createSupabaseServerClient();

  const {
    data: { user: authUser },
    error,
  } = await supabaseServer.auth.getUser();

  if (error || !authUser) {
    return null;
  }

  const { data: emailUser } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (!emailUser) {
    const { data: createdUser } = await supabase
      .from("users")
      .insert({
        auth_user_id: authUser.id,
        email: authUser.email,
        username: authUser.email?.split("@")[0] || "Trader",
        role: "user",
        average_rating: 5,
        review_count: 0,
        trade_count: 0,
      })
      .select("*")
      .single();

    return createdUser || null;
  }

  if (emailUser.is_banned) {
    redirect("/banned");
  }

  return emailUser;
}