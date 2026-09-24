using System;
using UnityEngine;
using LastCity.Interaction;

namespace LastCity.Buildings
{
    public enum ConstructionStage { Blueprint, Scaffolding, Framing, Completed }

    public class ConstructionSite : MonoBehaviour, IInteractable
    {
        [Header("Construction State")]
        [SerializeField] private string buildingId = "building_greenhouse";
        [SerializeField] private string buildingName = "Hydroponic Greenhouse";
        [SerializeField] private ConstructionStage currentStage = ConstructionStage.Scaffolding;
        [Range(0, 100)]
        [SerializeField] private float progressPercentage = 0f;
        [SerializeField] private int assignedWorkers = 0;
        [SerializeField] private int maxWorkers = 2;

        public event Action<float> OnProgressUpdated;
        public event Action OnConstructionCompleted;

        public string GetPrompt()
        {
            switch (currentStage)
            {
                case ConstructionStage.Blueprint:
                    return $"[E] Place Blueprint for {buildingName}";
                case ConstructionStage.Scaffolding:
                case ConstructionStage.Framing:
                    return $"[E] Contribute Work to {buildingName} ({Mathf.RoundToInt(progressPercentage)}%)";
                case ConstructionStage.Completed:
                    return $"[E] Enter {buildingName}";
                default:
                    return $"[E] Interact with {buildingName}";
            }
        }

        public bool CanInteract(PlayerContext ctx)
        {
            return true;
        }

        public void Interact(PlayerContext ctx)
        {
            if (currentStage != ConstructionStage.Completed)
            {
                AddProgress(25f);
                Debug.Log($"[ConstructionSite] Contributed work to {buildingName}. Progress: {progressPercentage}%");
            }
        }

        public void AddProgress(float delta)
        {
            if (currentStage == ConstructionStage.Completed) return;

            progressPercentage = Mathf.Min(100f, progressPercentage + delta);

            if (progressPercentage >= 100f)
            {
                currentStage = ConstructionStage.Completed;
                Debug.Log($"[ConstructionSite] Construction of {buildingName} COMPLETED!");
                OnConstructionCompleted?.Invoke();
            }
            else if (progressPercentage >= 50f)
            {
                currentStage = ConstructionStage.Framing;
            }

            OnProgressUpdated?.Invoke(progressPercentage);
        }
    }
}
