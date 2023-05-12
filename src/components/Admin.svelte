<script>
	import { onMount } from 'svelte';
	import { tourneyStore, tourneyList } from '../stores';
	import Bracket from './Bracket/Base.svelte';
	import Editor from './Editor/Editor.svelte';

	/** @typedef {import('../../types.ts').Series} Series */

	// mock
	import { mockedFetchData } from '../mock';

	// fetch list of tourneys and data for ongoing or latest one
	let ready = false;
	onMount(async () => {
		let data = JSON.parse(localStorage.getItem('mockedData'));
		if (!data) {
			data = await mockedFetchData();
			localStorage.setItem('mockedData', JSON.stringify(data));
		}
		const { tourneys, currentTourneyId } = data;

		tourneyStore.set(tourneys[currentTourneyId]);
		tourneyList.set(tourneys);

		ready = true;
	});

	function handleEditor(ev) {
		editableSeries = ev?.detail?.series;
	}

	/** @type {Series | undefined}*/
	let editableSeries;
</script>

<div>
	{#if !ready}
		Hold on...
	{:else}
		<Bracket templateCode={$tourneyStore?.templateCode} on:nodeClick={handleEditor} />
		{#if editableSeries}<Editor series={editableSeries} on:toggleEditor={handleEditor} />{/if}
	{/if}
</div>

<svelte:head>
	<style>
		body {
			background-color: var(--color-bg-light);
		}

		input,
		select,
		fake-input {
			padding: var(--space-m) var(--space-s);
			min-height: 1.6rem;
			border-radius: 3px;
			margin: 0;
			border: 1px solid gray;
		}
		fake-input {
			padding: var(--space-m);
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
