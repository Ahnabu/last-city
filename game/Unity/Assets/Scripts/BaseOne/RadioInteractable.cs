using UnityEngine;
using LastCity.Interaction;
using LastCity.Items;

namespace LastCity.BaseOne
{
    public class RadioInteractable : MonoBehaviour, IInteractable
    {
        [Header("Radio Transmission State")]
        [SerializeField] private bool isPowered = false;
        [SerializeField] private bool hasTriggeredContinuitySignal = false;
        [TextArea(2, 4)]
        [SerializeField] private string continuityMessage = "CONTINUITY NODE 17 ACTIVE... SEEK COORDINATOR...";

        public string GetPrompt()
        {
            if (!isPowered) return "[E] Emergency Radio (No Power)";
            if (!hasTriggeredContinuitySignal) return "[E] Tune Emergency Broadcast (Node 17)";
            return "[E] Listen to Signal Output";
        }

        public bool CanInteract(PlayerContext ctx)
        {
            return isPowered;
        }

        public void Interact(PlayerContext ctx)
        {
            if (!isPowered) return;

            if (!hasTriggeredContinuitySignal)
            {
                hasTriggeredContinuitySignal = true;
                InventoryManager.Instance?.AddEvidenceEntry(
                    "evidence_continuity_signal",
                    "Node 17 Emergency Transmission",
                    continuityMessage,
                    "Base One Radio Room"
                );
                Debug.Log($"[RadioInteractable] SIGNAL BROADCAST: '{continuityMessage}'");
            }
            else
            {
                Debug.Log($"[RadioInteractable] Repeating Signal: '{continuityMessage}'");
            }
        }

        public void SetPowerState(bool powered)
        {
            isPowered = powered;
        }
    }
}
