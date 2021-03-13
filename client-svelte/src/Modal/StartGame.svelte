<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<h2>Start</h2>
<div class="choices">
  <button on:click={() => dispatch("start-game", { fleeting: false })}>52 turns</button>
  <button on:click={() => dispatch("start-game", { fleeting: true })}>36 turns</button>
  <button on:click={() => dispatch("cancel")}>Cancel</button>
</div>

<style>
  h2 {
    margin: 0 0 1rem 0;
    text-align: center;
  }

  .choices {
    display: flex;
    justify-content: center;
  }

  .choices > :not(:last-child) {
    margin-right: 1rem;
  }
</style>
