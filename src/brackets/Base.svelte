<svelte:options immutable />

<script>
	import PowersOf2 from './PowersOf2/PowersOf2.svelte';

	const templates = {
		powersOf2: PowersOf2
	};

	/** @type {string} */
	export let templateCode;
	const Bracket = templates[templateCode];

	if (!Bracket) {
		const codes = Object.keys(templates).join(', ');
		console.error(`Wrong template code - ${templateCode}. Allowed codes: ${codes}.`);
	}
</script>

{#if Bracket}
	<Bracket {...$$restProps} on:nodeClick />
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
