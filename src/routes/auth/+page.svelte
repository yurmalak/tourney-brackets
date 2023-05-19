<svelte:head>
	<script
		type="text/javascript"
		src="https://identity.netlify.com/v1/netlify-identity-widget.js"
	></script>
	<style>
		body {
			background-color: #5d686d;
		}
	</style>
</svelte:head>

<!-- <script>
	import Clerk from '@clerk/clerk-js';
	import { onMount } from 'svelte';
	const publishableKey = 'pk_test_c2hhcmluZy1raWxsZGVlci0zMC5jbGVyay5hY2NvdW50cy5kZXYk';

	onMount(async () => {
		const clerk = new Clerk(publishableKey);
		const a = await clerk.load({
			// Set load options here...
		});

		console.log({ clerk, a });
	});
</script>

<svelte:head>
	<style>
		body {
			background-color: #5d686d;
		}
	</style>
</svelte:head> -->
