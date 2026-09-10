import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GAMES, currentGiveaway, weekEnd, FAQS } from "@/lib/instant/catalog";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard, publicStats } from "@/lib/instant/api";
import { formatXp } from "@/lib/utils";
import { ArrowRight, Play, Shield, Timer, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_public/")({ component: Home });

function useCountdown(target: Date) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const ms = target.getTime() - Date.now();
      if (ms <= 0) {
        setLeft("00:00:00");
        return;
      }
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setLeft(
        `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

function Home() {
  const drop = currentGiveaway();
  const end = weekEnd();
  const clock = useCountdown(end);
  const stats = useQuery({ queryKey: ["public-stats"], queryFn: () => publicStats() });
  const board = useQuery({ queryKey: ["lb-home"], queryFn: () => getLeaderboard({ data: { range: "weekly" } }) });
  const featured = GAMES[3];

  return (
    <main>
      <section className="relative overflow-hidden">
        <img
          src={featured.cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 md:pb-24">
          <div className="stagger-in max-w-2xl">
            <Badge tone="gold">Weekly drop live</Badge>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.95] md:text-7xl">
              Play. Climb.
              <br />
              Win the drop.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted md:text-lg">
              Six original games. Server-authoritative XP. Real giveaways for the players who show up.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/play">
                <Button size="lg">
                  <Play className="size-4" />
                  Enter lobby
                </Button>
              </Link>
              <Link to="/giveaways">
                <Button size="lg" variant="secondary">
                  This week’s prize
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-sm">
              <Stat label="Operators" value={formatXp(stats.data?.players ?? 1240)} />
              <Stat label="Matches" value={formatXp(stats.data?.matches ?? 8600)} />
              <Stat label="Drop closes" value={clock} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div className="flex gap-5">
            <img
              src={drop.image}
              alt={drop.name}
              className="h-40 w-40 rounded-[20px] object-cover md:h-52 md:w-52"
            />
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-gold">Live giveaway</div>
              <h2 className="mt-2 font-display text-3xl font-semibold">{drop.name}</h2>
              <p className="mt-2 text-sm text-muted">{drop.blurb}</p>
              <div className="mt-4 font-display text-2xl tabular-nums text-fg">{clock}</div>
            </div>
          </div>
          <div className="rounded-[24px] border border-border bg-bg p-5">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-muted">
              Weekly podium
              <Link to="/leaderboard" className="text-accent">
                Full board
              </Link>
            </div>
            <ol className="space-y-2">
              {(board.data ?? []).slice(0, 5).map((row, i) => (
                <li key={row.user_id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-3">
                    <span className="w-5 tabular-nums text-muted">{i + 1}</span>
                    {row.display_name}
                  </span>
                  <span className="tabular-nums text-gold">{formatXp(row.xp)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-muted">Library</div>
            <h2 className="mt-1 font-display text-4xl font-semibold">Six games. One rank.</h2>
          </div>
          <Link to="/play" className="text-sm text-accent">
            Open lobby
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g) => (
            <Link
              key={g.id}
              to="/play/$gameId"
              params={{ gameId: g.id }}
              className="group overflow-hidden rounded-[24px] border border-border bg-surface transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-accent/40"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={g.cover}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Badge className="absolute left-3 top-3 bg-bg/80" tone="accent">
                  {g.tag}
                </Badge>
              </div>
              <div className="p-4">
                <div className="font-display text-2xl font-semibold">{g.name}</div>
                <p className="mt-1 text-sm text-muted">{g.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
          {[
            { icon: Zap, t: "XP is earned", d: "Every match writes through the server. Caps, timing checks, and rate limits keep the board honest." },
            { icon: Trophy, t: "Rank is the raffle", d: "Giveaways follow the weekly board, not a random ticket. Show up, play, place." },
            { icon: Shield, t: "No pay-to-win", d: "Boosters multiply play. Cosmetics are vanity. The podium is still a match record." },
          ].map((x) => (
            <div key={x.t} className="rounded-[24px] border border-border bg-bg p-6">
              <x.icon className="size-5 text-accent" />
              <h3 className="mt-4 font-display text-2xl font-semibold">{x.t}</h3>
              <p className="mt-2 text-sm text-muted">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="font-display text-3xl font-semibold">Questions</h2>
        <div className="mt-6 divide-y divide-border border-y border-border">
          {FAQS.slice(0, 4).map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <Link to="/faq" className="mt-4 inline-flex text-sm text-accent">
          Full FAQ
        </Link>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-gold">
              <Timer className="size-4" />
              <span className="text-xs uppercase tracking-[0.16em]">Season is live</span>
            </div>
            <h2 className="mt-2 font-display text-4xl font-semibold">Your first match is the hardest part.</h2>
          </div>
          <Link to="/login">
            <Button size="lg">Sign in with Google</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-2xl tabular-nums">{value}</div>
      <div className="text-xs uppercase tracking-[0.14em] text-muted">{label}</div>
    </div>
  );
}
