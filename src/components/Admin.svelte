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
		:root {
			--color-bg-dark: hsl(230, 40%, 78%);
			--color-bg-medium: hsl(223, 46%, 85%);
			--color-bg-light: hsl(230, 30%, 93%);
			--color-input: hsl(227, 0%, 96%);
			--space-s: 0.2rem;
			--space-m: 0.5rem;
			--space-l: 0.8rem;
			--border-radius: 3px;

			font-family: sans-serif;
			font-size: 14px;
		}

		body {
			background-color: var(--color-bg-light);
		}

		input,
		select,
		[contenteditable] {
			padding: var(--space-m);
			border-radius: var(--border-radius);
			margin: 0;
			border: 1px solid gray;
			background-color: var(--color-input);
		}

		.button,
		.button-no-bg {
			margin: 0;
			padding: var(--space-l);
			border-radius: var(--border-radius);
			user-select: none;
			font-size: 0.9em;
			cursor: pointer;
		}

		.button {
			border: 1px solid gray;
			background-color: var(--color-bg-dark);
		}
		.button:active:active {
			background-color: hsl(223, 15%, 95%);
			box-shadow: none;
		}

		.button-no-bg {
			border: 2px solid var(--color-bg-dark);
			background-color: transparent;
		}

		.button-no-bg:active:active {
			background-color: transparent;
		}

		@media (hover: hover) {
			.button:hover {
				background-color: var(--color-bg-light);
				box-shadow: 0 0 2px hsl(233, 20%, 67%);
			}
			.button-no-bg:hover {
				border: 2px solid hsl(237, 69%, 69%);
				background-color: var(--color-bg-medium);
			}
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
