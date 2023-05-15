<script>
	/** @typedef {import('../../types').Participant} Participant */
	/** @typedef {import('../../types').Series} Series */
	/** @typedef {import('../../types').Game} Game */

	import equal from 'fast-deep-equal';
	import clone from 'rfdc/default';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { createGame, calculateScore } from '../../lib/utils';
	import { tourneyStore, playerSorter, gamesSorter } from '../../stores';
	import PlayerSelector from './PlayerSelector.svelte';
	import GameManager from './GameManager.svelte';
	import DataMapper from './DataMapper.svelte';
	import eventHandler from './eventHandler';
	import buildPlayerList from './buildPlayerList';

	/** @type {Series}*/
	export let series;

	/**
	 * List of all players participating in the tourney.
	 * Idle ones (not assigned to any series) are on top.
	 * Others sorted by name.
	 * @type {Participant[]}
	 */
	let tempPlayers;

	/**
	 * Games and additional data of series with this round and selected players.
	 * @type {{ games: Game[], kvMap: [string, []] }}
	 */
	let seriesData;

	/**
	 * Currently selected but not yet saved players.
	 * @type {[ string?, string? ]}
	 **/
	let selectedPlayers = series.players.map((p) => p?.name);

	/**
	 * Reveals `Save` and `Discard` buttons if one of values is `true`.
	 */
	let changed = { players: false, gamesOrMap: false };

	// check if games or kvMap changed
	let firstRender = true;
	$: {
		// they couldn't at first render
		if (firstRender) firstRender = false;
		else {
			const storedData = $tourneyStore.getSeries(series.round, selectedPlayers);
			const gamesHaveChanged = !equal(seriesData.games, storedData.games);
			changed.gamesOrMap = gamesHaveChanged || !equal(seriesData.kvMap, storedData.kvMap);
		}
	}

	/** @type {string} */
	$: score = calculateScore(seriesData.games).join(' - ');

	/** Sets data stored in {@link tourneyStore}. */
	function setData() {
		// tempPlayers are only used for selecting players
		// and player can only be selected in first round
		if (series.round > 0) tempPlayers = null;
		else tempPlayers = buildPlayerList(series, selectedPlayers, $tourneyStore.players);

		seriesData = clone($tourneyStore.getSeries(series.round, selectedPlayers));
		changed.players = series.players.map((p) => p?.name).some((v, i) => selectedPlayers[i] !== v);
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
		if (value === selectedPlayers[1 - i]) {
			selectedPlayers[1 - i] = selectedPlayers[i];
			swapped = false;
		}

		selectedPlayers = [...selectedPlayers];
		selectedPlayers[i] = value || undefined;

		// order is irrelevant
		if (!swapped) setData();
	}

	/** */
	function addGame() {
		const game = createGame({
			round: series.round,
			index: seriesData.games.length,
			players: [...selectedPlayers].sort(playerSorter)
		});
		seriesData.games = [...seriesData.games, game];
	}

	/**
	 * Updates store with data from {@link selectedPlayers} and {@link seriesData}.
	 */
	function save() {
		// deep clone just to be safe
		tourneyStore.update(
			clone({
				changed: changed,
				selectedPlayers,
				series,
				seriesData
			})
		);

		closeEditor();
	}

	/** Discards changes made to {@link selectedPlayers} and {@link seriesData}. */
	function discard() {
		selectedPlayers = series.players.map((p) => p?.name);
		setData();
	}

	/** Button shaking animation timer */
	let timeoutHandler;
	onDestroy(() => clearTimeout(timeoutHandler));

	/**
	 * ACtivated by performing forbidden action.
	 * E.g. trying to exid with unsaved changes.
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
</script>

<editor-outer>
	<editor-inner use:createEventHandler>
		<editor-head>
			{#each selectedPlayers as value, i}
				<PlayerSelector players={tempPlayers} {value} playerIndex={i} on:change={selectPlayer} />
				{#if i === 0}<score-counter aria-label="Score {score}">{score ?? ''}</score-counter>{/if}
			{/each}
		</editor-head>
		{#if selectedPlayers[0] && selectedPlayers[1]}
			<GameManager bind:selectedPlayers bind:games={seriesData.games} />
			<DataMapper
				bind:data={seriesData.kvMap}
				slot="inbetween"
				label="Key-value map for series"
				style="width:100%"
				buttonClass="button"
				buttonsOutside
			/>
			<button type="button" class="button add-game" on:click={addGame}>Add game</button>
		{:else}
			<no-players-notion style:width="unset"
				>Select 2 players to be able to edit series.</no-players-notion
			>
		{/if}
		{#if Object.values(changed).some(Boolean)}
			<button type="button" class="discard button" on:click={discard} class:animated>
				Discard
			</button>
			<button type="button" class="save button" on:click={save} class:animated>Save</button>
		{:else}
			<button type="button" class="close button" on:click={closeEditor}>Close</button>
		{/if}
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

		display: flex;
		flex-wrap: wrap;
		width: 600px;
		max-width: 98vw;
		padding: var(--space-m);
		gap: var(--space-m);

		border: 1px solid gray;
		background-color: var(--color-bg-medium);
		box-shadow: -1px 1px 5px #0003;
		overflow: hidden;
	}

	editor-head {
		display: flex;
		padding: var(--space-m);
		margin: calc(-1 * var(--space-m));
		width: calc(100% + 2 * var(--space-m));
		margin-bottom: 0;
		background-color: var(--color-bg-dark);
		box-shadow: 1px 1px 3px hsl(238 30% 66% / 1);
		border-bottom: 1px solid gray;
	}

	score-counter {
		width: 4ch;
		padding: 0 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25em;
	}

	no-players-notion {
		display: flex;
		align-items: center;
	}

	:global(editor-inner > .button) {
		width: 100px;
		flex-shrink: 1;
		flex-grow: 1;
		white-space: nowrap;
	}

	.close {
		justify-self: flex-end;
	}

	.save {
		--color-highlight: hsl(120, 55%, 70%);
	}
	.discard {
		--color-highlight: hsl(0, 60%, 70%);
	}

	@media (hover: hover) {
		.save:hover:not(:active),
		.discard:hover:not(:active) {
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
	.discard.animated {
		background-color: var(--color-highlight);
		animation-timing-function: ease-in-out;
		animation-direction: alternate-reverse;
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
