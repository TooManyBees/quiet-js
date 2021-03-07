<script>
  import { createEventDispatcher } from "svelte";
  export let selected = "draw";
  const tools = ["draw", "zoom", "pan"];

  const dispatch = createEventDispatcher();

  function expandCanvas() {
    dispatch("expand-canvas");
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
</style>

<div id="tool-palette">
  {#each tools as tool}
    <label>
      <input
        type="radio"
        bind:group={selected}
        value={tool}
    >{tool}</label>
  {/each}
  <button on:click={expandCanvas}>Expand</button>
</div>
