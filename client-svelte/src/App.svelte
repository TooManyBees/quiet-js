<script>
	import { onMount } from "svelte";
	import { connect, peers, sendMessage, broadcast } from "./connection.js";
	import Canvas from "./Canvas.svelte";

	function handleDrawMulti(event) {
		broadcast({ type: "drawmulti", ...event.detail });
	}

	let needHistory = true;

	function onPeerData(peerId, buffer) {
		let data;
		try {
			data = JSON.parse(buffer);
		} catch (e) {
			console.error(`Error parsing JSON`, buffer);
		}

		switch (data.type) {
		case "new-connection":
			if (needHistory) {
				sendMessage(peerId, { type: "request-history" });
			}
			break;
		case "draw":
			canvas.draw([data.point]);
			break;
		case "drawmulti":
			canvas.draw(data.points);
			break;
		case "receive-history":
			if (needHistory) {
				canvas.setState(data.canvas);
				needHistory = false;
			}
			break;
		case "request-history":
			const canvasState = canvas.getState();
			sendMessage(peerId, { type: "receive-history", canvas: canvasState });
			break;
		default:
			console.log(`Unkonwn message from ${peerId}: ${data.type}`);
		}
	}

	let canvas;

	onMount(() => connect(onPeerData));
</script>

<main>
	<h1>Be vewy, vewy quiet.</h1>
	<p>Check out {JSON.stringify($peers)}</p>
	<Canvas width={300} height={300} bind:this={canvas} on:drawmulti={handleDrawMulti} />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
