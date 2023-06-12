<script>
	import { onDestroy } from 'svelte';

	export let animated;
	export let colorHighlight;

	let timeoutHandler;
	$: if (animated) {
		timeoutHandler = setTimeout(() => {
			clearTimeout(timeoutHandler);
			animated = false;
		}, 400);
	}

	onDestroy(() => clearTimeout(timeoutHandler));
</script>

<button
	type="button"
	on:click
	class:animated
	style:--color-highlight={colorHighlight}
	{...$$restProps}
>
	<slot />
</button>

<style>
	.animated {
		animation-duration: 200ms;
		animation-name: attention-shake;
		animation-iteration-count: infinite;
		animation-timing-function: ease-out;
		animation-direction: normal;
		background-color: var(--color-highlight);
	}

	@keyframes attention-shake {
		0% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(3deg);
		}
		75% {
			transform: rotate(-3deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	@media (hover: hover) {
		button:hover:not(:active) {
			background-color: var(--color-highlight);
		}
	}
</style>
