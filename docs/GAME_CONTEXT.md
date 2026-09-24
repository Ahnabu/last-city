# GAME CONTEXT — LAST CITY

PROJECT: LAST CITY
GAME GENRE: 3D Survival Strategy / Narrative RPG / City Builder
CORE FANTASY: Build a city. Shape its people. Decide what humanity becomes.

CURRENT DEVELOPMENT PHASE: Phase 4 — Survivors & Multi-Tiered NPC Simulation
CURRENT VERSION: 0.4.0

CURRENT WORKING FEATURES:
- Master Build Prompt v2.0 & Story Canon ingested into `/docs`.
- Next.js Web Shell initialized with Tailwind CSS, HUD dashboard, & Unity WebGL viewport component (`web/`).
- Firebase client initialized with project credentials (`NEXT_PUBLIC_FIREBASE_*`).
- Unity 6 C# simulation architecture & script base initialized under `game/Unity/Assets/Scripts/`:
  - `GameBootstrap.cs` (Singleton orchestrator)
  - `GameStateManager.cs` (State machine: Boot, MainMenu, Exploration, Dialogue, Building, Paused)
  - `SaveManager.cs` (Versioned JSON serialization `saveVersion: 1`)
  - `CoordinatorController.cs` (Third-person walk/run/crouch movement & raycast interaction)
  - `ThirdPersonCamera.cs` (Exploration target follow camera)
  - `IInteractable.cs` & `DoorInteractable.cs` (Core interaction contracts)
  - `ContainerInteractable.cs` (Searchable containers, keys, loot tables)
  - `EvidenceInteractable.cs` (Environmental evidence pickup → Journal log)
  - `InventoryManager.cs` (Item storage slots & Evidence Journal storage)
  - `PowerLink.cs` (Substation power restoration linked to target building IDs)
  - `BaseOneManager.cs` (Base One infrastructure manager: power, water, bunk allocations)
  - `GeneratorInteractable.cs` (Damaged generator repair → Base One power activation)
  - `WaterPumpInteractable.cs` (Purified water ration collection)
  - `WorkbenchInteractable.cs` (Item crafting & repair station)
  - `RadioInteractable.cs` (Emergency radio & Node 17 Continuity signal broadcast trigger)
  - `NPCNeeds.cs` (Survivor needs tracking: Health, Hunger, Thirst, Fatigue, Morale, Hope, Safety)
  - `NPCSchedule.cs` (Daily schedule loop: Wake, Eat, Work, Rest, Sleep)
  - `NPCController.cs` (Distance simulation tiers: Near, Medium, Far + dialogue interaction)
  - `NPCManager.cs` (Master population registry & Far-tier statistical math update loop)

CURRENT BROKEN FEATURES:
- None (Scaffolding stage).

NEXT OBJECTIVE:
- Complete Phase 0 by creating Unity 6 project baseline under `game/Unity` and Next.js shell baseline under `web/`.

ARCHITECTURE:
Event-driven manager hierarchy under `GameBootstrap`. All story, character, and item data is data-driven from ScriptableObjects. Web shell embeds Unity WebGL build via iframe or WebGL canvas. See `docs/GAME_ARCHITECTURE.md`.

TECH STACK:
- Unity 6000.x LTS (URP)
- C#
- Next.js + TypeScript
- Firebase Auth & Cloud Storage (Credentials configured in .env)

IMPORTANT FILES:
- `docs/LAST_CITY_Master_Build_Prompt_v2.md`
- `docs/STORY_BIBLE.md`
- `docs/DECISION_LOG.md`
- `.env`

IMPORTANT SCENES:
- To be initialized under `game/Unity/Assets/Scenes/Bootstrap/Boot.unity` and `Scenes/City/CityBlock01.unity`.

IMPORTANT SYSTEMS:
- GameBootstrap, GameStateManager, WorldManager, SaveManager, InteractionManager, NPCManager, StoryManager.

CURRENT WORLD STATE:
- Day 0. Initial collapse era. Settlement Base One outline being planned.

CURRENT STORY STATE:
- Prologue / Day Zero setup. Coordinator awake at Base One exterior.

KNOWN LIMITATIONS:
- Unity project and WebGL build target not yet generated on disk.

OPEN QUESTIONS:
- None for Phase 0 environment setup. Firebase credentials fully configured in `.env`.

RECENT DECISIONS:
- Decided on Unity 6 WebGL target for web-first release, targeting mobile browsers & native build later without rewrite. See `DECISION_LOG.md`.

DO NOT CHANGE WITHOUT REVIEW:
- `STORY_BIBLE.md` narrative canon definitions, `IInteractable` C# interface structure.
