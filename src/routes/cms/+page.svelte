<script>
	import netlifyIdentity from 'netlify-identity-widget';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import AdminContextProvider from '../../HorseGame/adminParts/AdminContextProvider.svelte';
	import Admin from '../../components/Admin.svelte';

	// redirect unauthorized users away
	let initialized = false;
	onMount(async () => {
		netlifyIdentity.on('init', (user) => {
			if (user) initialized = true;
			else {
				console.warn('Unauthorized');
				return goto('/auth');
			}
		});
		netlifyIdentity.init();
	});
</script>

{#if initialized}
	<AdminContextProvider>
		<Admin />
	</AdminContextProvider>
{/if}

<svelte:head>
	<title>Игра в Коня | CMS</title>
</svelte:head>
