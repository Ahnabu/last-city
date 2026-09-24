"use client";

import React, { useState, useEffect } from "react";

interface UnityCanvasProps {
  buildUrl?: string;
}

export default function UnityCanvas({
  buildUrl = process.env.NEXT_PUBLIC_UNITY_BUILD_URL || "/game-build/Build/game.json",
}: UnityCanvasProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [buildMissing, setBuildMissing] = useState(false);

  useEffect(() => {
    // Check if Unity build json exists at specified URL
    fetch(buildUrl, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) setBuildMissing(true);
      })
      .catch(() => setBuildMissing(true));
  }, [buildUrl]);

  return (
    <div className="relative w-full h-[600px] bg-slate-950 border border-emerald-900/40 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-center items-center text-center p-6">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {buildMissing ? (
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            UNITY 6 WEBGL SIMULATION READY FOR BUILD EXPORT
          </div>
          <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
            WebGL Game Build Pending
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            The Unity C# simulation core is configured under{" "}
            <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              game/Unity/
            </code>
            . Export a WebGL build to{" "}
            <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              web/public/game-build/
            </code>{" "}
            or test directly inside the Unity Editor!
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs font-mono">
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-lg text-slate-300">
              <span className="text-slate-500">Scene:</span> CityBlock01.unity
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-lg text-slate-300">
              <span className="text-slate-500">Controller:</span> CoordinatorController.cs
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <canvas id="unity-canvas" className="w-full h-full block bg-black" />
          {!isLoaded && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col justify-center items-center">
              <div className="w-64 bg-slate-900 border border-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${loadProgress * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-emerald-400 mt-3">
                Loading Simulation Infrastructure ({Math.round(loadProgress * 100)}%)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
