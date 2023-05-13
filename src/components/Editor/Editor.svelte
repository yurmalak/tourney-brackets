<script>
	/** @typedef {import('../../types').Participant} Participant */
	/** @typedef {import('../../types').Series} Series */
	/** @typedef {import('../../types').Game} Game */

	import equal from 'fast-deep-equal';
	import clone from 'rfdc/default';
	import { onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { tourneyStore } from '../../stores';
	import { calculateScore, createGame } from '../../lib/utils';
	import PlayerSelector from './PlayerSelector.svelte';
	import Game from './Game.svelte';
	import Switcher from './Switcher.svelte';

	/** @type {Series}*/
	export let series;

	/** @type {string[] | null} */
	let selectedPlayers = series.players.map((p) => p?.name);

	/*
	 *
	 * REACTIVITY
	 *
	 */

	/** @type {Participant[]}*/
	let tempPlayers;
	$: {
		if (series.round > 0) {
			// tempPlayers are only used for selecting players
			// and player can only be selected in first round
			tempPlayers = null;
		} else {
			const adjustments = selectedPlayers.map((p) => !p);

			// temporarily edit de-selected players
			// until either saved or discarded
			tempPlayers = $tourneyStore.players.map((p) => {
				const currentIndex = selectedPlayers.indexOf(p.name);
				if (currentIndex === -1 && p.sIndex === series.index) {
					adjustments[currentIndex] = true;
					return { ...p, sIndex: null };
				}
				return p;
			});

			// temporarily edit newly selected players
			adjustments.forEach((done, i) => {
				if (done) return;

				const name = selectedPlayers[i];
				if (!name) return;

				const playerIndex = tempPlayers.findIndex((p) => p.name === name);
				tempPlayers[playerIndex] = { ...tempPlayers[playerIndex], sIndex: series.index };
			});

			// put idle players at the start of the list
			tempPlayers.sort((a, b) =>
				a.sIndex === null && b.sIndex === null
					? 0
					: a.sIndex === null
					? -1
					: b.sIndex === null
					? 1
					: a.name.localeCompare(b.name)
			);
		}
	}

	/** @type {Game[]}*/
	$: tempGames = clone($tourneyStore.getGames(series.round, selectedPlayers));

	/** @type {string} */
	$: score = calculateScore(tempGames).join(' - ');

	/** @type {{ players: boolean, games: boolean }} */
	$: changed = {
		players: series.players.map((p) => p?.name).some((v, i) => selectedPlayers[i] !== v),
		games: !equal(tempGames, $tourneyStore.getGames(series.round, selectedPlayers))
	};

	/*
	 *
	 *  HANDLERS
	 *
	 */

	/**
	 * Updates {@link selectedPlayers}
	 * @param {Event} ev
	 * @param {0|1} i - player's index within series
	 */
	function selectPlayer(ev) {
		const { value, dataset } = ev.target;
		const i = Number(dataset.playerIndex);

		// swap if selected second player
		if (value === selectedPlayers[1 - i]) {
			selectedPlayers[1 - i] = selectedPlayers[i];
		}
		selectedPlayers[i] = value || undefined;
	}

	/**
	 * Updates {@link tempGames}
	 * @param {number} gameIndex
	 */
	function updateScore(gameIndex) {
		const game = tempGames[gameIndex];
		game.winner = 1 - game.winner || 0;
		tempGames[gameIndex] = { ...game };
	}

	/**
	 * Adds game to {@link tempGames}
	 */
	function addGame() {
		const game = createGame({
			round: series.round,
			index: tempGames.length,
			players: [...selectedPlayers]
		});
		tempGames = [...tempGames, game];
	}

	/**
	 * Deletes game from {@link tempGames}
	 * @param {number} gameIndex
	 */
	function deleteGame(gameIndex) {
		tempGames.splice(gameIndex, 1);
		tempGames.sort((a, b) => a.index - b.index);
		tempGames = tempGames.map((game, index) => ({ ...game, index }));
	}

	/**
	 * Saves {@link selectedPlayers} and {@link tempGames} to {@link tourneyStore}.
	 */
	function save() {
		tourneyStore.update({
			changed,
			selectedPlayers,
			series,
			seriesGames: tempGames.map((g) => clone(g)) // deep clone just to be safe
		});

		close();
	}

	/**
	 * Revert changes to match {@link tourneyStore}
	 */
	function discard() {
		// tempPlayers and tempGames depend on this
		selectedPlayers = series.players.map((p) => p?.name);
	}

	const dispatch = createEventDispatcher();
	function close() {
		dispatch('toggleEditor');
	}

	/**
	 * @param {HTMLElement} editor
	 */
	function eventHandler(editor) {
		/**
		 * Closes window if nothing changed, suggests to save or discard otherwise.
		 */
		function maybeClose() {
			if (!changed.games && !changed.players) close();
			else {
				// animate buttons and focus discard button
				editor.querySelector('.discard').focus();
				animated = true;
			}
		}

		/** @type {Event} */
		function handleClickOutside(ev) {
			if (editor.contains(ev.target)) return;
			maybeClose();
		}

		/** @type {Event} */
		function keyboardHandler(ev) {
			switch (ev.code) {
				case 'Escape':
					maybeClose();
					break;

				// lock focus inside
				case 'Tab':
					const tabbables = Array.from(editor.querySelectorAll(tabbableSelector));
					const index = tabbables.indexOf(ev.target);
					const nextIndex = index + (ev.shiftKey ? -1 : 1);
					const { length } = tabbables;

					let ignore = false;
					if (nextIndex === length) tabbables[0].focus();
					else if (index === -1) tabbables[length - 1].focus();
					else ignore = true;

					if (!ignore) {
						ev.preventDefault();
						ev.stopPropagation();
					}
					break;

				default:
					return;
			}
		}

		// focus on close button after opening
		// it's last so, combined with Tab listener next tab will put focus on first element
		// also allows to close immediately
		const tags = ['a', 'button', 'input', 'select', '[contenteditable]'];
		const tabbableSelector = tags.join(':enabled, ') + ':enabled';
		const list = editor.querySelectorAll(tabbableSelector);
		const closeButton = list[0];
		closeButton?.focus();

		document.addEventListener('keydown', keyboardHandler, true);
		document.addEventListener('click', handleClickOutside, true);
		return {
			destroy: () => {
				document.removeEventListener('keydown', keyboardHandler, true);
				document.removeEventListener('click', handleClickOutside, true);
			}
		};
	}

	// shake save and discard buttons if forbidden to exit
	let animated = false,
		timeoutHandler;
	$: if (animated) {
		timeoutHandler = setTimeout(() => {
			clearTimeout(timeoutHandler);
			animated = false;
		}, 400);
	}
	onDestroy(() => clearTimeout(timeoutHandler));
</script>

<editor-outer>
	<editor-inner use:eventHandler>
		<editor-head>
			{#each selectedPlayers as value, i}
				<PlayerSelector players={tempPlayers} {value} playerIndex={i} on:change={selectPlayer} />
				{#if i === 0}<score-counter aria-label="Score">{score}</score-counter>{/if}
			{/each}
		</editor-head>
		{#if selectedPlayers[0] && selectedPlayers[1]}
			<editor-games>
				<ul aria-label="games">
					{#each tempGames as { id, data, winner: value }, i (id)}
						<li aria-label="game">
							<Game {data} on:save={(gameData) => save(gameData, i)}>
								<Switcher
									let:style
									let:class={className}
									on:click={() => updateScore(i)}
									{value}
									{style}
									{className}
									label="Winner"
									aria-label="Winner switcher. Current is {series.players[value]?.name}"
									slot="score-switcher"
								/>
								<button
									let:style
									let:class={className}
									on:click={() => deleteGame(i)}
									type="button"
									slot="delete-game"
									aria-label="delete game"
								>
									Delete
								</button>
							</Game>
						</li>
					{/each}
				</ul>
				<button type="button" on:click={addGame}> Add game </button>
			</editor-games>
		{/if}
		<editor-buttons>
			{#if changed.games || changed.players}
				<button type="button" class="discard" on:click={discard} class:animated>Discard</button>
				<button type="button" class="save" on:click={save} class:animated>Save</button>
			{:else}
				<button type="button" on:click={close}>Close</button>
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
		background-color: #c1c1c799;
	}

	editor-inner {
		--padding: 0.8rem 0.5rem;
		--border-inner: 1px solid lightgray;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		display: flex;
		flex-direction: column;
		width: 600px;
		max-width: 98vw;

		border: 1px solid gray;
		background-color: var(--color-bg-dark);
		box-shadow: -1px 1px 5px #0003;
	}

	editor-head {
		display: flex;
		padding: var(--padding);
		border-bottom: var(--border-inner);
	}

	score-counter {
		width: 4ch;
		padding: 0 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	editor-games {
		padding: var(--padding);
		border-bottom: var(--border-inner);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style-type: none;
	}

	editor-buttons {
		padding: var(--padding);
		align-self: flex-end;
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
	}
	.discard.animated {
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
