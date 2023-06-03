<script>
	import netlifyIdentity from 'netlify-identity-widget';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import GameEditor from '../../HorseGame/adminParts/GameEditor.svelte';
	import adjustNewGame from '../../HorseGame/adminParts/adjustNewGame';
	import kvOptions from '../../HorseGame/adminParts/kvOptions';
	import Admin from '../../Amdin/Admin.svelte';

	// redirect unauthorized users away
	let initialized = Boolean(netlifyIdentity.currentUser());
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
	<Admin {GameEditor} {adjustNewGame} {kvOptions} />
{/if}

<svelte:head>
	<title>Игра в Коня | CMS</title>
</svelte:head>
