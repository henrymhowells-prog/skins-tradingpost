import { FaDiscord, FaInstagram } from "react-icons/fa";
import { SiTiktok, SiX } from "react-icons/si";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#101114] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle,#050505_2px,transparent_2px)] [background-size:34px_34px] opacity-80" />

      <div className="absolute -left-28 top-0 h-full w-80 -skew-x-12 bg-blue-950" />
      <div className="absolute left-24 bottom-0 h-[46%] w-72 -skew-x-12 bg-blue-800" />

      <div className="absolute -right-24 top-0 h-full w-80 skew-x-12 bg-orange-600" />
      <div className="absolute right-12 top-0 h-full w-24 skew-x-12 bg-orange-500/70" />
      <div className="absolute -right-4 bottom-0 h-[42%] w-8 skew-x-12 bg-black" />

      <p className="absolute right-24 top-14 z-10 text-3xl font-black italic tracking-widest text-white">
        BETA
      </p>

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="mb-4 flex w-[610px] max-w-[68vw] items-center">
          <div className="h-2.5 flex-1 rounded-full bg-orange-500" />
          <div className="h-0 w-0 border-y-[24px] border-l-[36px] border-y-transparent border-l-orange-500" />
        </div>

        <h1
          className="text-center italic"
          style={{
            fontFamily: `"Arial Narrow", Impact, sans-serif`,
            fontWeight: 900,
            fontSize: "clamp(4.2rem, 6.8vw, 7.1rem)",
            lineHeight: 0.75,
            letterSpacing: "-0.075em",
            transform: "skewX(-8deg)",
          }}
        >
          <span
            className="text-transparent"
            style={{
              WebkitTextStroke: "1.5px white",
              textShadow: "4px 4px 0 rgba(0,0,0,0.9)",
            }}
          >
            SKINS
          </span>

          <span className="-ml-4 text-white drop-shadow-[5px_5px_0_rgba(0,0,0,0.9)]">
            TRADINGPOST
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-center text-xl font-semibold text-zinc-300">
          Trade CS2 skins with other players.
        </p>

        <div className="mt-4 flex w-[610px] max-w-[68vw] items-center">
          <div className="h-0 w-0 border-y-[24px] border-r-[36px] border-y-transparent border-r-blue-800" />
          <div className="h-2.5 flex-1 rounded-full bg-blue-800" />
        </div>

        <div className="mt-16 flex w-[420px] max-w-[90vw] flex-col gap-5">
          <a
            href="/login"
            className="flex items-center justify-center rounded-xl bg-orange-500 px-8 py-5 text-2xl font-black italic text-black shadow-[7px_7px_0_rgba(0,0,0,0.8)] transition hover:-translate-y-0.5 hover:bg-orange-400"
          >
            Sign In
          </a>

          <a
            href="/signup"
            className="flex items-center justify-center rounded-xl border-2 border-orange-500 bg-zinc-900 px-8 py-5 text-2xl font-black italic text-orange-400 shadow-[7px_7px_0_rgba(0,0,0,0.8)] transition hover:-translate-y-0.5 hover:bg-orange-500 hover:text-black"
          >
            Create Account
          </a>

          <a
            href="/search-trades"
            className="group mt-1 block text-center transition"
          >
            <p className="text-sm font-semibold text-zinc-300 group-hover:text-orange-400">
              Continue as Guest
            </p>

            <p className="mt-1 text-xs text-zinc-500 group-hover:text-zinc-400">
              Browse trades without creating an account →
            </p>
          </a>

          <p className="mt-2 text-center text-sm text-zinc-400">
            Steam linking is optional and can be added later from Settings.
          </p>
        </div>

        <div className="absolute bottom-10 flex items-center gap-9 rounded-full border border-blue-800 bg-zinc-950/95 px-12 py-5 shadow-[8px_8px_0_rgba(194,112,18,0.75)]">
          <a
            href="https://instagram.com/skinstradingpost"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-3xl text-pink-500 transition hover:scale-110"
          >
            <FaInstagram />
          </a>

          <a
            href="https://tiktok.com/@skinstradingpost"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="text-3xl text-white transition hover:scale-110"
          >
            <SiTiktok />
          </a>

          <a
            href="https://discord.gg/https://https://discord.gg/Y4SfEVwhE"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            className="text-3xl text-indigo-500 transition hover:scale-110"
          >
            <FaDiscord />
          </a>

          <a
            href="https://x.com/SkinsTradingP"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="text-3xl text-white transition hover:scale-110"
          >
            <SiX />
          </a>
        </div>
      </section>
    </main>
  );
}