<script lang="ts">
  type ToastProps = {
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  };

  let { message, type, visible }: ToastProps = $props();
</script>

{#if visible}
  <div class="toast {type}">
    {message}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #333;
    color: white;
    padding: 1rem 2rem;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    z-index: 1000;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  }
  
  .toast.success {
    background: #2ecc71;
  }
  
  .toast.error {
    background: #e74c3c;
  }

  @keyframes slideIn {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
</style>
