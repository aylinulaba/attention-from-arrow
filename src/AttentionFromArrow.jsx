import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export default function AttentionFromArrowClone() {
  const mountRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b0f);

    const fov = 60;
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 2000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const container = mountRef.current;
    container.appendChild(renderer.domElement);

    const GRID = 24;
    const SPACING = 3.4;
    const HALF = (GRID - 1) / 2;
    const span = (GRID - 1) * SPACING;

    const fitCamera = () => {
      const pad = 1.28;
      const h = span * pad;
      const dist = (h / 2) / Math.tan((fov * Math.PI) / 360);
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
    };

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, true);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      fitCamera();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const shaftGeom = new THREE.CylinderGeometry(0.22, 0.22, 4.2, 8, 1, true);
    shaftGeom.translate(0, 2.1, 0);
    const headGeom = new THREE.ConeGeometry(0.95, 2.2, 16);
    headGeom.translate(0, 4.9, 0);
    const merged = mergeGeometries([shaftGeom, headGeom]);

    const material = new THREE.MeshBasicMaterial({ color: 0x93c5fd });

    const count = GRID * GRID;
    const inst = new THREE.InstancedMesh(merged, material, count);
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(inst);

    const temp = new THREE.Object3D();

    let idx = 0;
    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        temp.position.set((gx - HALF) * SPACING, (gy - HALF) * SPACING, 0);
        temp.rotation.set(0, 0, 0);
        temp.updateMatrix();
        inst.setMatrixAt(idx++, temp.matrix);
      }
    }

    const pointer = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera({ x, y }, camera);
      const pt = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, pt);
      pointer.set(pt.x, pt.y);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const animate = () => {
      if (!mounted) return;

      let i = 0;
      for (let gy = 0; gy < GRID; gy++) {
        for (let gx = 0; gx < GRID; gx++) {
          const px = (gx - HALF) * SPACING;
          const py = (gy - HALF) * SPACING;
          const angle = Math.atan2(pointer.y - py, pointer.x - px) - Math.PI / 2;
          temp.position.set(px, py, 0);
          temp.rotation.set(0, 0, angle);
          temp.updateMatrix();
          inst.setMatrixAt(i++, temp.matrix);
        }
      }
      inst.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      merged.dispose();
      shaftGeom.dispose();
      headGeom.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100svh", background: "#0b0b0f", position: "relative", overflow: "hidden" }}>
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
