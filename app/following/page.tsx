import AppShell from "../components/AppShell";

export default function FollowingPage() {
  const following = [
    {
      trader: "PlayerOne",
      traderUrl: "/trader/playerone",
      trustScore: "4.9",
      latestListing: "AWP | Asiimov → AK-47 | Redline",
    },
    {
      trader: "KnifeCollector",
      traderUrl: "/trader/playerone",
      trustScore: "5.0",
      latestListing: "Karambit | Doppler → Butterfly Knife | Fade",
    },
  ];

  return (
    <AppShell>
      <h1 className="text-4xl font-bold">Following</h1>

      <p className="mt-2 text-zinc-400">
        Traders you follow and their latest activity.
      </p>

      <div className="mt-8 grid gap-4">
        {following.map((trader) => (
          <div
            key={trader.trader}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <a
              href={trader.traderUrl}
              className="text-xl font-bold text-orange-400 hover:text-orange-300"
            >
              {trader.trader}
            </a>

            <p className="mt-1 text-sm text-green-400">
              Trust Score: {trader.trustScore}
            </p>

            <p className="mt-4 text-zinc-400">
              Latest Listing: {trader.latestListing}
            </p>

            <div className="mt-5 flex gap-3">
              <a
                href={trader.traderUrl}
                className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
              >
                View Profile
              </a>

              <button className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800">
                Unfollow
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}