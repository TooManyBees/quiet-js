<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const possibleWeeks = [1, 2, 3, 4, 5, 6];
  let weeks = 1;
  let description = "";
  export let project;

  function handleSubmit(event) {
    event.preventDefault();
    dispatch("place-project", {
      weeks,
      description,
      x: project.x,
      y: project.y,
    });
  }
</script>

<style>
  input[type="radio"] {
    display: none;
  }

  .week-selector {
    font-family: Dicier;
    font-variant-ligatures: discretionary-ligatures;
  }
</style>

<h2>New Project</h2>
<form on:submit={handleSubmit}>
  <div class="week-selector">
    {#each possibleWeeks as n}
      <label class:selected={weeks === n}>
        <input type="radio" bind:group={weeks} value={n}>
        {n}
      </label>
    {/each}
  </div>
  <input type="text" bind:value={description}>
  <input type="submit">
</form>
