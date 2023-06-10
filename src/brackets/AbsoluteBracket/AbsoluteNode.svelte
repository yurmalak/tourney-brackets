<svelte:options immutable />

<!-- Node with predefined size and position to be absolutely positioned over background image. -->

<script>
	/** @type {number}*/
	export let round;

	/** @type {number}*/
	export let index;

	/** @type {{ width: string, height: string, coordinates: [number,number][][] }}*/
	export let anchorsData;

	/** @type {string}*/
	export let labelledby;

	/** @type {boolean}*/
	export let disabled;

	/** @type {boolean}*/
	export let expanded;

	/** @type {string} */
	export let className;

	const { width, height, coordinates } = anchorsData;
	const [left, top] = coordinates[round][index];
</script>

<button
	style:width
	style:height
	style:left={left + '%'}
	style:top={top + '%'}
	data-round={round}
	data-s-index={index}
	aria-haspopup="dialog"
	aria-labelledby={labelledby}
	aria-expanded={expanded}
	aria-description="{expanded ? 'Закрыть' : 'Открыть'} детали серии"
	class={className}
	{disabled}
>
	<slot />
</button>

<style>
	button {
		position: absolute;

		display: inline-flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;

		padding: 0;
		margin: 0;
		background-color: transparent;
		font-size: 1rem;
		border: none;
		border-radius: 15%;
	}

	button:not(:disabled) {
		cursor: pointer;
	}

	button:active:not(:disabled) {
		background: radial-gradient(hsla(0, 0%, 90%, 0.1), hsla(0, 0%, 90%, 0.04));
	}

	@media (hover: hover) {
		button:hover:not(:disabled, :active) {
			background: radial-gradient(hsla(0, 0%, 100%, 0.135), hsla(0, 0%, 100%, 0.1));
		}
	}
</style>
