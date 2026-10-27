import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TMazeFloor } from '../types/wizardry';

interface DungeonRenderer3DProps {
  maze: TMazeFloor;
  x: number;
  y: number;
  direction: number; // 0: North, 1: East, 2: South, 3: West
  lightLevel: number;
  isDarkZone?: boolean;
  wireframeMode?: boolean;
}

export const DungeonRenderer3D: React.FC<DungeonRenderer3DProps> = ({
  maze,
  x,
  y,
  direction,
  lightLevel,
  isDarkZone = false,
  wireframeMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mazeObjectsRef = useRef<THREE.Group | null>(null);
  const torchLightRef = useRef<THREE.PointLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const targetTorchIntensityRef = useRef<number>(3.8);

  // Animation target values for smooth interpolation
  const targetPosRef = useRef<THREE.Vector3>(new THREE.Vector3(x * 4, 1.6, -y * 4));
  const targetRotYRef = useRef<number>(-direction * (Math.PI / 2));
  const currentRotYRef = useRef<number>(-direction * (Math.PI / 2));

  // Procedural stone and door textures generated once on canvas
  const texturesRef = useRef<{
    stone: THREE.CanvasTexture;
    door: THREE.CanvasTexture;
    floor: THREE.CanvasTexture;
    ceiling: THREE.CanvasTexture;
  } | null>(null);

  useEffect(() => {
    // Generate high quality procedural textures
    if (!texturesRef.current && typeof document !== 'undefined') {
      // 1. Stone Wall Texture (Bright, clear dungeon stone)
      const wallCanvas = document.createElement('canvas');
      wallCanvas.width = 512;
      wallCanvas.height = 512;
      const wCtx = wallCanvas.getContext('2d')!;
      
      // Base warm stone mortar
      wCtx.fillStyle = '#334155';
      wCtx.fillRect(0, 0, 512, 512);
      
      // Brick pattern
      const rows = 8;
      const rowHeight = 512 / rows;
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * 64;
        for (let c = -1; c < 5; c++) {
          const bx = c * 128 + offset;
          const by = r * rowHeight;
          const bw = 124;
          const bh = rowHeight - 4;
          
          // Brick gradient
          const grad = wCtx.createLinearGradient(bx, by, bx, by + bh);
          const tone = 70 + Math.floor(Math.random() * 30);
          grad.addColorStop(0, `rgb(${tone + 35}, ${tone + 35}, ${tone + 40})`);
          grad.addColorStop(1, `rgb(${tone - 10}, ${tone - 10}, ${tone - 5})`);
          wCtx.fillStyle = grad;
          wCtx.fillRect(bx, by, bw, bh);

          // Subtle noise specs
          wCtx.fillStyle = 'rgba(0,0,0,0.18)';
          for (let p = 0; p < 60; p++) {
            wCtx.fillRect(bx + Math.random() * bw, by + Math.random() * bh, 2, 2);
          }
        }
      }

      // 2. Heavy Medieval Wood & Iron Door
      const doorCanvas = document.createElement('canvas');
      doorCanvas.width = 512;
      doorCanvas.height = 512;
      const dCtx = doorCanvas.getContext('2d')!;
      
      dCtx.fillStyle = '#22160d';
      dCtx.fillRect(0, 0, 512, 512);

      // Wooden planks
      for (let p = 0; p < 6; p++) {
        const px = 40 + p * 72;
        const pGrad = dCtx.createLinearGradient(px, 30, px + 68, 512);
        pGrad.addColorStop(0, '#78431f');
        pGrad.addColorStop(0.5, '#5c3114');
        pGrad.addColorStop(1, '#45220c');
        dCtx.fillStyle = pGrad;
        dCtx.fillRect(px, 30, 68, 482);
      }

      // Iron frame & rivets
      dCtx.strokeStyle = '#94a3b8';
      dCtx.lineWidth = 14;
      dCtx.strokeRect(30, 25, 452, 487);
      
      // Iron crossbands
      dCtx.fillStyle = '#475569';
      dCtx.fillRect(30, 140, 452, 28);
      dCtx.fillRect(30, 360, 452, 28);

      // Bronze ring handle
      dCtx.strokeStyle = '#f59e0b';
      dCtx.lineWidth = 14;
      dCtx.beginPath();
      dCtx.arc(380, 260, 28, 0, Math.PI * 2);
      dCtx.stroke();

      // 3. Flagstone Floor
      const floorCanvas = document.createElement('canvas');
      floorCanvas.width = 512;
      floorCanvas.height = 512;
      const fCtx = floorCanvas.getContext('2d')!;
      fCtx.fillStyle = '#1e293b';
      fCtx.fillRect(0, 0, 512, 512);
      for (let fx = 0; fx < 512; fx += 128) {
        for (let fy = 0; fy < 512; fy += 128) {
          fCtx.fillStyle = `rgba(255, 255, 255, ${0.08 + Math.random() * 0.07})`;
          fCtx.fillRect(fx + 2, fy + 2, 124, 124);
        }
      }

      // 4. Vaulted Ceiling
      const ceilCanvas = document.createElement('canvas');
      ceilCanvas.width = 256;
      ceilCanvas.height = 256;
      const cCtx = ceilCanvas.getContext('2d')!;
      cCtx.fillStyle = '#1e293b';
      cCtx.fillRect(0, 0, 256, 256);
      cCtx.fillStyle = '#0f172a';
      cCtx.fillRect(0, 0, 256, 18);
      cCtx.fillRect(0, 120, 256, 18);

      texturesRef.current = {
        stone: new THREE.CanvasTexture(wallCanvas),
        door: new THREE.CanvasTexture(doorCanvas),
        floor: new THREE.CanvasTexture(floorCanvas),
        ceiling: new THREE.CanvasTexture(ceilCanvas),
      };

      texturesRef.current.floor.wrapS = THREE.RepeatWrapping;
      texturesRef.current.floor.wrapT = THREE.RepeatWrapping;
      texturesRef.current.floor.repeat.set(20, 20);
    }
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 640;
    const height = containerRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.025);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    camera.position.set(x * 4, 1.6, -y * 4);
    camera.rotation.y = -direction * (Math.PI / 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Brightened ambient luminescence & warm torchlight
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const torchLight = new THREE.PointLight(0xffdfa0, 3.8, 38, 1.2);
    torchLight.position.set(x * 4, 1.8, -y * 4);
    scene.add(torchLight);

    const mazeGroup = new THREE.Group();
    scene.add(mazeGroup);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    mazeObjectsRef.current = mazeGroup;
    torchLightRef.current = torchLight;
    ambientLightRef.current = ambientLight;

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera interpolation
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetPosRef.current, Math.min(1, delta * 12));

        // Smooth angle rotation shortest path
        let diff = targetRotYRef.current - currentRotYRef.current;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        currentRotYRef.current += diff * Math.min(1, delta * 14);
        cameraRef.current.rotation.y = currentRotYRef.current;

        // Torch light follows player with organic flicker based on current target intensity
        if (torchLightRef.current) {
          torchLightRef.current.position.copy(cameraRef.current.position);
          const flicker = Math.sin(elapsed * 7) * 0.1;
          torchLightRef.current.intensity = Math.max(0.1, targetTorchIntensityRef.current * (1 + flicker * 0.05));
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update target position & rotation on state changes
  useEffect(() => {
    targetPosRef.current.set(x * 4, 1.6, -y * 4);
    targetRotYRef.current = -direction * (Math.PI / 2);
  }, [x, y, direction]);

  // Adjust lights and fog according to darkness / Milwa light spell
  useEffect(() => {
    if (!sceneRef.current || !torchLightRef.current || !ambientLightRef.current) return;

    if (isDarkZone) {
      sceneRef.current.fog = new THREE.FogExp2(0x000000, 0.35);
      torchLightRef.current.distance = 6;
      targetTorchIntensityRef.current = 0.5;
      ambientLightRef.current.intensity = 0.06;
    } else {
      const extraLight = Math.min(lightLevel * 0.15, 2.0);
      sceneRef.current.fog = new THREE.FogExp2(
        wireframeMode ? 0x001100 : 0x0a0f1d, 
        wireframeMode ? 0.025 : Math.max(0.015, 0.035 - extraLight * 0.015)
      );
      torchLightRef.current.distance = 38 + lightLevel * 6;
      targetTorchIntensityRef.current = 3.8 + extraLight;
      ambientLightRef.current.intensity = 0.8 + extraLight * 0.2;
    }
  }, [lightLevel, isDarkZone, wireframeMode]);

  // Rebuild 3D walls in the player's vicinity (distance up to 6 tiles)
  useEffect(() => {
    if (!mazeObjectsRef.current || !texturesRef.current || !sceneRef.current) return;

    const group = mazeObjectsRef.current;
    while (group.children.length > 0) {
      const obj = group.children[0] as THREE.Mesh;
      if (obj.geometry) obj.geometry.dispose();
      group.remove(obj);
    }

    const wallGeo = new THREE.PlaneGeometry(4, 3.2);
    const wallMat = wireframeMode 
      ? new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true })
      : new THREE.MeshStandardMaterial({ 
          map: texturesRef.current.stone, 
          roughness: 0.85, 
          metalness: 0.1 
        });

    const doorMat = wireframeMode 
      ? new THREE.MeshBasicMaterial({ color: 0xeab308, wireframe: true })
      : new THREE.MeshStandardMaterial({ 
          map: texturesRef.current.door, 
          roughness: 0.7, 
          metalness: 0.3 
        });

    const secretDoorMat = wireframeMode 
      ? new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true })
      : new THREE.MeshStandardMaterial({ 
          map: texturesRef.current.stone, 
          roughness: 0.9, 
          metalness: 0.1 
        });

    // Floor and Ceiling
    if (!wireframeMode) {
      const floorGeo = new THREE.PlaneGeometry(80, 80);
      const floorMat = new THREE.MeshStandardMaterial({ 
        map: texturesRef.current.floor, 
        roughness: 0.95 
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(40, 0, -40);
      group.add(floor);

      const ceilGeo = new THREE.PlaneGeometry(80, 80);
      const ceilMat = new THREE.MeshStandardMaterial({ 
        map: texturesRef.current.ceiling, 
        roughness: 0.9 
      });
      const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.set(40, 3.2, -40);
      group.add(ceiling);
    }

    // Build nearby walls (render distance 6 around player)
    const minX = Math.max(0, x - 5);
    const maxX = Math.min(19, x + 5);
    const minY = Math.max(0, y - 5);
    const maxY = Math.min(19, y + 5);

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const wx = cx * 4;
        const wy = -cy * 4;

        // North Wall
        const nWall = maze.n[cx][cy];
        if (nWall !== 'OPEN') {
          const mat = nWall === 'DOOR' ? doorMat : nWall === 'HIDEDOOR' ? secretDoorMat : wallMat;
          const mesh = new THREE.Mesh(wallGeo, mat);
          mesh.position.set(wx, 1.6, wy - 2);
          group.add(mesh);
        }

        // South Wall
        const sWall = maze.s[cx][cy];
        if (sWall !== 'OPEN') {
          const mat = sWall === 'DOOR' ? doorMat : sWall === 'HIDEDOOR' ? secretDoorMat : wallMat;
          const mesh = new THREE.Mesh(wallGeo, mat);
          mesh.rotation.y = Math.PI;
          mesh.position.set(wx, 1.6, wy + 2);
          group.add(mesh);
        }

        // East Wall
        const eWall = maze.e[cx][cy];
        if (eWall !== 'OPEN') {
          const mat = eWall === 'DOOR' ? doorMat : eWall === 'HIDEDOOR' ? secretDoorMat : wallMat;
          const mesh = new THREE.Mesh(wallGeo, mat);
          mesh.rotation.y = -Math.PI / 2;
          mesh.position.set(wx + 2, 1.6, wy);
          group.add(mesh);
        }

        // West Wall
        const wWall = maze.w[cx][cy];
        if (wWall !== 'OPEN') {
          const mat = wWall === 'DOOR' ? doorMat : wWall === 'HIDEDOOR' ? secretDoorMat : wallMat;
          const mesh = new THREE.Mesh(wallGeo, mat);
          mesh.rotation.y = Math.PI / 2;
          mesh.position.set(wx - 2, 1.6, wy);
          group.add(mesh);
        }
      }
    }
  }, [maze, x, y, wireframeMode]);

  return (
    <div className="relative w-full h-full min-h-[360px] bg-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Subtle CRT screen scanline overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
          backgroundSize: '100% 4px'
        }}
      />
    </div>
  );
};
