using System;
using System.IO;
using UnityEngine;

namespace LastCity.Core
{
    [Serializable]
    public class SaveData
    {
        public int saveVersion = 1;
        public int currentDay = 0;
        public float timeOfDay = 8.0f; // 08:00 AM
        public Vector3 playerPosition;
        public Vector3 playerRotation;
        public string activeMissionId = "mission_01_the_door";
    }

    public class SaveManager : MonoBehaviour
    {
        public static SaveManager Instance { get; private set; }

        private string SaveFilePath => Path.Combine(Application.persistentDataPath, "last_city_save.json");

        public SaveData CurrentSaveData { get; private set; } = new SaveData();

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

        public void SaveGame()
        {
            try
            {
                string json = JsonUtility.ToJson(CurrentSaveData, true);
                File.WriteAllText(SaveFilePath, json);
                Debug.Log($"[SaveManager] Saved game successfully to: {SaveFilePath}");
            }
            catch (Exception ex)
            {
                Debug.LogError($"[SaveManager] Failed to save game: {ex.Message}");
            }
        }

        public bool LoadGame()
        {
            if (!File.Exists(SaveFilePath))
            {
                Debug.LogWarning("[SaveManager] Save file not found.");
                return false;
            }

            try
            {
                string json = File.ReadAllText(SaveFilePath);
                CurrentSaveData = JsonUtility.FromJson<SaveData>(json);
                Debug.Log($"[SaveManager] Loaded game save v{CurrentSaveData.saveVersion}");
                return true;
            }
            catch (Exception ex)
            {
                Debug.LogError($"[SaveManager] Failed to load save file: {ex.Message}");
                return false;
            }
        }
    }
}
