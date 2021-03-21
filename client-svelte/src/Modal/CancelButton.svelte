<script>
  export let onclick;
</script>

<style>
  button {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background-color: transparent;
    border: none;
    padding: 0;
    transform: translate(50%, -50%);
    cursor: pointer;
  }

  img {
    width: 1.5rem;
    height: 1.5rem;
    display: block;
  }
</style>

<button on:click={onclick}>
  <img src="/icons/cancel.svg" alt="Circle with x" title="Cancel">
</button>
