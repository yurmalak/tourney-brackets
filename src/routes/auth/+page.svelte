<script>
	import netlifyIdentity from 'netlify-identity-widget';
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const handler = () => goto('/cms');
	onMount(() => {
		netlifyIdentity.init();
		netlifyIdentity.open();
		netlifyIdentity.on('login', handler);
	});
	onDestroy(() => {
		netlifyIdentity.off('login', handler);
	});
</script>

<svelte:head>
	<style>
		body {
			background-color: #5d686d;
		}
	</style>
</svelte:head>
