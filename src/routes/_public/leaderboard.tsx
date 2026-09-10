import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/lib/instant/api";
import { formatXp } from "@/lib/utils";
import { PlayerAvatar } from "@/components/instant/avatar";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_public/leaderboard")({ component: Leaderboard });

const ranges = ["global", "weekly", "monthly"] as const;

function Leaderboard() {
  const [range, setRange] = useState<(typeof ranges)[number]>("weekly");
  const q = useQuery({
    queryKey: ["lb", range],
    queryFn: () => getLeaderboard({ data: { range } }),
  });
  const rows = q.data ?? [];
  const top = rows.slice(0, 3);

  return (
    <Page>
      <PageTitle kicker="Live" title="Leaderboard" />
      <div className="mb-8 flex flex-wrap gap-2">
        {ranges.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={cn(
              "h-10 rounded-full border px-4 text-sm capitalize",
              range === r ? "border-accent bg-surface-2 text-fg" : "border-border text-muted",
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="mb-10 grid gap-3 md:grid-cols-3">
        {top.map((p, i) => (
          <div
            key={p.user_id}
            className={cn(
              "rounded-[24px] border border-border bg-surface p-5",
              i === 0 && "md:order-2 border-gold/40",
              i === 1 && "md:order-1",
              i === 2 && "md:order-3",
            )}
          >
            <div className="text-xs uppercase tracking-[0.16em] text-muted">#{i + 1}</div>
            <div className="mt-3 flex items-center gap-3">
              <PlayerAvatar id={p.user_id} name={p.display_name} size={48} />
              <div>
                <div className="font-medium">{p.display_name}</div>
                <div className="text-xs text-muted">@{p.username}</div>
              </div>
            </div>
            <div className="mt-4 font-display text-3xl tabular-nums text-gold">{formatXp(p.xp)}</div>
          </div>
        ))}
      </div>
      <ol className="divide-y divide-border rounded-[24px] border border-border bg-surface">
        {rows.map((p, i) => (
          <li key={p.user_id} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="flex min-w-0 items-center gap-3">
              <span className="w-7 tabular-nums text-sm text-muted">{i + 1}</span>
              <PlayerAvatar id={p.user_id} name={p.display_name} size={32} />
              <span className="truncate">
                <span className="block truncate text-sm">{p.display_name}</span>
                <span className="text-xs text-muted">Lv {p.level}</span>
              </span>
            </span>
            <span className="tabular-nums text-sm text-gold">{formatXp(p.xp)}</span>
          </li>
        ))}
      </ol>
    </Page>
  );
}
