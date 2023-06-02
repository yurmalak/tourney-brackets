<script>
	import { onDestroy, onMount } from 'svelte';
	import { netlifyFetch } from './setupDbClient';
	import LoadingIcon from './LoadingIcon.svelte';

	/** Delay in seconds between requests to rebuild the site */
	const CD = 60;

	let responseStatus = 'ok',
		buildOnCd = false,
		error = null,
		timeoutHandle;

	// disable Publish button if request is on cd
	onMount(() => {
		const seconds = secondsLeft();
		buildOnCd = seconds > 0;
		if (buildOnCd) {
			timeoutHandle = setTimeout(() => (buildOnCd = false), seconds * 1000);
		}
	});
	onDestroy(() => clearTimeout(timeoutHandle));

	/** Check when request has been called last time */
	function secondsLeft() {
		const lbr = Number(localStorage.getItem('last-build-request'));
		return (lbr - Date.now()) / 1000 + CD;
	}

	/** Request Netlify to rebuild the site */
	async function triggerRebuild() {
		const seconds = secondsLeft();
		if (seconds > 0) {
			console.log(`Build request is on CD for ${Math.ceil(seconds)} more seconds.`);
			return;
		}

		error = null;
		responseStatus = 'pending';
		localStorage.setItem('last-build-request', Date.now());
		timeoutHandle = setTimeout(() => (buildOnCd = false), CD * 1000);

		// production
		if (!localStorage.getItem('fauna--publishing-disabled')) {
			return netlifyFetch('triggerRebuild', { method: 'POST' })
				.then(() => {
					buildOnCd = true;
					responseStatus = 'ok';
				})
				.catch((err) => {
					error = err;
					responseStatus = 'error';
					localStorage.removeItem('last-build-request');
					console.error('Build request rejected', err);

					clearTimeout(timeoutHandle);
					buildOnCd = false;
				});
		}

		// dev
		return new Promise((resolve) => {
			console.log('Publishing disabled');
			setTimeout(() => {
				buildOnCd = true;
				responseStatus = 'ok';
				resolve();
			}, 1000);
		});
	}
</script>

<requester-wrapper>
	<button
		type="button"
		class="button-no-bg publish-button"
		on:click={triggerRebuild}
		disabled={buildOnCd}
	>
		PUBLISH
	</button>
	<LoadingIcon
		{error}
		status={responseStatus}
		side={25}
		style="
			position:absolute;
			left: 0;
			top: 50%;
			transform: translate(-120%,-50%)
		"
	/>
</requester-wrapper>

<style>
	requester-wrapper {
		position: relative;
	}
	.publish-button {
		position: relative;
		font-weight: bold;
		color: gray;
		letter-spacing: 2px;
		font-size: 1.05em;
		transition: border-color 1s, color 0.5s;
	}

	.publish-button:not(:disabled):active:active {
		background-color: hsl(120, 69%, 49%);
	}

	.publish-button:disabled {
		cursor: default;
		border-color: #d7dbed;
		color: #c9cad1;
	}

	@media (hover: hover) {
		.publish-button:not(:disabled):hover {
			border: 2px solid hsl(120, 69%, 39%);
			background-color: hsl(120, 69%, 59%);
			color: black;
			transition: 0s;
		}
	}
</style>
