<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { MapPin, Shield, User } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let activeTab = $state<'profile' | 'password'>('profile');
	let profileLoading = $state(false);
	let passwordLoading = $state(false);
	let newPassword = $state('');
	let confirmPassword = $state('');

	const passwordMismatch = $derived(confirmPassword.length > 0 && newPassword !== confirmPassword);
	const passwordTooShort = $derived(newPassword.length > 0 && newPassword.length < 8);

	$effect(() => {
		if (form?.action === 'password') activeTab = 'password';
		if (form?.action === 'profile') activeTab = 'profile';
	});
</script>

<svelte:head>
	<title>Mein Konto – Zigarren Puro</title>
	<meta name="description" content="Verwalten Sie Ihr Zigarren Puro Konto." />
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-3xl px-4 py-10">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-2xl font-semibold text-base-content">Mein Konto</h1>
			<p class="mt-1 text-sm text-base-content/60">
				Hallo, {data.customer.firstName} {data.customer.lastName}
			</p>
		</div>

		<!-- Quick links -->
		<div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
			<a
				href="/account/addresses"
				class="flex items-center gap-3 rounded-xl bg-base-100 p-4 shadow-sm ring-1 ring-base-300 transition-shadow hover:shadow-md"
			>
				<div class="rounded-lg bg-primary/10 p-2">
					<MapPin class="h-5 w-5 text-primary" />
				</div>
				<div>
					<p class="font-medium text-base-content">Adressen</p>
					<p class="text-xs text-base-content/60">Liefr- & Rechnungsadressen verwalten</p>
				</div>
			</a>
			<a
				href="/account/orders"
				class="flex items-center gap-3 rounded-xl bg-base-100 p-4 shadow-sm ring-1 ring-base-300 transition-shadow hover:shadow-md"
			>
				<div class="rounded-lg bg-secondary/10 p-2">
					<Shield class="h-5 w-5 text-secondary" />
				</div>
				<div>
					<p class="font-medium text-base-content">Bestellungen</p>
					<p class="text-xs text-base-content/60">Bestellhistorie einsehen</p>
				</div>
			</a>
		</div>

		<!-- Tabs -->
		<div class="rounded-2xl bg-base-100 shadow-sm ring-1 ring-base-300">
			<div class="flex border-b border-base-300">
				<button
					onclick={() => (activeTab = 'profile')}
					class={[
						'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors',
						activeTab === 'profile'
							? 'border-b-2 border-primary text-primary'
							: 'text-base-content/60'
					].join(' ')}
				>
					<User class="h-4 w-4" />
					Profil
				</button>
				<button
					onclick={() => (activeTab = 'password')}
					class={[
						'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors',
						activeTab === 'password'
							? 'border-b-2 border-primary text-primary'
							: 'text-base-content/60'
					].join(' ')}
				>
					<Shield class="h-4 w-4" />
					Passwort ändern
				</button>
			</div>

			<div class="p-6 sm:p-8">
				<!-- Profile Tab -->
				{#if activeTab === 'profile'}
					{#if form?.action === 'profile' && form.success}
						<div class="mb-5 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
							Profil erfolgreich gespeichert.
						</div>
					{/if}
					{#if form?.action === 'profile' && form.error}
						<div class="mb-5 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
							{form.error}
						</div>
					{/if}

					<form
						method="POST"
						action="?/updateProfile"
						use:enhance={() => {
							profileLoading = true;
							return async ({ update }) => {
								profileLoading = false;
								await update();
							};
						}}
						class="flex flex-col gap-5"
					>
						<!-- Name -->
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<label class="flex flex-col gap-1.5">
								<span class="text-sm font-medium">Vorname <span class="text-error">*</span></span>
								<input
									type="text"
									name="firstName"
									value={data.customer.firstName}
									required
									autocomplete="given-name"
									class="input input-bordered w-full focus:input-primary"
								/>
							</label>
							<label class="flex flex-col gap-1.5">
								<span class="text-sm font-medium">Nachname <span class="text-error">*</span></span>
								<input
									type="text"
									name="lastName"
									value={data.customer.lastName}
									required
									autocomplete="family-name"
									class="input input-bordered w-full focus:input-primary"
								/>
							</label>
						</div>

						<!-- E-Mail (read-only) -->
						<label class="flex flex-col gap-1.5">
							<span class="text-sm font-medium text-base-content">E-Mail</span>
							<input
								type="email"
								value={data.customer.email}
								disabled
								class="input input-bordered w-full opacity-60"
							/>
							<p class="text-xs text-base-content/50">E-Mail-Adresse kann nicht geändert werden.</p>
						</label>

						<!-- Phone + Gender -->
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<label class="flex flex-col gap-1.5">
								<span class="text-sm font-medium">
									Telefon <span class="text-xs font-normal text-base-content/50">(optional)</span>
								</span>
								<input
									type="tel"
									name="phone"
									value={data.customer.phone ?? ''}
									autocomplete="tel"
									placeholder="+49 123 456789"
									class="input input-bordered w-full focus:input-primary"
								/>
							</label>
							<label class="flex flex-col gap-1.5">
								<span class="text-sm font-medium">Anrede</span>
								<select
									name="gender"
									class="select select-bordered w-full focus:select-primary"
								>
									<option value="" selected={!data.customer.gender}>Keine Angabe</option>
									<option value="male" selected={data.customer.gender === 'male'}>Herr</option>
									<option value="female" selected={data.customer.gender === 'female'}>Frau</option>
									<option value="other" selected={data.customer.gender === 'other'}>Divers</option>
								</select>
							</label>
						</div>

						<!-- Marketing consent -->
						<label class="flex cursor-pointer items-start gap-3">
							<input
								type="checkbox"
								name="marketingConsent"
								checked={data.customer.marketingConsent}
								class="checkbox checkbox-primary mt-0.5 shrink-0"
							/>
							<span class="text-sm text-base-content/80">
								Ich möchte Angebote, Neuigkeiten und exklusive Empfehlungen per E-Mail erhalten.
							</span>
						</label>

						<div class="flex justify-end">
							<button type="submit" disabled={profileLoading} class="btn btn-primary">
								{#if profileLoading}
									<span class="loading loading-spinner loading-sm"></span>
								{:else}
									Speichern
								{/if}
							</button>
						</div>
					</form>

				<!-- Password Tab -->
				{:else}
					{#if form?.action === 'password' && form.success}
						<div class="mb-5 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
							Passwort erfolgreich geändert.
						</div>
					{/if}
					{#if form?.action === 'password' && form.error}
						<div class="mb-5 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
							{form.error}
						</div>
					{/if}

					<form
						method="POST"
						action="?/changePassword"
						use:enhance={() => {
							passwordLoading = true;
							return async ({ update }) => {
								passwordLoading = false;
								newPassword = '';
								confirmPassword = '';
								await update();
							};
						}}
						class="flex flex-col gap-5"
					>
						<label class="flex flex-col gap-1.5">
							<span class="text-sm font-medium">Aktuelles Passwort <span class="text-error">*</span></span>
							<input
								type="password"
								name="currentPassword"
								required
								autocomplete="current-password"
								placeholder="••••••••"
								class="input input-bordered w-full focus:input-primary"
							/>
						</label>

						<label class="flex flex-col gap-1.5">
							<span class="text-sm font-medium">Neues Passwort <span class="text-error">*</span></span>
							<input
								type="password"
								name="newPassword"
								bind:value={newPassword}
								required
								minlength="8"
								autocomplete="new-password"
								placeholder="Mindestens 8 Zeichen"
								class="input input-bordered w-full focus:input-primary"
								class:input-error={passwordTooShort}
							/>
							{#if passwordTooShort}
								<p class="text-xs text-error">Mindestens 8 Zeichen erforderlich.</p>
							{/if}
						</label>

						<label class="flex flex-col gap-1.5">
							<span class="text-sm font-medium">Neues Passwort bestätigen <span class="text-error">*</span></span>
							<input
								type="password"
								name="confirmPassword"
								bind:value={confirmPassword}
								required
								autocomplete="new-password"
								placeholder="Passwort wiederholen"
								class="input input-bordered w-full focus:input-primary"
								class:input-error={passwordMismatch}
							/>
							{#if passwordMismatch}
								<p class="text-xs text-error">Passwörter stimmen nicht überein.</p>
							{/if}
						</label>

						<div class="flex justify-end">
							<button
								type="submit"
								disabled={passwordLoading || passwordMismatch || passwordTooShort}
								class="btn btn-primary"
							>
								{#if passwordLoading}
									<span class="loading loading-spinner loading-sm"></span>
								{:else}
									Passwort ändern
								{/if}
							</button>
						</div>
					</form>
				{/if}
			</div>
		</div>
	</div>
</div>
