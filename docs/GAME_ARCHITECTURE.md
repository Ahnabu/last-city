# GAME ARCHITECTURE — LAST CITY

## 1. Manager Hierarchy

The Unity simulation is orchestrated by `GameBootstrap` executing in an event-driven hierarchy.

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

### Decoupling Rules
1. Managers communicate strictly via events or interface boundaries, never hard-coded cross-references.
2. No manager requires knowledge of all other managers.
3. State changes emit C# events (`System.Action<T>`).

---

## 2. Data Architecture

- **Static Definitions:** Live in `ScriptableObject` assets (`CharacterDefinition`, `BuildingDefinition`, `ItemDefinition`, `MissionDefinition`, `DialogueDefinition`, `FactionDefinition`).
- **Runtime State:** Parallel runtime classes (`CharacterRuntimeState`, `BuildingRuntimeState`).
- **Identification:** Entities use stable `string` IDs (e.g., `"npc_mira"`, `"building_base_one"`, `"item_medkit_01"`). Save files store entity IDs, never direct ScriptableObject asset paths.

---

## 3. Interaction Architecture

Every interactable world entity implements `IInteractable`:

```csharp
public interface IInteractable
{
    string GetPrompt();
    bool CanInteract(PlayerContext ctx);
    void Interact(PlayerContext ctx);
}
```

Implementations include: `Door`, `Container`, `Generator`, `Radio`, `Terminal`, `Workbench`, `MedicalStation`, `WaterPump`, `Storage`, `EvidenceObject`, `NPC`, `Vehicle`, `ConstructionSite`.
All custom behaviors (e.g. required items, power state, locked state) are data flags on generic implementations, not one-off C# scripts.

---

## 4. NPC & Simulation Tiering Architecture

NPCs update across three distance-based fidelity tiers to maximize WebGL / mobile performance:

- **Near Tier (< 20m):** Full 3D mesh, full animation controller, pathfinding every frame/few seconds.
- **Medium Tier (20m - 100m):** Simplified mesh/LOD, low-frequency path updates (every 10-30s).
- **Far Tier (> 100m / off-screen):** Statistical math simulation (updates every in-game hour).
