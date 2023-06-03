<!-- 
	While working, this is essentially placeholder for something game-specific
	passed via context above Admin component 
-->

<script>
	import Switcher from '../../components/Switcher.svelte';

	/**
	 * data is game-specific and only used by custom component replacing this one
	 * so simply mute the warning here
	 * @type {object}
	 */
	export let data = null;
	data;

	/** @type {string?} */
	export let winner;

	/** @type {string[]} */
	export let players;

	function switchWinner() {
		winner = players.indexOf(winner) === 0 ? players[1] : players[0];
	}
</script>

<editor-game>
	<Switcher
		on:click={switchWinner}
		value={winner === '' ? undefined : players.indexOf(winner)}
		label="Winner"
		style="align-self: center"
		buttonProps={{
			'aria-label': 'Winner switcher',
			'aria-description': `Current winner - ${winner ?? 'none'}`
		}}
	/>
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
