import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { CAREERS } from "@/lib/instant/catalog";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_public/careers")({ component: Careers });

function Careers() {
  return (
    <Page>
      <PageTitle kicker="Studio" title="Careers" />
      <div className="space-y-3">
        {CAREERS.map((c) => (
          <article key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-border bg-surface p-5">
            <div>
              <h2 className="font-display text-2xl font-semibold">{c.title}</h2>
              <p className="text-sm text-muted">{c.loc}</p>
            </div>
            <Badge>{c.type}</Badge>
          </article>
        ))}
      </div>
    </Page>
  );
}
