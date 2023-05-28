<script>
	import DeleteButton from '../DeleteButton.svelte';

	export let normal;
	export let clicked;
</script>

<div>
	<DeleteButton on:deleteGame>
		<svelte:fragment slot="normal">{normal}</svelte:fragment>
		<svelte:fragment slot="clicked">{clicked}</svelte:fragment>
	</DeleteButton>
</div>
