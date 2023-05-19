<script>
	import { setContext } from 'svelte';
	import { configKey } from '$lib/context';

	import GameEditor from './GameEditor.svelte';
	import createGame from './createGame';
	import fetchData from './fetchData';

	setContext(configKey, { fetchData, createGame, GameEditor });
</script>

<slot />
