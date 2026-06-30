<script lang="ts">
	import { CheckCircle, XCircle } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>E-Mail-Adresse bestätigen – Zigarren Puro</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-base-200 px-4 py-16">
	<div
		class="w-full max-w-md rounded-2xl bg-base-100 p-8 text-center shadow-sm ring-1 ring-base-300"
	>
		{#if data.status === 'success'}
			<div class="mb-5 flex justify-center">
				<CheckCircle class="h-12 w-12 text-success" />
			</div>
			<h1 class="mb-3 text-xl font-semibold text-base-content">E-Mail-Adresse geändert</h1>
			<p class="mb-6 text-sm text-base-content/60">
				Ihre E-Mail-Adresse wurde erfolgreich auf <strong class="text-base-content"
					>{data.newEmail}</strong
				> geändert.
			</p>
			<a href="/account" class="btn w-full btn-primary">Zurück zum Konto</a>
		{:else if data.status === 'already_used'}
			<div class="mb-5 flex justify-center">
				<CheckCircle class="h-12 w-12 text-success" />
			</div>
			<h1 class="mb-3 text-xl font-semibold text-base-content">Bereits bestätigt</h1>
			<p class="mb-6 text-sm text-base-content/60">
				Dieser Bestätigungslink wurde bereits verwendet.
			</p>
			<a href="/account" class="btn w-full btn-primary">Zurück zum Konto</a>
		{:else if data.status === 'email_taken'}
			<div class="mb-5 flex justify-center">
				<XCircle class="h-12 w-12 text-error" />
			</div>
			<h1 class="mb-3 text-xl font-semibold text-base-content">E-Mail bereits vergeben</h1>
			<p class="mb-6 text-sm text-base-content/60">
				Die gewünschte E-Mail-Adresse wird inzwischen von einem anderen Konto verwendet. Bitte
				fordern Sie eine neue Änderung mit einer anderen Adresse an.
			</p>
			<a href="/account" class="btn w-full btn-primary">Zurück zum Konto</a>
		{:else}
			<div class="mb-5 flex justify-center">
				<XCircle class="h-12 w-12 text-error" />
			</div>
			<h1 class="mb-3 text-xl font-semibold text-base-content">Ungültiger Link</h1>
			<p class="mb-6 text-sm text-base-content/60">
				Dieser Bestätigungslink ist ungültig oder abgelaufen. Bitte fordern Sie eine neue
				E-Mail-Änderung in Ihrem Konto an.
			</p>
			<a href="/account" class="btn w-full btn-primary">Zurück zum Konto</a>
		{/if}
	</div>
</div>
