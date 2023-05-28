<!-- Context provider for tests -->
<script>
	import { setContext } from 'svelte';
	import { configKey } from '$lib/context';
	import { createGame } from '$lib/utils';
	import GameEditor from '../GameEditor.svelte';
	import Editor from '../Editor.svelte';

	export let kvOptions;

	setContext(configKey, { createGame, GameEditor, kvOptions });
</script>

<Editor {...$$restProps} on:toggleEditor />
