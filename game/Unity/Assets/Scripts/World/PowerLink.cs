using UnityEngine;
using LastCity.Interaction;

namespace LastCity.World
{
    public class PowerLink : MonoBehaviour, IInteractable
    {
        [Header("Substation Configuration")]
        [SerializeField] private string substationId = "substation_block_01";
        [SerializeField] private string targetBuildingId = "building_pharmacy";
        [SerializeField] private bool isPowerRestored = false;
        [SerializeField] private ContainerInteractable linkedContainer;

        public string GetPrompt()
        {
            if (isPowerRestored) return $"[E] {substationId} (Grid Power Online)";
            return $"[E] Restore Power Grid Link to {targetBuildingId}";
        }

        public bool CanInteract(PlayerContext ctx)
        {
            return !isPowerRestored;
        }

        public void Interact(PlayerContext ctx)
        {
            if (isPowerRestored) return;

            isPowerRestored = true;
            Debug.Log($"[PowerLink] Power restored to target building: {targetBuildingId}");

            if (linkedContainer != null)
            {
                linkedContainer.SetPowerState(true);
            }
        }
    }
}
