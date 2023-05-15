<svelte:options immutable />

<script>
	export let span = 1;
	export let horisontal = false;
</script>

<bracket-joiner {...$$restProps} style:--span={span} class:horisontal>
	{#if !horisontal}<div class="in" />{/if}
	<div class="out" style:grid-row={span} />
</bracket-joiner>

<style>
	bracket-joiner {
		--side-gap: 25%;
		--pos: calc(1 + var(--span) / 2);

		position: relative;
		height: 100%;
		grid-row: span var(--span);

		display: grid;
		grid-template-rows: repeat(calc(var(--span) * 2), 1fr);
		grid-template-columns: 1fr 1fr;
	}
	.in,
	.out {
		border: var(--bracket-border-joiner);
	}
	.in {
		border-width: var(--bracket-border-width);
		margin-bottom: calc(-1 * var(--bracket-border-width)); /* compensate */
		grid-row: var(--pos) / calc(-1 * var(--pos));
		border-left: 0;
	}
	.out {
		border-bottom-width: var(--bracket-border-width);
		margin-bottom: calc(-1 * var(--bracket-border-width)); /* compensate */
		grid-column: 2;
	}
	.horisontal > .out {
		grid-column: span 2;
	}
</style>
