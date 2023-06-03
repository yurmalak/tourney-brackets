<svelte:options immutable />

<script>
	import { createEventDispatcher } from 'svelte';

	/** @typedef {import('../../types.ts').Series} Series */

	/** @type {Series} */
	export let series;

	/** @type {string} */
	export let style;

	const dispatch = createEventDispatcher();
	const handleClick = ({ ctrlKey, shiftKey, altKey }) => {
		dispatch('nodeClick', { ctrlKey, shiftKey, altKey, series });
	};
</script>

<bracket-node {style}>
	<button type="button" on:click={handleClick}>
		{#each series.players as name, i}
			<span
				class="name r{i} {series.winner === undefined
					? ''
					: series.winner === series.players[i]
					? 'winner'
					: 'loser'}"
			>
				{name}
			</span>
			<span class="score r{i}">
				{series.score[i]}
			</span>
		{/each}
	</button>
</bracket-node>

<style>
	bracket-node {
		position: relative;
		margin: 0.5rem 0;
		border: var(--bracket-border-node);
		display: flex;
		background-color: white;
	}
	bracket-node > button {
		background-color: transparent;
		border: none;
		padding: 0;
		margin: 0;

		flex-grow: 1;
		display: inline-grid;
		align-items: stretch;
		cursor: pointer;
		grid-template:
			'name1  score1' 1fr
			'name2  score2' 1fr / 1fr auto;
	}

	bracket-node > button:active {
		background-color: hsl(240, 40%, 97%);
		box-shadow: none;
	}

	@media (hover: hover) {
		bracket-node:hover {
			background-color: hsl(240, 60%, 99%);
			box-shadow: 0 0 3px hsl(0, 0%, 70%);
		}
	}
	.score,
	.name {
		display: flex;
		align-items: center;
		padding: var(--space-s) var(--space-m);
	}
	.winner {
		font-style: italic;
		font-weight: bolder;
	}
	.loser {
		color: rgba(0, 0, 0, 0.55);
	}
	.score {
		border-left: var(--bracket-border-node);
	}
	.r1 {
		border-top: var(--bracket-border-node);
	}
</style>
