<script>
	export let kvMap;
	export let label;
	export let options;

	export let style = null;
	export let className = null;
</script>

<data-mapper {style} class={className}>
	{#if kvMap.length > 0}
		<dl aria-label={label}>
			{#each kvMap as [key, v1, v2]}
				<dt>
					<select bind:value={key} aria-label="key">
						<option value="" />
						{#each options as value}
							<option {value}>{value}</option>
						{/each}
					</select>
				</dt>

				{#if v2 === undefined}
					<dd bind:textContent={v1} contenteditable aria-label="value" style:grid-column="span 2" />
				{:else}
					<dd bind:textContent={v1} contenteditable aria-label="value (1 of 2)" />
					<dd bind:textContent={v2} contenteditable aria-label="value (2 of 2)" />
				{/if}
			{/each}
		</dl>
	{/if}
</data-mapper>

<style>
	data-mapper {
		gap: var(--space-l);
		display: grid;
		grid-template-columns: 1fr 1fr auto;
	}
	dl {
		margin: 0;
		padding: 0;
		grid-column: span 3;
		display: grid;
		gap: var(--space-m);
		grid-template-columns: 20% 1fr 1fr;
	}

	dt {
		margin-right: var(--space-m);
	}
	select {
		width: 100%;
	}
</style>
