<script>
	import { page } from '$app/stores';
</script>

{#if $page.route.id !== '/auth'}
	<header style:position="absolute" style:z-index="999">
		<a href="/">Сетка</a>
		<a href="/demo-cms">Демка</a>
	</header>
{/if}

<slot />

<svelte:head>
	<style>
		body {
			margin: 0;
		}
		.visually-hidden {
			clip: rect(0 0 0 0);
			clip-path: inset(50%);
			height: 1px;
			overflow: hidden;
			position: absolute;
			white-space: nowrap;
			width: 1px;
		}
	</style>
</svelte:head>

<style>
	header {
		position: absolute;
		width: 100%;
		z-index: 999;
		display: flex;
		justify-content: center;
		gap: 20px;
		font-size: 16px;
		font-family: Verdana, Geneva, Tahoma, sans-serif;
	}
</style>
