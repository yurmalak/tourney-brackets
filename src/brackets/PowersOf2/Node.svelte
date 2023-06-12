<script>
	import { createEventDispatcher } from 'svelte';

	/** @type {import('../../types.ts').Series} */
	export let series;

	/** @type {number} */
	export let round;

	/** @type {number} */
	export let sIndex;

	/** @type {string} */
	export let style;

	const dispatch = createEventDispatcher();
	const handleClick = () => dispatch('nodeClick', { round, sIndex, series });
</script>

<bracket-node {style}>
	<button
		type="button"
		on:click={handleClick}
		disabled={round !== 0 && series.players.some((p) => !p)}
	>
		{#each series.players as name, i}
			<span
				class="name r{i} {!Number.isInteger(series.winner)
					? ''
					: series.winner === i
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
	button {
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

	button:disabled {
		opacity: 1;
		color: initial;
		cursor: default;
	}

	button:active:not(:disabled) {
		background-color: hsl(240, 40%, 97%);
		box-shadow: none;
	}

	@media (hover: hover) {
		button:hover:not(:disabled, :active) {
			background-color: hsl(240, 60%, 99%);
			box-shadow: 0 0 3px 0 rgb(116, 116, 116);
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
