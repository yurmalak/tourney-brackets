<svelte:options immutable />

<script>
	/** @typedef {import('../../types.ts').Participant} Participant */

	/** @type {string} */
	export let value;

	/** @type {Participant[]} */
	export let players;

	/** @type {0|1} */
	export let playerIndex;
</script>

<select
	on:change
	aria-label="Player {playerIndex + 1}"
	data-player-index={playerIndex}
	disabled={!players}
	value={value ?? ''}
	class:occupied={Boolean(value)}
>
	{#if players}
		<option value="" class="idle" aria-label="select none" />
		{#each players as { name, sIndex } (name)}
			<option value={name} class:idle={sIndex === null}>
				{name}
			</option>
		{/each}
	{:else}
		<option {value}>{value}</option>
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
