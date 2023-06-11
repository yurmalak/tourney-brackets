<script>
	import Switcher from './Switcher.svelte';

	export let winner;
	export let players;
	export let style = null;

	function switchWinner() {
		winner = players.indexOf(winner) === 0 ? players[1] : players[0];
	}
</script>

<Switcher
	on:click={switchWinner}
	value={winner === '' ? undefined : players.indexOf(winner)}
	label="Winner"
	buttonProps={{
		'aria-label': 'Winner switcher',
		'aria-description': `Current winner - ${winner ?? 'none'}`
	}}
	{style}
/>
