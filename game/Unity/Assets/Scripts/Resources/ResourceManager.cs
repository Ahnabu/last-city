using System;
using System.Collections.Generic;
using UnityEngine;

namespace LastCity.Resources
{
    public class ResourceManager : MonoBehaviour
    {
        public static ResourceManager Instance { get; private set; }

        [Header("Resource Ledger")]
        [SerializeField] private Dictionary<ResourceType, int> resourceBank = new Dictionary<ResourceType, int>();

        public event Action<ResourceType, int> OnResourceChanged;
        public event Action<ResourceType> OnResourceShortage;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            InitializeDefaultBank();
        }

        private void InitializeDefaultBank()
        {
            SetResource(ResourceType.Food, 25);
            SetResource(ResourceType.Water, 30);
            SetResource(ResourceType.Medicine, 10);
            SetResource(ResourceType.ScrapMetal, 15);
            SetResource(ResourceType.Electronics, 5);
            SetResource(ResourceType.Fuel, 10);
            SetResource(ResourceType.Knowledge, 0);
            SetResource(ResourceType.Trust, 50);
            SetResource(ResourceType.Population, 1);
        }

        public int GetResource(ResourceType type)
        {
            return resourceBank.TryGetValue(type, out int amount) ? amount : 0;
        }

        public void SetResource(ResourceType type, int amount)
        {
            resourceBank[type] = Mathf.Max(0, amount);
            OnResourceChanged?.Invoke(type, resourceBank[type]);
        }

        public bool ConsumeResource(ResourceType type, int amount)
        {
            int current = GetResource(type);
            if (current >= amount)
            {
                SetResource(type, current - amount);
                return true;
            }
            OnResourceShortage?.Invoke(type);
            return false;
        }

        public void AddResource(ResourceType type, int amount)
        {
            SetResource(type, GetResource(type) + amount);
        }

        /// <summary>
        /// Ticks deterministic economy using EconomyEngine calculation.
        /// </summary>
        public void PerformHourlyEconomyTick(int population, int activeFarmers, int activeScavengers, bool isWaterPumpPowered, bool isGeneratorRunning)
        {
            EconomyTickResult result = EconomyEngine.CalculateHourlyTick(
                population, activeFarmers, activeScavengers, isWaterPumpPowered, isGeneratorRunning
            );

            // Apply consumption
            bool foodOk = ConsumeResource(ResourceType.Food, result.foodConsumed);
            bool waterOk = ConsumeResource(ResourceType.Water, result.waterConsumed);
            if (isGeneratorRunning) ConsumeResource(ResourceType.Fuel, result.fuelConsumed);

            // Apply production
            AddResource(ResourceType.Food, result.foodProduced);
            AddResource(ResourceType.Water, result.waterProduced);
            AddResource(ResourceType.ScrapMetal, result.scrapProduced);

            Debug.Log($"[ResourceManager] Economy Tick: Food Δ({result.foodProduced - result.foodConsumed}), Water Δ({result.waterProduced - result.waterConsumed}), Scrap +{result.scrapProduced}");
        }
    }
}
