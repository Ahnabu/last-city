using UnityEngine;
using LastCity.Core;

namespace LastCity.Core
{
    /// <summary>
    /// Master singleton bootstrap component. Ensures manager components exist and initializes event listeners.
    /// </summary>
    public class GameBootstrap : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private bool autoStartExplorationOnBoot = true;

        private void Start()
        {
            Debug.Log("==================================================");
            Debug.Log("          LAST CITY — GAME SIMULATION INIT        ");
            Debug.Log("==================================================");

            EnsureManagerExists<GameStateManager>("GameStateManager");
            EnsureManagerExists<SaveManager>("SaveManager");

            if (autoStartExplorationOnBoot)
            {
                GameStateManager.Instance.ChangeState(GameState.Exploration);
            }
        }

        private T EnsureManagerExists<T>(string name) where T : MonoBehaviour
        {
            T manager = FindFirstObjectByType<T>();
            if (manager == null)
            {
                GameObject go = new GameObject(name);
                manager = go.AddComponent<T>();
            }
            return manager;
        }

        /// <summary>
        /// Entry point for configuration injection from Next.js JS bridge.
        /// </summary>
        public void ReceiveConfig(string configJson)
        {
            Debug.Log($"[GameBootstrap] Received JS Bridge config: {configJson}");
        }
    }
}
