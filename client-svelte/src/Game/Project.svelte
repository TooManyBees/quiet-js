<script>
  import { createEventDispatcher } from "svelte";

  export let id;
  export let weeks;
  export let x;
  export let y;
  export let description = undefined;
  $: diceCode = Math.min(6, Math.max(0, parseInt(weeks, 10) || 0));

  const dispatch = createEventDispatcher();

  function resolveProject(event) {
    event.stopPropagation();
    dispatch("resolve-project", { id });
  }
</script>

<style>
  .project {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: pointer;
  }
  .dice {
    font-family: Dicier;
    font-variant-ligatures: discretionary-ligatures;
  }
  .popup {
    display: none;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  .project:hover .popup {
    display: block;
  }
</style>

<div class="project" style={`top: calc(50% + ${y}px); left: calc(50% + ${x}px);`}>
  <span class="dice">{diceCode}</span>
  <div class="popup">
    {#if description}
      <p class="description">{description}</p>
    {/if}
    <button on:click={resolveProject}>Resolve</button>
  </div>
</div>
