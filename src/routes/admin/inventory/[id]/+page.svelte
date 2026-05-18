<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let product = $derived(data.product);

	const typeLabels: Record<string, string> = {
		CIGAR: 'Zigarre',
		CIGARILLO: 'Zigarillo',
		BEVERAGE: 'Getränk',
		TOOL: 'Zubehör'
	};

	let confirmDelete = $state(false);
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
				&bull; SKU: {product.sku}
				&bull; {product.producer?.name ?? '—'}
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

	<form method="POST" action="?/update" use:enhance class="bg-white rounded-lg border border-zinc-200 p-5 space-y-4 mb-6">
		<div>
			<label class="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1" for="name">
				Name
			</label>
			<input
				id="name"
				name="name"
				type="text"
				value={product.name}
				required
				class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
			/>
		</div>

		<div>
			<label class="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1" for="description">
				Beschreibung
			</label>
			<textarea
				id="description"
				name="description"
				rows="4"
				class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 resize-y"
			>{product.description ?? ''}</textarea>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label class="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1" for="price">
					Preis (€)
				</label>
				<input
					id="price"
					name="price"
					type="number"
					step="0.01"
					min="0"
					value={product.price}
					required
					class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
				/>
			</div>
			<div>
				<label class="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1" for="stock">
					Lagerbestand
				</label>
				<input
					id="stock"
					name="stock"
					type="number"
					min="0"
					value={product.stock}
					required
					class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
				/>
			</div>
		</div>

		<div class="pt-2">
			<button
				type="submit"
				class="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-700 transition-colors"
			>
				Speichern
			</button>
		</div>
	</form>

	<!-- Type-specific details (read-only) -->
	{#if product.cigarDetails}
		<div class="bg-white rounded-lg border border-zinc-200 p-5 mb-6">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Zigarren-Details</h2>
			<dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
				<dt class="text-zinc-500">Länge</dt>
				<dd class="text-zinc-900">{product.cigarDetails.lengthMm} mm</dd>
				<dt class="text-zinc-500">Ringmaß</dt>
				<dd class="text-zinc-900">{product.cigarDetails.ringGauge}</dd>
				<dt class="text-zinc-500">Stärke</dt>
				<dd class="text-zinc-900">{product.cigarDetails.strength}</dd>
				<dt class="text-zinc-500">Deckblatt</dt>
				<dd class="text-zinc-900">{product.cigarDetails.wrapperType}</dd>
				<dt class="text-zinc-500">Herkunft</dt>
				<dd class="text-zinc-900">{product.cigarDetails.countryOfOrigin}</dd>
				{#if product.cigarDetails.agingTimeMonths}
					<dt class="text-zinc-500">Reifung</dt>
					<dd class="text-zinc-900">{product.cigarDetails.agingTimeMonths} Monate</dd>
				{/if}
			</dl>
		</div>
	{/if}

	{#if product.cigarilloDetails}
		<div class="bg-white rounded-lg border border-zinc-200 p-5 mb-6">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Zigarillo-Details</h2>
			<dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
				<dt class="text-zinc-500">Länge</dt>
				<dd class="text-zinc-900">{product.cigarilloDetails.lengthMm} mm</dd>
				<dt class="text-zinc-500">Ringmaß</dt>
				<dd class="text-zinc-900">{product.cigarilloDetails.ringGauge}</dd>
				<dt class="text-zinc-500">Filter</dt>
				<dd class="text-zinc-900">{product.cigarilloDetails.filterType}</dd>
				<dt class="text-zinc-500">Deckblatt</dt>
				<dd class="text-zinc-900">{product.cigarilloDetails.wrapperType}</dd>
			</dl>
		</div>
	{/if}

	{#if product.beverageDetails}
		<div class="bg-white rounded-lg border border-zinc-200 p-5 mb-6">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Getränke-Details</h2>
			<dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
				<dt class="text-zinc-500">Typ</dt>
				<dd class="text-zinc-900">{product.beverageDetails.type}</dd>
				<dt class="text-zinc-500">Volumen</dt>
				<dd class="text-zinc-900">{product.beverageDetails.volumeMl} ml</dd>
				<dt class="text-zinc-500">Alkohol</dt>
				<dd class="text-zinc-900">{product.beverageDetails.alcoholPercentage} %</dd>
				<dt class="text-zinc-500">Herkunft</dt>
				<dd class="text-zinc-900">{product.beverageDetails.countryOfOrigin}</dd>
				{#if product.beverageDetails.agingYears}
					<dt class="text-zinc-500">Reifung</dt>
					<dd class="text-zinc-900">{product.beverageDetails.agingYears} Jahre</dd>
				{/if}
				{#if product.beverageDetails.tastingNotes}
					<dt class="text-zinc-500">Geschmack</dt>
					<dd class="text-zinc-900">{product.beverageDetails.tastingNotes}</dd>
				{/if}
			</dl>
		</div>
	{/if}

	{#if product.toolDetails}
		<div class="bg-white rounded-lg border border-zinc-200 p-5 mb-6">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Zubehör-Details</h2>
			<dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
				<dt class="text-zinc-500">Marke</dt>
				<dd class="text-zinc-900">{product.toolDetails.brand}</dd>
				<dt class="text-zinc-500">Material</dt>
				<dd class="text-zinc-900">{product.toolDetails.material}</dd>
				{#if product.toolDetails.specifications}
					<dt class="text-zinc-500">Spezifikationen</dt>
					<dd class="text-zinc-900">{product.toolDetails.specifications}</dd>
				{/if}
				{#if product.toolDetails.careInstructions}
					<dt class="text-zinc-500">Pflege</dt>
					<dd class="text-zinc-900">{product.toolDetails.careInstructions}</dd>
				{/if}
			</dl>
		</div>
	{/if}

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
