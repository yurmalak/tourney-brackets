<!-- Context provider for tests -->
<script>
	import { setContext } from 'svelte';
	import { configKey } from '$lib/context';
	import { createGame as defaultCreateGame } from '$lib/utils';
	import DefaultGameEditor from './GameEditor.svelte';
	import Editor from './Editor.svelte';

	export let GameEditor = DefaultGameEditor;
	export let createGame = defaultCreateGame;

	setContext(configKey, { createGame, GameEditor });
</script>

<Editor {...$$restProps} on:toggleEditor />
