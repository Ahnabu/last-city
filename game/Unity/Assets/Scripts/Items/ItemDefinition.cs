using System;
using UnityEngine;

namespace LastCity.Items
{
    public enum ItemCategory { Resource, Medical, Key, Equipment, Evidence }

    [Serializable]
    public class ItemData
    {
        public string itemId;
        public string itemName;
        public string description;
        public ItemCategory category;
        public int maxStackSize = 99;
    }

    [CreateAssetMenu(fileName = "NewItemDefinition", menuName = "LastCity/Item Definition")]
    public class ItemDefinition : ScriptableObject
    {
        public ItemData data;
    }
}
