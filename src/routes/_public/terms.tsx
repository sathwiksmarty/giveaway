import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";

export const Route = createFileRoute("/_public/terms")({ component: Terms });

function Terms() {
  return (
    <Page>
      <PageTitle kicker="Legal" title="Terms" />
      <div className="max-w-2xl space-y-4 text-sm text-muted">
        <p>INSTANT is a free-to-play entertainment service. Giveaways are promotions awarded by verified leaderboard standing, not gambling.</p>
        <p>You must be 13 or older. Accounts are personal. Selling ranks, boosting, or automating play is grounds for a ban and prize forfeiture.</p>
        <p>Optional purchases (coins, cosmetics, Season Pass, XP booster) are final once delivered to the account, except where local law requires otherwise.</p>
        <p>We may reset seasons, rebalance XP, or void scores that fail anti-cheat review.</p>
      </div>
    </Page>
  );
}
