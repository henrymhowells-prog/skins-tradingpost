import LegalPageShell, {
  LegalSection,
} from "../components/legal-page-shell";

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      description="This policy explains what information Skins TradingPost collects and how it is used."
      lastUpdated="June 28, 2026"
    >
      <LegalSection title="1. Information We Collect">
        <p>
          We may collect your email address, account information, profile
          details, trade listings, messages, reviews, reports, notifications and
          optional Steam-related information if you choose to link Steam.
        </p>
      </LegalSection>

      <LegalSection title="2. How We Use Information">
        <p>
          We use this information to provide accounts, listings, messaging,
          notifications, reviews, reports, moderation, abuse prevention and
          platform improvements.
        </p>
      </LegalSection>

      <LegalSection title="3. Contact">
        <p>
          Privacy questions or data requests can be sent through the Contact
          page.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}