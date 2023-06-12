<script>
	import PlayerSelector from './PlayerSelector.svelte';

	export let selectedPlayers;
	export let tempPlayers;

	/** @type [number, number] */
	export let score;

	/** @type {() => void} */
	export let update;

	/**
	 * Updates {@link selectedPlayers}
	 * @param {Event} ev
	 */
	function selectPlayer(ev) {
		const { value, dataset } = ev.target;
		const i = Number(dataset.playerIndex);

		// swap if selected second player
		let swapped = false;
		if (value && value === selectedPlayers[1 - i]) {
			selectedPlayers[1 - i] = selectedPlayers[i];
			swapped = true;
		}

		selectedPlayers[i] = value;

		// do not update if swapped since order is irrelevant
		if (!swapped) update();
	}
</script>

<editor-header>
	{#each selectedPlayers as player, i}
		<PlayerSelector players={tempPlayers} {player} playerIndex={i} on:change={selectPlayer} />
		{#if i === 0}<score-counter aria-label="Score {score}">{score}</score-counter>{/if}
	{/each}
</editor-header>

<style>
	editor-header {
		display: flex;
		padding: var(--space-m);
		background-color: var(--color-bg-dark);
		box-shadow: 1px 1px 3px hsl(238 30% 66% / 1);
		border-bottom: 1px solid gray;
	}

	score-counter {
		width: 4ch;
		padding: 0 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25em;
	}
</style>
