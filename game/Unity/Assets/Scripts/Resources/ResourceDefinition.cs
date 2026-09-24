using System;
using UnityEngine;

namespace LastCity.Resources
{
    public enum ResourceCategory { Physical, Strategic }

    public enum ResourceType
    {
        Food,
        Water,
        Medicine,
        ScrapMetal,
        Electronics,
        Fuel,
        BuildingMaterials,
        Ammunition,
        Knowledge,
        Trust,
        Population
    }

    [Serializable]
    public class ResourceData
    {
        public ResourceType type;
        public string resourceName;
        public ResourceCategory category;
        public int initialAmount;
        public int maxStorageCapacity = 1000;
        public string unitName = "units";
    }

    [CreateAssetMenu(fileName = "NewResourceDefinition", menuName = "LastCity/Resource Definition")]
    public class ResourceDefinition : ScriptableObject
    {
        public ResourceData data;
    }
}
