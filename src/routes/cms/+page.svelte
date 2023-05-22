<script>
	import netlifyIdentity from 'netlify-identity-widget';
	import faunadb from 'faunadb';
	import { onDestroy, onMount, setContext } from 'svelte';
	import { goto } from '$app/navigation';

	import { dbKey } from '$lib/context';
	import Admin from '../../components/Admin.svelte';
	import AdminContextProvider from '../../HorseGame/adminParts/AdminContextProvider.svelte';

	/** Key for localStorage */
	const storageKey = 'fauna--editor-key';

	/**
	 * @type {{
	 *    status: 'ok'|'pending'|'error',
	 *    queryData?: { tourney?: object, series?: Array },
	 * 	  promise?: Promise,
	 *    error?: Error,
	 * 	  complete: () => void
	 * }}
	 */
	const normalState = { status: 'ok', error: null, queryData: null, promise: null, complete };

	/** Object with status of current query, its data and errors (if any) */
	const task = { ...normalState };
	function complete() {
		Object.assign(task, normalState);
	}

	/** Try again after login if detected to be unauthorized mid-task. */
	function tryAgain() {
		netlifyIdentity.close();
		netlifyIdentity.off('login', tryAgain);
		dbQuery(task.queryData);
	}

	/**
	 * Refresh key if necessary and Query Fauna for data/updates.
	 * @returns task object with awaitable `task.promise`
	 */
	function dbQuery(queryData) {
		task.status = 'pending';
		task.queryData = queryData;
		task.promise = new Promise(async (resolve, reject) => {
			try {
				let storedData = JSON.parse(localStorage.getItem(storageKey));

				// refresh secret
				if (!storedData || (storedData.expires ?? 0 - Date.now()) / 1000 / 60 / 60 < 1) {
					console.log('Fauna key expired ot did not exist. Fetching new one...');

					// check that user is authorized
					// so it won't throw unexpected error after getting wrong response
					const user = netlifyIdentity.currentUser();
					if (!user) {
						netlifyIdentity.open();
						netlifyIdentity.on('login', tryAgain);
						throw new Error('Unauthorized');
					}

					// request new secret from netlify function
					const endpoint = '.netlify/functions/getEditorKey';
					const headers = { Authorization: `Bearer ${user.token.access_token}` };
					const response = await fetch(endpoint, { headers }).then((r) => r.json());

					console.log('Successfully fetched new Fauna key.');
					localStorage.setItem(storageKey, JSON.stringify(response));
					storedData = response;
				}

				// now make query
				const client = new faunadb.Client({ secret: storedData.secret, scheme: 'https' });
				const result = await client.query(queryData);
				resolve(result);
			} catch (error) {
				console.error('Failed to query Fauna', error);
				task.error = error;
				task.status = 'error';
				reject(error);
			}
		});

		return task;
	}

	// Fauna configuration can befound in "setupFauna.js" in root folder
	const client = {
		// returns specific tourney if id provided
		// or recently updated one if it's null
		getData: () => dbQuery(faunadb.query.Call('getData', null)),
		updateData: (data) => dbQuery(faunadb.query.Call('updateData', data))
	};
	if (typeof window !== 'undefined') window.fauna = client;

	// pass client below
	setContext(dbKey, client);

	// redirect unauthorized users away
	onMount(async () => {
		netlifyIdentity.init();
		if (!netlifyIdentity.currentUser()) {
			console.warn('Unauthorized');
			return goto('/auth');
		}
	});

	onDestroy(() => netlifyIdentity.off('login', tryAgain));
</script>

<AdminContextProvider>
	<Admin />
</AdminContextProvider>

<svelte:head>
	<title>Игра в Коня | CMS</title>
</svelte:head>
