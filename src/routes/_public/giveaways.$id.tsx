import { createFileRoute, Link } from "@tanstack/react-router";
import { Page } from "@/components/instant/page";
import { GIVEAWAYS, currentGiveaway, weekEnd } from "@/lib/instant/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/lib/instant/api";
import { formatXp } from "@/lib/utils";

export const Route = createFileRoute("/_public/giveaways/$id")({ component: GiveawayDetail });

function GiveawayDetail() {
  const { id } = Route.useParams();
  const g = GIVEAWAYS.find((x) => x.id === id) ?? currentGiveaway();
  const live = currentGiveaway().id === g.id;
  const board = useQuery({ queryKey: ["lb-g"], queryFn: () => getLeaderboard({ data: { range: "weekly" } }) });
  const end = weekEnd();

  return (
    <Page>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <img src={g.image} alt="" className="aspect-[16/9] w-full rounded-[24px] object-cover" />
          <Badge className="mt-6" tone={live ? "gold" : "default"}>
            {live ? "Live" : "Archive"}
          </Badge>
          <h1 className="mt-3 font-display text-4xl font-semibold">{g.name}</h1>
          <p className="mt-2 text-muted">{g.blurb}</p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>Eligible: any unbanned player with at least one qualifying match this week.</li>
            <li>Ranking: weekly XP after anti-cheat review.</li>
            <li>Seats: {g.winners}. Value: {g.value}.</li>
            <li>Closes: {end.toUTCString()}.</li>
            <li>Winners are verified by Ops. Fraudulent sessions void the seat.</li>
          </ul>
          <Link to="/play" className="mt-8 inline-block">
            <Button>Play to climb</Button>
          </Link>
        </div>
        <aside className="rounded-[24px] border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-semibold">Live board</h2>
          <ol className="mt-4 space-y-3">
            {(board.data ?? []).slice(0, 10).map((row, i) => (
              <li key={row.user_id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-3">
                  <span className="w-5 tabular-nums text-muted">{i + 1}</span>
                  {row.display_name}
                </span>
                <span className="tabular-nums text-gold">{formatXp(row.xp)}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </Page>
  );
}
