<script>
  import { createEventDispatcher } from "svelte";
  export let selected = "draw";
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

  label {
    border-radius: 50%;
    padding: 4px;
  }

  label, button {
    cursor: pointer;
  }

  .selected {
    background-color: rgba(236, 135, 97, 0.4);
  }

  img {
    width: 2rem;
    height: 2rem;
    display: block;
  }

  img.magnifier {
    position: relative;
    top: 3px;
    left: 1px;
  }
</style>

<svelte:window
  on:keydown={handleKeydown}
  on:keyup={handleKeyup}
/>

<div id="tool-palette">
  <label class:selected={selected === "draw"}>
    <input type="radio" bind:group={selectedButton} value="draw">
    <img src="/icons/pencil.svg" alt="pencil" title="Draw">
  </label>
  <label class:selected={selected === "erase"}>
    <input type="radio" bind:group={selectedButton} value="erase">
    <img src="/icons/eraser.svg" alt="eraser" title="Erase">
  </label>
  <label class:selected={selected === "zoom"}>
    <input type="radio" bind:group={selectedButton} value="zoom">
    <img class="magnifier" src="/icons/zoom-in.svg" alt="magnifying glass with plus" title="Zoom In">
  </label>
  <label class:selected={selected === "pan"}>
    <input type="radio" bind:group={selectedButton} value="pan">
    <img src="/icons/move-selector.svg" alt="Cross with arrows pointing in 4 directions" title="Pan">
  </label>
  <label class:selected={selected === "project"}>
    <input type="radio" bind:group={selectedButton} value="project">
    <img src="/icons/dice.svg" alt="6 sided die" title="Place new project">
  </label>
  <button on:click={expandCanvas}>Expand map borders</button>
</div>
