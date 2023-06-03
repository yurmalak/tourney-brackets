<script>
	/** @type {number} */
	export let pIndex;

	/** @type {import("./types").FrontSeries} */
	export let series;

	const { games, players } = series;
	const { name } = players[pIndex];

	// structure defined in './dataProcessors.js'
	const cList = [];
	for (const { challenges } of games) {
		for (const completedChallenge of challenges?.[name] || []) {
			cList.push(completedChallenge);
		}
	}

	const num = cList.length;
	const odd = num % 2;
</script>

<!-- place icons on top of first or under second player (and spread if more than 1 challenge completed) -->
<g transform="translate({50 - 7.5 * (odd - 1) - ((num - odd) / 2) * 15},{-5 + 60 * pIndex})">
	{#each cList as text, i}
		<use href="#star" x={15 * i}>
			<title>{text}</title>
		</use>
	{/each}
</g>

<style>
	use {
		scale: 1.1;
		fill: yellow;
		stroke: black;
	}
</style>
