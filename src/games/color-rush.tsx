import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const COLORS = [
  { id: 0, name: "Blue", hex: "#6d8cff" },
  { id: 1, name: "Violet", hex: "#8b7cff" },
  { id: 2, name: "Gold", hex: "#d4b56a" },
  { id: 3, name: "Mint", hex: "#6ed9a0" },
];

export function ColorRush({
  onFinish,
}: {
  onFinish: (payload: { score: number; durationMs: number; meta: Record<string, number | boolean> }) => void;
}) {
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [target, setTarget] = useState(0);
  const [over, setOver] = useState(false);
  const [misses, setMisses] = useState(0);
  const start = useRef(0);
  const last = useRef(0);
  const acc = useRef(0);
  const interval = useRef(1100);
  const targetRef = useRef(0);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const y = useRef(-40);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const loop = (t: number) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== w * dpr) {
        c.width = w * dpr;
        c.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#07080d";
      ctx.fillRect(0, 0, w, h);
      if (running) {
        const dt = Math.min(0.1, (t - last.current) / 1000 || 0.016);
        last.current = t;
        acc.current += dt;
        y.current += (220 + scoreRef.current * 4) * dt;
        if (y.current > h - 80) {
          miss();
        }
      }
      ctx.fillStyle = COLORS[targetRef.current].hex;
      const gw = Math.min(280, w * 0.5);
      ctx.fillRect((w - gw) / 2, y.current, gw, 28);
      ctx.fillStyle = "#eef0f6";
      ctx.font = "600 18px Outfit, sans-serif";
      ctx.fillText(String(scoreRef.current), 16, 28);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  function spawn() {
    const n = Math.floor(Math.random() * 4);
    targetRef.current = n;
    setTarget(n);
    y.current = -40;
  }

  function miss() {
    livesRef.current -= 1;
    setLives(livesRef.current);
    setMisses((m) => m + 1);
    if (livesRef.current <= 0) {
      setRunning(false);
      setOver(true);
      return;
    }
    spawn();
  }

  function hit(id: number) {
    if (!running) return;
    if (id === targetRef.current) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      interval.current = Math.max(420, interval.current - 12);
      spawn();
    } else miss();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, number> = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 };
      if (e.code in map) hit(map[e.code]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function startRun() {
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    setMisses(0);
    setOver(false);
    setRunning(true);
    start.current = performance.now();
    last.current = performance.now();
    spawn();
  }

  return (
    <div className="relative flex h-full flex-col bg-bg">
      <canvas ref={canvas} className="min-h-0 flex-1 w-full touch-none" />
      <div className="grid grid-cols-4 gap-2 p-3">
        {COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => hit(c.id)}
            className="h-14 rounded-[14px] text-sm font-medium text-bg"
            style={{ background: c.hex }}
          >
            {c.name}
          </button>
        ))}
      </div>
      {!running ? (
        <div className="absolute inset-0 grid place-items-center bg-bg/80 p-6">
          <div className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-6 text-center">
            <h2 className="font-display text-3xl">{over ? `Run ${score}` : "Color Rush"}</h2>
            <p className="mt-2 text-sm text-muted">Match the falling gate. Keys 1–4. Three lives.</p>
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={startRun}>{over ? "Again" : "Start"}</Button>
              {over ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    onFinish({
                      score,
                      durationMs: Math.floor(performance.now() - start.current),
                      meta: { score, misses, clean: misses === 0 },
                    })
                  }
                >
                  Bank XP
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute left-4 top-4 text-xs uppercase tracking-[0.16em] text-muted">
          Lives {lives}
        </div>
      )}
    </div>
  );
}
