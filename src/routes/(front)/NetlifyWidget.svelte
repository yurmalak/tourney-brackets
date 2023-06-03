<script>
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const handler = () => {
		netlifyIdentity.close();
		goto('/cms');
	};

	onMount(() => {
		if (typeof window !== 'undefined') {
			if (window.netlifyIdentity) window.netlifyIdentity.on('login', handler);
			else console.warn('No netlifyIdentity on window object');
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') window.netlifyIdentity.off('login', handler);
	});
</script>

<svelte:head>
	<script
		type="text/javascript"
		src="https://identity.netlify.com/v1/netlify-identity-widget.js"
	></script>
</svelte:head>
