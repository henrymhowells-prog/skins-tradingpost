export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 p-4">
        <h1 className="text-2xl font-bold">CS2 TradingPost</h1>
      </nav>

      <div className="p-8">
        <h2 className="text-3xl font-bold">Dashboard</h2>

        <p className="mt-2 text-zinc-400">
          Welcome to your trading dashboard.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <a
            href="/inventory"
            className="rounded-xl bg-zinc-900 p-6 transition hover:bg-zinc-800"
          >
            <h3 className="font-bold text-lg">My Inventory</h3>
            <p className="mt-2 text-zinc-400">
              View and manage your CS2 skins.
            </p>
          </a>

          <a
            href="/listings"
            className="rounded-xl bg-zinc-900 p-6 transition hover:bg-zinc-800"
          >
            <h3 className="font-bold text-lg">My Listings</h3>
            <p className="mt-2 text-zinc-400">
              Create and manage trade listings.
            </p>
          </a>

          <a
            href="/search"
            className="rounded-xl bg-zinc-900 p-6 transition hover:bg-zinc-800"
          >
            <h3 className="font-bold text-lg">Matches</h3>
            <p className="mt-2 text-zinc-400">
              Find players looking for your items.
            </p>
          </a>
        </div>
      </div>
    </main>
  );
}