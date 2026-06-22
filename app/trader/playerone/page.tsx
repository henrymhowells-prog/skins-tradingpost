import AppShell from "../../components/AppShell";

export default function TraderProfilePage() {
  const listings = [
    {
      title: "AK Package for AWP",
      giving: ["AWP | Asiimov"],
      wanting: ["AK-47 | Redline", "USP-S | Kill Confirmed"],
      overpay: "Looking for 5-10% overpay",
    },
    {
      title: "Printstream Swap",
      giving: ["Desert Eagle | Printstream", "AK-47 | Vulcan"],
      wanting: ["M4A1-S | Printstream"],
      overpay: "No overpay required",
    },
  ];

  return (
    <AppShell>
      <h1 className="text-4xl font-bold">Trader Profile</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-500 text-4xl font-bold text-black">
            P
          </div>

          <h2 className="mt-5 text-2xl font-bold">PlayerOne</h2>
          <p className="text-zinc-400">Steam profile placeholder</p>

          <div className="mt-6 space-y-3 text-sm">
            <p>Trust Score: <span className="text-green-400">4.9</span></p>
            <p>Completed Trades: 128</p>
            <p>Positive Reviews: 124</p>
            <p>Negative Reviews: 2</p>
            <p>Member Since: 2026</p>
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href="/messages"
              className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
            >
              Message
            </a>

            <button className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800">
              Report
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 lg:col-span-2">
          <h2 className="text-2xl font-bold">Active Listings</h2>

          <div className="mt-6 space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.title}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <h3 className="text-xl font-bold">{listing.title}</h3>

                <div className="mt-5 grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-sm text-zinc-400">They Give</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {listing.giving.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-zinc-900 px-3 py-2 text-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400">They Want</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {listing.wanting.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-zinc-900 px-3 py-2 text-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm text-zinc-400">
                  Item Overpay: {listing.overpay}
                </p>

                <a
                  href="/trade"
                  className="mt-5 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
                >
                  View Trade
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}