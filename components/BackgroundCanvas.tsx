"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Decorative ambient canvas — spec: ROADMAP.md Three.js section */
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

    for (let i = 0; i < 100; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.88 ? 0xf59e0b : 0x1d9e75,
        transparent: true,
        opacity: 0.035 + Math.random() * 0.055,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geometry, mat) as unknown as MeshWithVel;
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
      );
      const s = 0.3 + Math.random() * 1.2;
      mesh.scale.setScalar(s);
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

      if (!reducedMotion) {
        meshes.forEach((m) => {
          const mm = m as MeshWithVel;
          mm.position.add(mm._vel);
          m.rotation.x += 0.002;
          m.rotation.y += 0.001;
          if (Math.abs(m.position.x) > 22) mm._vel.x *= -1;
          if (Math.abs(m.position.y) > 17) mm._vel.y *= -1;
        });
      }

      renderer.render(scene, camera);
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else animId = requestAnimationFrame(animate);
    };

    if (!document.hidden) animId = requestAnimationFrame(animate);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="fixed inset-0 -z-10 max-h-screen max-w-full pointer-events-none"
    />
  );
}
