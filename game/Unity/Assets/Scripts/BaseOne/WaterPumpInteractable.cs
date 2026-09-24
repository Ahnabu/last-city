using UnityEngine;
using LastCity.Interaction;
using LastCity.Items;

namespace LastCity.BaseOne
{
    public class WaterPumpInteractable : MonoBehaviour, IInteractable
    {
        [Header("Pump State")]
        [SerializeField] private bool isOperational = true;
        [SerializeField] private int waterRationAmount = 2;

        public string GetPrompt()
        {
            if (!isOperational) return "[E] Water Pump (Needs Maintenance)";
            return $"[E] Collect Purified Water Rations (+{waterRationAmount})";
        }

        public bool CanInteract(PlayerContext ctx)
        {
            return isOperational;
        }

        public void Interact(PlayerContext ctx)
        {
            if (isOperational)
            {
                InventoryManager.Instance?.AddItem("item_purified_water", waterRationAmount);
                Debug.Log($"[WaterPumpInteractable] Collected {waterRationAmount}x purified water.");
            }
        }
    }
}
