using System;
using UnityEngine;

namespace LastCity.AI
{
    [Serializable]
    public class NPCNeeds
    {
        [Range(0, 100)] public float health = 100f;
        [Range(0, 100)] public float hunger = 20f;  // 0 = full, 100 = starving
        [Range(0, 100)] public float thirst = 20f;  // 0 = hydrated, 100 = dehydrated
        [Range(0, 100)] public float fatigue = 10f; // 0 = rested, 100 = exhausted
        [Range(0, 100)] public float morale = 75f;  // 0 = broken, 100 = inspired
        [Range(0, 100)] public float hope = 80f;
        [Range(0, 100)] public float safety = 85f;

        public void TickNeeds(float deltaTime, bool isWorking, bool isSleeping)
        {
            if (isSleeping)
            {
                fatigue = Mathf.Max(0f, fatigue - deltaTime * 5f);
                hunger = Mathf.Min(100f, hunger + deltaTime * 0.5f);
                thirst = Mathf.Min(100f, thirst + deltaTime * 0.8f);
            }
            else if (isWorking)
            {
                fatigue = Mathf.Min(100f, fatigue + deltaTime * 1.5f);
                hunger = Mathf.Min(100f, hunger + deltaTime * 1.2f);
                thirst = Mathf.Min(100f, thirst + deltaTime * 1.8f);
            }
            else
            {
                fatigue = Mathf.Min(100f, fatigue + deltaTime * 0.5f);
                hunger = Mathf.Min(100f, hunger + deltaTime * 0.8f);
                thirst = Mathf.Min(100f, thirst + deltaTime * 1.0f);
            }

            // Health penalty if severely starving or dehydrated
            if (hunger > 90f || thirst > 90f)
            {
                health = Mathf.Max(0f, health - deltaTime * 1.0f);
                morale = Mathf.Max(0f, morale - deltaTime * 2.0f);
            }
        }
    }
}
