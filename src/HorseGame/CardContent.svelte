<svelte:options immutable />

<script>
	import GamePicture from './GamePicture.svelte';
	import starUrl from './star.svg';

	/** @type {import("./types").FrontSeries} */
	export let series;

	$: ({ players, score, games, data } = series);
</script>

<card-content aria-label="Детали серии" aria-describedby="card-header">
	<!-- players and score -->
	<header id="card-header">
		{#each players as { name, url }, i}
			<a class="player-link" href={url}>
				{name}
			</a>
			{#if i === 0}<series-score>{score.join('-')}</series-score>{/if}
		{/each}
	</header>

	<!-- games -->
	{#each games as game}
		{@const {
			towns: [t1, t2],
			starters: [s1, s2],
			blue
		} = game}

		<!-- games -->
		<article class={blue === null ? undefined : blue === 0 ? 'blueRed' : 'redBlue'}>
			<!-- 1st player's -->
			<div class="town-and-starter">
				<GamePicture name={s1} />
				<GamePicture name={t1} />
			</div>

			<!-- replay link -->
			{#if 'replay' in game}
				<a href={game.replay}>
					<svg viewBox="0 0 100 100" height="20" width="30" class="play-icon">
						<polygon points="10,15 10,85 90,50" stroke-width="15" stroke-linejoin="round" />
					</svg>
				</a>
			{:else}<span />{/if}

			<!-- 2nd player's -->
			<div class="town-and-starter">
				<GamePicture name={t2} />
				<GamePicture name={s2} />
			</div>

			<!--  roulette -->
			<ul aria-label="усложнения">
				{#each game.roulette as rule}
					<li>{rule}</li>
				{/each}
			</ul>

			<!-- challenges -->
			{#if game.challenges}
				<ul
					class="challenges"
					aria-label="выполненные челленджи"
					style="list-style-image: url({starUrl})"
				>
					{#each Object.entries(game.challenges) as [name, list]}
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
		grid-template-columns: 1fr auto 1fr;
		position: relative;
		overflow: hidden;
		align-items: center;
		margin: 4px 0;

		--red: #ef3123;
		--blue: #342bd3;
	}
	article:before,
	article:after {
		content: '';
		position: absolute;
		height: 100%;
		width: 8px;
		top: 0;
		left: -4px;
		border-radius: 4px;
	}
	article:after {
		left: unset;
		right: -4px;
	}
	.redBlue:after,
	.blueRed:before {
		background-color: var(--blue);
	}
	.blueRed:after,
	.redBlue:before {
		background-color: var(--red);
	}

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
		grid-column: span 3;
		padding-inline-start: 25px;
		margin: 5px 0;
	}

	li {
		padding-right: 4px;
	}
	.challenges {
		list-style-image: url(star.svg);
	}

	:global(.town-and-starter img) {
		margin: 3px;
	}

	.town-and-starter {
		display: inline-flex;
		margin: 0 5px;
	}
	.town-and-starter:nth-of-type(2) {
		justify-self: end;
	}
</style>
