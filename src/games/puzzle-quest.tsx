import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const SIZE = 8;
const COLORS = ["#6d8cff", "#8b7cff", "#d4b56a", "#6ed9a0", "#e06a72", "#e0b45c"];

type Cell = number;

function levelSpec(level: number) {
  const colors = Math.min(6, 4 + Math.floor((level - 1) / 20));
  const moves = Math.max(12, 28 - Math.floor(level / 8));
  const target = 1200 + level * 80;
  return { colors, moves, target };
}

function hasMatch(grid: Cell[]) {
  for (let r = 0; r < SIZE; r++) {
    let run = 1;
    for (let c = 1; c < SIZE; c++) {
      const i = r * SIZE + c;
      if (grid[i] === grid[i - 1] && grid[i] >= 0) run++;
      else run = 1;
      if (run >= 3) return true;
    }
  }
  for (let c = 0; c < SIZE; c++) {
    let run = 1;
    for (let r = 1; r < SIZE; r++) {
      const i = r * SIZE + c;
      if (grid[i] === grid[i - SIZE] && grid[i] >= 0) run++;
      else run = 1;
      if (run >= 3) return true;
    }
  }
  return false;
}

function findMatches(grid: Cell[]) {
  const marked = new Set<number>();
  for (let r = 0; r < SIZE; r++) {
    let run = 1;
    for (let c = 1; c <= SIZE; c++) {
      const same = c < SIZE && grid[r * SIZE + c] === grid[r * SIZE + c - 1] && grid[r * SIZE + c] >= 0;
      if (same) run++;
      else {
        if (run >= 3) for (let k = 0; k < run; k++) marked.add(r * SIZE + c - 1 - k);
        run = 1;
      }
    }
  }
  for (let c = 0; c < SIZE; c++) {
    let run = 1;
    for (let r = 1; r <= SIZE; r++) {
      const same = r < SIZE && grid[r * SIZE + c] === grid[(r - 1) * SIZE + c] && grid[r * SIZE + c] >= 0;
      if (same) run++;
      else {
        if (run >= 3) for (let k = 0; k < run; k++) marked.add((r - 1 - k) * SIZE + c);
        run = 1;
      }
    }
  }
  return marked;
}

function fill(rng: () => number, colors: number): Cell[] {
  const g: Cell[] = Array(SIZE * SIZE);
  for (let i = 0; i < g.length; i++) g[i] = Math.floor(rng() * colors);
  return g;
}

function mulberry(seed: number) {
  let s = seed | 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate(level: number) {
  const { colors } = levelSpec(level);
  for (let attempt = 0; attempt < 80; attempt++) {
    const rng = mulberry(level * 997 + attempt * 13);
    const g = fill(rng, colors);
    if (!hasMatch(g)) return g;
  }
  return fill(mulberry(level), colors);
}

function gravity(grid: Cell[], colors: number, rng: () => number) {
  const next = grid.slice();
  for (let c = 0; c < SIZE; c++) {
    let write = SIZE - 1;
    for (let r = SIZE - 1; r >= 0; r--) {
      const i = r * SIZE + c;
      if (next[i] >= 0) {
        next[write * SIZE + c] = next[i];
        if (write !== r) next[i] = -1;
        write--;
      }
    }
    for (let r = write; r >= 0; r--) next[r * SIZE + c] = Math.floor(rng() * colors);
  }
  return next;
}

function adjacent(a: number, b: number) {
  const ar = Math.floor(a / SIZE), ac = a % SIZE;
  const br = Math.floor(b / SIZE), bc = b % SIZE;
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
}

export function PuzzleQuest({
  onFinish,
}: {
  onFinish: (payload: { score: number; durationMs: number; meta: Record<string, number | boolean> }) => void;
}) {
  const [level, setLevel] = useState(() => {
    try {
      return Math.min(100, Math.max(1, Number(localStorage.getItem("instant.puzzle.level") || 1)));
    } catch {
      return 1;
    }
  });
  const spec = useMemo(() => levelSpec(level), [level]);
  const [grid, setGrid] = useState<Cell[]>(() => generate(level));
  const [sel, setSel] = useState<number | null>(null);
  const [moves, setMoves] = useState(spec.moves);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [busy, setBusy] = useState(false);
  const [stars, setStars] = useState(0);
  const [status, setStatus] = useState<"play" | "win" | "lose">("play");
  const start = useRef(performance.now());
  const rng = useRef(mulberry(level + 99));

  const resolve = useCallback(
    async (startGrid: Cell[], startCombo: number) => {
      let g = startGrid.slice();
      let localCombo = startCombo;
      let gained = 0;
      for (let safety = 0; safety < 12; safety++) {
        const marks = findMatches(g);
        if (marks.size === 0) break;
        gained += marks.size * 40 * localCombo;
        const cleared = g.map((v, i) => (marks.has(i) ? -1 : v));
        g = gravity(cleared, spec.colors, rng.current);
        localCombo += 1;
        setGrid(g.slice());
        setCombo(localCombo);
        await new Promise((r) => setTimeout(r, 160));
      }
      setScore((s) => s + gained);
      setCombo(1);
      return g;
    },
    [spec.colors],
  );

  useEffect(() => {
    rng.current = mulberry(level + 99);
    setGrid(generate(level));
    setMoves(spec.moves);
    setSel(null);
    setStatus("play");
    setCombo(1);
  }, [level, spec.moves]);

  async function tap(i: number) {
    if (busy || status !== "play") return;
    if (sel === null) {
      setSel(i);
      return;
    }
    if (sel === i) {
      setSel(null);
      return;
    }
    if (!adjacent(sel, i)) {
      setSel(i);
      return;
    }
    const next = grid.slice();
    [next[sel], next[i]] = [next[i], next[sel]];
    if (!hasMatch(next)) {
      setSel(null);
      return;
    }
    setBusy(true);
    setGrid(next);
    setSel(null);
    setMoves((m) => m - 1);
    const settled = await resolve(next, 1);
    setBusy(false);
    const left = moves - 1;
    if (score + 1 >= spec.target || findMatches(settled).size === 0) {
      if (score >= spec.target * 0.4 || left >= 0) {
        const s = left >= spec.moves * 0.5 ? 3 : left >= spec.moves * 0.25 ? 2 : 1;
        setStars(s);
        setStatus("win");
        try {
          const best = Number(localStorage.getItem("instant.puzzle.level") || 1);
          localStorage.setItem("instant.puzzle.level", String(Math.max(best, Math.min(100, level + 1))));
        } catch {
          /* ignore */
        }
      }
    }
    if (left <= 0 && status === "play") {
      setTimeout(() => {
        setStatus((cur) => (cur === "win" ? cur : "lose"));
      }, 200);
    }
  }

  function finish(win: boolean) {
    onFinish({
      score: score + (win ? stars * 200 : 0) + level * 10,
      durationMs: Math.floor(performance.now() - start.current),
      meta: { level, stars, win },
    });
  }

  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <div>
          Level {level}/100
          <span className="ml-3 text-muted">Moves {moves}</span>
        </div>
        <div className="tabular-nums text-gold">
          {score} <span className="text-muted">/ {spec.target}</span>
        </div>
      </div>
      {combo > 1 ? <div className="px-4 text-xs uppercase tracking-[0.16em] text-accent">Combo ×{combo}</div> : null}
      <div className="mx-auto grid w-full max-w-md flex-1 grid-cols-8 gap-1 p-3 content-center">
        {grid.map((c, i) => (
          <button
            key={i}
            type="button"
            aria-label={`gem ${i}`}
            onClick={() => void tap(i)}
            className="aspect-square rounded-[10px] transition-transform duration-150"
            style={{
              background: COLORS[c] ?? "#232736",
              outline: sel === i ? "2px solid #eef0f6" : "none",
              transform: sel === i ? "scale(0.92)" : "scale(1)",
            }}
          />
        ))}
      </div>
      {status !== "play" ? (
        <div className="absolute inset-0 grid place-items-center bg-bg/80 p-6">
          <div className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-6 text-center">
            <h2 className="font-display text-3xl">{status === "win" ? "Board clear" : "Out of moves"}</h2>
            <p className="mt-2 text-sm text-muted">
              {status === "win" ? `${stars} star${stars === 1 ? "" : "s"}` : "Retry or cash out XP."}
            </p>
            <div className="mt-6 flex justify-center gap-2">
              {status === "win" && level < 100 ? (
                <Button onClick={() => setLevel((l) => l + 1)}>Next</Button>
              ) : (
                <Button onClick={() => setLevel(level)}>Retry</Button>
              )}
              <Button variant="secondary" onClick={() => finish(status === "win")}>
                Bank XP
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
