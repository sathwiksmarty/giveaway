import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { claimMission, getMissions } from "@/lib/instant/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/missions")({ component: Missions });

function Missions() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["missions"], queryFn: () => getMissions() });
  const claim = useMutation({
    mutationFn: (missionId: string) => claimMission({ data: { missionId } }),
    onSuccess: (r) => {
      toast.success(`+${r.xp} XP`);
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Page>
      <PageTitle kicker="Today" title="Daily missions" />
      <div className="space-y-3">
        {(q.data ?? []).map((m) => (
          <article key={m.id} className="rounded-[20px] border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl">{m.name}</h3>
                <p className="text-sm text-muted">{m.desc}</p>
              </div>
              <Button
                size="sm"
                disabled={m.claimed || m.progress < m.target}
                onClick={() => claim.mutate(m.id)}
              >
                {m.claimed ? "Claimed" : `+${m.xp} XP`}
              </Button>
            </div>
            <Progress className="mt-3" value={(m.progress / m.target) * 100} />
          </article>
        ))}
      </div>
    </Page>
  );
}
