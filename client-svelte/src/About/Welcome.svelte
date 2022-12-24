<script>
  import Credits from "./Credits.svelte";
  import Frame from "../Frame.svelte";
  import HowToPlay from "./HowToPlay.svelte";
  import Info from "./Info.svelte";

  async function createNewRoom() {
    let resp = await fetch("/api/new");
    if (resp.ok) {
      let data = await resp.json();
      window.location = `/room/${data.slug}`;
    }
  }
</script>

<style>
  .main {
    padding: 1rem;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: auto;
  }

  h1, h2 {
    color: var(--headline);
  }

  .dotdotdot {
    color: var(--headline);
    font-weight: bold;
    font-size: 2rem;
    text-align: center;
  }
</style>

<Frame>
  <div class="main">
    <h1>The Socially Distanced Year</h1>

    <p>
      <button id="create-new" on:click={createNewRoom}>Create a new room</button>
      and share the URL with participants
    </p>

    <div role="presentation" class="dotdotdot">• • •</div>

    <h2>How to play The Quiet Year remotely</h2>

    <HowToPlay />

    <div role="presentation" class="dotdotdot">• • •</div>

    <Credits />
  </div>
</Frame>
