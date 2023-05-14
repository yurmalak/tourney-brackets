<script>
	import Switcher from './Switcher.svelte';
	import Game from './Game.svelte';
	import { createGame } from '../../lib/utils';

	export let selectedPlayers;
	export let round;
	export let games;

	function addGame() {
		const game = createGame({
			round,
			index: games.length,
			players: [...selectedPlayers]
		});
		games = [...games, game];
	}

	function deleteGame(gameIndex) {
		games.splice(gameIndex, 1);
		games.sort((a, b) => a.index - b.index);
		games = games.map((g, index) => ({ ...g, index }));
	}

	function updateScore(gameIndex) {
		const game = games[gameIndex];
		game.winner = 1 - game.winner || 0;
		games[gameIndex] = { ...game };
		games = [...games];
	}
</script>

{#if games.length > 0}
	<editor-games>
		<ul aria-label="games">
			{#each games as game, i (game.id)}
				<li aria-label="game">
					<Game bind:data={game.data}>
						<Switcher
							let:style
							let:class={className}
							on:click={() => updateScore(i)}
							{style}
							{className}
							value={game.winner}
							label="Winner"
							aria-label="Winner switcher. Current winner is {selectedPlayers[game.winner]}"
							slot="score-switcher"
						/>
						<button
							let:style
							let:class={className}
							let:text
							on:click={() => deleteGame(i)}
							class={className}
							aria-label="Delete game {i + 1}"
							slot="delete-game"
							type="button"
							{style}
						>
							{text ?? 'Delete game'}
						</button>
					</Game>
				</li>
			{/each}
		</ul>
	</editor-games>
{/if}

<slot name="inbetween" />

<button type="button" class="button add-game" on:click={addGame}>Add game</button>

<style>
	editor-games {
		padding: var(--padding);
		padding-bottom: 0;
		border-bottom: var(--border-inner);
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style-type: none;
	}

	li {
		border: 1px solid lightgray;
		box-shadow: 1px 1px 3px #878da0;
		background-color: var(--color-bg-light);
	}
	li:not(:last-of-type) {
		margin-bottom: var(--space-m);
	}

	.add-game {
		margin: var(--padding);
	}
</style>
