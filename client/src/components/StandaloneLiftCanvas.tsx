import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createLiftModel, type LiftState } from "@/lib/standalone-lift-model";

type StandaloneLiftCanvasProps = {
  onStateChange?: (state: LiftState) => void;
  onControlsReady?: (controls: { callFloor: (floor: number) => void }) => void;
};

export default function StandaloneLiftCanvas({ onStateChange, onControlsReady }: StandaloneLiftCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const isMobile = window.innerWidth <= 700;
    const modelScale = isMobile ? 0.40 : 0.47;
    const targetY = isMobile ? 4.35 : 4.60;

    // Perfectly framed perspective camera showing entire shaft top-to-bottom (enclosed pit buffers to penthouse roof crown)
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(isMobile ? 2.6 : 3.2, targetY, isMobile ? 22.0 : 21.0);
    camera.lookAt(0, targetY, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    mount.appendChild(renderer.domElement);

    // Architectural Lighting: Key + Rim + Ambient
    scene.add(new THREE.HemisphereLight(0xdcf0f5, 0x12222a, 2.4));

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 3.2);
    keyLight.position.set(6, 16, 12);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7bc4dc, 2.2);
    rimLight.position.set(-8, 12, -6);
    scene.add(rimLight);

    const lift = createLiftModel({
      floorCount: 6,
      floorHeight: 2.85,
      autoTravel: true,
      mobile: isMobile,
    });

    lift.object.scale.setScalar(modelScale);
    lift.object.position.set(isMobile ? 0.2 : 0.45, 0, 0);
    scene.add(lift.object);

    onControlsReady?.({ callFloor: lift.callFloor });

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let frame = 0;
    let last = performance.now();
    let lastStateKey = "";

    const animate = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      lift.update(delta);

      const stateKey = `${lift.state.currentFloor}-${lift.state.targetFloor}-${lift.state.phase}-${(lift.state.registeredCalls || []).join(",")}`;
      if (stateKey !== lastStateKey) {
        lastStateKey = stateKey;
        onStateChange?.({ ...lift.state });
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      lift.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      className="standalone-lift-canvas"
      ref={mountRef}
      aria-label="Realistic animated continuous panoramic observation lift"
      role="img"
    />
  );
}
