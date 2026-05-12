"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  VIRE_BG_NAV_EVENT,
  type VireBgNavDetail,
} from "@/lib/site/background-nav";

/** Decorative ambient canvas — DESIGN_SYSTEM.md (Three.js background spec) */
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

    const geometry = new THREE.IcosahedronGeometry(0.3, 0);
    const meshes: THREE.Mesh[] = [];

    type MeshWithVel = THREE.Mesh & {
      _vel: THREE.Vector3;
    };

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
      const mat = new THREE.MeshBasicMaterial({
        color: 0x1df5a0,
        transparent: true,
        opacity: 0.14,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(0, 0, 0);
      mesh.scale.setScalar(1.45);
      scene.add(mesh);
      meshes.push(mesh);
      renderer.render(scene, camera);
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener(VIRE_BG_NAV_EVENT, bumpNavImpulse);
        window.removeEventListener("popstate", onPopState);
        window.removeEventListener("resize", onResize);
        mat.dispose();
        geometry.dispose();
        renderer.dispose();
      };
    }

    const count = Math.floor(80 + Math.random() * 41);
    for (let i = 0; i < count; i++) {
      const amber = Math.random() < 0.15;
      const mat = new THREE.MeshBasicMaterial({
        color: amber ? 0xf5a623 : 0x1df5a0,
        transparent: true,
        opacity: amber
          ? 0.05 + Math.random() * 0.05
          : 0.06 + Math.random() * 0.12,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geometry, mat) as unknown as MeshWithVel;
      mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, 0);
      mesh.scale.setScalar(0.3 + Math.random() * 1.2);
      mesh._vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.003,
        (Math.random() - 0.5) * 0.003,
        0,
      );
      scene.add(mesh);
      meshes.push(mesh);
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
      meshes.forEach((m) => {
        const mm = m as MeshWithVel;
        const speed = 1 + impulse * 0.45;
        mm.position.addScaledVector(mm._vel, speed);

        m.rotation.x += 0.002 * spin;
        m.rotation.y += 0.001 * spin;

        if (Math.abs(m.position.x) > 22) mm._vel.x *= -1;
        if (Math.abs(m.position.y) > 17) mm._vel.y *= -1;
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
      meshes.forEach((m) => {
        (m.material as THREE.Material).dispose();
      });
      geometry.dispose();
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
