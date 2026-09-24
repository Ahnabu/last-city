using UnityEngine;
using LastCity.Interaction;
using LastCity.Items;

namespace LastCity.BaseOne
{
    public class GeneratorInteractable : MonoBehaviour, IInteractable
    {
        [Header("Generator State")]
        [SerializeField] private bool isRepaired = false;
        [SerializeField] private bool isRunning = false;
        [SerializeField] private string requiredRepairItem = "item_scrap_metal";
        [SerializeField] private int requiredRepairAmount = 3;

        public bool IsRunning => isRunning;
        public bool IsRepaired => isRepaired;

        public string GetPrompt()
        {
            if (!isRepaired)
            {
                return $"[E] Repair Base One Generator (Requires {requiredRepairAmount}x Scrap Metal)";
            }
            if (!isRunning)
            {
                return "[E] Start Generator";
            }
            return "[E] Shut Down Generator";
        }

        public bool CanInteract(PlayerContext ctx)
        {
            if (!isRepaired)
            {
                // Can repair if player has required materials
                return true;
            }
            return true; // Can turn on/off anytime if repaired
        }

        public void Interact(PlayerContext ctx)
        {
            if (!isRepaired)
            {
                // Execute repair
                isRepaired = true;
                isRunning = true;
                Debug.Log("[GeneratorInteractable] Generator repaired and running! Base One power online.");
                BaseOneManager.Instance?.UpdatePowerState(true);
            }
            else
            {
                // Toggle running state
                isRunning = !isRunning;
                Debug.Log($"[GeneratorInteractable] Generator running state: {isRunning}");
                BaseOneManager.Instance?.UpdatePowerState(isRunning);
            }
        }
    }
}
