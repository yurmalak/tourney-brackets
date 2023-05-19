<script>
	import Switcher from '../../components/Editor/Switcher.svelte';
	import GamePicture from '../GamePicture.svelte';
	import { heroList } from '../data/h3Data';

	export let data;
	export let winner;

	function setTown(i, town) {
		data.towns[i] = town;
		data.starters[i] = null;
	}
</script>

<editor-game>
	<homm3-snippet>
		<!-- towns -->
		{#each data.towns as town, i}
			<select
				on:change={(ev) => setTown(i, ev.target.value)}
				class="{data.blue === i ? '' : 'red'} {town ? '' : 'not-selected'}"
				value={town ?? ''}
			>
				<option value="">{town ? '' : 'Town'}</option>
				{#each Object.keys(heroList) as town}
					<option value={town}>
						{town}
					</option>
				{/each}
			</select>

			<!-- Town icons with winner swapper between them -->
			{#if i === 0}
				{#if data.towns[0]}<GamePicture name={town} title="Player 1 town" />
				{:else}<img-placeholder />{/if}
				<Switcher bind:value={winner} label="Winner" />
				{#if data.towns[1]}<GamePicture name={data.towns[1]} title="Player 2 town" />
				{:else}<img-placeholder />{/if}
			{/if}
		{/each}

		<!-- starters -->
		{#each data.starters as starter, i}
			{@const town = data.towns[i]}
			<select
				on:change={(ev) => (data.starters[i] = ev.target.value)}
				class="{data.blue === i ? '' : 'red'} {starter ? '' : 'not-selected'}"
				value={starter ?? ''}
				disabled={!town}
			>
				<option value="">{starter ? '' : town ? 'Starter' : 'Select town first'}</option>
				{#if town}
					{#each heroList[data.towns[i]] || [] as hero}
						<option value={hero}>{hero}</option>
					{/each}
				{/if}
			</select>

			<!-- Starters icons with color swapper between them -->
			{#if i === 0}
				{#if data.starters[0]}<GamePicture name={starter} title="Player 1 starter" />
				{:else}<img-placeholder />{/if}
				<label class="swap-color">
					<button type="button" class="swap-color" on:click={() => (data.blue = 1 - data.blue)} />
					Color
				</label>
				{#if data.starters[1]}<GamePicture name={data.starters[1]} title="Player 2 starter" />
				{:else}<img-placeholder />{/if}
			{/if}
		{/each}
	</homm3-snippet>

	<slot name="data-mapper" style="grid-column:span 3" />
	<slot name="kv-creator" />
	<slot name="delete-button" />
</editor-game>

<style>
	editor-game {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		padding: var(--space-m);
		gap: var(--space-l);
		padding: var(--space-m);
	}

	homm3-snippet {
		display: grid;
		grid-template-columns: 1fr 46px auto 46px 1fr;
		gap: 0 var(--space-m);
		grid-column: span 3;
	}

	@media (max-width: 600px) {
		homm3-snippet {
			grid-template-columns: 1fr auto 1fr;
		}
		:global(homm3-snippet > img),
		img-placeholder {
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

	select {
		background-color: hsl(237 70% 90% / 1);
		border: 4px solid hsl(240deg, 75%, 65%);
	}
	select:disabled {
		opacity: 1;
	}
	.red {
		background-color: hsl(350deg 55% 90%);
		border-color: hsl(0, 75%, 65%);
	}

	select:nth-of-type(-n + 2) {
		border-bottom: none;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
	select:nth-of-type(n + 3) {
		border-top: none;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	label.swap-color {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		user-select: none;
		font-size: 0.85em;
	}
	button.swap-color {
		border: none;
		margin: 0;
		padding: 0;
		background-color: transparent;
		cursor: pointer;
	}
	button.swap-color:after {
		content: '\21C4';
		display: inline-block;
		font-size: 1.8em;
	}

	@media (hover: hover) {
		button.swap-color:hover:not(:active):after {
			transform: scale(1.05);
			filter: drop-shadow(0px 0px 1px hsl(240, 8%, 50%));
		}
	}
</style>
