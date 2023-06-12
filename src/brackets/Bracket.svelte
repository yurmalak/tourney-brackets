<script>
	import powersOf2 from './PowersOf2/PowersOf2.svelte';

	/** @type {string} */
	export let templateCode;

	/** @type {[][]Series}*/
	export let seriesByRound;

	/** @type {object}*/
	export let extras;

	const templates = {
		powersOf2
	};

	let Bracket;
	$: {
		Bracket = templates[templateCode];
		if (!Bracket) {
			const codes = Object.keys(templates).join(', ');
			console.error(`Wrong template code - ${templateCode}. Allowed codes: ${codes}.`);
		}
	}
</script>

{#if Bracket}
	<svelte:component this={Bracket} {seriesByRound} {extras} on:nodeClick />
{:else}
	<div>Something went wrong. :(</div>
{/if}

<style>
	:root {
		--bracket-border-node: 1px solid gray;
		--bracket-border-width: 1px;
		--bracket-border-joiner: 0px solid gray;
	}
</style>
