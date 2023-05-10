<script>
	import Node from '../Node.svelte';
	import Joiner from '../Joiner.svelte';
	import { tourneyStore } from '../../../stores';
	import { createSeries, populateSeries, bundleSeries } from '../../../lib/series';

	const { playersTotal, withTop3 } = $tourneyStore;
	const roundsTotal = Math.log(playersTotal) / Math.log(2);

	const { seriesByRound, gamesByRound, finals, idlePlayers } = bundleSeries({
		roundsTotal,
		playersTotal,
		tourneyPlayers: $tourneyStore.players,
		tourneyGames: $tourneyStore.games
	});

	// recursively populate series with games and players
	// Finals and semi-finals are bo3, others bo1
	const bo = (round) => (round < roundsTotal - 2 ? 1 : 2);
	seriesByRound[0].forEach((series) =>
		populateSeries(series, gamesByRound, seriesByRound, roundsTotal, bo)
	);

	// add series to last round (3rd place)
	if (withTop3) {
		const losersFinals = createSeries(roundsTotal - 1, 1);
		const semiFinals = seriesByRound[roundsTotal - 2];

		for (const { winner, players, index } of semiFinals) {
			if (winner === undefined) continue;
			const loser = players[1 - winner];
			const pIndex = index % 2;
			losersFinals.players[pIndex] = loser;
		}

		populateSeries(losersFinals, gamesByRound, seriesByRound, roundsTotal, bo);
		finals.push(losersFinals);
	}

	// finals won't fit general schema
	seriesByRound.pop();

	// css value
	const cols = 2 * (roundsTotal - 1);
</script>

<bracket-32 style:--cols={cols} role="tree">
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
		grid-auto-flow: column;
		align-items: center;
		padding: var(--space-m);
	}
</style>
