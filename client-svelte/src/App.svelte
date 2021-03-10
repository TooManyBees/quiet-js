<script>
	import { onMount } from "svelte";
	import { connect, userId, userIds, sendMessage, broadcast } from "./connection.js";
	import { getUserName, setUserName } from "./storage.js";
	import Canvas from "./Canvas.svelte";
	import Tools from "./Tools.svelte";
	import Users from "./Users.svelte";

	userId.subscribe((val) => {
		if (val != null) {
			userNames.set(val, userName);
		}
	});

	const userNames = new Map();
	let userName = getUserName() || `cool user ${~~(Math.random() * 100)}`;
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
		setUserName(name);
		broadcast({ type: "change-name", name });
	}

	function handleDrawMulti(event) {
		broadcast({ type: "drawmulti", ...event.detail });
	}

	function expandCanvas() {
		canvas.expand();
		broadcast({ type: "expand-canvas" });
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
		case "expand-canvas":
			canvas.expand();
			break;
		default:
			console.log(`Unkonwn message from ${peerId}: ${data.type}`);
		}
	}

	onMount(() => connect(onPeerData));
</script>

<main>
	<Canvas
		width={256}
		height={256}
		bind:this={canvas}
		on:drawmulti={handleDrawMulti}
		tool={selectedTool}
	/>
	<Tools
		bind:selected={selectedTool}
		on:expand-canvas={expandCanvas}
	/>
	<Users
		selfId={$userId}
		users={users}
		on:change-name={(event) => changeMyName(event.detail.name)}
	/>
</main>

<style>
	main {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>
