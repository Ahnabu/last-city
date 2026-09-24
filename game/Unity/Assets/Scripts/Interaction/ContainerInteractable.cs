using System.Collections.Generic;
using UnityEngine;
using LastCity.Items;

namespace LastCity.Interaction
{
    public class ContainerInteractable : MonoBehaviour, IInteractable
    {
        [Header("Container Attributes")]
        [SerializeField] private string containerName = "Storage Locker";
        [SerializeField] private bool isSearched = false;
        [SerializeField] private bool isLocked = false;
        [SerializeField] private bool requiresPower = false;
        [SerializeField] private string requiredKeyId = "";

        [Header("Loot Table")]
        [SerializeField] private List<string> containedItemIds = new List<string> { "item_medkit", "item_scrap_metal" };

        public string GetPrompt()
        {
            if (requiresPower) return $"[E] {containerName} (Requires Substation Power)";
            if (isLocked) return $"[E] Search {containerName} (Locked - Requires Key)";
            if (isSearched) return $"[E] {containerName} (Empty)";
            return $"[E] Search {containerName}";
        }

        public bool CanInteract(PlayerContext ctx)
        {
            if (requiresPower) return false;
            if (isLocked && ctx.ActiveItemId != requiredKeyId) return false;
            if (isSearched) return false;
            return true;
        }

        public void Interact(PlayerContext ctx)
        {
            if (isLocked && ctx.ActiveItemId == requiredKeyId)
            {
                isLocked = false;
            }

            if (!isLocked && !requiresPower && !isSearched)
            {
                isSearched = true;
                foreach (string itemId in containedItemIds)
                {
                    InventoryManager.Instance?.AddItem(itemId, 1);
                }
                Debug.Log($"[ContainerInteractable] Searched {containerName}. Items collected.");
            }
        }

        public void SetPowerState(bool powered)
        {
            requiresPower = !powered;
        }
    }
}
