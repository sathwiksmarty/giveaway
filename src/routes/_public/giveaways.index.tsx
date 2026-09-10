import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { GIVEAWAYS, currentGiveaway, previousGiveaway, weekEnd } from "@/lib/instant/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_public/giveaways/")({ component: Giveaways });

function Giveaways() {
  const live = currentGiveaway();
  const prev = previousGiveaway();
  const [clock, setClock] = useState("");
  useEffect(() => {
    const end = weekEnd();
    const id = setInterval(() => {
      const ms = end.getTime() - Date.now();
      const d = Math.max(0, Math.floor(ms / 86400000));
      const h = Math.max(0, Math.floor((ms % 86400000) / 3600000));
      const m = Math.max(0, Math.floor((ms % 3600000) / 60000));
      const s = Math.max(0, Math.floor((ms % 60000) / 1000));
      setClock(`${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Page>
      <PageTitle kicker="Drops" title="Giveaway center" />
      <article className="grid overflow-hidden rounded-[28px] border border-border bg-surface md:grid-cols-2">
        <img src={live.image} alt="" className="h-full min-h-56 w-full object-cover" />
        <div className="p-6 md:p-8">
          <Badge tone="gold">Live now</Badge>
          <h2 className="mt-3 font-display text-4xl font-semibold">{live.name}</h2>
          <p className="mt-2 text-sm text-muted">{live.blurb}</p>
          <div className="mt-6 font-display text-3xl tabular-nums">{clock}</div>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
            {live.winners} seats · {live.value}
          </p>
          <Link to="/giveaways/$id" params={{ id: live.id }} className="mt-6 inline-block">
            <Button>Open details</Button>
          </Link>
        </div>
      </article>
      <h3 className="mt-12 font-display text-2xl font-semibold">Rotation</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {GIVEAWAYS.map((g) => (
          <Link
            key={g.id}
            to="/giveaways/$id"
            params={{ id: g.id }}
            className="overflow-hidden rounded-[20px] border border-border bg-surface hover:border-accent/40"
          >
            <img src={g.image} alt="" className="aspect-[4/3] w-full object-cover" />
            <div className="p-4">
              <div className="font-medium">{g.name}</div>
              <div className="text-xs text-muted">{g.kind} · {g.value}</div>
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted">Last rotation: {prev.name}. Winners are verified in Ops before shipping.</p>
    </Page>
  );
}
