<script lang="ts">
	import { CheckCircle, XCircle, AlertCircle, Mail } from 'lucide-svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Newsletter abbestellen – Zigarren Puro</title>
	<meta name="description" content="Newsletter-Abonnement verwalten" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4 py-16">
	<div class="max-w-md w-full text-center space-y-6">
		{#if data.status === 'success'}
			<div class="flex justify-center">
				<CheckCircle class="w-16 h-16 text-success" />
			</div>
			<h1 class="text-2xl font-bold">Erfolgreich abgemeldet</h1>
			<p class="text-base-content/70">
				Sie wurden erfolgreich von unserem Newsletter abgemeldet. Sie erhalten keine weiteren
				Marketing-E-Mails von uns.
			</p>
		{:else if data.status === 'already_unsubscribed'}
			<div class="flex justify-center">
				<AlertCircle class="w-16 h-16 text-warning" />
			</div>
			<h1 class="text-2xl font-bold">Bereits abgemeldet</h1>
			<p class="text-base-content/70">
				Sie sind bereits von unserem Newsletter abgemeldet.
			</p>
		{:else if data.status === 'invalid'}
			<div class="flex justify-center">
				<XCircle class="w-16 h-16 text-error" />
			</div>
			<h1 class="text-2xl font-bold">Ungültiger Link</h1>
			<p class="text-base-content/70">
				Dieser Abmeldelink ist abgelaufen oder ungültig. Bitte verwenden Sie den Link aus der
				E-Mail oder kontaktieren Sie uns direkt.
			</p>
		{:else}
			<div class="flex justify-center">
				<Mail class="w-16 h-16 text-base-content/40" />
			</div>
			<h1 class="text-2xl font-bold">Newsletter abbestellen</h1>
			<p class="text-base-content/70">
				Um sich abzumelden, verwenden Sie bitte den Abmeldelink in einer unserer E-Mails.
			</p>
		{/if}

		<div class="pt-4">
			<a href="/" class="btn btn-ghost">Zur Startseite</a>
		</div>
	</div>
</div>
