# LAST CITY

> **3D Survival Strategy / Narrative RPG / City Builder**  
> *Build a city. Shape its people. Decide what humanity becomes.*

---

## 1. Project Overview

**LAST CITY** is a multi-platform 3D game built using Unity (C#) for the simulation core and Next.js (TypeScript) for the web shell and community suite.

- **Simulation Engine:** Unity 6 (6000.x LTS, URP)
- **Web Shell & Docs:** Next.js + Tailwind CSS / Vanilla CSS
- **Backend & Auth:** Firebase (Auth, Cloud Save Metadata, Analytics)
- **Platforms:** Web (WebGL / Unity 6 mobile browser support), with future Native Android and iOS build targets.

---

## 2. Directory Structure

```text
last-city/
├── game/
│   └── Unity/              # Unity 6 project source
├── web/                    # Next.js web shell & dashboard
├── docs/                   # Full game documentation & bibles
├── scripts/                # Utility & build automation scripts
├── tools/                  # Asset conversion & analysis tools
├── .env.example            # Required environment variables
└── README.md
```

---

## 3. Documentation System

All project context, architecture decisions, and development logs are strictly maintained in `/docs`:

- [`GAME_CONTEXT.md`](docs/GAME_CONTEXT.md) — High-level project state & immediate objectives.
- [`GAME_ARCHITECTURE.md`](docs/GAME_ARCHITECTURE.md) — System design & event-driven manager hierarchy.
- [`DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) — Phase breakdown and roadmap.
- [`DEVELOPMENT_LOG.md`](docs/DEVELOPMENT_LOG.md) — Append-only record of changes and implementations.
- [`DECISION_LOG.md`](docs/DECISION_LOG.md) — Architectural records & justifications.
- [`STORY_BIBLE.md`](docs/STORY_BIBLE.md) — Canonical narrative, characters, and mission specs.

---

## 4. Getting Started

1. Read [`docs/GAME_CONTEXT.md`](docs/GAME_CONTEXT.md) first before undertaking any task.
2. Review [`docs/ENVIRONMENT_SETUP.md`](docs/ENVIRONMENT_SETUP.md) for required credentials.
3. Open `game/Unity` in **Unity 6000.x LTS**.
