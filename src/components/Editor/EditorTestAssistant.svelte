<!-- Context provider for tests -->
<script>
	import { setContext } from 'svelte';
	import { configKey, dbKey } from '$lib/context';
	import { createGame as defaultCreateGame } from '$lib/utils';
	import DefaultGameEditor from './GameEditor.svelte';
	import Editor from './Editor.svelte';

	export let GameEditor = DefaultGameEditor;
	export let createGame = defaultCreateGame;
	export let dbContext = {};

	setContext(dbKey, dbContext);
	setContext(configKey, { createGame, GameEditor });
</script>

<Editor {...$$restProps} on:toggleEditor />
