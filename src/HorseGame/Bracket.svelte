<script>
	import { onMount } from 'svelte';

	import AbsoluteBracket from '../brackets/AbsoluteBracket/AbsoluteBracket.svelte';
	import NodeContent from './NodeContent.svelte';
	import CardContent from './CardContent.svelte';
	import SvgDefs from './SvgDefs.svelte';

	export let data;

	// utilize ImageKit transformations
	const endpoint = 'https://ik.imagekit.io/dobdk1ymwif';
	const imagePath = 'tourney_brackets/horse_game_v2.png';
	const imgStats = { width: 1920, height: 1080, widths: [1400, 1920, 3920] };
	const getImgSrc = (width) => `${endpoint}/tr:w-${width}/${imagePath}`;

	// prefetch images for towns and heroes
	let imgList = [];
	onMount(() => {
		const list = new Set();
		for (const roundSeries of data.processedSeries)
			for (const series of roundSeries)
				for (const game of series.games)
					for (const key of ['towns', 'starters'])
						for (const name of game.data[key]) list.add(name.replace(/ /g, '_'));
		imgList = [...list];
	});
</script>

<!-- svg's <defs> to be referenced elsewhere -->
<SvgDefs />

<!-- image with absolutely positioned series -->
<AbsoluteBracket {...data} {imgStats} {getImgSrc} {NodeContent} {CardContent} />

{#each imgList as name}
	<link rel="preload" as="image" href="pictures/{name}.gif" />
{/each}

<style>
	:global(#root#root) {
		grid-template-rows: var(--header-height) calc(100vh - var(--header-height));
	}
</style>
