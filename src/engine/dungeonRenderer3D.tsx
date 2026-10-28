import React, { useEffect, useRef, useMemo } from 'react';
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
  const forwardLightRef = useRef<THREE.SpotLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const targetTorchIntensityRef = useRef<number>(4.8);

  // Compute visual degradation ratio based on lightLevel:
  // lightLevel >= 30 -> degradation = 0.0 (maximum radiant clarity)
  // lightLevel === 0 -> degradation = 1.0 (baseline torch, peripheral shadows)
  const normalizedLight = Math.max(0, Math.min(30, lightLevel));
  const degradation = isDarkZone ? 1.0 : Math.max(0, 1 - (normalizedLight / 30));

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
    // Generate high quality, bright and readable procedural textures
    if (!texturesRef.current && typeof document !== 'undefined') {
      // 1. Stone Wall Texture (Bright, warm sandstone and chiseled medieval masonry)
      const wallCanvas = document.createElement('canvas');
      wallCanvas.width = 512;
      wallCanvas.height = 512;
      const wCtx = wallCanvas.getContext('2d')!;
      
      // Base warm mortar
      wCtx.fillStyle = '#475569';
      wCtx.fillRect(0, 0, 512, 512);
      
      // Brick pattern with distinct warm stones
      const rows = 8;
      const rowHeight = 512 / rows;
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * 64;
        for (let c = -1; c < 5; c++) {
          const bx = c * 128 + offset;
          const by = r * rowHeight;
          const bw = 124;
          const bh = rowHeight - 4;
          
          // Brick gradient - warm sandstone highlights
          const grad = wCtx.createLinearGradient(bx, by, bx, by + bh);
          const tone = 115 + Math.floor(Math.random() * 35);
          grad.addColorStop(0, `rgb(${tone + 45}, ${tone + 42}, ${tone + 36})`);
          grad.addColorStop(0.5, `rgb(${tone + 22}, ${tone + 20}, ${tone + 14})`);
          grad.addColorStop(1, `rgb(${tone - 8}, ${tone - 12}, ${tone - 16})`);
          wCtx.fillStyle = grad;
          wCtx.fillRect(bx, by, bw, bh);

          // Top edge bevel highlight
          wCtx.fillStyle = 'rgba(255, 255, 255, 0.22)';
          wCtx.fillRect(bx, by, bw, 2);

          // Subtle stone grain specs
          wCtx.fillStyle = 'rgba(255, 255, 255, 0.09)';
          for (let p = 0; p < 45; p++) {
            wCtx.fillRect(bx + Math.random() * bw, by + Math.random() * bh, 2, 2);
          }
          wCtx.fillStyle = 'rgba(0, 0, 0, 0.12)';
          for (let p = 0; p < 45; p++) {
            wCtx.fillRect(bx + Math.random() * bw, by + Math.random() * bh, 2, 2);
          }
        }
      }

      // 2. Heavy Medieval Wood & Iron Door (Rich warm chestnut planks & shiny brass ring)
      const doorCanvas = document.createElement('canvas');
      doorCanvas.width = 512;
      doorCanvas.height = 512;
      const dCtx = doorCanvas.getContext('2d')!;
      
      dCtx.fillStyle = '#29170e';
      dCtx.fillRect(0, 0, 512, 512);

      // Wooden planks
      for (let p = 0; p < 6; p++) {
        const px = 40 + p * 72;
        const pGrad = dCtx.createLinearGradient(px, 30, px + 68, 512);
        pGrad.addColorStop(0, '#9a5323');
        pGrad.addColorStop(0.5, '#783e18');
        pGrad.addColorStop(1, '#562b10');
        dCtx.fillStyle = pGrad;
        dCtx.fillRect(px, 30, 68, 482);

        // Wood grain streaks
        dCtx.fillStyle = 'rgba(255,255,255,0.06)';
        dCtx.fillRect(px + 10, 30, 4, 482);
        dCtx.fillRect(px + 40, 30, 6, 482);
      }

      // Iron frame & rivets
      dCtx.strokeStyle = '#cbd5e1';
      dCtx.lineWidth = 14;
      dCtx.strokeRect(30, 25, 452, 487);
      
      // Iron crossbands
      dCtx.fillStyle = '#64748b';
      dCtx.fillRect(30, 140, 452, 30);
      dCtx.fillRect(30, 360, 452, 30);

      // Rivets
      dCtx.fillStyle = '#f1f5f9';
      [60, 160, 260, 360, 460].forEach(rx => {
        dCtx.beginPath();
        dCtx.arc(rx, 155, 6, 0, Math.PI * 2);
        dCtx.arc(rx, 375, 6, 0, Math.PI * 2);
        dCtx.fill();
      });

      // Golden Bronze ring handle
      dCtx.strokeStyle = '#fbbf24';
      dCtx.lineWidth = 15;
      dCtx.beginPath();
      dCtx.arc(380, 260, 30, 0, Math.PI * 2);
      dCtx.stroke();

      // 3. Flagstone Floor (Clean, bright stone pavers)
      const floorCanvas = document.createElement('canvas');
      floorCanvas.width = 512;
      floorCanvas.height = 512;
      const fCtx = floorCanvas.getContext('2d')!;
      fCtx.fillStyle = '#334155';
      fCtx.fillRect(0, 0, 512, 512);

      for (let fx = 0; fx < 512; fx += 128) {
        for (let fy = 0; fy < 512; fy += 128) {
          const fTone = 95 + Math.floor(Math.random() * 30);
          fCtx.fillStyle = `rgb(${fTone + 25}, ${fTone + 22}, ${fTone + 20})`;
          fCtx.fillRect(fx + 3, fy + 3, 122, 122);

          // Top highlight
          fCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          fCtx.fillRect(fx + 3, fy + 3, 122, 12);
        }
      }

      // 4. Vaulted Ceiling
      const ceilCanvas = document.createElement('canvas');
      ceilCanvas.width = 256;
      ceilCanvas.height = 256;
      const cCtx = ceilCanvas.getContext('2d')!;
      cCtx.fillStyle = '#334155';
      cCtx.fillRect(0, 0, 256, 256);
      cCtx.fillStyle = '#1e293b';
      cCtx.fillRect(0, 0, 256, 22);
      cCtx.fillRect(0, 120, 256, 22);

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
    scene.background = new THREE.Color(0x0e1628);
    scene.fog = new THREE.FogExp2(0x0e1628, 0.018);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    camera.position.set(x * 4, 1.6, -y * 4);
    camera.rotation.y = -direction * (Math.PI / 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.85;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Warm high-lumen ambient light
    const ambientLight = new THREE.AmbientLight(0xfffaec, 1.25);
    scene.add(ambientLight);

    // Handheld torch light
    const torchLight = new THREE.PointLight(0xffe6aa, 4.8, 44, 1.0);
    torchLight.position.set(x * 4, 1.8, -y * 4);
    scene.add(torchLight);

    // Forward corridor spotlight attached directly to the camera
    const forwardLight = new THREE.SpotLight(0xfff5e0, 2.2, 40, Math.PI / 3, 0.45, 1.1);
    forwardLight.position.set(0, 0, -0.4);
    camera.add(forwardLight);
    forwardLight.target.position.set(0, 0, -10);
    camera.add(forwardLight.target);
    scene.add(camera);

    const mazeGroup = new THREE.Group();
    scene.add(mazeGroup);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    mazeObjectsRef.current = mazeGroup;
    torchLightRef.current = torchLight;
    forwardLightRef.current = forwardLight;
    ambientLightRef.current = ambientLight;

    let animationId: number;
    const clock = new THREE.Clock();

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

        // Torch light follows player with organic flicker
        // Higher degradation = more nervous, unstable torch flame; lower degradation = serene steady light
        if (torchLightRef.current) {
          torchLightRef.current.position.copy(cameraRef.current.position);
          const flickerFreq = 6 + degradation * 5;
          const flickerAmp = 0.02 + degradation * 0.07;
          const flicker = Math.sin(elapsed * flickerFreq) * flickerAmp + Math.cos(elapsed * 13) * (flickerAmp * 0.4);
          torchLightRef.current.intensity = Math.max(0.2, targetTorchIntensityRef.current * (1 + flicker));
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

  // Dynamically adapt lights and fog according to lightLevel degradation
  useEffect(() => {
    if (!sceneRef.current || !torchLightRef.current || !ambientLightRef.current) return;

    if (isDarkZone) {
      sceneRef.current.fog = new THREE.FogExp2(0x000000, 0.32);
      torchLightRef.current.distance = 7;
      targetTorchIntensityRef.current = 0.6;
      ambientLightRef.current.intensity = 0.08;
      if (forwardLightRef.current) forwardLightRef.current.intensity = 0.1;
      if (rendererRef.current) rendererRef.current.toneMappingExposure = 0.95;
    } else {
      // Degradation curves:
      // At degradation 0.0 (high lightLevel >= 30, eg LOMILWA):
      // - ultra-clear distance fog (0.012)
      // - ambient: 1.65, torch: 5.8 (reach 58), forward spot: 2.6
      // - toneMappingExposure: 2.05 (brilliant clarity)
      // At degradation 1.0 (lightLevel 0, standard handheld torch):
      // - fog density: 0.038 (shadows obscure distance beyond 4 tiles)
      // - ambient: 1.15 (bright and crisp, far superior to legacy 0.8)
      // - torch: 4.4 (reach 38), forward spot: 1.6
      // - toneMappingExposure: 1.75
      const fogDensity = wireframeMode 
        ? 0.02 
        : 0.012 + degradation * 0.026;
      
      const fogColor = wireframeMode ? 0x001100 : 0x0e1628;
      sceneRef.current.fog = new THREE.FogExp2(fogColor, fogDensity);

      const ambientInt = 1.65 - degradation * 0.50;
      const torchInt = 5.8 - degradation * 1.4;
      const torchDist = 58 - degradation * 20;

      ambientLightRef.current.intensity = ambientInt;
      torchLightRef.current.distance = torchDist;
      targetTorchIntensityRef.current = torchInt;

      if (forwardLightRef.current) {
        forwardLightRef.current.intensity = 2.6 - degradation * 1.0;
      }
      if (rendererRef.current) {
        rendererRef.current.toneMappingExposure = 2.05 - degradation * 0.30;
      }
    }
  }, [lightLevel, isDarkZone, wireframeMode, degradation]);

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
          roughness: 0.80, 
          metalness: 0.08 
        });

    const doorMat = wireframeMode 
      ? new THREE.MeshBasicMaterial({ color: 0xeab308, wireframe: true })
      : new THREE.MeshStandardMaterial({ 
          map: texturesRef.current.door, 
          roughness: 0.65, 
          metalness: 0.25 
        });

    const secretDoorMat = wireframeMode 
      ? new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true })
      : new THREE.MeshStandardMaterial({ 
          map: texturesRef.current.stone, 
          roughness: 0.85, 
          metalness: 0.08 
        });

    // Floor and Ceiling
    if (!wireframeMode) {
      const floorGeo = new THREE.PlaneGeometry(80, 80);
      const floorMat = new THREE.MeshStandardMaterial({ 
        map: texturesRef.current.floor, 
        roughness: 0.90 
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(40, 0, -40);
      group.add(floor);

      const ceilGeo = new THREE.PlaneGeometry(80, 80);
      const ceilMat = new THREE.MeshStandardMaterial({ 
        map: texturesRef.current.ceiling, 
        roughness: 0.85 
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

        // Special Square 3D Features (e.g. Staircase)
        const sqrCode = maze.sqrExtra[cx]?.[cy];
        const sqrDef = maze.extraDefs?.[sqrCode];
        if (sqrDef?.type === 'STAIRS') {
          const isDown = sqrDef.aux0 > maze.level;
          const stairsGroup = new THREE.Group();
          stairsGroup.position.set(wx, 0.05, wy);

          if (!wireframeMode) {
            const stepMat = new THREE.MeshStandardMaterial({
              map: texturesRef.current.stone,
              roughness: 0.82,
              metalness: 0.12
            });

            // 5 stone steps descending or ascending
            for (let s = 0; s < 5; s++) {
              const stepGeo = new THREE.BoxGeometry(2.4, 0.16, 0.55);
              const stepMesh = new THREE.Mesh(stepGeo, stepMat);
              stepMesh.position.set(0, isDown ? -s * 0.16 : (s + 1) * 0.16, -1.1 + s * 0.55);
              stairsGroup.add(stepMesh);
            }

            // Stone balustrades / flanking pillars
            const pillarGeo = new THREE.BoxGeometry(0.3, 1.4, 0.3);
            const leftPillar = new THREE.Mesh(pillarGeo, stepMat);
            leftPillar.position.set(-1.3, 0.7, -1.1);
            stairsGroup.add(leftPillar);

            const rightPillar = new THREE.Mesh(pillarGeo, stepMat);
            rightPillar.position.set(1.3, 0.7, -1.1);
            stairsGroup.add(rightPillar);

            // Ambient stairs beacon
            const stairBeacon = new THREE.PointLight(isDown ? 0xf59e0b : 0x38bdf8, 2.2, 7);
            stairBeacon.position.set(0, 0.8, 0);
            stairsGroup.add(stairBeacon);
          } else {
            const stairWireGeo = new THREE.BoxGeometry(2.5, 0.8, 2.5);
            const stairWireMat = new THREE.MeshBasicMaterial({ color: isDown ? 0xf59e0b : 0x38bdf8, wireframe: true });
            const wireMesh = new THREE.Mesh(stairWireGeo, stairWireMat);
            wireMesh.position.set(0, 0.4, 0);
            stairsGroup.add(wireMesh);
          }

          group.add(stairsGroup);
        }
      }
    }
  }, [maze, x, y, wireframeMode]);

  return (
    <div className="relative w-full h-full min-h-[360px] bg-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* Dynamic Vignette & Visual Degradation Overlay based on lightLevel */}
      <div 
        className="pointer-events-none absolute inset-0 transition-all duration-700 ease-out"
        style={{
          background: isDarkZone
            ? 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.65) 20%, rgba(0,0,0,0.98) 75%)'
            : `radial-gradient(ellipse at 50% 50%, transparent ${
                85 - degradation * 45
              }%, rgba(8, 12, 22, ${
                0.08 + degradation * 0.62
              }) ${
                110 - degradation * 25
              }%, rgba(3, 5, 10, ${
                0.15 + degradation * 0.78
              }) 100%)`,
        }}
      />

      {/* Atmospheric Dust Motes & Film Grain accentuating gloom as lightLevel drops */}
      {degradation > 0.35 && (
        <div 
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000 mix-blend-screen"
          style={{
            opacity: Math.min(0.25, (degradation - 0.35) * 0.38),
            backgroundImage: `radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 140px 170px, #ffdfa0, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 260px 80px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 320px 240px, #f59e0b, rgba(0,0,0,0))`,
            backgroundSize: '360px 360px',
          }}
        />
      )}

      {/* Subtle CRT screen scanline overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
          backgroundSize: '100% 4px'
        }}
      />

      {/* Atmospheric Torch Light Level Gauge in Viewport */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none flex items-center gap-2 select-none">
        <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md border text-[11px] font-mono flex items-center gap-2 transition-all duration-300 shadow-lg ${
          isDarkZone 
            ? 'bg-black/85 border-purple-900/60 text-purple-300'
            : lightLevel > 20
              ? 'bg-amber-950/80 border-amber-500/80 text-amber-200 shadow-amber-950/40'
              : lightLevel > 0
                ? 'bg-slate-900/85 border-amber-600/50 text-amber-300'
                : 'bg-slate-900/80 border-slate-700/60 text-slate-400'
        }`}>
          {isDarkZone ? (
            <>
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="font-sans font-bold">Zone d'Obscurité Magique</span>
            </>
          ) : (
            <>
              <span className={`w-2 h-2 rounded-full ${
                lightLevel > 20 ? 'bg-amber-300 animate-ping' : lightLevel > 0 ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'
              }`} />
              <span className="font-sans font-semibold">
                {lightLevel > 25 
                  ? 'Clarté Divine (LOMILWA)' 
                  : lightLevel > 0 
                    ? `Lumière Magique (+${lightLevel})` 
                    : 'Torche Standard'}
              </span>
              {/* Degradation bar */}
              <div className="w-16 h-1.5 bg-black/60 rounded-full overflow-hidden border border-slate-700/40 ml-1">
                <div 
                  className={`h-full transition-all duration-500 ${
                    lightLevel > 20 ? 'bg-amber-400' : lightLevel > 0 ? 'bg-amber-500' : 'bg-slate-600'
                  }`}
                  style={{ width: `${Math.max(15, Math.min(100, lightLevel > 0 ? (lightLevel / 30) * 100 : 25))}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
