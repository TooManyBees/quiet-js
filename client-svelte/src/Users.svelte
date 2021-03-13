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

	let editing = false;
	let focusEditField = false;
	$: userName = users.find(u => u.id === selfId)?.name;
	let newUserName;
	let input;

	function startGame() {
		const startingTurn = users.findIndex(u => u.id === selfId) || 0;
		dispatch("start-game", { startingTurn });
	}

	function handleStartEditing(event) {
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
	.wrapper {
		border-radius: 1rem;
		overflow: hidden;
		min-width: 10rem;
		max-width: 15rem;
	}

	.users-list {
		padding: 1rem;
		background-color: rgba(0, 0, 0, 0.25);
	}

	.controls {
		padding: 1rem;
		background-color: yellow;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.controls button {
	}

	.wrapper.empty {
		display: none;
	}

	ol {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		margin: 5px 0
	}

	li .name {
		padding: 5px;
		display: block;
	}

	button {
		display: block;
		margin: 0;
		cursor: pointer;
	}

	button.name {
		border: none;
		background-color: transparent;
	}

	input {
		width: 100%;
		display: block;
		margin: 0;
		border: none;
	}

	.self .name {
		text-decoration: underline;
	}

	.current .name {
		color: white;
	}

	.drawn-card {
		font-family: Dicier;
		font-variant-ligatures: discretionary-ligatures;
	}
</style>

<div class="wrapper" class:empty={users.length === 0}>
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
							title="Edit name"
						>{user.name}</button>
					{/if}
				{:else}
					<span class="name">{user.name}</span>
				{/if}
			</li>
		{/each}
	</ol>
	<div class="controls">
		{#if phase === "pregame"}
			<button on:click={startGame}>Start</button>
		{:else}
			{#if phase === "started"}
				{#if yourTurn}
					{#if !drawn}
						<button on:click={() => dispatch("draw-card")}>Draw Card</button>
					{:else}
						<span class="drawn-card">{drawn}</span>
					{/if}
				{/if}
				<button on:click={() => dispatch("pass-turn")}>Pass Turn</button>
			{/if}
		{/if}
	</div>
</div>
