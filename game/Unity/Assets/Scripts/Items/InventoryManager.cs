using System;
using System.Collections.Generic;
using UnityEngine;

namespace LastCity.Items
{
    [Serializable]
    public class InventorySlot
    {
        public string itemId;
        public int count;

        public InventorySlot(string id, int initialCount)
        {
            itemId = id;
            count = initialCount;
        }
    }

    [Serializable]
    public class EvidenceJournalEntry
    {
        public string evidenceId;
        public string title;
        public string contentText;
        public string locationFound;
        public string timestamp;

        public EvidenceJournalEntry(string id, string t, string text, string loc)
        {
            evidenceId = id;
            title = t;
            contentText = text;
            locationFound = loc;
            timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
        }
    }

    public class InventoryManager : MonoBehaviour
    {
        public static InventoryManager Instance { get; private set; }

        [Header("Inventory Capacity")]
        [SerializeField] private int maxSlots = 20;

        public List<InventorySlot> Slots { get; private set; } = new List<InventorySlot>();
        public List<EvidenceJournalEntry> JournalEntries { get; private set; } = new List<EvidenceJournalEntry>();

        public event Action OnInventoryUpdated;
        public event Action<EvidenceJournalEntry> OnEvidenceDiscovered;

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

        public bool AddItem(string itemId, int amount = 1)
        {
            InventorySlot existingSlot = Slots.Find(s => s.itemId == itemId);
            if (existingSlot != null)
            {
                existingSlot.count += amount;
                Debug.Log($"[InventoryManager] Added {amount}x {itemId}. Total: {existingSlot.count}");
                OnInventoryUpdated?.Invoke();
                return true;
            }

            if (Slots.Count >= maxSlots)
            {
                Debug.LogWarning("[InventoryManager] Inventory full!");
                return false;
            }

            Slots.Add(new InventorySlot(itemId, amount));
            Debug.Log($"[InventoryManager] Added new item: {itemId} (x{amount})");
            OnInventoryUpdated?.Invoke();
            return true;
        }

        public void AddEvidenceEntry(string evidenceId, string title, string content, string location)
        {
            if (JournalEntries.Exists(e => e.evidenceId == evidenceId)) return;

            EvidenceJournalEntry entry = new EvidenceJournalEntry(evidenceId, title, content, location);
            JournalEntries.Add(entry);
            Debug.Log($"[InventoryManager] Discovered Evidence: '{title}' at {location}");
            OnEvidenceDiscovered?.Invoke(entry);
        }
    }
}
