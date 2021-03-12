<script>
  export let weeks;
  export let x;
  export let y;
  export let description = undefined;
  $: diceCode = parseInt(weeks, 10) || 0;
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
  .description {
    display: none;
  }
  .project:hover .description {
    display: block;
  }
</style>

<div class="project" style={`top: calc(50% + ${y}px); left: calc(50% + ${x}px);`}>
  <span class="dice">{diceCode}</span>
  {#if description}
    <p class="description">{description}</p>
  {/if}
</div>
