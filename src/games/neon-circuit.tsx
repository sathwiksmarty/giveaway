import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { CARS, TRACKS } from "@/lib/instant/catalog";

type Probe = {
  getYaw: () => number;
  getSpeed: () => number;
  setSteer?: (v: number) => void;
  setKeys?: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: Probe;
  }
}

export function NeonCircuit({
  onFinish,
}: {
  onFinish: (payload: { score: number; durationMs: number; meta: Record<string, number | boolean | string> }) => void;
}) {
  const host = useRef<HTMLDivElement | null>(null);
  const [hud, setHud] = useState({ speed: 0, gear: 1, lap: 1, nitro: 1, drift: 0, cam: "chase" });
  const [selCar, setSelCar] = useState(0);
  const [selTrack, setSelTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState<null | { pos: number; drift: number; clean: boolean; score: number }>(null);
  const start = useRef(0);
  const api = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    return () => api.current?.stop();
  }, []);

  function startRace() {
    if (!host.current) return;
    api.current?.stop();
    setDone(null);
    setPlaying(true);
    start.current = performance.now();
    api.current = bootRace(host.current, CARS[selCar], TRACKS[selTrack], setHud, (result) => {
      setPlaying(false);
      setDone(result);
    });
  }

  return (
    <div className="relative h-full bg-bg">
      <div ref={host} className="h-full w-full touch-none" />
      {playing ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4 text-sm">
          <div>
            <div className="font-display text-3xl tabular-nums">{hud.speed} km/h</div>
            <div className="text-muted">
              Gear {hud.gear} · Lap {hud.lap}/3 · Nitro {Math.round(hud.nitro * 100)}%
            </div>
          </div>
          <div className="text-right text-gold">Drift {Math.floor(hud.drift)}</div>
        </div>
      ) : null}
      {playing ? (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 md:hidden">
          {["steerL", "gas", "brake", "steerR", "nitro"].map((k) => (
            <button
              key={k}
              type="button"
              className="h-14 min-w-14 rounded-[14px] border border-border bg-surface/80 px-3 text-xs uppercase"
              onPointerDown={(e) => {
                e.preventDefault();
                window.__controlsTest?.setKeys?.(
                  k === "steerL"
                    ? ["KeyA", "KeyW"]
                    : k === "steerR"
                      ? ["KeyD", "KeyW"]
                      : k === "gas"
                        ? ["KeyW"]
                        : k === "brake"
                          ? ["KeyS"]
                          : ["KeyW", "ShiftLeft"],
                );
              }}
              onPointerUp={() => window.__controlsTest?.setKeys?.([])}
            >
              {k === "steerL" ? "A" : k === "steerR" ? "D" : k === "gas" ? "W" : k === "brake" ? "S" : "N2"}
            </button>
          ))}
        </div>
      ) : null}
      {!playing ? (
        <div className="absolute inset-0 grid place-items-center bg-bg/80 p-4">
          <div className="w-full max-w-lg rounded-[24px] border border-border bg-surface p-6">
            <h2 className="font-display text-3xl">{done ? "Race complete" : "Neon Circuit"}</h2>
            {done ? (
              <p className="mt-2 text-sm text-muted">
                P{done.pos} · drift {Math.floor(done.drift)} · {done.clean ? "clean" : "contact"}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">W accelerate · A/D steer · Shift nitro · Space drift · C camera</p>
            )}
            {!done ? (
              <>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {CARS.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelCar(i)}
                      className="rounded-[14px] border px-3 py-2 text-left text-sm"
                      style={{ borderColor: selCar === i ? c.color : "#232736" }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {TRACKS.map((t, i) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelTrack(i)}
                      className="rounded-[14px] border border-border px-3 py-2 text-left text-sm"
                      style={{ borderColor: selTrack === i ? "#6d8cff" : "#232736" }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
            <div className="mt-6 flex gap-2">
              <Button onClick={startRace}>{done ? "Race again" : "Start"}</Button>
              {done ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    onFinish({
                      score: done.score,
                      durationMs: Math.floor(performance.now() - start.current),
                      meta: {
                        position: done.pos,
                        drift: done.drift,
                        clean: done.clean,
                        car: CARS[selCar].id,
                        track: TRACKS[selTrack].id,
                      },
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

type CarRig = {
  group: THREE.Group;
  wheels: THREE.Object3D[];
  brakeLights: THREE.Mesh[];
  headlights: THREE.Mesh[];
};

/** Builds a multi-part low-poly sports car (chassis, cabin, wheels, lights, spoiler). */
function buildCarModel(color: string, opts: { livery?: string } = {}): CarRig {
  const group = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color, metalness: 0.75, roughness: 0.22 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0c0d12, metalness: 0.3, roughness: 0.35 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x0a1420,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.55,
    transparent: true,
    opacity: 0.85,
  });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd9dee8, metalness: 0.95, roughness: 0.12 });

  // Lower chassis / floor pan
  const floorPan = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 4.0), dark);
  floorPan.position.y = 0.28;
  group.add(floorPan);

  // Main body shell
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.5, 3.9), paint);
  body.position.y = 0.56;
  group.add(body);

  // Sloped hood (front) and trunk (rear) wedges for an aero silhouette
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.32, 1.1), paint);
  hood.position.set(0, 0.62, 1.55);
  hood.rotation.x = -0.16;
  group.add(hood);
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.3, 0.9), paint);
  trunk.position.set(0, 0.68, -1.55);
  trunk.rotation.x = 0.12;
  group.add(trunk);

  // Cabin / greenhouse
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.42, 1.7), dark);
  cabin.position.set(0, 0.94, -0.15);
  group.add(cabin);
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.38, 0.75), glass);
  windshield.position.set(0, 0.98, 0.62);
  windshield.rotation.x = -0.32;
  group.add(windshield);
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.34, 0.65), glass);
  rearGlass.position.set(0, 0.96, -0.92);
  rearGlass.rotation.x = 0.3;
  group.add(rearGlass);
  const sideGlassL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 1.35), glass);
  sideGlassL.position.set(0.72, 0.96, -0.1);
  group.add(sideGlassL);
  const sideGlassR = sideGlassL.clone();
  sideGlassR.position.x = -0.72;
  group.add(sideGlassR);

  // Front splitter + rear diffuser
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.3), dark);
  splitter.position.set(0, 0.16, 2.05);
  group.add(splitter);
  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.14, 0.28), dark);
  diffuser.position.set(0, 0.24, -2.02);
  group.add(diffuser);

  // Rear wing on struts
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.06, 0.36), dark);
  wing.position.set(0, 1.06, -1.95);
  group.add(wing);
  for (const s of [-0.6, 0.6]) {
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.08), dark);
    strut.position.set(s, 0.88, -1.95);
    group.add(strut);
  }

  // Mirrors
  for (const s of [-1, 1]) {
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.2), paint);
    mirror.position.set(s * 0.98, 0.86, 0.5);
    group.add(mirror);
  }

  // Headlights / taillights
  const headMat = new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xfff6d8, emissiveIntensity: 1.4 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0xff3348, emissive: 0xff2a3c, emissiveIntensity: 1.6 });
  const headlights: THREE.Mesh[] = [];
  const brakeLights: THREE.Mesh[] = [];
  for (const s of [-0.62, 0.62]) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.08), headMat.clone());
    h.position.set(s, 0.58, 2.02);
    group.add(h);
    headlights.push(h);
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.06), tailMat.clone());
    t.position.set(s, 0.62, -2.0);
    group.add(t);
    brakeLights.push(t);
  }

  // Wheels: tire torus-ish cylinder + rim
  const wheels: THREE.Object3D[] = [];
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.9 });
  const rimMat = opts.livery === "chrome" ? chrome : new THREE.MeshStandardMaterial({ color: 0x9aa2b4, metalness: 0.85, roughness: 0.3 });
  const wheelPositions: [number, number][] = [
    [0.92, 1.28],
    [-0.92, 1.28],
    [0.92, -1.28],
    [-0.92, -1.28],
  ];
  for (const [x, z] of wheelPositions) {
    const wheel = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 20), tireMat);
    tire.rotation.z = Math.PI / 2;
    wheel.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.28, 10), rimMat);
    rim.rotation.z = Math.PI / 2;
    wheel.add(rim);
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.03), chrome);
      spoke.position.z = 0.02;
      spoke.rotation.x = (i / 5) * Math.PI * 2;
      rim.add(spoke);
    }
    wheel.position.set(x, 0.36, z);
    group.add(wheel);
    wheels.push(wheel);
  }

  return { group, wheels, brakeLights, headlights };
}

function bootRace(
  el: HTMLDivElement,
  car: (typeof CARS)[number],
  track: (typeof TRACKS)[number],
  onHud: (h: { speed: number; gear: number; lap: number; nitro: number; drift: number; cam: string }) => void,
  onDone: (r: { pos: number; drift: number; clean: boolean; score: number }) => void,
) {
  const scene = new THREE.Scene();
  const sky =
    track.tod === "night" ? 0x070814 : track.tod === "dusk" ? 0x1a1420 : 0x8aa0b8;
  scene.background = new THREE.Color(sky);
  scene.fog = new THREE.Fog(sky, 18, 18 + (1 - track.fog) * 120);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  el.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(70, el.clientWidth / el.clientHeight, 0.1, 400);
  const camMode = { id: "chase" as "chase" | "hood" | "cockpit" };

  const hemi = new THREE.HemisphereLight(0xb0c4ff, 0x1a120c, track.tod === "night" ? 0.45 : 0.9);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(track.tod === "night" ? 0x8899ff : 0xffe6c8, 1.2);
  dir.position.set(20, 40, 10);
  scene.add(dir);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({
      color: track.id === "desert" ? 0xc2a36b : track.id === "forest" ? 0x1d2a1c : 0x12151c,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const road = new THREE.Mesh(
    new THREE.RingGeometry(34, 46, 96),
    new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.7, metalness: 0.1 }),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.02;
  scene.add(road);

  const line = new THREE.Mesh(
    new THREE.RingGeometry(39.7, 40.3, 96),
    new THREE.MeshBasicMaterial({ color: 0xd4b56a }),
  );
  line.rotation.x = -Math.PI / 2;
  line.position.y = 0.03;
  scene.add(line);

  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(33.4, 33.4, 1.4, 64, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x2a3144, side: THREE.DoubleSide }),
  );
  inner.position.y = 0.7;
  scene.add(inner);
  const outer = new THREE.Mesh(
    new THREE.CylinderGeometry(46.6, 46.6, 1.4, 64, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x2a3144, side: THREE.DoubleSide }),
  );
  outer.position.y = 0.7;
  scene.add(outer);

  const playerRig = buildCarModel(car.color);
  const vehicle = playerRig.group;
  scene.add(vehicle);

  // Rival racers: real car models pulled from the other liveries in the catalog, actually
  // driving the circuit line rather than generic traffic boxes.
  const rivalPalette = CARS.filter((c) => c.id !== car.id);
  const traffic: { rig: CarRig; phase: number; speed: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const rivalCar = rivalPalette[i % rivalPalette.length];
    const rig = buildCarModel(rivalCar.color);
    scene.add(rig.group);
    traffic.push({ rig, phase: (i / 5) * Math.PI * 2, speed: 0.22 + i * 0.02 });
  }

  const rain: THREE.Points | null = track.rain
    ? (() => {
        const geo = new THREE.BufferGeometry();
        const n = 800;
        const pos = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 80;
          pos[i * 3 + 1] = Math.random() * 20;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
        }
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const pts = new THREE.Points(
          geo,
          new THREE.PointsMaterial({ color: 0xa8c4ff, size: 0.08, transparent: true, opacity: 0.55 }),
        );
        scene.add(pts);
        return pts;
      })()
    : null;

  let yaw = 0;
  let speed = 0;
  let lateral = 0;
  let nitro = 1;
  let driftScore = 0;
  let drifting = false;
  let lap = 1;
  let lastAng = 0;
  let hits = 0;
  let camShake = 0;
  const keys = new Set<string>();
  let injected: string[] | null = null;
  let injectSteer: number | null = null;

  const onKey = (e: KeyboardEvent, down: boolean) => {
    if (down) keys.add(e.code);
    else keys.delete(e.code);
    if (down && e.code === "KeyC") {
      camMode.id = camMode.id === "chase" ? "hood" : camMode.id === "hood" ? "cockpit" : "chase";
    }
  };
  const kd = (e: KeyboardEvent) => onKey(e, true);
  const ku = (e: KeyboardEvent) => onKey(e, false);
  window.addEventListener("keydown", kd);
  window.addEventListener("keyup", ku);
  const blur = () => keys.clear();
  window.addEventListener("blur", blur);

  window.__controlsTest = {
    getYaw: () => yaw,
    getSpeed: () => speed,
    setSteer: (v) => {
      injectSteer = v;
    },
    setKeys: (codes) => {
      injected = codes;
    },
  };

  const clock = { last: performance.now() };
  let raf = 0;
  let finished = false;

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.1, (now - clock.last) / 1000);
    clock.last = now;
    const held = injected ?? [...keys];
    const has = (c: string) => held.includes(c);

    let steer = injectSteer ?? 0;
    if (injectSteer == null) {
      if (has("KeyA") || has("ArrowLeft")) steer += 1;
      if (has("KeyD") || has("ArrowRight")) steer -= 1;
    }
    const throttle = has("KeyW") || has("ArrowUp") ? 1 : 0;
    const brake = has("KeyS") || has("ArrowDown") ? 1 : 0;
    drifting = has("Space");
    const boosting = (has("ShiftLeft") || has("ShiftRight") || has("KeyN")) && nitro > 0.05;

    const accel = car.accel * (boosting ? car.nitro : 1);
    speed += throttle * accel * dt;
    speed -= brake * 22 * dt;
    speed *= 1 - (0.55 + (drifting ? -0.1 : 0)) * dt;
    if (!throttle && !brake) speed *= 1 - 0.8 * dt;
    speed = Math.max(-18, Math.min(car.maxSpeed * (boosting ? 1.12 : 1), speed));
    if (boosting) nitro = Math.max(0, nitro - 0.22 * dt);
    else nitro = Math.min(1, nitro + 0.08 * dt);

    const speedFactor = Math.min(1, Math.abs(speed) / 12);
    const reverse = speed >= 0 ? 1 : -1;
    const turnRate = 1.55 * (drifting ? 1.35 : 1);
    yaw += steer * turnRate * speedFactor * reverse * dt;

    const grip = drifting ? car.grip * 0.45 : car.grip;
    lateral += steer * speed * 0.15 * dt;
    lateral *= 1 - grip * 6 * dt;
    if (drifting && Math.abs(speed) > 12) driftScore += Math.abs(lateral) * 40 * dt;

    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const rx = Math.cos(yaw);
    const rz = -Math.sin(yaw);
    vehicle.position.x += (fx * speed + rx * lateral) * dt;
    vehicle.position.z += (fz * speed + rz * lateral) * dt;
    vehicle.position.y = 0.05;
    vehicle.rotation.y = yaw;
    vehicle.rotation.z = THREE.MathUtils.damp(vehicle.rotation.z, -steer * 0.12, 8, dt);

    const dist = Math.hypot(vehicle.position.x, vehicle.position.z);
    if (dist < 34.2 || dist > 46.4) {
      speed *= 0.96;
      hits += dt;
      camShake = 0.25;
      const nrm = dist === 0 ? 1 : 40 / dist;
      vehicle.position.x *= nrm;
      vehicle.position.z *= nrm;
    }

    const ang = Math.atan2(vehicle.position.z, vehicle.position.x);
    if (lastAng < -2.5 && ang > 2.5 && speed > 4) {
      lap += 1;
      if (lap > 3 && !finished) {
        finished = true;
        const pos = 1 + Math.min(4, Math.floor(hits * 2));
        const clean = hits < 0.4;
        const score = Math.floor((4 - pos) * 1800 + driftScore + speed * 8 + (clean ? 600 : 0));
        onDone({ pos, drift: driftScore, clean, score });
      }
    }
    lastAng = ang;

    for (const t of traffic) {
      const prev = t.rig.group.position.clone();
      t.phase += t.speed * dt;
      const r = 40 + (t.phase % 1.2) - 0.4;
      t.rig.group.position.set(Math.cos(t.phase) * r, 0.05, Math.sin(t.phase) * r);
      t.rig.group.rotation.y = -t.phase + Math.PI / 2;
      const rivalSpeed = t.rig.group.position.distanceTo(prev) / Math.max(dt, 0.0001);
      for (const w of t.rig.wheels) w.rotation.x -= rivalSpeed * dt * 2.4;
      if (t.rig.group.position.distanceTo(vehicle.position) < 2.4) {
        speed *= 0.7;
        hits += 0.2;
        camShake = 0.4;
      }
    }

    for (const w of playerRig.wheels) w.rotation.x -= speed * dt * 2.4;
    for (const w of playerRig.wheels.slice(0, 2)) w.rotation.y = THREE.MathUtils.damp(w.rotation.y, steer * 0.35, 8, dt);
    const litBrake = brake > 0 || (!throttle && speed > 4);
    for (const l of playerRig.brakeLights) {
      const m = l.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = litBrake ? 3 : 1.6;
    }

    if (rain) {
      const pos = rain.geometry.getAttribute("position");
      for (let i = 0; i < pos.count; i++) {
        let py = pos.getY(i) - 18 * dt;
        if (py < 0) py = 18;
        pos.setY(i, py);
      }
      pos.needsUpdate = true;
      rain.position.copy(vehicle.position);
    }

    const forward = new THREE.Vector3(fx, 0, fz);
    const chase = vehicle.position
      .clone()
      .add(new THREE.Vector3(0, camMode.id === "cockpit" ? 1.1 : 2.2, 0))
      .add(forward.clone().multiplyScalar(camMode.id === "chase" ? -8.5 : camMode.id === "hood" ? 1.4 : 0.4));
    camera.position.lerp(chase, 1 - Math.exp(-4 * dt));
    camera.fov = THREE.MathUtils.damp(camera.fov, 68 + Math.abs(speed) * 0.18, 4, dt);
    camera.updateProjectionMatrix();
    const look = vehicle.position.clone().add(forward.multiplyScalar(6));
    look.y += 0.6;
    camera.lookAt(look);
    if (camShake > 0) {
      camera.position.x += (Math.random() - 0.5) * camShake;
      camShake = Math.max(0, camShake - dt);
    }

    const kmh = Math.max(0, Math.floor(Math.abs(speed) * 9));
    const gear = kmh < 20 ? 1 : kmh < 40 ? 2 : kmh < 70 ? 3 : kmh < 110 ? 4 : 5;
    onHud({ speed: kmh, gear, lap: Math.min(3, lap), nitro, drift: driftScore, cam: camMode.id });
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);

  const onResize = () => {
    camera.aspect = el.clientWidth / Math.max(1, el.clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(el.clientWidth, el.clientHeight);
  };
  window.addEventListener("resize", onResize);

  return {
    stop: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("blur", blur);
      window.removeEventListener("resize", onResize);
      if (window.__controlsTest) delete window.__controlsTest;
      renderer.dispose();
      el.replaceChildren();
    },
  };
}
