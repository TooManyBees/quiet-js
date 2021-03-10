<script>
  import { createEventDispatcher } from "svelte";
  export let selected = "draw";
  const tools = ["draw", "zoom", "pan"];
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
      e.preventDefault();
      selectedOverride = "pan";
    }
  }

  function handleKeyup(e) {
    if (event.key === " ") {
      e.preventDefault();
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
    width: 15rem;
    position: fixed;
    top: 10px;
    left: 10px;
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
    >{tool}</label>
  {/each}
  <button on:click={expandCanvas}>Expand</button>
</div>
