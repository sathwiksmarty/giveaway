import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GAMES } from "@/lib/instant/catalog";
import { PuzzleQuest } from "@/games/puzzle-quest";
import { MemoryFlip } from "@/games/memory-flip";
import { ColorRush } from "@/games/color-rush";
import { NeonCircuit } from "@/games/neon-circuit";
import { VectorStrike } from "@/games/vector-strike";
import { IronRing } from "@/games/iron-ring";
import { RequireUser } from "@/components/instant/require-user";
import { bumpMission, submitScore, unlockAchievement } from "@/lib/instant/api";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/play/$gameId")({ component: PlayGame });

function PlayGame() {
  return (
    <RequireUser>
      <GameScreen />
    </RequireUser>
  );
}

function GameScreen() {
  const { gameId } = Route.useParams();
  const nav = useNavigate();
  const game = GAMES.find((g) => g.id === gameId);
  const boostUntil = useMemo(() => Number(sessionStorage.getItem("instant.boost") || 0), []);

  if (!game) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Link to="/play">Unknown title</Link>
      </div>
    );
  }
  const title = game;

  try {
    const rec = JSON.parse(localStorage.getItem("instant.recent") || "[]") as string[];
    localStorage.setItem("instant.recent", JSON.stringify([title.id, ...rec.filter((x) => x !== title.id)].slice(0, 6)));
  } catch {
    /* ignore */
  }

  async function bank(payload: {
    score: number;
    durationMs: number;
    meta: Record<string, number | boolean | string>;
  }) {
    try {
      const res = await submitScore({
        data: {
          gameId: title.id,
          score: payload.score,
          durationMs: payload.durationMs,
          meta: { ...payload.meta, boostUntil },
        },
      });
      toast.success(`+${res.xp} XP`);
      await bumpMission({ data: { stat: "matches" } }).catch(() => undefined);
      if (title.id === "puzzle-quest") await bumpMission({ data: { stat: "puzzle" } }).catch(() => undefined);
      if (title.id === "neon-circuit") await bumpMission({ data: { stat: "races" } }).catch(() => undefined);
      if (title.id === "vector-strike")
        await bumpMission({ data: { stat: "kills", amount: Number(payload.meta.kills || 0) } }).catch(() => undefined);
      if (title.id === "iron-ring" && payload.meta.win) await bumpMission({ data: { stat: "fight_wins" } }).catch(() => undefined);
      if (title.id === "memory-flip") await bumpMission({ data: { stat: "memory" } }).catch(() => undefined);
      if (title.id === "color-rush")
        await bumpMission({ data: { stat: "rush", amount: Number(payload.meta.score || 0) } }).catch(() => undefined);
      await unlockAchievement({ data: { id: "first-blood" } }).catch(() => undefined);
      void nav({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Score rejected");
    }
  }

  const body =
    title.id === "puzzle-quest" ? (
      <PuzzleQuest onFinish={bank} />
    ) : title.id === "memory-flip" ? (
      <MemoryFlip onFinish={bank} />
    ) : title.id === "color-rush" ? (
      <ColorRush onFinish={bank} />
    ) : title.id === "neon-circuit" ? (
      <NeonCircuit onFinish={bank} />
    ) : title.id === "vector-strike" ? (
      <VectorStrike onFinish={bank} />
    ) : (
      <IronRing onFinish={bank} />
    );

  return (
    <div className="relative h-dvh bg-bg">
      <Link
        to="/play"
        className="absolute right-3 top-3 z-20 grid size-11 place-items-center rounded-[12px] border border-border bg-surface/80"
        aria-label="Close"
      >
        <X className="size-4" />
      </Link>
      {body}
    </div>
  );
}


