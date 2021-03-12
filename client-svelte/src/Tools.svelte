<script>
  import { createEventDispatcher } from "svelte";
  export let selected = "draw";
  export let yourTurn;
  const tools = ["draw", "zoom", "pan", "project"];
  let selectedButton = "draw";
  let selectedOverride = null;
  $: {
    selected = selectedOverride || selectedButton;
  }

  const dispatch = createEventDispatcher();

  function expandCanvas() {
    dispatch("expand-canvas");
  }

  function handleKeydown(e) {
    if (event.key === " ") {
      selectedOverride = "pan";
    }
  }

  function handleKeyup(e) {
    if (event.key === " ") {
      selectedOverride = null;
    }
  }
</script>

<style>
  #tool-palette {
    background-color: rgba(0, 0, 0, 0.25);
    border-radius: 1rem;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  #tool-palette > * {
    margin: 0 0.5rem;
  }

  input[type="radio"] {
    display: none;
  }

  button {
    margin: 0;
  }

  label, button {
    cursor: pointer;
  }

  .selected {
    text-decoration: underline;
  }

  .divider {
    border-right: 1px solid #333;
    height: 1.5rem;
  }
</style>

<svelte:window
  on:keydown={handleKeydown}
  on:keyup={handleKeyup}
/>

<div id="tool-palette">
  {#each tools as tool}
    <label class:selected={tool === selected}>
      <input
        type="radio"
        bind:group={selectedButton}
        value={tool}
      >
      {tool}
    </label>
  {/each}
  <button on:click={expandCanvas}>Expand</button>
  {#if yourTurn}

  {/if}
</div>
