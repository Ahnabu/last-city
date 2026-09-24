using UnityEngine;
using System;

namespace LastCity.BaseOne
{
    public class BaseOneManager : MonoBehaviour
    {
        public static BaseOneManager Instance { get; private set; }

        [Header("Base One Infrastructure Status")]
        [SerializeField] private bool hasPower = false;
        [SerializeField] private bool hasWater = true;
        [SerializeField] private int totalBunks = 6;
        [SerializeField] private int occupiedBunks = 1;

        [Header("Linked Interactables")]
        [SerializeField] private RadioInteractable radioRoom;

        public bool HasPower => hasPower;
        public bool HasWater => hasWater;
        public int TotalBunks => totalBunks;
        public int OccupiedBunks => occupiedBunks;

        public event Action<bool> OnPowerStateChanged;

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

        public void UpdatePowerState(bool powered)
        {
            hasPower = powered;
            Debug.Log($"[BaseOneManager] Power state updated: {hasPower}");
            
            if (radioRoom != null)
            {
                radioRoom.SetPowerState(hasPower);
            }

            OnPowerStateChanged?.Invoke(hasPower);
        }

        public bool AssignSurvivorToBunk()
        {
            if (occupiedBunks >= totalBunks)
            {
                Debug.LogWarning("[BaseOneManager] Base One bunks fully occupied!");
                return false;
            }
            occupiedBunks++;
            Debug.Log($"[BaseOneManager] Survivor assigned to bunk. ({occupiedBunks}/{totalBunks})");
            return true;
        }
    }
}
