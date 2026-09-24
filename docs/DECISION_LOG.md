# DECISION LOG — LAST CITY

## Entry 001: Stack Selection (Unity vs Three.js / React Three Fiber / Godot)

- **Decision:** Select Unity 6 (6000.x LTS, URP) with C# as the single game engine for WebGL and future Mobile (Android/iOS) build targets.
- **Reason:** Satisfies the core constraint ("Ship on web now, ship on mobile later without rewrite"). Provides built-in NavMesh AI, animation retargeting, LOD, occlusion culling, and mobile-proven renderer out of the box. Unity 6 supports WebGL running inside mobile browsers.
- **Alternatives Considered:**
  - *Three.js / R3F:* Requires building custom NPC pathfinding, animation blending, and collision engines in JS.
  - *Godot:* Web export performance & mobile WebGL stability were less proven for complex NPC simulation scenes compared to Unity 6 LTS.
- **Date:** 2026-09-24

---

## Entry 002: Narrative Canon Source

- **Decision:** Ingest `LAST_CITY_Complete_Story_and_3D_Game_Design_Document.md` directly into `docs/STORY_BIBLE.md` as the immutable narrative baseline.
- **Reason:** Ensures narrative consistency across all gameplay code, character ScriptableObjects, dialogue definitions, and mission triggers.
- **Date:** 2026-09-24

---

## Entry 003: Save System Versioning

- **Decision:** Implement JSON-serialized save state with explicit `saveVersion` tracking from day one.
- **Reason:** Prevents broken saves during phased feature additions. Migration handlers will convert `v(N)` to `v(N+1)` automatically.
- **Date:** 2026-09-24
