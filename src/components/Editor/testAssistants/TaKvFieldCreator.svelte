<script>
	import DataMapper from '../DataMapper.svelte';
	import KvFieldCreator from '../KvFieldCreator.svelte';

	export let options;
	export let kvMap;
	export let listSeeker;
	export let reportMap;

	// compensate for testing library / vitest not detecting Svelte's reactivity
	$: reportMap(kvMap);
</script>

<div class="game-card">
	<DataMapper bind:kvMap {options} players={[]} />
	<KvFieldCreator bind:kvMap {options} {listSeeker} />
</div>
