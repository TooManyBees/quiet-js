<script>
	import { onMount } from "svelte";
	import {
		connect,
		userId,
		userIds,
		sendMessage,
		broadcast,
		requestCanvas,
		sendCanvas,
	} from "./connection.js";
	import { getUserName, setUserName } from "./storage.js";
	import { initialState, reducer } from "./reducer.js";
	import Canvas from "./Canvas.svelte";
	import Info from "./Info.svelte";
	import Modal from "./Modal.svelte";
	import StartGame from "./Modal/StartGame.svelte";
	import PlacingProject from "./Modal/PlacingProject.svelte";
	import Tools from "./Tools.svelte";
	import Users from "./Users.svelte";

	userId.subscribe((val) => {
		if (val != null) {
			userNames.set(val, userName);
		}
	});

	const userNames = new Map();
	let state = initialState();
	let userName = getUserName() || `cool user ${~~(Math.random() * 100)}`;
	$: users = $userIds.map(id => ({
		id,
		name: userNames.get(id) || id,
	}));

	let needHistory = true;
	let canvas;
	let selectedTool = "draw";
	let showInfo = false;
	$: currentId = $userIds[state.turnNumber % $userIds.length];
	$: yourTurn = $userId === currentId;
	$: drawn = state.yourTurn.drawn;

	let pendingProject = null;

	function initiatePlaceProject(e) {
		pendingProject = e.detail;
	}

	function finishPlaceProject(e) {
		pendingProject = null;
		let lastId = 0;
		try {
			lastId = 1 + state.projects
				.map(p => p.id)
				.reduce((max, id) => Math.max(max, id));
		} catch (_) {}
		const project = { id: lastId, ...e.detail };
		placeProject(project);
		broadcast({ type: "place-project", project });
	}

	function cancelPlaceProject() {
		pendingProject = null;
	}

	function placeProject(project) {
		state = reducer(state, {
			type: "game:place-project", payload: { project },
		});
	}

	function finishResolveProject(e) {
		const id = e.detail.id;
		resolveProject(id);
		broadcast({ type: "resolve-project", id });
	}

	function resolveProject(id) {
		state = reducer(state, {
			type: "game:remove-project", payload: { id },
		});
	}

	let startingTurn = 0;

	function initiateStartGame(event) {
		startingTurn = event.detail.startingTurn;
		state = reducer(state, { type: "game:initiate-start" });
	}

	function startGame(event) {
		const fleeting = !!event.detail.fleeting;
		state = reducer(state, { type: "game:start", payload: {
			fleeting,
			startingTurn,
		}});
		broadcast({ type: "update-state", state });
	}

	function drawCard() {
		state = reducer(state, { type: "game:draw-card" });
	}

	function passYourTurn() {
		state = reducer(state, { type: "game:end-turn" });
		broadcast({ type: "update-state", state });
	}

	function passOthersTurn() {
		state = reducer(state, { type: "game:next-turn" });
		broadcast({ type: "update-state", state });
	}

	function changeName(userId, name) {
		userNames.set(userId, name);
		userNames = userNames;
	}

	function changeMyName(name) {
		userName = name;
		userNames.set($userId, name);
		userNames = userNames;
		setUserName(name);
		broadcast({ type: "change-name", name });
	}

	function handleDrawMulti(event) {
		broadcast({ type: "drawmulti", ...event.detail });
	}

	function expandCanvas() {
		const { width, height } = canvas.expand();
		state = reducer(state, { type: "canvas:expand", payload: { width, height }})
		broadcast({ type: "expand-canvas" });
	}

	function onPeerData(peerId, data) {
		console.debug("recv", data);
		switch (data.type) {
		case "introduce-yourself":
			needHistory = false;
			sendMessage(peerId, { type: "change-name", name: userName });
			break;
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
		case "request-history":
			sendMessage(peerId, {
				type: "update-state",
				state,
				theStoryThusFar: true,
			});
			break;
		case "send-canvas-data":
			const canvasState = canvas.getState();
			sendCanvas(peerId, canvasState.bytes);
			break;
		case "change-name":
			changeName(peerId, data.name);
			break;
		case "expand-canvas": {
			const { width, height } = canvas.expand();
			state = reducer(state, { type: "canvas:expand", payload: { width, height }});
			break;
		}
		case "place-project":
			placeProject(data.project);
			break;
		case "resolve-project":
			resolveProject(data.id);
			break;
		case "update-state":
			state = data.state;
			if (needHistory) {
				requestCanvas(peerId).then(bytes => {
					canvas.setBytes(
						state.canvasSize.width,
						state.canvasSize.height,
						bytes,
					);
				});
			}
			needHistory = false;
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
		on:place-project={initiatePlaceProject}
		on:resolve-project={finishResolveProject}
		tool={selectedTool}
		projects={state.projects}
	/>
	<div class="wrapper">
		<Tools
			bind:selected={selectedTool}
			on:expand-canvas={expandCanvas}
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
			on:pass-turn={passYourTurn}
			on:pass-others-turn={passOthersTurn}
		/>
	</div>
	{#if state.phase === "starting"}
		<Modal>
			<StartGame
				on:start-game={startGame}
				on:cancel={() => state = reducer(state, { type: "game:cancel-start" })}
			/>
		</Modal>
	{:else if pendingProject}
		<Modal>
			<PlacingProject
				project={pendingProject}
				on:place-project={finishPlaceProject}
				on:cancel={cancelPlaceProject}
			/>
		</Modal>
	{/if}
	<Info bind:visible={showInfo} />
	<p style="position:fixed;bottom:0;right:0;margin:0;">{$userId}</p>
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
