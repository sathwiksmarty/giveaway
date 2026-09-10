import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { getHistory, getMe } from "@/lib/instant/api";
import { useQuery } from "@tanstack/react-query";
import { GAMES } from "@/lib/instant/catalog";

export const Route = createFileRoute("/_app/stats")({ component: Stats });

function Stats() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const hist = useQuery({ queryKey: ["hist"], queryFn: () => getHistory() });
  const byGame = GAMES.map((g) => {
    const rows = (hist.data ?? []).filter((h) => h.game_id === g.id);
    return { g, n: rows.length, best: rows.reduce((m, r) => Math.max(m, r.score), 0) };
  });
  return (
    <Page>
      <PageTitle kicker="Numbers" title="Statistics" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat k="XP" v={String(me.data?.xp ?? 0)} />
        <Stat k="Level" v={String(me.data?.level ?? 1)} />
        <Stat k="Matches" v={String(hist.data?.length ?? 0)} />
      </div>
      <div className="mt-6 space-y-2">
        {byGame.map((r) => (
          <div key={r.g.id} className="flex justify-between rounded-[16px] border border-border bg-surface px-4 py-3 text-sm">
            <span>{r.g.name}</span>
            <span className="tabular-nums text-muted">
              {r.n} plays · best {r.best}
            </span>
          </div>
        ))}
      </div>
    </Page>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-[20px] border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-[0.14em] text-muted">{k}</div>
      <div className="font-display text-3xl tabular-nums">{v}</div>
    </div>
  );
}
