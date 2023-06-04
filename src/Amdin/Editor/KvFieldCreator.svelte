<script>
	import { tick } from 'svelte';
	import { tabbableSelector } from '$lib/utils';

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
		const values = fields.map((data) => {
			switch (data.type) {
				// input[type="datetime-local"] expects "YYYY-MM-DDThh:mm" format
				case 'datetime': {
					const now = new Date();

					let date = data.initialDate,
						time = data.initialTime;

					if (!date || !/\d{4}-\d{2}-\d{2}/.test(date)) {
						const y = now.getFullYear();

						let m = now.getMonth() + 1;
						if (m < 10) m = '0' + m;

						let d = now.getDate();
						if (d < 10) d = '0' + d;

						date = `${y}-${m}-${d}`;
					}

					if (!time || !/\d{2}:\d{2}/.test(time)) {
						let h = now.getHours();
						if (h < 10) h = '0' + h;

						let m = now.getMinutes();
						if (m < 10) m = '0' + m;

						time = `${h}:${m}`;
					}

					return `${date}T${time}`;
				}

				default:
					return '';
			}
		});
		kvMap = [...kvMap, [key, ...values]];

		// keep this one always unselected
		ev.target.value = '';

		// focus newly created field
		await tick();
		const list = listSeeker(ev.target);
		if (!list) return console.log("Couldn't find list to focus");

		const dd = list.querySelector(`dd:nth-of-type(${kvMap.length})`);
		const element = dd?.querySelector(tabbableSelector);
		if (!element) return console.log("Couldn't find element to focus");
		else element.focus();
	}

	$: usedKeys = new Set(kvMap.map(([key]) => key));
</script>

<select on:change={createField} {style} class={className} aria-label="add data field">
	<option value="" style:display="none">Add field</option>
	{#each Object.entries(options) as [value, { label, unique }]}
		{#if !unique || !usedKeys.has(value)}
			<option {value}>
				{label}
			</option>
		{/if}
	{/each}
</select>

<style>
	option {
		background-color: var(--color-input);
	}
</style>
