<script>
	import { createEventDispatcher, afterUpdate } from "svelte";
	export let selfId;
	export let currentId;
	export let users = [];
	export let drawn;
	export let phase;
	$: yourTurn = selfId === currentId;
	$: pregame = phase !== "started";

	const dispatch = createEventDispatcher();

	// let opened = false;
	// let hiddenPanel;
	// let hiddenHeight = 0;
	// afterUpdate(() => {
	// 	if (hiddenPanel) {
	// 		hiddenHeight = hiddenPanel.getBoundingClientRect().height;
	// 	}
	// });
	// function togglePanel() {
	// 	opened = !opened;
	// }
	// function closePanel() {
	// 	opened = false;
	// }

	let editing = false;
	let focusEditField = false;
	$: userName = users.find(u => u.id === selfId)?.name;
	let newUserName;
	let input;

	function startGame(event) {
		event.stopPropagation();
		const startingTurn = users.findIndex(u => u.id === selfId) || 0;
		dispatch("start-game", { startingTurn });
	}

	function passTurn() {
		dispatch(yourTurn ? "pass-turn" : "pass-others-turn");
	}

	function drawCard(event) {
		event.stopPropagation();
		dispatch("draw-card");
	}

	function handleStartEditing() {
		newUserName = userName;
		editing = true;
		focusEditField = true;
	}

	function handleUpdateName(event) {
		event.preventDefault(); // in case it's a form submit event
		if (userName !== newUserName) {
			dispatch("change-name", { name: newUserName });
		}
		editing = false;
	}

	afterUpdate(() => {
		if (!!input && focusEditField) {
			input.focus();
			input.select();
			focusEditField = false;
		}
	});
</script>

<style>
	header {
		margin-bottom: 0.5rem;
		font-size: 1.5rem;
	}

	.controls {
		font-size: 1rem;
		padding: 1rem 1rem 0 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/*.wrapper.empty {
		display: none;
	}*/

	ol {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		margin: 5px 0
	}

	li .name {
		display: block;
	}

	button {
		display: block;
		margin: 0;
		cursor: pointer;
		padding: 0;
	}

	button.name {
		border: none;
		background-color: transparent;
		color: inherit;
		text-decoration: none;
	}

	input {
		width: 8rem;
		display: block;
		margin: 0 -5px;
		padding: 5px;
		border: none;
	}

	.current .name {
		color: var(--accent);
	}

	.drawn-card {
		font-family: Dicier;
		font-variant-ligatures: discretionary-ligatures;
	}
</style>

<!-- <svelte:window on:click={closePanel} /> -->
<div on:click={e => e.stopPropagation()}>
	<header>
		{#if phase === "pregame" || phase === "starting"}
			{users.length} player{users.length !== 1 ? 's' : ''}
			<button on:click={startGame}>Start game</button>
		{:else if yourTurn}
			Your turn
			{#if !drawn}
				<button on:click={drawCard}>Draw Card</button>
			{:else}
				<div>
					Drawn:
					<span class="drawn-card">{drawn}</span>
				</div>
			{/if}
		{:else}
			{users.find(u => u.id === currentId).name}'s turn
		{/if}
		{#if phase === "started"}
			<div class="controls">
				<button on:click={passTurn}>Pass {yourTurn ? "Your" : "Their"} Turn</button>
			</div>
		{/if}
	</header>
	<div>
			<ol class="users-list">
				{#each users as user (user.id)}
					<li class:self={user.id === selfId} class:current={!pregame && user.id === currentId}>
						{#if user.id === selfId}
							{#if editing}
								<form on:submit={handleUpdateName}>
									<input
										class="name"
										type="text"
										bind:this={input}
										bind:value={newUserName}
										on:blur={handleUpdateName}
									>
								</form>
							{:else}
								<button
									class="name"
									on:click={handleStartEditing}
									title="Click to edit name"
								>{user.name} ✏️</button>
							{/if}
						{:else}
							<span class="name">{user.name}</span>
						{/if}
					</li>
				{/each}
			</ol>
	</div>
</div>
