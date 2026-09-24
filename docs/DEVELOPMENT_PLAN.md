# DEVELOPMENT PLAN & ROADMAP — LAST CITY

## Phased Roadmap Overview

```text
Phase 0: Project Foundation (Scaffolding, Web Shell, Unity Setup, Docs)
Phase 1: 3D Foundation (City Block, Character Controller, WebGL Walkable)
Phase 2: Interaction (IInteractable, Doors, Inventory, Evidence)
Phase 3: Base One (Interior, Power Generator, Water Pump, Workbench)
Phase 4: Survivors (NPC AI Tiers, Schedules, Professions, Needs)
Phase 5: Resources (Economy, Deterministic Resource Pipeline)
Phase 6: Construction (Blueprint Placement, Resource Staging, 3D Building)
Phase 7: Time & Weather (Day/Night, Dynamic Weather, Schedule Reactivity)
Phase 8: Story Arc 1 (Missions 1-7, Dialogue, Consequences)
Phase 9: Memory & Relationships (NPC Memory Persistence)
Phase 10: Factions (Haven, Directorate, Free Cities, Null)
Phase 11: ORPHEUS (Node 17 Narrative Systems)
Phase 12: City Evolution (7-Stage Settlement Visual Progression)
Phase 13: Advanced Story (Later Story Bible Chapters)
Phase 14: Endings (Shutdown, Restore, Rewrite, Secret Ending)
Phase 15: Polish (Audio, VFX, Lighting, UI Animation)
Phase 16: Optimization (WebGL Profiling, GPU/CPU Budgeting)
Phase 17: Release (Web Shell Integration, Mobile Native Build)
```

---

## Detailed Milestones

### Phase 0: Project Foundation
- **Objective:** Establish clean repository, docs system, Next.js baseline, Unity project scaffolding, and environment config.
- **Done Criteria:** `GAME_CONTEXT.md` updated, Next.js web shell runs locally, Unity project folder structured, `.env.example` defined.

### Phase 1: 3D Foundation
- **Objective:** Create City Block 01, URP environment, third-person Coordinator player controller, baked NavMesh, and test WebGL export.
- **Done Criteria:** Player can move through block and approach building shell in a WebGL build.

### Phase 2: Interaction System
- **Objective:** Create generic `IInteractable` system with interactive doors, containers, inventory pickups, and evidence journal logging.
- **Done Criteria:** Pickup item, inspect evidence, store entry in journal, persist via SaveManager.
