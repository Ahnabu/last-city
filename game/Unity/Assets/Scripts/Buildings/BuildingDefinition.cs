using System;
using UnityEngine;

namespace LastCity.Buildings
{
    public enum BuildingCategory { Infrastructure, Survival, Defense, Resource, Medical, Housing }

    [Serializable]
    public class BuildingCost
    {
        public string resourceId;
        public int amount;
    }

    [Serializable]
    public class BuildingData
    {
        public string buildingId;
        public string buildingName;
        public BuildingCategory category;
        public Vector2 footprintSize = new Vector2(10, 8); // Width x Depth in meters
        public float constructionTimeSeconds = 30f;
        public BuildingCost[] costs;
        public int workerCapacity = 2;
    }

    [CreateAssetMenu(fileName = "NewBuildingDefinition", menuName = "LastCity/Building Definition")]
    public class BuildingDefinition : ScriptableObject
    {
        public BuildingData data;
    }
}
