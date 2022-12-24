<script>
  export let userNames;
  export let history;
</script>

<style>
  ol {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-x: hidden;
  }
  .empty {
    display: none;
  }
  .card {
    font-family: Dicier;
    font-variant-ligatures: discretionary-ligatures;
    display: inline-block;
    min-width: 2.5rem;
    text-align: right;
  }
  .continued {
    text-align: center;
  }
</style>

<div class:empty={history.length === 0}>
  <hr>
  <ol>
    {#each history.slice(0, 5) as turn}
      <li>
        <span class="card">{turn.drawn}</span> {userNames.get(turn.userId)}
      </li>
    {/each}
    {#if history.length > 5}
      <li class="continued">...</li>
    {/if}
  </ol>
</div>
