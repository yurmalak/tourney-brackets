<script>
	/** @typedef {import('../types').Game} Game */
	/** @typedef {import('../types.ts').Series} Series */
	/** @typedef {import('../types.ts').TourneyData} TourneyData */

	import { onMount } from 'svelte';
	import { tourneyStore } from './stores';
	import { setupDbClient } from './setupDbClient';
	import Editor from './Editor/Editor.svelte';
	import LoadingIcon from './LoadingIcon.svelte';
	import BuildRequester from './BuildRequester.svelte';

	import Bracket from '../brackets/Bracket.svelte';
	import bundleSeries from '../brackets/bundleSeries';

	// game specific stuff to pass to Editor
	export let kvOptions;
	export let GameEditor;
	export let adjustNewGame;

	/** Only false until data is fetched, regardless of the outcome */
	let ready = false;

	// spin loading icon while waiting for DB reply
	// show error sign with option to copy on error
	let error = null;
	let status = 'pending';
	const setTaskStatus = (taskStatus, err = null) => {
		status = taskStatus;
		error = err;
	};
	const dbClient = setupDbClient(setTaskStatus);

	// fetch list of tourneys and data for latest one
	let seriesByRound, templateCode, extras;
	onMount(async () => {
		/**
		 * @type {{
		 * 	  tourneyData: {
		 * 		 tourney: TourneyData,
		 * 		 sList: Series[]
		 * 	  },
		 * 	  tourneyList: [ts:number, name:string, id:string][]
		 * }}
		 */
		const data = await dbClient.getData().then((response) => {
			if (response.ok) {
				status = 'ok';
				return response.result;
			} else {
				console.error('Admin, failed to fetch data', response.error);
				error = response.error;
				status = 'error';
			}
		});

		ready = true;
		if (!error) {
			tourneyStore.set({ ...data.tourneyData, dbClient });
			({ templateCode } = $tourneyStore.data);
			({ seriesByRound, extras } = bundleSeries($tourneyStore));
		}
	});

	/** @type {Series}*/
	let editorData;
	const toggleEditor = (ev) => (editorData = ev?.detail);
</script>

<div id="root">
	<header>
		<a href="/" id="home-link">Home</a>
		<BuildRequester />
	</header>

	<div id="body">
		{#if error}
			<p>Something went wrong</p>
			<p>{error.name}</p>
			<p>{error.message}</p>
		{:else if !ready}
			<div>
				Hold on...
				<LoadingIcon {error} {status} side={20} />
			</div>
		{:else}
			<Bracket {templateCode} {seriesByRound} {extras} on:nodeClick={toggleEditor} />
		{/if}
		<LoadingIcon
			{error}
			{status}
			side={30}
			style="
				position:absolute;
				bottom:50px;
				right:50px;
				z-index: 999;
			"
		/>
	</div>
</div>

{#if editorData}
	<Editor
		bind:seriesByRound
		on:toggleEditor={toggleEditor}
		{kvOptions}
		{GameEditor}
		{adjustNewGame}
		series={editorData.series}
		blocked={status !== 'ok'}
	/>
{/if}

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
		.button:not(:disabled):active:active {
			background-color: hsl(223, 15%, 95%);
			box-shadow: none;
		}

		.button-no-bg {
			border: 2px solid var(--color-bg-dark);
			background-color: transparent;
		}

		.button-no-bg:not(:disabled):active:active {
			background-color: transparent;
		}

		@media (hover: hover) {
			.button:not(:disabled):hover {
				background-color: var(--color-bg-light);
				box-shadow: 0 0 2px hsl(233, 20%, 67%);
			}
			.button-no-bg:not(:disabled):hover {
				border: 2px solid hsl(237, 69%, 69%);
				background-color: var(--color-bg-medium);
			}
		}
	</style>
</svelte:head>

<style>
	#root {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	#body {
		overflow: auto;
		position: relative;
		flex-grow: 1;
	}

	header {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		justify-content: center;
		align-items: center;
	}
	#home-link {
		justify-self: end;
		margin-right: 3em;
	}
</style>
