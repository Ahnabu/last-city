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

  // Active Simulation State
  const [isCrouching, setIsCrouching] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [playerCoords, setPlayerCoords] = useState({ x: 0, z: 12 });
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [activeInteractableId, setActiveInteractableId] = useState<string | null>(null);

  // Game World State
  const [worldState, setWorldState] = useState({
    baseOneDoorOpen: false,
    baseOneGeneratorRepaired: false,
    baseOneGeneratorRunning: false,
    substationPowerOnline: false,
    pharmacySearched: false,
    evidenceCollected: false,
    waterCount: 0,
  });

  const [inventory, setInventory] = useState<Array<{ id: string; name: string; count: number }>>([
    { id: "item_scrap_metal", name: "Scrap Metal", count: 3 },
  ]);

  const [journal, setJournal] = useState<Array<{ id: string; title: string; content: string; location: string }>>([]);
  const [showJournal, setShowJournal] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([
    "Coordinator awake at Base One exterior.",
    "System: 3D WebGL Engine Active. Use WASD to move, E to interact, Tab for Journal.",
  ]);

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // 3D Three.js Engine Setup & Render Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Renderer Initialization
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // slate-950
    scene.fog = new THREE.FogExp2(0x020617, 0.015);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. 3D Lights Setup
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.4); // Sky tint
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfef08a, 1.2); // Sunlight
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Generator PointLight
    const genLight = new THREE.PointLight(0x10b981, 0, 10);
    genLight.position.set(-10, 2, -10);
    scene.add(genLight);

    // Substation PointLight
    const subLight = new THREE.PointLight(0xf59e0b, 1, 12);
    subLight.position.set(15, 2.5, 15);
    scene.add(subLight);

    // 3. 3D Terrain & Road Mesh (100m x 100m)
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Floor Overlay
    const gridHelper = new THREE.GridHelper(120, 60, 0x1e293b, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Asphalt Road (10m wide)
    const roadGeo = new THREE.PlaneGeometry(120, 10);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.02, 0);
    road.receiveShadow = true;
    scene.add(road);

    // 4. 3D BUILDING SHELLS (Standard Metrics: 1 unit = 1 meter)

    // --- BUILDING 1: BASE ONE (18m x 14m x 4m) ---
    const baseOneGroup = new THREE.Group();
    baseOneGroup.position.set(-12, 0, -12);

    // Base One Floor & Outer Walls
    const b1WallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const b1BuildingGeo = new THREE.BoxGeometry(18, 4, 14);
    const b1Building = new THREE.Mesh(b1BuildingGeo, b1WallMat);
    b1Building.position.set(0, 2, 0);
    b1Building.castShadow = true;
    b1Building.receiveShadow = true;
    baseOneGroup.add(b1Building);

    // Base One Roof Roof Frame Highlight
    const b1RoofGeo = new THREE.BoxGeometry(18.4, 0.3, 14.4);
    const b1RoofMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 });
    const b1Roof = new THREE.Mesh(b1RoofGeo, b1RoofMat);
    b1Roof.position.set(0, 4.15, 0);
    baseOneGroup.add(b1Roof);

    // Base One 3D Door Mesh (2.0m x 0.9m)
    const doorGroup = new THREE.Group();
    doorGroup.position.set(0, 0, 7);
    const doorGeo = new THREE.BoxGeometry(2.5, 2.8, 0.3);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 1.4, 0);
    doorMesh.castShadow = true;
    doorGroup.add(doorMesh);
    baseOneGroup.add(doorGroup);

    // Base One Generator Turbine Props
    const genGeo = new THREE.CylinderGeometry(1, 1, 2, 16);
    const genMat = new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.8 });
    const genMesh = new THREE.Mesh(genGeo, genMat);
    genMesh.position.set(-6, 1, -4);
    baseOneGroup.add(genMesh);

    // Base One Water Pump Props
    const pumpGeo = new THREE.BoxGeometry(1.5, 2, 1.5);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5 });
    const pumpMesh = new THREE.Mesh(pumpGeo, pumpMat);
    pumpMesh.position.set(6, 1, -4);
    baseOneGroup.add(pumpMesh);

    scene.add(baseOneGroup);

    // --- BUILDING 2: PHARMACY (10m x 8m x 3.5m) ---
    const pharmacyGroup = new THREE.Group();
    pharmacyGroup.position.set(15, 0, -12);

    const pharmGeo = new THREE.BoxGeometry(10, 3.5, 8);
    const pharmMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const pharmMesh = new THREE.Mesh(pharmGeo, pharmMat);
    pharmMesh.position.set(0, 1.75, 0);
    pharmMesh.castShadow = true;
    pharmMesh.receiveShadow = true;
    pharmacyGroup.add(pharmMesh);

    const pharmRoofGeo = new THREE.BoxGeometry(10.4, 0.3, 8.4);
    const pharmRoofMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
    const pharmRoof = new THREE.Mesh(pharmRoofGeo, pharmRoofMat);
    pharmRoof.position.set(0, 3.65, 0);
    pharmacyGroup.add(pharmRoof);

    // Medicine Cache Box
    const cacheGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const cacheMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const cacheMesh = new THREE.Mesh(cacheGeo, cacheMat);
    cacheMesh.position.set(-2, 0.6, -1);
    pharmacyGroup.add(cacheMesh);

    // Pharmacist Evidence Note Object
    const noteGeo = new THREE.BoxGeometry(0.6, 0.1, 0.8);
    const noteMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xb45309 });
    const noteMesh = new THREE.Mesh(noteGeo, noteMat);
    noteMesh.position.set(2, 0.8, -1);
    pharmacyGroup.add(noteMesh);

    scene.add(pharmacyGroup);

    // --- BUILDING 3: ELECTRICAL SUBSTATION (14m x 10m x 3.5m) ---
    const subGroup = new THREE.Group();
    subGroup.position.set(15, 0, 14);

    const subGeo = new THREE.BoxGeometry(14, 3.5, 10);
    const subMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const subMesh = new THREE.Mesh(subGeo, subMat);
    subMesh.position.set(0, 1.75, 0);
    subMesh.castShadow = true;
    subMesh.receiveShadow = true;
    subGroup.add(subMesh);

    const subRoofGeo = new THREE.BoxGeometry(14.4, 0.3, 10.4);
    const subRoofMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const subRoof = new THREE.Mesh(subRoofGeo, subRoofMat);
    subRoof.position.set(0, 3.65, 0);
    subGroup.add(subRoof);

    // Power Link Box
    const linkGeo = new THREE.BoxGeometry(1.5, 2.2, 1.5);
    const linkMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x064e3b });
    const linkMesh = new THREE.Mesh(linkGeo, linkMat);
    linkMesh.position.set(0, 1.1, -4);
    subGroup.add(linkMesh);

    scene.add(subGroup);

    // 5. 3D CHARACTER (THE COORDINATOR - Height: 1.7m)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 12);

    const playerCapsuleGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.7, 16);
    const playerCapsuleMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.3 });
    const playerCapsule = new THREE.Mesh(playerCapsuleGeo, playerCapsuleMat);
    playerCapsule.position.y = 0.85;
    playerCapsule.castShadow = true;
    playerGroup.add(playerCapsule);

    // Player Visor Pointer
    const visorGeo = new THREE.BoxGeometry(0.5, 0.2, 0.4);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1 });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 1.4, 0.3);
    playerGroup.add(visorMesh);

    scene.add(playerGroup);

    // 6. Keyboard Listeners
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

    // 7. Interaction Handler Trigger
    const handleInteractTrigger = () => {
      const pX = playerGroup.position.x;
      const pZ = playerGroup.position.z;

      // Door Check
      if (Math.hypot(pX - (-12), pZ - (-5)) < 3.5) {
        setWorldState((prev) => {
          const nextState = !prev.baseOneDoorOpen;
          doorMesh.material.color.setHex(nextState ? 0x10b981 : 0xef4444);
          doorGroup.rotation.y = nextState ? Math.PI / 2 : 0;
          logAction(`Base One Door ${nextState ? "opened" : "closed"}.`);
          return { ...prev, baseOneDoorOpen: nextState };
        });
      }
      // Generator Check
      else if (Math.hypot(pX - (-18), pZ - (-16)) < 3.5) {
        setWorldState((prev) => {
          if (!prev.baseOneGeneratorRepaired) {
            genMesh.material.color.setHex(0x10b981);
            genLight.intensity = 2;
            logAction("Base One Generator repaired & running! Power grid online.");
            return { ...prev, baseOneGeneratorRepaired: true, baseOneGeneratorRunning: true };
          } else {
            const nextRun = !prev.baseOneGeneratorRunning;
            genLight.intensity = nextRun ? 2 : 0;
            logAction(`Base One Generator toggled: ${nextRun ? "RUNNING" : "OFF"}.`);
            return { ...prev, baseOneGeneratorRunning: nextRun };
          }
        });
      }
      // Water Pump Check
      else if (Math.hypot(pX - (-6), pZ - (-16)) < 3.5) {
        setWorldState((prev) => ({ ...prev, waterCount: prev.waterCount + 2 }));
        setInventory((prev) => {
          const exist = prev.find((i) => i.id === "item_purified_water");
          if (exist) return prev.map((i) => (i.id === "item_purified_water" ? { ...i, count: i.count + 2 } : i));
          return [...prev, { id: "item_purified_water", name: "Purified Water", count: 2 }];
        });
        logAction("Collected +2 Purified Water Rations from Water Pump.");
      }
      // Substation Power Link Check
      else if (Math.hypot(pX - 15, pZ - 10) < 3.5) {
        setWorldState((prev) => {
          if (!prev.substationPowerOnline) {
            linkMesh.material.color.setHex(0x38bdf8);
            subLight.color.setHex(0x38bdf8);
            logAction("Substation Power Link RESTORED! Power grid connected to Pharmacy.");
            return { ...prev, substationPowerOnline: true };
          }
          return prev;
        });
      }
      // Pharmacy Cache Check
      else if (Math.hypot(pX - 13, pZ - (-13)) < 3.5) {
        setWorldState((prev) => {
          if (!prev.substationPowerOnline) {
            logAction("Pharmacy Storage Cache is LOCKED! Restore Substation Link first.");
            return prev;
          }
          if (!prev.pharmacySearched) {
            cacheMesh.material.color.setHex(0x64748b);
            setInventory((inv) => {
              const exist = inv.find((i) => i.id === "item_medkit");
              if (exist) return inv.map((i) => (i.id === "item_medkit" ? { ...i, count: i.count + 2 } : i));
              return [...inv, { id: "item_medkit", name: "Medical Kit", count: 2 }];
            });
            logAction("Searched Pharmacy Cache: Found 2x Medical Kits!");
            return { ...prev, pharmacySearched: true };
          }
          return prev;
        });
      }
      // Evidence Note Check
      else if (Math.hypot(pX - 17, pZ - (-13)) < 3.5) {
        setWorldState((prev) => {
          if (!prev.evidenceCollected) {
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
            return { ...prev, evidenceCollected: true };
          }
          return prev;
        });
      }
    };

    // 8. 60 FPS Render & Physics Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Movement Calculations
      let moveX = 0;
      let moveZ = 0;

      if (keysPressed.current["w"] || keysPressed.current["arrowup"]) moveZ -= 1;
      if (keysPressed.current["s"] || keysPressed.current["arrowdown"]) moveZ += 1;
      if (keysPressed.current["a"] || keysPressed.current["arrowleft"]) moveX -= 1;
      if (keysPressed.current["d"] || keysPressed.current["arrowright"]) moveX += 1;

      const running = !!keysPressed.current["shift"];
      setIsRunning(running);

      const moveSpeed = isCrouching ? 0.08 : running ? 0.22 : 0.14;

      if (moveX !== 0 || moveZ !== 0) {
        const angle = Math.atan2(moveX, moveZ);
        playerGroup.rotation.y = angle;

        playerGroup.position.x += Math.sin(angle) * moveSpeed;
        playerGroup.position.z += Math.cos(angle) * moveSpeed;

        // Keep bounds
        playerGroup.position.x = Math.max(-50, Math.min(50, playerGroup.position.x));
        playerGroup.position.z = Math.max(-50, Math.min(50, playerGroup.position.z));

        setPlayerCoords({
          x: Math.round(playerGroup.position.x),
          z: Math.round(playerGroup.position.z),
        });
      }

      // Smooth Third-Person Camera Follow (45-degree angled view)
      camera.position.set(playerGroup.position.x, playerGroup.position.y + 14, playerGroup.position.z + 16);
      camera.lookAt(playerGroup.position.x, playerGroup.position.y + 1, playerGroup.position.z);

      // Proximity Detection for Interaction Prompts
      const pX = playerGroup.position.x;
      const pZ = playerGroup.position.z;

      let prompt: string | null = null;
      let id: string | null = null;

      if (Math.hypot(pX - (-12), pZ - (-5)) < 3.5) {
        prompt = `[E] ${worldState.baseOneDoorOpen ? "Close" : "Open"} Base One Door`;
        id = "base_one_door";
      } else if (Math.hypot(pX - (-18), pZ - (-16)) < 3.5) {
        prompt = worldState.baseOneGeneratorRepaired
          ? `[E] ${worldState.baseOneGeneratorRunning ? "Shut Down" : "Start"} Generator`
          : "[E] Repair Base One Generator (Requires 3x Scrap Metal)";
        id = "base_one_generator";
      } else if (Math.hypot(pX - (-6), pZ - (-16)) < 3.5) {
        prompt = "[E] Collect Purified Water Rations";
        id = "base_one_water";
      } else if (Math.hypot(pX - 15, pZ - 10) < 3.5) {
        prompt = worldState.substationPowerOnline
          ? "[E] Substation Grid Power ONLINE"
          : "[E] Restore Substation Power Link to Pharmacy";
        id = "substation_power_link";
      } else if (Math.hypot(pX - 13, pZ - (-13)) < 3.5) {
        prompt = !worldState.substationPowerOnline
          ? "[E] Storage Cache LOCKED (Requires Power)"
          : worldState.pharmacySearched
          ? "[E] Medicine Cache EMPTY"
          : "[E] Search Medicine Cache";
        id = "pharmacy_locker";
      } else if (Math.hypot(pX - 17, pZ - (-13)) < 3.5 && !worldState.evidenceCollected) {
        prompt = "[E] Inspect Pharmacist's Emergency Note";
        id = "pharmacy_evidence";
      }

      setCurrentPrompt(prompt);
      setActiveInteractableId(id);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Resize Handler
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
  }, [worldState, isCrouching]);

  const logAction = (msg: string) => {
    setActionLog((prev) => [msg, ...prev.slice(0, 4)]);
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-950 border border-emerald-900/40 rounded-xl overflow-hidden shadow-2xl">
      {/* 3D WebGL Three.js Render Viewport */}
      <div ref={containerRef} className="w-full h-full block bg-slate-950 cursor-crosshair" />

      {/* Floating 3D Interaction Prompt */}
      {currentPrompt && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-emerald-500/50 text-emerald-400 font-mono text-xs px-4 py-2 rounded-lg shadow-xl animate-bounce flex items-center gap-2 z-20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          {currentPrompt}
        </div>
      )}

      {/* Controls Bar & Position HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 font-mono text-xs flex items-center gap-3">
          <span>3D Coordinates: ({playerCoords.x}m, {playerCoords.z}m)</span>
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
