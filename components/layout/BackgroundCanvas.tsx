"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  getFloatIconTexture,
  pickFloatIconKind,
  disposeFloatIconTextures,
} from "@/lib/site/background-float-textures";
import {
  VIRE_BG_NAV_EVENT,
  type VireBgNavDetail,
} from "@/lib/site/background-nav";

type FloatSprite = THREE.Sprite & {
  _vel: THREE.Vector3;
  _spin: number;
};

/** Decorative ambient canvas — OS / app motifs, FI & EU flags (Three.js sprites). */
export function BackgroundCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 20;

    const sprites: THREE.Sprite[] = [];

    let navImpulse = 0;

    const bumpNavImpulse = (e: Event) => {
      const ce = e as CustomEvent<VireBgNavDetail>;
      const s =
        typeof ce.detail?.strength === "number" && ce.detail.strength > 0
          ? ce.detail.strength
          : 1;
      navImpulse = Math.min(1, navImpulse + 0.48 * s);
    };

    const onPopState = () => {
      navImpulse = Math.min(1, navImpulse + 0.28);
    };

    window.addEventListener(VIRE_BG_NAV_EVENT, bumpNavImpulse);
    window.addEventListener("popstate", onPopState);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
    };

    if (reducedMotion) {
      const tex = getFloatIconTexture("fi");
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.setScalar(1.65);
      sprite.position.set(0, 0, 0);
      scene.add(sprite);
      sprites.push(sprite);
      renderer.render(scene, camera);
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener(VIRE_BG_NAV_EVENT, bumpNavImpulse);
        window.removeEventListener("popstate", onPopState);
        window.removeEventListener("resize", onResize);
        const m = sprite.material as THREE.SpriteMaterial;
        m.map = null;
        m.dispose();
        disposeFloatIconTextures();
        renderer.dispose();
      };
    }

    const count = Math.floor(80 + Math.random() * 41);
    for (let i = 0; i < count; i++) {
      const kind = pickFloatIconKind();
      const tex = getFloatIconTexture(kind);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.07 + Math.random() * 0.11,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat) as FloatSprite;
      const base = 0.4 + Math.random() * 1.15;
      sprite.scale.set(base, base, 1);
      sprite.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, 0);
      sprite._vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.003,
        (Math.random() - 0.5) * 0.003,
        0,
      );
      sprite._spin = (Math.random() - 0.5) * 0.004;
      scene.add(sprite);
      sprites.push(sprite);
    }

    let animId = 0;
    let last = 0;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      if (now - last < 33) return;
      last = now;

      const impulse = navImpulse;
      navImpulse *= 0.9;

      const spin = 1 + impulse * 0.35;
      sprites.forEach((sp) => {
        const mm = sp as FloatSprite;
        const speed = 1 + impulse * 0.45;
        mm.position.addScaledVector(mm._vel, speed);

        const mat = sp.material as THREE.SpriteMaterial;
        mat.rotation += mm._spin * spin;

        if (Math.abs(sp.position.x) > 22) mm._vel.x *= -1;
        if (Math.abs(sp.position.y) > 17) mm._vel.y *= -1;
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
      window.removeEventListener(VIRE_BG_NAV_EVENT, bumpNavImpulse);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      sprites.forEach((sp) => {
        const m = sp.material as THREE.SpriteMaterial;
        m.map = null;
        m.dispose();
      });
      disposeFloatIconTextures();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 max-h-dvh max-w-full"
    />
  );
}
