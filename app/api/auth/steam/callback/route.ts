import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { createSupabaseServerClient } from "../../../../lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const claimedId = url.searchParams.get("openid.claimed_id");

  if (!claimedId) {
    return NextResponse.json(
      { error: "No Steam ID received" },
      { status: 400 }
    );
  }

  const steamId = claimedId.split("/").pop();

  if (!steamId) {
    return NextResponse.json(
      { error: "Invalid Steam ID" },
      { status: 400 }
    );
  }

  const steamApiKey = process.env.STEAM_API_KEY;

  if (!steamApiKey) {
    return NextResponse.json(
      { error: "Missing STEAM_API_KEY" },
      { status: 500 }
    );
  }

  const steamResponse = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamId}`,
    { cache: "no-store" }
  );

  const steamData = await steamResponse.json();
  const player = steamData.response.players[0];

  if (!player) {
    return NextResponse.json(
      { error: "Steam profile not found" },
      { status: 404 }
    );
  }

  const supabaseServer = await createSupabaseServerClient();

  const {
    data: { user: authUser },
  } = await supabaseServer.auth.getUser();

  if (authUser) {
    const { data: existingSteamUser } = await supabase
      .from("users")
      .select("id")
      .eq("steam_id", steamId)
      .neq("auth_user_id", authUser.id)
      .maybeSingle();

    if (existingSteamUser) {
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
      return NextResponse.json(
        { error: linkError.message },
        { status: 500 }
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

  const { error } = await supabase.from("users").upsert(
    {
      steam_id: steamId,
      username: player.personaname,
      steam_name: player.personaname,
      avatar_url: player.avatarfull,
      steam_avatar: player.avatarfull,
      profile_url: player.profileurl,
      steam_profile_url: player.profileurl,
      average_rating: 5,
      review_count: 0,
      trade_count: 0,
      role: "user",
    },
    {
      onConflict: "steam_id",
    }
  );

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));

  response.cookies.set("steam_id", steamId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}