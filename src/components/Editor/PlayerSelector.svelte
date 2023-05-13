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
>
	{#if players}
		<option value="" class="idle" aria-label="select none">---</option>
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
		opacity: 1;
		color: inherit;
		user-select: all;
	}

	select {
		width: 40%;
		flex-grow: 1;
		background-color: var(--color-bg-light);
	}
	option:not(.idle) {
		background-color: lightgray;
	}
</style>
