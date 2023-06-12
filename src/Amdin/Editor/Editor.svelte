<script>
	/** @typedef {import('../../lib/Series').default} Series */
	/** @typedef {import('../../types').KvMap} KvMap */
	/** @typedef {import('../../types').Game} Game */

	import equal from 'fast-deep-equal';
	import clone from 'rfdc/default';
	import { createEventDispatcher } from 'svelte';

	import { calculateScore, createGame } from '../../lib/utils';
	import { playerSorter, kvMapSorter } from '../../lib/Tourney';
	import { tourneyStore } from '../stores';

	import DataMapper from './DataMapper.svelte';
	import eventHandler from './eventHandler';
	import KvFieldCreator from './KvFieldCreator.svelte';
	import DeleteButton from './DeleteButton.svelte';
	import DefaultGameEditor from './GameEditor.svelte';
	import WinnerSwitcher from './WinnerSwitcher.svelte';
	import EditorHeader from './EditorHeader.svelte';
	import AnimatedButton from './AnimatedButton.svelte';

	/** @type {{ series: object, game: object }} */
	export let kvOptions = { series: {}, game: {} };

	/** Optional replacement for DefaultGameEditor */
	export let GameEditor = DefaultGameEditor;

	/** @type {((game: Game, series: Series) => Game) | null}*/
	export let adjustNewGame = null;

	/** @type {boolean} */
	export let blocked = false;

	/** @type {Series[][]}*/
	export let seriesByRound;

	/** @type {Series} */
	export let series;

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

	/** Reveals `Save` and `Discard` buttons if one of values is truthy */
	let changed = { players: false, series: false };

	/** @type {boolean} */
	$: hasBothPlayers = selectedPlayers.every(Boolean);

	/** @type {string} */
	$: score = calculateScore(seriesData.games, selectedPlayers).join(' - ');

	// check if players changed
	$: changed.players = series.players.some((v, i) => selectedPlayers[i] !== v);

	// check if games or kvMap changed
	let firstRender = true;
	$: {
		// they couldn't be at first render
		if (firstRender) firstRender = false;
		else {
			const storedData = $tourneyStore.getSeriesData(series.round, selectedPlayers);
			const gamesHaveChanged = !equal(seriesData.games, storedData.games);
			changed.series = gamesHaveChanged || !equal(seriesData.kvMap, storedData.kvMap);
		}
	}

	// now, on discard and on selected players change
	setData();

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

		const { games, kvMap } = $tourneyStore.getSeriesData(series.round, selectedPlayers);
		seriesData = clone({ games, kvMap });
	}

	/**
	 * Updates store with data from {@link selectedPlayers} and {@link seriesData}.
	 */
	function save() {
		if (blocked) {
			console.warn('Saving is blocked');
			return;
		}

		const updater = {};
		const seriesToUpdate = [series];

		if (changed.players) {
			// ensure it's not called to update anything other than first round
			if (series.round !== 0) {
				return console.error('No manual players selecting allowed for rounds past 1st.');
			}

			// find changed players
			const newPlayers = new Set(selectedPlayers.filter((p) => !series.players.includes(p)));

			// set new players
			series.players = selectedPlayers;

			// check other series of this round
			for (const s of seriesByRound[0]) {
				if (s === series) continue;
				if (!newPlayers.size) break;

				// remove - players can't play more than 1 series in single round
				for (const p of newPlayers) {
					const index = s.players.indexOf(p);
					if (index !== -1) {
						s.players[index] = '';
						seriesToUpdate.push(s);
						newPlayers.delete(p);
					}
				}
			}

			// update participants
			const idlers = [];
			const newPlayerList = seriesByRound[0].flatMap((series) => series.players);

			for (const p of $tourneyStore.data.participants) {
				if (p === '') continue;
				if (!newPlayerList.includes(p)) idlers.push(p);
			}

			idlers.sort(playerSorter);
			updater.participants = newPlayerList.concat(idlers);
		}

		if (changed.series) {
			// first value is a key - drop entries without other values
			const mapFilter = (entry) => entry.some((v, i) => i > 0 && Boolean(v));

			const { games, kvMap } = seriesData;
			series.kvMap = kvMap.filter(mapFilter).sort(kvMapSorter);
			series.games = games.map((game) => {
				game.kvMap = game.kvMap.filter(mapFilter).sort(kvMapSorter);
				return game;
			});

			updater.series = series;
		}

		// update store and db
		tourneyStore.update(updater);

		// update score, winner and trigger same update of descendants
		for (const s of seriesToUpdate) s.update();

		// trigger bracket rerender
		seriesByRound = [...seriesByRound];
		closeEditor();
	}

	/** */
	function addGame() {
		let game = createGame();
		if (adjustNewGame) game = adjustNewGame(game, { ...series, players: selectedPlayers });
		seriesData.games = [...seriesData.games, game];
	}

	/** @type {number} gameIndex */
	function deleteGame(gameIndex) {
		seriesData.games = seriesData.games.filter((_, i) => i !== gameIndex);
	}

	/** Discards changes made to {@link selectedPlayers} and {@link seriesData}. */
	function discard() {
		selectedPlayers = [...series.players];
		setData();
	}

	// setup event handlers
	// Escape and click outside tries to close Editor
	// they fail and activate animation If `changed` has truthy values
	let animated = false;
	const dispatch = createEventDispatcher();
	const closeEditor = () => dispatch('toggleEditor');
	const animateButtons = () => (animated = true);
	const createEventHandler = (el) => eventHandler(el, changed, closeEditor, animateButtons);
</script>

<editor-outer>
	<editor-inner use:createEventHandler>
		<EditorHeader bind:selectedPlayers {tempPlayers} {score} update={setData} />

		<editor-body>
			{#if hasBothPlayers}
				<ul aria-label="games">
					{#each seriesData.games as { data, winner, kvMap, id }, i (id)}
						<li aria-label="game">
							<!-- Possibly injected component -->
							<svelte:component this={GameEditor} players={selectedPlayers} bind:data>
								<WinnerSwitcher
									bind:winner
									players={selectedPlayers}
									slot="winner-switcher"
									let:style
									{style}
								/>
								<DataMapper
									let:style
									let:className
									{style}
									{className}
									bind:kvMap
									slot="data-mapper"
									ariaLabel="Key-value map for game {i + 1}"
									options={kvOptions.game}
									players={selectedPlayers}
								/>
								<KvFieldCreator
									bind:kvMap
									let:style
									{style}
									className="button-no-bg"
									slot="kv-creator"
									options={kvOptions.game}
									listSeeker={(element) =>
										element
											.closest('li[aria-label="game"]')
											.querySelector('.data-mapper-container > dl')}
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
					players={selectedPlayers}
					ariaLabel="Key-value map for series"
					style="width:100%"
				/>
			{/if}
		</editor-body>

		<editor-footer>
			{#if hasBothPlayers}
				<KvFieldCreator
					bind:kvMap={seriesData.kvMap}
					slot="kv-creator"
					className="button"
					options={kvOptions.series}
					listSeeker={(element) =>
						element
							.closest('editor-inner')
							.querySelector('editor-body > .data-mapper-container > dl')}
				/>
				<button type="button" class="button add-game" on:click={addGame}>Add game</button>
			{:else}
				<no-players-notion>You need 2 players to be able to edit series.</no-players-notion>
			{/if}

			{#if Object.values(changed).some(Boolean)}
				<button type="button" class="discard button" on:click={discard}>Discard</button>
				<AnimatedButton
					bind:animated
					on:click={save}
					class="save button"
					colorHighlight="hsl(120, 55%, 70%)"
				>
					Save
				</AnimatedButton>
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
</style>
