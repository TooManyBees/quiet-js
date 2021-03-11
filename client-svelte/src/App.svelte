<script>
	import { onMount } from "svelte";
	import { connect, userId, userIds, sendMessage, broadcast } from "./connection.js";
	import { getUserName, setUserName } from "./storage.js";
	import { initialState, reducer } from "./reducer.js";
	import Canvas from "./Canvas.svelte";
	import Modal from "./Modal.svelte";
	import StartGame from "./Modal/StartGame.svelte";
	import Tools from "./Tools.svelte";
	import Users from "./Users.svelte";

	userId.subscribe((val) => {
		if (val != null) {
			userNames.set(val, userName);
		}
	});

	const userNames = new Map();
	const contempt = new Map();
	let state = initialState();
	let userName = getUserName() || `cool user ${~~(Math.random() * 100)}`;
	$: users = $userIds.map(id => ({
		id,
		name: userNames.get(id) || id,
		contempt: contempt.get(id) || 0,
	}));

	let needHistory = true;
	let canvas;
	let selectedTool = "draw";
	$: currentId = $userIds[state.turnNumber % $userIds.length];
	$: yourTurn = $userId === currentId;
	$: drawn = state.yourTurn && state.yourTurn.drawn;

	function initiateStartGame() {
		state = reducer(state, { type: "game:initiate-start" });
	}

	function startGame(event) {
		const fleeting = !!event.detail.fleeting;
		state = reducer(state, { type: "game:start", payload: { fleeting } });
		broadcast({ type: "update-state", state });
	}

	function drawCard() {
		state = reducer(state, { type: "game:draw-card" });
	}

	function passTurn() {
		state = reducer(state, { type: "game:next-turn" });
		broadcast({ type: "update-state", state });
	}

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
		case "update-state":
			state = data.state;
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
	<div class="wrapper">
		<Tools
			bind:selected={selectedTool}
			on:expand-canvas={expandCanvas}
			yourTurn={yourTurn}
		/>
		<Users
			selfId={$userId}
			users={users}
			currentId={currentId}
			drawn={drawn}
			phase={state.phase}
			on:change-name={(event) => changeMyName(event.detail.name)}
			on:start-game={initiateStartGame}
			on:draw-card={drawCard}
			on:pass-turn={passTurn}
		/>
	</div>
	{#if state.phase === "starting"}
		<Modal>
			<StartGame on:start-game={startGame} />
		</Modal>
	{/if}
</main>

<style>
	main {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	.wrapper {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		box-sizing: border-box;
		padding: 10px;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		pointer-events: none;
	}
	.wrapper > :global(*) {
		pointer-events: auto;
	}
</style>
