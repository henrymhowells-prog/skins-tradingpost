"use client";

import { useState } from "react";

type InventoryItem = {
  id: string;
  item_name: string;
};

export default function InventoryItemPicker({
  items,
}: {
  items: InventoryItem[];
}) {
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(search.toLowerCase())
  );

  function addItem(itemName: string) {
    if (selectedItems.length >= 10) return;
    if (selectedItems.includes(itemName)) return;

    setSelectedItems([...selectedItems, itemName]);
    setSearch("");
  }

  function removeItem(itemName: string) {
    setSelectedItems(selectedItems.filter((item) => item !== itemName));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">You Give</h3>
        <span className="text-sm text-zinc-400">
          {selectedItems.length}/10 selected
        </span>
      </div>

      <p className="mt-1 text-sm text-zinc-500">
        Search and select items from your inventory.
      </p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your inventory..."
        className="mt-5 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-orange-500"
      />

      {search && (
        <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addItem(item.item_name)}
              className="block w-full px-4 py-3 text-left hover:bg-zinc-800"
            >
              {item.item_name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {selectedItems.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 rounded-full bg-orange-500 px-3 py-2 text-sm font-semibold text-black"
          >
            <span>{item}</span>
            <button type="button" onClick={() => removeItem(item)}>
              ×
            </button>
            <input type="hidden" name="offer_items" value={item} />
          </div>
        ))}
      </div>
    </div>
  );
}