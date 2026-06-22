"use client";

import { useState } from "react";

type InventoryItem = {
  id: string;
  item_name: string;
  image_url: string | null;
  inspect_link: string | null;
  tradable: boolean | null;
};

export default function InventorySearchGrid({
  items,
}: {
  items: InventoryItem[];
}) {
  const [search, setSearch] = useState("");

  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your inventory..."
        className="mt-8 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-orange-500"
      />

      <p className="mt-3 text-sm text-zinc-500">
        Showing {filteredItems.length} of {items.length} items
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-3"
          >
            <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-zinc-800">
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

            <h2 className="line-clamp-2 min-h-10 text-sm font-bold">
              {item.item_name}
            </h2>

            <p className="mt-2 text-xs">
              {item.tradable ? (
                <span className="text-green-400">Tradable</span>
              ) : (
                <span className="text-red-400">Not Tradable</span>
              )}
            </p>

            {item.inspect_link ? (
              <a
                href={item.inspect_link}
                className="mt-3 inline-block w-full rounded-lg bg-orange-500 px-3 py-2 text-center text-xs font-semibold text-black hover:bg-orange-400"
              >
                Inspect
              </a>
            ) : (
              <button
                disabled
                className="mt-3 w-full rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-500"
              >
                No Inspect
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}