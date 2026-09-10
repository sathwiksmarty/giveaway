import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";

export const Route = createFileRoute("/_public/privacy")({ component: Privacy });

function Privacy() {
  return (
    <Page>
      <PageTitle kicker="Legal" title="Privacy" />
      <div className="max-w-2xl space-y-4 text-sm text-muted">
        <p>We store your sign-in identity, profile, match history, inventory, and purchase records to operate ranks and drops.</p>
        <p>Scores and XP writes are server-side. We keep fraud signals (rate, timing, referral abuse) so operators can review contested wins.</p>
        <p>We do not sell personal data. Payments are processed through the checkout you confirm; we store SKU, method, and amount — not full card numbers.</p>
        <p>Contact ops via the Contact page to request export or deletion of your profile.</p>
      </div>
    </Page>
  );
}
