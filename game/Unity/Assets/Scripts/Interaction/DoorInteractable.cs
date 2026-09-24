using UnityEngine;

namespace LastCity.Interaction
{
    public class DoorInteractable : MonoBehaviour, IInteractable
    {
        public enum DoorState { Closed, Open, Locked, RequiresPower }

        [Header("Door Configuration")]
        [SerializeField] private string doorName = "Base One Door";
        [SerializeField] private DoorState currentState = DoorState.Closed;
        [SerializeField] private string requiredKeyId = "";

        public string GetPrompt()
        {
            switch (currentState)
            {
                case DoorState.Open: return $"[E] Close {doorName}";
                case DoorState.Closed: return $"[E] Open {doorName}";
                case DoorState.Locked: return $"[E] Unlock {doorName} (Requires Key)";
                case DoorState.RequiresPower: return $"[E] {doorName} (No Power)";
                default: return $"[E] Interact with {doorName}";
            }
        }

        public bool CanInteract(PlayerContext ctx)
        {
            if (currentState == DoorState.RequiresPower) return false;
            if (currentState == DoorState.Locked && ctx.ActiveItemId != requiredKeyId) return false;
            return true;
        }

        public void Interact(PlayerContext ctx)
        {
            if (currentState == DoorState.Closed)
            {
                currentState = DoorState.Open;
                Debug.Log($"[DoorInteractable] {doorName} opened.");
            }
            else if (currentState == DoorState.Open)
            {
                currentState = DoorState.Closed;
                Debug.Log($"[DoorInteractable] {doorName} closed.");
            }
            else if (currentState == DoorState.Locked && ctx.ActiveItemId == requiredKeyId)
            {
                currentState = DoorState.Closed;
                Debug.Log($"[DoorInteractable] {doorName} unlocked with key {requiredKeyId}.");
            }
        }
    }
}
