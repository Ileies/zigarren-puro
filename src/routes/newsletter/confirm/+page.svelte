<script lang="ts">
	import { CheckCircle, XCircle, Mail } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
	const status = $derived(form?.status ?? data.status);
</script>

<svelte:head>
	<title>Newsletter-Anmeldung bestätigen – Zigarren Puro</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center px-4 py-16">
	<div class="w-full max-w-md space-y-6 text-center">
		{#if status === 'confirmed'}
			<div class="flex justify-center">
				<CheckCircle class="h-16 w-16 text-success" />
			</div>
			<h1 class="text-2xl font-bold">Anmeldung bestätigt</h1>
			<p class="text-base-content/70">
				Vielen Dank, Sie sind jetzt für den Newsletter angemeldet. Sie können sich jederzeit über
				den Link in der E-Mail wieder abmelden.
			</p>
		{:else if status === 'ready'}
			<div class="flex justify-center">
				<Mail class="h-16 w-16 text-base-content/40" />
			</div>
			<h1 class="text-2xl font-bold">Newsletter-Anmeldung bestätigen</h1>
			<p class="text-base-content/70">
				Bitte bestätigen Sie, dass Sie den Newsletter von Zigarren Puro erhalten möchten.
			</p>
			<form
				method="POST"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						submitting = false;
						await update();
					};
				}}
			>
				<button type="submit" class="btn btn-secondary" disabled={submitting}>
					Anmeldung bestätigen
				</button>
			</form>
		{:else}
			<div class="flex justify-center">
				<XCircle class="h-16 w-16 text-error" />
			</div>
			<h1 class="text-2xl font-bold">Ungültiger Link</h1>
			<p class="text-base-content/70">
				Dieser Bestätigungslink ist abgelaufen, wurde bereits verwendet oder ist ungültig. Sie
				können sich über das Formular im Seitenende erneut anmelden.
			</p>
		{/if}

		<div class="pt-4">
			<a href="/" class="btn btn-ghost">Zur Startseite</a>
		</div>
	</div>
</div>
