<script>
	/** @typedef {import('../../types.ts').Participant} Participant */

	/** @type {string} */
	export let value;

	/** @type {Participant[]} */
	export let players;
</script>

{#if players}
	<select {value} on:change>
		<option value="" class="idle">---</option>
		{#each players as { name, sIndex } (name)}
			<option value={name} class:idle={sIndex === null}>
				{name}
			</option>
		{/each}
	</select>
{:else}
	<fake-input>
		{value ?? ''}
	</fake-input>
{/if}

<style>
	select,
	fake-input {
		width: 40%;
		flex-grow: 1;
		background-color: var(--color-bg-light);
	}
	fake-input {
		display: inline-flex;
		align-items: center;
	}
	option:not(.idle) {
		background-color: lightgray;
	}
</style>
