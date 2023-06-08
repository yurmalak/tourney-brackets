<script>
	export let data;
	const rounds = data.scheduleByRound.length;
	function getTitle(round) {
		if (round === rounds - 2) return 'Полуфиналы';
		if (round === rounds - 1) return 'Финалы';
		return `Этап ${round + 1}`;
	}
</script>

<main>
	<h1 aria-labelledby="h1">
		<svg viewBox="0 0 115 12" width="320" height="50" preserveAspectRatio="xMidYMid meet">
			<text x="0" y="0" dominant-baseline="hanging" id="h1">Расписание</text>
		</svg>
	</h1>

	{#each data.scheduleByRound as list, round}
		{#if list.length}
			<h2>{getTitle(round)}</h2>
			<ul>
				{#each list as [date, players, gamesPlayed]}
					<li class="round">
						<header>
							{#if gamesPlayed}
								Игра {gamesPlayed + 1} -
							{/if}
							{date}
						</header>
						<a href={players[0].url} class="player-link">{players[0].name}</a>
						<span class="vs">VS.</span>
						<a href={players[1].url} class="player-link">{players[1].name}</a>
					</li>
				{/each}
			</ul>
		{/if}
	{/each}
</main>

<svelte:head>
	<title>Игра в Коня | Расписание</title>
	<meta
		name="description"
		content="
			Расписание игр турнира по игре Герои Меча и Магии 3 (HoMM3) 'Игра в Коня', организованного стримерами @evlampich и @KICK_FREAK.
			Турнир на 32 участника играется на шаблоне JC (фулл рандом) с дополнительными усложнениями. 
		"
	/>
</svelte:head>

<style>
	main {
		max-width: 98vw;
		width: 100%;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	h1,
	h2 {
		--heading-color: #df9648;
		font-family: 'Kelly Slab';
		letter-spacing: 3px;
	}

	h1 {
		margin-top: 2rem;
	}

	svg {
		width: 100%;
		height: auto;
	}

	text {
		fill: var(--heading-color);
		filter: drop-shadow(0px 0px 2px black);
		font-size: initial;
	}

	h2 {
		font-size: 1.6rem;
		color: var(--heading-color);
	}

	.round {
		margin: 0.3em;
		padding-bottom: 0.5em;
		border-bottom: 1px solid black;
		list-style-type: none;
		display: grid;
		grid-template-columns: minmax(auto, 1fr) auto minmax(auto, 1fr);
		align-items: center;
		gap: 1em 0.5em;
		color: white;
	}
	.round:not(:last-of-type) {
		margin-bottom: 4em;
	}

	.round > header {
		text-align: center;
		grid-column: span 3;
		font-size: 1.4em;
	}

	.player-link {
		justify-self: start;
		font-size: 1.2rem;
		color: hsl(39 100% 93%);
	}

	.player-link:nth-of-type(even) {
		justify-self: end;
	}

	.vs {
		font-size: 0.9rem;
	}

	@media (min-width: 400px) {
		main {
			margin: 0 auto;
			width: unset;
		}
		.round {
			column-gap: 2em;
		}
	}
</style>
