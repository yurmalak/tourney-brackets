<!-- Context provider for tests -->
<script>
	import { setContext } from 'svelte';
	import { configKey } from '$lib/context';
	import { createGame } from '$lib/utils';
	import Game from './Game.svelte';
	import Editor from './Editor.svelte';

	setContext(configKey, { createGame, GameEditor: Game });
</script>

<Editor {...$$props} on:toggleEditor />
