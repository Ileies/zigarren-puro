<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let product = $derived(data.product);

	const typeLabels: Record<string, string> = {
		cigar: 'Zigarre',
		cigarillo: 'Zigarillo',
		beverage: 'Getränk',
		tool: 'Zubehör'
	};

	let confirmDelete = $state(false);

	const inputClass =
		'w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500';
	const labelClass = 'block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1';
</script>

<div class="p-6 max-w-2xl">
	<div class="flex items-center gap-3 mb-6">
		<a href="/admin/inventory" class="text-sm text-zinc-400 hover:text-zinc-700">&larr; Inventar</a>
		<span class="text-zinc-300">/</span>
		<span class="text-sm text-zinc-600">{product.name}</span>
	</div>

	<div class="flex items-start justify-between mb-6">
		<div>
			<h1 class="text-xl font-bold text-zinc-900">{product.name}</h1>
			<div class="text-sm text-zinc-400 mt-0.5">
				{typeLabels[product.productType] ?? product.productType}
			</div>
		</div>
	</div>

	{#if form?.success}
		<div class="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
			Produkt wurde gespeichert.
		</div>
	{/if}
	{#if form?.error}
		<div class="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
			{form.error}
		</div>
	{/if}

	<form method="POST" action="?/update" use:enhance class="space-y-6 mb-6">
		<!-- Base fields -->
		<div class="bg-white rounded-lg border border-zinc-200 p-5 space-y-4">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Basisfelder</h2>

			<div>
				<label class={labelClass} for="name">Name</label>
				<input id="name" name="name" type="text" value={product.name} required class={inputClass} />
			</div>

			<div>
				<label class={labelClass} for="description">Beschreibung</label>
				<textarea id="description" name="description" rows="4" class="{inputClass} resize-y"
					>{product.description ?? ''}</textarea
				>
			</div>

			<div>
				<label class={labelClass} for="producerId">Hersteller</label>
				<select id="producerId" name="producerId" required class={inputClass}>
					{#each data.producers as producer}
						<option value={producer.id} selected={producer.id === product.producerId}>
							{producer.name}
						</option>
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
						value={product.price}
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
						value={product.stock}
						required
						class={inputClass}
					/>
				</div>
				<div>
					<label class={labelClass} for="sku">SKU</label>
					<input id="sku" name="sku" type="text" value={product.sku} required class={inputClass} />
				</div>
			</div>
		</div>

		<!-- Cigar details -->
		{#if product.productType === 'cigar'}
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
							value={product.cigarDetails?.lengthMm ?? ''}
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
							value={product.cigarDetails?.ringGauge ?? ''}
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="strength">Stärke</label>
						<select id="strength" name="strength" required class={inputClass}>
							<option value="mild" selected={product.cigarDetails?.strength === 'mild'}>Mild</option>
							<option value="medium" selected={product.cigarDetails?.strength === 'medium'}>Medium</option>
							<option value="full" selected={product.cigarDetails?.strength === 'full'}>Full</option>
						</select>
					</div>
					<div>
						<label class={labelClass} for="wrapperType">Deckblatt</label>
						<input
							id="wrapperType"
							name="wrapperType"
							type="text"
							value={product.cigarDetails?.wrapperType ?? ''}
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
							value={product.cigarDetails?.countryOfOrigin ?? ''}
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
							value={product.cigarDetails?.agingTimeMonths ?? ''}
							class={inputClass}
						/>
					</div>
				</div>
			</div>
		{/if}

		<!-- Cigarillo details -->
		{#if product.productType === 'cigarillo'}
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
							value={product.cigarilloDetails?.lengthMm ?? ''}
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
							value={product.cigarilloDetails?.ringGauge ?? ''}
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="filterType">Filter</label>
						<select id="filterType" name="filterType" required class={inputClass}>
							<option value="none" selected={product.cigarilloDetails?.filterType === 'none'}>Ohne Filter</option>
							<option value="regular" selected={product.cigarilloDetails?.filterType === 'regular'}>Regular</option>
							<option value="charcoal" selected={product.cigarilloDetails?.filterType === 'charcoal'}>Aktivkohle</option>
						</select>
					</div>
					<div>
						<label class={labelClass} for="wrapperType">Deckblatt</label>
						<input
							id="wrapperType"
							name="wrapperType"
							type="text"
							value={product.cigarilloDetails?.wrapperType ?? ''}
							required
							class={inputClass}
						/>
					</div>
				</div>
			</div>
		{/if}

		<!-- Beverage details -->
		{#if product.productType === 'beverage'}
			<div class="bg-white rounded-lg border border-zinc-200 p-5 space-y-4">
				<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Getränke-Details</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="beverageType">Typ</label>
						<select id="beverageType" name="beverageType" required class={inputClass}>
							<option value="wine" selected={product.beverageDetails?.type === 'wine'}>Wein</option>
							<option value="whiskey" selected={product.beverageDetails?.type === 'whiskey'}>Whiskey</option>
							<option value="rum" selected={product.beverageDetails?.type === 'rum'}>Rum</option>
							<option value="cognac" selected={product.beverageDetails?.type === 'cognac'}>Cognac</option>
							<option value="vodka" selected={product.beverageDetails?.type === 'vodka'}>Vodka</option>
						</select>
					</div>
					<div>
						<label class={labelClass} for="countryOfOrigin">Herkunft</label>
						<input
							id="countryOfOrigin"
							name="countryOfOrigin"
							type="text"
							value={product.beverageDetails?.countryOfOrigin ?? ''}
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
							value={product.beverageDetails?.volumeMl ?? ''}
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
							value={product.beverageDetails?.alcoholPercentage ?? ''}
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
							value={product.beverageDetails?.agingYears ?? ''}
							class={inputClass}
						/>
					</div>
				</div>

				<div>
					<label class={labelClass} for="tastingNotes">Geschmacksnotizen</label>
					<textarea id="tastingNotes" name="tastingNotes" rows="3" class="{inputClass} resize-y"
						>{product.beverageDetails?.tastingNotes ?? ''}</textarea
					>
				</div>
			</div>
		{/if}

		<!-- Tool details -->
		{#if product.productType === 'tool'}
			<div class="bg-white rounded-lg border border-zinc-200 p-5 space-y-4">
				<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Zubehör-Details</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="brand">Marke</label>
						<input
							id="brand"
							name="brand"
							type="text"
							value={product.toolDetails?.brand ?? ''}
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
							value={product.toolDetails?.material ?? ''}
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div>
					<label class={labelClass} for="specifications">Spezifikationen</label>
					<textarea id="specifications" name="specifications" rows="2" class="{inputClass} resize-y"
						>{product.toolDetails?.specifications ?? ''}</textarea
					>
				</div>

				<div>
					<label class={labelClass} for="careInstructions">Pflegehinweise</label>
					<textarea id="careInstructions" name="careInstructions" rows="2" class="{inputClass} resize-y"
						>{product.toolDetails?.careInstructions ?? ''}</textarea
					>
				</div>
			</div>
		{/if}

		<div>
			<button
				type="submit"
				class="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-700 transition-colors"
			>
				Speichern
			</button>
		</div>
	</form>

	<!-- Delete -->
	<div class="bg-white rounded-lg border border-red-200 p-5">
		<h2 class="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2">Gefahrenzone</h2>
		{#if confirmDelete}
			<p class="text-sm text-zinc-600 mb-3">
				Sicher? Das Produkt wird dauerhaft gelöscht und kann nicht wiederhergestellt werden.
			</p>
			<div class="flex gap-2">
				<form method="POST" action="?/delete" use:enhance>
					<button
						type="submit"
						class="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
					>
						Ja, löschen
					</button>
				</form>
				<button
					type="button"
					onclick={() => (confirmDelete = false)}
					class="border border-zinc-300 text-zinc-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-50 transition-colors"
				>
					Abbrechen
				</button>
			</div>
		{:else}
			<button
				type="button"
				onclick={() => (confirmDelete = true)}
				class="text-sm text-red-600 hover:text-red-800 underline underline-offset-2"
			>
				Produkt löschen
			</button>
		{/if}
	</div>
</div>
