<script>
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import HorseGame from '../HorseGame/HorseGameBracket.svelte';
	import SvgDefs from '../HorseGame/SvgDefs.svelte';

	export let data;

	const handler = () => {
		netlifyIdentity.close();
		goto('/cms');
	};

	onMount(() => {
		if (typeof window !== 'undefined') {
			if (window.netlifyIdentity) window.netlifyIdentity.on('login', handler);
			else console.warn('No netlifyIdentity on window object');
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') window.netlifyIdentity.off('login', handler);
	});
</script>

<h1 class="visually-hidden">Сетка турнира Игра в Коня</h1>

<SvgDefs />
<HorseGame {data} />

<svelte:head>
	<title>Игра в Коня | Сетка</title>
	<meta
		name="description"
		content="
			Сетка турнира по игре Герои Меча и Магии 3 (HoMM3) 'Игра в Коня', организованного стримерами @evlampich и @KICK_FREAK.
			Турнир на 32 участника играется на шаблоне JC (фулл рандом) с дополнительными усложнениями. 
		"
	/>
	<script
		type="text/javascript"
		src="https://identity.netlify.com/v1/netlify-identity-widget.js"
	></script>
</svelte:head>
