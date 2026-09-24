using System.Collections.Generic;
using UnityEngine;

namespace LastCity.AI
{
    public class NPCManager : MonoBehaviour
    {
        public static NPCManager Instance { get; private set; }

        [Header("Population Registry")]
        [SerializeField] private List<NPCController> registeredNPCs = new List<NPCController>();

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

        public void RegisterNPC(NPCController npc)
        {
            if (!registeredNPCs.Contains(npc))
            {
                registeredNPCs.Add(npc);
                Debug.Log($"[NPCManager] Registered survivor to population roster.");
            }
        }

        /// <summary>
        /// Statistical math simulation loop for Far-tier NPCs (runs every in-game hour).
        /// </summary>
        public void PerformFarTierStatisticalUpdate(int currentHour)
        {
            Debug.Log($"[NPCManager] Executing Far-Tier Statistical Math Update for {registeredNPCs.Count} survivors at hour {currentHour}:00");
        }
    }
}
