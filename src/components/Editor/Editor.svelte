<script>
	/** @typedef {import('../../types').Participant} Participant */
	/** @typedef {import('../../types').Series} Series */
	/** @typedef {import('../../types').Game} Game */

	import equal from 'fast-deep-equal';
	import clone from 'rfdc/default';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { calculateScore } from '../../lib/utils';
	import { tourneyStore } from '../../stores';
	import PlayerSelector from './PlayerSelector.svelte';
	import GameManager from './GameManager.svelte';
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
	 * @type {{ games: Game[], data: [string, string[]][] }}
	 */
	let seriesData;

	/**
	 * Currently selected but not yet saved players.
	 * @type {[ string?, string? ]}
	 **/
	let selectedPlayers = series.players.map((p) => p?.name);

	/** @type {{ players: boolean, games: boolean }} */
	let changed = { players: false, games: false };

	// check if games changed if not first render
	let firstRender = true;
	$: {
		if (firstRender) firstRender = false;
		else {
			changed.games = !equal(
				seriesData.games,
				$tourneyStore.getSeries(series.round, selectedPlayers).games
			);
		}
	}

	/** @type {string} */
	$: score = calculateScore(seriesData.games).join(' - ');

	/** Sets fills editor with data from {@link tourneyStore} */
	function setData() {
		// tempPlayers are only used for selecting players
		// and player can only be selected in first round
		tempPlayers =
			series.round > 0 ? null : buildPlayerList(series, selectedPlayers, $tourneyStore.players);
		seriesData = clone($tourneyStore.getSeries(series.round, selectedPlayers));
		changed.players = series.players.map((p) => p?.name).some((v, i) => selectedPlayers[i] !== v);
	}

	/**
	 * Updates {@link selectedPlayers}
	 * @param {Event} ev
	 * @param {0|1} i - player's index within series
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

		if (!swapped) setData();
	}

	/**
	 * Saves {@link selectedPlayers} and {@link seriesData}.
	 */
	function save() {
		tourneyStore.update({
			changed,
			selectedPlayers,
			series,
			seriesGames: seriesData.games.map((g) => clone(g)) // deep clone just to be safe
			// data
		});

		closeEditor();
	}

	/** Discards changes made to {@link selectedPlayers} and {@link seriesData}. */
	function discard() {
		selectedPlayers = series.players.map((p) => p?.name);
		setData();
	}

	let timeoutHandler;
	onDestroy(() => clearTimeout(timeoutHandler));

	let animated = false;
	const animation = { active: false };
	$: {
		animated = animation.active;
		timeoutHandler = setTimeout(() => {
			clearTimeout(timeoutHandler);
			animation.active = false;
		}, 400);
	}

	const dispatch = createEventDispatcher();
	const closeEditor = () => dispatch('toggleEditor');
	const createEventHandler = (el) => eventHandler(el, closeEditor, changed, animation);

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
			<GameManager round={series.round} bind:selectedPlayers bind:games={seriesData.games} />
		{:else}
			<no-players-notion style:width="unset"
				>Select 2 players to be able to edit series.</no-players-notion
			>
		{/if}
		<editor-buttons>
			{#if changed.games || changed.players}
				<button type="button" class="discard button" on:click={discard} class:animated>
					Discard
				</button>
				<button type="button" class="save button" on:click={save} class:animated>Save</button>
			{:else}
				<button type="button" class="button" on:click={closeEditor}>Close</button>
			{/if}
		</editor-buttons>
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
		--padding: 0.8rem 0.5rem;
		--border-inner: 1px solid lightgray;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		display: flex;
		flex-wrap: wrap;
		width: 600px;
		max-width: 98vw;

		border: 1px solid gray;
		background-color: var(--color-bg-medium);
		box-shadow: -1px 1px 5px #0003;
		overflow: hidden;
	}

	editor-head {
		display: flex;
		padding: var(--padding);
		border-bottom: var(--border-inner);
		width: 100%;
		background-color: var(--color-bg-dark);
		box-shadow: 1px 1px 3px gray;
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
		padding: var(--padding);
		display: flex;
		align-items: center;
	}

	editor-buttons {
		padding: var(--padding);
		flex-grow: 1;
		display: flex;
		justify-content: end;
	}

	editor-buttons > button {
		width: 6rem;
	}

	.save {
		margin-left: 1rem;
	}

	.animated {
		animation-duration: 200ms;
		animation-name: attention-shake;
		animation-iteration-count: infinite;
		animation-timing-function: ease-out;
		animation-direction: normal;

		background-color: hsl(120, 60%, 60%);
	}
	.discard.animated {
		background-color: hsl(0, 70%, 60%);
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
