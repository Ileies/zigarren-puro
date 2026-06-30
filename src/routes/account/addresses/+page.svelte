<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { ArrowLeft, MapPin, Plus, Star, Trash2 } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showForm = $state(false);
	let addLoading = $state(false);

	const shipping = $derived(data.addresses.filter((a) => a.type === 'shipping'));
	const billing = $derived(data.addresses.filter((a) => a.type === 'billing'));

	const countryNames: Record<string, string> = {
		DE: 'Deutschland',
		AT: 'Österreich',
		CH: 'Schweiz',
		LU: 'Luxemburg',
		BE: 'Belgien',
		NL: 'Niederlande',
		FR: 'Frankreich',
		IT: 'Italien',
		ES: 'Spanien',
		PL: 'Polen'
	};
</script>

<svelte:head>
	<title>Adressen – Zigarren Puro</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-3xl px-4 py-10">
		<div class="mb-6 flex items-center gap-3">
			<a href="/account" class="btn btn-circle btn-ghost btn-sm">
				<ArrowLeft class="h-4 w-4" />
			</a>
			<div>
				<h1 class="text-2xl font-semibold text-base-content">Adressen</h1>
				<p class="text-sm text-base-content/60">Liefer- und Rechnungsadressen verwalten</p>
			</div>
		</div>

		{#if form?.error}
			<div class="mb-4 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{form.error}</div>
		{/if}
		{#if form?.success}
			<div class="mb-4 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
				Adresse gespeichert.
			</div>
		{/if}

		<!-- Shipping addresses -->
		<section class="mb-6">
			<h2 class="mb-3 flex items-center gap-2 text-base font-semibold text-base-content">
				<MapPin class="h-4 w-4 text-primary" />
				Lieferadressen
			</h2>

			{#if shipping.length === 0}
				<p
					class="rounded-xl bg-base-100 px-5 py-4 text-sm text-base-content/50 ring-1 ring-base-300"
				>
					Noch keine Lieferadresse hinterlegt.
				</p>
			{:else}
				<div class="flex flex-col gap-3">
					{#each shipping as address (address.id)}
						<div
							class="flex flex-col gap-3 rounded-xl bg-base-100 p-4 shadow-sm ring-1 sm:flex-row sm:items-start sm:justify-between"
							class:ring-primary={address.isDefault}
							class:ring-base-300={!address.isDefault}
						>
							<div class="flex gap-3">
								<MapPin class="mt-0.5 h-4 w-4 shrink-0 text-base-content/40" />
								<div class="text-sm text-base-content">
									<p class="font-medium">{address.street}</p>
									<p>
										{address.postalCode}
										{address.city}{address.state ? `, ${address.state}` : ''}
									</p>
									<p>{countryNames[address.country] ?? address.country}</p>
									{#if address.isDefault}
										<span class="mt-1 badge badge-sm badge-primary">Standard</span>
									{/if}
								</div>
							</div>
							<div class="flex shrink-0 gap-2">
								{#if !address.isDefault}
									<form method="POST" action="?/setDefault" use:enhance>
										<input type="hidden" name="id" value={address.id} />
										<input type="hidden" name="type" value={address.type} />
										<button type="submit" class="btn btn-ghost btn-xs" title="Als Standard setzen">
											<Star class="h-3.5 w-3.5" />
										</button>
									</form>
								{/if}
								<form method="POST" action="?/deleteAddress" use:enhance>
									<input type="hidden" name="id" value={address.id} />
									<button
										type="submit"
										class="btn text-error btn-ghost btn-xs"
										title="Adresse löschen"
									>
										<Trash2 class="h-3.5 w-3.5" />
									</button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Billing addresses -->
		<section class="mb-8">
			<h2 class="mb-3 flex items-center gap-2 text-base font-semibold text-base-content">
				<MapPin class="h-4 w-4 text-secondary" />
				Rechnungsadressen
			</h2>

			{#if billing.length === 0}
				<p
					class="rounded-xl bg-base-100 px-5 py-4 text-sm text-base-content/50 ring-1 ring-base-300"
				>
					Noch keine Rechnungsadresse hinterlegt.
				</p>
			{:else}
				<div class="flex flex-col gap-3">
					{#each billing as address (address.id)}
						<div
							class="flex flex-col gap-3 rounded-xl bg-base-100 p-4 shadow-sm ring-1 sm:flex-row sm:items-start sm:justify-between"
							class:ring-secondary={address.isDefault}
							class:ring-base-300={!address.isDefault}
						>
							<div class="flex gap-3">
								<MapPin class="mt-0.5 h-4 w-4 shrink-0 text-base-content/40" />
								<div class="text-sm text-base-content">
									<p class="font-medium">{address.street}</p>
									<p>
										{address.postalCode}
										{address.city}{address.state ? `, ${address.state}` : ''}
									</p>
									<p>{countryNames[address.country] ?? address.country}</p>
									{#if address.isDefault}
										<span class="mt-1 badge badge-sm badge-secondary">Standard</span>
									{/if}
								</div>
							</div>
							<div class="flex shrink-0 gap-2">
								{#if !address.isDefault}
									<form method="POST" action="?/setDefault" use:enhance>
										<input type="hidden" name="id" value={address.id} />
										<input type="hidden" name="type" value={address.type} />
										<button type="submit" class="btn btn-ghost btn-xs" title="Als Standard setzen">
											<Star class="h-3.5 w-3.5" />
										</button>
									</form>
								{/if}
								<form method="POST" action="?/deleteAddress" use:enhance>
									<input type="hidden" name="id" value={address.id} />
									<button
										type="submit"
										class="btn text-error btn-ghost btn-xs"
										title="Adresse löschen"
									>
										<Trash2 class="h-3.5 w-3.5" />
									</button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Add address -->
		{#if !showForm}
			<button onclick={() => (showForm = true)} class="btn gap-2 btn-primary">
				<Plus class="h-4 w-4" />
				Neue Adresse hinzufügen
			</button>
		{:else}
			<div class="rounded-2xl bg-base-100 p-6 shadow-sm ring-1 ring-base-300 sm:p-8">
				<h3 class="mb-5 text-lg font-semibold text-base-content">Neue Adresse</h3>

				<form
					method="POST"
					action="?/addAddress"
					use:enhance={() => {
						addLoading = true;
						return async ({ result, update }) => {
							addLoading = false;
							if (result.type === 'success') showForm = false;
							await update();
						};
					}}
					class="flex flex-col gap-4"
				>
					<!-- Address type -->
					<div class="flex flex-col gap-1.5">
						<span class="text-sm font-medium">Adresstyp <span class="text-error">*</span></span>
						<div class="flex gap-4">
							<label class="flex cursor-pointer items-center gap-2">
								<input
									type="radio"
									name="type"
									value="shipping"
									checked
									class="radio radio-sm radio-primary"
								/>
								<span class="text-sm">Lieferadresse</span>
							</label>
							<label class="flex cursor-pointer items-center gap-2">
								<input
									type="radio"
									name="type"
									value="billing"
									class="radio radio-sm radio-primary"
								/>
								<span class="text-sm">Rechnungsadresse</span>
							</label>
						</div>
					</div>

					<!-- Street -->
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-medium"
							>Straße & Hausnummer <span class="text-error">*</span></span
						>
						<input
							type="text"
							name="street"
							required
							autocomplete="street-address"
							placeholder="Musterstraße 42"
							class="input-bordered input w-full focus:input-primary"
						/>
					</label>

					<!-- Postal + City -->
					<div class="grid grid-cols-5 gap-3">
						<label class="col-span-2 flex flex-col gap-1.5">
							<span class="text-sm font-medium">PLZ <span class="text-error">*</span></span>
							<input
								type="text"
								name="postalCode"
								required
								autocomplete="postal-code"
								placeholder="12345"
								class="input-bordered input w-full focus:input-primary"
							/>
						</label>
						<label class="col-span-3 flex flex-col gap-1.5">
							<span class="text-sm font-medium">Stadt <span class="text-error">*</span></span>
							<input
								type="text"
								name="city"
								required
								autocomplete="address-level2"
								placeholder="Berlin"
								class="input-bordered input w-full focus:input-primary"
							/>
						</label>
					</div>

					<!-- State + Country -->
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<label class="flex flex-col gap-1.5">
							<span class="text-sm font-medium">
								Bundesland / Region
								<span class="text-xs font-normal text-base-content/50">(optional)</span>
							</span>
							<input
								type="text"
								name="state"
								autocomplete="address-level1"
								placeholder="Bayern"
								class="input-bordered input w-full focus:input-primary"
							/>
						</label>
						<label class="flex flex-col gap-1.5">
							<span class="text-sm font-medium">Land <span class="text-error">*</span></span>
							<select
								name="country"
								required
								class="select-bordered select w-full focus:select-primary"
							>
								<option value="DE">Deutschland</option>
								<option value="AT">Österreich</option>
								<option value="CH">Schweiz</option>
								<option value="LU">Luxemburg</option>
								<option value="BE">Belgien</option>
								<option value="NL">Niederlande</option>
								<option value="FR">Frankreich</option>
								<option value="IT">Italien</option>
								<option value="ES">Spanien</option>
								<option value="PL">Polen</option>
							</select>
						</label>
					</div>

					<!-- Default -->
					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" name="isDefault" class="checkbox checkbox-primary" />
						<span class="text-sm">Als Standardadresse speichern</span>
					</label>

					<div class="flex gap-3 pt-1">
						<button type="submit" disabled={addLoading} class="btn btn-primary">
							{#if addLoading}
								<span class="loading loading-sm loading-spinner"></span>
							{:else}
								Adresse speichern
							{/if}
						</button>
						<button type="button" onclick={() => (showForm = false)} class="btn btn-ghost">
							Abbrechen
						</button>
					</div>
				</form>
			</div>
		{/if}
	</div>
</div>
