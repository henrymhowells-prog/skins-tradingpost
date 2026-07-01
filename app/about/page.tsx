import AppShell from "../components/AppShell";
import PageBackground from "../components/PageBackground";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AboutPage() {
  return (
    <AppShell>
      <PageBackground leftOffset={256} />

      <div className="relative z-10">
        <div className="rounded-[32px] border border-zinc-800 bg-black/80 p-10 backdrop-blur">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-400">
            About
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Welcome to Skins TradingPost
          </h1>

          <p className="mt-5 max-w-4xl text-lg leading-8 text-zinc-300">
            Skins TradingPost was created by a CS2 trader who wanted a better
            way to find and organise skin trades. Instead of relying on dozens
            of Discord servers, Steam comments and scattered communities, the
            goal is to bring everything together in one simple platform.
          </p>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <Section
            title="Our Mission"
            colour="orange"
          >
            <p>
              Our mission is simple:
            </p>

            <p className="mt-4 font-bold text-white">
              Help Counter-Strike traders find each other faster while keeping
              trading safe and straightforward.
            </p>

            <p className="mt-4">
              Skins TradingPost does not act as a middleman and never holds your
              skins. Every trade is completed using Steam's official trading
              system.
            </p>
          </Section>

          <Section
            title="Built for Traders"
            colour="blue"
          >
            <ul className="space-y-3">
              <li>✓ Trade Listings</li>
              <li>✓ Advanced Trade Search</li>
              <li>✓ Steam Inventory Sync</li>
              <li>✓ Saved Trades</li>
              <li>✓ Private Messaging</li>
              <li>✓ Reviews & Reputation</li>
              <li>✓ Notifications</li>
            </ul>
          </Section>
        </div>

        <div className="mt-8 rounded-[32px] border border-orange-500/30 bg-orange-500/10 p-8">
          <h2 className="text-3xl font-black text-orange-400">
            Your Security Comes First
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <TrustCard
              title="We NEVER ask for your Steam password."
            />

            <TrustCard
              title="We NEVER ask you to send skins to a bot."
            />

            <TrustCard
              title="We NEVER ask for Steam Guard codes."
            />

            <TrustCard
              title="All trades happen through Steam."
            />
          </div>
        </div>

        <div className="mt-8 rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
          <h2 className="text-3xl font-black">
            Community Driven
          </h2>

          <p className="mt-5 max-w-4xl text-zinc-300 leading-8">
            Skins TradingPost is an independent project that is actively being
            improved. Every piece of feedback, bug report and feature request
            helps shape the platform.
          </p>

          <p className="mt-5 max-w-4xl text-zinc-300 leading-8">
            Whether you're trading your first skin or your thousandth, thank you
            for giving Skins TradingPost a chance.
          </p>
        </div>

        <div className="mt-8 rounded-[32px] border border-blue-800 bg-blue-900/40 p-8">
          <h2 className="text-3xl font-black">
            Contact
          </h2>

          <p className="mt-5 text-zinc-300">
            Questions, suggestions or business enquiries?
          </p>

          <p className="mt-3 text-xl font-bold text-orange-400">
            skinstradingpost@outlook.com
          </p>

          <a
            href="/contact"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold text-black hover:bg-orange-400"
          >
            Contact Us
          </a>
        </div>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  colour,
  children,
}: {
  title: string;
  colour: "orange" | "blue";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-[32px] border p-8 backdrop-blur ${
        colour === "orange"
          ? "border-orange-500/30 bg-black/80"
          : "border-blue-700/40 bg-black/80"
      }`}
    >
      <h2
        className={`text-3xl font-black ${
          colour === "orange"
            ? "text-orange-400"
            : "text-blue-400"
        }`}
      >
        {title}
      </h2>

      <div className="mt-6 space-y-4 text-zinc-300 leading-8">
        {children}
      </div>
    </div>
  );
}

function TrustCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/50 p-5">
      <p className="font-bold text-white">
        ✓ {title}
      </p>
    </div>
  );
}