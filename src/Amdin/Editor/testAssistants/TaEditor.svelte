<!-- Context provider for tests -->
<script>
	import GameEditor from '../GameEditor.svelte';
	import Editor from '../Editor.svelte';
	export let kvOptions;
</script>

<Editor {GameEditor} {kvOptions} {...$$restProps} on:toggleEditor />
