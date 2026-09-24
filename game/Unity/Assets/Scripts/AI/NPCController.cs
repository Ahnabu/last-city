using UnityEngine;
using LastCity.Interaction;

namespace LastCity.AI
{
    public enum SimulationTier { Near, Medium, Far }

    public class NPCController : MonoBehaviour, IInteractable
    {
        [Header("Survivor Identity")]
        [SerializeField] private string npcId = "npc_mira";
        [SerializeField] private string npcName = "Mira";
        [SerializeField] private NPCProfession profession = NPCProfession.Engineer;
        [TextArea(2, 4)]
        [SerializeField] private string dialogueLine = "The Base One power grid is delicate... We need to keep the generator running.";

        [Header("State Tracking")]
        [SerializeField] private SimulationTier currentTier = SimulationTier.Near;
        public NPCNeeds Needs = new NPCNeeds();
        public NPCSchedule Schedule = new NPCSchedule();

        private Transform playerTransform;

        private void Start()
        {
            if (Camera.main != null)
            {
                playerTransform = Camera.main.transform;
            }
        }

        private void Update()
        {
            UpdateSimulationTier();

            switch (currentTier)
            {
                case SimulationTier.Near:
                    // Full 3D AI & movement every frame
                    TickNearSimulation();
                    break;
                case SimulationTier.Medium:
                    // Low-frequency AI updates
                    TickMediumSimulation();
                    break;
                case SimulationTier.Far:
                    // Statistical simulation managed by NPCManager
                    break;
            }
        }

        private void UpdateSimulationTier()
        {
            if (playerTransform == null) return;

            float dist = Vector3.Distance(transform.position, playerTransform.position);
            if (dist < 20f)
            {
                currentTier = SimulationTier.Near;
            }
            else if (dist < 100f)
            {
                currentTier = SimulationTier.Medium;
            }
            else
            {
                currentTier = SimulationTier.Far;
            }
        }

        private void TickNearSimulation()
        {
            Needs.TickNeeds(Time.deltaTime, profession != NPCProfession.Unassigned, false);
        }

        private void TickMediumSimulation()
        {
            // Low-frequency ticks every few seconds
            Needs.TickNeeds(Time.deltaTime * 0.2f, profession != NPCProfession.Unassigned, false);
        }

        public string GetPrompt()
        {
            return $"[E] Talk to {npcName} ({profession})";
        }

        public bool CanInteract(PlayerContext ctx)
        {
            return true;
        }

        public void Interact(PlayerContext ctx)
        {
            Debug.Log($"[NPCController] Dialogue with {npcName}: '{dialogueLine}'");
        }
    }
}
