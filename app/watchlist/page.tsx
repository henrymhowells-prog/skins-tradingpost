import AppShell from "../components/AppShell";

export default function WatchlistPage() {
  const watchlist = [
    "Karambit | Doppler",
    "Butterfly Knife | Fade",
    "AWP | Dragon Lore",
    "Sport Gloves | Vice",
  ];

  return (
    <AppShell>
      <h1 className="text-4xl font-bold">Watchlist</h1>

      <p className="mt-2 text-zinc-400">
        Get notified when traders list items you're interested in.
      </p>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-2xl font-bold">Add Item</h2>

        <div className="mt-5 flex gap-3">
          <input
            placeholder="Enter item name..."
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
          />

          <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400">
            Add
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {watchlist.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <h2 className="font-bold">{item}</h2>

            <button className="mt-4 rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800">
              Remove
            </button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}