<script>
  import { createEventDispatcher } from "svelte";
  import CancelButton from "./Modal/CancelButton.svelte";

  const dispatch = createEventDispatcher();

  let wrapper;

  function cancel() {
    dispatch("cancel");
  }

  function cancelOnWrapper(e) {
    if (event.target === wrapper) {
      cancel();
    }
  }
</script>

<style>
  .wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  .modal {
    position: relative;
    background-color: var(--bg-med);
    border: 0.25rem solid var(--outline);
    border-radius: 5px;
    padding: 1rem;
    flex: 1;
    max-width: 30rem;
  }
</style>

{#if $$slots.default}
  <div class="wrapper" bind:this={wrapper} on:click={cancelOnWrapper}>
    <div class="modal">
      <CancelButton onclick={cancel} />
      <slot />
    </div>
  </div>
{/if}
