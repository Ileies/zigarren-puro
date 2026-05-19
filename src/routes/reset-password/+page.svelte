<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let loading = $state(false);
</script>

<svelte:head>
	<title>Neues Passwort – Zigarren Puro</title>
	<meta name="description" content="Vergeben Sie ein neues Passwort für Ihr Konto." />
</svelte:head>

<div class="flex flex-1 items-center justify-center bg-base-200 px-4 py-16">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<p class="font-serif text-3xl font-semibold tracking-wide text-base-content">Zigarren Puro</p>
			<p class="mt-1 text-sm text-base-content/60">Neues Passwort vergeben</p>
		</div>

		<div class="rounded-2xl bg-base-100 p-8 shadow-sm ring-1 ring-base-300">
			{#if data.status === 'invalid' || data.status === 'missing' || data.status === 'used'}
				<div class="flex flex-col items-center gap-4 text-center">
					<div class="flex h-14 w-14 items-center justify-center rounded-full bg-error/15">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="8" x2="12" y2="12" />
							<line x1="12" y1="16" x2="12.01" y2="16" />
						</svg>
					</div>
					<h1 class="text-xl font-semibold text-base-content">Link ungültig</h1>
					<p class="text-sm text-base-content/60">
						{#if data.status === 'used'}
							Dieser Reset-Link wurde bereits verwendet.
						{:else}
							Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.
						{/if}
					</p>
					<a href="/forgot-password" class="btn btn-primary mt-2 w-full">Neuen Link anfordern</a>
				</div>
			{:else}
				<h1 class="mb-6 text-xl font-semibold text-base-content">Neues Passwort</h1>

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
					<input type="hidden" name="token" value={data.token} />

					{#if form?.error}
						<div class="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
							{form.error}
						</div>
					{/if}

					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-medium text-base-content">Neues Passwort</span>
						<input
							type="password"
							name="password"
							required
							minlength="8"
							autocomplete="new-password"
							placeholder="Mindestens 8 Zeichen"
							class="input input-bordered w-full focus:input-primary"
						/>
					</label>

					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-medium text-base-content">Passwort bestätigen</span>
						<input
							type="password"
							name="confirmPassword"
							required
							minlength="8"
							autocomplete="new-password"
							placeholder="Passwort wiederholen"
							class="input input-bordered w-full focus:input-primary"
						/>
					</label>

					<button type="submit" disabled={loading} class="btn btn-primary mt-2 w-full">
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
						{:else}
							Passwort speichern
						{/if}
					</button>
				</form>
			{/if}
		</div>
	</div>
</div>
