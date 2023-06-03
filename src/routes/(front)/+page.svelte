<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import NetlifyWidget from './NetlifyWidget.svelte';

	import AbsoluteBracket from '../../brackets/AbsoluteBracket/AbsoluteBracket.svelte';
	import NodeContent from '../../HorseGame/NodeContent.svelte';
	import CardContent from '../../HorseGame/CardContent.svelte';
	import SvgDefs from '../../HorseGame/SvgDefs.svelte';

	export let data;
	const { processedSeries, anchorsData } = data;

	// utilize ImageKit transformations
	const endpoint = 'https://ik.imagekit.io/dobdk1ymwif';
	const imagePath = 'tourney_brackets/horse_game_bracket_3920.png';
	const imgStats = { width: 1920, height: 1080, widths: [1400, 1920, 3920] };
	const getImgSrc = (width) => `${endpoint}/tr:w-${width}/${imagePath}`;

	// prefetch images for towns and heroes
	let imgList = [];

	// only add Netlify widget if url has correct hash
	// so users won't download it unnecessarily
	let withWidget = false;

	onMount(() => {
		const list = new Set();
		for (const roundSeries of processedSeries)
			for (const series of roundSeries)
				for (const game of series.games)
					for (const key of ['towns', 'starters']) for (const name of game[key]) list.add(name);
		imgList = [...list];

		const { hash } = $page.url;
		if (hash) {
			const tokens = ['invite_token', 'confirmation_token', 'recovery_token', 'email_change_token'];
			const pat = new RegExp(`#(${tokens.join('|')})=.+`);
			withWidget = pat.test(hash);
		}
	});
</script>

<h1 class="visually-hidden">Сетка турнира Игра в Коня</h1>

<!-- add Netlify widget for login/resetting password -->
{#if withWidget}<NetlifyWidget />{/if}

<!-- svg's <defs> to be referenced elsewhere -->
<SvgDefs />

<!-- image with absolutely positioned series -->
<AbsoluteBracket
	{processedSeries}
	{anchorsData}
	{imgStats}
	{getImgSrc}
	{NodeContent}
	{CardContent}
/>

{#each imgList as name}
	<link rel="preload" as="image" href="pictures/{name}.gif" />
{/each}

<svelte:head>
	<title>Игра в Коня | Сетка</title>
	<meta
		name="description"
		content="
			Сетка турнира по игре Герои Меча и Магии 3 (HoMM3) 'Игра в Коня', организованного стримерами @evlampich и @KICK_FREAK.
			Турнир на 32 участника играется на шаблоне JC (фулл рандом) с дополнительными усложнениями. 
		"
	/>
</svelte:head>

<style>
	:global(#root#root) {
		grid-template-rows: var(--header-height) calc(100vh - var(--header-height));
	}
</style>
