using System;
using UnityEngine;

namespace LastCity.Resources
{
    public struct EconomyTickResult
    {
        public int foodConsumed;
        public int waterConsumed;
        public int fuelConsumed;
        public int foodProduced;
        public int waterProduced;
        public int scrapProduced;
        public bool hasFoodShortage;
        public bool hasWaterShortage;
    }

    public static class EconomyEngine
    {
        /// <summary>
        /// Deterministic resource simulation calculation per in-game hour.
        /// Same inputs guaranteed to produce identical outputs.
        /// </summary>
        public static EconomyTickResult CalculateHourlyTick(
            int population,
            int activeFarmers,
            int activeScavengers,
            bool isWaterPumpPowered,
            bool isGeneratorRunning)
        {
            EconomyTickResult result = new EconomyTickResult();

            // Hourly consumption per survivor
            result.foodConsumed = Mathf.CeilToInt(population * 0.5f);
            result.waterConsumed = Mathf.CeilToInt(population * 0.8f);
            result.fuelConsumed = isGeneratorRunning ? 1 : 0;

            // Hourly production
            result.foodProduced = activeFarmers * 2;
            result.waterProduced = isWaterPumpPowered ? 3 : 1;
            result.scrapProduced = activeScavengers * 1;

            return result;
        }
    }
}
