<script>
	import { setContext } from 'svelte';
	import { configKey } from '$lib/context';

	import GameEditor from './GameEditor.svelte';
	import createGame from './createGame';

	setContext(configKey, { createGame, GameEditor });
</script>

<slot />
