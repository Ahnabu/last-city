"use client";

import React, { useState, useEffect, useRef } from "react";

interface UnityCanvasProps {
  buildUrl?: string;
  onStateUpdate?: (state: any) => void;
}

export default function UnityCanvas({
  buildUrl = process.env.NEXT_PUBLIC_UNITY_BUILD_URL || "/game-build/Build/game.json",
  onStateUpdate,
}: UnityCanvasProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [buildMissing, setBuildMissing] = useState(true);

  // Active Simulation State
  const [playerPos, setPlayerPos] = useState({ x: 200, y: 300 });
  const [playerAngle, setPlayerAngle] = useState(0);
  const [isCrouching, setIsCrouching] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [activeInteractableId, setActiveInteractableId] = useState<string | null>(null);

  // Game World State
  const [worldState, setWorldState] = useState({
    baseOneDoorOpen: false,
    baseOneGeneratorRepaired: false,
    baseOneGeneratorRunning: false,
    substationPowerOnline: false,
    pharmacyLockerUnlocked: false,
    pharmacySearched: false,
    evidenceCollected: false,
    waterCollectedCount: 0,
    scrapCollectedCount: 3,
  });

  const [inventory, setInventory] = useState<Array<{ id: string; name: string; count: number }>>([
    { id: "item_scrap_metal", name: "Scrap Metal", count: 3 },
  ]);

  const [journal, setJournal] = useState<Array<{ id: string; title: string; content: string; location: string }>>([]);
  const [showJournal, setShowJournal] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([
    "Coordinator initialized at City Block 01.",
    "System: Approach Base One, Pharmacy, or Substation to interact.",
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Check WebGL Build Availability
  useEffect(() => {
    fetch(buildUrl, { method: "HEAD" })
      .then((res) => {
        if (res.ok) setBuildMissing(false);
      })
      .catch(() => setBuildMissing(true));
  }, [buildUrl]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;

      if (e.key.toLowerCase() === "c") {
        setIsCrouching((prev) => !prev);
      }
      if (e.key === "Tab") {
        e.preventDefault();
        setShowJournal((prev) => !prev);
      }
      if (e.key.toLowerCase() === "e") {
        handleInteract();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeInteractableId, worldState, inventory]);

  // Interaction Logic
  const handleInteract = () => {
    if (!activeInteractableId) return;

    if (activeInteractableId === "base_one_door") {
      setWorldState((prev) => ({ ...prev, baseOneDoorOpen: !prev.baseOneDoorOpen }));
      logAction(`Base One Door ${!worldState.baseOneDoorOpen ? "opened" : "closed"}.`);
    } else if (activeInteractableId === "base_one_generator") {
      if (!worldState.baseOneGeneratorRepaired) {
        if (inventory.find((i) => i.id === "item_scrap_metal" && i.count >= 3)) {
          setWorldState((prev) => ({
            ...prev,
            baseOneGeneratorRepaired: true,
            baseOneGeneratorRunning: true,
          }));
          setInventory((prev) =>
            prev.map((i) => (i.id === "item_scrap_metal" ? { ...i, count: i.count - 3 } : i))
          );
          logAction("Generator repaired with 3x Scrap Metal! Base One power is ONLINE.");
        } else {
          logAction("Insufficient materials! Requires 3x Scrap Metal.");
        }
      } else {
        setWorldState((prev) => ({
          ...prev,
          baseOneGeneratorRunning: !prev.baseOneGeneratorRunning,
        }));
        logAction(`Base One Generator toggled: ${!worldState.baseOneGeneratorRunning ? "RUNNING" : "OFF"}.`);
      }
    } else if (activeInteractableId === "base_one_water") {
      setWorldState((prev) => ({ ...prev, waterCollectedCount: prev.waterCollectedCount + 2 }));
      setInventory((prev) => {
        const existing = prev.find((i) => i.id === "item_purified_water");
        if (existing) {
          return prev.map((i) => (i.id === "item_purified_water" ? { ...i, count: i.count + 2 } : i));
        }
        return [...prev, { id: "item_purified_water", name: "Purified Water", count: 2 }];
      });
      logAction("Collected +2 Purified Water Rations from Water Pump.");
    } else if (activeInteractableId === "substation_power_link") {
      if (!worldState.substationPowerOnline) {
        setWorldState((prev) => ({ ...prev, substationPowerOnline: true, pharmacyLockerUnlocked: true }));
        logAction("Electrical Substation restored! Grid power linked to Pharmacy.");
      }
    } else if (activeInteractableId === "pharmacy_locker") {
      if (!worldState.substationPowerOnline) {
        logAction("Pharmacy Locker requires power! Restore Substation link first.");
      } else if (!worldState.pharmacySearched) {
        setWorldState((prev) => ({ ...prev, pharmacySearched: true }));
        setInventory((prev) => {
          const existing = prev.find((i) => i.id === "item_medkit");
          if (existing) {
            return prev.map((i) => (i.id === "item_medkit" ? { ...i, count: i.count + 2 } : i));
          }
          return [...prev, { id: "item_medkit", name: "Medical Kit", count: 2 }];
        });
        logAction("Searched Pharmacy Medicine Cache: Found 2x Medical Kits!");
      }
    } else if (activeInteractableId === "pharmacy_evidence") {
      if (!worldState.evidenceCollected) {
        setWorldState((prev) => ({ ...prev, evidenceCollected: true }));
        setJournal((prev) => [
          ...prev,
          {
            id: "evidence_pharmacist_note",
            title: "Pharmacist's Emergency Note",
            content: "The emergency network told us to stay inside... Node 17 took control of the grid...",
            location: "Pharmacy Office Desk",
          },
        ]);
        logAction("Discovered Evidence: 'Pharmacist's Emergency Note' logged to Journal (Tab).");
      }
    }
  };

  const logAction = (msg: string) => {
    setActionLog((prev) => [msg, ...prev.slice(0, 4)]);
  };

  // Main 60 FPS Game Render & Input Loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      // Input Movement Processing
      let dx = 0;
      let dy = 0;

      if (keysPressed.current["w"] || keysPressed.current["arrowup"]) dy -= 1;
      if (keysPressed.current["s"] || keysPressed.current["arrowdown"]) dy += 1;
      if (keysPressed.current["a"] || keysPressed.current["arrowleft"]) dx -= 1;
      if (keysPressed.current["d"] || keysPressed.current["arrowright"]) dx += 1;

      const running = !!keysPressed.current["shift"];
      setIsRunning(running);

      const speed = isCrouching ? 1.5 : running ? 4.5 : 2.8;

      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = (dx / len) * speed;
        const ny = (dy / len) * speed;

        setPlayerPos((prev) => {
          const newX = Math.max(20, Math.min(760, prev.x + nx));
          const newY = Math.max(20, Math.min(540, prev.y + ny));
          return { x: newX, y: newY };
        });

        setPlayerAngle(Math.atan2(dy, dx));
      }

      // Render 2.5D Canvas Viewport
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Clear Canvas
          ctx.fillStyle = "#020617"; // slate-950
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid Lines
          ctx.strokeStyle = "#1e293b";
          ctx.lineWidth = 1;
          for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          // Roads & Sidewalks
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(0, 260, canvas.width, 80); // Road
          ctx.strokeStyle = "#334155";
          ctx.setLineDash([15, 15]);
          ctx.beginPath();
          ctx.moveTo(0, 300);
          ctx.lineTo(canvas.width, 300);
          ctx.stroke();
          ctx.setLineDash([]);

          // --- BUILDING 1: BASE ONE (18m x 14m) ---
          ctx.fillStyle = "#0f172a";
          ctx.strokeStyle = worldState.baseOneGeneratorRunning ? "#10b981" : "#475569";
          ctx.lineWidth = 2;
          ctx.fillRect(100, 60, 220, 160);
          ctx.strokeRect(100, 60, 220, 160);

          ctx.fillStyle = "#e2e8f0";
          ctx.font = "bold 12px monospace";
          ctx.fillText("BASE ONE (Player Base)", 110, 85);

          // Base One Door
          ctx.fillStyle = worldState.baseOneDoorOpen ? "#10b981" : "#ef4444";
          ctx.fillRect(190, 215, 40, 10);
          ctx.fillStyle = "#94a3b8";
          ctx.font = "10px monospace";
          ctx.fillText(worldState.baseOneDoorOpen ? "DOOR: OPEN" : "DOOR: CLOSED", 175, 240);

          // Base One Generator
          ctx.fillStyle = worldState.baseOneGeneratorRunning ? "#059669" : "#dc2626";
          ctx.fillRect(115, 110, 35, 35);
          ctx.fillStyle = "#cbd5e1";
          ctx.fillText("GEN", 122, 132);

          // Water Pump
          ctx.fillStyle = "#0284c7";
          ctx.fillRect(270, 110, 35, 35);
          ctx.fillStyle = "#e0f2fe";
          ctx.fillText("PUMP", 273, 132);

          // --- BUILDING 2: PHARMACY (10m x 8m) ---
          ctx.fillStyle = "#0f172a";
          ctx.strokeStyle = worldState.substationPowerOnline ? "#38bdf8" : "#475569";
          ctx.fillRect(480, 60, 180, 140);
          ctx.strokeRect(480, 60, 180, 140);

          ctx.fillStyle = "#e2e8f0";
          ctx.fillText("PHARMACY", 490, 85);

          // Pharmacy Storage Cabinet
          ctx.fillStyle = worldState.pharmacySearched
            ? "#64748b"
            : worldState.substationPowerOnline
            ? "#0284c7"
            : "#ef4444";
          ctx.fillRect(500, 110, 40, 30);
          ctx.fillStyle = "#ffffff";
          ctx.fillText(worldState.pharmacySearched ? "EMPTY" : "CACHE", 503, 128);

          // Evidence Note
          if (!worldState.evidenceCollected) {
            ctx.fillStyle = "#f59e0b";
            ctx.fillRect(600, 120, 20, 20);
            ctx.fillStyle = "#000000";
            ctx.fillText("NOTE", 601, 134);
          }

          // --- BUILDING 3: ELECTRICAL SUBSTATION (14m x 10m) ---
          ctx.fillStyle = "#0f172a";
          ctx.strokeStyle = worldState.substationPowerOnline ? "#f59e0b" : "#475569";
          ctx.fillRect(480, 370, 180, 140);
          ctx.strokeRect(480, 370, 180, 140);

          ctx.fillStyle = "#e2e8f0";
          ctx.fillText("SUBSTATION NODE", 490, 395);

          // Substation Control Box
          ctx.fillStyle = worldState.substationPowerOnline ? "#10b981" : "#f59e0b";
          ctx.fillRect(540, 420, 40, 40);
          ctx.fillStyle = "#000000";
          ctx.fillText("LINK", 548, 444);

          // --- PLAYER (THE COORDINATOR) ---
          ctx.save();
          ctx.translate(playerPos.x, playerPos.y);

          // Player Body Capsule
          ctx.fillStyle = isCrouching ? "#065f46" : isRunning ? "#10b981" : "#34d399";
          ctx.beginPath();
          ctx.arc(0, 0, isCrouching ? 9 : 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Direction Pointer
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(playerAngle) * 18, Math.sin(playerAngle) * 18);
          ctx.strokeStyle = "#6ee7b7";
          ctx.stroke();

          ctx.restore();

          // Player Label
          ctx.fillStyle = "#6ee7b7";
          ctx.font = "bold 11px monospace";
          ctx.fillText("COORDINATOR", playerPos.x - 36, playerPos.y - 18);
        }
      }

      // Proximity Detection for Interaction Prompts
      let detectedPrompt: string | null = null;
      let detectedId: string | null = null;

      // Base One Door Check (x: 210, y: 220)
      if (Math.hypot(playerPos.x - 210, playerPos.y - 220) < 40) {
        detectedPrompt = `[E] ${worldState.baseOneDoorOpen ? "Close" : "Open"} Base One Door`;
        detectedId = "base_one_door";
      }
      // Base One Generator Check (x: 132, y: 127)
      else if (Math.hypot(playerPos.x - 132, playerPos.y - 127) < 40) {
        if (!worldState.baseOneGeneratorRepaired) {
          detectedPrompt = "[E] Repair Base One Generator (Requires 3x Scrap Metal)";
        } else {
          detectedPrompt = `[E] ${worldState.baseOneGeneratorRunning ? "Shut Down" : "Start"} Generator`;
        }
        detectedId = "base_one_generator";
      }
      // Base One Water Pump Check (x: 287, y: 127)
      else if (Math.hypot(playerPos.x - 287, playerPos.y - 127) < 40) {
        detectedPrompt = "[E] Collect Purified Water Rations";
        detectedId = "base_one_water";
      }
      // Substation Check (x: 560, y: 440)
      else if (Math.hypot(playerPos.x - 560, playerPos.y - 440) < 45) {
        if (!worldState.substationPowerOnline) {
          detectedPrompt = "[E] Restore Power Grid Link to Pharmacy";
        } else {
          detectedPrompt = "[E] Substation Grid Power ONLINE";
        }
        detectedId = "substation_power_link";
      }
      // Pharmacy Cache Check (x: 520, y: 125)
      else if (Math.hypot(playerPos.x - 520, playerPos.y - 125) < 40) {
        if (!worldState.substationPowerOnline) {
          detectedPrompt = "[E] Storage Cache LOCKED (Requires Substation Power)";
        } else if (!worldState.pharmacySearched) {
          detectedPrompt = "[E] Search Medicine Cache";
        } else {
          detectedPrompt = "[E] Medicine Cache EMPTY";
        }
        detectedId = "pharmacy_locker";
      }
      // Pharmacy Evidence Check (x: 610, y: 130)
      else if (Math.hypot(playerPos.x - 610, playerPos.y - 130) < 40) {
        if (!worldState.evidenceCollected) {
          detectedPrompt = "[E] Inspect Pharmacist's Emergency Note";
          detectedId = "pharmacy_evidence";
        }
      }

      setCurrentPrompt(detectedPrompt);
      setActiveInteractableId(detectedId);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [playerPos, isCrouching, worldState]);

  return (
    <div className="relative w-full h-[600px] bg-slate-950 border border-emerald-900/40 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-center items-center">
      {/* 2.5D Interactive 3D Canvas */}
      <canvas
        ref={canvasRef}
        width={780}
        height={560}
        className="w-full h-full block bg-slate-950 cursor-crosshair"
      />

      {/* Floating Interaction Prompt */}
      {currentPrompt && (
        <div className="absolute top-6 bg-slate-900/90 border border-emerald-500/50 text-emerald-400 font-mono text-xs px-4 py-2 rounded-lg shadow-xl animate-bounce flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          {currentPrompt}
        </div>
      )}

      {/* HUD Overlays & Controls Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 font-mono text-xs flex items-center gap-3">
          <span>Pos: ({Math.round(playerPos.x)}, {Math.round(playerPos.y)})</span>
          <span className={isRunning ? "text-emerald-400 font-bold" : "text-slate-500"}>RUN</span>
          <span className={isCrouching ? "text-amber-400 font-bold" : "text-slate-500"}>CROUCH</span>
        </div>

        <button
          onClick={() => setShowJournal(true)}
          className="pointer-events-auto bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>Inventory & Journal (Tab)</span>
          {journal.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
              {journal.length}
            </span>
          )}
        </button>
      </div>

      {/* Action Log Box */}
      <div className="absolute top-4 left-4 max-w-sm pointer-events-none space-y-1">
        {actionLog.map((log, index) => (
          <div
            key={index}
            className="bg-slate-950/80 border border-slate-800/80 text-slate-300 font-mono text-[11px] px-2.5 py-1 rounded backdrop-blur"
          >
            {log}
          </div>
        ))}
      </div>

      {/* Inventory & Journal Modal Overlay */}
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

            {/* Evidence Journal Entries */}
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
