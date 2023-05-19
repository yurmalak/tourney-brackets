<svelte:options immutable />

<!-- Node with predefined position to be absolutely positioned over background image. -->

<script>
	import ChallengersStar from './ChallengersStar.svelte';
	/** @typedef {import("../types").Series} Series*/

	/** @type {string} percentage css length */
	export let width;

	/** @type {string} percentage css length */
	export let height;

	/** @type {Series} */
	export let series;

	/** @type {string}*/
	export let className;

	const {
		players,
		round,
		index,
		kvData,
		nodeLeftTop: [left, top]
	} = series;

	const id = `node-${round}-${index}`;
</script>

<button
	class={className}
	style:width
	style:height
	style:left={left + '%'}
	style:top={top + '%'}
	data-round={round}
	data-s-index={index}
	aria-haspopup="dialog"
	aria-labelledby={id}
	disabled={!players.every(Boolean)}
>
	<svg viewBox="0 0 100 50" {id}>
		{#each players as player, i}
			{#if player}
				{@const { length } = player.name}

				<!-- completed challenges icon -->
				{#if player.name in kvData.challenges}<ChallengersStar {series} pIndex={i} />{/if}

				<!-- name moved up for 1st and down for second player -->
				{#if !kvData.hide[player.name]}
					<text
						x="50%"
						y="55%"
						text-anchor="middle"
						dominant-baseline="middle"
						baseline-shift={i ? '-75%' : '75%'}
						textLength="{length > 8 ? 100 : 40 + length * 5}%"
					>
						{player.name}
					</text>
				{/if}
			{/if}
		{/each}

		<!-- defined game date icon -->
		{#if kvData.start}
			<use class="clock" href="#clock">
				<title>{kvData.start}</title>
			</use>
		{/if}
	</svg>
</button>

<style>
	button {
		--bg: radial-gradient(#ffffff20, #ffffff15);
		position: absolute;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		padding: 0;
		margin: 0;
		background: none;
		background-color: transparent;
		font-size: 1em;
		border: none;
		padding: 2px;
		border-radius: 15%;
	}

	button:active:not(:disabled) {
		background: var(--bg);
	}

	@media (hover: hover) {
		button:hover:not(:disabled) {
			cursor: pointer;
			background: var(--bg);
		}
		button:hover:not(:active):not(:disabled) > svg {
			filter: url(#drop-shadow);
		}
		.clock:hover {
			scale: 0.28;
		}
	}
	.clock {
		scale: 0.23;
		translate: 40px -35px;
		transition: 0.3s;
		transform-origin: center;
	}

	svg {
		flex-grow: 1;
		overflow: visible;
	}
</style>
