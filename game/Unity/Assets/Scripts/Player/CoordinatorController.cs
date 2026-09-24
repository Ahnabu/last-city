using UnityEngine;
using LastCity.Interaction;

namespace LastCity.Player
{
    [RequireComponent(typeof(CharacterController))]
    public class CoordinatorController : MonoBehaviour
    {
        [Header("Movement Speeds")]
        [SerializeField] private float walkSpeed = 3.5f;
        [SerializeField] private float runSpeed = 6.0f;
        [SerializeField] private float crouchSpeed = 1.8f;
        [SerializeField] private float rotationSpeed = 10f;
        [SerializeField] private float gravity = -9.81f;

        [Header("Interaction Sensing")]
        [SerializeField] private float interactionDistance = 2.5f;
        [SerializeField] private LayerMask interactableLayer;

        private CharacterController characterController;
        private Transform cameraTransform;
        private Vector3 velocity;

        public bool IsCrouching { get; private set; }
        public bool IsRunning { get; private set; }
        public IInteractable CurrentFocusInteractable { get; private set; }

        private void Awake()
        {
            characterController = GetComponent<CharacterController>();
            if (Camera.main != null)
            {
                cameraTransform = Camera.main.transform;
            }
        }

        private void Update()
        {
            HandleMovement();
            DetectInteractables();
            HandleInput();
        }

        private void HandleMovement()
        {
            float horizontal = Input.GetAxisRaw("Horizontal");
            float vertical = Input.GetAxisRaw("Vertical");
            Vector3 direction = new Vector3(horizontal, 0f, vertical).normalized;

            IsRunning = Input.GetKey(KeyCode.LeftShift);
            if (Input.GetKeyDown(KeyCode.C)) IsCrouching = !IsCrouching;

            float currentSpeed = IsCrouching ? crouchSpeed : (IsRunning ? runSpeed : walkSpeed);

            if (direction.magnitude >= 0.1f)
            {
                float targetAngle = Mathf.Atan2(direction.x, direction.z) * Mathf.Rad2Deg;
                if (cameraTransform != null)
                {
                    targetAngle += cameraTransform.eulerAngles.y;
                }

                Quaternion targetRotation = Quaternion.Euler(0f, targetAngle, 0f);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);

                Vector3 moveDir = Quaternion.Euler(0f, targetAngle, 0f) * Vector3.forward;
                characterController.Move(moveDir.normalized * (currentSpeed * Time.deltaTime));
            }

            // Gravity
            if (characterController.isGrounded && velocity.y < 0)
            {
                velocity.y = -2f;
            }
            velocity.y += gravity * Time.deltaTime;
            characterController.Move(velocity * Time.deltaTime);
        }

        private void DetectInteractables()
        {
            Ray ray = new Ray(transform.position + Vector3.up * 1.0f, transform.forward);
            if (Physics.Raycast(ray, out RaycastHit hit, interactionDistance, interactableLayer))
            {
                if (hit.collider.TryGetComponent(out IInteractable interactable))
                {
                    CurrentFocusInteractable = interactable;
                    return;
                }
            }
            CurrentFocusInteractable = null;
        }

        private void HandleInput()
        {
            if (Input.GetKeyDown(KeyCode.E) && CurrentFocusInteractable != null)
            {
                PlayerContext ctx = new PlayerContext(gameObject);
                if (CurrentFocusInteractable.CanInteract(ctx))
                {
                    CurrentFocusInteractable.Interact(ctx);
                }
            }
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.cyan;
            Gizmos.DrawRay(transform.position + Vector3.up * 1.0f, transform.forward * interactionDistance);
        }
    }
}
