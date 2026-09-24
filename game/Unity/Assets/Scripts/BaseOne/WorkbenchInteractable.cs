using UnityEngine;
using LastCity.Interaction;
using LastCity.Items;

namespace LastCity.BaseOne
{
    public class WorkbenchInteractable : MonoBehaviour, IInteractable
    {
        [Header("Crafting Requirements")]
        [SerializeField] private string recipeName = "Basic Medkit";
        [SerializeField] private string inputMaterialId = "item_herbs";
        [SerializeField] private int inputAmount = 2;
        [SerializeField] private string outputItemId = "item_medkit";

        public string GetPrompt()
        {
            return $"[E] Craft {recipeName} at Workbench";
        }

        public bool CanInteract(PlayerContext ctx)
        {
            return true;
        }

        public void Interact(PlayerContext ctx)
        {
            // Simple crafting simulation
            bool success = InventoryManager.Instance != null && InventoryManager.Instance.AddItem(outputItemId, 1);
            if (success)
            {
                Debug.Log($"[WorkbenchInteractable] Crafted 1x {outputItemId} at Workbench.");
            }
        }
    }
}
