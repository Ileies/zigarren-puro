<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<div class="flex flex-col min-h-svh">
	<Header />

	<main class="flex-1 flex flex-col p-4 w-full max-w-4xl mx-auto box-border">
		{@render children()}
	</main>

	<Footer />
</div>
