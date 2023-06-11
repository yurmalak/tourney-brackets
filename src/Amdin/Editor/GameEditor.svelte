<!-- 
	While working, this is essentially placeholder for something game-specific
	passed via context above Admin component 
-->

<script>
	/** @type {object} */
	export let data = null;

	/** @type {string[]} */
	export let players;

	// "use" them here to suppress warning
	data;
	players;
</script>

<editor-game>
	<slot name="winner-switcher" style="align-self: center" />
	<slot name="data-mapper" />
	<slot name="kv-creator" />
	<slot name="delete-button" />
</editor-game>

<style>
	editor-game {
		display: flex;
		flex-direction: column;
		padding: var(--space-m);
		gap: var(--space-m);
		padding: var(--space-m);
	}
</style>
