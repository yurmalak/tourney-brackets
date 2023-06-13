<svelte:options immutable />

<script>
	import GamePicture from './GamePicture.svelte';
	import starUrl from './star.svg';

	/** @type {import("./types").FrontSeries} */
	export let series;

	/** @type {{ [key:string]: string }}*/
	export let processedPlayers;

	$: ({ players, score, games, data, winner } = series);
</script>

<card-content aria-label="Детали серии" aria-describedby="card-header">
	<!-- players and score -->
	<header id="card-header">
		{#each players as name, i}
			<a class="player-link" href={processedPlayers[name]}>
				{name}
			</a>
			{#if i === 0}<series-score>{score.join('-')}</series-score>{/if}
		{/each}
	</header>

	<!-- games -->
	{#each games as game}
		{@const { towns, starters, blue, replay, roulette, challenges } = game.data}

		<!-- games -->
		<article class={blue === null ? undefined : blue === 0 ? 'blueRed' : 'redBlue'}>
			{#each players as player, i}
				<town-and-starter
					aria-label="Город и стартер, {player}"
					style:grid-column={i === 0 ? 1 : 5}
					style:grid-row="1"
				>
					<GamePicture name={towns[i]} />
					<GamePicture name={starters[i]} />
				</town-and-starter>
				{#if game.winner === i}
					<svg
						class="winner-medal"
						height="30"
						width="20.6"
						style:grid-row="1"
						style:grid-column={i === 0 ? 2 : 4}
						style:justify-self={i === 0 ? 'start' : 'end'}
						style:transform="{i === 0 ? 'rotateY(180deg) ' : ''} translate(85%, -20%) rotate(10deg)"
					>
						<title>Победитель - {player}</title>
						<use href="#medal" />
					</svg>
				{/if}
			{/each}

			<!-- replay link -->
			{#if replay}
				<a href={replay} style:grid-column="3" style:grid-row="1">
					<svg class="play-icon" viewBox="0 0 100 100" height="20" width="30">
						<polygon points="10,15 10,85 90,50" stroke-width="15" stroke-linejoin="round" />
					</svg>
				</a>
			{:else}
				<span style:grid-column="3" style:grid-row="1" />
			{/if}

			<!--  roulette -->
			<ul aria-label="усложнения">
				{#each roulette as rule}
					<li>{rule}</li>
				{/each}
			</ul>

			<!-- challenges -->
			{#if challenges}
				<ul
					class="challenges"
					aria-label="выполненные челленджи"
					style="list-style-image: url({starUrl})"
				>
					{#each Object.entries(challenges) as [name, list]}
						{#each list as text}
							<li>{name}: {text}</li>
						{/each}
					{/each}
				</ul>
			{/if}
		</article>
	{/each}

	<!-- date and time of next game -->
	{#if data.start}
		<upcoming-game>
			{#if games.length > 0}Игра {games.length + 1}: {/if}{data.start}
		</upcoming-game>
	{/if}
</card-content>

<style>
	:global(#absolute-bracket-card-wrapper) {
		background-color: rgb(98, 70, 39);
		border: 4px solid rgb(98, 70, 39);
		box-shadow: 0px 0px 2px 1px black;
	}
	card-content {
		border: 1px solid black;
		background-color: #caa677;
		display: flex;
		flex-direction: column;
	}
	upcoming-game {
		flex-grow: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.2em;
		margin: 0.5em 0;
	}
	header {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		overflow: hidden;
		background-color: #c1833f;
		padding: 7px;
		box-shadow: 0 1px 1px 0 rgba(128, 128, 128, 0.63);
		font-family: sans-serif;
	}
	.player-link {
		text-align: center;
		color: black;
		font-size: 1.2rem;
		justify-self: start;
	}
	.player-link:first-of-type {
		justify-self: end;
	}

	series-score {
		margin: 0 12px;
		white-space: nowrap;
	}

	article {
		display: grid;
		grid-template-columns: auto 1fr auto 1fr auto;
		align-items: center;
		position: relative;
		margin: 4px 0;

		--red: #ef3123;
		--blue: #342bd3;
	}
	article:before,
	article:after {
		content: '';
		position: absolute;
		height: 100%;
		top: 0;
		border-radius: 4px;
	}

	article:before {
		left: 0;
		border-right: 4px solid transparent;
		border-radius: 0 8px 8px 0;
	}
	article:after {
		right: 0;
		border-left: 4px solid transparent;
		border-radius: 8px 0 0 8px;
	}

	.redBlue:after,
	.blueRed:before {
		border-color: var(--blue);
	}
	.blueRed:after,
	.redBlue:before {
		border-color: var(--red);
	}

	/* replay */
	.play-icon > polygon {
		--play-color: hsl(28, 40%, 47%);
		fill: var(--play-color);
		stroke: var(--play-color);
		transition: 0.15s;
	}
	@media (hover: hover) {
		a:hover polygon {
			--play-color: hsl(92, 43%, 40%);
			filter: drop-shadow(1px 1px 2px rgb(42, 58, 22));
		}
	}

	ul {
		grid-column: span 5;
		padding-inline-start: 25px;
		margin: 5px 0;
	}

	li {
		padding-right: 4px;
	}
	.challenges {
		list-style-image: url(star.svg);
	}

	:global(town-and-starter img) {
		margin: 3px;
	}

	town-and-starter {
		display: inline-flex;
		margin: 0 5px;
		flex-direction: row-reverse;
		justify-self: start;
	}
	town-and-starter:nth-of-type(2) {
		flex-direction: row;
		justify-self: end;
	}
</style>
