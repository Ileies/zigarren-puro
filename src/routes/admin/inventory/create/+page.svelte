<script lang="ts">
	import { enhance } from '$app/forms';
	import { ProductType } from '$lib/types';

	let { data, form }: { data: any; form: Record<string, unknown> | null } = $props();

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

<div class="p-6 max-w-2xl">
	<div class="flex items-center gap-3 mb-6">
		<a href="/admin/inventory" class="text-sm text-zinc-400 hover:text-zinc-700">&larr; Inventar</a>
		<span class="text-zinc-300">/</span>
		<span class="text-sm text-zinc-600">Neues Produkt</span>
	</div>

	<div class="mb-6">
		<h1 class="text-xl font-bold text-zinc-900">Neues Produkt hinzufügen</h1>
	</div>

	{#if form?.error}
		<div class="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
			{form.error}
		</div>
	{/if}

	<form method="POST" action="?/create" use:enhance class="space-y-6">
		<!-- Produkttyp Auswahl -->
		<div class="bg-white rounded-lg border border-zinc-200 p-5 space-y-4">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Produkttyp</h2>
			<div class="grid grid-cols-4 gap-3">
				{#each Object.entries(ProductType) as [key, value]}
					<label class="relative flex items-center gap-2 p-3 border border-zinc-200 rounded-md cursor-pointer hover:bg-zinc-50" class:border-zinc-900={productType === value}>
						<input
							type="radio"
							name="productType"
							value={value}
							bind:group={productType}
							class="cursor-pointer"
						/>
						<span class="text-sm font-medium text-zinc-700">{typeLabels[value]}</span>
					</label>
				{/each}
			</div>
		</div>

		<!-- Base fields -->
		<div class="bg-white rounded-lg border border-zinc-200 p-5 space-y-4">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Basisfelder</h2>

			<div>
				<label class={labelClass} for="name">Name</label>
				<input id="name" name="name" type="text" required class={inputClass} />
			</div>

			<div>
				<label class={labelClass} for="description">Beschreibung</label>
				<textarea id="description" name="description" rows="4" class="{inputClass} resize-y"></textarea>
			</div>

			<div>
				<label class={labelClass} for="producerId">Hersteller</label>
				<select id="producerId" name="producerId" required class={inputClass}>
					<option value="">Bitte wählen...</option>
					{#each data.producers as producer}
						<option value={producer.id}>{producer.name}</option>
					{/each}
				</select>
			</div>

			<div class="grid grid-cols-3 gap-4">
				<div>
					<label class={labelClass} for="price">Preis (€)</label>
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
					<label class={labelClass} for="stock">Lagerbestand</label>
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
					<label class={labelClass} for="sku">SKU</label>
					<input id="sku" name="sku" type="text" required class={inputClass} />
				</div>
			</div>
		</div>

		<!-- Cigar details -->
		{#if productType === 'cigar'}
			<div class="bg-white rounded-lg border border-zinc-200 p-5 space-y-4">
				<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Zigarren-Details</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="lengthMm">Länge (mm)</label>
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
						<label class={labelClass} for="ringGauge">Ringmaß</label>
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
						<label class={labelClass} for="strength">Stärke</label>
						<select id="strength" name="strength" required class={inputClass}>
							<option value="">Bitte wählen...</option>
							<option value="mild">Mild</option>
							<option value="medium">Medium</option>
							<option value="full">Full</option>
						</select>
					</div>
					<div>
						<label class={labelClass} for="wrapperType">Deckblatt</label>
						<input
							id="wrapperType"
							name="wrapperType"
							type="text"
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="countryOfOrigin">Herkunft</label>
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
			<div class="bg-white rounded-lg border border-zinc-200 p-5 space-y-4">
				<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Zigarillo-Details</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="lengthMm">Länge (mm)</label>
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
						<label class={labelClass} for="ringGauge">Ringmaß</label>
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
						<label class={labelClass} for="filterType">Filter</label>
						<select id="filterType" name="filterType" required class={inputClass}>
							<option value="">Bitte wählen...</option>
							<option value="none">Ohne Filter</option>
							<option value="regular">Regular</option>
							<option value="charcoal">Aktivkohle</option>
						</select>
					</div>
					<div>
						<label class={labelClass} for="wrapperType">Deckblatt</label>
						<input
							id="wrapperType"
							name="wrapperType"
							type="text"
							required
							class={inputClass}
						/>
					</div>
				</div>
			</div>
		{/if}

		<!-- Beverage details -->
		{#if productType === 'beverage'}
			<div class="bg-white rounded-lg border border-zinc-200 p-5 space-y-4">
				<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Getränke-Details</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="beverageType">Typ</label>
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
						<label class={labelClass} for="countryOfOrigin">Herkunft</label>
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
						<label class={labelClass} for="volumeMl">Volumen (ml)</label>
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
						<label class={labelClass} for="alcoholPercentage">Alkohol (%)</label>
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
						<input
							id="agingYears"
							name="agingYears"
							type="number"
							min="0"
							class={inputClass}
						/>
					</div>
				</div>

				<div>
					<label class={labelClass} for="tastingNotes">Geschmacksnotizen</label>
					<textarea id="tastingNotes" name="tastingNotes" rows="3" class="{inputClass} resize-y"></textarea>
				</div>
			</div>
		{/if}

		<!-- Tool details -->
		{#if productType === 'tool'}
			<div class="bg-white rounded-lg border border-zinc-200 p-5 space-y-4">
				<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Zubehör-Details</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="brand">Marke</label>
						<input
							id="brand"
							name="brand"
							type="text"
							required
							class={inputClass}
						/>
					</div>
					<div>
						<label class={labelClass} for="material">Material</label>
						<input
							id="material"
							name="material"
							type="text"
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div>
					<label class={labelClass} for="specifications">Spezifikationen</label>
					<textarea id="specifications" name="specifications" rows="2" class="{inputClass} resize-y"></textarea>
				</div>

				<div>
					<label class={labelClass} for="careInstructions">Pflegehinweise</label>
					<textarea id="careInstructions" name="careInstructions" rows="2" class="{inputClass} resize-y"></textarea>
				</div>
			</div>
		{/if}

		<div class="flex gap-3">
			<button
				type="submit"
				class="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-700 transition-colors"
			>
				Produkt erstellen
			</button>
			<a
				href="/admin/inventory"
				class="border border-zinc-300 text-zinc-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-50 transition-colors"
			>
				Abbrechen
			</a>
		</div>
	</form>
</div>
