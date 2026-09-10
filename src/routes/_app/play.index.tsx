import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { GAMES } from "@/lib/instant/catalog";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/play/")({ component: Lobby });

function Lobby() {
  const recent = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("instant.recent") || "[]") as string[];
    } catch {
      return [];
    }
  }, []);
  const recentGames = GAMES.filter((g) => recent.includes(g.id));
  return (
    <Page>
      <PageTitle kicker="Launcher" title="Game lobby" />
      {recentGames.length ? (
        <>
          <h2 className="mb-3 font-display text-xl">Continue</h2>
          <Row games={recentGames} />
        </>
      ) : null}
      <h2 className="mb-3 mt-8 font-display text-xl">Trending</h2>
      <Row games={[GAMES[3], GAMES[4], GAMES[5]]} />
      <h2 className="mb-3 mt-8 font-display text-xl">New</h2>
      <Row games={[GAMES[2], GAMES[0]]} />
      <h2 className="mb-3 mt-8 font-display text-xl">Library</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g) => (
          <Link
            key={g.id}
            to="/play/$gameId"
            params={{ gameId: g.id }}
            className="group overflow-hidden rounded-[24px] border border-border bg-surface"
          >
            <div className="relative aspect-[16/10]">
              <img src={g.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <Badge className="absolute left-3 top-3 bg-bg/80" tone="accent">
                {g.tag}
              </Badge>
            </div>
            <div className="p-4">
              <div className="font-display text-2xl">{g.name}</div>
              <p className="mt-1 text-sm text-muted">{g.blurb}</p>
              <div className="mt-2 text-xs uppercase tracking-[0.14em] text-subtle">
                {g.players} · {g.category}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

function Row({ games }: { games: typeof GAMES }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {games.map((g) => (
        <Link key={g.id} to="/play/$gameId" params={{ gameId: g.id }} className="overflow-hidden rounded-[20px] border border-border">
          <img src={g.cover} alt="" className="aspect-[16/9] w-full object-cover" />
          <div className="p-3 text-sm">{g.name}</div>
        </Link>
      ))}
    </div>
  );
}
