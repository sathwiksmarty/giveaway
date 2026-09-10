import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { useQuery } from "@tanstack/react-query";
import { claimDaily, getHistory, getMe, getMissions, getNotifications, getWallet } from "@/lib/instant/api";
import { formatXp, levelProgress, relativeTime } from "@/lib/utils";
import { GAMES, currentGiveaway, isHappyHour, isWeekendXp, xpMultiplier } from "@/lib/instant/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const hist = useQuery({ queryKey: ["hist"], queryFn: () => getHistory() });
  const missions = useQuery({ queryKey: ["missions"], queryFn: () => getMissions() });
  const notes = useQuery({ queryKey: ["notes"], queryFn: () => getNotifications() });
  const wallet = useQuery({ queryKey: ["wallet"], queryFn: () => getWallet() });
  const p = me.data;
  const lp = levelProgress(p?.xp ?? 0);
  const drop = currentGiveaway();

  useEffect(() => {
    claimDaily()
      .then((r) => {
        if (r.claimed) toast.success(`Daily login +${r.xp} XP · streak ${r.streak}`);
      })
      .catch(() => undefined);
  }, []);

  return (
    <Page>
      <PageTitle
        kicker="Command"
        title={p ? p.display_name : "Operator"}
        action={
          <div className="flex gap-2">
            {isWeekendXp() ? <Badge tone="gold">Weekend 1.5×</Badge> : null}
            {isHappyHour() ? <Badge tone="accent">Happy hour 2×</Badge> : null}
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-[24px] border border-border bg-surface p-5 lg:col-span-2">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-muted">XP wallet</div>
              <div className="font-display text-5xl tabular-nums">{formatXp(p?.xp ?? 0)}</div>
            </div>
            <div className="text-right text-sm text-muted">
              Level {lp.level}
              <div className="tabular-nums text-gold">{p?.coins ?? 0} coins</div>
            </div>
          </div>
          <Progress className="mt-4" value={lp.pct * 100} />
          <p className="mt-2 text-xs text-muted">
            Live multiplier ×{xpMultiplier()} · streak {p?.streak_days ?? 0}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {GAMES.slice(0, 3).map((g) => (
              <Link key={g.id} to="/play/$gameId" params={{ gameId: g.id }} className="overflow-hidden rounded-[16px]">
                <img src={g.cover} alt="" className="aspect-[16/10] w-full object-cover" />
                <div className="pt-2 text-sm">{g.name}</div>
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-[24px] border border-border bg-surface p-5">
          <div className="text-xs uppercase tracking-[0.16em] text-gold">This week</div>
          <img src={drop.image} alt="" className="mt-3 aspect-[4/3] w-full rounded-[16px] object-cover" />
          <h2 className="mt-3 font-display text-2xl">{drop.name}</h2>
          <Link to="/giveaways/$id" params={{ id: drop.id }}>
            <Button className="mt-4 w-full" variant="secondary">
              Drop details
            </Button>
          </Link>
        </section>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[24px] border border-border bg-surface p-5">
          <h2 className="font-display text-xl">Daily missions</h2>
          <ul className="mt-3 space-y-3">
            {(missions.data ?? []).map((m) => (
              <li key={m.id} className="text-sm">
                <div className="flex justify-between">
                  <span>{m.name}</span>
                  <span className="tabular-nums text-muted">
                    {m.progress}/{m.target}
                  </span>
                </div>
                <Progress className="mt-1" value={(m.progress / m.target) * 100} />
              </li>
            ))}
          </ul>
          <Link to="/missions" className="mt-4 inline-block text-sm text-accent">
            Open board
          </Link>
        </section>
        <section className="rounded-[24px] border border-border bg-surface p-5">
          <h2 className="font-display text-xl">Match history</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(hist.data ?? []).slice(0, 6).map((h) => (
              <li key={h.id} className="flex justify-between">
                <span className="capitalize">{h.game_id.replace("-", " ")}</span>
                <span className="tabular-nums text-gold">+{h.xp_awarded} XP</span>
              </li>
            ))}
            {(hist.data ?? []).length === 0 ? <li className="text-muted">No matches yet.</li> : null}
          </ul>
        </section>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-[24px] border border-border bg-surface p-5">
          <h2 className="font-display text-xl">Inbox</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(notes.data ?? []).slice(0, 5).map((n) => (
              <li key={n.id}>
                <div>{n.title}</div>
                <div className="text-xs text-muted">
                  {n.body} · {relativeTime(n.created_at)}
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[24px] border border-border bg-surface p-5">
          <h2 className="font-display text-xl">Recent XP</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(wallet.data?.ledger ?? []).slice(0, 6).map((l) => (
              <li key={l.id} className="flex justify-between">
                <span className="text-muted">{l.reason}</span>
                <span className="tabular-nums text-gold">+{l.amount}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Page>
  );
}
