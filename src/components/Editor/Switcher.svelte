<script>
	export let label;
	export let value;
	export let style = null;
	export let className = null;
</script>

<label {style} class={className}>
	<button type="button" on:click class="state-{value}" />
	{label}
</label>

<style>
	label {
		display: inline-flex;
		align-items: center;
		flex-direction: column;
		gap: 0.3rem;
		padding: 2px;
		margin-bottom: -0.2rem;
		user-select: none;
		font-size: 0.8em;
	}

	button {
		position: relative;
		padding: 0 0.25rem;
		border-radius: 1rem;
		height: 1rem;
		width: 2rem;
		min-width: 2rem;
		line-height: inherit;
		border: 1px solid gray;
		background-color: hsl(0, 0%, 94%);
	}

	button:before {
		position: absolute;
		content: '';
		top: 0;
		bottom: 0;
		left: 0.125rem;
		margin: auto;
		height: 0.75rem;
		width: 0.75rem;
		border-radius: 50%;
		background-color: hsl(100, 50%, 55%);
		transition: transform 150ms ease-out;
	}

	button.state-undefined:before {
		background-color: hsl(0, 0%, 65%);
		transform: translateX(0.45rem);
	}
	button.state-1:before {
		transform: translateX(0.9rem);
	}
</style>
