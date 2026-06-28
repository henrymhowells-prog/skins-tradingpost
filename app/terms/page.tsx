import LegalPageShell, {
  LegalSection,
} from "../components/legal-page-shell";
export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      description="These terms explain the rules for using Skins TradingPost."
      lastUpdated="June 28, 2026"
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By accessing or using Skins TradingPost, you agree to these Terms of
          Service. If you do not agree with these terms, you should not use the
          platform.
        </p>
      </LegalSection>

      <LegalSection title="2. About Skins TradingPost">
        <p>
          Skins TradingPost is a community platform that allows users to create,
          browse and discuss Counter-Strike 2 trade listings.
        </p>
        <p>
          Skins TradingPost does not sell skins, hold user items, process item
          transfers or act as a party to trades between users.
        </p>
      </LegalSection>

      <LegalSection title="3. User Accounts">
        <p>
          You are responsible for keeping your account secure and for all
          activity that occurs under your account.
        </p>
        <p>
          You must provide accurate information when creating an account and must
          not impersonate another person or misrepresent your identity.
        </p>
      </LegalSection>

      <LegalSection title="4. Trade Listings">
        <p>
          Users are responsible for the listings they create, including item
          names, images, descriptions, trade expectations and any communication
          with other users.
        </p>
        <p>
          Listings must not be misleading, fraudulent, abusive, spammy or used to
          promote scams or unsafe behavior.
        </p>
      </LegalSection>

      <LegalSection title="5. Prohibited Conduct">
        <p>You may not use Skins TradingPost to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Scam, deceive or defraud other users.</li>
          <li>Harass, threaten or abuse other users.</li>
          <li>Impersonate Steam, Valve, Skins TradingPost staff or another user.</li>
          <li>Post spam, phishing links, malware or unsafe external links.</li>
          <li>Attempt to bypass moderation, bans or platform security.</li>
          <li>Use the platform for illegal activity.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Steam and Valve Disclaimer">
        <p>
          Skins TradingPost is not affiliated with, endorsed by, sponsored by or
          approved by Valve Corporation.
        </p>
        <p>
          Counter-Strike 2, Steam and related names, logos, images and marks are
          trademarks or property of Valve Corporation or their respective owners.
        </p>
      </LegalSection>

      <LegalSection title="7. User Content">
        <p>
          You retain ownership of content you submit, including listings,
          messages, reviews and reports. By submitting content, you give Skins
          TradingPost permission to display, store and use that content as needed
          to operate the platform.
        </p>
      </LegalSection>

      <LegalSection title="8. Moderation and Account Actions">
        <p>
          We may remove listings, hide content, restrict accounts or suspend users
          when we believe it is necessary to protect the platform or other users.
        </p>
        <p>
          We may also review reports, messages and listings for safety,
          moderation and abuse-prevention purposes.
        </p>
      </LegalSection>

      <LegalSection title="9. No Guarantee of Trades">
        <p>
          Skins TradingPost does not guarantee that any listing will result in a
          trade, that users will respond, or that any trade will be completed.
        </p>
        <p>
          Users are responsible for verifying trade details and protecting
          themselves when communicating or trading outside the platform.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation of Liability">
        <p>
          Skins TradingPost is provided on an “as is” and “as available” basis.
          We are not responsible for losses, failed trades, account issues,
          external links, Steam issues or user behavior outside our control.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to These Terms">
        <p>
          We may update these terms from time to time. Continued use of the
          platform after changes are posted means you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Questions about these terms can be sent through the Contact page.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}