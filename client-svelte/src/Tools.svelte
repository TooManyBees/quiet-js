<script>
  export let selected = "draw";
  const tools = ["draw", "zoom", "pan"];
</script>

<style>
  #tool-palette {
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
</div>
