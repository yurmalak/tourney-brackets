<svelte:options immutable />

<!-- Just an outline of what's to be -->

<script>
	export let series;

	$: ({ players, score, kvMap, games } = series);
</script>

<article>
	<header>
		{#each players as { name, twitch }, i}
			<a href="https://www.twitch.tv/{twitch}" target="blank_">{name}</a>
			{#if i === 0}<series-score>{score.join(' - ')}</series-score>{/if}
		{/each}
	</header>

	<div>
		Замки, цвет, стартер, рулетка, ссылка на запись, время выхода, выполненные челленджи и т.д.
	</div>

	<pre><span class="big">Данные серии:</span><br />{JSON.stringify(kvMap, '\n', 2)}</pre>

	{#if games.length > 0}
		{#each games as { kvMap, data }, i}
			{@const title = `Игра${games.length > 1 ? ' ' + (i + 1) : ''}:`}
			{@const dataString = JSON.stringify(data, '\n', 2)}
			{@const kvMapString = JSON.stringify(kvMap, '\n', 2)}
			<pre><span class="big">{title}</span><br />{dataString}{kvMapString}</pre>
		{/each}
	{/if}
</article>

<style>
	article {
		padding: 0.5em;
	}
	header {
		display: flex;
	}

	a {
		width: 33%;
		flex-grow: 1;
		text-align: center;
	}

	.big {
		font-size: 1.1em;
		font-weight: bolder;
	}
	div {
		margin: 0.5em 0;
	}
</style>
