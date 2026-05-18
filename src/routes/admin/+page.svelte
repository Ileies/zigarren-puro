<script lang="ts">
	let { data } = $props();

	let pendingOrders = $derived(data.orderCounts.find((o) => o.status === 'pending')?.total ?? 0);
	let totalOrders = $derived(data.orderCounts.reduce((s, o) => s + Number(o.total), 0));

	const orderStatusLabels: Record<string, string> = {
		pending: 'Ausstehend',
		confirmed: 'Bestätigt',
		processing: 'In Bearbeitung',
		shipped: 'Versandt',
		delivered: 'Geliefert',
		cancelled: 'Storniert',
		refunded: 'Erstattet'
	};
</script>

<div class="p-6 max-w-5xl">
	<h1 class="text-xl font-bold text-zinc-900 mb-6">Dashboard</h1>

	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
		<div class="bg-white rounded-lg border border-zinc-200 p-4">
			<div class="text-xs text-zinc-500 uppercase tracking-wide mb-1">Produkte gesamt</div>
			<div class="text-2xl font-bold text-zinc-900">{data.totalProducts}</div>
		</div>
		<div class="bg-white rounded-lg border border-zinc-200 p-4">
			<div class="text-xs text-zinc-500 uppercase tracking-wide mb-1">Kein Bestand</div>
			<div class="text-2xl font-bold text-red-600">{data.outOfStock}</div>
		</div>
		<div class="bg-white rounded-lg border border-zinc-200 p-4">
			<div class="text-xs text-zinc-500 uppercase tracking-wide mb-1">Niedriger Bestand</div>
			<div class="text-2xl font-bold text-amber-600">{data.lowStock}</div>
		</div>
		<div class="bg-white rounded-lg border border-zinc-200 p-4">
			<div class="text-xs text-zinc-500 uppercase tracking-wide mb-1">Ausstehende Bestellungen</div>
			<div class="text-2xl font-bold text-blue-600">{pendingOrders}</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
		<div class="lg:col-span-2 bg-white rounded-lg border border-zinc-200">
			<div class="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
				<h2 class="font-semibold text-zinc-900 text-sm">Letzte Bestellungen</h2>
				<a href="/admin/orders" class="text-xs text-zinc-400 hover:text-zinc-700">Alle ansehen &rarr;</a>
			</div>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-zinc-50">
						<th class="text-left px-4 py-2 text-xs text-zinc-400 font-medium">ID</th>
						<th class="text-left px-4 py-2 text-xs text-zinc-400 font-medium">Kunde</th>
						<th class="text-left px-4 py-2 text-xs text-zinc-400 font-medium">Betrag</th>
						<th class="text-left px-4 py-2 text-xs text-zinc-400 font-medium">Status</th>
					</tr>
				</thead>
				<tbody>
					{#each data.recentOrders as order}
						<tr class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50">
							<td class="px-4 py-2">
								<a href="/admin/orders/{order.id}" class="font-mono text-xs text-zinc-400 hover:text-zinc-800">
									{order.id.slice(0, 8)}&hellip;
								</a>
							</td>
							<td class="px-4 py-2 text-zinc-700">
								{order.customerFirstName ?? '—'} {order.customerLastName ?? ''}
							</td>
							<td class="px-4 py-2 font-medium text-zinc-900">
								{Number(order.totalAmount).toFixed(2)} &euro;
							</td>
							<td class="px-4 py-2">
								<span class="text-xs px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
									{orderStatusLabels[order.orderStatus] ?? order.orderStatus}
								</span>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="4" class="px-4 py-6 text-center text-sm text-zinc-400">Keine Bestellungen</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="bg-white rounded-lg border border-zinc-200">
			<div class="px-4 py-3 border-b border-zinc-100">
				<h2 class="font-semibold text-zinc-900 text-sm">Bestellungen nach Status</h2>
			</div>
			<div class="p-4 space-y-2">
				{#each data.orderCounts as { status, total }}
					<div class="flex items-center justify-between text-sm">
						<span class="text-zinc-600">{orderStatusLabels[status] ?? status}</span>
						<span class="font-medium text-zinc-900">{total}</span>
					</div>
				{:else}
					<p class="text-sm text-zinc-400 text-center py-4">Keine Bestellungen</p>
				{/each}
				{#if totalOrders > 0}
					<div class="pt-2 border-t border-zinc-100 flex justify-between text-sm font-semibold">
						<span>Gesamt</span>
						<span>{totalOrders}</span>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex gap-4">
		<a href="/admin/inventory" class="text-sm text-zinc-600 hover:text-zinc-900 underline underline-offset-2">
			Inventar verwalten
		</a>
		<a href="/admin/orders" class="text-sm text-zinc-600 hover:text-zinc-900 underline underline-offset-2">
			Bestellungen verwalten
		</a>
	</div>
</div>
