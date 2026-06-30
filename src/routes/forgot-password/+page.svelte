<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
</script>

<svelte:head>
	<title>Passwort vergessen – Zigarren Puro</title>
	<meta name="description" content="Setzen Sie Ihr Passwort zurück." />
</svelte:head>

<div class="flex flex-1 items-center justify-center bg-base-200 px-4 py-16">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<p class="font-serif text-3xl font-semibold tracking-wide text-base-content">Zigarren Puro</p>
			<p class="mt-1 text-sm text-base-content/60">Passwort zurücksetzen</p>
		</div>

		<div class="rounded-2xl bg-base-100 p-8 shadow-sm ring-1 ring-base-300">
			{#if form?.sent}
				<div class="flex flex-col items-center gap-4 text-center">
					<div class="flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-7 w-7 text-success"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
					</div>
					<h1 class="text-xl font-semibold text-base-content">E-Mail gesendet</h1>
					<p class="text-sm text-base-content/60">
						Falls ein Konto mit dieser E-Mail-Adresse existiert, erhalten Sie in Kürze einen Link
						zum Zurücksetzen Ihres Passworts.
					</p>
					<a href="/login" class="btn mt-2 w-full btn-primary">Zurück zum Login</a>
				</div>
			{:else}
				<h1 class="mb-2 text-xl font-semibold text-base-content">Passwort vergessen?</h1>
				<p class="mb-6 text-sm text-base-content/60">
					Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres
					Passworts.
				</p>

				<form
					method="POST"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							loading = false;
							await update();
						};
					}}
					class="flex flex-col gap-4"
				>
					{#if form?.error}
						<div class="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
							{form.error}
						</div>
					{/if}

					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-medium text-base-content">E-Mail</span>
						<input
							type="email"
							name="email"
							required
							autocomplete="email"
							placeholder="ihre@email.de"
							class="input-bordered input w-full focus:input-primary"
						/>
					</label>

					<button type="submit" disabled={loading} class="btn mt-2 w-full btn-primary">
						{#if loading}
							<span class="loading loading-sm loading-spinner"></span>
						{:else}
							Link senden
						{/if}
					</button>
				</form>

				<p class="mt-6 text-center text-sm text-base-content/60">
					<a href="/login" class="font-medium text-secondary hover:underline">Zurück zum Login</a>
				</p>
			{/if}
		</div>
	</div>
</div>
