using System;
using UnityEngine;

namespace LastCity.Core
{
    public enum GameState
    {
        Boot,
        MainMenu,
        Exploration,
        Dialogue,
        Building,
        Paused
    }

    public class GameStateManager : MonoBehaviour
    {
        public static GameStateManager Instance { get; private set; }

        public GameState CurrentState { get; private set; } = GameState.Boot;

        public event Action<GameState, GameState> OnGameStateChanged;

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

        public void ChangeState(GameState newState)
        {
            if (CurrentState == newState) return;

            GameState previousState = CurrentState;
            CurrentState = newState;

            Debug.Log($"[GameStateManager] State changed: {previousState} -> {newState}");
            OnGameStateChanged?.Invoke(previousState, newState);
        }
    }
}
