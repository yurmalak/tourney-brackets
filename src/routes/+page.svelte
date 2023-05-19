<script>
	import HorseGame from '../HorseGame/HorseGameBracket.svelte';
	import SvgDefs from '../HorseGame/SvgDefs.svelte';
</script>

<h1 class="visually-hidden">Сетка турнира Игра в Коня</h1>

<SvgDefs />
<HorseGame />

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
