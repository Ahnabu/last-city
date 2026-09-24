# ASSET BIBLE — LAST CITY

## 1. Unit & Scale Standard

- **Reference Scale:** 1 Unity Unit = 1 Meter.
- **Coordinator Eye Height:** ~1.7 meters.
- **Standard Door Dimensions:** 2.0m height × 0.9m width.
- **Standard Floor-to-Ceiling Height:** ~2.7 meters.

---

## 2. Polygon & Texture Budgets

| Asset Category | Target Poly Count (Triangles) | LOD Tiers | Texture Budget |
| :--- | :--- | :--- | :--- |
| **Base One Building** | 15,000 – 25,000 | LOD0 (full), LOD1 (shell @ 40m), LOD2 (silh @ 100m) | Shared 2K Atlas |
| **Pharmacy** | 6,000 – 10,000 | LOD0 (full), LOD1 (shell @ 30m) | Shared 2K Atlas |
| **Police Station** | 12,000 – 18,000 | LOD0 (full), LOD1 (shell @ 40m) | Shared 2K Atlas |
| **School** | 18,000 – 28,000 | LOD0 (full), LOD1 (shell @ 40m) | Shared 2K Atlas |
| **Substation** | 8,000 – 12,000 | LOD0 (full), LOD1 (shell @ 30m) | Shared 2K Atlas |
| **Character Models** | 4,000 – 8,000 | LOD0 (full), LOD1 (simple @ 20m) | 1-2K Shared Body Atlas |
| **Props / Furniture** | 200 – 1,500 | Instanced where possible | Shared Prop Atlas |

---

## 3. Early Asset Specification Sheets

### Base One (Player Base)
- **Footprint:** ~18m × 14m, single story + accessible rooftop + basement.
- **Rooms:** Sleeping area, kitchen, water tank room, generator room (damaged), medical room, workshop, radio room, rooftop, locked basement.
- **Interactables:** Generator (functional), Water Pump (functional), Radio (functional, story-gated), Workbench, Medical Station, Storage Containers ×4, Bunks ×6.

### Pharmacy
- **Footprint:** ~10m × 8m, single story.
- **Rooms:** Front store, shelving aisles ×3, counter, back storage room, office, locked cabinet.
- **Interactables:** Searchable shelves, locked storage door (requires substation power link), office desk, medicine cabinet.
- **Evidence:** Pharmacist's Note.

### Substation
- **Footprint:** ~14m × 10m transformer yard + interior control room.
- **Interactables:** Control panel (`PowerLink` script linked to building ID), hazard zones (DoT volume), terminal.
