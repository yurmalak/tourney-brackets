<script>
	export let data;
</script>

<div>
	<pre>{JSON.stringify(data)}</pre>
	<slot name="score-switcher" />
	<slot name="delete-game" />
</div>
