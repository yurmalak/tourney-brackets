<svelte:options immutable />

<script>
	export let label;
	export let value;
	export let style = null;
	export let className = null;
	export let buttonProps = {};
</script>

<label {style} class={className} {...$$restProps}>
	<button type="button" on:click class="state-{value}" {...buttonProps} />
	{label}
</label>

<style>
	label {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 0.3em;
		padding: 0.1em;
		margin-bottom: -0.2em;
		user-select: none;
		font-size: 0.85em;
		cursor: pointer;
	}

	button {
		--color: hsl(0, 0%, 94%);
		background-color: var(--color);
		position: relative;
		border-radius: 1em;
		height: 1.3em;
		width: 2.6em;
		min-width: 2.6em;
		line-height: inherit;
		border: 0.1em solid gray;
		cursor: pointer;
	}

	button:active:active {
		background-color: var(--color);
	}

	button:before {
		position: absolute;
		content: '';
		top: 0.1em;
		left: 0.15em;
		height: 0.9em;
		width: 0.9em;
		border-radius: 50%;
		background-color: hsl(225, 50%, 55%);
		transition: transform 150ms ease-out;
	}

	.state-undefined.state-undefined:before {
		background-color: hsl(0, 0%, 65%);
		transform: translateX(0.6em);
	}
	.state-1:before {
		transform: translateX(1.2em);
	}

	@media (hover: hover) {
		button:hover {
			background-color: var(--color);
			box-shadow: 0 0 3px #5d6883;
		}
		button:not(:active):hover:before {
			background-color: hsl(210, 80%, 60%);
		}
	}
</style>
