<script>
	import Switcher from './Switcher.svelte';

	// data is game-specific and only used by custom component replacing this one
	// so simply mute the warning here
	export let data;
	data;

	export let winner;
</script>

<editor-game>
	<Switcher
		bind:value={winner}
		label="Winner"
		aria-label="Winner switcher. Current winner - player {winner + 1}."
	/>
	<slot name="data-mapper" />
	<slot name="kv-creator" />
	<slot name="delete-button" />
</editor-game>

<style>
	editor-game {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		padding: var(--space-m);
		gap: var(--space-m);
		padding: var(--space-m);
	}
</style>
