<script>
	/** @typedef {import('../../types.ts').Series} Series */
	import { onMount, setContext, getContext } from 'svelte';
	import { configKey } from '$lib/context';
	import { createGame } from '$lib/utils';
	import { tourneyStore } from '../stores';
	import Bracket from './brackets/Base.svelte';
	import Editor from './Editor/Editor.svelte';
	import GameEditor from './Editor/GameEditor.svelte';

	// mock
	import { mockedFetchData } from '../mock';

	// setup fallback in case game-specific functions are not provided
	const gameContext = {
		createGame,
		GameEditor,
		fetchData: mockedFetchData,
		...getContext(configKey)
	};
	setContext(configKey, gameContext);

	// fetch list of tourneys and data for ongoing or latest one
	let ready = false;
	let error = false;
	onMount(async () => {
		const data = await gameContext.fetchData().catch((err) => (error = err));

		// check if players are there to preserve changes between pages
		if (!error && !$tourneyStore.players) tourneyStore.set(data);
		else console.log(console.error('Admin, failed to fetch data', error));

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
			--color-warn: hsl(0, 60%, 70%);
			--space-s: 0.2rem;
			--space-m: 0.5rem;
			--space-l: 0.8rem;
			--border-radius: 3px;

			font-family: sans-serif;
			font-size: 14px;
		}

		body {
			height: 100vh;
			margin: 0;
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
