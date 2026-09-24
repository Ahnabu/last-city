import DashboardHUD from "@/components/DashboardHUD";
import UnityCanvas from "@/components/UnityCanvas";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8 space-y-6">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-slate-100 font-mono flex items-center gap-2">
            LAST CITY <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">v0.1.0</span>
          </h1>
          <p className="text-xs text-slate-400">
            3D Survival Strategy & Narrative RPG • Web Shell Edition
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
          >
            Documentation
          </a>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Firebase Online
          </span>
        </div>
      </header>

      {/* Settlement Status HUD */}
      <DashboardHUD />

      {/* 3D Unity Simulation Canvas */}
      <UnityCanvas />

      {/* Control Quick Reference Footer */}
      <footer className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
            Movement Controls
          </h4>
          <ul className="text-xs text-slate-400 space-y-1 font-mono">
            <li><span className="text-emerald-400">W / A / S / D</span> : Walk Direction</li>
            <li><span className="text-emerald-400">Shift</span> : Hold to Run</li>
            <li><span className="text-emerald-400">C</span> : Toggle Crouch</li>
          </ul>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
            World Interaction
          </h4>
          <ul className="text-xs text-slate-400 space-y-1 font-mono">
            <li><span className="text-emerald-400">E</span> : Interact (Doors, Terminals, Items)</li>
            <li><span className="text-emerald-400">Tab</span> : Inventory / Journal</li>
            <li><span className="text-emerald-400">Esc</span> : Pause / System Menu</li>
          </ul>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
            Key Locations (City Block 01)
          </h4>
          <ul className="text-xs text-slate-400 space-y-1 font-mono">
            <li><span className="text-amber-400">Base One</span> : Player Home Base</li>
            <li><span className="text-amber-400">Pharmacy</span> : Medical Supplies</li>
            <li><span className="text-amber-400">Electrical Substation</span> : Power Link</li>
          </ul>
        </div>
      </footer>
    </main>
  );
}
