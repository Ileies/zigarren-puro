<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	const typeLabels: Record<string, string> = {
		CIGAR: 'Zigarre',
		CIGARILLO: 'Zigarillo',
		BEVERAGE: 'Getränk',
		TOOL: 'Zubehör'
	};

	let editingId: string | null = $state(null);
	let editStock = $state(0);

	function startEdit(id: string, stock: number) {
		editingId = id;
		editStock = stock;
	}
</script>

<div class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-xl font-bold text-zinc-900">Inventar</h1>
		<span class="text-sm text-zinc-400">{data.products.length} Produkte</span>
	</div>

	<div class="bg-white rounded-lg border border-zinc-200 overflow-hidden">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-zinc-200 bg-zinc-50">
					<th class="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Name</th>
					<th class="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Hersteller</th>
					<th class="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Typ</th>
					<th class="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">SKU</th>
					<th class="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Preis</th>
					<th class="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Bestand</th>
					<th class="px-4 py-3"></th>
				</tr>
			</thead>
			<tbody>
				{#each data.products as product}
					<tr class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
						<td class="px-4 py-3 font-medium text-zinc-900">{product.name}</td>
						<td class="px-4 py-3 text-zinc-500">{product.producerName ?? '-'}</td>
						<td class="px-4 py-3 text-zinc-500">{typeLabels[product.productType] ?? product.productType}</td>
						<td class="px-4 py-3 font-mono text-xs text-zinc-400">{product.sku}</td>
						<td class="px-4 py-3 text-right font-medium text-zinc-800">{Number(product.price).toFixed(2)} &euro;</td>
						<td class="px-4 py-3 text-right">
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
									<div class="flex items-center gap-1 justify-end">
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
						<td colspan="7" class="px-4 py-10 text-center text-sm text-zinc-400">Keine Produkte vorhanden</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
