import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET() {
  const steamId = "76561198445694858";

  const url = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Could not fetch Steam inventory" },
      { status: 500 }
    );
  }

  const data = await response.json();

  const descriptions = data.descriptions || [];
  const assets = data.assets || [];

  const items = assets.map((asset: any) => {
    const description = descriptions.find(
      (desc: any) =>
        desc.classid === asset.classid &&
        desc.instanceid === asset.instanceid
    );

    const inspectAction = description?.actions?.[0];
    const inspectLink = inspectAction?.link || null;

    return {
      item_name: description?.market_hash_name || "Unknown Item",
      image_url: description?.icon_url
        ? `https://community.cloudflare.steamstatic.com/economy/image/${description.icon_url}`
        : null,
      steam_asset_id: asset.assetid,
      inspect_link: inspectLink,
      tradable: description?.tradable === 1,
    };
  });

  await supabase
    .from("inventory_items")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const { error } = await supabase.from("inventory_items").insert(items);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    imported: items.length,
  });
}