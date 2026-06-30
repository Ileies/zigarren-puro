<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
	let password = $state('');
	let passwordConfirm = $state('');

	const passwordMismatch = $derived(passwordConfirm.length > 0 && password !== passwordConfirm);
	const passwordTooShort = $derived(password.length > 0 && password.length < 8);

	const maxBirthDate = $derived(() => {
		const d = new Date();
		d.setFullYear(d.getFullYear() - 18);
		return d.toISOString().split('T')[0];
	});
</script>

<svelte:head>
	<title>Registrieren – Zigarren Puro</title>
	<meta name="description" content="Erstellen Sie Ihr Zigarren Puro Konto." />
</svelte:head>

<div class="flex flex-1 items-center justify-center bg-base-200 px-4 py-16">
	<div class="w-full max-w-lg">
		<div class="mb-8 text-center">
			<p class="font-serif text-3xl font-semibold tracking-wide text-base-content">Zigarren Puro</p>
			<p class="mt-1 text-sm text-base-content/60">Konto erstellen</p>
		</div>

		<div class="rounded-2xl bg-base-100 p-8 shadow-sm ring-1 ring-base-300">
			<h1 class="mb-6 text-xl font-semibold text-base-content">Registrieren</h1>

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="flex flex-col gap-5"
			>
				{#if form?.error}
					<div class="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
						{form.error}
					</div>
				{/if}

				<!-- Name -->
				<div class="grid grid-cols-2 gap-3">
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-medium">Vorname <span class="text-error">*</span></span>
						<input
							type="text"
							name="firstName"
							value={form?.firstName ?? ''}
							required
							autocomplete="given-name"
							placeholder="Max"
							class="input-bordered input w-full focus:input-primary"
						/>
					</label>
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-medium">Nachname <span class="text-error">*</span></span>
						<input
							type="text"
							name="lastName"
							value={form?.lastName ?? ''}
							required
							autocomplete="family-name"
							placeholder="Mustermann"
							class="input-bordered input w-full focus:input-primary"
						/>
					</label>
				</div>

				<!-- Email -->
				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-medium">E-Mail <span class="text-error">*</span></span>
					<input
						type="email"
						name="email"
						value={form?.email ?? ''}
						required
						autocomplete="email"
						placeholder="ihre@email.de"
						class="input-bordered input w-full focus:input-primary"
					/>
				</label>

				<!-- Birthdate + Gender -->
				<div class="grid grid-cols-2 gap-3">
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-medium">
							Geburtsdatum <span class="text-error">*</span>
							<span class="text-xs font-normal text-base-content/50">(mind. 18 Jahre)</span>
						</span>
						<input
							type="date"
							name="birthDate"
							value={form?.birthDate ?? ''}
							required
							max={maxBirthDate()}
							autocomplete="bday"
							class="input-bordered input w-full focus:input-primary"
						/>
					</label>
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-medium">Anrede</span>
						<select name="gender" class="select-bordered select w-full focus:select-primary">
							<option value="">Keine Angabe</option>
							<option value="male" selected={form?.gender === 'male'}>Herr</option>
							<option value="female" selected={form?.gender === 'female'}>Frau</option>
							<option value="other" selected={form?.gender === 'other'}>Divers</option>
						</select>
					</label>
				</div>

				<!-- Phone -->
				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-medium text-base-content">
						Telefon
						<span class="text-xs font-normal text-base-content/50">(optional)</span>
					</span>
					<input
						type="tel"
						name="phone"
						value={form?.phone ?? ''}
						autocomplete="tel"
						placeholder="+49 123 456789"
						class="input-bordered input w-full focus:input-primary"
					/>
				</label>

				<div class="divider my-0"></div>

				<!-- Password -->
				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-medium">Passwort <span class="text-error">*</span></span>
					<input
						type="password"
						name="password"
						bind:value={password}
						required
						minlength="8"
						autocomplete="new-password"
						placeholder="Mindestens 8 Zeichen"
						class="input-bordered input w-full focus:input-primary"
						class:input-error={passwordTooShort}
					/>
					{#if passwordTooShort}
						<p class="text-xs text-error">Mindestens 8 Zeichen erforderlich.</p>
					{/if}
				</label>

				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-medium"
						>Passwort bestätigen <span class="text-error">*</span></span
					>
					<input
						type="password"
						name="passwordConfirm"
						bind:value={passwordConfirm}
						required
						autocomplete="new-password"
						placeholder="Passwort wiederholen"
						class="input-bordered input w-full focus:input-primary"
						class:input-error={passwordMismatch}
					/>
					{#if passwordMismatch}
						<p class="text-xs text-error">Passwörter stimmen nicht überein.</p>
					{/if}
				</label>

				<div class="divider my-0"></div>

				<!-- Consents -->
				<div class="flex flex-col gap-3">
					<label class="flex cursor-pointer items-start gap-3">
						<input
							type="checkbox"
							name="acceptTerms"
							required
							class="checkbox mt-0.5 shrink-0 checkbox-primary"
						/>
						<span class="text-sm text-base-content/80">
							Ich akzeptiere die
							<a href="/terms" class="text-secondary hover:underline">AGB</a>
							und die
							<a href="/privacy" class="text-secondary hover:underline">Datenschutzerklärung</a>.
							<span class="text-error">*</span>
						</span>
					</label>

					<label class="flex cursor-pointer items-start gap-3">
						<input
							type="checkbox"
							name="marketingConsent"
							class="checkbox mt-0.5 shrink-0 checkbox-primary"
						/>
						<span class="text-sm text-base-content/80">
							Ich möchte Angebote, Neuigkeiten und exklusive Empfehlungen per E-Mail erhalten.
						</span>
					</label>
				</div>

				<button
					type="submit"
					disabled={loading || passwordMismatch || passwordTooShort}
					class="btn mt-1 w-full btn-primary"
				>
					{#if loading}
						<span class="loading loading-sm loading-spinner"></span>
					{:else}
						Konto erstellen
					{/if}
				</button>
			</form>

			<p class="mt-6 text-center text-sm text-base-content/60">
				Bereits ein Konto?
				<a href="/login" class="font-medium text-secondary hover:underline">Anmelden</a>
			</p>
		</div>
	</div>
</div>
