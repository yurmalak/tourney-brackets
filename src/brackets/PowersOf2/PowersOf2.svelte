<script>
	/** @typedef {import("../../types").Series} Series*/

	import Node from '../Node.svelte';
	import Joiner from '../Joiner.svelte';
	import { tourneyStore } from '../../Amdin/stores';
	import bundleSeries from './bundleSeries';

	const { playersTotal, withTop3 } = $tourneyStore.data;
	const roundsTotal = Math.log(playersTotal) / Math.log(2);
	const cols = 2 * (roundsTotal - 1);
	const rows = playersTotal / 4;

	/** @type {Series[][]},  */
	let seriesByRound;

	/** @type {Series[]},  */
	let finals;

	$: {
		seriesByRound = bundleSeries($tourneyStore);
		finals = seriesByRound.pop(); // finals won't fit general schema
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
		{@const style = `grid-column:${cols + 1};grid-row: span ${playersTotal / 8}`}
		<Joiner span={playersTotal / 2} style="transform:rotateY(180deg)" />
		{#each finals as series}
			<Node {series} on:nodeClick {style} />
		{/each}
		<Joiner span={playersTotal / 2} />
	{:else}
		{@const style = `grid-column:${cols + 1};grid-row: span ${playersTotal / 4}`}
		<Joiner span={playersTotal / 2} horisontal />
		<Node series={finals[0]} on:nodeClick {style} />
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
