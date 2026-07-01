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
			: (typeFilters.find((f) => f.type === data.activeType)?.label ?? 'Alle Produkte')
	);

	function buildUrl(params: { type?: string | null; sort?: string; q?: string }) {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const u = new URLSearchParams(page.url.searchParams);
		if ('type' in params) {
			if (params.type) u.set('type', params.type);
			else u.delete('type');
		}
		if ('sort' in params && params.sort) u.set('sort', params.sort);
		if ('q' in params && params.q !== undefined) {
			if (params.q) u.set('q', params.q);
			else u.delete('q');
		}
		return `/search?${u.toString()}`;
	}

	function formatPrice(price: number) {
		return price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	}
</script>

<svelte:head>
	<title>{pageTitle} – Zigarren Puro</title>
	<meta
		name="description"
		content="Durchsuchen Sie unsere exklusive Auswahl an Premiumzigarren, Spirituosen und Zubehör."
	/>
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-8">
	<!-- Search bar -->
	<form action="/search" method="GET" class="mb-6">
		<label class="input-bordered input mx-auto flex max-w-xl items-center gap-2">
			<Search class="h-4 w-4 text-base-content/40" />
			<input
				type="text"
				name="q"
				value={data.q}
				placeholder="Marke, Stärke, Herkunft …"
				class="grow"
			/>
			<button type="submit" class="btn -mr-2 btn-sm btn-secondary">Suchen</button>
		</label>
	</form>

	<!-- Page header -->
	<div class="mb-4 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">{pageTitle}</h1>
			<p class="mt-0.5 text-sm text-base-content/60">{data.products.length} Produkte</p>
		</div>

		<!-- Sort -->
		<label class="flex items-center gap-2 text-sm">
			<SlidersHorizontal class="h-4 w-4 text-base-content/50" />
			<span class="hidden text-base-content/70 sm:inline">Sortierung</span>
			<select
				class="select-bordered select select-sm"
				value={data.sort}
				onchange={(e) => goto(buildUrl({ sort: (e.target as HTMLSelectElement).value }))}
			>
				{#each sortOptions as opt (opt.value)}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</label>
	</div>

	<!-- Category chips -->
	<div class="mb-8 flex flex-wrap gap-2">
		{#each typeFilters as f (f.type ?? 'all')}
			<a
				href={buildUrl({ type: f.type })}
				class="btn btn-sm {data.activeType === f.type
					? 'btn-secondary'
					: 'border border-base-300 btn-ghost'}"
			>
				{f.label}
			</a>
		{/each}
	</div>

	<!-- Results -->
	{#if data.products.length === 0}
		<div
			class="flex flex-col items-center justify-center gap-4 py-24 text-center text-base-content/40"
		>
			<Package class="h-14 w-14" />
			<div>
				<p class="text-lg font-medium text-base-content/60">Keine Produkte gefunden</p>
				<p class="mt-1 text-sm">
					{#if data.q}
						Für „{data.q}" gibt es keine Treffer.
					{:else}
						Diese Kategorie enthält noch keine Produkte.
					{/if}
				</p>
			</div>
			<a href="/search" class="btn mt-2 btn-sm btn-secondary">Alle Produkte</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each data.products as product (product.id)}
				<a
					href="/products/{product.id}"
					class="group card border border-base-300 bg-base-100 transition-all duration-200 hover:border-secondary hover:shadow-md"
				>
					<figure
						class="flex aspect-square items-center justify-center overflow-hidden rounded-t-box bg-base-200"
					>
						<Package
							class="h-16 w-16 text-base-content/20 transition-colors group-hover:text-base-content/30"
						/>
					</figure>

					<div class="card-body gap-1 p-4">
						{#if product.producerName}
							<p class="truncate text-xs font-medium tracking-wide text-base-content/50 uppercase">
								{product.producerName}
							</p>
						{/if}

						<h2 class="line-clamp-2 text-sm leading-snug font-semibold">
							{product.name}
						</h2>

						<div class="mt-2 flex items-center justify-between">
							<span class="text-lg font-bold text-secondary">
								{formatPrice(product.price)}
							</span>

							{#if product.stock > 0}
								<span class="badge badge-sm badge-success">Verfügbar</span>
							{:else}
								<span class="badge badge-sm badge-error">Vergriffen</span>
							{/if}
						</div>

						<button
							class="btn mt-3 w-full gap-2 btn-sm btn-secondary"
							onclick={(e) => e.preventDefault()}
							disabled={product.stock === 0}
						>
							<ShoppingCart class="h-4 w-4" />
							In den Warenkorb
						</button>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
