<script>
	import GameEditor from '../GameEditor.svelte';
	import WinnerSwitcher from '../WinnerSwitcher.svelte';

	export let dataMapper;
	export let kvCreator;
	export let deleteButton;
	export let winner;
	export let players;
</script>

<GameEditor {...$$restProps} {players} on:toggleEditor>
	<WinnerSwitcher bind:winner {players} slot="winner-switcher" />
	<div slot="data-mapper">{dataMapper}</div>
	<div slot="kv-creator">{kvCreator}</div>
	<div slot="delete-button">{deleteButton}</div>
</GameEditor>
