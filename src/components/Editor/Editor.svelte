<script>
	/** @typedef {import('../../types').Series} Series */
	/** @typedef {import('../../types').KvMap} KvMap */
	/** @typedef {import('../../types').Game} Game */

	import equal from 'fast-deep-equal';
	import clone from 'rfdc/default';
	import { createEventDispatcher, onDestroy, getContext } from 'svelte';
	import { configKey } from '$lib/context';
	import { calculateScore } from '$lib/utils';
	import { playerSorter } from '$lib/Tourney';
	import { tourneyStore } from '../../stores';
	import PlayerSelector from './PlayerSelector.svelte';
	import DataMapper from './DataMapper.svelte';
	import eventHandler from './eventHandler';
	import KvFieldCreators from './KvFieldCreators.svelte';
	import DeleteButton from './DeleteButton.svelte';

	/** @type {boolean} */
	export let blocked = false;

	/** @type {Series}*/
	export let series;
	const { GameEditor, createGame, kvOptions } = getContext(configKey);

	/**
	 * List of all players participating in the tourney.
	 * Idle ones (not assigned to any series) are on top.
	 * Others sorted by name.
	 * @type {{ idle: string[], busy: string[] } | null}
	 */
	let tempPlayers;

	/**
	 * Games and additional data of series with this round and selected players.
	 * @type {{ games: Game[], kvMap: KvMap }}
	 */
	let seriesData;

	/**
	 * Currently selected but not yet saved players.
	 * @type {[ string?, string? ]}
	 **/
	let selectedPlayers = [...series.players];

	/**
	 * Reveals `Save` and `Discard` buttons if one of values is truthy.
	 */
	let changed = { players: false, series: false };
	$: changed.players = series.players.some((v, i) => selectedPlayers[i] !== v);

	// check if games or kvMap changed
	let firstRender = true;
	$: {
		// they couldn't be at first render
		if (firstRender) firstRender = false;
		else {
			const storedData = $tourneyStore.getSeries(series.round, selectedPlayers);
			const gamesHaveChanged = !equal(seriesData.games, storedData.games);
			changed.series = gamesHaveChanged || !equal(seriesData.kvMap, storedData.kvMap);
		}
	}

	/** @type {string} */
	$: score = calculateScore(seriesData.games, selectedPlayers).join(' - ');

	/**
	 * Sets deep copy of games and kvMaps stored in {@link tourneyStore}
	 * free to update by other components.
	 */
	function setData() {
		const { participants, playersTotal } = $tourneyStore.data;

		// players selected automatically after 1st round
		if (series.round > 0) tempPlayers = null;
		// split players into busy and idle
		// move selected to busy and de-selected to idle
		else {
			const players = [...participants];
			const idle = players.slice(playersTotal);
			const busy = players.slice(0, playersTotal);

			const arrs = [series.players, selectedPlayers];
			for (let i = 0; i < 2; i++) {
				for (const player of arrs[i]) {
					if (arrs[1 - i].includes(player)) continue;

					const index = busy.indexOf(player);
					// de-select
					if (!i) {
						delete busy[index];
						idle.push(player);
					}
					// move from idle if it's not busy already
					else if (index === -1) {
						busy.push(player);
						delete idle[idle.indexOf(player)];
					}
				}
			}

			tempPlayers = {
				idle: idle.filter(Boolean).sort(playerSorter),
				busy: busy.filter(Boolean).sort(playerSorter)
			};
		}

		seriesData = clone($tourneyStore.getSeries(series.round, selectedPlayers));
	}

	/**
	 * Updates {@link selectedPlayers}
	 * @param {Event} ev
	 */
	function selectPlayer(ev) {
		const { value, dataset } = ev.target;
		const i = Number(dataset.playerIndex);

		// swap if selected second player
		let swapped = false;
		if (value && value === selectedPlayers[1 - i]) {
			selectedPlayers[1 - i] = selectedPlayers[i];
			swapped = true;
		}

		selectedPlayers[i] = value;

		// order is irrelevant
		if (!swapped) setData();
	}

	/** */
	function addGame() {
		const game = createGame({ ...series, players: selectedPlayers });
		seriesData.games = [...seriesData.games, game];
	}

	/** @type {number} gameIndex */
	function deleteGame(gameIndex) {
		seriesData.games = seriesData.games.filter((_, i) => i !== gameIndex);
	}

	/**
	 * Updates store with data from {@link selectedPlayers} and {@link seriesData}.
	 */
	function save() {
		if (blocked) {
			console.warn('Saving is blocked');
			return;
		}

		// deep clone just to be safe
		tourneyStore.update(
			clone({
				changed,
				selectedPlayers,
				series,
				seriesData
			})
		);

		closeEditor();
	}

	/** Discards changes made to {@link selectedPlayers} and {@link seriesData}. */
	function discard() {
		selectedPlayers = [...series.players];
		setData();
	}

	/** Button shaking animation timeout */
	let timeoutHandler;
	onDestroy(() => clearTimeout(timeoutHandler));

	/**
	 * Activated by performing forbidden action.
	 * E.g. trying to exit with unsaved changes.
	 */
	let animated = false;
	$: if (animated) {
		timeoutHandler = setTimeout(() => {
			clearTimeout(timeoutHandler);
			animated = false;
		}, 400);
	}

	const dispatch = createEventDispatcher();
	const closeEditor = () => dispatch('toggleEditor');
	const animateButtons = () => (animated = true);
	const createEventHandler = (el) => eventHandler(el, changed, closeEditor, animateButtons);

	setData();
	$: hasBothPlayers = selectedPlayers[0] && selectedPlayers[1];
</script>

<editor-outer>
	<editor-inner use:createEventHandler>
		<editor-header>
			{#each selectedPlayers as player, i}
				<PlayerSelector players={tempPlayers} {player} playerIndex={i} on:change={selectPlayer} />
				{#if i === 0}<score-counter aria-label="Score {score}">{score}</score-counter>{/if}
			{/each}
		</editor-header>

		<editor-body>
			{#if hasBothPlayers}
				<ul aria-label="games">
					{#each seriesData.games as { data, winner, kvMap, id }, i (id)}
						<li aria-label="game">
							<!-- Possibly injected component -->
							<svelte:component this={GameEditor} players={selectedPlayers} bind:data bind:winner>
								<DataMapper
									let:style
									let:className
									{style}
									{className}
									bind:kvMap
									slot="data-mapper"
									label="Key-value map for game {i + 1}"
									options={kvOptions.game}
								/>
								<KvFieldCreators
									bind:kvMap
									slot="kv-creator"
									className="button-no-bg"
									newKeyFieldSeeker={(ev) => {
										const selector = `editor-body li[aria-label="game"]:nth-of-type(${i + 1})`;
										const gameLi = ev.target.closest(selector);
										const newKeyField = gameLi.querySelector('select');
										return newKeyField;
									}}
								/>
								<DeleteButton
									slot="delete-button"
									class="button-no-bg"
									on:deleteGame={() => deleteGame(i)}
								>
									<svelte:fragment slot="normal">Delete game</svelte:fragment>
									<svelte:fragment slot="clicked">Confirm</svelte:fragment>
								</DeleteButton>
							</svelte:component>
						</li>
					{/each}
				</ul>
				<DataMapper
					bind:kvMap={seriesData.kvMap}
					options={kvOptions.series}
					label="Key-value map for series"
					style="width:100%"
				/>
			{/if}
		</editor-body>

		<editor-footer>
			{#if hasBothPlayers}
				<KvFieldCreators
					className="button"
					bind:kvMap={seriesData.kvMap}
					newKeyFieldSeeker={(ev) => {
						const editor = ev.target.closest('editor-inner');
						const newKeyField = editor.querySelector('dl:last-of-type > dt:last-of-type > select');
						return newKeyField;
					}}
				/>
				<button type="button" class="button add-game" on:click={addGame}>Add game</button>
			{:else}
				<no-players-notion>You need 2 players to be able to edit series.</no-players-notion>
			{/if}

			{#if Object.values(changed).some(Boolean)}
				<button type="button" class="discard button" on:click={discard}>Discard </button>
				<button type="button" class="save button" on:click={save} class:animated>Save</button>
			{:else}
				<button
					type="button"
					class="close button{hasBothPlayers ? '' : ' alone'}"
					on:click={closeEditor}
				>
					Close
				</button>
			{/if}
		</editor-footer>
	</editor-inner>
</editor-outer>

<style>
	editor-outer {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-color: #c8c8c88f;
	}

	editor-inner {
		--border-inner: 1px solid lightgray;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		width: 600px;
		max-width: 94vw;
		height: 70vh;
		display: flex;
		flex-direction: column;
		gap: var(--space-m);

		border: 1px solid gray;
		background-color: var(--color-bg-medium);
		box-shadow: -1px 1px 5px #0003;
		overflow: auto;
	}

	editor-header {
		display: flex;
		padding: var(--space-m);
		background-color: var(--color-bg-dark);
		box-shadow: 1px 1px 3px hsl(238 30% 66% / 1);
		border-bottom: 1px solid gray;
	}

	editor-body {
		padding: var(--space-m);
		flex-grow: 1;
		overflow: auto;
	}

	editor-footer {
		padding: var(--space-m);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-m);
		background-color: inherit;
	}

	score-counter {
		width: 4ch;
		padding: 0 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25em;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style-type: none;
		flex-grow: 1;
	}

	li {
		border: 1px solid gray;
		box-shadow: 1px 1px 4px hsl(238 30% 66% / 1);
		background-color: var(--color-bg-light);
		margin: var(--space-m) 0;
	}
	li:not(:last-of-type) {
		margin-bottom: var(--space-m);
	}

	no-players-notion {
		display: flex;
		align-items: center;
	}

	:global(editor-inner .button) {
		width: 100px;
		flex-shrink: 1;
		flex-grow: 1;
		white-space: nowrap;
	}

	.close.alone {
		margin-left: auto;
		flex-grow: 0;
	}

	.save {
		--color-highlight: hsl(120, 55%, 70%);
	}

	@media (hover: hover) {
		.save:hover:not(:active) {
			background-color: var(--color-highlight);
		}
	}

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
</style>
