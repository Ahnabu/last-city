using UnityEngine;
using LastCity.Items;

namespace LastCity.Interaction
{
    public class EvidenceInteractable : MonoBehaviour, IInteractable
    {
        [Header("Evidence Details")]
        [SerializeField] private string evidenceId = "evidence_pharmacist_note";
        [SerializeField] private string evidenceTitle = "Pharmacist's Note";
        [TextArea(3, 5)]
        [SerializeField] private string contentText = "The emergency network told us to stay inside...";
        [SerializeField] private string locationFound = "Pharmacy Office Desk";

        private bool isCollected = false;

        public string GetPrompt()
        {
            if (isCollected) return "";
            return $"[E] Inspect {evidenceTitle}";
        }

        public bool CanInteract(PlayerContext ctx)
        {
            return !isCollected;
        }

        public void Interact(PlayerContext ctx)
        {
            if (isCollected) return;

            isCollected = true;
            InventoryManager.Instance?.AddEvidenceEntry(evidenceId, evidenceTitle, contentText, locationFound);
            
            // Optional: Hide mesh or play visual pickup feedback
            gameObject.SetActive(false);
        }
    }
}
