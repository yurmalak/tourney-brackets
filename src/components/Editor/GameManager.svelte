<script>
	import Switcher from './Switcher.svelte';
	import Game from './Game.svelte';

	export let selectedPlayers;
	export let games;

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

	function label(game) {
		let str = 'Winner switcher.';
		if (selectedPlayers[game.winner]) {
			str += ` Current winner is ${selectedPlayers[game.winner]}.`;
		}
		return str;
	}
</script>

{#if games.length > 0}
	<editor-games>
		<ul aria-label="games">
			{#each games as game, i (game.id)}
				<li aria-label="game">
					<Game bind:data={game.kvMap}>
						<Switcher
							let:style
							let:class={className}
							on:click={() => updateScore(i)}
							{style}
							{className}
							value={game.winner}
							label="Winner"
							aria-label={label(game)}
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

<style>
	editor-games {
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
		border: 1px solid gray;
		box-shadow: 1px 1px 4px hsl(238 30% 66% / 1);
		background-color: var(--color-bg-light);
		margin: var(--space-m) 0;
	}
	li:not(:last-of-type) {
		margin-bottom: var(--space-m);
	}
</style>
