<script>
	/** @type {"ok"|"pending"|"error"}*/
	export let status;

	/** @type {number} */
	export let side;

	/** @type {Error?} */
	export let error = null;

	/** @type {string?} */
	export let style = null;

	/** Copy error stack to clipboard */
	function copyError() {
		if (status !== 'error') return;
		navigator.clipboard.writeText(error.stack);
	}

	// decide whether icon should be rendered
	let display = false,
		timeoutHandler;
	$: {
		clearTimeout(timeoutHandler);
		switch (status) {
			case 'ok':
				timeoutHandler = setTimeout(() => (display = false), 1000);
				break;

			case 'error':
			case 'pending':
				display = true;
				break;
		}
	}

	/** Color of petals and checkmark */
	const green = '#22bb22';

	// arrange `steps` of rectangles around svg center (`transform`)
	// and animate their opacity with different delay (`begin`)
	const steps = 10;
	const arr = [];
	for (let i = 0; i < steps; i++) {
		const begin = (1 / steps) * i - 1 + 's';
		const transform = `rotate(${(360 / steps) * i} 50 50)`;
		arr.push({ begin, transform });
	}
</script>

{#if display}
	<button
		type="button"
		on:click={copyError}
		disabled={status !== 'error'}
		class="loader-container {status}"
		{style}
	>
		<svg xmlns="http://www.w3.org/2000/svg" width={side} height={side} viewBox="0 0 100 100">
			{#if status === 'error'}
				<!-- red triangle with exclamation mark-->
				<polygon points="0,100 50,00 100,100" fill="#ff7d7d" />
				<text text-anchor="middle" x="50" y="90" fill="#222222" font-size="80" font-weight="bold">
					!
				</text>
				<title>Click to copy</title>
			{:else if status === 'pending'}
				<!-- spinning loading icon -->
				{#each arr as { begin, transform }}
					<rect x="44" y="5" width="12" height="25" strokeWidth="0" {transform} fill={green}>
						<animate
							repeatCount="indefinite"
							attributeName="opacity"
							values="1;0"
							keyTimes="0;1"
							dur="1s"
							{begin}
						/>
					</rect>
				{/each}
			{:else}
				<!-- checkmark -->
				<path d="M 30,55 L 55,75 L 90,20 L 55,75" stroke={green} stroke-width="10" />
			{/if}
		</svg>
	</button>
{/if}

<style>
	.loader-container {
		transition: opacity 2s;
		background: transparent;
		border: none;
		padding: 0;
		margin: 0;
	}
	.loader-container:disabled {
		opacity: 1;
		color: inherit;
	}

	.pending,
	.error {
		transition: 0s;
	}

	/* beat :disabled state */
	.ok.ok.ok {
		opacity: 0;
	}

	.error svg,
	polygon,
	text {
		cursor: pointer;
	}
</style>
