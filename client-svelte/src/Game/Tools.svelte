<script>
  import { createEventDispatcher } from "svelte";
  export let selected = "pan";
  let selectedButton = "pan";
  let selectedOverride = null;
  $: {
    selected = selectedOverride || selectedButton;
  }

  const dispatch = createEventDispatcher();

  function expandCanvas() {
    dispatch("expand-canvas");
  }

  function handleKeydown(e) {
    if (e.key === " ") {
      selectedOverride = "pan";
    } else if (e.key === "Alt") {
      switch (selected) {
      case "zoom-in":
        selectedOverride = "zoom-out";
        break;
      case "zoom-out":
        selectedOverride = "zoom-in";
        break;
      }
    }
  }

  function handleKeyup(e) {
    if (e.key === " ") {
      selectedOverride = null;
    } else if (e.key === "Alt") {
      switch (selected) {
      case "zoom-in":
      case "zoom-out":
        selectedOverride = null;
        break;
      }
    }
  }
</script>

<style>
  #tool-palette {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: fixed;
    top: 0.5rem;
    left: 0.5rem;
  }

  @media (min-width: 361px) {
    #tool-palette > :not(:first-child) {
      margin-left: 0.5rem;
    }
    #tool-palette > :not(:last-child) {
      margin-right: 0.5rem;
    }
  }
  @media (max-width: 360px) {
    #tool-palette > :not(:first-child) {
      margin-left: 0.25rem;
    }
    #tool-palette > :not(:last-child) {
      margin-right: 0.25rem;
    }
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

  .zoom-group {
    display: flex;
    flex-direction: column;
  }
  .zoom-group:hover .hidden {
    display: block;
  }
  .hidden {
    display: none;
  }
</style>

<svelte:window
  on:keydown={handleKeydown}
  on:keyup={handleKeyup}
/>

<div id="tool-palette">
  <label class:selected={selected === "pan"}>
    <input type="radio" bind:group={selectedButton} value="pan">
    <img src="/icons/move-selector.svg" alt="Cross with arrows pointing in 4 directions" title="Pan">
  </label>
  <label class:selected={selected === "draw"}>
    <input type="radio" bind:group={selectedButton} value="draw">
    <img src="/icons/pencil.svg" alt="pencil" title="Draw">
  </label>
  <label class:selected={selected === "erase"}>
    <input type="radio" bind:group={selectedButton} value="erase">
    <img src="/icons/eraser.svg" alt="eraser" title="Erase">
  </label>
  <div class="zoom-group">
    <label class:selected={selected === "zoom-in"} class:hidden={selected === "zoom-out"}>
      <input type="radio" bind:group={selectedButton} value="zoom-in">
      <img class="magnifier" src="/icons/zoom-in.svg" alt="magnifying glass with plus" title="Zoom In">
    </label>
    <label class:selected={selected === "zoom-out"} class:hidden={selected !== "zoom-out"}>
      <input type="radio" bind:group={selectedButton} value="zoom-out">
      <img class="magnifier" src="/icons/zoom-out.svg" alt="magnifying glass with minus" title="Zoom Out">
    </label>
  </div>
  <label class:selected={selected === "project"}>
    <input type="radio" bind:group={selectedButton} value="project">
    <img src="/icons/dice.svg" alt="6 sided die" title="Place new project">
  </label>
  <button on:click={expandCanvas}>Expand map borders</button>
</div>
