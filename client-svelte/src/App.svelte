<script>
  import Game from "./Game/Game.svelte";
  import Welcome from "./About/Welcome.svelte";
</script>

{#if window.location.pathname.startsWith("/room/")}
  <Game />
{:else}
  <Welcome />
{/if}
