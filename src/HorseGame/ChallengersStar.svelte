<script>
	export let pIndex;
	export let series;

	const { kvData, players } = series;
	const challenges = kvData.challenges[players[pIndex].name];

	const num = challenges.length;
	const odd = num % 2;
</script>

<!-- place icons on top of first or under second player (and spread if more than 1 challenge completed) -->
<g transform="translate({50 - 7.5 * (odd - 1) - ((num - odd) / 2) * 15},{-5 + 60 * pIndex})">
	{#each challenges as text, i}
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
