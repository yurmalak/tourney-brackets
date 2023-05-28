<script>
	import { createEventDispatcher } from 'svelte';

	let element,
		clicked = false;
	const dispatch = createEventDispatcher();

	/** Only dispatch event on second click */
	function askConfirmation() {
		if (clicked) dispatch('deleteGame');
		else {
			document.addEventListener(
				'click',
				(ev) => {
					// element will be null if component has been unmounted
					if (!element?.contains(ev.target)) clicked = false;
				},
				// capture so bubbling won't trigger it immediately
				{ capture: true, once: true }
			);
		}

		clicked = !clicked;
	}
</script>

<button
	type="button"
	{...$$props}
	class:warn={clicked}
	bind:this={element}
	on:click={askConfirmation}
	aria-description="Requires second click for confirmation"
>
	{#if clicked}<slot name="clicked" />
	{:else}<slot name="normal" />{/if}
</button>

<style>
	.warn {
		background-color: hsl(0, 65%, 80%);
		font-weight: bold;
	}
	@media (hover: hover) {
		.warn:not(:disabled):hover {
			background-color: var(--color-warn);
		}
	}
</style>
