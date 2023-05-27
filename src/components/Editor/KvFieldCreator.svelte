<script>
	import { tick } from 'svelte';

	/** @type {import("../../types").KvMap}*/
	export let kvMap;

	/** @type {object}*/
	export let options;

	/** @type {(Event) => HTMLElement} */
	export let listSeeker;

	/** @type {string?} */
	export let style = null;

	/** @type {string?} */
	export let className = null;

	/**
	 * Add new field and focus it
	 * @param {Event} ev
	 */
	async function createField(ev) {
		const key = ev.target.value;
		if (key === '') return;

		const { fields } = options[key];
		kvMap = [...kvMap, [key, ...fields.map(() => '')]];
		ev.target.value = '';

		// focus newly created field
		await tick();
		const list = listSeeker(ev.target);
		if (!list) return console.log("Couldn't find list to focus");

		const tags = ['a', 'button', 'input', 'select', '[contenteditable]'];
		const tabbableSelector = tags
			.reduce((selector, tag) => selector + tag + ':not(:disabled):not([tabindex="-1"]),', '')
			.slice(0, -1);

		const dd = list.querySelector(`dd:nth-of-type(${kvMap.length})`);
		const element = dd?.querySelector(tabbableSelector);
		if (!element) return console.log("Couldn't find element to focus");
		else element.focus();
	}

	$: usedKeys = new Set(kvMap.map(([key]) => key));
</script>

<select on:change={createField} {style} class={className}>
	<option value="" style:display="none" aria-label="add field">Add field</option>
	{#each Object.entries(options) as [value, { unique }]}
		{#if !unique || !usedKeys.has(value)}
			<option {value}>
				{value}
			</option>
		{/if}
	{/each}
</select>

<style>
	option {
		background-color: var(--color-input);
	}
</style>
