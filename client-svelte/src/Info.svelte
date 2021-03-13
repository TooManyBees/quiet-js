<script>
  import { fly } from "svelte/transition";
  export let visible = true;
</script>

<style>
  aside {
    background-color: white;
    padding: 1rem;
    transform: translate(0); /* Appear above Canvas which is transformed */
    position: fixed;
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

  .open-button {
    position: absolute;
    bottom: 0;
    left: 0;
  }

  .card {
    font-family: Dicier;
    font-variant-ligatures: discretionary-ligatures;
    line-height: 1;
  }
</style>

<button class="open-button" on:click={() => visible = true}>About</button>
{#if visible}
  <aside transition:fly={{ y: 200, duration: 250 }}>
    <header>
      <h1>How to play The Quiet Year remotely</h1>
      <button on:click={() => visible = false}>Close</button>
    </header>

    <p>
      Before playing, bring up <a href="https://buriedwithoutceremony.com/wp-content/uploads/2019/08/The-Quiet-Year-Oracle.pdf" target="_blank">The Oracle</a> for reference.
    </p>

    <p>
      Hop on a voice chat with your friends. One person join a random room on this site, then share the link.
    </p>

    <p>
      Anyone can draw, erase, or place projects at any time. Anyone can join the room at any time and get added to the turn order. Anyone can end the current turn early and advance to the next player. The only action that's restricted by being your turn is drawing a card. Due to this lack of guard rails, I only recommend playing with people you'd feel comfortable sitting across a table from.
    </p>

    <p>
      On your turn, click the Draw button to draw a card. Announce your action to your friends, because they can't see it. Projects will automatically tick down when you end your turn, but it's up to you to remove them when appropriate. The only other automatic actions are to shuffle a virtual deck for you, and discard cards when <span class="card">KING_DIAMONDS</span> is drawn.
    </p>

    <h2>Credits</h2>

    <p>
      <a href="https://buriedwithoutceremony.com/the-quiet-year" target="_blank">The Quiet Year</a> is created by Avery Alder. This site is in no way affiliated with or endorsed by her. You will still need the game's rules (available as a <a href="https://store.buriedwithoutceremony.com/collections/frontpage/products/the-quiet-year-pdf" target="_blank">PDF</a> or <a href="https://store.buriedwithoutceremony.com/collections/frontpage/products/the-quiet-year" target="_blank">physical media</a>) to play.
    </p>

    <p>
      This app is created by <a href="https://www.toomanybees.com" target="_blank">Jess Bees</a>. The drawing mechanics were aided by a very handy <a href="https://dev.to/nyxtom/realtime-collaborative-drawing-with-canvas-and-webrtc-2d01" target="_blank">explainer by Tom Holloway</a>.
    </p>

    <p>
      The font for dice and playing card symbols is <a href="https://speakthesky.itch.io/typeface-dicier" target="_blank">Dicier</a> by Speak the Sky, used under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0 license</a>.
    </p>
  </aside>
{/if}
