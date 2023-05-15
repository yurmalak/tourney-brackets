<script>
	import { tick } from 'svelte';

	export let data;
	export let label;

	export let style = null;
	export let className = null;
	export let buttonStyle = null;
	export let buttonClass = null;
	export let buttonsOutside = false;

	/** @type {HTMLElement} */
	let container;

	/** @param {Event} */
	async function addKeyValuePair(ev) {
		const { dual } = ev.target.dataset;
		data[data.length] = ['', dual ? ['', ''] : ['']];

		// focus new pair
		await tick();
		const keyField = container?.querySelector('li:last-of-type > key-field');
		keyField?.focus();
	}

	const buttonProps = {
		type: 'button',
		style: buttonStyle,
		class: buttonClass
	};
</script>

<data-mapper {style} class={className}>
	{#if data.length > 0}
		<dl bind:this={container} aria-label={label}>
			{#each data as [key, values]}
				<dt aria-label="key" contenteditable bind:textContent={key} spellcheck="false" />
				{#each values as textContent, i}
					<dd
						aria-label="value{values.length === 1 ? '' : ` (${i + 1} of 2)`}"
						bind:textContent
						contenteditable
						style:grid-column="span {3 - values.length}"
					/>
				{/each}
			{/each}
		</dl>
	{/if}
	{#if !buttonsOutside}
		<button {...buttonProps} on:click={addKeyValuePair}>Add single field</button>
		<button {...buttonProps} on:click={addKeyValuePair} data-dual="true">Add dual field</button>
	{/if}
</data-mapper>

{#if buttonsOutside}
	<button {...buttonProps} on:click={addKeyValuePair}>Add single field</button>
	<button {...buttonProps} on:click={addKeyValuePair} data-dual="true">Add dual field</button>
{/if}

<style>
	data-mapper {
		gap: var(--space-l);
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	dl {
		margin: 0;
		padding: 0;
		grid-column: span 2;
		display: grid;
		gap: var(--space-s);
		grid-template-columns: repeat(3, 1fr);
	}

	dt {
		margin-right: var(--space-m);
	}

	data-mapper > button {
		padding: var(--space-m);
	}
</style>
