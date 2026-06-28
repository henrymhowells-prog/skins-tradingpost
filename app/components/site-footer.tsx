import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-black/30 py-4">
      <div className="flex items-center px-12">
        <div
          className="flex items-center"
          style={{ gap: "120px" }}
        >
          <Link href="/terms" className="text-xs text-zinc-500 hover:text-orange-400">
            Terms of Service
          </Link>

          <Link href="/privacy" className="text-xs text-zinc-500 hover:text-orange-400">
            Privacy
          </Link>

          <Link href="/community-rules" className="text-xs text-zinc-500 hover:text-orange-400">
            Community Rules
          </Link>

          <Link href="/contact" className="text-xs text-zinc-500 hover:text-orange-400">
            Contact Us
          </Link>
        </div>

        <span className="ml-auto text-[11px] text-zinc-600">
          © {year} Skins TradingPost
        </span>
      </div>
    </footer>
  );
}