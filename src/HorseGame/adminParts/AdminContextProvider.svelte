<script>
	import { setContext } from 'svelte';
	import { configKey } from '$lib/context';

	import GameEditor from './GameEditor.svelte';
	import createGame from './createGame';
	import kvOptions from './kvOptions';

	setContext(configKey, { createGame, GameEditor, kvOptions });
</script>

<slot />
