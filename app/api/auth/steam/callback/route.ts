import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { createSupabaseServerClient } from "../../../../lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const claimedId = url.searchParams.get("openid.claimed_id");

  if (!claimedId) {
    return NextResponse.redirect(
      new URL("/login?error=no_steam_id", request.url)
    );
  }

  const steamId = claimedId.split("/").pop();

  if (!steamId) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_steam_id", request.url)
    );
  }

  const steamApiKey = process.env.STEAM_API_KEY;

  if (!steamApiKey) {
    return NextResponse.redirect(
      new URL("/settings?error=missing_steam_key", request.url)
    );
  }

  const supabaseServer = await createSupabaseServerClient();

  const {
    data: { user: authUser },
  } = await supabaseServer.auth.getUser();

  if (!authUser) {
    return NextResponse.redirect(
      new URL("/login?error=sign_in_before_linking_steam", request.url)
    );
  }

  const steamResponse = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamId}`,
    { cache: "no-store" }
  );

  const steamData = await steamResponse.json();
  const player = steamData.response.players[0];

  if (!player) {
    return NextResponse.redirect(
      new URL("/settings?error=steam_profile_not_found", request.url)
    );
  }

  const { data: existingSteamUser } = await supabase
    .from("users")
    .select("id, auth_user_id")
    .eq("steam_id", steamId)
    .maybeSingle();

  if (existingSteamUser && existingSteamUser.auth_user_id !== authUser.id) {
    return NextResponse.redirect(
      new URL("/settings?error=steam_already_linked", request.url)
    );
  }

  const { error: linkError } = await supabase
    .from("users")
    .update({
      steam_id: steamId,
      steam_name: player.personaname,
      avatar_url: player.avatarfull,
      steam_avatar: player.avatarfull,
      profile_url: player.profileurl,
      steam_profile_url: player.profileurl,
    })
    .eq("auth_user_id", authUser.id);

  if (linkError) {
    return NextResponse.redirect(
      new URL(
        `/settings?error=${encodeURIComponent(linkError.message)}`,
        request.url
      )
    );
  }

  const response = NextResponse.redirect(
    new URL("/settings?linked=steam", request.url)
  );

  response.cookies.set("steam_id", "", {
    expires: new Date(0),
    path: "/",
  });

  return response;
}