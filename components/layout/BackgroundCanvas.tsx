"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePathname } from "@/i18n/navigation";
import { VIRE_BG_NAV_EVENT } from "@/lib/site/background-nav";

type FloatMesh = THREE.Mesh & {
  _vel: THREE.Vector3;
};

function disposeMesh(m: THREE.Mesh) {
  m.geometry.dispose();
  const mat = m.material;
  if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
  else mat.dispose();
}

/** Decorative ambient canvas — wireframe icosahedrons (DESIGN_SYSTEM.md). */
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
      1.85,
      navEnergyRef.current + 0.52,
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
        1.85,
        navEnergyRef.current + 0.52,
      );
    };

    window.addEventListener(VIRE_BG_NAV_EVENT, bumpNavEnergy);
    window.addEventListener("hashchange", bumpNavEnergy);

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

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const meshes: FloatMesh[] = [];

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
    };

    if (reducedMotion) {
      const geo = new THREE.IcosahedronGeometry(0.3, 0);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x1df5a0,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      });
      const mesh = new THREE.Mesh(geo, mat) as unknown as FloatMesh;
      mesh._vel = new THREE.Vector3();
      mesh.position.set(0, 0, 0);
      const s = 0.9;
      mesh.scale.setScalar(s);
      scene.add(mesh);
      meshes.push(mesh);
      renderer.render(scene, camera);
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener(VIRE_BG_NAV_EVENT, bumpNavEnergy);
        window.removeEventListener("hashchange", bumpNavEnergy);
        meshes.forEach(disposeMesh);
        renderer.dispose();
      };
    }

    const count = Math.floor(80 + Math.random() * 41);
    const geometry = new THREE.IcosahedronGeometry(0.3, 0);

    for (let i = 0; i < count; i++) {
      const amber = Math.random() < 0.15;
      const mat = new THREE.MeshBasicMaterial({
        color: amber ? 0xf5a623 : 0x1df5a0,
        wireframe: true,
        transparent: true,
        opacity: amber
          ? 0.05 + Math.random() * 0.05
          : 0.06 + Math.random() * 0.12,
      });
      const mesh = new THREE.Mesh(geometry.clone(), mat) as unknown as FloatMesh;
      const sc = 0.3 + Math.random() * 1.2;
      mesh.scale.setScalar(sc);
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        0,
      );
      mesh._vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.006,
        (Math.random() - 0.5) * 0.006,
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

      let navBoost = navEnergyRef.current;
      if (navBoost > 0.02) {
        navEnergyRef.current *= 0.9;
      } else {
        navBoost = 0;
        navEnergyRef.current = 0;
      }

      const maxVel = 0.028;
      meshes.forEach((mesh) => {
        mesh.position.add(mesh._vel);
        mesh.rotation.x += 0.002;
        mesh.rotation.y += 0.001;
        if (navBoost > 0) {
          mesh._vel.x += (Math.random() - 0.5) * 0.018 * navBoost;
          mesh._vel.y += (Math.random() - 0.5) * 0.018 * navBoost;
        }
        mesh._vel.x = Math.max(-maxVel, Math.min(maxVel, mesh._vel.x));
        mesh._vel.y = Math.max(-maxVel, Math.min(maxVel, mesh._vel.y));
        if (Math.abs(mesh.position.x) > 22) mesh._vel.x *= -1;
        if (Math.abs(mesh.position.y) > 17) mesh._vel.y *= -1;
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
      window.removeEventListener(VIRE_BG_NAV_EVENT, bumpNavEnergy);
      window.removeEventListener("hashchange", bumpNavEnergy);
      meshes.forEach(disposeMesh);
      geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full min-h-dvh w-full"
    />
  );
}
