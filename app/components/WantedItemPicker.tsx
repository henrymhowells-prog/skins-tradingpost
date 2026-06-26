"use client";

import { useEffect, useState } from "react";

type CS2Item = {
  id: string;
  item_name: string;
  weapon_type: string | null;
  rarity: string | null;
  image_url: string | null;
};

type SelectedItem = {
  item_name: string;
  float_min: string;
  float_max: string;
  pattern_seed: string;
  advanced_open: boolean;
};

export default function WantedItemPicker({
  mode = "wanted",
}: {
  mode?: "give" | "wanted";
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CS2Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const cleanedSearch = search.trim();

  const isGive = mode === "give";
  const prefix = isGive ? "give" : "wanted";
  const color = isGive ? "orange" : "blue";

  useEffect(() => {
    if (cleanedSearch.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/cs2/search?q=${encodeURIComponent(cleanedSearch)}`
        );

        const data = await response.json();
        setResults(data.items || []);
      } catch {
        setResults([]);
      }

      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [cleanedSearch]);

  function toggleItem(itemName: string) {
    const alreadySelected = selectedItems.some(
      (item) => item.item_name === itemName
    );

    if (alreadySelected) {
      setSelectedItems(
        selectedItems.filter((item) => item.item_name !== itemName)
      );
      return;
    }

    if (selectedItems.length >= 10) return;

    setSelectedItems([
      ...selectedItems,
      {
        item_name: itemName,
        float_min: "",
        float_max: "",
        pattern_seed: "",
        advanced_open: false,
      },
    ]);
  }

  function updateSelectedItem(
    itemName: string,
    field: "float_min" | "float_max" | "pattern_seed" | "advanced_open",
    value: string | boolean
  ) {
    setSelectedItems(
      selectedItems.map((item) =>
        item.item_name === itemName ? { ...item, [field]: value } : item
      )
    );
  }

  const selectedClass = isGive
    ? "border-orange-500 bg-orange-500/10"
    : "border-blue-500 bg-blue-500/10";

  const hoverClass = isGive ? "hover:border-orange-500" : "hover:border-blue-500";
  const textClass = isGive ? "text-orange-400" : "text-blue-400";
  const focusClass = isGive ? "focus:border-orange-500" : "focus:border-blue-500";

  return (
    <>
      {selectedItems.map((item) => (
        <div key={item.item_name}>
          <input type="hidden" name={`${prefix}_items`} value={item.item_name} />
          <input type="hidden" name={`${prefix}_float_min`} value={item.float_min} />
          <input type="hidden" name={`${prefix}_float_max`} value={item.float_max} />
          <input
            type="hidden"
            name={`${prefix}_pattern_seed`}
            value={item.pattern_seed}
          />
        </div>
      ))}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search any CS2 item..."
        className={`mt-5 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none ${focusClass}`}
      />

      <p className="mt-3 text-sm text-zinc-500">
        {selectedItems.length}/10 {isGive ? "give" : "wanted"} items selected
      </p>

      {selectedItems.length > 0 && (
        <div className="mt-5 space-y-3">
          {selectedItems.map((item) => (
            <div
              key={item.item_name}
              className={`rounded-xl border p-4 ${selectedClass}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">{item.item_name}</p>

                <button
                  type="button"
                  onClick={() => toggleItem(item.item_name)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateSelectedItem(
                    item.item_name,
                    "advanced_open",
                    !item.advanced_open
                  )
                }
                className={`mt-3 text-sm ${textClass} hover:opacity-80`}
              >
                {item.advanced_open
                  ? "Hide Advanced Options"
                  : "Show Advanced Options"}
              </button>

              {item.advanced_open && (
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <input
                    type="number"
                    min="0"
                    max="0.999999"
                    step="0.000001"
                    value={item.float_min}
                    onChange={(e) =>
                      updateSelectedItem(
                        item.item_name,
                        "float_min",
                        e.target.value
                      )
                    }
                    placeholder="Float min"
                    className={`rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ${focusClass}`}
                  />

                  <input
                    type="number"
                    min="0"
                    max="0.999999"
                    step="0.000001"
                    value={item.float_max}
                    onChange={(e) =>
                      updateSelectedItem(
                        item.item_name,
                        "float_max",
                        e.target.value
                      )
                    }
                    placeholder="Float max"
                    className={`rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ${focusClass}`}
                  />

                  <input
                    type="number"
                    min="0"
                    max="1000"
                    step="1"
                    value={item.pattern_seed}
                    onChange={(e) =>
                      updateSelectedItem(
                        item.item_name,
                        "pattern_seed",
                        e.target.value
                      )
                    }
                    placeholder="Pattern"
                    className={`rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ${focusClass}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {cleanedSearch.length < 2 ? (
        <p className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
          Start typing to search all CS2 items.
        </p>
      ) : (
        <>
          <p className="mt-4 text-xs text-zinc-500">
            {loading ? "Searching..." : "Showing up to 60 results."}
          </p>

          <div className="mt-3 grid max-h-[520px] gap-3 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => {
              const selected = selectedItems.some(
                (selectedItem) => selectedItem.item_name === item.item_name
              );

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.item_name)}
                  className={`rounded-xl border p-3 text-left ${
                    selected
                      ? selectedClass
                      : `border-zinc-800 bg-zinc-900 ${hoverClass}`
                  }`}
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

                  <p className="line-clamp-2 text-sm font-bold">
                    {item.item_name}
                  </p>

                  <p className="mt-2 text-xs text-zinc-400">
                    {item.weapon_type || "CS2 Item"}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {item.rarity || "Unknown Rarity"}
                  </p>
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}