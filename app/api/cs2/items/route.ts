import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

type CS2ImportItem = {
  item_name: string;
  weapon_type: string | null;
  rarity: string | null;
  image_url: string | null;
};

async function fetchJson(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return response.json();
}

function normalizeItem(
  item: any,
  fallbackType: string
): CS2ImportItem | null {
  const itemName =
    item.market_hash_name ||
    item.name ||
    item.localized_name ||
    item.item_name;

  if (!itemName) return null;

  return {
    item_name: itemName,
    weapon_type:
      item.weapon?.name ||
      item.category?.name ||
      item.type ||
      fallbackType,
    rarity: item.rarity?.name || item.rarity || null,
    image_url: item.image || item.icon_url || null,
  };
}

export async function GET() {
  try {
    const baseUrl =
      "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en";

    const datasets = [
      { url: `${baseUrl}/skins_not_grouped.json`, type: "Skin" },
      { url: `${baseUrl}/stickers.json`, type: "Sticker" },
      { url: `${baseUrl}/crates.json`, type: "Case" },
      { url: `${baseUrl}/music_kits.json`, type: "Music Kit" },
      { url: `${baseUrl}/agents.json`, type: "Agent" },
      { url: `${baseUrl}/patches.json`, type: "Patch" },
      { url: `${baseUrl}/collectibles.json`, type: "Collectible" },
    ];

    const allItems: CS2ImportItem[] = [];

    for (const dataset of datasets) {
      const data = await fetchJson(dataset.url);

      const normalizedItems = data
        .map((item: any) => normalizeItem(item, dataset.type))
        .filter(Boolean) as CS2ImportItem[];

      allItems.push(...normalizedItems);
    }

    const uniqueItems = Array.from(
      new Map(allItems.map((item) => [item.item_name, item])).values()
    );

    await supabase
      .from("cs2_items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    const batchSize = 500;

    for (let i = 0; i < uniqueItems.length; i += batchSize) {
      const batch = uniqueItems.slice(i, i + batchSize);

      const { error } = await supabase
        .from("cs2_items")
        .upsert(batch, { onConflict: "item_name" });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      imported: uniqueItems.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to import CS2 items" },
      { status: 500 }
    );
  }
}