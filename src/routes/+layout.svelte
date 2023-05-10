<script>
	/** @type {Array<string|undefined>}*/
	let pages = [];
	const modules = import.meta.glob('./**/**.svelte');

	for (const path in modules) {
		pages.push(/\.\/([^\/]+)\//.exec(path)?.[1]);
	}

	pages = pages.filter(Boolean);
	pages.unshift('');
</script>

<header>
	{#each pages as path}
		<a href={'/' + path}>{path ? path?.[0].toUpperCase() + path?.slice(1) : 'Home'}</a>
	{/each}
</header>
<slot />
