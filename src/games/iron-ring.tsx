import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FIGHTERS } from "@/lib/instant/catalog";

type F = {
  x: number;
  y: number;
  vx: number;
  hp: number;
  dir: 1 | -1;
  stun: number;
  attack: null | { kind: "punch" | "kick" | "special"; t: number };
  combo: number;
  animT: number;
  hitFlash: number;
};

export function IronRing({
  onFinish,
}: {
  onFinish: (payload: { score: number; durationMs: number; meta: Record<string, number | boolean | string> }) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pick, setPick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState<null | { win: boolean; combo: number; score: number }>(null);
  const [hud, setHud] = useState({ you: 100, cpu: 100, combo: 0 });
  const start = useRef(0);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  function begin() {
    const c = canvasRef.current;
    if (!c) return;
    stopRef.current?.();
    setDone(null);
    setPlaying(true);
    start.current = performance.now();
    stopRef.current = bootFight(c, FIGHTERS[pick], setHud, (r) => {
      setPlaying(false);
      setDone(r);
    });
  }

  return (
    <div className="relative h-full bg-bg">
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
      {playing ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-between px-4">
          <div className="w-40">
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full bg-accent" style={{ width: `${hud.you}%` }} />
            </div>
            <div className="mt-1 text-xs">{FIGHTERS[pick].name}</div>
          </div>
          <div className="text-gold">{hud.combo > 1 ? `×${hud.combo}` : ""}</div>
          <div className="w-40 text-right">
            <div className="ml-auto h-2 w-40 overflow-hidden rounded-full bg-surface-2">
              <div className="ml-auto h-full bg-destructive" style={{ width: `${hud.cpu}%` }} />
            </div>
            <div className="mt-1 text-xs">Rival</div>
          </div>
        </div>
      ) : null}
      {playing ? (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 md:hidden">
          {["A", "D", "J", "K", "L"].map((k) => (
            <button
              key={k}
              type="button"
              className="h-12 w-12 rounded-[12px] border border-border bg-surface/80"
              onPointerDown={() => {
                const map: Record<string, string> = { A: "KeyA", D: "KeyD", J: "KeyJ", K: "KeyK", L: "KeyL" };
                canvasRef.current?.dispatchEvent(new KeyboardEvent("keydown", { code: map[k] }));
                window.dispatchEvent(new KeyboardEvent("keydown", { code: map[k] }));
              }}
              onPointerUp={() => {
                const map: Record<string, string> = { A: "KeyA", D: "KeyD", J: "KeyJ", K: "KeyK", L: "KeyL" };
                window.dispatchEvent(new KeyboardEvent("keyup", { code: map[k] }));
              }}
            >
              {k}
            </button>
          ))}
        </div>
      ) : null}
      {!playing ? (
        <div className="absolute inset-0 grid place-items-center bg-bg/80 p-4">
          <div className="w-full max-w-lg rounded-[24px] border border-border bg-surface p-6">
            <h2 className="font-display text-3xl">{done ? (done.win ? "Winner" : "Down") : "Iron Ring"}</h2>
            <p className="mt-2 text-sm text-muted">A/D move · J punch · K kick · L special. Slow-mo on the finish.</p>
            {!done ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {FIGHTERS.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPick(i)}
                    className="rounded-[14px] border px-3 py-2 text-left text-sm"
                    style={{ borderColor: pick === i ? f.color : "#232736" }}
                  >
                    <div className="font-medium">{f.name}</div>
                    <div className="text-xs text-muted">{f.title}</div>
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-6 flex gap-2">
              <Button onClick={begin}>{done ? "Rematch" : "Fight"}</Button>
              {done ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    onFinish({
                      score: done.score,
                      durationMs: Math.floor(performance.now() - start.current),
                      meta: { win: done.win, combo: done.combo, fighter: FIGHTERS[pick].id },
                    })
                  }
                >
                  Bank XP
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function bootFight(
  canvas: HTMLCanvasElement,
  youF: (typeof FIGHTERS)[number],
  onHud: (h: { you: number; cpu: number; combo: number }) => void,
  onDone: (r: { win: boolean; combo: number; score: number }) => void,
) {
  const keys = new Set<string>();
  const kd = (e: KeyboardEvent) => keys.add(e.code);
  const ku = (e: KeyboardEvent) => keys.delete(e.code);
  window.addEventListener("keydown", kd);
  window.addEventListener("keyup", ku);
  const you: F = { x: 180, y: 0, vx: 0, hp: 100, dir: 1, stun: 0, attack: null, combo: 0, animT: 0, hitFlash: 0 };
  const cpu: F = { x: 520, y: 0, vx: 0, hp: 100, dir: -1, stun: 0, attack: null, combo: 0, animT: 0, hitFlash: 0 };
  let last = performance.now();
  let raf = 0;
  let slow = 1;
  let ended = false;
  let bestCombo = 0;
  const ground = 0;

  function strike(att: F, def: F, dmg: number, knock: number) {
    const reach = att.attack?.kind === "special" ? 88 : att.attack?.kind === "kick" ? 74 : 58;
    if (Math.abs(att.x + att.dir * 30 - def.x) < reach && att.stun <= 0) {
      def.hp -= dmg;
      def.vx = att.dir * knock;
      def.stun = 0.22;
      def.hitFlash = 0.18;
      att.combo += 1;
      bestCombo = Math.max(bestCombo, att.combo);
      if (def.hp <= 0) slow = 0.28;
    }
  }

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, ((now - last) / 1000) * slow);
    last = now;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#07080d";
    ctx.fillRect(0, 0, w, h);
    const floorY = h * 0.72;
    ctx.fillStyle = "#101218";
    ctx.fillRect(0, floorY, w, h - floorY);
    ctx.fillStyle = "#232736";
    ctx.fillRect(w * 0.08, floorY - 8, w * 0.84, 8);

    you.stun = Math.max(0, you.stun - dt);
    cpu.stun = Math.max(0, cpu.stun - dt);
    you.hitFlash = Math.max(0, you.hitFlash - dt);
    cpu.hitFlash = Math.max(0, cpu.hitFlash - dt);
    you.animT += dt * (1 + Math.abs(you.vx) / 120);
    cpu.animT += dt * (1 + Math.abs(cpu.vx) / 120);
    if (you.attack) {
      you.attack.t -= dt;
      if (you.attack.t <= 0) you.attack = null;
    }
    if (cpu.attack) {
      cpu.attack.t -= dt;
      if (cpu.attack.t <= 0) cpu.attack = null;
    }

    if (you.stun <= 0 && !ended) {
      if (keys.has("KeyA") || keys.has("ArrowLeft")) you.vx = -220;
      else if (keys.has("KeyD") || keys.has("ArrowRight")) you.vx = 220;
      else you.vx *= 1 - 8 * dt;
      if (!you.attack) {
        if (keys.has("KeyJ")) you.attack = { kind: "punch", t: 0.22 };
        else if (keys.has("KeyK")) you.attack = { kind: "kick", t: 0.32 };
        else if (keys.has("KeyL")) you.attack = { kind: "special", t: 0.5 };
        if (you.attack) {
          const dmg = you.attack.kind === "special" ? 18 : you.attack.kind === "kick" ? 12 : 8;
          strike(you, cpu, dmg, 280);
        }
      }
    } else you.vx *= 1 - 6 * dt;

    if (cpu.stun <= 0 && !ended) {
      const dx = you.x - cpu.x;
      cpu.dir = dx > 0 ? 1 : -1;
      if (Math.abs(dx) > 70) cpu.vx = cpu.dir * 160;
      else cpu.vx *= 1 - 8 * dt;
      if (!cpu.attack && Math.abs(dx) < 80 && Math.random() < dt * 1.6) {
        cpu.attack = { kind: Math.random() < 0.2 ? "special" : Math.random() < 0.5 ? "kick" : "punch", t: 0.28 };
        const dmg = cpu.attack.kind === "special" ? 14 : 9;
        strike(cpu, you, dmg, 240);
        you.combo = 0;
      }
    }

    you.x += you.vx * dt;
    cpu.x += cpu.vx * dt;
    you.x = Math.max(40, Math.min(w - 40, you.x));
    cpu.x = Math.max(40, Math.min(w - 40, cpu.x));
    you.dir = you.x < cpu.x ? 1 : -1;

    drawBody(ctx, you, floorY, youF.color, true);
    drawBody(ctx, cpu, floorY, "#e06a72", false);
    onHud({ you: Math.max(0, you.hp), cpu: Math.max(0, cpu.hp), combo: you.combo });

    if (!ended && (you.hp <= 0 || cpu.hp <= 0)) {
      ended = true;
      const win = cpu.hp <= 0;
      setTimeout(() => {
        onDone({ win, combo: bestCombo, score: (win ? 1800 : 400) + bestCombo * 120 + Math.max(0, you.hp) * 6 });
      }, 700);
    }
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("keydown", kd);
    window.removeEventListener("keyup", ku);
  };
}

/** Draws a two-joint-per-limb articulated human figure: head, spine, shoulders/elbows, hips/knees. */
function drawBody(ctx: CanvasRenderingContext2D, f: F, floorY: number, color: string, _you: boolean) {
  const x = f.x;
  const footY = floorY - f.y;
  const walking = Math.abs(f.vx) > 30 && f.stun <= 0 && !f.attack;
  const walkCycle = Math.sin(f.animT * 9);
  const breathe = Math.sin(f.animT * 2.4) * 1.2;
  const kind = f.attack?.kind ?? null;
  const attackProgress = f.attack ? 1 - Math.max(0, f.attack.t) / (kind === "special" ? 0.5 : kind === "kick" ? 0.32 : 0.22) : 0;
  const swing = Math.sin(Math.min(1, attackProgress) * Math.PI); // 0 -> 1 -> 0 ease over the attack window

  // Torso lean: forward into an attack, back slightly when stunned/hit.
  const lean = kind ? swing * 0.16 : f.stun > 0 ? -0.1 : 0;
  // Local frame is anchored at the hip so the lean rotation pivots at the waist, not the feet.
  const hipY = 0;
  const footY_local = 64;
  const shoulderY = -46 + breathe * 0.4;
  const headY = shoulderY - 22;

  ctx.save();
  ctx.translate(x, footY - footY_local);
  ctx.scale(f.dir, 1);
  ctx.rotate(lean * 0.12);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Hit-flash: brief white outline overlay when just struck.
  const flashAlpha = f.hitFlash > 0 ? f.hitFlash / 0.18 : 0;

  // --- Legs (hip -> knee -> ankle) ---
  const hipSpacing = 8;
  function drawLeg(sideSign: number, frontLeg: boolean) {
    const hipX = sideSign * hipSpacing;
    let thighAngle = 0.08 * sideSign + (walking ? walkCycle * sideSign * 0.5 : 0);
    let shinAngle = walking ? Math.max(0, -walkCycle * sideSign) * 0.6 : 0.1;
    if (kind === "kick" && frontLeg) {
      // Kicking leg: thigh drives forward and the shin snaps straight at full extension.
      thighAngle = swing * 1.05;
      shinAngle = -swing * 1.0 + Math.max(0, swing - 0.6) * 1.6;
    } else if (kind === "kick") {
      thighAngle = -0.12; // planted support leg
      shinAngle = 0.15;
    }
    const thighLen = 34;
    const shinLen = 30;
    const kneeX = hipX + Math.sin(thighAngle) * thighLen;
    const kneeYAbs = hipY + Math.cos(thighAngle) * thighLen;
    const ankleX = kneeX + Math.sin(thighAngle + shinAngle) * shinLen;
    const ankleYAbs = kneeYAbs + Math.cos(thighAngle + shinAngle) * shinLen;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(kneeX, kneeYAbs);
    ctx.stroke();
    ctx.lineWidth = 7.5;
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeYAbs);
    ctx.lineTo(ankleX, ankleYAbs);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(ankleX + 6, ankleYAbs, 8, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  drawLeg(-1, false);
  drawLeg(1, true);

  // --- Hips + torso (tapered quad) ---
  ctx.beginPath();
  ctx.moveTo(-11, hipY - 2);
  ctx.lineTo(11, hipY - 2);
  ctx.lineTo(8, shoulderY);
  ctx.lineTo(-8, shoulderY);
  ctx.closePath();
  ctx.fill();

  // --- Arms (shoulder -> elbow -> fist) ---
  const shoulderSpacing = 9;
  function drawArm(sideSign: number, isLead: boolean) {
    const shoulderX = sideSign * shoulderSpacing;
    let upperAngle = 0.25 * sideSign - (walking ? walkCycle * sideSign * 0.35 : 0);
    let foreAngle = -0.3;
    if (kind === "punch" && isLead) {
      upperAngle = swing * 1.15;
      foreAngle = -0.35 + swing * 0.55;
    } else if (kind === "kick") {
      upperAngle = 0.9 * sideSign * -0.4;
      foreAngle = -0.6;
    } else if (kind === "special") {
      upperAngle = swing * 1.3 * (isLead ? 1 : 0.6);
      foreAngle = -0.2 + swing * 0.5;
    } else if (f.stun > 0) {
      upperAngle = 0.6;
      foreAngle = -0.8;
    }
    const upperLen = 24;
    const foreLen = 22;
    const elbowX = shoulderX + Math.sin(upperAngle) * upperLen;
    const elbowYAbs = shoulderY + Math.cos(upperAngle) * upperLen;
    const fistX = elbowX + Math.sin(upperAngle + foreAngle) * foreLen;
    const fistYAbs = elbowYAbs + Math.cos(upperAngle + foreAngle) * foreLen;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(elbowX, elbowYAbs);
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(elbowX, elbowYAbs);
    ctx.lineTo(fistX, fistYAbs);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(fistX, fistYAbs, 5, 0, Math.PI * 2);
    ctx.fill();
    return { fistX, fistYAbs };
  }
  drawArm(-1, false);
  const lead = drawArm(1, true);

  // --- Head + neck ---
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, shoulderY);
  ctx.lineTo(0, headY + 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, headY, 12, 0, Math.PI * 2);
  ctx.fill();
  // Facing indicator (a small notch toward the direction faced).
  ctx.fillStyle = "#0a0b10";
  ctx.beginPath();
  ctx.arc(6, headY - 1, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Special-move energy ring around the lead fist.
  if (kind === "special") {
    ctx.strokeStyle = "#d4b56a";
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.5 + swing * 0.5;
    ctx.beginPath();
    ctx.arc(lead.fistX, lead.fistYAbs, 16 + swing * 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Hit flash outline.
  if (flashAlpha > 0) {
    ctx.strokeStyle = `rgba(255,255,255,${flashAlpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, shoulderY + 20, 26, 46, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
