using UnityEngine;

namespace LastCity.Interaction
{
    /// <summary>
    /// Core interface implemented by all interactive objects in LAST CITY (doors, containers, terminals, NPCs, etc.).
    /// </summary>
    public interface IInteractable
    {
        /// <summary>
        /// Prompt string shown in HUD when player looks at/approaches this object.
        /// </summary>
        string GetPrompt();

        /// <summary>
        /// Evaluates whether interaction can currently occur given the player context.
        /// </summary>
        bool CanInteract(PlayerContext ctx);

        /// <summary>
        /// Triggers the interaction behavior.
        /// </summary>
        void Interact(PlayerContext ctx);
    }

    /// <summary>
    /// Context data passed to interactables during evaluation and execution.
    /// </summary>
    public class PlayerContext
    {
        public GameObject PlayerGameObject { get; set; }
        public Vector3 PlayerPosition { get; set; }
        public string ActiveItemId { get; set; }

        public PlayerContext(GameObject player)
        {
            PlayerGameObject = player;
            PlayerPosition = player != null ? player.transform.position : Vector3.zero;
        }
    }
}
