<style>
  .wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.15);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  .modal {
    background-color: white;
    border-radius: 5px;
    padding: 1rem;
    flex: 1;
    max-width: 30rem;
  }
</style>

{#if $$slots.default}
  <div class="wrapper">
    <div class="modal">
      <slot />
    </div>
  </div>
{/if}
