<script>
	export let name;
	export let alt = name;
	export let title = name;
	export let style = null;
</script>

{#if name}
	<img src="pictures/{name.replace(/ /g, '_')}.gif" {title} {alt} {style} width="46" height="30" />
{:else}
	<img-placeholder {style} />
{/if}

<style>
	img {
		width: 46px;
		height: 30px;
	}
</style>
