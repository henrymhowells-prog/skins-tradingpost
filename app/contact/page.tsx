import Link from "next/link";
import LegalPageShell, {
  LegalSection,
} from "../components/legal-page-shell";
export default function ContactPage() {
  return (
    <LegalPageShell
      title="Contact"
      description="Need help, want to report an issue or have a question about Skins TradingPost?"
      lastUpdated="June 28, 2026"
    >
      <LegalSection title="Support">
        <p>
          For account help, bug reports, safety concerns or general questions,
          contact the Skins TradingPost team.
        </p>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-500">Email</p>
          <a
            href="mailto:support@skinstradingpost.com"
            className="mt-1 inline-block font-medium text-orange-400 hover:text-orange-300"
          >
            support@skinstradingpost.com
          </a>
        </div>

        
      </LegalSection>

      <LegalSection title="What to Include">
        <p>When contacting support, please include:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Your account email if the issue is account-related.</li>
          <li>A clear description of the problem.</li>
          <li>Links to relevant trade listings, profiles or messages.</li>
          <li>Screenshots if they help explain the issue.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Report Abuse">
        <p>
          If you see scams, harassment, spam or suspicious behavior, please use
          the in-platform report tools where possible. Reports help moderators
          review the correct user, listing or message faster.
        </p>
      </LegalSection>

      <LegalSection title="Legal Pages">
        <p className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/terms" className="text-orange-400 hover:text-orange-300">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-orange-400 hover:text-orange-300">
            Privacy Policy
          </Link>
          <Link
            href="/community-rules"
            className="text-orange-400 hover:text-orange-300"
          >
            Community Rules
          </Link>
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}