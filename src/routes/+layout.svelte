<script lang="ts">
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import WelcomeModal from '$lib/components/WelcomeModal.svelte';

	let { children, data } = $props();

	let toastDismissed = $state(false);
	const toastVisible = $derived(data.dbOffline && !toastDismissed);
	let isAdmin = $derived(page.url.pathname.startsWith('/admin'));

	let welcomeVisible = $state(untrack(() => data.showWelcome && !!data.user));
</script>

{#if isAdmin}
	{@render children()}
{:else}
	<div class="flex min-h-screen flex-col">
		<Header user={data.user} cartCount={data.cartCount} />

		<main class="box-border flex w-full flex-1 flex-col">
			{@render children()}
		</main>
	</div>

	<Footer facebook={data.socialFacebook} instagram={data.socialInstagram} />

	{#if welcomeVisible && data.user}
		<WelcomeModal firstName={data.user.firstName} onClose={() => (welcomeVisible = false)} />
	{/if}

	{#if toastVisible}
		<div
			class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white shadow-lg"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 shrink-0"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
					clip-rule="evenodd"
				/>
			</svg>
			<span>Service temporarily unavailable (500). Login and shop features are disabled.</span>
			<button
				onclick={() => (toastDismissed = true)}
				class="ml-2 transition-opacity hover:opacity-70"
				aria-label="Dismiss"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		</div>
	{/if}
{/if}
