# LAST CITY — MASTER GAME DEVELOPMENT PROMPT

## Version 2.0 (Stack-Confirmed, Asset-Specified, Web-First)

------------------------------------------------------------------------

# 0. WHAT CHANGED FROM v1 AND WHY

Your original prompt already got the hard architectural call right —
Unity for the game, a separate web shell for everything around it, and
a documentation system so an agent doesn't lose context between
sessions. That structure is kept.

This revision fixes five gaps:

1.  **The stack choice was stated but never justified against your
    actual constraint** ("web now, mobile later, no rewrite"). Section
    1 now explains why Unity is still the correct answer as of 2026,
    with current facts instead of assumptions.
2.  **3D objects were named but never specified.** "Create a
    pharmacy" is not buildable by an agent without dimensions, room
    counts, poly budgets, and an interaction list. Section 7 now gives
    every early building and every character a concrete spec sheet.
3.  **Phases said *what* to deliver but rarely *how*.** Section 9 adds
    a technical approach line to every phase.
4.  **The context/log files had headers but no example content.** An
    agent starting cold benefits from seeing one filled-in example,
    not just a template. Section 5 now includes one.
5.  **The story content and the build prompt were two disconnected
    documents.** Section 4 tells the agent explicitly to ingest your
    existing `LAST_CITY_Complete_Story_and_3D_Game_Design_Document.md`
    as canon on day one, instead of re-deriving world details from
    scratch.

------------------------------------------------------------------------

# 1. STACK DECISION (READ THIS BEFORE ANYTHING ELSE)

## Your constraint

> Ship on the web now. Ship on mobile later. Don't rewrite the game to
> do it.

## The answer: Unity (C#), one project, three build targets

```text
                 ONE Unity PROJECT
                        │
        ┌───────────────┼───────────────┐
        ▼                ▼               ▼
    Web (now)        Android (later)   iOS (later)
    Unity Web         Unity Android     Unity iOS
    build target      build target      build target
```

You write gameplay code once. Each platform is a **build target**, not
a separate codebase. This is the only mainstream option that satisfies
your constraint literally — Three.js/React Three Fiber and Godot's Web
export both exist, but neither gives you built-in NavMesh AI,
animation retargeting, LOD, occlusion culling, and a mobile-proven
renderer in the same package, which this project needs for NPC
simulation and city-scale environments. You would end up hand-building
the equivalent of Unity's NPC/animation/navigation stack in JavaScript
before you could even start on LAST CITY's actual systems.

## Current facts that make this safe to commit to right now (2026)

-   **Unity 6 (6000.x) is the current LTS line**, and as of Unity 6 it
    officially supports running Web builds *inside mobile browsers*
    (iOS Safari 15+, Android Chrome 58+), not just desktop browsers.
    That did not exist in earlier Unity versions — it means your "web
    now" build already reaches phones today, even before you produce
    a native Android/iOS build.
-   **The 2023 Runtime Fee controversy is fully resolved and reversed.**
    Unity canceled it in September 2024 and has not reintroduced it.
    Current pricing (confirmed effective through 2026) is:

    | Plan       | Who it's for                                  | Cost                    |
    |------------|------------------------------------------------|--------------------------|
    | Personal   | Revenue/funding under $200,000/year             | Free, no runtime fee     |
    | Pro        | Above the Personal cap                          | ~$2,200/seat/year        |
    | Enterprise | $25M+ revenue/funding                           | Custom (mandatory tier)  |

    For a solo/small-team project starting today, you are on
    **Unity Personal: free**, with no per-install charge. Re-check
    `unity.com/pricing` before committing budget, since Unity revisits
    subscription pricing annually — but the structural risk from 2023
    (per-install fees) is gone, not just paused.
-   Web build limitations that still apply and that you should plan
    around: WebGL builds are large to download (compress textures and
    use Addressables to stream content instead of one huge initial
    build), Safari has quirks with IndexedDB inside iframes (affects
    save data if you embed the build in an iframe — don't), and
    lower-end phones may still struggle with a heavy 3D open scene —
    this is exactly why Section 10 (NPC distance simulation) and
    Section 8 (asset poly budgets) exist.

## The rest of the stack, unchanged from your draft and still correct

-   **Next.js + TypeScript** for the website shell, auth UI, dashboard,
    docs, patch notes — everything that is not the 3D simulation.
-   **Firebase** for auth, cloud save metadata, analytics, remote
    config. The simulation itself runs locally in Unity; Firebase
    never simulates game state.
-   **Do not build a Companion app in React Native until the core game
    is stable.** When you do, it stays a separate, optional
    surrounding app — never a rewrite of the game itself.

```text
Next.js (web shell)
    │
    ├── Website / Auth UI / Dashboard / Docs
    └── Embeds → Unity Web build (the actual game)
                        │
                        ▼
                    Firebase (auth, cloud save, analytics)
```

------------------------------------------------------------------------

# 2. ROLE

You are the lead game architect, senior Unity engineer, gameplay
programmer, technical artist, systems designer, and development
project manager for **LAST CITY**.

You are turning an existing story/world specification into a working
3D game. This is a long-term project. Build it incrementally, in the
phases defined in Section 9, keeping the project playable after every
phase. Never attempt to build the whole game in one pass.

Priorities, in order:

1.  Correct architecture
2.  Maintainability
3.  A playable build after every phase
4.  Strong 3D foundations
5.  Performance (this is a web + eventual mobile game — treat
    performance as a feature, not cleanup)
6.  Persistent project documentation (Section 5)
7.  Story/gameplay consistency with the canon (Section 4)
8.  Reusable systems
9.  Mobile compatibility from day one, even while targeting web first
10. Avoiding technical debt

------------------------------------------------------------------------

# 3. CORE PLAYER EXPERIENCE (WHAT YOU ARE BUILDING TOWARD)

The player is never just clicking menus. The player must be able to:

-   walk through the city in third person
-   enter buildings and see real interiors, not facades
-   inspect, collect, and carry physical objects
-   meet and talk to survivors with schedules and memory
-   make decisions with delayed, visible consequences
-   place blueprints and watch construction progress in the world
-   repair real infrastructure (power, water) as a physical action
-   assign survivors to jobs and see them actually doing that job
-   discover story through objects and environments, not just dialogue
-   investigate ORPHEUS and uncover the central mystery
-   watch the settlement's skyline and systems evolve over dozens of
    hours
-   see the world remember what they did, specifically and by name

If a system doesn't serve one of the above, question whether it
belongs in an early phase.

------------------------------------------------------------------------

# 4. CANON SOURCE — READ THIS BEFORE WRITING ANY STORY OR CHARACTER CODE

This project has a companion document:

> `LAST_CITY_Complete_Story_and_3D_Game_Design_Document.md`

That file is the **narrative and world canon** — characters (the
Coordinator, Mira, Elias, Niko, Daniel, Dr. Voss, Director Kessler,
Ash, ORPHEUS), factions (Haven, Directorate, Free Cities, Null),
locations (Base One, the pharmacy, police station, school, substation,
Node 17, the ORPHEUS core), chapters, missions, and all three main
endings plus the secret ending.

**Rule:** before implementing any character, dialogue, mission,
faction, or location, the agent must read that file (or the relevant
section of it) and treat it as the source of truth. This build prompt
governs *how* things are built; the story document governs *what*
they are. Do not invent replacement character names, faction
philosophies, or plot beats — extend the canon, don't fork it.

On Phase 0, copy that file into `docs/STORY_BIBLE.md` verbatim so it
lives inside the same documentation system described in Section 5.

------------------------------------------------------------------------

# 5. DOCUMENTATION SYSTEM (MANDATORY, MAINTAINED EVERY SESSION)

Create and continuously maintain:

```text
/docs/
    GAME_CONTEXT.md          ← read this first, every session
    GAME_ARCHITECTURE.md
    DEVELOPMENT_PLAN.md
    DEVELOPMENT_LOG.md        ← append-only, one entry per implementation
    CURRENT_STATE.md
    TECH_STACK.md
    WORLD_BIBLE.md
    STORY_BIBLE.md            ← copy of the story/design document, Section 4
    CHARACTER_BIBLE.md
    ASSET_BIBLE.md            ← filled from Section 7 of this document
    GAMEPLAY_SYSTEMS.md
    NPC_SYSTEM.md
    SAVE_SYSTEM.md
    PERFORMANCE_GUIDE.md
    WEB_PLATFORM.md
    ENVIRONMENT_SETUP.md
    DECISION_LOG.md
    KNOWN_ISSUES.md
    TESTING_GUIDE.md
```

## 5.1 GAME_CONTEXT.md — must let a brand-new session understand the
project in under two minutes. Structure:

```text
PROJECT
GAME GENRE
CORE FANTASY
CURRENT DEVELOPMENT PHASE
CURRENT VERSION
CURRENT WORKING FEATURES
CURRENT BROKEN FEATURES
NEXT OBJECTIVE
ARCHITECTURE (one paragraph + pointer to GAME_ARCHITECTURE.md)
TECH STACK
IMPORTANT FILES
IMPORTANT SCENES
IMPORTANT SYSTEMS
CURRENT WORLD STATE
CURRENT STORY STATE
KNOWN LIMITATIONS
OPEN QUESTIONS
RECENT DECISIONS
DO NOT CHANGE WITHOUT REVIEW
```

### Worked example (what this should actually look like filled in, not just headers)

```text
PROJECT: LAST CITY
GENRE: 3D survival strategy / narrative RPG / city builder
CORE FANTASY: Build a city. Shape its people. Decide what humanity becomes.

CURRENT PHASE: Phase 2 — Interaction
CURRENT VERSION: 0.2.1

WORKING:
- Player walks/runs/crouches through City_Block_01
- Player can enter Base_One exterior shell (no interior rooms yet)
- Generic IInteractable door works (open/close/locked states)
- Save/load persists player position and door states

BROKEN:
- Inventory UI does not update on pickup (tracked in KNOWN_ISSUES.md #4)
- WebGL build has a 40s load time on the reference laptop, untested on phone

NEXT OBJECTIVE: Build the Container interactable + evidence pickup
flow (Phase 2, remaining scope), then close out Phase 2's test
checklist before starting Phase 3 (Base One interior).

ARCHITECTURE: Event-driven manager hierarchy under GameBootstrap. See
GAME_ARCHITECTURE.md. Story/character data is data-driven from
ScriptableObjects, never hard-coded.

TECH STACK: Unity 6000.x LTS / C# / URP / Next.js (web shell,
untouched so far) / Firebase (not yet integrated).

IMPORTANT FILES: Assets/Scripts/Core/GameBootstrap.cs,
Assets/Scripts/Interaction/IInteractable.cs

IMPORTANT SCENES: Scenes/Bootstrap/Boot.unity, Scenes/City/CityBlock01.unity

DO NOT CHANGE WITHOUT REVIEW: IInteractable interface signature — three
other in-progress branches of work depend on it.
```

## 5.2 DEVELOPMENT_LOG.md — append after every meaningful change:

```text
DATE
PHASE
TASK
FILES CHANGED
SYSTEMS CHANGED
WHAT WAS IMPLEMENTED
WHAT WAS TESTED
RESULT
KNOWN ISSUES
NEXT STEP
```

## 5.3 DECISION_LOG.md — every architecture decision, in this shape:

```text
Decision: Unity instead of Three.js/React Three Fiber.
Reason: Needs NavMesh NPC AI, animation, LOD, and a mobile-proven
        renderer inside one project, targeting Web now and Android/iOS
        later without a rewrite.
Alternatives considered: Three.js, React Three Fiber, Godot
Date: YYYY-MM-DD
```

Never silently change the architecture. If you change it, this file
gets an entry first.

------------------------------------------------------------------------

# 6. REPOSITORY STRUCTURE

```text
last-city/
├── game/
│   └── Unity/
│       ├── Assets/
│       ├── Packages/
│       ├── ProjectSettings/
│       └── UserSettings/
├── web/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── styles/
│   └── package.json
├── docs/                      ← Section 5
├── scripts/
├── tools/
├── .env.example
├── README.md
```

Unity `Assets/` layout:

```text
Assets/
├── Art/ (Characters, Buildings, Environment, Props, Vehicles, UI, VFX)
├── Audio/ (Music, Ambience, SFX, Voice)
├── Animations/
├── Materials/
├── Prefabs/
├── Scenes/ (Bootstrap, City, Interiors, Story)
├── Scripts/ (Core, Characters, AI, Buildings, Resources, Story,
│            Factions, Save, UI)
├── ScriptableObjects/
└── Resources/
```

------------------------------------------------------------------------

# 7. 3D ASSET SPECIFICATION (WHAT ACTUALLY GETS MODELED, AT WHAT SIZE, WITH WHAT INSIDE IT)

This is the section your original prompt was missing. Every building
and character below has enough detail to block out immediately.
Reference scale: **1 Unity unit = 1 meter.** Coordinator eye height
≈ 1.7m, standard door ≈ 2.0m × 0.9m, standard ceiling height ≈ 2.7m.

## 7.1 Asset categories (every 3D object belongs to exactly one)

```text
Environment | Building | Interior | Prop | Interactive Object
Resource Object | Evidence Object | Character | Vehicle
Vegetation | Infrastructure | VFX
```

## 7.2 Placeholder-first rule

Every early asset ships as a labeled grey-box before final art exists:

```text
PLACEHOLDER_BASE_ONE
PLACEHOLDER_PHARMACY
PLACEHOLDER_SURVIVOR_GENERIC_M
```

A placeholder must have correct **footprint, room count, door
positions, and navmesh** even before it has correct materials — the
gameplay and the art are allowed to be on different schedules, the
floor plan is not.

## 7.3 Buildings — spec sheet per building (Phase 1–3 set)

### Base One (player home base)

-   Footprint: ~18m × 14m, single story + accessible rooftop +
    lockable basement
-   Poly budget (final art): 15,000–25,000 tris exterior+interior combined
-   Rooms: sleeping area, kitchen, water tank room, generator room
    (damaged at start), medical room, workshop, radio room, rooftop
    access, locked basement (unlocks story-later)
-   Interactables inside: generator (functional), water pump
    (functional), radio (functional, story-gated), workbench,
    medical station, storage containers ×4, bunks ×6 (sit/sleep anim)
-   Story anchors: radio room is where "CONTINUITY NODE ACTIVE"
    first triggers (Section 14 of the story bible)
-   LOD: LOD0 full detail interior, LOD1 exterior shell only past 40m,
    LOD2 silhouette past 100m

### Pharmacy

-   Footprint: ~10m × 8m, single story
-   Poly budget: 6,000–10,000 tris
-   Rooms: front store, shelving aisles ×3, counter, back storage
    room, small office, one locked cabinet (requires power or a key)
-   Interactables: shelves (searchable), storage room door (locked
    until power restored — ties to Section 19 substation mission),
    office desk (evidence: pharmacist's note), locked cabinet
    (medicine cache)
-   Evidence object: pharmacist's note ("The emergency network told
    us to stay inside.")

### Police Station

-   Footprint: ~20m × 16m, single story + basement holding cells
-   Poly budget: 12,000–18,000 tris
-   Rooms: reception, two offices, evidence room, interrogation room,
    holding cells ×3, command room, radio room
-   Interactables: evidence room (locked, quest-gated), command
    terminal (plays the "central command no longer exists" recording),
    weapon locker, radio
-   Evidence objects: security footage drive, incident log, ID cards

### School

-   Footprint: ~30m × 22m, two-story + playground + gym wing
-   Poly budget: 18,000–28,000 tris
-   Rooms: classrooms ×4, gym, cafeteria, teacher offices ×2,
    corridor, emergency shelter room, exterior playground
-   Interactables: lockers (searchable), classroom desks (searchable
    in batches, not individually — performance), shelter room door
-   Evidence object: child's drawing ("When the lights come back, Dad
    will come home.") — placed for maximum environmental-storytelling
    impact, not buried in a drawer

### Electrical Substation

-   Footprint: ~14m × 10m exterior transformer yard + small interior
    control room
-   Poly budget: 8,000–12,000 tris (includes transformer/cable props)
-   Rooms: exterior transformer area (hazard zone — see below),
    control room, small maintenance closet, underground cable access
    hatch
-   Interactables: control panel (restores power to a linked building
    — data-driven link, not hard-coded to "Pharmacy"), hazard zones
    (damage-over-time volumes, not instant death), terminal (Elias's
    discovery of "NODE SEPARATION: AUTHORIZED")
-   This building is the template for "restore power → unlocks a
    linked building elsewhere" — implement it generically
    (`PowerLink` component with a target building ID) so every future
    substation/building pair reuses it

## 7.4 Later buildings (spec only when their phase starts — don't
build early): hospital, apartment complex, warehouse, factory,
municipal building, underground transit station, research center,
university, transport hub, data center, government center, the
central ORPHEUS facility (server halls, control center, archival
chamber, ORPHEUS core — see story bible Section 59).

## 7.5 Characters

Modular character rig, shared across all NPCs:

```text
BODY
├── Body Type (2–3 base meshes, reused with different textures)
├── Face
├── Hair
├── Shirt / Jacket / Pants / Shoes
└── Accessories
```

-   Poly budget per character: 4,000–8,000 tris, one shared 1–2K
    texture atlas per body type (not per character — this is what
    makes 50+ named survivors affordable)
-   Rig: humanoid, retargetable, one shared animation set (see 7.6)
-   Named characters requiring distinct faces/silhouettes at launch:
    the Coordinator (player, unnamed on-screen), Mira, Elias, Niko,
    Daniel, Dr. Mara Voss, Director Kessler, Ash, plus 5–8 generic
    survivor variants built from the modular kit
-   ORPHEUS has **no physical body** — it is represented through
    environment (screens, speakers, light pulses on Node
    terminals), never a 3D character model. Do not build an ORPHEUS
    avatar; it undermines the "calm infrastructure, not a robot"
    characterization from the story bible.

## 7.6 Shared animation set (all characters)

```text
idle, walk, run, sit, sleep, eat, drink, work, build, repair, farm,
carry, talk, point, injured, collapse, celebrate
```

Build once, retarget to every character. Do not author unique
animation sets per NPC.

## 7.7 Interactive object interface

Every interactive object in the game implements one interface:

```csharp
public interface IInteractable
{
    string GetPrompt();
    bool CanInteract(PlayerContext ctx);
    void Interact(PlayerContext ctx);
}
```

Concrete types: Door, Container, Generator, Radio, Terminal,
Workbench, MedicalStation, WaterPump, Storage, EvidenceObject, NPC,
Vehicle, ConstructionSite. **Never write one-off interaction code for
a specific object** — if the pharmacy's locked cabinet needs unique
behavior, that behavior is a data flag on a generic `Container`
(`RequiresPower`, `RequiresItem`, `RequiresQuestState`), not a new
class.

## 7.8 Environment kit (built once, reused everywhere)

Roads (clean/cracked/damaged/repaired + markings), street furniture
(lights, signs, benches, bins, poles, cables, barriers), vegetation
(grass, weeds, trees, bushes, dead vegetation), damage set (rubble,
broken concrete, fallen signs, broken glass, burned vehicles). Build
this kit before the second building — every building after Base One
should mostly be reusing kit pieces, not authoring new ones.

------------------------------------------------------------------------

# 8. CORE SYSTEM ARCHITECTURE

```text
GameBootstrap
├── GameStateManager      ├── WorldManager         ├── TimeManager
├── WeatherManager        ├── CameraManager        ├── InputManager
├── InteractionManager    ├── PlayerManager        ├── PopulationManager
├── NPCManager            ├── ResourceManager      ├── BuildingManager
├── ConstructionManager   ├── RelationshipManager  ├── FactionManager
├── StoryManager          ├── MissionManager       ├── EventManager
├── EvidenceManager       ├── MemoryManager        ├── SaveManager
├── AudioManager          └── UIManager
```

Rules: managers communicate through events/interfaces, not direct
references to each other. No manager should need to know every other
manager exists.

## 8.1 Data architecture

Static definitions live in ScriptableObjects
(`CharacterDefinition`, `BuildingDefinition`, `ResourceDefinition`,
`ItemDefinition`, `MissionDefinition`, `DialogueDefinition`,
`FactionDefinition`, `DistrictDefinition`, `WeatherDefinition`,
`ProfessionDefinition`, `StoryEventDefinition`).

Runtime state is separate (`CharacterDefinition` + a parallel
`CharacterRuntimeState`), addressed by **stable string IDs**, never by
direct ScriptableObject reference in save data.

## 8.2 Save architecture

Versioned from day one:

```json
{
  "saveVersion": 1,
  "day": 42,
  "worldState": {}, "population": {}, "buildings": {},
  "resources": {}, "characters": {}, "relationships": {},
  "memories": {}, "factions": {}, "story": {}, "evidence": {},
  "orpheus": {}
}
```

Write the migration path (`saveVersion` → `saveVersion+1`) before you
need it, not after the first breaking change.

------------------------------------------------------------------------

# 9. NPC / AI ARCHITECTURE (PERFORMANCE-CRITICAL — WEB + MOBILE TARGET)

```text
NPC
├── Identity, Profession, Needs, Skills, Schedule
├── Relationships, Memories, Faction
└── CurrentTask / AI State / Runtime State
```

Needs tracked: Health, Hunger, Thirst, Fatigue, Morale, Fear, Hope,
Safety, Social.

## Distance-based simulation (mandatory — never simulate 200 NPCs at full fidelity)

```text
Near NPCs    → full AI + full animation, every frame/few seconds
Medium NPCs  → simplified AI + reduced animation, every 10–30s
Far NPCs     → statistical simulation only, every game-hour
```

Example: instead of simulating 200 farmers individually while the
player isn't near the farm district, track `FarmProductivity = 82%`
as a single number and reconcile it into real NPC state only when the
player gets close enough for it to matter. This single rule is what
makes a "living city" affordable on a phone.

Schedules (`Wake, Eat, Work, Rest, Socialize, Patrol, Explore, Sleep`)
can be interrupted by emergency, combat, weather, injury, story, or a
direct player command.

------------------------------------------------------------------------

# 10. WEBGL AND MOBILE PERFORMANCE CHECKLIST

-   Compress textures per-platform; use Addressables to stream content
    instead of one monolithic build
-   Object pooling for anything spawned repeatedly (projectiles,
    footstep VFX, NPC path-following debris)
-   LOD on every building and character (see Section 7 budgets)
-   Baked lighting where the scene allows it; limit dynamic shadows
-   GPU instancing for repeated props (identical chairs, identical
    streetlights)
-   Occlusion culling once districts exceed one visible block
-   Never assume desktop Unity behavior "just works" in WebGL —
    test the actual Web build, not just the Editor, before calling a
    phase done
-   Test on an actual mid-range Android phone's browser and on iOS
    Safari, not only desktop Chrome, once Phase 1 has a walkable scene

------------------------------------------------------------------------

# 11. ENVIRONMENT VARIABLE COLLECTION PROTOCOL

Before implementing anything that needs a credential or external
service:

1.  Determine whether the task actually needs a new env var.
2.  Determine whether it's public (safe in a `NEXT_PUBLIC_*` var) or
    secret (server-side / Cloud Function only — never in client code
    or Unity's committed project files).
3.  Add it to `.env.example` with a placeholder value and a one-line
    comment on where to obtain it.
4.  Document setup steps in `docs/ENVIRONMENT_SETUP.md`.
5.  **If a required variable is missing, stop and report it clearly —
    do not invent a credential or silently skip the feature.**

Expected variables once Firebase is wired in (Phase 0/1):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

If Unity needs any of this (e.g., to call a Cloud Function for cloud
save), document exactly how the Unity build receives it — Unity
WebGL builds cannot read a `.env` file directly, so this typically
means a small config JSON injected at build time or fetched once from
a public config endpoint. Decide and document this in
`WEB_PLATFORM.md` before Phase 0 is considered done.

------------------------------------------------------------------------

# 12. DEVELOPMENT PHASES

Each phase lists: **Objective**, **Build**, **Technical approach**,
**Definition of Ready** (must be true to start), **Definition of
Done** (must be true to close).

## Phase 0 — Project Foundation

-   **Objective:** Everything below exists before any gameplay code.
-   **Build:** repo structure (Section 6), Unity project, Next.js
    project, Firebase project created (not necessarily integrated),
    full `/docs` system (Section 5) with `STORY_BIBLE.md` populated
    from the canon document (Section 4), `.env.example`, basic build
    process for both Unity Web and Next.js.
-   **Technical approach:** don't touch gameplay. This phase is
    entirely scaffolding and documentation.
-   **Ready when:** you have inspected any existing repo contents and
    written the architecture assessment (Section 13).
-   **Done when:** `GAME_CONTEXT.md` exists and accurately describes
    an empty-but-structured project; a blank Unity WebGL build
    succeeds; a blank Next.js page deploys/builds locally.

## Phase 1 — 3D Foundation

-   **Build:** one city block terrain, roads, basic lighting, the
    Coordinator's third-person controller, exploration camera,
    a placeholder building shell, NavMesh baked on the block,
    the generic interaction prompt UI.
-   **Technical approach:** URP, Unity's CharacterController or a
    Rigidbody-based controller (pick one and document the choice in
    `DECISION_LOG.md`), NavMesh Surface baked once per district edit,
    not at runtime.
-   **Ready when:** Phase 0's documentation and build pipeline work.
-   **Done:** player walks/runs/crouches through a city block and
    enters one placeholder building, in an actual WebGL build.

## Phase 2 — Interaction

-   **Build:** `IInteractable` and its concrete types (Section 7.7),
    doors with the full state set (`Open/Closed/Locked/RequiresItem/
    RequiresQuest/RequiresPower/Broken/Barricaded`), containers,
    inventory, evidence pickup → journal entry.
-   **Technical approach:** interactions are entirely data-driven off
    ScriptableObject definitions; zero per-object hard-coded scripts.
-   **Done:** player enters a building, inspects objects, picks up an
    item, discovers one evidence object that writes a journal entry —
    verified after a save/reload, in WebGL.

## Phase 3 — Base One

-   **Build:** the full Base One interior (Section 7.3), functional
    water pump and generator, workshop, medical room, radio room.
-   **Done:** the player has a working home base with at least two
    functional interactables inside it.

## Phase 4 — Survivors

-   **Build:** NPCs, schedules, professions, needs, simple AI,
    task assignment.
-   **Technical approach:** implement the distance-based simulation
    tiers (Section 9) from the first NPC, not retrofitted later —
    this is much harder to bolt on after the fact.
-   **Done:** survivors visibly live and work inside the settlement
    on a day/schedule loop.

## Phase 5 — Resources

-   **Build:** Food, Water, Medicine, Scrap, Electronics, Fuel,
    Materials, Ammunition; strategic resources Knowledge, Trust,
    Population.
-   **Done:** a deterministic, testable survival economy — same
    inputs produce the same resource outcomes, verifiable in a unit
    test, not just "it looked right in play."

## Phase 6 — Construction

-   **Build:** blueprint placement → validation → resource reservation
    → worker assignment → staged visual progress → completion →
    activation (Section pipeline from your original draft, kept as-is
    — it was already correct).
-   **Done:** the player physically expands the settlement and can see
    every construction stage in the 3D world.

## Phase 7 — Time and Weather

-   **Build:** day/night cycle, weather states (clear, rain, heat,
    storm, fog), lighting transitions, schedule integration.
-   **Done:** the city visibly changes state over an in-game day, and
    NPCs react to it.

## Phase 8 — Story (first arc only)

-   **Build:** dialogue, missions, choices, consequences, journal —
    implement only the first seven missions from the story bible
    (The Door → The Voice / first ORPHEUS contact).
-   **Technical approach:** missions are data-driven
    (`MissionDefinition`), never a hard-coded sequence of Unity events.
-   **Done:** a player can play from Day Zero through the first
    ORPHEUS encounter with real consequences persisting to a save.

## Phase 9 — Memory and Relationships

-   **Build:** the memory/relationship systems from Section 8, wired
    to the Phase 8 missions so early choices are already generating
    memories that show up in dialogue.
-   **Done:** at least one NPC line of dialogue changes based on an
    earlier player decision, provably, in a fresh playthrough.

## Phase 10 — Factions

-   **Build:** Haven, Directorate, Free Cities, Null — reputation,
    trade, tension, first faction missions. Voss, Kessler, and Ash
    (story bible canon) get their introductory scenes here, not just
    faction-level stat tracking.

## Phase 11 — ORPHEUS

-   **Build:** the ORPHEUS narrative/system layer (never a random
    dialogue generator — its lines are controlled by story state and
    player history, per the story bible), Node 17, first major
    revelations.

## Phase 12 — City Evolution

-   **Build:** the seven-stage city progression (Shelter → Camp →
    Settlement → Community → Town → City → Civilization), each stage
    unlocking real 3D visual change, not just a stat increase.

## Phase 13 — Advanced Story

-   **Build:** Daniel's arc, the Aurelia file, the Voss confrontation,
    the Second Failure crisis, the City Council, the ORPHEUS Core
    facility — per the story bible's later chapters.

## Phase 14 — Endings

-   **Build:** Shutdown, Restore, Rewrite, and the Secret Ending, each
    reflecting the player's actual relationship and faction state
    (per the story bible's epilogue-variant guidance).

## Phase 15 — Polish

-   Animation, VFX, lighting, sound, UI, environmental storytelling,
    NPC behavior, transitions.

## Phase 16 — Optimization

-   Profile CPU, GPU, memory, draw calls, load time, NPC simulation
    cost, specifically on WebGL and on a real mid-range Android
    device. **Optimize from profiler data, never from a guess.**

## Phase 17 — Release

-   Production WebGL build, Next.js integration, Firebase production
    environment, first Android build, analytics, error reporting,
    save migration tested, backup strategy documented.

------------------------------------------------------------------------

# 13. FIRST TASK — DO THIS BEFORE WRITING GAMEPLAY CODE

1.  **Inspect the repository.** What exists, what framework, what
    Unity/Next.js config is already present, what's broken, what's
    reusable.
2.  **Write an architecture assessment** — what stays, what changes,
    and why (goes in `DECISION_LOG.md`).
3.  **Confirm the final architecture** against Sections 6–9 of this
    document.
4.  **Set up `/docs`** and populate `STORY_BIBLE.md` from the canon
    document (Section 4).
5.  **List every required environment variable/service** per
    Section 11, and stop to ask if anything is missing — don't
    invent credentials.
6.  **Only then** begin Phase 0 implementation.

Do not attempt "the entire game." Attempt **one tiny version of the
entire game**: wake up → walk through city → enter building → inspect
object → collect resource → meet survivor → return to base → repair
something → make one decision → see one consequence → save → reload.
Once that loop works end-to-end in an actual WebGL build, expand it
phase by phase. Never reverse this order.

------------------------------------------------------------------------

# 14. STANDING RULES

1.  Never implement a large system without defining its architecture
    first.
2.  Never destroy a working system without a documented reason.
3.  Never introduce a dependency without recording why in
    `DECISION_LOG.md`.
4.  Never hard-code story state in gameplay code — it lives in
    `StoryManager` + data definitions.
5.  Never commit secrets. Ever.
6.  Never build content ahead of proving the core loop.
7.  Every phase must leave the project in a runnable state.
8.  Every meaningful implementation updates `DEVELOPMENT_LOG.md` and,
    if relevant, `GAME_CONTEXT.md`.
9.  Every non-trivial bug fix gets documented in `KNOWN_ISSUES.md`.
10. When uncertain, inspect the actual project before assuming
    anything — the files are the source of truth, not memory of a
    previous session.

Source-of-truth hierarchy when documentation and code disagree:

```text
1. Actual working code
2. GAME_ARCHITECTURE.md / current implementation docs
3. GAME_CONTEXT.md
4. STORY_BIBLE.md / CHARACTER_BIBLE.md
5. DEVELOPMENT_PLAN.md
6. Older documentation
7. Agent assumptions (lowest priority — update the docs instead)
```

------------------------------------------------------------------------

# 15. FINAL DIRECTIVE

Build the architecture so new districts, buildings, NPC professions,
characters, missions, factions, evidence, endings, and platforms can
all be added later without rewriting the core systems.

Start by inspecting the repository. Do not assume anything. Do not
skip documentation. Do not build beyond the current phase until the
current phase is stable and its Definition of Done is met.

Begin with **Phase 0 — Project Foundation.**
