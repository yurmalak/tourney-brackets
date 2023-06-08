<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import NetlifyWidget from './NetlifyWidget.svelte';
	import Bracket from '../../HorseGame/Bracket.svelte';

	/** Output of `load` frunction from ./+page.server.js */
	export let data;

	// only add Netlify widget if url has correct hash
	// so users won't download it unnecessarily
	let withWidget = false;

	onMount(() => {
		const { hash } = $page.url;
		if (hash) {
			const tokens = ['invite_token', 'confirmation_token', 'recovery_token', 'email_change_token'];
			const pat = new RegExp(`#(${tokens.join('|')})=.+`);
			withWidget = pat.test(hash);
		}
	});
</script>

<h1 class="visually-hidden">Сетка турнира Игра в Коня</h1>
<Bracket {data} />

<!-- add Netlify widget for login/resetting password -->
{#if withWidget}<NetlifyWidget />{/if}

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
