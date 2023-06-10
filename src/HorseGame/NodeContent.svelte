<script>
	import ChallengersStar from './ChallengersStar.svelte';

	/** @type {import("./types").FrontSeries} */
	export let series;

	/** @type {string} */
	export let id;

	const { data, players, games, winner } = series;
</script>

<svg viewBox="0 0 100 50" {id}>
	{#each players as player, i}
		{#if player}
			{@const { name } = player}
			{@const { length } = name}

			<!-- completed challenges icon -->
			{#if games.some((g) => g.challenges?.[name])}
				<ChallengersStar {series} pIndex={i} />
			{/if}

			<!-- name moved up for 1st and down for second player -->
			<text
				x="50%"
				y="{55 + (i ? 25 : -25)}%"
				text-anchor="middle"
				dominant-baseline="middle"
				textLength="{length > 10 ? 95 : 25 + length * 5}%"
				lengthAdjust="spacingAndGlyphs"
				class={Number.isInteger(winner) ? (winner === i ? 'winner' : 'loser') : ''}
			>
				{name}
			</text>
		{/if}
	{/each}

	<!-- defined game date icon -->
	{#if data.start}
		<use class="clock" href="#clock">
			<title>{data.start}</title>
		</use>
	{/if}
</svg>

<style>
	@import url('https://fonts.googleapis.com/css2?family=PT+Sans+Narrow&display=swap');

	.clock {
		scale: 0.23;
		translate: 40px -35px;
		transition: 0.3s;
		transform-origin: center;
	}

	svg {
		flex-grow: 1;
		overflow: visible;
		font-family: 'PT Sans Narrow', sans-serif;
	}

	.loser {
		opacity: 0.7;
	}

	.winner {
		filter: url(#text-shadow);
	}
</style>
