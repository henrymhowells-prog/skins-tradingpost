import AppShell from "../components/AppShell";

export default function TradePage() {
  return (
    <AppShell>
      <h1 className="text-4xl font-bold">Trade</h1>

      <p className="mt-2 text-zinc-400">
        Please open a trade from Search Trades or Listings.
      </p>

      <a
        href="/search trades"
        className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
      >
        Search Trades Trades
      </a>
    </AppShell>
  );
}