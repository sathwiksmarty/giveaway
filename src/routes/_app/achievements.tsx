import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { getAchievements } from "@/lib/instant/api";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/achievements")({ component: Achievements });

function Achievements() {
  const q = useQuery({ queryKey: ["ach"], queryFn: () => getAchievements() });
  const list = q.data ?? [];
  const n = list.filter((a) => a.unlocked).length;
  return (
    <Page>
      <PageTitle kicker="Marks" title="Achievements" action={<div className="text-sm text-muted">{n}/{list.length}</div>} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <article
            key={a.id}
            className={cn("rounded-[20px] border border-border bg-surface p-4", !a.unlocked && "opacity-50")}
          >
            <Badge tone={a.unlocked ? "gold" : "default"}>{a.unlocked ? "Unlocked" : `${a.xp} XP`}</Badge>
            <h3 className="mt-3 font-display text-xl">{a.name}</h3>
            <p className="mt-1 text-sm text-muted">{a.desc}</p>
          </article>
        ))}
      </div>
    </Page>
  );
}
