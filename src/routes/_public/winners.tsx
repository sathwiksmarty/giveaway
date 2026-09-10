import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { GIVEAWAYS } from "@/lib/instant/catalog";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_public/winners")({ component: Winners });

function Winners() {
  return (
    <Page>
      <PageTitle kicker="Archive" title="Winners gallery" />
      <div className="grid gap-4 md:grid-cols-2">
        {GIVEAWAYS.map((g, i) => (
          <article key={g.id} className="overflow-hidden rounded-[24px] border border-border bg-surface">
            <img src={g.image} alt="" className="aspect-[16/9] w-full object-cover" />
            <div className="p-5">
              <Badge tone="gold">Season {i + 1}</Badge>
              <h2 className="mt-3 font-display text-2xl font-semibold">{g.name}</h2>
              <p className="mt-1 text-sm text-muted">
                Verified podium. {g.winners} seats. {g.value}.
              </p>
            </div>
          </article>
        ))}
      </div>
    </Page>
  );
}
