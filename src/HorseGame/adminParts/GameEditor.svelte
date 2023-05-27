<script>
	import Switcher from '../../components/Editor/Switcher.svelte';
	import GamePicture from '../GamePicture.svelte';
	import { heroList } from '../data/h3Data';

	/** @type {object} */
	export let data;

	/** @type {string?} */
	export let winner;

	/** @type {string[]} */
	export let players;

	/**
	 * @param {string} player
	 * @param {string} town
	 */
	function setTown(player, town) {
		data[player].town = town;
		data[player].starter = '';
	}

	function swapColor() {
		const c0 = data[players[0]].color;
		const c1 = data[players[1]].color;
		data[players[0]].color = c1;
		data[players[1]].color = c0;
	}

	function switchWinner() {
		winner = players.indexOf(winner) === 0 ? players[1] : players[0];
	}
</script>

<editor-game>
	<homm3-snippet>
		{#each players as player, i}
			{@const townSelected = Boolean(data[player].town)}
			{@const starterSelected = Boolean(data[player].starter)}

			<!-- 
				town 
			-->
			<select
				on:change={(ev) => setTown(player, ev.target.value)}
				value={data[player].town}
				class="{data[player].color} {townSelected ? '' : 'not-selected'}"
				style:grid-area="t{i}"
				aria-label="{players[i]}'s town"
			>
				<!-- placeholder -->
				{#if townSelected}
					<option value="" />
				{:else}
					<option value="" style="display:none"> Town </option>
				{/if}

				<!-- options -->
				{#each Object.keys(heroList) as town}
					<option value={town}>{town}</option>
				{/each}
			</select>

			<!-- town picture -->
			<GamePicture name={data[player].town} style="grid-area:t{i}pic" />

			<!-- 
				starter 
			-->
			<select
				bind:value={data[player].starter}
				class="{data[player].color} {starterSelected ? '' : 'not-selected'}"
				style:grid-area="s{i}"
				disabled={!townSelected}
				aria-label="{players[i]}'s starter"
			>
				<!-- placeholder -->
				{#if starterSelected}
					<option value="" />
				{:else}
					<option value="" style="display:none">
						{townSelected ? 'Starter' : 'Select town'}
					</option>
				{/if}

				<!-- options -->
				{#each heroList[data[player].town] || [] as starter}
					<option value={starter}>{starter}</option>
				{/each}
			</select>

			<!-- starter picture -->
			<GamePicture name={data[player].starter} style="grid-area:s{i}pic" />
		{/each}

		<Switcher
			label="Winner"
			style="grid-area:winner"
			aria-label="Winner switcher. Current winner - {winner}."
			value={winner === undefined ? undefined : players.indexOf(winner)}
			on:click={switchWinner}
		/>
		<label
			class="swap-color"
			style="grid-area:color"
			aria-label="Color switcher ({players
				.map((name) => `${data[name].color} - ${name}`)
				.join(', ')})."
		>
			<button type="button" class="swap-color" on:click={swapColor} />
			Color
		</label>
	</homm3-snippet>

	<slot name="data-mapper" style="width: 100%" />
	<slot name="kv-creator" />
	<slot name="delete-button" />
</editor-game>

<style>
	editor-game {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		padding: var(--space-m);
		gap: var(--space-l);
		padding: var(--space-m);
	}

	homm3-snippet {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 46px auto 46px 1fr;
		grid-template-rows: 1fr 1fr;
		grid-template-areas:
			't0  t0pic  winner 	t1pic  t1'
			's0	 s0pic  color	s1pic  s1';
		gap: 0 var(--space-m);
	}
	:global(homm3-snippet > img) {
		align-self: center;
	}

	@media (max-width: 600px) {
		homm3-snippet {
			grid-template-columns: 1fr auto 1fr;
			grid-template-areas:
				't0    winner 	  t1'
				's0	   color	  s1';
		}
		:global(homm3-snippet > img),
		:global(img-placeholder) {
			display: none;
		}
	}

	select.not-selected {
		color: gray;
	}
	option {
		background-color: var(--color-input);
		color: black;
	}

	select:disabled {
		opacity: 1;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
	}
	.red {
		background-color: hsl(350deg 55% 90%);
		border: 4px solid hsl(0, 75%, 65%);
	}
	.blue {
		background-color: hsl(237 70% 90% / 1);
		border: 4px solid hsl(240deg, 75%, 65%);
	}

	select:nth-of-type(odd) {
		border-bottom: none;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
	select:nth-of-type(even) {
		border-top: none;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	label.swap-color {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		user-select: none;
		font-size: 0.85em;
	}
	button.swap-color {
		border: none;
		margin: 0;
		padding: 0;
		background-color: transparent;
		cursor: pointer;
		transform-origin: center;
	}
	button.swap-color:after {
		content: '\21C4';
		display: inline-block;
		font-size: 1.8em;
		transform: translateY(5%);
		transform-origin: center;
	}

	@media (hover: hover) {
		button.swap-color:hover:not(:active):after {
			transform: scale(1.05);
			filter: text-shadow(0px 0px 1px hsl(240, 8%, 50%));
		}
	}
</style>
