<script>
  import { fly } from "svelte/transition";
  import CancelButton from "../Game/Modal/CancelButton.svelte";
  import Credits from "./Credits.svelte";
  import HowToPlay from "./HowToPlay.svelte";
  let aboutVisible = false;
  let howToVisible = false;
</script>

<style>
  aside {
    border-top: 0.25rem solid var(--outline);
    background-color: var(--bg-med);
    padding: 1rem;
    transform: translate(0); /* Appear above Canvas which is transformed */
    position: fixed;
    left: 0;
    bottom: 0;
    box-sizing: border-box;
    max-height: 50vh;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h1 {
    margin: 0;
  }

  .buttons {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
  }

  .open-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .open-button img {
    width: 2rem;
    height: 2rem;
    display: block;
  }

  .label {
    margin-left: 0.5rem;
  }

  @media (max-width: 500px) {
    .label {
      display: none;
    }
  }

  .underlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .scroll {
    overflow-y: auto;
  }
</style>

<div class="buttons">
  <button class="open-button" on:click={() => howToVisible = true}>
    <img src="/icons/question-mark.svg" alt="Question mark">
    <span class="label">How to play</span>
  </button>
  <button class="open-button" on:click={() => aboutVisible = true}>
    <img src="/icons/info.svg" alt="Info bubble">
    <span class="label">About</span>
  </button>
</div>
{#if howToVisible}
  <div class="underlay" on:click={() => howToVisible = false}></div>
  <aside transition:fly={{ y: 200, duration: 250 }}>
    <header>
      <h1>How to play <a href="https://buriedwithoutceremony.com/the-quiet-year" target="_blank">The Quiet Year</a> remotely</h1>
      <CancelButton onclick={() => howToVisible = false} />
    </header>

    <div class="scroll">
      <HowToPlay />
    </div>
  </aside>
{/if}
{#if aboutVisible}
  <div class="underlay" on:click={() => aboutVisible = false}></div>
  <aside transition:fly={{ y: 200, duration: 250 }}>
    <header>
      <h1>About this site</h1>
      <CancelButton onclick={() => aboutVisible = false} />
    </header>

    <div class="scroll">
      <Credits />
    </div>
  </aside>
{/if}
