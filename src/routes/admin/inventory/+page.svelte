<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let { data } = $props();

	const typeLabels: Record<string, string> = {
		CIGAR: 'Zigarre',
		CIGARILLO: 'Zigarillo',
		BEVERAGE: 'Getränk',
		TOOL: 'Zubehör'
	};

	const typeOptions = [
		{ value: '', label: 'Alle Typen' },
		{ value: 'cigar', label: 'Zigarren' },
		{ value: 'cigarillo', label: 'Zigarillos' },
		{ value: 'beverage', label: 'Getränke' },
		{ value: 'tool', label: 'Zubehör' }
	];

	const sortOptions = [
		{ value: 'name', label: 'Name' },
		{ value: 'sku', label: 'SKU' },
		{ value: 'price', label: 'Preis' },
		{ value: 'stock', label: 'Bestand' }
	];

	let editingId: string | null = $state(null);
	let editStock = $state(0);

	function startEdit(id: string, stock: number) {
		editingId = id;
		editStock = stock;
	}

	function buildUrl(params: Record<string, string>) {
		const url = new URL($page.url);
		Object.entries(params).forEach(([key, value]) => {
			if (value) {
				url.searchParams.set(key, value);
			} else {
				url.searchParams.delete(key);
			}
		});
		return url.toString();
	}

	function toggleSort(column: string) {
		const isCurrentSort = data.sortBy === column;
		const newOrder = isCurrentSort && data.sortOrder === 'asc' ? 'desc' : 'asc';
		const url = buildUrl({
			search: data.search,
			type: data.filterType,
			sort: column,
			order: newOrder
		});
		window.location.href = url;
	}

	function handleFilterChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		const url = buildUrl({
			search: data.search,
			type: target.value,
			sort: data.sortBy,
			order: data.sortOrder
		});
		window.location.href = url;
	}

	function handleSearch(e: Event) {
		const target = e.target as HTMLFormElement;
		const searchInput = new FormData(target).get('search') as string;
		const url = buildUrl({
			search: searchInput,
			type: data.filterType,
			sort: data.sortBy,
			order: data.sortOrder
		});
		window.location.href = url;
	}
</script>

<div class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-xl font-bold text-zinc-900">Inventar</h1>
		<a
			href="/admin/inventory/create"
			class="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-700 transition-colors"
		>
			+ Neues Produkt
		</a>
	</div>

	<!-- Search and filters -->
	<div class="mb-6 space-y-3">
		<form onsubmit={handleSearch} class="flex gap-2">
			<input
				type="text"
				name="search"
				placeholder="Nach Name oder SKU suchen..."
				value={data.search}
				class="flex-1 border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
			/>
			<button
				type="submit"
				class="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-700 transition-colors"
			>
				Suchen
			</button>
		</form>

		<div class="flex gap-3">
			<div class="flex-1">
				<label class="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1" for="filter-type"
					>Produkttyp</label
				>
				<select
					id="filter-type"
					value={data.filterType}
					onchange={handleFilterChange}
					class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
				>
					{#each typeOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="flex-1">
				<label class="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1" for="sort-by"
					>Sortieren nach</label
				>
				<div class="flex gap-2">
					<select
						id="sort-by"
						value={data.sortBy}
						onchange={(e) => {
							const url = buildUrl({
								search: data.search,
								type: data.filterType,
								sort: (e.target as HTMLSelectElement).value,
								order: data.sortOrder
							});
							window.location.href = url;
						}}
						class="flex-1 border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
					>
						{#each sortOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
					<button
						onclick={() => toggleSort(data.sortBy)}
						class="px-3 py-2 border border-zinc-300 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
						title={data.sortOrder === 'asc' ? 'Absteigend' : 'Aufsteigend'}
					>
						{data.sortOrder === 'asc' ? '↑' : '↓'}
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="text-sm text-zinc-500 mb-4">
		{data.products.length}
		{data.products.length === 1 ? 'Produkt' : 'Produkte'}
		{#if data.search || data.filterType}
			(gefiltert)
		{/if}
	</div>

	<div class="bg-white rounded-lg border border-zinc-200 overflow-hidden">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-zinc-200 bg-zinc-50">
					<th
						onclick={() => toggleSort('name')}
						class="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide cursor-pointer hover:bg-zinc-100 transition-colors"
					>
						Name
						{#if data.sortBy === 'name'}
							<span class="text-zinc-400">{data.sortOrder === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th class="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Hersteller</th>
					<th class="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Typ</th>
					<th
						onclick={() => toggleSort('sku')}
						class="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide cursor-pointer hover:bg-zinc-100 transition-colors"
					>
						SKU
						{#if data.sortBy === 'sku'}
							<span class="text-zinc-400">{data.sortOrder === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th
						onclick={() => toggleSort('price')}
						class="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide cursor-pointer hover:bg-zinc-100 transition-colors"
					>
						Preis
						{#if data.sortBy === 'price'}
							<span class="text-zinc-400">{data.sortOrder === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th
						onclick={() => toggleSort('stock')}
						class="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide cursor-pointer hover:bg-zinc-100 transition-colors"
					>
						Bestand
						{#if data.sortBy === 'stock'}
							<span class="text-zinc-400">{data.sortOrder === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th class="px-4 py-3"></th>
				</tr>
			</thead>
			<tbody>
				{#each data.products as product}
					<tr
						class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50
						       {product.stock === 0 ? 'bg-red-50' : product.stock <= 4 ? 'bg-amber-50' : ''}"
					>
						<td class="px-4 py-3 font-medium text-zinc-900">{product.name}</td>
						<td class="px-4 py-3 text-zinc-500">{product.producerName ?? '-'}</td>
						<td class="px-4 py-3 text-zinc-500">{typeLabels[product.productType] ?? product.productType}</td>
						<td class="px-4 py-3 font-mono text-xs text-zinc-400">{product.sku}</td>
						<td class="px-4 py-3 text-right font-medium text-zinc-800">{Number(product.price).toFixed(2)} &euro;</td>
						<td class="px-4 py-3 text-right">
							<div class="flex items-center justify-end gap-2">
								{#if product.stock === 0}
									<span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">Ausverkauft</span>
								{:else if product.stock <= 4}
									<span class="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium">Gering</span>
								{/if}

								{#if editingId === product.id}
									<form
										method="POST"
										action="?/updateStock"
										use:enhance={() => async ({ update }) => {
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
												class="w-16 text-right border border-zinc-300 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:border-zinc-500"
											/>
											<button type="submit" class="text-green-600 hover:text-green-800 px-1 text-base leading-none">&check;</button>
											<button
												type="button"
												onclick={() => (editingId = null)}
												class="text-zinc-400 hover:text-zinc-600 px-1 text-base leading-none"
											>&times;</button>
										</div>
									</form>
								{:else}
									<button
										onclick={() => startEdit(product.id, product.stock)}
										class="font-medium tabular-nums hover:underline
										       {product.stock === 0
										           ? 'text-red-600'
										           : product.stock <= 4
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
								class="text-xs text-zinc-400 hover:text-zinc-800 underline underline-offset-2"
							>
								Bearbeiten
							</a>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="7" class="px-4 py-10 text-center text-sm text-zinc-400">
							{data.search || data.filterType ? 'Keine Produkte gefunden' : 'Keine Produkte vorhanden'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
