<svelte:options immutable />

<script>
	/** @type {string} */
	export let player;

	/** @type @type {{ idle: string[], busy: string[] } | null} */
	export let players;

	/** @type {0|1} */
	export let playerIndex;
</script>

<select
	on:change
	aria-label="Player {playerIndex + 1}"
	data-player-index={playerIndex}
	disabled={!players}
	value={player}
	class:occupied={Boolean(player)}
>
	{#if players}
		<option value="" class="idle" aria-label="select none" />
		{#each players.idle as name (name)}
			<option value={name} class="idle">{name}</option>
		{/each}
		{#each players.busy as name (name)}
			<option value={name}>{name}</option>
		{/each}
	{:else}
		<option value={player}>{player}</option>
	{/if}
</select>

<style>
	select:disabled {
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		user-select: all;
		opacity: 0.4;
	}

	select.occupied:disabled {
		opacity: 1;
		color: inherit;
	}

	select {
		width: 40%;
		flex-grow: 1;
		background-color: var(--color-input);
	}
	option:not(.idle) {
		background-color: lightgray;
	}
</style>
