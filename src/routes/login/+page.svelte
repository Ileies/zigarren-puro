<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let loading = $state(false);
</script>

<svelte:head>
	<title>Anmelden – Zigarren Puro</title>
	<meta name="description" content="Melden Sie sich in Ihrem Zigarren Puro Konto an." />
</svelte:head>

<div class="flex flex-1 items-center justify-center bg-base-200 px-4 py-16">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<p class="font-serif text-3xl font-semibold tracking-wide text-base-content">Zigarren Puro</p>
			<p class="mt-1 text-sm text-base-content/60">Willkommen zurück</p>
		</div>

		<div class="rounded-2xl bg-base-100 p-8 shadow-sm ring-1 ring-base-300">
			<h1 class="mb-6 text-xl font-semibold text-base-content">Anmelden</h1>

			{#if data.passwordReset}
				<div class="mb-4 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
					Ihr Passwort wurde erfolgreich zurückgesetzt. Bitte melden Sie sich an.
				</div>
			{/if}

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
						value={form?.email ?? ''}
						required
						autocomplete="email"
						placeholder="ihre@email.de"
						class="input input-bordered w-full focus:input-primary"
					/>
				</label>

				<label class="flex flex-col gap-1.5">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-base-content">Passwort</span>
						<a href="/forgot-password" class="text-xs text-secondary hover:underline">
							Passwort vergessen?
						</a>
					</div>
					<input
						type="password"
						name="password"
						required
						autocomplete="current-password"
						placeholder="••••••••"
						class="input input-bordered w-full focus:input-primary"
					/>
				</label>

				<button
					type="submit"
					disabled={loading}
					class="btn btn-primary mt-2 w-full"
				>
					{#if loading}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						Anmelden
					{/if}
				</button>
			</form>

			<p class="mt-6 text-center text-sm text-base-content/60">
				Noch kein Konto?
				<a href="/register" class="font-medium text-secondary hover:underline">Registrieren</a>
			</p>
		</div>
	</div>
</div>
