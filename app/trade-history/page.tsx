import AppShell from "../components/AppShell";

export default function TradeHistoryPage() {
  return (
    <AppShell>
      <h1 className="text-4xl font-bold">Trade History</h1>

      <p className="mt-2 text-zinc-400">
        View your completed and cancelled trades.
      </p>

      <div className="mt-8 space-y-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="font-bold text-green-400">
            Completed Trade
          </h2>

          <p className="mt-2 text-zinc-400">
            AK-47 | Redline ↔ AWP | Asiimov
          </p>

          <p className="mt-3 text-sm text-zinc-500">
            Completed 2 days ago
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="font-bold text-red-400">
            Cancelled Trade
          </h2>

          <p className="mt-2 text-zinc-400">
            M4A1-S | Printstream ↔ Desert Eagle | Printstream
          </p>

          <p className="mt-3 text-sm text-zinc-500">
            Cancelled 5 days ago
          </p>
        </div>
      </div>
    </AppShell>
  );
}