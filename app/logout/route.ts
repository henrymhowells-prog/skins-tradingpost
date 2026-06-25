import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../lib/supabaseServer";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set("steam_id", "", {
    path: "/",
    expires: new Date(0),
  });

  return response;
}