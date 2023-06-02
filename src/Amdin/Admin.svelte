<script>
	/** @typedef {import('../../types.ts').Series} Series */
	/** @typedef {import('../../types.ts').TourneyData} TourneyData */
	import { onMount, getContext } from 'svelte';
	import { configKey } from '$lib/context';
	import { tourneyStore } from './stores';
	import { setupDbClient } from './setupDbClient';
	import Bracket from '../brackets/Base.svelte';
	import Editor from './Editor/Editor.svelte';
	import LoadingIcon from './LoadingIcon.svelte';
	import BuildRequester from './BuildRequester.svelte';

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

	// ensure contexts has all necessary parts
	const gameContext = getContext(configKey);
	const requiredKeys = ['createGame', 'GameEditor', 'kvOptions'];
	for (const key of requiredKeys) {
		if (!(key in gameContext)) {
			error = new Error(`Crucial part missing: "${key}".`);
			console.error(error);
		}
	}

	// fetch list of tourneys and data for latest one
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
		if (!error) tourneyStore.set({ ...data.tourneyData, dbClient });
	});

	// open/close Editor
	function toggleEditor(ev) {
		editableSeries = ev?.detail?.series;
	}

	/** @type {Series | undefined}*/
	let editableSeries;
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
			<Bracket templateCode={$tourneyStore?.data?.templateCode} on:nodeClick={toggleEditor} />
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

{#if editableSeries}
	<Editor blocked={status !== 'ok'} series={editableSeries} on:toggleEditor={toggleEditor} />
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
