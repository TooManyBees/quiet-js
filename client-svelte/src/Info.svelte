<script>
  import { fly } from "svelte/transition";
  import CancelButton from "./Modal/CancelButton.svelte";
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
    max-height: 100vh;
    overflow-y: auto;
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

  .card {
    font-family: Dicier;
    font-variant-ligatures: discretionary-ligatures;
    line-height: 1;
  }

  .underlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .tools {
    list-style: none;
    padding-left: 0;
  }

  .tools img {
    width: 16px;
    height: 16px;
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

    <p>For rules, <a href="https://store.buriedwithoutceremony.com/collections/frontpage/products/the-quiet-year-pdf" target="_blank">get a copy</a>. Before playing, bring up <a href="https://buriedwithoutceremony.com/wp-content/uploads/2019/08/The-Quiet-Year-Oracle.pdf" target="_blank">The Oracle</a> for reference.
    </p>

    <p>
      Hop on a voice chat with your friends. One person join a random room on this site, then share the link. The first person to click <em>Start game</em> takes the first turn. The game will shuffle a deck of 52 or 36 cards for you.
    </p>

    <p>
      On your turn, click <em>Draw card</em> to draw a card. No one will see it except you, so announce it to the other players. When you're done, click <em>Pass turn</em>.
    </p>

    <p>
      The game will handle <span class="card">KING_DIAMONDS</span> and reducing project dice on its own. It's on the players to remove projects when appropriate.
    </p>

    <p>
      Anyone can draw, erase, or place projects at any time. Anyone can join the room at any time and get added to the turn order. Anyone can click <em>Pass turn</em> to end the current turn early and advance to the next player. The lack of guard rails is because this app is a facilitator, not a dungeon master. I only recommend playing with people you'd feel comfortable sitting across a table from.
    </p>
    <h2>Tools</h2>
    <ul class="tools">
      <li>
        <img src="/icons/move-selector.svg" alt="Cross with arrows pointing in 4 directions">
        Move the map around
      </li>
      <li>
        <img src="/icons/pencil.svg" alt="pencil">
        Draw on the map
      </li>
      <li>
        <img src="/icons/eraser.svg" alt="eraser">
        Erase on the map
      </li>
      <li>
        <img src="/icons/zoom-in.svg" alt="magnifying glass with plus">
        <img src="/icons/zoom-out.svg" alt="magnifying glass with minus">
        Zoom in or out
      </li>
      <li>
        <img src="/icons/dice.svg" alt="6 sided die">
        Place a project on the map
      </li>
    </ul>
  </aside>
{/if}
{#if aboutVisible}
  <div class="underlay" on:click={() => aboutVisible = false}></div>
  <aside transition:fly={{ y: 200, duration: 250 }}>
    <header>
      <h1>About this site</h1>
      <CancelButton onclick={() => aboutVisible = false} />
    </header>

    <p>
      <a href="https://buriedwithoutceremony.com/the-quiet-year" target="_blank">The Quiet Year</a> is created by Avery Alder. This site is in no way affiliated with or endorsed by her. You will still need the game's rules (available as a <a href="https://store.buriedwithoutceremony.com/collections/frontpage/products/the-quiet-year-pdf" target="_blank">PDF</a> or <a href="https://store.buriedwithoutceremony.com/collections/frontpage/products/the-quiet-year" target="_blank">physical media</a>) to play.
    </p>

    <p>
      This app is created by <a href="https://www.toomanybees.com" target="_blank">Jess Bees</a>. The drawing mechanics were aided by a very handy <a href="https://dev.to/nyxtom/realtime-collaborative-drawing-with-canvas-and-webrtc-2d01" target="_blank">explainer by Tom Holloway</a>.
    </p>

    <p>
      The font for dice and playing card symbols is <a href="https://speakthesky.itch.io/typeface-dicier" target="_blank">Dicier</a> by Speak the Sky, used under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0 license</a>. Icons by <a href="https://www.freepik.com" target="_blank">Freepik</a> from <a href="https://www.flaticon.com/" target="_blank">www.flaticon.com</a>.
    </p>
  </aside>
{/if}
