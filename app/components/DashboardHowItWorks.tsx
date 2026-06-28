"use client";

import { useState } from "react";

export default function DashboardHowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 text-left transition hover:border-orange-500 hover:bg-zinc-900"
      >
        <h3 className="text-2xl font-black text-white">
          How Skins TradingPost Works
        </h3>

        <p className="mt-3 text-zinc-400">
          Learn how the platform works, how to create listings, find traders,
          stay safe and complete your trades through Steam.
        </p>

        <p className="mt-5 font-bold text-orange-400">
          Click to learn more →
        </p>
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6 backdrop-blur">
          <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-zinc-800 bg-zinc-950 p-10 shadow-2xl">

            <button
              onClick={() => setOpen(false)}
              className="absolute right-8 top-8 rounded-xl border border-zinc-700 px-4 py-2 font-bold text-zinc-300 hover:bg-zinc-800"
            >
              ✕
            </button>

            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
              Welcome
            </p>

            <h1 className="mt-2 text-5xl font-black text-white">
              How Skins TradingPost Works
            </h1>

            <p className="mt-6 max-w-4xl text-lg leading-8 text-zinc-300">
              Skins TradingPost is designed to help Counter-Strike traders find
              each other quickly and safely. The website does not hold skins,
              trade offers or money. Once you find another trader, all trades
              are completed directly through Steam.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-2">

              <InfoCard
                number="01"
                title="Create an Account"
                text="Create your account using your email address. Linking your Steam account is optional and can be done later from Settings."
              />

              <InfoCard
                number="02"
                title="Create Listings"
                text="List the skins you are offering and the skins you are looking for. You can also use placeholders like Item Overpay or Offers Accepted."
              />

              <InfoCard
                number="03"
                title="Search Trades"
                text="Browse thousands of listings using filters such as weapon, rarity, StatTrak™, Souvenir and much more."
              />

              <InfoCard
                number="04"
                title="Message Traders"
                text="Found a trade you like? Send the trader a message directly through the built-in messaging system."
              />

              <InfoCard
                number="05"
                title="Trade Through Steam"
                text="Once both traders agree, complete the trade using Steam's official trading system."
              />

              <InfoCard
                number="06"
                title="Stay Safe"
                text="Always verify Steam profiles, double-check every item in the trade offer and report suspicious users."
              />

            </div>

            <div className="mt-12 rounded-3xl border border-orange-500/40 bg-orange-500/10 p-8">
              <h2 className="text-2xl font-black text-orange-400">
                Important
              </h2>

              <p className="mt-4 leading-8 text-zinc-300">
                Skins TradingPost is a listing platform only. We never hold your
                items, participate in trades or act as a middleman. Every trade
                is completed directly through Steam between the two traders.
              </p>
            </div>
                        <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/listings"
                className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-black hover:bg-orange-400"
              >
                Create a Trade
              </a>

              <a
                href="/search-trades"
                className="rounded-xl border border-zinc-700 px-6 py-3 font-bold text-white hover:bg-zinc-800"
              >
                Search Trades
              </a>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-zinc-700 px-6 py-3 font-bold text-zinc-300 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

function InfoCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black/60 p-6 transition hover:border-orange-500/40">
      <p className="text-sm font-black tracking-widest text-orange-400">
        {number}
      </p>

      <h3 className="mt-3 text-2xl font-black text-white">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-zinc-400">
        {text}
      </p>
    </div>
  );
}