using System;
using UnityEngine;

namespace LastCity.AI
{
    public enum NPCProfession { Farmer, Engineer, Doctor, Builder, Guard, Scavenger, Researcher, Unassigned }

    [Serializable]
    public class NPCData
    {
        public string npcId;
        public string npcName;
        public NPCProfession profession;
        public string factionAllegiance = "Haven";
        public string backStory;
    }

    [CreateAssetMenu(fileName = "NewNPCDefinition", menuName = "LastCity/NPC Definition")]
    public class NPCDefinition : ScriptableObject
    {
        public NPCData data;
    }
}
