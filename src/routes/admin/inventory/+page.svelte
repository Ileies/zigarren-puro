<script lang="ts">
	import { enhance } from '$app/forms';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { lowStockThreshold } from '#lib/config.js';
	import Pagination from '../Pagination.svelte';

	let { data } = $props();

	const typeLabels: Record<string, string> = {
		cigar: 'Zigarre',
		cigarillo: 'Zigarillo',
		beverage: 'Getränk',
		tool: 'Zubehör'
	};

	const typeOptions = [
		{ value: '', label: 'Alle Typen' },
		{ value: 'cigar', label: 'Zigarren' },
		{ value: 'cigarillo', label: 'Zigarillos' },
		{ value: 'beverage', label: 'Getränke' },
		{ value: 'tool', label: 'Zubehör' }
	];

	const stockOptions = [
		{ value: '', label: 'Jeder Bestand' },
		{ value: 'low', label: 'Geringer Bestand' },
		{ value: 'out', label: 'Ausverkauft' }
	];

	let editingId: string | null = $state(null);
	let editStock = $state(0);

	function startEdit(id: string, stock: number) {
		editingId = id;
		editStock = stock;
	}

	/** The filters and the sort as query parameters, so every link and the pager keep them. */
	const listParams = $derived({
		...data.filters,
		sort: data.sort === 'name' ? '' : data.sort,
		order: data.order === 'asc' ? '' : data.order
	});

	/** A header link: the first click sorts ascending, the next one reverses. Back to page 1. */
	function sortHref(column: string) {
		const reverse = data.sort === column && data.order === 'asc';
		const query = new SvelteURLSearchParams();
		for (const [key, value] of Object.entries(data.filters)) if (value) query.set(key, value);
		query.set('sort', column);
		if (reverse) query.set('order', 'desc');
		return `/admin/inventory?${query}`;
	}

	const arrow = (column: string) =>
		data.sort === column ? (data.order === 'asc' ? '↑' : '↓') : '';
	const ariaSort = (column: string) =>
		data.sort !== column ? 'none' : data.order === 'asc' ? 'ascending' : 'descending';
	const filtered = $derived(
		Boolean(data.filters.search || data.filters.type || data.filters.stock)
	);

	const headClass = 'px-4 py-3 text-xs font-medium tracking-wide text-zinc-500 uppercase';
	const fieldClass =
		'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none';
	const labelClass = 'mb-1 block text-xs font-medium tracking-wide text-zinc-500 uppercase';
</script>

<div class="p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-xl font-bold text-zinc-900">Inventar</h1>
		<a
			href="/admin/inventory/create"
			class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
		>
			+ Neues Produkt
		</a>
	</div>

	<!-- Search and filters: a plain GET form, so the result can be bookmarked and shared -->
	<form method="GET" action="/admin/inventory" class="mb-6 space-y-3">
		<input type="hidden" name="sort" value={listParams.sort} />
		<input type="hidden" name="order" value={listParams.order} />
		<div class="flex gap-2">
			<label class="sr-only" for="search">Suche</label>
			<input
				id="search"
				type="search"
				name="search"
				placeholder="Nach Name oder SKU suchen..."
				value={data.filters.search}
				class="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
			/>
			<button
				type="submit"
				class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
			>
				Suchen
			</button>
		</div>

		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			<div>
				<label class={labelClass} for="filter-type">Produkttyp</label>
				<select id="filter-type" name="type" class={fieldClass}>
					{#each typeOptions as option (option.value)}
						<option value={option.value} selected={data.filters.type === option.value}>
							{option.label}
						</option>
					{/each}
				</select>
			</div>
			<div>
				<label class={labelClass} for="filter-stock">Bestand</label>
				<select id="filter-stock" name="stock" class={fieldClass}>
					{#each stockOptions as option (option.value)}
						<option value={option.value} selected={data.filters.stock === option.value}>
							{option.label}
						</option>
					{/each}
				</select>
			</div>
		</div>
		<p class="text-xs text-zinc-400">
			Die Auswahl wird mit "Suchen" angewendet. Sortiert wird über die Spaltenköpfe.
		</p>
	</form>

	<div class="mb-4 flex items-center justify-between text-sm text-zinc-500">
		<span>
			{data.paging.total}
			{data.paging.total === 1 ? 'Produkt' : 'Produkte'}
			{#if filtered}
				(gefiltert)
			{/if}
		</span>
		{#if filtered}
			<a href="/admin/inventory" class="underline underline-offset-2 hover:text-zinc-800">
				Zurücksetzen
			</a>
		{/if}
	</div>

	<div class="overflow-hidden rounded-lg border border-zinc-200 bg-white">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-zinc-200 bg-zinc-50">
					<th class="{headClass} text-left" aria-sort={ariaSort('name')}>
						<a href={sortHref('name')} class="hover:text-zinc-800">Name {arrow('name')}</a>
					</th>
					<th class="{headClass} text-left">Hersteller</th>
					<th class="{headClass} text-left">Typ</th>
					<th class="{headClass} text-left" aria-sort={ariaSort('sku')}>
						<a href={sortHref('sku')} class="hover:text-zinc-800">SKU {arrow('sku')}</a>
					</th>
					<th class="{headClass} text-right" aria-sort={ariaSort('price')}>
						<a href={sortHref('price')} class="hover:text-zinc-800">Preis {arrow('price')}</a>
					</th>
					<th class="{headClass} text-right" aria-sort={ariaSort('stock')}>
						<a href={sortHref('stock')} class="hover:text-zinc-800">Bestand {arrow('stock')}</a>
					</th>
					<th class="px-4 py-3"></th>
				</tr>
			</thead>
			<tbody>
				{#each data.products as product (product.id)}
					<tr
						class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50
						       {product.stock === 0
							? 'bg-red-50'
							: product.stock <= lowStockThreshold
								? 'bg-amber-50'
								: ''}"
					>
						<td class="px-4 py-3 font-medium text-zinc-900">{product.name}</td>
						<td class="px-4 py-3 text-zinc-500">{product.producerName ?? '-'}</td>
						<td class="px-4 py-3 text-zinc-500"
							>{typeLabels[product.productType] ?? product.productType}</td
						>
						<td class="px-4 py-3 font-mono text-xs text-zinc-400">{product.sku}</td>
						<td class="px-4 py-3 text-right font-medium text-zinc-800"
							>{Number(product.price).toFixed(2)} &euro;</td
						>
						<td class="px-4 py-3 text-right">
							<div class="flex items-center justify-end gap-2">
								{#if product.stock === 0}
									<span class="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
										>Ausverkauft</span
									>
								{:else if product.stock <= lowStockThreshold}
									<span class="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
										>Gering</span
									>
								{/if}

								{#if editingId === product.id}
									<form
										method="POST"
										action="?/updateStock"
										use:enhance={() =>
											async ({ update }) => {
												await update({ reset: false });
												editingId = null;
											}}
									>
										<input type="hidden" name="id" value={product.id} />
										<div class="flex items-center gap-1">
											<input
												type="number"
												name="stock"
												bind:value={editStock}
												min="0"
												class="w-16 rounded border border-zinc-300 px-1.5 py-0.5 text-right text-sm focus:border-zinc-500 focus:outline-none"
											/>
											<button
												type="submit"
												class="px-1 text-base leading-none text-green-600 hover:text-green-800"
												>&check;</button
											>
											<button
												type="button"
												onclick={() => (editingId = null)}
												class="px-1 text-base leading-none text-zinc-400 hover:text-zinc-600"
												>&times;</button
											>
										</div>
									</form>
								{:else}
									<button
										onclick={() => startEdit(product.id, product.stock)}
										class="font-medium tabular-nums hover:underline
										       {product.stock === 0
											? 'text-red-600'
											: product.stock <= lowStockThreshold
												? 'text-amber-600'
												: 'text-zinc-800'}"
										title="Bestand bearbeiten"
									>
										{product.stock}
									</button>
								{/if}
							</div>
						</td>
						<td class="px-4 py-3 text-right">
							<a
								href="/admin/inventory/{product.id}"
								class="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-800"
							>
								Bearbeiten
							</a>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="7" class="px-4 py-10 text-center text-sm text-zinc-400">
							{filtered ? 'Keine Produkte gefunden' : 'Keine Produkte vorhanden'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<Pagination paging={data.paging} path="/admin/inventory" params={listParams} />
</div>
