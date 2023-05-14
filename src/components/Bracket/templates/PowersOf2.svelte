<script>
	/** @typedef {import("../../../types").Series} Series*/

	import Node from '../Node.svelte';
	import Joiner from '../Joiner.svelte';
	import { tourneyStore } from '../../../stores';
	import { createSeries, calculateScore } from '../../../lib/utils';

	const { playersTotal, withTop3 } = $tourneyStore;
	const roundsTotal = Math.log(playersTotal) / Math.log(2);
	const cols = 2 * (roundsTotal - 1);
	const rows = playersTotal / 4;

	/** @type {Series[][]},  */
	let seriesByRound;

	/** @type {Series[]},  */
	let finals;

	function populateSeries(series) {
		const { round, index } = series;

		// loser finals for 3rd place (second game of last round) doesn't fit normal schema
		const isLoserFinals = round === roundsTotal - 1 && index === 1;
		const prevGamesIndices = isLoserFinals ? [0, 2] : [index * 2, index * 2 + 2];

		// check if series leading to this one have been finished
		const predecessors = seriesByRound[round - 1]?.slice(...prevGamesIndices);
		predecessors.forEach((s, i) => {
			if (s.winner === undefined) return;

			let playerIndex = s.winner;
			if (isLoserFinals) playerIndex = 1 - playerIndex;

			series.players[i] = s.players[playerIndex];
		});
	}

	$: {
		// create array for each round
		seriesByRound = [];
		for (let i = 0; i < roundsTotal; i++) seriesByRound[i] = [];

		// create empty series
		seriesByRound.forEach((arr, round) => {
			const numberOfSeries = 2 ** (roundsTotal - round - 1);
			for (let i = 0; i < numberOfSeries; i++) arr.push(createSeries(round, i));
		});

		// add losersFinals - second series of last round (for 3rd place)
		if (withTop3) {
			const losersFinals = createSeries(roundsTotal - 1, 1);
			seriesByRound[roundsTotal - 1].push(losersFinals);
		}

		// fill series with data
		seriesByRound.forEach((arr, round) => {
			// add players
			if (round === 0) $tourneyStore.assignPlayers(arr);
			else arr.forEach(populateSeries);

			// finals and loser finals are bo3, other bo1
			const bestOf = round < roundsTotal - 1 ? 1 : 2;

			// games and score
			for (const series of arr) {
				if (!series.players.every(Boolean)) continue;

				const names = series.players.map((p) => p.name);
				series.games = $tourneyStore.getGames(round, names);
				series.score = calculateScore(series.games);
				const maxScore = Math.max(...series.score);
				const seriesFinished = maxScore >= bestOf;
				if (seriesFinished) series.winner = series.score.indexOf(maxScore);
			}
		});

		// finals won't fit general schema
		finals = seriesByRound.pop();
	}
</script>

<bracket-32 style:--cols={cols} style:--rows={rows} role="tree">
	{#each seriesByRound as roundGames, round}
		{@const span = 2 ** round}
		{@const limit = roundGames.length / 2}
		{#each roundGames as series, i (i)}
			{@const leftSide = i < limit}

			{@const nCol = leftSide ? 2 * round + 1 : -2 * round - 2}
			{@const nColStyle = `grid-column:${nCol}`}
			{@const nRowStyle = `grid-row:span ${span}`}

			{@const jCol = leftSide ? nCol - 1 : nCol + 1}
			{@const jColStyle = `grid-column:${jCol}`}
			{@const jTransform = leftSide ? '' : 'transform:rotateY(180deg)'}

			{#if round > 0}
				<Joiner {span} style="{jColStyle};{jTransform}" />
			{/if}
			<Node {series} style="{nColStyle};{nRowStyle}" on:nodeClick />
		{/each}
	{/each}

	<!-- place finals by hand -->
	{#if withTop3}
		<!-- 2 finals in same column -->
		<Joiner span={playersTotal / 2} style="transform:rotateY(180deg)" />
		{#each finals as series}
			<Node
				{series}
				on:nodeClick
				style="grid-column:{cols + 1};grid-row: span {playersTotal / 8}"
			/>
		{/each}
		<Joiner span={playersTotal / 2} />
	{:else}
		<Joiner span={playersTotal / 2} horisontal />
		<Node
			series={finals[0]}
			on:nodeClick
			style="grid-column:{cols + 1};grid-row: span {playersTotal / 4}"
		/>
		<Joiner span={playersTotal / 2} horisontal />
	{/if}
</bracket-32>

<style>
	bracket-32 {
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr min(1rem)) 1fr;
		grid-template-rows: repeat(var(--rows), 1fr);
		grid-auto-flow: column;
		align-items: center;
		padding: var(--space-m);
	}
</style>
