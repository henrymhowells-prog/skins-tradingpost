import { redirect } from "next/navigation";
import { supabase } from "./supabase";
import { createSupabaseServerClient } from "./supabaseServer";

export async function getCurrentUser() {
  const supabaseServer = await createSupabaseServerClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabaseServer.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const { data: emailUser, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (userError) {
    console.error("Get current user error:", userError);
    return null;
  }

  if (!emailUser) {
    const { data: createdUser, error: createError } = await supabase
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

    if (createError) {
      console.error("Create current user error:", createError);
      return null;
    }

    return createdUser || null;
  }

  if (emailUser.is_banned) {
    redirect("/banned");
  }

  return emailUser;
}