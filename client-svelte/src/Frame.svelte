<script>
  export let alert = false;
</script>

<style>
  main {
    width: 100%;
    height: 100%;
    overflow: hidden;
    touch-action: none;
    box-sizing: border-box;
    padding: 0.25rem;

    background-image: linear-gradient(20deg, var(--gradient-bottom), var(--gradient-middle) 30%, var(--gradient-middle) 70%, var(--gradient-top));
  }
  main.alert {
    background-color: var(--accent);
    background-image: none;
    --outline: var(--accent);
  }
  .frame {
    background-color: var(--bg-deep);
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 0.25rem;
  }
</style>

<main class:alert={alert}>
  <div class="frame">
    <slot />
  </div>
</main>
