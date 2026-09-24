"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";

interface UnityCanvasProps {
  buildUrl?: string;
}

export default function UnityCanvas({
  buildUrl = process.env.NEXT_PUBLIC_UNITY_BUILD_URL || "/game-build/Build/game.json",
}: UnityCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active Player & Camera State
  const [isCrouching, setIsCrouching] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [playerCoords, setPlayerCoords] = useState({ x: 0, z: 12 });
  const [insideLocation, setInsideLocation] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);

  // Persistent Player 3D Position Ref (Prevents position resets on state changes!)
  const playerPosRef = useRef({ x: 0, z: 12, angle: 0 });
  const isCrouchingRef = useRef(false);
  isCrouchingRef.current = isCrouching;

  // Game World & Infrastructure State
  const [worldState, setWorldState] = useState({
    baseOneDoorOpen: false,
    baseOneGeneratorRepaired: false,
    baseOneGeneratorRunning: false,
    substationPowerOnline: false,
    pharmacySearched: false,
    evidenceCollected: false,
    waterCount: 0,
  });

  const worldStateRef = useRef(worldState);
  worldStateRef.current = worldState;

  const [inventory, setInventory] = useState<Array<{ id: string; name: string; count: number }>>([
    { id: "item_scrap_metal", name: "Scrap Metal", count: 3 },
  ]);
  const inventoryRef = useRef(inventory);
  inventoryRef.current = inventory;

  const [journal, setJournal] = useState<Array<{ id: string; title: string; content: string; location: string }>>([]);
  const journalRef = useRef(journal);
  journalRef.current = journal;

  const [showJournal, setShowJournal] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([
    "Coordinator awake at Base One exterior.",
    "System: Approach Base One doorway and press E to open the door and explore interiors!",
  ]);

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const logAction = (msg: string) => {
    setActionLog((prev) => [msg, ...prev.slice(0, 4)]);
  };

  // 3D Three.js Engine Setup & Render Loop (Runs ONCE on Mount!)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.012);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.2);
    sunLight.position.set(25, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Interior Point Lights
    const baseOneIntLight = new THREE.PointLight(0x10b981, 0, 15);
    baseOneIntLight.position.set(-12, 3, -12);
    scene.add(baseOneIntLight);

    const baseOneRadioLight = new THREE.PointLight(0x38bdf8, 0.8, 10);
    baseOneRadioLight.position.set(-6, 2.5, -16);
    scene.add(baseOneRadioLight);

    const pharmIntLight = new THREE.PointLight(0xfef08a, 0.8, 12);
    pharmIntLight.position.set(15, 2.8, -12);
    scene.add(pharmIntLight);

    const subIntLight = new THREE.PointLight(0xf59e0b, 1.0, 12);
    subIntLight.position.set(15, 2.8, 14);
    scene.add(subIntLight);

    // 3. Terrain & Roads
    const groundGeo = new THREE.PlaneGeometry(140, 140);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(140, 70, 0x1e293b, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    const roadGeo = new THREE.PlaneGeometry(140, 10);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.02, 0);
    road.receiveShadow = true;
    scene.add(road);

    // --- 4. BUILDING 1: BASE ONE (18m × 14m × 4m) ---
    const baseOneGroup = new THREE.Group();
    baseOneGroup.position.set(-12, 0, -12);

    const b1FloorGeo = new THREE.PlaneGeometry(18, 14);
    const b1FloorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const b1Floor = new THREE.Mesh(b1FloorGeo, b1FloorMat);
    b1Floor.rotation.x = -Math.PI / 2;
    b1Floor.position.set(0, 0.03, 0);
    b1Floor.receiveShadow = true;
    baseOneGroup.add(b1Floor);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const createWall = (w: number, h: number, d: number, px: number, py: number, pz: number) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(px, py, pz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      baseOneGroup.add(mesh);
    };

    createWall(18, 3.5, 0.4, 0, 1.75, -7);
    createWall(0.4, 3.5, 14, -9, 1.75, 0);
    createWall(0.4, 3.5, 14, 9, 1.75, 0);
    createWall(7, 3.5, 0.4, -5.5, 1.75, 7);
    createWall(7, 3.5, 0.4, 5.5, 1.75, 7);
    createWall(0.4, 3.5, 8, -2, 1.75, -3);
    createWall(8, 3.5, 0.4, 4, 1.75, -1);

    // Dynamic Transparent Roof
    const b1RoofGeo = new THREE.BoxGeometry(18.4, 0.3, 14.4);
    const b1RoofMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.3,
      transparent: true,
      opacity: 0.9,
    });
    const b1Roof = new THREE.Mesh(b1RoofGeo, b1RoofMat);
    b1Roof.position.set(0, 3.65, 0);
    baseOneGroup.add(b1Roof);

    // 3D Door Mesh
    const doorGroup = new THREE.Group();
    doorGroup.position.set(-2, 0, 7);
    const doorGeo = new THREE.BoxGeometry(4, 3.0, 0.3);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(2, 1.5, 0);
    doorMesh.castShadow = true;
    doorGroup.add(doorMesh);
    baseOneGroup.add(doorGroup);

    // Generator Turbine Mesh
    const genGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 16);
    const genMat = new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.8 });
    const genMesh = new THREE.Mesh(genGeo, genMat);
    genMesh.position.set(-6, 1.1, -4);
    baseOneGroup.add(genMesh);

    // Water Pump Mesh
    const pumpGeo = new THREE.BoxGeometry(1.8, 2.2, 1.8);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 });
    const pumpMesh = new THREE.Mesh(pumpGeo, pumpMat);
    pumpMesh.position.set(-6, 1.1, 3);
    baseOneGroup.add(pumpMesh);

    // Radio Room Console Mesh
    const radioGeo = new THREE.BoxGeometry(2.5, 1.2, 1.5);
    const radioMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1 });
    const radioMesh = new THREE.Mesh(radioGeo, radioMat);
    radioMesh.position.set(5, 0.6, -4);
    baseOneGroup.add(radioMesh);

    // Bunks
    for (let i = 0; i < 3; i++) {
      const bunkGeo = new THREE.BoxGeometry(1.8, 1.4, 3.2);
      const bunkMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const bunkMesh = new THREE.Mesh(bunkGeo, bunkMat);
      bunkMesh.position.set(3.5, 0.7, 1 + i * 2.2);
      baseOneGroup.add(bunkMesh);
    }

    scene.add(baseOneGroup);

    // --- 5. BUILDING 2: PHARMACY (10m × 8m × 3.5m) ---
    const pharmacyGroup = new THREE.Group();
    pharmacyGroup.position.set(18, 0, -12);

    const pharmFloorGeo = new THREE.PlaneGeometry(10, 8);
    const pharmFloorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const pharmFloor = new THREE.Mesh(pharmFloorGeo, pharmFloorMat);
    pharmFloor.rotation.x = -Math.PI / 2;
    pharmFloor.position.set(0, 0.03, 0);
    pharmacyGroup.add(pharmFloor);

    const pharmRoofGeo = new THREE.BoxGeometry(10.4, 0.3, 8.4);
    const pharmRoofMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.9,
    });
    const pharmRoof = new THREE.Mesh(pharmRoofGeo, pharmRoofMat);
    pharmRoof.position.set(0, 3.65, 0);
    pharmacyGroup.add(pharmRoof);

    const cacheGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const cacheMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const cacheMesh = new THREE.Mesh(cacheGeo, cacheMat);
    cacheMesh.position.set(-2.5, 0.75, -1.5);
    pharmacyGroup.add(cacheMesh);

    const noteGeo = new THREE.BoxGeometry(0.8, 0.1, 1.0);
    const noteMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706 });
    const noteMesh = new THREE.Mesh(noteGeo, noteMat);
    noteMesh.position.set(2.5, 0.8, -1.5);
    pharmacyGroup.add(noteMesh);

    scene.add(pharmacyGroup);

    // --- 6. BUILDING 3: ELECTRICAL SUBSTATION (14m × 10m × 3.5m) ---
    const subGroup = new THREE.Group();
    subGroup.position.set(18, 0, 14);

    const subFloorGeo = new THREE.PlaneGeometry(14, 10);
    const subFloorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const subFloor = new THREE.Mesh(subFloorGeo, subFloorMat);
    subFloor.rotation.x = -Math.PI / 2;
    subFloor.position.set(0, 0.03, 0);
    subGroup.add(subFloor);

    const subRoofGeo = new THREE.BoxGeometry(14.4, 0.3, 10.4);
    const subRoofMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.9,
    });
    const subRoof = new THREE.Mesh(subRoofGeo, subRoofMat);
    subRoof.position.set(0, 3.65, 0);
    subGroup.add(subRoof);

    const linkGeo = new THREE.BoxGeometry(1.8, 2.5, 1.8);
    const linkMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x047857 });
    const linkMesh = new THREE.Mesh(linkGeo, linkMat);
    linkMesh.position.set(0, 1.25, -2);
    subGroup.add(linkMesh);

    scene.add(subGroup);

    // --- 7. 3D PLAYER (THE COORDINATOR) ---
    const playerGroup = new THREE.Group();
    playerGroup.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);

    const playerCapsuleGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.7, 16);
    const playerCapsuleMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.3 });
    const playerCapsule = new THREE.Mesh(playerCapsuleGeo, playerCapsuleMat);
    playerCapsule.position.y = 0.85;
    playerCapsule.castShadow = true;
    playerGroup.add(playerCapsule);

    const visorGeo = new THREE.BoxGeometry(0.5, 0.25, 0.4);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7 });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 1.45, 0.35);
    playerGroup.add(visorMesh);

    scene.add(playerGroup);

    // Keyboard Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === "c") setIsCrouching((p) => !p);
      if (e.key === "Tab") {
        e.preventDefault();
        setShowJournal((p) => !p);
      }
      if (e.key.toLowerCase() === "e") handleInteractTrigger();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Interaction Trigger Handler (Uses refs to avoid re-mounting scene!)
    const handleInteractTrigger = () => {
      const px = playerPosRef.current.x;
      const pz = playerPosRef.current.z;
      const curWorldState = worldStateRef.current;

      // Base One Door
      if (Math.hypot(px - (-14), pz - (-5)) < 3.5) {
        const nextState = !curWorldState.baseOneDoorOpen;
        doorMesh.material.color.setHex(nextState ? 0x10b981 : 0xef4444);
        doorGroup.rotation.y = nextState ? Math.PI / 2 : 0;
        logAction(`Base One Door ${nextState ? "OPENED" : "CLOSED"}. Walk inside to explore interior rooms!`);
        setWorldState((prev) => ({ ...prev, baseOneDoorOpen: nextState }));
      }
      // Base One Generator
      else if (Math.hypot(px - (-18), pz - (-16)) < 3.5) {
        if (!curWorldState.baseOneGeneratorRepaired) {
          genMesh.material.color.setHex(0x10b981);
          baseOneIntLight.intensity = 2.5;
          logAction("Base One Generator repaired! Interior lights & grid powered ON.");
          setWorldState((prev) => ({ ...prev, baseOneGeneratorRepaired: true, baseOneGeneratorRunning: true }));
        } else {
          const nextRun = !curWorldState.baseOneGeneratorRunning;
          baseOneIntLight.intensity = nextRun ? 2.5 : 0;
          logAction(`Base One Generator toggled: ${nextRun ? "RUNNING" : "OFF"}.`);
          setWorldState((prev) => ({ ...prev, baseOneGeneratorRunning: nextRun }));
        }
      }
      // Base One Water Pump
      else if (Math.hypot(px - (-18), pz - (-9)) < 3.5) {
        setWorldState((prev) => ({ ...prev, waterCount: prev.waterCount + 2 }));
        setInventory((prev) => {
          const exist = prev.find((i) => i.id === "item_purified_water");
          if (exist) return prev.map((i) => (i.id === "item_purified_water" ? { ...i, count: i.count + 2 } : i));
          return [...prev, { id: "item_purified_water", name: "Purified Water", count: 2 }];
        });
        logAction("Collected +2 Purified Water Rations from Base One Water Pump.");
      }
      // Radio Room
      else if (Math.hypot(px - (-7), pz - (-16)) < 3.5) {
        if (!journalRef.current.some((item) => item.id === "evidence_continuity_signal")) {
          logAction("Radio Broadcast Received: 'CONTINUITY NODE 17 ACTIVE... SEEK COORDINATOR...'");
          setJournal((j) => [
            ...j,
            {
              id: "evidence_continuity_signal",
              title: "Node 17 Emergency Transmission",
              content: "CONTINUITY NODE 17 ACTIVE... SEEK COORDINATOR...",
              location: "Base One Radio Room",
            },
          ]);
        }
      }
      // Substation Check
      else if (Math.hypot(px - 18, pz - 12) < 4.0) {
        if (!curWorldState.substationPowerOnline) {
          linkMesh.material.color.setHex(0x38bdf8);
          subIntLight.color.setHex(0x38bdf8);
          logAction("Substation Power Link RESTORED! Power connected to Pharmacy interior.");
          setWorldState((prev) => ({ ...prev, substationPowerOnline: true }));
        }
      }
      // Pharmacy Cache Check
      else if (Math.hypot(px - 15.5, pz - (-13.5)) < 3.5) {
        if (!curWorldState.substationPowerOnline) {
          logAction("Pharmacy Storage Cache is LOCKED! Restore Substation Power Link first.");
        } else if (!curWorldState.pharmacySearched) {
          cacheMesh.material.color.setHex(0x64748b);
          setInventory((inv) => {
            const exist = inv.find((i) => i.id === "item_medkit");
            if (exist) return inv.map((i) => (i.id === "item_medkit" ? { ...i, count: i.count + 2 } : i));
            return [...inv, { id: "item_medkit", name: "Medical Kit", count: 2 }];
          });
          logAction("Searched Pharmacy Cache: Found 2x Medical Kits!");
          setWorldState((prev) => ({ ...prev, pharmacySearched: true }));
        }
      }
      // Evidence Note Check
      else if (Math.hypot(px - 20.5, pz - (-13.5)) < 3.5) {
        if (!curWorldState.evidenceCollected) {
          noteMesh.visible = false;
          setJournal((j) => [
            ...j,
            {
              id: "evidence_pharmacist_note",
              title: "Pharmacist's Emergency Note",
              content: "The emergency network told us to stay inside... Node 17 took control of the grid...",
              location: "Pharmacy Office Desk",
            },
          ]);
          logAction("Discovered Evidence: 'Pharmacist's Emergency Note' logged to Journal (Tab).");
          setWorldState((prev) => ({ ...prev, evidenceCollected: true }));
        }
      }
    };

    // 60 FPS Engine Animation Loop (Continuous, never re-instantiated!)
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // WASD Movement
      let moveX = 0;
      let moveZ = 0;

      if (keysPressed.current["w"] || keysPressed.current["arrowup"]) moveZ -= 1;
      if (keysPressed.current["s"] || keysPressed.current["arrowdown"]) moveZ += 1;
      if (keysPressed.current["a"] || keysPressed.current["arrowleft"]) moveX -= 1;
      if (keysPressed.current["d"] || keysPressed.current["arrowright"]) moveX += 1;

      const running = !!keysPressed.current["shift"];
      setIsRunning(running);

      const moveSpeed = isCrouchingRef.current ? 0.08 : running ? 0.22 : 0.14;

      if (moveX !== 0 || moveZ !== 0) {
        const angle = Math.atan2(moveX, moveZ);
        playerGroup.rotation.y = angle;

        playerPosRef.current.x += Math.sin(angle) * moveSpeed;
        playerPosRef.current.z += Math.cos(angle) * moveSpeed;

        playerPosRef.current.x = Math.max(-55, Math.min(55, playerPosRef.current.x));
        playerPosRef.current.z = Math.max(-55, Math.min(55, playerPosRef.current.z));

        playerGroup.position.x = playerPosRef.current.x;
        playerGroup.position.z = playerPosRef.current.z;

        setPlayerCoords({
          x: Math.round(playerPosRef.current.x),
          z: Math.round(playerPosRef.current.z),
        });
      }

      const px = playerGroup.position.x;
      const pz = playerGroup.position.z;

      // Interior Roof Opacity Cutout
      const isInsideBaseOne = px >= -21 && px <= -3 && pz >= -19 && pz <= -5;
      const isInsidePharmacy = px >= 13 && px <= 23 && pz >= -16 && pz <= -8;
      const isInsideSubstation = px >= 11 && px <= 25 && pz >= 9 && pz <= 19;

      b1RoofMat.opacity = isInsideBaseOne ? 0.1 : 0.9;
      pharmRoofMat.opacity = isInsidePharmacy ? 0.1 : 0.9;
      subRoofMat.opacity = isInsideSubstation ? 0.1 : 0.9;

      if (isInsideBaseOne) setInsideLocation("BASE ONE INTERIOR (Quarters, Generator, Radio Room)");
      else if (isInsidePharmacy) setInsideLocation("PHARMACY INTERIOR (Store Floor & Storage)");
      else if (isInsideSubstation) setInsideLocation("SUBSTATION INTERIOR (Control Room)");
      else setInsideLocation(null);

      // Camera Follow
      const camY = isInsideBaseOne || isInsidePharmacy || isInsideSubstation ? 10 : 15;
      const camZ = isInsideBaseOne || isInsidePharmacy || isInsideSubstation ? 10 : 16;
      camera.position.set(px, playerGroup.position.y + camY, pz + camZ);
      camera.lookAt(px, playerGroup.position.y + 1, pz);

      // Interaction Prompts Sensing
      const curWorldState = worldStateRef.current;
      let prompt: string | null = null;

      if (Math.hypot(px - (-14), pz - (-5)) < 3.5) {
        prompt = `[E] ${curWorldState.baseOneDoorOpen ? "Close" : "Open"} Base One Door`;
      } else if (Math.hypot(px - (-18), pz - (-16)) < 3.5) {
        prompt = curWorldState.baseOneGeneratorRepaired
          ? `[E] ${curWorldState.baseOneGeneratorRunning ? "Shut Down" : "Start"} Generator`
          : "[E] Repair Base One Generator (Requires 3x Scrap Metal)";
      } else if (Math.hypot(px - (-18), pz - (-9)) < 3.5) {
        prompt = "[E] Collect Purified Water Rations (+2)";
      } else if (Math.hypot(px - (-7), pz - (-16)) < 3.5) {
        prompt = "[E] Tune Emergency Radio (Node 17 Transmission)";
      } else if (Math.hypot(px - 18, pz - 12) < 4.0) {
        prompt = curWorldState.substationPowerOnline
          ? "[E] Substation Grid Power ONLINE"
          : "[E] Restore Substation Power Link to Pharmacy";
      } else if (Math.hypot(px - 15.5, pz - (-13.5)) < 3.5) {
        prompt = !curWorldState.substationPowerOnline
          ? "[E] Storage Cache LOCKED (Requires Power Link)"
          : curWorldState.pharmacySearched
          ? "[E] Medicine Cache EMPTY"
          : "[E] Search Medicine Cache (+2 Medkits)";
      } else if (Math.hypot(px - 20.5, pz - (-13.5)) < 3.5 && !curWorldState.evidenceCollected) {
        prompt = "[E] Inspect Pharmacist's Emergency Note";
      }

      setCurrentPrompt(prompt);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // [] dependency array ensures Three.js 3D Engine initializes ONCE on mount!

  return (
    <div className="relative w-full h-[600px] bg-slate-950 border border-emerald-900/40 rounded-xl overflow-hidden shadow-2xl">
      {/* 3D WebGL Three.js Render Viewport */}
      <div ref={containerRef} className="w-full h-full block bg-slate-950 cursor-crosshair" />

      {/* Floating 3D Interaction Prompt */}
      {currentPrompt && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-emerald-500/60 text-emerald-400 font-mono text-xs px-4 py-2 rounded-lg shadow-xl animate-bounce flex items-center gap-2 z-20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          {currentPrompt}
        </div>
      )}

      {/* Location Badge */}
      {insideLocation && (
        <div className="absolute top-6 right-6 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 z-20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {insideLocation}
        </div>
      )}

      {/* Controls Bar & Position HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 font-mono text-xs flex items-center gap-3">
          <span>3D Position: ({playerCoords.x}m, {playerCoords.z}m)</span>
          <span className={isRunning ? "text-emerald-400 font-bold" : "text-slate-500"}>RUN</span>
          <span className={isCrouching ? "text-amber-400 font-bold" : "text-slate-500"}>CROUCH</span>
        </div>

        <button
          onClick={() => setShowJournal(true)}
          className="pointer-events-auto bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
        >
          <span>Inventory & Journal (Tab)</span>
          {journal.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
              {journal.length}
            </span>
          )}
        </button>
      </div>

      {/* Action Log Overlay */}
      <div className="absolute top-4 left-4 max-w-sm pointer-events-none space-y-1 z-20">
        {actionLog.map((log, index) => (
          <div
            key={index}
            className="bg-slate-950/80 border border-slate-800/80 text-slate-300 font-mono text-[11px] px-2.5 py-1 rounded backdrop-blur"
          >
            {log}
          </div>
        ))}
      </div>

      {/* Inventory & Journal Modal */}
      {showJournal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex justify-center items-center p-6 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
                Coordinator Journal & Inventory
              </h3>
              <button
                onClick={() => setShowJournal(false)}
                className="text-slate-400 hover:text-slate-100 font-mono text-xs bg-slate-800 px-2 py-1 rounded"
              >
                Close (Esc)
              </button>
            </div>

            {/* Inventory List */}
            <div>
              <h4 className="text-xs font-mono text-emerald-400 mb-2 uppercase">Items Storage</h4>
              <div className="grid grid-cols-2 gap-2">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs font-mono flex justify-between"
                  >
                    <span className="text-slate-300">{item.name}</span>
                    <span className="text-emerald-400 font-bold">x{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discovered Evidence Notes */}
            <div>
              <h4 className="text-xs font-mono text-amber-400 mb-2 uppercase">Discovered Evidence</h4>
              {journal.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono italic">No evidence items discovered yet.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {journal.map((e) => (
                    <div
                      key={e.id}
                      className="bg-slate-950 border border-amber-900/40 p-3 rounded-lg space-y-1"
                    >
                      <div className="text-xs font-bold text-amber-300 font-mono flex justify-between">
                        <span>{e.title}</span>
                        <span className="text-[10px] text-slate-500">{e.location}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono leading-relaxed">{e.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
