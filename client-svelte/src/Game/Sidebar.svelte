<script>
  import { createEventDispatcher } from "svelte";
  export let selfId;
  export let currentId;
  $: yourTurn = selfId === currentId;

  const dispatch = createEventDispatcher();

  function passTurn() {
    dispatch(yourTurn ? "pass-turn" : "pass-others-turn");
  }
</script>

<style>
  .pane {
    position: fixed;
    top: 0;
    right: 0;

    width: 12rem;

    border-bottom-left-radius: 0.5rem;
    padding: 0 0 0.25rem 0.25rem;
    background-image: linear-gradient(20deg, var(--gradient-middle), var(--gradient-top));
  }
  .pane.your-turn {
    background-image: none;
    background-color: var(--outline);
  }
  .wrapper {
    border-bottom-left-radius: 0.5rem;
    border-color: var(--outline);
    border-width: 0 0 4px 4px;
    overflow: hidden;

    background-color: var(--bg-med);

    padding: 0.5rem 1rem;
  }

  /*.collapsible {
    transition: height 0.25s;
  }*/

</style>

<div class="pane" class:your-turn={yourTurn}>
  <div class="wrapper">
    <slot />
  </div>
</div>
