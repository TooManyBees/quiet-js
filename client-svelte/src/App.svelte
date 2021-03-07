<script>
	import { onMount } from "svelte";
	import { connect, userId, userIds, sendMessage, broadcast } from "./connection.js";
	import Canvas from "./Canvas.svelte";
	import Tools from "./Tools.svelte";
	import Users from "./Users.svelte";

	userId.subscribe((val) => {
		if (val != null) {
			userNames.set(val, userName);
		}
	});

	const userNames = new Map();
	let userName = `cool user ${~~(Math.random() * 100)}`;
	$: users = $userIds.map(id => ({ id, name: userNames.get(id) || id }));

	let needHistory = true;
	let canvas;
	let selectedTool = "draw";

	function changeName(userId, name) {
		userNames.set(userId, name);
		userNames = userNames;
	}

	function changeMyName(name) {
		userNames.set($userId, name);
		userNames = userNames;
		broadcast({ type: "change-name", name });
	}

	function handleDrawMulti(event) {
		broadcast({ type: "drawmulti", ...event.detail });
	}

	function onPeerData(peerId, buffer) {
		let data;
		try {
			data = JSON.parse(buffer);
			console.log(data);
		} catch (e) {
			console.error(`Error parsing JSON`, buffer);
		}

		switch (data.type) {
		case "introduce-yourself":
			sendMessage(peerId, { type: "change-name", name: userName });
		case "new-connection":
			if (needHistory) {
				sendMessage(peerId, { type: "request-history" });
			}
			userNames[userId] = userName;
			sendMessage(peerId, { type: "change-name", name: userName });
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
		case "change-name":
			changeName(peerId, data.name);
			break;
		default:
			console.log(`Unkonwn message from ${peerId}: ${data.type}`);
		}
	}

	onMount(() => connect(onPeerData));
</script>

<main>
	<Tools bind:selected={selectedTool} />
	<Canvas
		width={300}
		height={300}
		bind:this={canvas}
		on:drawmulti={handleDrawMulti}
		tool={selectedTool}
	/>
	<!-- <p>You are {$userId}</p>
	<p>{JSON.stringify(Array.from(userNames))}</p>
	<p>{JSON.stringify(Array.from($userIds))}</p> -->
	<Users
		selfId={$userId}
		users={users}
		on:change-name={(event) => changeMyName(event.detail.name)}
	/>
</main>

<style>
	main {
		/*text-align: center;*/
		/*padding: 1em;*/
		/*max-width: 240px;*/
		/*margin: 0 auto;*/
	}
</style>
