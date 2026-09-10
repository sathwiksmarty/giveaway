import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { getHistory, getMe, getWallet } from "@/lib/instant/api";
import { useQuery } from "@tanstack/react-query";
import { PlayerAvatar } from "@/components/instant/avatar";
import { formatXp, levelProgress } from "@/lib/utils";
import { COSMETICS } from "@/lib/instant/catalog";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/profile")({ component: Profile });

function Profile() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const hist = useQuery({ queryKey: ["hist"], queryFn: () => getHistory() });
  const w = useQuery({ queryKey: ["wallet"], queryFn: () => getWallet() });
  const p = me.data;
  if (!p) return <Page><div className="h-40 animate-pulse rounded-[24px] bg-surface-2" /></Page>;
  const lp = levelProgress(p.xp);
  const owned = w.data?.items ?? [];
  return (
    <Page>
      <PageTitle kicker="Operator" title={p.display_name} />
      <div className="flex flex-wrap items-center gap-5">
        <PlayerAvatar id={p.user_id} name={p.display_name} size={72} />
        <div>
          <div className="text-sm text-muted">@{p.username}</div>
          <div className="text-sm">
            Level {lp.level} · {formatXp(p.xp)} XP · {p.title_id ?? "Unranked title"}
          </div>
          <Progress className="mt-2 w-56" value={lp.pct * 100} />
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-[24px] border border-border bg-surface p-5">
          <h2 className="font-display text-xl">Cosmetics</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {owned.map((i) => {
              const c = COSMETICS.find((x) => x.id === i.item_id);
              return (
                <li key={i.item_id} className="flex justify-between">
                  <span>{c?.name ?? i.item_id}</span>
                  {i.equipped ? <span className="text-gold">On</span> : null}
                </li>
              );
            })}
            {owned.length === 0 ? <li className="text-muted">Empty locker.</li> : null}
          </ul>
          <Link to="/inventory" className="mt-3 inline-block text-sm text-accent">
            Inventory
          </Link>
        </section>
        <section className="rounded-[24px] border border-border bg-surface p-5">
          <h2 className="font-display text-xl">Recent games</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(hist.data ?? []).slice(0, 8).map((h) => (
              <li key={h.id} className="flex justify-between">
                <span className="capitalize">{h.game_id.replace("-", " ")}</span>
                <span className="tabular-nums">{h.score}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Page>
  );
}
