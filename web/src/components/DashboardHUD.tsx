"use client";

import React from "react";

export default function DashboardHUD() {
  return (
    <div className="w-full bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
      {/* Settlement Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg font-mono">
          B1
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            BASE ONE SETTLEMENT
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Stage 1: Shelter
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">District: City Block 01 • Day 0 Cycle</p>
        </div>
      </div>

      {/* Strategic & Physical Resources HUD */}
      <div className="flex flex-wrap items-center gap-5 font-mono text-xs">
        <div className="flex flex-col">
          <span className="text-slate-500 uppercase tracking-wider text-[10px]">Population</span>
          <span className="text-slate-200 font-bold">1 / 6 Bunks</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 uppercase tracking-wider text-[10px]">Food Rations</span>
          <span className="text-emerald-400 font-bold">25 units</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 uppercase tracking-wider text-[10px]">Water Supply</span>
          <span className="text-sky-400 font-bold">30 units</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 uppercase tracking-wider text-[10px]">Medical Cache</span>
          <span className="text-rose-400 font-bold">10 units</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 uppercase tracking-wider text-[10px]">Scrap Metal</span>
          <span className="text-amber-400 font-bold">15 units</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 uppercase tracking-wider text-[10px]">Trust Rating</span>
          <span className="text-indigo-400 font-bold">50%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 uppercase tracking-wider text-[10px]">ORPHEUS Signal</span>
          <span className="text-emerald-400 font-bold">Node 17 Passive</span>
        </div>
      </div>
    </div>
  );
}
