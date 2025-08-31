<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<Header />

	<main class="flex-1 flex flex-col w-full box-border">
		{@render children()}
	</main>
</div>

<Footer />
