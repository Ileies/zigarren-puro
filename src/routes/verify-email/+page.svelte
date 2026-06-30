<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { CheckCircle, MailOpen, XCircle, RefreshCw } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let resending = $state(false);
</script>

<svelte:head>
	<title>E-Mail bestätigen – Zigarren Puro</title>
</svelte:head>

<div class="flex flex-1 items-center justify-center bg-base-200 px-4 py-16">
	<div class="w-full max-w-md">
		{#if data.status === 'success'}
			<div class="rounded-2xl bg-base-100 p-10 text-center shadow-sm ring-1 ring-base-300">
				<div class="mb-6 flex justify-center">
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
						<CheckCircle class="h-8 w-8 text-success" />
					</div>
				</div>
				<h1 class="mb-3 text-xl font-semibold text-base-content">E-Mail bestätigt</h1>
				<p class="mb-8 text-sm leading-relaxed text-base-content/60">
					Ihre E-Mail-Adresse wurde erfolgreich bestätigt.<br />
					Sie können jetzt unser gesamtes Sortiment bestellen.
				</p>
				<a href="/" class="btn w-full btn-primary">Zum Shop</a>
			</div>
		{:else if data.status === 'already_verified'}
			<div class="rounded-2xl bg-base-100 p-10 text-center shadow-sm ring-1 ring-base-300">
				<div class="mb-6 flex justify-center">
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-info/10">
						<CheckCircle class="h-8 w-8 text-info" />
					</div>
				</div>
				<h1 class="mb-3 text-xl font-semibold text-base-content">Bereits bestätigt</h1>
				<p class="mb-8 text-sm text-base-content/60">
					Diese E-Mail-Adresse wurde bereits verifiziert.
				</p>
				<a href="/" class="btn w-full btn-primary">Zum Shop</a>
			</div>
		{:else if data.status === 'invalid'}
			<div class="rounded-2xl bg-base-100 p-10 text-center shadow-sm ring-1 ring-base-300">
				<div class="mb-6 flex justify-center">
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
						<XCircle class="h-8 w-8 text-error" />
					</div>
				</div>
				<h1 class="mb-3 text-xl font-semibold text-base-content">Link ungültig</h1>
				<p class="mb-8 text-sm leading-relaxed text-base-content/60">
					Dieser Bestätigungslink ist abgelaufen oder ungültig.<br />
					Bitte fordern Sie einen neuen Link an.
				</p>
				<a href="/verify-email" class="btn w-full btn-primary">Neuen Link anfordern</a>
			</div>
		{:else}
			<!-- pending: check your inbox -->
			<div class="mb-8 text-center">
				<p class="font-serif text-3xl font-semibold tracking-wide text-base-content">
					Zigarren Puro
				</p>
			</div>

			<div class="rounded-2xl bg-base-100 p-10 text-center shadow-sm ring-1 ring-base-300">
				<div class="mb-6 flex justify-center">
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
						<MailOpen class="h-8 w-8 text-secondary" />
					</div>
				</div>

				<h1 class="mb-3 text-xl font-semibold text-base-content">E-Mail bestätigen</h1>
				<p class="mb-8 text-sm leading-relaxed text-base-content/60">
					Wir haben Ihnen eine Bestätigungs-E-Mail geschickt.<br />
					Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.
				</p>

				{#if form?.resent}
					<div class="mb-6 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
						Eine neue Bestätigungs-E-Mail wurde versendet.
					</div>
				{/if}

				<form
					method="POST"
					action="?/resend"
					use:enhance={() => {
						resending = true;
						return async ({ update }) => {
							resending = false;
							await update();
						};
					}}
				>
					<button type="submit" disabled={resending} class="btn w-full gap-2 btn-outline">
						{#if resending}
							<span class="loading loading-sm loading-spinner"></span>
						{:else}
							<RefreshCw class="h-4 w-4" />
						{/if}
						Erneut senden
					</button>
				</form>

				<p class="mt-6 text-xs leading-relaxed text-base-content/40">
					Bitte prüfen Sie auch Ihren Spam-Ordner.<br />
					Der Link ist 24 Stunden gültig.
				</p>
			</div>
		{/if}
	</div>
</div>
