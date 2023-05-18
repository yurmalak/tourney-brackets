<script>
	import { setContext } from 'svelte';
	import { configKey } from '$lib/context';

	import fetchData from './fetchData';

	setContext(configKey, { fetchData });
</script>

<slot />
