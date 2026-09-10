import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { getHistory } from "@/lib/instant/api";
import { useQuery } from "@tanstack/react-query";
import { relativeTime } from "@/lib/utils";

export const Route = createFileRoute("/_app/history")({ component: History });

function History() {
  const q = useQuery({ queryKey: ["hist"], queryFn: () => getHistory() });
  return (
    <Page>
      <PageTitle kicker="Tape" title="Match history" />
      <ul className="divide-y divide-border rounded-[24px] border border-border bg-surface">
        {(q.data ?? []).map((h) => (
          <li key={h.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>
              <span className="capitalize">{h.game_id.replace("-", " ")}</span>
              <span className="ml-3 text-xs text-muted">{relativeTime(h.created_at)}</span>
            </span>
            <span className="tabular-nums">
              {h.score} · <span className="text-gold">+{h.xp_awarded}</span>
            </span>
          </li>
        ))}
      </ul>
    </Page>
  );
}
