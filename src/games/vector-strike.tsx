import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { WEAPONS, ARENAS } from "@/lib/instant/catalog";

export function VectorStrike({
  onFinish,
}: {
  onFinish: (payload: { score: number; durationMs: number; meta: Record<string, number | boolean | string> }) => void;
}) {
  const host = useRef<HTMLDivElement | null>(null);
  const [hud, setHud] = useState({ hp: 100, ammo: 28, mag: 28, kills: 0, weapon: WEAPONS[0].name as string });
  const [mode, setMode] = useState<"arena" | "survival">("arena");
  const [arena, setArena] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [needClick, setNeedClick] = useState(true);
  const [done, setDone] = useState<null | { kills: number; score: number }>(null);
  const start = useRef(0);
  const api = useRef<{ stop: () => void; lock: () => void } | null>(null);

  useEffect(() => () => api.current?.stop(), []);

  function begin() {
    if (!host.current) return;
    api.current?.stop();
    setDone(null);
    setPlaying(true);
    setNeedClick(true);
    start.current = performance.now();
    api.current = bootFps(host.current, mode, ARENAS[arena].id, setHud, setNeedClick, (r) => {
      setPlaying(false);
      setDone(r);
    });
  }

  return (
    <div className="relative h-full bg-bg">
      <div ref={host} className="h-full w-full touch-none" />
      {playing ? (
        <>
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-fg" />
            <div className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-fg" />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-between px-4 text-sm">
            <div>
              HP {hud.hp}
              <div className="text-muted">{hud.weapon}</div>
            </div>
            <div className="tabular-nums">
              {hud.ammo}/{hud.mag}
              <div className="text-gold">Elims {hud.kills}</div>
            </div>
          </div>
        </>
      ) : null}
      {needClick && playing ? (
        <button
          type="button"
          className="absolute inset-0 grid place-items-center bg-bg/70"
          onClick={() => api.current?.lock()}
        >
          <span className="rounded-[20px] border border-border bg-surface px-6 py-4">Click to play</span>
        </button>
      ) : null}
      {!playing ? (
        <div className="absolute inset-0 grid place-items-center bg-bg/80 p-4">
          <div className="w-full max-w-md rounded-[24px] border border-border bg-surface p-6">
            <h2 className="font-display text-3xl">{done ? `${done.kills} elims` : "Vector Strike"}</h2>
            <p className="mt-2 text-sm text-muted">WASD · mouse look · click fire · R reload · 1-3 weapons · G grenade</p>
            {!done ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {ARENAS.map((a, i) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setArena(i)}
                    className="rounded-[14px] border px-3 py-2 text-sm"
                    style={{ borderColor: arena === i ? "#6d8cff" : "#232736" }}
                  >
                    {a.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setMode("arena")}
                  className="rounded-[14px] border px-3 py-2 text-sm"
                  style={{ borderColor: mode === "arena" ? "#6d8cff" : "#232736" }}
                >
                  Arena
                </button>
                <button
                  type="button"
                  onClick={() => setMode("survival")}
                  className="rounded-[14px] border px-3 py-2 text-sm"
                  style={{ borderColor: mode === "survival" ? "#6d8cff" : "#232736" }}
                >
                  Survival
                </button>
              </div>
            ) : null}
            <div className="mt-6 flex gap-2">
              <Button onClick={begin}>{done ? "Again" : "Deploy"}</Button>
              {done ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    onFinish({
                      score: done.score,
                      durationMs: Math.floor(performance.now() - start.current),
                      meta: { kills: done.kills, arena: ARENAS[arena].id, mode },
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

type Humanoid = {
  group: THREE.Group;
  head: THREE.Object3D;
  torso: THREE.Object3D;
  hipL: THREE.Object3D;
  hipR: THREE.Object3D;
  shoulderL: THREE.Object3D;
  shoulderR: THREE.Object3D;
  kneeL: THREE.Object3D;
  kneeR: THREE.Object3D;
  elbowL: THREE.Object3D;
  elbowR: THREE.Object3D;
};

/** Builds an articulated low-poly human figure (head, torso, two-segment arms/legs) for enemy AI. */
function buildHumanoid(color: number): Humanoid {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xd8a98a, roughness: 0.7 });
  const suit = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05 });
  const boot = new THREE.MeshStandardMaterial({ color: 0x1b1b20, roughness: 0.8 });

  const hips = new THREE.Group();
  hips.position.y = 0.95;
  group.add(hips);

  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.2), suit);
  hips.add(pelvis);

  const torsoPivot = new THREE.Group();
  torsoPivot.position.y = 0.1;
  hips.add(torsoPivot);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.5, 8), suit);
  torso.position.y = 0.28;
  torsoPivot.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), skin);
  head.position.y = 0.62;
  torsoPivot.add(head);
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.06, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x1a2230, emissive: 0x33465e, emissiveIntensity: 0.6 }),
  );
  visor.position.set(0, 0.63, 0.11);
  torsoPivot.add(visor);

  function buildLimb(shoulderPos: THREE.Vector3, upLen: number, upRadius: number, lowLen: number, lowRadius: number, mat: THREE.Material) {
    const shoulder = new THREE.Group();
    shoulder.position.copy(shoulderPos);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(upRadius, upRadius * 0.85, upLen, 7), mat);
    upper.position.y = -upLen / 2;
    shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.y = -upLen;
    shoulder.add(elbow);
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(lowRadius, lowRadius * 0.8, lowLen, 7), mat);
    lower.position.y = -lowLen / 2;
    elbow.add(lower);
    return { shoulder, elbow };
  }

  const arm1 = buildLimb(new THREE.Vector3(0.22, 0.46, 0), 0.28, 0.07, 0.26, 0.06, suit);
  const arm2 = buildLimb(new THREE.Vector3(-0.22, 0.46, 0), 0.28, 0.07, 0.26, 0.06, suit);
  torsoPivot.add(arm1.shoulder, arm2.shoulder);

  const leg1 = buildLimb(new THREE.Vector3(0.1, 0, 0), 0.36, 0.09, 0.34, 0.08, boot);
  const leg2 = buildLimb(new THREE.Vector3(-0.1, 0, 0), 0.36, 0.09, 0.34, 0.08, boot);
  hips.add(leg1.shoulder, leg2.shoulder);

  return {
    group,
    head,
    torso: torsoPivot,
    hipL: leg1.shoulder,
    hipR: leg2.shoulder,
    shoulderL: arm1.shoulder,
    shoulderR: arm2.shoulder,
    kneeL: leg1.elbow,
    kneeR: leg2.elbow,
    elbowL: arm1.elbow,
    elbowR: arm2.elbow,
  };
}

function bootFps(
  el: HTMLDivElement,
  mode: string,
  arena: string,
  onHud: (h: { hp: number; ammo: number; mag: number; kills: number; weapon: string }) => void,
  onLock: (need: boolean) => void,
  onDone: (r: { kills: number; score: number }) => void,
) {
  const scene = new THREE.Scene();
  const pal = arena === "desert" ? 0xc2a36b : arena === "forest" ? 0x1a2a18 : arena === "city" ? 0x10141c : 0x151820;
  scene.background = new THREE.Color(pal);
  scene.fog = new THREE.Fog(pal, 8, 70);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.autoClear = false;
  el.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(80, el.clientWidth / el.clientHeight, 0.05, 200);
  const yawObj = new THREE.Object3D();
  yawObj.position.set(0, 1.6, 8);
  yawObj.add(camera);
  scene.add(yawObj);

  scene.add(new THREE.HemisphereLight(0xc0d0ff, 0x22180c, 0.8));
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(8, 18, 6);
  scene.add(sun);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: pal }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const walls: THREE.Mesh[] = [];
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a3140 });
  function box(x: number, z: number, w: number, d: number, h = 3) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.position.set(x, h / 2, z);
    scene.add(m);
    walls.push(m);
    return m;
  }
  box(0, -20, 42, 1.2, 5);
  box(0, 20, 42, 1.2, 5);
  box(-20, 0, 1.2, 42, 5);
  box(20, 0, 1.2, 42, 5);
  box(-6, 0, 4, 8, 2);
  box(8, -6, 6, 3, 2);
  box(-2, 9, 3, 6, 1.4);
  box(10, 8, 5, 2, 2.4);

  const overlay = new THREE.Scene();
  const gunCam = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.01, 10);
  const gun = new THREE.Group();
  const rec = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x8b93a7, metalness: 0.7, roughness: 0.3 }),
  );
  rec.position.set(0.22, -0.18, -0.55);
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.05, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x6d8cff, emissive: 0x223366, emissiveIntensity: 0.6 }),
  );
  bar.position.set(0.22, -0.14, -0.85);
  const muzzleFlash = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.22, 8),
    new THREE.MeshBasicMaterial({ color: 0xffe6a0, transparent: true, opacity: 0 }),
  );
  muzzleFlash.rotation.x = -Math.PI / 2;
  muzzleFlash.position.set(0.22, -0.14, -1.06);
  gun.add(rec, bar, muzzleFlash);
  overlay.add(gun);
  overlay.add(new THREE.AmbientLight(0xffffff, 1.4));

  type Enemy = {
    mesh: THREE.Mesh;
    rig: Humanoid;
    hp: number;
    state: "patrol" | "chase" | "hide" | "dead";
    t: number;
    walkT: number;
    fallT: number;
    alive: boolean;
  };
  const enemies: Enemy[] = [];
  const enemyTints = [0x8a2f36, 0x7a3f22, 0x3f4a2f, 0x5a3560, 0x2f4a5a];
  for (let i = 0; i < (mode === "survival" ? 8 : 6); i++) {
    // Invisible capsule hitbox drives raycasting/collision; the humanoid rig is the visible body,
    // kept in sync with the hitbox each frame so limbs can animate independently of hit detection.
    const m = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 1.1, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0xe06a72, transparent: true, opacity: 0 }),
    );
    m.position.set((Math.random() - 0.5) * 28, 1.1, (Math.random() - 0.5) * 28);
    scene.add(m);
    const rig = buildHumanoid(enemyTints[i % enemyTints.length]);
    rig.group.position.copy(m.position);
    rig.group.position.y = 0;
    scene.add(rig.group);
    enemies.push({ mesh: m, rig, hp: 40, state: "patrol", t: Math.random() * 10, walkT: Math.random() * 10, fallT: 0, alive: true });
  }

  const packs: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const p = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x6ed9a0, emissive: 0x14532d, emissiveIntensity: 0.4 }),
    );
    p.position.set((Math.random() - 0.5) * 16, 0.2, (Math.random() - 0.5) * 16);
    scene.add(p);
    packs.push(p);
  }

  let yaw = 0;
  let pitch = 0;
  let hp = 100;
  let weapon = 0;
  let ammo = WEAPONS[0].mag;
  let reserve = 90;
  let cooldown = 0;
  let reload = 0;
  let kills = 0;
  let vel = new THREE.Vector3();
  const keys = new Set<string>();
  let locked = false;
  let fireHeld = false;
  let grenades = 2;
  let ended = false;

  const ray = new THREE.Raycaster();
  const hitmarker = { t: 0 };

  function currentW() {
    return WEAPONS[weapon];
  }

  const onMouse = (e: MouseEvent) => {
    if (!locked) return;
    yaw -= e.movementX * 0.0022;
    pitch -= e.movementY * 0.0022;
    pitch = Math.max(-1.4, Math.min(1.4, pitch));
  };
  const lockChange = () => {
    locked = document.pointerLockElement === renderer.domElement;
    onLock(!locked);
  };
  const kd = (e: KeyboardEvent) => {
    keys.add(e.code);
    if (e.code === "Digit1") weapon = 0;
    if (e.code === "Digit2") weapon = 1;
    if (e.code === "Digit3") weapon = 2;
    if (e.code === "KeyR") reload = 1.4;
    if (e.code === "KeyG" && grenades > 0) {
      grenades -= 1;
      for (const en of enemies) {
        if (!en.alive) continue;
        if (en.mesh.position.distanceTo(yawObj.position) < 7) {
          en.hp -= 40;
          if (en.hp <= 0) {
            en.alive = false;
            en.state = "dead";
            en.mesh.visible = false;
            kills += 1;
          }
        }
      }
    }
  };
  const ku = (e: KeyboardEvent) => keys.delete(e.code);
  const md = () => {
    fireHeld = true;
  };
  const mu = () => {
    fireHeld = false;
  };
  window.addEventListener("mousemove", onMouse);
  document.addEventListener("pointerlockchange", lockChange);
  window.addEventListener("keydown", kd);
  window.addEventListener("keyup", ku);
  renderer.domElement.addEventListener("mousedown", md);
  window.addEventListener("mouseup", mu);

  let last = performance.now();
  let raf = 0;
  const tmpF = new THREE.Vector3();
  const tmpR = new THREE.Vector3();

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    cooldown = Math.max(0, cooldown - dt);
    reload = Math.max(0, reload - dt);
    hitmarker.t = Math.max(0, hitmarker.t - dt);

    yawObj.rotation.y = yaw;
    camera.rotation.x = pitch;

    tmpF.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    tmpR.set(Math.cos(yaw), 0, -Math.sin(yaw));
    const wish = new THREE.Vector3();
    if (keys.has("KeyW")) wish.add(tmpF);
    if (keys.has("KeyS")) wish.sub(tmpF);
    if (keys.has("KeyD")) wish.add(tmpR);
    if (keys.has("KeyA")) wish.sub(tmpR);
    if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(keys.has("ShiftLeft") ? 14 : 9);
    vel.lerp(wish, 1 - Math.exp(-10 * dt));
    yawObj.position.addScaledVector(vel, dt);
    yawObj.position.x = THREE.MathUtils.clamp(yawObj.position.x, -18.5, 18.5);
    yawObj.position.z = THREE.MathUtils.clamp(yawObj.position.z, -18.5, 18.5);
    yawObj.position.y = 1.6 + Math.sin(now * 0.012 * vel.length()) * 0.03;

    for (const w of walls) {
      const dx = yawObj.position.x - w.position.x;
      const dz = yawObj.position.z - w.position.z;
      const hx = 3;
      const hz = 3;
      if (Math.abs(dx) < hx && Math.abs(dz) < hz) {
        if (hx - Math.abs(dx) < hz - Math.abs(dz)) yawObj.position.x += Math.sign(dx) * (hx - Math.abs(dx));
        else yawObj.position.z += Math.sign(dz) * (hz - Math.abs(dz));
      }
    }

    const wpn = currentW();
    if (reload === 0 && ammo < wpn.mag && keys.has("KeyR")) reload = 1.4;
    if (reload > 0 && reload < dt) {
      const need = wpn.mag - ammo;
      const take = Math.min(need, reserve);
      ammo += take;
      reserve -= take;
    }
    if (fireHeld && cooldown <= 0 && reload <= 0 && ammo > 0 && locked) {
      ammo -= 1;
      cooldown = 60 / wpn.rpm;
      camera.rotation.x -= 0.02;
      (muzzleFlash.material as THREE.MeshBasicMaterial).opacity = 1;
      muzzleFlash.scale.setScalar(0.85 + Math.random() * 0.4);
      ray.setFromCamera(new THREE.Vector2(0, 0), camera);
      const hits = ray.intersectObjects(enemies.filter((e) => e.alive).map((e) => e.mesh));
      if (hits[0]) {
        const en = enemies.find((e) => e.mesh === hits[0].object);
        if (en) {
          en.hp -= wpn.dmg;
          hitmarker.t = 0.12;
          const flashMat = (en.rig.torso.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
          flashMat.emissive = new THREE.Color(0xffffff);
          setTimeout(() => {
            flashMat.emissive = new THREE.Color(en.alive ? 0x000000 : 0x000000);
          }, 80);
          if (en.hp <= 0) {
            en.alive = false;
            en.state = "dead";
            en.mesh.visible = false;
            kills += 1;
          }
        }
      }
    }

    for (const en of enemies) {
      if (!en.alive) {
        // Ragdoll-ish fall: topple the torso forward and sink into the ground, then hold.
        en.fallT = Math.min(1, en.fallT + dt * 2.2);
        en.rig.torso.rotation.x = THREE.MathUtils.lerp(en.rig.torso.rotation.x, Math.PI / 2, en.fallT);
        en.rig.group.position.y = THREE.MathUtils.lerp(en.rig.group.position.y, -0.3, en.fallT);
        continue;
      }
      en.t += dt;
      const toPlayer = yawObj.position.clone().sub(en.mesh.position);
      const dist = toPlayer.length();
      if (dist < 14) en.state = "chase";
      else if (dist > 20) en.state = "patrol";
      let moveSpeed = 0;
      if (en.state === "patrol") {
        const dx = Math.sin(en.t) * 1.6 * dt;
        const dz = Math.cos(en.t * 0.7) * 1.6 * dt;
        en.mesh.position.x += dx;
        en.mesh.position.z += dz;
        moveSpeed = Math.hypot(dx, dz) / Math.max(dt, 0.0001);
        en.rig.group.rotation.y = Math.atan2(dx, dz);
      } else {
        toPlayer.y = 0;
        toPlayer.normalize();
        en.mesh.position.addScaledVector(toPlayer, 3.2 * dt);
        en.rig.group.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
        moveSpeed = 3.2;
        if (dist < 12 && Math.random() < dt * 0.6) {
          hp -= 6;
        }
      }
      en.mesh.position.x = THREE.MathUtils.clamp(en.mesh.position.x, -18, 18);
      en.mesh.position.z = THREE.MathUtils.clamp(en.mesh.position.z, -18, 18);

      // Sync the visible rig to the hitbox and drive a simple walk cycle.
      en.rig.group.position.x = en.mesh.position.x;
      en.rig.group.position.z = en.mesh.position.z;
      en.walkT += dt * (moveSpeed > 0.05 ? 6.5 : 1.2);
      const swing = moveSpeed > 0.05 ? Math.sin(en.walkT) * 0.7 : Math.sin(en.walkT) * 0.06;
      en.rig.hipL.rotation.x = swing;
      en.rig.hipR.rotation.x = -swing;
      en.rig.kneeL.rotation.x = Math.max(0, -swing) * 1.1;
      en.rig.kneeR.rotation.x = Math.max(0, swing) * 1.1;
      en.rig.shoulderL.rotation.x = -swing * 0.8;
      en.rig.shoulderR.rotation.x = swing * 0.8;
      const tint = (en.rig.torso.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      tint.emissive = new THREE.Color(en.state === "chase" ? 0x330000 : 0x000000);
    }

    for (const p of packs) {
      if (p.visible && p.position.distanceTo(yawObj.position) < 1.4) {
        hp = Math.min(100, hp + 35);
        p.visible = false;
      }
    }

    gun.position.set(0.02, -0.02 + Math.sin(now * 0.008) * 0.01, -0.02);
    const flashMat = muzzleFlash.material as THREE.MeshBasicMaterial;
    flashMat.opacity = Math.max(0, flashMat.opacity - dt * 10);
    onHud({ hp: Math.max(0, Math.floor(hp)), ammo, mag: wpn.mag, kills, weapon: wpn.name });

    if ((hp <= 0 || (mode === "arena" && enemies.every((e) => !e.alive))) && !ended) {
      ended = true;
      onDone({ kills, score: kills * 220 + Math.floor(hp) * 4 });
    }

    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(overlay, gunCam);
  };
  raf = requestAnimationFrame(loop);

  const onResize = () => {
    const a = el.clientWidth / Math.max(1, el.clientHeight);
    camera.aspect = a;
    gunCam.aspect = a;
    camera.updateProjectionMatrix();
    gunCam.updateProjectionMatrix();
    renderer.setSize(el.clientWidth, el.clientHeight);
  };
  window.addEventListener("resize", onResize);

  return {
    lock: () => {
      const p = renderer.domElement.requestPointerLock?.({ unadjustedMovement: true } as never);
      if (p && typeof (p as Promise<void>).catch === "function") {
        (p as Promise<void>).catch(() => renderer.domElement.requestPointerLock());
      }
    },
    stop: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("pointerlockchange", lockChange);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("mouseup", mu);
      window.removeEventListener("resize", onResize);
      if (document.pointerLockElement) document.exitPointerLock();
      renderer.dispose();
      el.replaceChildren();
    },
  };
}
