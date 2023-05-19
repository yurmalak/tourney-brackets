<script>
	import Admin from '../../components/Admin.svelte';
	import AdminContextProvider from '../../HorseGame/adminParts/AdminContextProvider.svelte';
</script>

<AdminContextProvider>
	<Admin />
</AdminContextProvider>

<svelte:head>
	<title>Игра в Коня | Демка</title>
</svelte:head>
