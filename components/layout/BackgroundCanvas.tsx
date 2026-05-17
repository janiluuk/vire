"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePathname } from "@/i18n/navigation";
import {
  BG_DRIFT_VEL_SCALE,
  BG_NAV_ENERGY_BUMP,
  BG_NAV_ENERGY_DECAY,
  BG_NAV_ENERGY_MAX,
  BG_ROT_VEL_SCALE,
} from "@/lib/site/background-animation";
import { SPARKKI_BG_NAV_EVENT } from "@/lib/site/background-nav";

type FloatObject = THREE.Object3D & {
  _vel: THREE.Vector3;
};

type IconKind =
  | "penguin"
  | "gear"
  | "cube"
  | "disc"
  | "window";

function disposeFloatObject(obj: THREE.Object3D) {
  const mats = new Set<THREE.Material>();
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      const m = child.material;
      if (Array.isArray(m)) m.forEach((x) => mats.add(x));
      else mats.add(m);
    }
  });
  mats.forEach((m) => m.dispose());
}

function makeWireframeMaterial(amber: boolean, opacity: number) {
  return new THREE.MeshBasicMaterial({
    color: amber ? 0xffb800 : 0xffd54a,
    wireframe: true,
    transparent: true,
    opacity,
  });
}

/** Stylized Tux-like silhouette — spheres + cone, wireframe (not a trademarked asset). */
function makePenguinIcon(mat: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 6, 5),
    mat,
  );
  body.scale.set(0.95, 1.15, 0.85);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 5), mat);
  head.position.y = 0.26;
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.12, 6), mat);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.24, 0.16);
  g.add(body, head, beak);
  return g;
}

/** Four-pane grid — reads as a classic “window” / desktop motif. */
function makeWindowIcon(mat: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const cell = 0.14;
  const gap = 0.02;
  const o = (cell + gap) / 2;
  for (const [x, y] of [
    [-o, -o],
    [o, -o],
    [-o, o],
    [o, o],
  ] as const) {
    const pane = new THREE.Mesh(
      new THREE.BoxGeometry(cell, cell, 0.035),
      mat,
    );
    pane.position.set(x, y, 0);
    g.add(pane);
  }
  return g;
}

function pickKind(narrow: boolean): IconKind {
  const r = Math.random();
  if (narrow) {
    if (r < 0.42) return "penguin";
    if (r < 0.58) return "gear";
    if (r < 0.72) return "cube";
    if (r < 0.84) return "window";
    return "disc";
  }
  if (r < 0.38) return "penguin";
  if (r < 0.52) return "window";
  if (r < 0.66) return "gear";
  if (r < 0.78) return "cube";
  if (r < 0.9) return "disc";
  return "penguin";
}

function createIcon(kind: IconKind, mat: THREE.Material): THREE.Object3D {
  switch (kind) {
    case "penguin":
      return makePenguinIcon(mat);
    case "gear":
      return new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.07, 8, 20),
        mat,
      );
    case "cube":
      return new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), mat);
    case "disc":
      return new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.05, 20),
        mat,
      );
    case "window":
      return makeWindowIcon(mat);
    default:
      return makePenguinIcon(mat);
  }
}

function spawnFloatIcon(narrow: boolean): FloatObject {
  const amber = Math.random() < 0.14;
  const mat = makeWireframeMaterial(
    amber,
    amber
      ? 0.035 + Math.random() * 0.04
      : 0.042 + Math.random() * 0.085,
  );
  const kind = pickKind(narrow);
  const root = createIcon(kind, mat) as FloatObject;
  const drift = 0.00115 * BG_DRIFT_VEL_SCALE;
  root._vel = new THREE.Vector3(
    (Math.random() - 0.5) * drift,
    (Math.random() - 0.5) * drift,
    0,
  );
  const sc = 0.35 + Math.random() * 1.15;
  root.scale.setScalar(sc);
  root.position.set(
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 30,
    0,
  );
  root.rotation.z = Math.random() * Math.PI * 2;
  return root;
}

/**
 * Decorative ambient canvas — wireframe mix of icon-inspired shapes
 * (penguin, window grid, gear, disc, cube) — no wireframe polyhedra (read as X marks).
 */
export function BackgroundCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const navEnergyRef = useRef(0);
  const skipPathnameBumpRef = useRef(true);
  const pathname = usePathname();

  useEffect(() => {
    if (skipPathnameBumpRef.current) {
      skipPathnameBumpRef.current = false;
      return;
    }
    navEnergyRef.current = Math.min(
      BG_NAV_ENERGY_MAX,
      navEnergyRef.current + BG_NAV_ENERGY_BUMP,
    );
  }, [pathname]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const bumpNavEnergy = () => {
      if (reducedMotion) return;
      navEnergyRef.current = Math.min(
        BG_NAV_ENERGY_MAX,
        navEnergyRef.current + BG_NAV_ENERGY_BUMP,
      );
    };

    window.addEventListener(SPARKKI_BG_NAV_EVENT, bumpNavEnergy);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const narrowViewport = () => window.innerWidth < 640;
    const applyRendererQuality = () => {
      const narrow = narrowViewport();
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, narrow ? 1.25 : 2),
      );
    };
    applyRendererQuality();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 20;

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const floats: FloatObject[] = [];

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      applyRendererQuality();
      renderer.render(scene, camera);
    };

    if (reducedMotion) {
      const mat = makeWireframeMaterial(false, 0.12);
      const mesh = makePenguinIcon(mat) as unknown as FloatObject;
      mesh._vel = new THREE.Vector3();
      mesh.scale.setScalar(0.95);
      mesh.position.set(0, 0, 0);
      scene.add(mesh);
      floats.push(mesh);
      renderer.render(scene, camera);
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener(SPARKKI_BG_NAV_EVENT, bumpNavEnergy);
        disposeFloatObject(mesh);
        renderer.dispose();
      };
    }

    const narrow = narrowViewport();
    const count = narrow
      ? 22
      : Math.floor(52 + Math.random() * 34);

    for (let i = 0; i < count; i++) {
      const obj = spawnFloatIcon(narrow);
      scene.add(obj);
      floats.push(obj);
    }

    let animId = 0;
    let last = 0;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      if (now - last < 33) return;
      last = now;

      let navBoost = navEnergyRef.current;
      if (navBoost > 0.02) {
        navEnergyRef.current *= BG_NAV_ENERGY_DECAY;
      } else {
        navBoost = 0;
        navEnergyRef.current = 0;
      }

      const navNorm = Math.min(1, navBoost / BG_NAV_ENERGY_MAX);
      const motionScale = 1 + navNorm * 1.25;
      const maxVel = (0.0065 + navNorm * 0.012) * BG_DRIFT_VEL_SCALE;
      const rotStep = 0.0004 * BG_ROT_VEL_SCALE;
      floats.forEach((obj) => {
        obj.position.addScaledVector(obj._vel, motionScale);
        obj.rotation.x += rotStep * motionScale;
        obj.rotation.y += rotStep * 0.5 * motionScale;
        if (navBoost > 0) {
          obj._vel.x += (Math.random() - 0.5) * 0.014 * navNorm;
          obj._vel.y += (Math.random() - 0.5) * 0.014 * navNorm;
        }
        obj._vel.x = Math.max(-maxVel, Math.min(maxVel, obj._vel.x));
        obj._vel.y = Math.max(-maxVel, Math.min(maxVel, obj._vel.y));
        if (Math.abs(obj.position.x) > 22) obj._vel.x *= -1;
        if (Math.abs(obj.position.y) > 17) obj._vel.y *= -1;
      });

      renderer.render(scene, camera);
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else animId = requestAnimationFrame(animate);
    };

    if (!document.hidden) {
      animId = requestAnimationFrame(animate);
    }
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(SPARKKI_BG_NAV_EVENT, bumpNavEnergy);
      floats.forEach(disposeFloatObject);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full min-h-dvh w-full touch-none"
    />
  );
}
