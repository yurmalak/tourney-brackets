<script>
	import { onMount } from 'svelte';
	import { tourneyStore, tourneyList } from '../stores';
	import Bracket from './Bracket/Base.svelte';

	// mock
	import { mockedFetchData } from '../mock';

	// fetch list of tourneys and data for ongoing or latest one
	let ready = false;
	onMount(async () => {
		const data = await mockedFetchData();
		const { tourneys, currentTourneyId } = data;

		tourneyStore.set(tourneys[currentTourneyId]);
		tourneyList.set(tourneys);

		ready = true;
	});

	function handleClick(ev) {
		console.log('Node has been clicked!', ev);
	}
</script>

<div>
	{#if !ready}
		Hold on...
	{:else}
		<Bracket templateCode={$tourneyStore?.templateCode} on:nodeClick={handleClick} />
	{/if}
</div>

<svelte:head>
	<style>
		body {
			background-color: var(--color-bg-light);
		}

		input,
		select {
			padding: 0 var(--space-s);
			min-height: 1.6rem;
		}

		button {
			padding: var(--space-s) var(--space-m);
		}
	</style>
</svelte:head>

<style>
	:root {
		--color-bg-dark: hsl(223, 35%, 77%);
		--color-bg-light: hsl(230, 20%, 94%);
		--space-s: 0.2rem;
		--space-m: 0.5rem;
		--space-l: 0.8rem;

		font-family: sans-serif;
		font-size: 14px;
	}
</style>
