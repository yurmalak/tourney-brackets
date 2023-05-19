<script>
	export let name;
	export let alt = '';
	export let title = null;
</script>

<img src="pictures/{name}.gif" {title} {alt} width="46" height="30" />

<style>
	img {
		width: 46px;
		height: 30px;
	}
</style>
