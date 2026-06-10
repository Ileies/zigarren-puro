<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Package, ShoppingCart, SlidersHorizontal, Check } from '@lucide/svelte';
	import * as m from '$lib/messages';
	import { ProductType } from '$lib/types';

	let justAdded = $state<string | null>(null);

	function handleAddToCart(productId: string) {
		return () => {
			return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
				await update({ reset: false });
				justAdded = productId;
				setTimeout(() => {
					if (justAdded === productId) justAdded = null;
				}, 1500);
			};
		};
	}

	let { data } = $props();

	const typeFilters = [
		{ type: null, label: () => m.allProducts() },
		{ type: ProductType.CIGAR, label: () => m.cigars() },
		{ type: ProductType.CIGARILLO, label: () => m.zigarillos() },
		{ type: ProductType.BEVERAGE, label: () => m.spirits() },
		{ type: ProductType.TOOL, label: () => m.tools() }
	];

	const sortOptions = [
		{ value: 'name_asc', label: () => m.sortNameAsc() },
		{ value: 'name_desc', label: () => m.sortNameDesc() },
		{ value: 'price_asc', label: () => m.sortPriceAsc() },
		{ value: 'price_desc', label: () => m.sortPriceDesc() }
	];

	function buildUrl(type: string | null, sort?: string) {
		const u = new URLSearchParams(page.url.searchParams);
		if (type) u.set('type', type); else u.delete('type');
		if (sort) u.set('sort', sort); else u.delete('sort');
		return `/shop?${u.toString()}`;
	}

	function formatPrice(price: number) {
		return price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	}
</script>

<svelte:head>
	<title>{m.shopTitle()} - Zigarren Puro</title>
	<meta name="description" content="Entdecken Sie unsere exklusive Auswahl an Premiumzigarren, Spirituosen und Zubehör." />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<!-- Page header -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold">{m.shopTitle()}</h1>
			<p class="text-sm text-base-content/60 mt-0.5">
				{data.products.length} {m.products()}
			</p>
		</div>

		<!-- Sort -->
		<label class="flex items-center gap-2 text-sm">
			<SlidersHorizontal class="w-4 h-4 text-base-content/50" />
			<span class="hidden sm:inline text-base-content/70">{m.sortBy()}</span>
			<select
				class="select select-bordered select-sm"
				value={data.sort}
				onchange={(e) => goto(buildUrl(data.activeType, (e.target as HTMLSelectElement).value))}
			>
				{#each sortOptions as opt}
					<option value={opt.value}>{opt.label()}</option>
				{/each}
			</select>
		</label>
	</div>

	<!-- Category filter chips -->
	<div class="flex flex-wrap gap-2 mb-8">
		{#each typeFilters as f}
			<a
				href={buildUrl(f.type)}
				class="btn btn-sm {data.activeType === f.type ? 'btn-secondary' : 'btn-ghost border border-base-300'}"
			>
				{f.label()}
			</a>
		{/each}
	</div>

	<!-- Product grid -->
	{#if data.products.length === 0}
		<div class="flex flex-col items-center justify-center py-24 text-center gap-4 text-base-content/40">
			<Package class="w-14 h-14" />
			<div>
				<p class="text-lg font-medium text-base-content/60">{m.noProductsFound()}</p>
				<p class="text-sm mt-1">Produkte werden derzeit erfasst - schauen Sie bald wieder vorbei.</p>
			</div>
			<a href="/shop" class="btn btn-secondary btn-sm mt-2">{m.allProducts()}</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each data.products as product (product.id)}
				<div class="card bg-base-100 border border-base-300 hover:border-secondary hover:shadow-md transition-all duration-200 group">
					<a href="/products/{product.id}" class="contents">
						<figure class="aspect-square bg-base-200 flex items-center justify-center rounded-t-box overflow-hidden">
							<Package class="w-16 h-16 text-base-content/20 group-hover:text-base-content/30 transition-colors" />
						</figure>
					</a>

					<div class="card-body p-4 gap-1">
						{#if product.producerName}
							<p class="text-xs text-base-content/50 font-medium uppercase tracking-wide truncate">
								{product.producerName}
							</p>
						{/if}

						<a href="/products/{product.id}" class="font-semibold text-sm leading-snug line-clamp-2 hover:text-secondary transition-colors">
							{product.name}
						</a>

						<div class="flex items-center justify-between mt-2">
							<span class="text-lg font-bold text-secondary">
								{formatPrice(product.price)}
							</span>

							{#if product.stock > 0}
								<span class="badge badge-success badge-sm">{m.inStock()}</span>
							{:else}
								<span class="badge badge-error badge-sm">{m.outOfStock()}</span>
							{/if}
						</div>

						<form
							method="POST"
							action="/cart?/add"
							use:enhance={handleAddToCart(product.id)}
						>
							<input type="hidden" name="id" value={product.id} />
							<button
								type="submit"
								class="btn btn-sm w-full mt-3 gap-2 transition-all"
								class:btn-secondary={justAdded !== product.id}
								class:btn-success={justAdded === product.id}
								disabled={product.stock === 0}
							>
								{#if justAdded === product.id}
									<Check class="w-4 h-4" />
									Hinzugefügt!
								{:else}
									<ShoppingCart class="w-4 h-4" />
									{m.addToCart()}
								{/if}
							</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
