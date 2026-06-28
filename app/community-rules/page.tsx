import LegalPageShell, {
  LegalSection,
} from "../components/legal-page-shell";

export default function CommunityRulesPage() {
  return (
    <LegalPageShell
      title="Community Rules"
      description="Simple rules to keep Skins TradingPost safe, fair and useful for CS2 traders."
      lastUpdated="June 28, 2026"
    >
      <LegalSection title="1. Trade Honestly">
        <p>
          Do not create fake, misleading or deceptive listings. Be clear about
          what you are offering and what you want in return.
        </p>
      </LegalSection>

      <LegalSection title="2. No Scams">
        <p>
          Scamming, phishing, impersonation, fake middlemen, fake verification
          requests and suspicious external links are not allowed.
        </p>
      </LegalSection>

      <LegalSection title="3. Respect Other Users">
        <p>
          Harassment, threats, hate speech, abuse and targeted personal attacks
          are not allowed.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}