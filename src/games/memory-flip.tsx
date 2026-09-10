import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const GLYPHS = ["A", "B", "C", "D", "E", "F", "G", "H", "K", "M", "P", "R", "S", "T", "V", "X", "Y", "Z"];

function makeDeck(pairs: number) {
  const picks = GLYPHS.slice(0, pairs);
  const deck = [...picks, ...picks].map((g, i) => ({ id: i, g, flip: false, gone: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.map((c, i) => ({ ...c, id: i }));
}

export function MemoryFlip({
  onFinish,
}: {
  onFinish: (payload: { score: number; durationMs: number; meta: Record<string, number | boolean> }) => void;
}) {
  const [diff, setDiff] = useState(1);
  const pairs = Math.min(18, 4 + diff * 2);
  const [deck, setDeck] = useState(() => makeDeck(pairs));
  const [open, setOpen] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const [turns, setTurns] = useState(0);
  const [mismatches, setMismatches] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [you, setYou] = useState(0);
  const [turn, setTurn] = useState<"you" | "ai">("you");
  const start = useRef(performance.now());
  const cols = pairs <= 8 ? 4 : pairs <= 12 ? 4 : 6;

  const done = useMemo(() => deck.every((c) => c.gone), [deck]);

  function reset(nextDiff = diff) {
    const p = Math.min(18, 4 + nextDiff * 2);
    setDeck(makeDeck(p));
    setOpen([]);
    setTurns(0);
    setMismatches(0);
    setAiScore(0);
    setYou(0);
    setTurn("you");
    start.current = performance.now();
  }

  function pick(i: number) {
    if (lock || turn !== "you" || deck[i].flip || deck[i].gone) return;
    const nextOpen = [...open, i];
    const next = deck.map((c, idx) => (idx === i ? { ...c, flip: true } : c));
    setDeck(next);
    setOpen(nextOpen);
    if (nextOpen.length === 2) {
      setLock(true);
      setTurns((t) => t + 1);
      const [a, b] = nextOpen;
      const match = next[a].g === next[b].g;
      setTimeout(() => {
        if (match) {
          setDeck((d) => d.map((c, idx) => (idx === a || idx === b ? { ...c, gone: true } : c)));
          setYou((y) => y + 1);
        } else {
          setDeck((d) => d.map((c, idx) => (idx === a || idx === b ? { ...c, flip: false } : c)));
          setMismatches((m) => m + 1);
          setTurn("ai");
          setTimeout(() => aiMove(), 400);
        }
        setOpen([]);
        setLock(false);
      }, 520);
    }
  }

  function aiMove() {
    setDeck((current) => {
      const hidden = current.map((c, i) => ({ ...c, i })).filter((c) => !c.gone && !c.flip);
      if (hidden.length < 2) {
        setTurn("you");
        return current;
      }
      const a = hidden[Math.floor(Math.random() * hidden.length)];
      let b = hidden[Math.floor(Math.random() * hidden.length)];
      while (b.i === a.i) b = hidden[Math.floor(Math.random() * hidden.length)];
      const shown = current.map((c, idx) => (idx === a.i || idx === b.i ? { ...c, flip: true } : c));
      setTimeout(() => {
        const match = shown[a.i].g === shown[b.i].g || Math.random() < 0.18 + diff * 0.06;
        if (match) {
          setDeck((d) => d.map((c, idx) => (idx === a.i || idx === b.i ? { ...c, gone: true, flip: true } : c)));
          setAiScore((s) => s + 1);
          setTimeout(() => aiMove(), 360);
        } else {
          setDeck((d) => d.map((c, idx) => (idx === a.i || idx === b.i ? { ...c, flip: false } : c)));
          setTurn("you");
        }
      }, 500);
      return shown;
    });
  }

  function bank() {
    const perfect = mismatches === 0;
    const win = you >= aiScore;
    onFinish({
      score: you * 220 + (perfect ? 800 : 0) + (win ? 400 : 0) + diff * 80,
      durationMs: Math.floor(performance.now() - start.current),
      meta: { win, perfect, you, ai: aiScore, diff },
    });
  }

  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <div>
          You {you} · AI {aiScore}
          <span className="ml-3 text-muted">{turn === "you" ? "Your flip" : "AI thinking"}</span>
        </div>
        <div className="text-muted">Diff {diff} · Turns {turns}</div>
      </div>
      <div
        className="mx-auto grid w-full max-w-lg flex-1 content-center gap-2 p-4"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {deck.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => pick(i)}
            className="aspect-square rounded-[14px] border text-lg font-display font-semibold transition-transform duration-150"
            style={{
              background: c.gone ? "#101218" : c.flip ? "#161922" : "#101218",
              borderColor: c.flip ? "#6d8cff" : "#232736",
              color: c.flip && !c.gone ? "#d4b56a" : "transparent",
              opacity: c.gone ? 0.25 : 1,
            }}
          >
            {c.g}
          </button>
        ))}
      </div>
      {done ? (
        <div className="absolute inset-0 grid place-items-center bg-bg/80 p-6">
          <div className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-6 text-center">
            <h2 className="font-display text-3xl">{you >= aiScore ? "Board won" : "AI took it"}</h2>
            <p className="mt-2 text-sm text-muted">
              {mismatches === 0 ? "Perfect recall." : `${mismatches} mismatches.`}
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button
                onClick={() => {
                  const n = Math.min(6, diff + 1);
                  setDiff(n);
                  reset(n);
                }}
              >
                Harder
              </Button>
              <Button variant="secondary" onClick={bank}>
                Bank XP
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
