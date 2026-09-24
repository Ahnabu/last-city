using System;
using System.Collections.Generic;
using UnityEngine;

namespace LastCity.Buildings
{
    public enum SettlementStage { Shelter, Camp, Settlement, Community, Town, City, Civilization }

    public class BuildingManager : MonoBehaviour
    {
        public static BuildingManager Instance { get; private set; }

        [Header("Settlement Progression")]
        [SerializeField] private SettlementStage currentStage = SettlementStage.Shelter;
        [SerializeField] private List<ConstructionSite> activeSites = new List<ConstructionSite>();
        [SerializeField] private List<string> completedBuildingIds = new List<string> { "building_base_one" };

        public SettlementStage CurrentStage => currentStage;

        public event Action<SettlementStage> OnSettlementStageAdvanced;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void RegisterConstructionSite(ConstructionSite site)
        {
            if (!activeSites.Contains(site))
            {
                activeSites.Add(site);
                site.OnConstructionCompleted += () => OnBuildingCompleted(site);
            }
        }

        private void OnBuildingCompleted(ConstructionSite site)
        {
            if (!completedBuildingIds.Contains(site.name))
            {
                completedBuildingIds.Add(site.name);
                CheckSettlementStageProgression();
            }
        }

        private void CheckSettlementStageProgression()
        {
            int count = completedBuildingIds.Count;
            SettlementStage newStage = currentStage;

            if (count >= 7) newStage = SettlementStage.Civilization;
            else if (count >= 5) newStage = SettlementStage.City;
            else if (count >= 4) newStage = SettlementStage.Town;
            else if (count >= 3) newStage = SettlementStage.Community;
            else if (count >= 2) newStage = SettlementStage.Settlement;
            else if (count >= 1) newStage = SettlementStage.Camp;

            if (newStage != currentStage)
            {
                currentStage = newStage;
                Debug.Log($"[BuildingManager] SETTLEMENT ADVANCED TO: {currentStage}");
                OnSettlementStageAdvanced?.Invoke(currentStage);
            }
        }
    }
}
