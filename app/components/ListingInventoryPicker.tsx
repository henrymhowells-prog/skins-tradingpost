"use client";

import { useState } from "react";

type InventoryItem = {
  id: string;
  item_name: string;
  image_url: string | null;
  tradable: boolean | null;
};

export default function ListingInventoryPicker({
  items,
}: {
  items: InventoryItem[];
}) {
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleItem(itemId: string) {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
      return;
    }

    if (selectedItems.length >= 10) return;

    setSelectedItems([...selectedItems, itemId]);
  }

  return (
    <>
      {selectedItems.map((id) => (
        <input key={id} type="hidden" name="offer_item_ids" value={id} />
      ))}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your inventory..."
        className="mt-5 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-orange-500"
      />

      <p className="mt-3 text-sm text-zinc-500">
        {selectedItems.length}/10 selected
      </p>

      <div className="mt-5 grid max-h-[520px] gap-3 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const selected = selectedItems.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              className={`rounded-xl border p-3 text-left ${
                selected
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-zinc-800 bg-zinc-900 hover:border-orange-500"
              }`}
            >
              <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-zinc-800">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.item_name}
                    className="max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-zinc-500">No Image</span>
                )}
              </div>

              <p className="line-clamp-2 text-sm font-bold">{item.item_name}</p>

              <p className="mt-2 text-xs">
                {item.tradable ? (
                  <span className="text-green-400">Tradable</span>
                ) : (
                  <span className="text-red-400">Not Tradable</span>
                )}
              </p>
            </button>
          );
        })}
      </div>
    </>
  );
}