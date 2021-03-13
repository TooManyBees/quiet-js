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

  function cancel(event) {
    event.preventDefault();
    dispatch("cancel");
  }
</script>

<style>
  h2 {
    margin: 0 0 0.5rem 0;
  }

  input[type="radio"] {
    display: none;
  }

  .week-selector {
    font-family: Dicier;
    font-variant-ligatures: discretionary-ligatures;
    font-size: 2rem;
    line-height: 2.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
  }

  .week-selector label {
    cursor: pointer;
    transition: font-size 0.25s;
    margin-right: 0.5rem;
  }

  .week-selector label.selected {
    font-size: 2.5rem;
  }

  .description {
    width: 100%;
    display: block;
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
  <input
    class="description"
    type="text"
    placeholder="Description"
    bind:value={description}
  >
  <input type="submit" value="Place Project">
  <button on:click={cancel}>Cancel</button>
</form>
