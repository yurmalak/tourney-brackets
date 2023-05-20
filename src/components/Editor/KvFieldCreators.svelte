<script>
	/** @typedef {import("../../types").KvMap} KvMap*/
	import { tick } from 'svelte';

	/** @type {string} */
	export let className;

	/** @type {KvMap}*/
	export let kvMap;

	/** @type {(Event) => HTMLElement} */
	export let newKeyFieldSeeker;

	/** @param {Event} */
	async function addKvPair(ev) {
		const { dual } = ev.target.dataset;
		kvMap[kvMap.length] = dual ? ['', '', ''] : ['', ''];

		// focus new pair
		await tick();
		const keyField = newKeyFieldSeeker(ev);
		if (keyField) keyField.focus();
		else console.warn("Couldn't focus key field of newly created pair.");
	}
</script>

<button type="button" class={className} on:click={addKvPair}> Add single field </button>
<button type="button" class={className} on:click={addKvPair} data-dual="true">
	Add dual field
</button>
