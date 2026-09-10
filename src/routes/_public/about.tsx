import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";

export const Route = createFileRoute("/_public/about")({ component: About });

function About() {
  return (
    <Page>
      <PageTitle kicker="House" title="About INSTANT" />
      <div className="max-w-2xl space-y-4 text-muted">
        <p>
          INSTANT is a free-to-play giveaway platform. You sign in, you play original games, you earn XP, and the weekly board decides who takes the drop.
        </p>
        <p>
          We built it like a launcher, not a raffle site. Ranks move in realtime. Cosmetics are vanity. Payments never buy placement.
        </p>
        <p>
          Anti-cheat lives on the server: score caps, duration checks, referral qualification after real play, and operator review before any prize ships.
        </p>
      </div>
    </Page>
  );
}
