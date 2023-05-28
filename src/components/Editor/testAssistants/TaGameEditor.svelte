<script>
	import GameEditor from '../GameEditor.svelte';

	export let dataMapper;
	export let kvCreator;
	export let deleteButton;
</script>

<GameEditor {...$$restProps} on:toggleEditor>
	<div slot="data-mapper">{dataMapper}</div>
	<div slot="kv-creator">{kvCreator}</div>
	<div slot="delete-button">{deleteButton}</div>
</GameEditor>
