<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Search, SlidersHorizontal, Package, ShoppingCart } from '@lucide/svelte';
	import { ProductType } from '$lib/types';

	let { data } = $props();

	const typeFilters = [
		{ type: null, label: 'Alle' },
		{ type: ProductType.CIGAR, label: 'Zigarren' },
		{ type: ProductType.CIGARILLO, label: 'Zigarillos' },
		{ type: ProductType.BEVERAGE, label: 'Spirituosen' },
		{ type: ProductType.TOOL, label: 'Zubehör' }
	];

	const sortOptions = [
		{ value: 'name_asc', label: 'Name A–Z' },
		{ value: 'name_desc', label: 'Name Z–A' },
		{ value: 'price_asc', label: 'Preis aufsteigend' },
		{ value: 'price_desc', label: 'Preis absteigend' }
	];

	const pageTitle = $derived(
		data.q
			? `Suche: „${data.q}"`
			: typeFilters.find(f => f.type === data.activeType)?.label ?? 'Alle Produkte'
	);

	function buildUrl(params: { type?: string | null; sort?: string; q?: string }) {
		const u = new URLSearchParams(page.url.searchParams);
		if ('type' in params) {
			if (params.type) u.set('type', params.type); else u.delete('type');
		}
		if ('sort' in params && params.sort) u.set('sort', params.sort);
		if ('q' in params && params.q !== undefined) {
			if (params.q) u.set('q', params.q); else u.delete('q');
		}
		return `/search?${u.toString()}`;
	}

	function formatPrice(price: number) {
		return price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	}
</script>

<svelte:head>
	<title>{pageTitle} – Zigarren Puro</title>
	<meta name="description" content="Durchsuchen Sie unsere exklusive Auswahl an Premiumzigarren, Spirituosen und Zubehör." />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<!-- Search bar -->
	<form action="/search" method="GET" class="mb-6">
		<label class="input input-bordered flex items-center gap-2 max-w-xl mx-auto">
			<Search class="w-4 h-4 text-base-content/40" />
			<input
				type="text"
				name="q"
				value={data.q}
				placeholder="Marke, Stärke, Herkunft …"
				class="grow"
			/>
			<button type="submit" class="btn btn-sm btn-secondary -mr-2">Suchen</button>
		</label>
	</form>

	<!-- Page header -->
	<div class="flex items-center justify-between mb-4">
		<div>
			<h1 class="text-2xl font-bold">{pageTitle}</h1>
			<p class="text-sm text-base-content/60 mt-0.5">{data.products.length} Produkte</p>
		</div>

		<!-- Sort -->
		<label class="flex items-center gap-2 text-sm">
			<SlidersHorizontal class="w-4 h-4 text-base-content/50" />
			<span class="hidden sm:inline text-base-content/70">Sortierung</span>
			<select
				class="select select-bordered select-sm"
				value={data.sort}
				onchange={(e) => goto(buildUrl({ sort: (e.target as HTMLSelectElement).value }))}
			>
				{#each sortOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</label>
	</div>

	<!-- Category chips -->
	<div class="flex flex-wrap gap-2 mb-8">
		{#each typeFilters as f}
			<a
				href={buildUrl({ type: f.type })}
				class="btn btn-sm {data.activeType === f.type ? 'btn-secondary' : 'btn-ghost border border-base-300'}"
			>
				{f.label}
			</a>
		{/each}
	</div>

	<!-- Results -->
	{#if data.products.length === 0}
		<div class="flex flex-col items-center justify-center py-24 text-center gap-4 text-base-content/40">
			<Package class="w-14 h-14" />
			<div>
				<p class="text-lg font-medium text-base-content/60">Keine Produkte gefunden</p>
				<p class="text-sm mt-1">
					{#if data.q}
						Für „{data.q}" gibt es keine Treffer.
					{:else}
						Diese Kategorie enthält noch keine Produkte.
					{/if}
				</p>
			</div>
			<a href="/search" class="btn btn-secondary btn-sm mt-2">Alle Produkte</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each data.products as product (product.id)}
				<a
					href="/products/{product.id}"
					class="card bg-base-100 border border-base-300 hover:border-secondary hover:shadow-md transition-all duration-200 group"
				>
					<figure class="aspect-square bg-base-200 flex items-center justify-center rounded-t-box overflow-hidden">
						<Package class="w-16 h-16 text-base-content/20 group-hover:text-base-content/30 transition-colors" />
					</figure>

					<div class="card-body p-4 gap-1">
						{#if product.producerName}
							<p class="text-xs text-base-content/50 font-medium uppercase tracking-wide truncate">
								{product.producerName}
							</p>
						{/if}

						<h2 class="font-semibold text-sm leading-snug line-clamp-2">
							{product.name}
						</h2>

						<div class="flex items-center justify-between mt-2">
							<span class="text-lg font-bold text-secondary">
								{formatPrice(product.price)}
							</span>

							{#if product.stock > 0}
								<span class="badge badge-success badge-sm">Verfügbar</span>
							{:else}
								<span class="badge badge-error badge-sm">Vergriffen</span>
							{/if}
						</div>

						<button
							class="btn btn-secondary btn-sm w-full mt-3 gap-2"
							onclick={(e) => e.preventDefault()}
							disabled={product.stock === 0}
						>
							<ShoppingCart class="w-4 h-4" />
							In den Warenkorb
						</button>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
