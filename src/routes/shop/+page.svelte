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
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const u = new URLSearchParams(page.url.searchParams);
		if (type) u.set('type', type);
		else u.delete('type');
		if (sort) u.set('sort', sort);
		else u.delete('sort');
		return `/shop?${u.toString()}`;
	}

	function formatPrice(price: number) {
		return price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	}
</script>

<svelte:head>
	<title>{m.shopTitle()} - Zigarren Puro</title>
	<meta
		name="description"
		content="Entdecken Sie unsere exklusive Auswahl an Premiumzigarren, Spirituosen und Zubehör."
	/>
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-8">
	<!-- Page header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">{m.shopTitle()}</h1>
			<p class="mt-0.5 text-sm text-base-content/60">
				{data.products.length}
				{m.products()}
			</p>
		</div>

		<!-- Sort -->
		<label class="flex items-center gap-2 text-sm">
			<SlidersHorizontal class="h-4 w-4 text-base-content/50" />
			<span class="hidden text-base-content/70 sm:inline">{m.sortBy()}</span>
			<select
				class="select-bordered select select-sm"
				value={data.sort}
				onchange={(e) => goto(buildUrl(data.activeType, (e.target as HTMLSelectElement).value))}
			>
				{#each sortOptions as opt (opt.value)}
					<option value={opt.value}>{opt.label()}</option>
				{/each}
			</select>
		</label>
	</div>

	<!-- Category filter chips -->
	<div class="mb-8 flex flex-wrap gap-2">
		{#each typeFilters as f (f.type ?? 'all')}
			<a
				href={buildUrl(f.type)}
				class="btn btn-sm {data.activeType === f.type
					? 'btn-secondary'
					: 'border border-base-300 btn-ghost'}"
			>
				{f.label()}
			</a>
		{/each}
	</div>

	<!-- Product grid -->
	{#if data.products.length === 0}
		<div
			class="flex flex-col items-center justify-center gap-4 py-24 text-center text-base-content/40"
		>
			<Package class="h-14 w-14" />
			<div>
				<p class="text-lg font-medium text-base-content/60">{m.noProductsFound()}</p>
				<p class="mt-1 text-sm">
					Produkte werden derzeit erfasst - schauen Sie bald wieder vorbei.
				</p>
			</div>
			<a href="/shop" class="btn mt-2 btn-sm btn-secondary">{m.allProducts()}</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each data.products as product (product.id)}
				<div
					class="group card border border-base-300 bg-base-100 transition-all duration-200 hover:border-secondary hover:shadow-md"
				>
					<a href="/products/{product.id}" class="contents">
						<figure
							class="flex aspect-square items-center justify-center overflow-hidden rounded-t-box bg-base-200"
						>
							<Package
								class="h-16 w-16 text-base-content/20 transition-colors group-hover:text-base-content/30"
							/>
						</figure>
					</a>

					<div class="card-body gap-1 p-4">
						{#if product.producerName}
							<p class="truncate text-xs font-medium tracking-wide text-base-content/50 uppercase">
								{product.producerName}
							</p>
						{/if}

						<a
							href="/products/{product.id}"
							class="line-clamp-2 text-sm leading-snug font-semibold transition-colors hover:text-secondary"
						>
							{product.name}
						</a>

						<div class="mt-2 flex items-center justify-between">
							<span class="text-lg font-bold text-secondary">
								{formatPrice(product.price)}
							</span>

							{#if product.stock > 0}
								<span class="badge badge-sm badge-success">{m.inStock()}</span>
							{:else}
								<span class="badge badge-sm badge-error">{m.outOfStock()}</span>
							{/if}
						</div>

						<form method="POST" action="/cart?/add" use:enhance={handleAddToCart(product.id)}>
							<input type="hidden" name="id" value={product.id} />
							<button
								type="submit"
								class="btn mt-3 w-full gap-2 transition-all btn-sm"
								class:btn-secondary={justAdded !== product.id}
								class:btn-success={justAdded === product.id}
								disabled={product.stock === 0}
							>
								{#if justAdded === product.id}
									<Check class="h-4 w-4" />
									Hinzugefügt!
								{:else}
									<ShoppingCart class="h-4 w-4" />
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
