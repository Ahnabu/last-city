using System;
using UnityEngine;

namespace LastCity.AI
{
    public enum ScheduleActivity { Wake, Eat, Work, Rest, Socialize, Patrol, Sleep }

    [Serializable]
    public class ScheduleBlock
    {
        public int startHour; // 0 - 23
        public int endHour;   // 0 - 23
        public ScheduleActivity activity;
        public Vector3 targetLocation;
        public string locationName;
    }

    [Serializable]
    public class NPCSchedule
    {
        public ScheduleBlock[] blocks = new ScheduleBlock[]
        {
            new ScheduleBlock { startHour = 6,  endHour = 7,  activity = ScheduleActivity.Wake,      locationName = "Quarters" },
            new ScheduleBlock { startHour = 7,  endHour = 8,  activity = ScheduleActivity.Eat,       locationName = "Mess Hall" },
            new ScheduleBlock { startHour = 8,  endHour = 17, activity = ScheduleActivity.Work,      locationName = "Workstation" },
            new ScheduleBlock { startHour = 17, endHour = 21, activity = ScheduleActivity.Rest,      locationName = "Common Yard" },
            new ScheduleBlock { startHour = 21, endHour = 24, activity = ScheduleActivity.Sleep,     locationName = "Quarters Bunks" },
            new ScheduleBlock { startHour = 0,  endHour = 6,  activity = ScheduleActivity.Sleep,     locationName = "Quarters Bunks" }
        };

        public ScheduleBlock GetCurrentBlock(int hour)
        {
            foreach (var block in blocks)
            {
                if (hour >= block.startHour && hour < block.endHour)
                {
                    return block;
                }
            }
            return blocks[0];
        }
    }
}
