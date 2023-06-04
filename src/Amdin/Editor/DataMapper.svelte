<script>
	import { validateUrl } from '$lib/utils';

	/** @type {import("../../types").KvMap}*/
	export let kvMap;

	/** @type {string?} */
	export let ariaLabel = '';

	/** @type {object} */
	export let options;

	/** @type {string[]} */
	export let players;

	/** @type {string?} */
	export let style = null;

	/** @type {string?} */
	export let className = null;
</script>

<div {style} class={'data-mapper-container ' + (className ?? '')}>
	<dl aria-label={ariaLabel}>
		{#each kvMap as fieldData}
			{@const key = fieldData[0]}
			{@const { fields, label } = options[key] || {}}
			{#if fields}
				<dt>{label}</dt>

				<dd>
					{#each fields as { type }, i}
						{@const ariaLabel = fields.length < 2 ? key : `${key}-${i + 1}`}
						{#if type === 'text'}
							<!-- conteneditable div -->
							<div
								bind:textContent={fieldData[i + 1]}
								contenteditable
								class="text"
								role="textbox"
								aria-label={ariaLabel}
							/>
						{:else if type === 'url'}
							<!-- input with warning -->
							{@const validUrl = validateUrl(fieldData[i + 1], fields[i].allowed || [])}
							<input
								bind:value={fieldData[i + 1]}
								type="text"
								class="url {validUrl ? '' : 'invalid'}"
								placeholder={fields[i].allowed ? fields[i].allowed.join('... / ') + '...' : null}
								aria-label={ariaLabel}
							/>
						{:else if type === 'playerSelect'}
							<!-- select with 2 players as options -->
							<select bind:value={fieldData[i + 1]} aria-label={ariaLabel}>
								<option value="" />
								{#each players as value}
									<option {value}>{value}</option>
								{/each}
							</select>
						{:else if type === 'datetime'}
							<!-- date-time input -->
							<input type="datetime-local" bind:value={fieldData[i + 1]} aria-label={ariaLabel} />
						{/if}
					{/each}
				</dd>
			{/if}
		{/each}
	</dl>
</div>

<style>
	dl {
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-m);
		grid-template-columns: auto 1fr;
	}

	dt {
		margin-right: var(--space-m);
		margin-top: calc(var(--space-m) + 1px); /* input/contenteditable padding + border*/
	}

	dd {
		display: flex;
		margin: 0;
		gap: var(--space-m);
	}
	.text,
	input {
		flex-grow: 1;
	}

	select {
		align-self: flex-start;
	}

	.invalid {
		background-color: #ffc8c8;
	}
</style>
