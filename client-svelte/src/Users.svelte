<script>
	import { createEventDispatcher, afterUpdate } from "svelte";
	export let selfId;
	export let users = [];

	const dispatch = createEventDispatcher();

	let editing = false;
	let focusEditField = false;
	$: userName = users.find(u => u.id === selfId)?.name;
	let newUserName;
	let input;

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
	.users-list {
		padding: 1rem;
		background-color: rgba(0, 0, 0, 0.25);
		width: 10rem;
		border-radius: 1rem;
		position: fixed;
		top: 10px;
		right: 10px;
	}

	.users-list.empty {
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

		padding: 0;
		border: none;
		background-color: transparent;
	}

	input {
		width: 100%;
		display: block;
		margin: 0;
		border: none;
	}
</style>

<div class="users-list" class:empty={users.length === 0}>
	<ol>
		{#each users as user (user.id)}
			<li class:self={user.id === selfId}>
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
</div>
