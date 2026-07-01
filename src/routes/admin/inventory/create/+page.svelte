<script lang="ts">
	import { enhance } from '$app/forms';
	import { ProductType } from '$lib/types';

	import type { PageData } from './$types';
	let { data, form }: { data: PageData; form: Record<string, unknown> | null } = $props();

	let productType = $state<string>(ProductType.CIGAR);

	const typeLabels: Record<string, string> = {
		cigar: 'Zigarre',
		cigarillo: 'Zigarillo',
		beverage: 'Getränk',
		tool: 'Zubehör'
	};

	const inputClass =
		'w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500';
	const labelClass = 'block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1';
</script>

<div class="max-w-2xl p-6">
	<div class="mb-6 flex items-center gap-3">
		<a href="/admin/inventory" class="text-sm text-zinc-400 hover:text-zinc-700">&larr; Inventar</a>
		<span class="text-zinc-300">/</span>
		<span class="text-sm text-zinc-600">Neues Produkt</span>
	</div>

	<div class="mb-6">
		<h1 class="text-xl font-bold text-zinc-900">Neues Produkt hinzufügen</h1>
	</div>

	{#if form?.error}
		<div class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
			{form.error}
		</div>
	{/if}

	<form method="POST" action="?/create" use:enhance class="space-y-6">
		<!-- Produkttyp Auswahl -->
		<div class="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
			<h2 class="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Produkttyp</h2>
			<div class="grid grid-cols-4 gap-3">
				{#each Object.entries(ProductType) as [, value] (value)}
					<label
						class="relative flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 p-3 hover:bg-zinc-50"
						class:border-zinc-900={productType === value}
					>
						<input
							type="radio"
							name="productType"
							{value}
							bind:group={productType}
							class="cursor-pointer"
						/>
						<span class="text-sm font-medium text-zinc-700">{typeLabels[value]}</span>
					</label>
				{/each}
			</div>
		</div>

		<!-- Base fields -->
		<div class="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
			<h2 class="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Basisfelder</h2>

			<div>
				<label class={labelClass} for="name">Name <span class="text-red-500">*</span></label>
				<input id="name" name="name" type="text" required class={inputClass} />
			</div>

			<div>
				<label class={labelClass} for="description">Beschreibung</label>
				<textarea id="description" name="description" rows="4" class="{inputClass} resize-y"
				></textarea>
			</div>

			<div>
				<label class={labelClass} for="producerId"
					>Hersteller <span class="text-red-500">*</span></label
				>
				<select id="producerId" name="producerId" required class={inputClass}>
					<option value="">Bitte wählen...</option>
					{#each data.producers as producer (producer.id)}
						<option value={producer.id}>{producer.name}</option>
					{/each}
				</select>
			</div>

			<div class="grid grid-cols-3 gap-4">
				<div>
					<label class={labelClass} for="price">Preis (€) <span class="text-red-500">*</span></label
					>
					<input
						id="price"
						name="price"
						type="number"
						step="0.01"
						min="0"
						required
						class={inputClass}
					/>
				</div>
				<div>
					<label class={labelClass} for="stock"
						>Lagerbestand <span class="text-red-500">*</span></label
					>
					<input
						id="stock"
						name="stock"
						type="number"
						min="0"
						value="0"
						required
						class={inputClass}
					/>
				</div>
				<div>
					<label class={labelClass} for="sku">SKU <span class="text-red-500">*</span></label>
					<input id="sku" name="sku" type="text" required class={inputClass} />
				</div>
			</div>
		</div>

		<!-- Cigar details -->
		{#if productType === 'cigar'}
			<div class="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
				<h2 class="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
					Zigarren-Details
				</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="lengthMm"
							>Länge (mm) <span class="text-red-500">*</span></label
						>
						<input
							id="lengthMm"
							name="lengthMm"
							type="number"
							step="0.1"
							min="0"
							required
							class={inputClass}
						/>
					</div>
					<div>
						<label class={labelClass} for="ringGauge"
							>Ringmaß <span class="text-red-500">*</span></label
						>
						<input
							id="ringGauge"
							name="ringGauge"
							type="number"
							step="0.1"
							min="0"
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="strength"
							>Stärke <span class="text-red-500">*</span></label
						>
						<select id="strength" name="strength" required class={inputClass}>
							<option value="">Bitte wählen...</option>
							<option value="mild">Mild</option>
							<option value="medium">Medium</option>
							<option value="full">Full</option>
						</select>
					</div>
					<div>
						<label class={labelClass} for="wrapperType"
							>Deckblatt <span class="text-red-500">*</span></label
						>
						<input id="wrapperType" name="wrapperType" type="text" required class={inputClass} />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="countryOfOrigin"
							>Herkunft <span class="text-red-500">*</span></label
						>
						<input
							id="countryOfOrigin"
							name="countryOfOrigin"
							type="text"
							required
							class={inputClass}
						/>
					</div>
					<div>
						<label class={labelClass} for="agingTimeMonths">Reifung (Monate)</label>
						<input
							id="agingTimeMonths"
							name="agingTimeMonths"
							type="number"
							min="0"
							class={inputClass}
						/>
					</div>
				</div>
			</div>
		{/if}

		<!-- Cigarillo details -->
		{#if productType === 'cigarillo'}
			<div class="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
				<h2 class="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
					Zigarillo-Details
				</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="lengthMm"
							>Länge (mm) <span class="text-red-500">*</span></label
						>
						<input
							id="lengthMm"
							name="lengthMm"
							type="number"
							step="0.1"
							min="0"
							required
							class={inputClass}
						/>
					</div>
					<div>
						<label class={labelClass} for="ringGauge"
							>Ringmaß <span class="text-red-500">*</span></label
						>
						<input
							id="ringGauge"
							name="ringGauge"
							type="number"
							step="0.1"
							min="0"
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="filterType"
							>Filter <span class="text-red-500">*</span></label
						>
						<select id="filterType" name="filterType" required class={inputClass}>
							<option value="">Bitte wählen...</option>
							<option value="none">Ohne Filter</option>
							<option value="regular">Regular</option>
							<option value="charcoal">Aktivkohle</option>
						</select>
					</div>
					<div>
						<label class={labelClass} for="wrapperType"
							>Deckblatt <span class="text-red-500">*</span></label
						>
						<input id="wrapperType" name="wrapperType" type="text" required class={inputClass} />
					</div>
				</div>
			</div>
		{/if}

		<!-- Beverage details -->
		{#if productType === 'beverage'}
			<div class="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
				<h2 class="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
					Getränke-Details
				</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="beverageType"
							>Typ <span class="text-red-500">*</span></label
						>
						<select id="beverageType" name="beverageType" required class={inputClass}>
							<option value="">Bitte wählen...</option>
							<option value="wine">Wein</option>
							<option value="whiskey">Whiskey</option>
							<option value="rum">Rum</option>
							<option value="cognac">Cognac</option>
							<option value="vodka">Vodka</option>
						</select>
					</div>
					<div>
						<label class={labelClass} for="countryOfOrigin"
							>Herkunft <span class="text-red-500">*</span></label
						>
						<input
							id="countryOfOrigin"
							name="countryOfOrigin"
							type="text"
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="volumeMl"
							>Volumen (ml) <span class="text-red-500">*</span></label
						>
						<input
							id="volumeMl"
							name="volumeMl"
							type="number"
							step="1"
							min="0"
							required
							class={inputClass}
						/>
					</div>
					<div>
						<label class={labelClass} for="alcoholPercentage"
							>Alkohol (%) <span class="text-red-500">*</span></label
						>
						<input
							id="alcoholPercentage"
							name="alcoholPercentage"
							type="number"
							step="0.1"
							min="0"
							max="100"
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="agingYears">Reifung (Jahre)</label>
						<input id="agingYears" name="agingYears" type="number" min="0" class={inputClass} />
					</div>
				</div>

				<div>
					<label class={labelClass} for="tastingNotes">Geschmacksnotizen</label>
					<textarea id="tastingNotes" name="tastingNotes" rows="3" class="{inputClass} resize-y"
					></textarea>
				</div>
			</div>
		{/if}

		<!-- Tool details -->
		{#if productType === 'tool'}
			<div class="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
				<h2 class="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Zubehör-Details</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="brand">Marke <span class="text-red-500">*</span></label>
						<input id="brand" name="brand" type="text" required class={inputClass} />
					</div>
					<div>
						<label class={labelClass} for="material"
							>Material <span class="text-red-500">*</span></label
						>
						<input id="material" name="material" type="text" required class={inputClass} />
					</div>
				</div>

				<div>
					<label class={labelClass} for="specifications">Spezifikationen</label>
					<textarea id="specifications" name="specifications" rows="2" class="{inputClass} resize-y"
					></textarea>
				</div>

				<div>
					<label class={labelClass} for="careInstructions">Pflegehinweise</label>
					<textarea
						id="careInstructions"
						name="careInstructions"
						rows="2"
						class="{inputClass} resize-y"
					></textarea>
				</div>
			</div>
		{/if}

		<div class="flex gap-3">
			<button
				type="submit"
				class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
			>
				Produkt erstellen
			</button>
			<a
				href="/admin/inventory"
				class="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
			>
				Abbrechen
			</a>
		</div>
	</form>
</div>
