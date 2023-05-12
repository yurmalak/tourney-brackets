<script>
	/** @typedef {import('../../types').Participant} Participant */
	/** @typedef {import('../../types').Series} Series */
	/** @typedef {import('../../types').Game} Game */

	import equal from 'fast-deep-equal';
	import clone from 'rfdc/default';
	import { createEventDispatcher } from 'svelte';
	import { tourneyStore } from '../../stores';
	import { calculateScore, createGame } from '../../lib/utils';
	import PlayerSelector from './PlayerSelector.svelte';
	import Game from './Game.svelte';
	import Switcher from './Switcher.svelte';

	/** @type {Series}*/
	export let series;

	/** @type {string[] | null} */
	const selectedPlayers = series.players.map((p) => p?.name);

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
	function selectPlayer(ev, i) {
		const { value } = ev.target;

		// swap if selected second player
		if (value === selectedPlayers[1 - i]) {
			selectedPlayers[1 - i] = selectedPlayers[i];
		}
		selectedPlayers[i] = value;
	}

	/**
	 * Updates {@link tempGames}
	 * @param {number} gameIndex
	 */
	function updateScore(gameIndex) {
		const game = tempGames[gameIndex];
		game.winner = 1 - game.winner || 0;
		tempGames[gameIndex] = { ...game };

		// to make switcher move like 0 => undefined => 1 => undefined => 0
		// place `memory` outside of the function and clear when `tempGames` change
		// if (current === undefined) {
		// 	game.winner = 1 - (memory[game.id] ?? 1);
		// } else {
		// 	game.winner = undefined;
		// 	memory[game.id] = current;
		// }
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

	const dispatch = createEventDispatcher();
	function close() {
		dispatch('toggleEditor');
	}

	/**
	 * @param {HTMLElement} editor
	 */
	function useHandler(editor) {
		/** Closes window if nothing changed or after confirmation */
		function maybeClose() {
			if ((!changed.games && !changed.players) || confirm("Series won't be saved. Still close?")) {
				close();
			}
		}
		function handleClickOutside(ev) {
			if (editor.contains(ev.target)) return;
			maybeClose();
		}

		function keyboardHandler(ev) {
			switch (ev.code) {
				case 'Escape':
					maybeClose();
					break;

				case 'Tab':
					const tabbables = Array.from(editor.querySelectorAll(tabbableSelector));
					const index = tabbables.indexOf(ev.target) + (ev.shiftKey ? -1 : 1);

					let ignore = false;
					if (index >= tabbables.length) tabbables[0].focus();
					else if (index === -1) tabbables[tabbables.length - 1].focus();
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

		const tabbableSelector = 'a, button, input, select, [contenteditable]';

		document.addEventListener('keydown', keyboardHandler, true);
		document.addEventListener('click', handleClickOutside, true);
		return {
			destroy: () => {
				document.removeEventListener('keydown', keyboardHandler, true);
				document.removeEventListener('click', handleClickOutside, true);
			}
		};
	}
</script>

<editor-outer>
	<editor-inner use:useHandler>
		<editor-head>
			{#each selectedPlayers as value, i}
				<PlayerSelector players={tempPlayers} {value} on:change={(ev) => selectPlayer(ev, i)} />
				{#if i === 0}<score-counter>{score}</score-counter>{/if}
			{/each}
		</editor-head>
		{#if selectedPlayers[0] && selectedPlayers[1]}
			<editor-games>
				<ul>
					{#each tempGames as { id, data, winner: value }, i (id)}
						<li>
							<Game {data} on:save={(gameData) => save(gameData, i)}>
								<Switcher
									let:style
									let:class={className}
									on:click={() => updateScore(i)}
									{value}
									{style}
									{className}
									label="Winner"
									slot="score-switcher"
								/>
								<button
									let:style
									let:class={className}
									on:click={() => deleteGame(i)}
									type="button"
									slot="delete-game"
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
			<button type="button" on:click={save} disabled={!changed.games && !changed.players}>
				Save
			</button>
			<button type="button" on:click={close}>Close</button>
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

	editor-buttons {
		padding: var(--padding);
		border-top: var(--border-inner);
	}
</style>
