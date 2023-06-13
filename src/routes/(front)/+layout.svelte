<script>
	import { page } from '$app/stores';
	import { afterUpdate } from 'svelte';

	const pages = [
		['/', 'Сетка'],
		['/schedule', 'Расписание']
	];

	let autos = '';
	for (let i = 2; i < pages.length; i++) autos += 'auto ';
	const gridStyle = `1fr ${autos}1fr`;

	let current;
	afterUpdate(() => (current = $page.url.pathname));
</script>

<div id="root">
	<nav style:grid-template-columns={gridStyle}>
		{#each pages as [href, label], i}
			<a
				{href}
				style:justify-self={i ? 'start' : 'end'}
				aria-current={href === current ? 'page' : null}>{label}</a
			>
		{/each}
	</nav>
	<slot />
</div>

<svelte:head>
	<script async data-id="101411682" src="//static.getclicky.com/js"></script>
</svelte:head>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Kelly+Slab&display=swap');

	:global(a:active:active:active) {
		color: red;
	}

	:root {
		--header-height: 3.5em;
	}
	#root {
		display: grid;
		grid-template-rows: var(--header-height) 1fr;
		min-height: 100vh;
		background-color: hsl(38 26% 20%);
	}

	nav {
		display: grid;
		align-items: center;
		width: 100%;
		gap: 10vw;
		font-size: 1.5rem;
		background-color: #201813;
	}
	a {
		text-decoration: none;
		color: #dfccaf;
		font-family: 'Kelly Slab', sans-serif;
		justify-self: start;
	}
</style>
