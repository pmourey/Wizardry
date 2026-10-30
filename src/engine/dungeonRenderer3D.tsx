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
    // Generate high quality, authentic dark medieval dungeon procedural textures
    if (!texturesRef.current && typeof document !== 'undefined') {
      // 1. Dark Medieval Dungeon Stone Blocks (Weathered ashlar granite with deep dark mortar)
      const wallCanvas = document.createElement('canvas');
      wallCanvas.width = 512;
      wallCanvas.height = 512;
      const wCtx = wallCanvas.getContext('2d')!;
      
      // Deep dark mortar background
      wCtx.fillStyle = '#0f141c';
      wCtx.fillRect(0, 0, 512, 512);
      
      // Chiseled ashlar blocks
      const rows = 8;
      const rowHeight = 512 / rows;
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * 64;
        for (let c = -1; c < 5; c++) {
          const bx = c * 128 + offset;
          const by = r * rowHeight;
          const bw = 124;
          const bh = rowHeight - 4;
          
          // Realistic dark granite/stone gradient with top bevel highlight and bottom shadow
          const grad = wCtx.createLinearGradient(bx, by, bx, by + bh);
          const baseTone = 55 + Math.floor(Math.random() * 25); // [55..80]
          grad.addColorStop(0, `rgb(${baseTone + 30}, ${baseTone + 32}, ${baseTone + 35})`);
          grad.addColorStop(0.5, `rgb(${baseTone + 8}, ${baseTone + 10}, ${baseTone + 12})`);
          grad.addColorStop(1, `rgb(${baseTone - 15}, ${baseTone - 12}, ${baseTone - 10})`);
          wCtx.fillStyle = grad;
          wCtx.fillRect(bx, by, bw, bh);

          // Top edge chiseled bevel highlight
          wCtx.fillStyle = 'rgba(255, 255, 255, 0.18)';
          wCtx.fillRect(bx, by, bw, 2);

          // Left edge subtle highlight
          wCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          wCtx.fillRect(bx, by, 2, bh);

          // Bottom edge deep shadow
          wCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          wCtx.fillRect(bx, by + bh - 2, bw, 2);

          // Subtle weathered stone grain noise
          wCtx.fillStyle = 'rgba(255, 255, 255, 0.06)';
          for (let p = 0; p < 40; p++) {
            wCtx.fillRect(bx + Math.random() * bw, by + Math.random() * bh, 2, 2);
          }
          wCtx.fillStyle = 'rgba(0, 0, 0, 0.20)';
          for (let p = 0; p < 50; p++) {
            wCtx.fillRect(bx + Math.random() * bw, by + Math.random() * bh, 2, 2);
          }
        }
      }

      // 2. Heavy Medieval Dungeon Oak Door with Wrought Iron Reinforcements
      const doorCanvas = document.createElement('canvas');
      doorCanvas.width = 512;
      doorCanvas.height = 512;
      const dCtx = doorCanvas.getContext('2d')!;
      
      // Deep dark stone doorframe
      dCtx.fillStyle = '#11151c';
      dCtx.fillRect(0, 0, 512, 512);

      // Dark aged bog-oak vertical timber planks
      for (let p = 0; p < 6; p++) {
        const px = 40 + p * 72;
        const pGrad = dCtx.createLinearGradient(px, 30, px + 68, 512);
        pGrad.addColorStop(0, '#3e271a');
        pGrad.addColorStop(0.5, '#281810');
        pGrad.addColorStop(1, '#1b100b');
        dCtx.fillStyle = pGrad;
        dCtx.fillRect(px, 30, 68, 482);

        // Wood grain streaks
        dCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        dCtx.fillRect(px + 12, 30, 3, 482);
        dCtx.fillRect(px + 45, 30, 4, 482);
        dCtx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        dCtx.fillRect(px + 66, 30, 2, 482); // plank shadow gap
      }

      // Heavy forged iron arch / border
      dCtx.strokeStyle = '#2d3748';
      dCtx.lineWidth = 14;
      dCtx.strokeRect(30, 25, 452, 487);
      
      // Horizontal wrought-iron reinforcement bands
      dCtx.fillStyle = '#1e293b';
      dCtx.fillRect(30, 130, 452, 34);
      dCtx.fillRect(30, 350, 452, 34);

      // Iron band bevel highlight
      dCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      dCtx.fillRect(30, 130, 452, 3);
      dCtx.fillRect(30, 350, 452, 3);

      // Iron rivets / studs
      [55, 145, 240, 335, 425].forEach(rx => {
        dCtx.fillStyle = '#475569';
        dCtx.beginPath();
        dCtx.arc(rx, 147, 7, 0, Math.PI * 2);
        dCtx.arc(rx, 367, 7, 0, Math.PI * 2);
        dCtx.fill();
        dCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        dCtx.beginPath();
        dCtx.arc(rx - 2, 145, 3, 0, Math.PI * 2);
        dCtx.arc(rx - 2, 365, 3, 0, Math.PI * 2);
        dCtx.fill();
      });

      // Heavy forged iron ring handle
      dCtx.strokeStyle = '#64748b';
      dCtx.lineWidth = 14;
      dCtx.beginPath();
      dCtx.arc(380, 250, 28, 0, Math.PI * 2);
      dCtx.stroke();
      dCtx.fillStyle = '#1e293b';
      dCtx.fillRect(366, 210, 28, 14);

      // 3. Flagstone Dungeon Floor (Aged slate slabs with dark moss crevices)
      const floorCanvas = document.createElement('canvas');
      floorCanvas.width = 512;
      floorCanvas.height = 512;
      const fCtx = floorCanvas.getContext('2d')!;
      fCtx.fillStyle = '#0a0d13';
      fCtx.fillRect(0, 0, 512, 512);

      for (let fx = 0; fx < 512; fx += 128) {
        for (let fy = 0; fy < 512; fy += 128) {
          const fTone = 45 + Math.floor(Math.random() * 20); // [45..65]
          fCtx.fillStyle = `rgb(${fTone}, ${fTone + 2}, ${fTone + 4})`;
          fCtx.fillRect(fx + 3, fy + 3, 122, 122);

          // Top highlight
          fCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          fCtx.fillRect(fx + 3, fy + 3, 122, 6);

          // Subtle stone grain
          fCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          fCtx.fillRect(fx + 40, fy + 40, 40, 40);
        }
      }

      // 4. Dungeon Vaulted Ceiling (Dark stone masonry & timber rafters)
      const ceilCanvas = document.createElement('canvas');
      ceilCanvas.width = 256;
      ceilCanvas.height = 256;
      const cCtx = ceilCanvas.getContext('2d')!;
      cCtx.fillStyle = '#0e1218';
      cCtx.fillRect(0, 0, 256, 256);
      cCtx.fillStyle = '#171c26';
      cCtx.fillRect(0, 0, 256, 30);
      cCtx.fillRect(0, 128, 256, 30);
      cCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      cCtx.fillRect(0, 28, 256, 6);
      cCtx.fillRect(0, 156, 256, 6);

      texturesRef.current = {
        stone: new THREE.CanvasTexture(wallCanvas),
        door: new THREE.CanvasTexture(doorCanvas),
        floor: new THREE.CanvasTexture(floorCanvas),
        ceiling: new THREE.CanvasTexture(ceilCanvas),
      };

      texturesRef.current.floor.wrapS = THREE.RepeatWrapping;
      texturesRef.current.floor.wrapT = THREE.RepeatWrapping;
      texturesRef.current.floor.repeat.set(75, 75);

      texturesRef.current.ceiling.wrapS = THREE.RepeatWrapping;
      texturesRef.current.ceiling.wrapT = THREE.RepeatWrapping;
      texturesRef.current.ceiling.repeat.set(75, 75);
    }
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 640;
    const height = containerRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(wireframeMode ? 0x000000 : 0x070b14);
    scene.fog = wireframeMode ? new THREE.Fog(0x000000, 16, 26) : new THREE.FogExp2(0x070b14, 0.018);

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

  // Dynamically adapt lights, background and fog according to lightLevel degradation and wireframeMode
  useEffect(() => {
    if (!sceneRef.current || !torchLightRef.current || !ambientLightRef.current) return;

    if (wireframeMode) {
      // Authentic 1981 Apple II Vector Wireframe:
      // PURE JET BLACK background and fog (no blue floor, no blue ceiling, no colored haze)
      sceneRef.current.background = new THREE.Color(0x000000);
      sceneRef.current.fog = new THREE.Fog(0x000000, 16, 26); // Authentic 5-tile visibility horizon

      ambientLightRef.current.intensity = 1.0;
      torchLightRef.current.intensity = 0;
      if (forwardLightRef.current) forwardLightRef.current.intensity = 0;
      if (rendererRef.current) rendererRef.current.toneMappingExposure = 1.0;
      return;
    }

    // 3D Donjon Pierre Réaliste
    sceneRef.current.background = new THREE.Color(isDarkZone ? 0x000000 : 0x070b14);

    if (isDarkZone) {
      sceneRef.current.fog = new THREE.FogExp2(0x000000, 0.32);
      torchLightRef.current.distance = 7;
      targetTorchIntensityRef.current = 0.6;
      ambientLightRef.current.intensity = 0.08;
      if (forwardLightRef.current) forwardLightRef.current.intensity = 0.1;
      if (rendererRef.current) rendererRef.current.toneMappingExposure = 0.95;
    } else {
      const fogDensity = 0.012 + degradation * 0.026;
      sceneRef.current.fog = new THREE.FogExp2(0x070b14, fogDensity);

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

    // 1. Materials for 3D Pierre Réaliste mode:
    const wallBoxGeo = new THREE.BoxGeometry(4.0, 3.2, 0.35);
    const doorBoxGeo = new THREE.BoxGeometry(3.9, 3.15, 0.35);

    const stoneWallMat = new THREE.MeshStandardMaterial({ 
      map: texturesRef.current.stone, 
      roughness: 0.88, 
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    const doorMat = new THREE.MeshStandardMaterial({ 
      map: texturesRef.current.door, 
      roughness: 0.70, 
      metalness: 0.18,
      side: THREE.DoubleSide
    });

    const secretDoorMat = stoneWallMat;

    // 2. Materials & Geometries for Authentic Apple II (1981) Vector Wireframe:
    // Solid jet black plane (occludes walls behind it) with polygonOffset to completely prevent Z-fighting flickering!
    const retroOcclusionPlaneGeo = new THREE.PlaneGeometry(4.0, 3.2);
    const retroBlackMat = new THREE.MeshBasicMaterial({ 
      color: 0x000000, 
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 2.0,
      polygonOffsetUnits: 4.0
    });

    // Outer wall 4 outline lines: top, right, bottom, left (Apple II DRAWLINE authentic coordinates)
    // Inset slightly by 0.015 so lines never intersect perpendicular planes at corners
    const wallLinePoints = [
      new THREE.Vector3(-1.985, 1.585, 0), new THREE.Vector3(1.985, 1.585, 0),
      new THREE.Vector3(1.985, 1.585, 0), new THREE.Vector3(1.985, -1.585, 0),
      new THREE.Vector3(1.985, -1.585, 0), new THREE.Vector3(-1.985, -1.585, 0),
      new THREE.Vector3(-1.985, -1.585, 0), new THREE.Vector3(-1.985, 1.585, 0),
    ];
    const wallLineGeo = new THREE.BufferGeometry().setFromPoints(wallLinePoints);

    // Door outline: outer wall frame + authentic 3-line rectangular doorway opening (Apple II DRAWFRNT)
    // Strict historical fidelity: NO door handle, NO cross on the door
    const doorLinePoints = [
      ...wallLinePoints,
      // Inner doorway frame (left jamb, top lintel, right jamb):
      new THREE.Vector3(-0.95, -1.585, 0), new THREE.Vector3(-0.95, 0.75, 0),
      new THREE.Vector3(-0.95, 0.75, 0), new THREE.Vector3(0.95, 0.75, 0),
      new THREE.Vector3(0.95, 0.75, 0), new THREE.Vector3(0.95, -1.585, 0),
    ];
    const doorLineGeo = new THREE.BufferGeometry().setFromPoints(doorLinePoints);

    // High-contrast, bright, authentic Apple II lines (Pure Crisp White for walls, Warm Amber for doors)
    const retroWallLineMat = new THREE.LineBasicMaterial({ 
      color: 0xffffff, // Pure bright white (Apple II HGR White 1-bit)
      linewidth: 2,
      depthTest: true
    });
    const retroDoorLineMat = new THREE.LineBasicMaterial({ 
      color: 0xfbbf24, // Bright Amber/Gold for doors
      linewidth: 2,
      depthTest: true
    });
    const retroSecretLineMat = retroWallLineMat; // secret doors look identical to regular walls

    const createWallMesh = (isDoor: boolean, isSecret: boolean) => {
      if (wireframeMode) {
        // Authentic Apple II: 100% solid black occlusion plane (no seeing through) + crisp bright vector lines (no z-fighting)
        const mesh = new THREE.Mesh(retroOcclusionPlaneGeo, retroBlackMat);
        const lineGeo = isDoor ? doorLineGeo : wallLineGeo;
        const lineMat = isDoor ? retroDoorLineMat : (isSecret ? retroSecretLineMat : retroWallLineMat);
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        mesh.add(lines);
        return mesh;
      } else {
        // 3D Pierre Réaliste: 100% opaque, heavy solid stone block
        const mat = isDoor ? doorMat : (isSecret ? secretDoorMat : stoneWallMat);
        return new THREE.Mesh(isDoor ? doorBoxGeo : wallBoxGeo, mat);
      }
    };

    // Floor and Ceiling - Expansive coverage ensuring no black empty strips on map edges
    if (!wireframeMode) {
      const floorGeo = new THREE.PlaneGeometry(300, 300);
      const floorMat = new THREE.MeshStandardMaterial({ 
        map: texturesRef.current.floor, 
        roughness: 0.92,
        side: THREE.FrontSide
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(38, 0, -38);
      group.add(floor);

      const ceilGeo = new THREE.PlaneGeometry(300, 300);
      const ceilMat = new THREE.MeshStandardMaterial({ 
        map: texturesRef.current.ceiling, 
        roughness: 0.88,
        side: THREE.FrontSide
      });
      const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.set(38, 3.2, -38);
      group.add(ceiling);
    }

    // =========================================================================
    // Build entire 20x20 floor grid ONCE without duplicates and without recreation on move:
    // 1. Horizontal walls (running East-West along gy = 0..20, separating rows)
    // =========================================================================
    for (let cx = 0; cx < 20; cx++) {
      for (let gy = 0; gy <= 20; gy++) {
        let wallType: TWall = 'OPEN';
        if (gy === 0) {
          wallType = maze.s[cx]?.[0] || 'WALL';
        } else if (gy === 20) {
          wallType = maze.n[cx]?.[19] || 'WALL';
        } else {
          const nFromSouth = maze.n[cx]?.[gy - 1];
          const sFromNorth = maze.s[cx]?.[gy];
          if (nFromSouth === 'DOOR' || sFromNorth === 'DOOR') wallType = 'DOOR';
          else if (nFromSouth === 'HIDEDOOR' || sFromNorth === 'HIDEDOOR') wallType = 'HIDEDOOR';
          else if (nFromSouth === 'WALL' || sFromNorth === 'WALL') wallType = 'WALL';
        }

        if (wallType !== 'OPEN') {
          const isDoor = wallType === 'DOOR';
          const isSecret = wallType === 'HIDEDOOR';
          const mesh = createWallMesh(isDoor, isSecret);
          mesh.position.set(cx * 4, 1.6, -gy * 4 + 2);
          group.add(mesh);
        }
      }
    }

    // =========================================================================
    // 2. Vertical walls (running North-South along gx = 0..20, separating columns)
    // =========================================================================
    for (let cy = 0; cy < 20; cy++) {
      for (let gx = 0; gx <= 20; gx++) {
        let wallType: TWall = 'OPEN';
        if (gx === 0) {
          wallType = maze.w[0]?.[cy] || 'WALL';
        } else if (gx === 20) {
          wallType = maze.e[19]?.[cy] || 'WALL';
        } else {
          const eFromWest = maze.e[gx - 1]?.[cy];
          const wFromEast = maze.w[gx]?.[cy];
          if (eFromWest === 'DOOR' || wFromEast === 'DOOR') wallType = 'DOOR';
          else if (eFromWest === 'HIDEDOOR' || wFromEast === 'HIDEDOOR') wallType = 'HIDEDOOR';
          else if (eFromWest === 'WALL' || wFromEast === 'WALL') wallType = 'WALL';
        }

        if (wallType !== 'OPEN') {
          const isDoor = wallType === 'DOOR';
          const isSecret = wallType === 'HIDEDOOR';
          const mesh = createWallMesh(isDoor, isSecret);
          mesh.rotation.y = Math.PI / 2;
          mesh.position.set(gx * 4 - 2, 1.6, -cy * 4);
          group.add(mesh);
        }
      }
    }

    // =========================================================================
    // 3. Special Square 3D Features (e.g. Staircases)
    // =========================================================================
    for (let cx = 0; cx < 20; cx++) {
      for (let cy = 0; cy < 20; cy++) {
        const sqrCode = maze.sqrExtra[cx]?.[cy];
        const sqrDef = maze.extraDefs?.[sqrCode];
        if (sqrDef?.type === 'STAIRS') {
          const isDown = sqrDef.aux0 > maze.level;
          const stairsGroup = new THREE.Group();
          stairsGroup.position.set(cx * 4, 0.05, -cy * 4);

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
  }, [maze, wireframeMode]);

  return (
    <div className="relative w-full h-full min-h-[360px] bg-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* Dynamic Vignette & Visual Degradation Overlay based on lightLevel (3D Pierre mode only) */}
      {!wireframeMode && (
        <>
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
        </>
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
