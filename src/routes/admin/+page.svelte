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

<div class="max-w-5xl p-6">
	<h1 class="mb-6 text-xl font-bold text-zinc-900">Dashboard</h1>

	<div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
		<div class="rounded-lg border border-zinc-200 bg-white p-4">
			<div class="mb-1 text-xs tracking-wide text-zinc-500 uppercase">Produkte gesamt</div>
			<div class="text-2xl font-bold text-zinc-900">{data.totalProducts}</div>
		</div>
		<div class="rounded-lg border border-zinc-200 bg-white p-4">
			<div class="mb-1 text-xs tracking-wide text-zinc-500 uppercase">Kein Bestand</div>
			<div class="text-2xl font-bold text-red-600">{data.outOfStock}</div>
		</div>
		<div class="rounded-lg border border-zinc-200 bg-white p-4">
			<div class="mb-1 text-xs tracking-wide text-zinc-500 uppercase">Niedriger Bestand</div>
			<div class="text-2xl font-bold text-amber-600">{data.lowStock}</div>
		</div>
		<div class="rounded-lg border border-zinc-200 bg-white p-4">
			<div class="mb-1 text-xs tracking-wide text-zinc-500 uppercase">Ausstehende Bestellungen</div>
			<div class="text-2xl font-bold text-blue-600">{pendingOrders}</div>
		</div>
	</div>

	<div class="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
		<div class="rounded-lg border border-zinc-200 bg-white lg:col-span-2">
			<div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
				<h2 class="text-sm font-semibold text-zinc-900">Letzte Bestellungen</h2>
				<a href="/admin/orders" class="text-xs text-zinc-400 hover:text-zinc-700"
					>Alle ansehen &rarr;</a
				>
			</div>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-zinc-50">
						<th class="px-4 py-2 text-left text-xs font-medium text-zinc-400">ID</th>
						<th class="px-4 py-2 text-left text-xs font-medium text-zinc-400">Kunde</th>
						<th class="px-4 py-2 text-left text-xs font-medium text-zinc-400">Betrag</th>
						<th class="px-4 py-2 text-left text-xs font-medium text-zinc-400">Status</th>
					</tr>
				</thead>
				<tbody>
					{#each data.recentOrders as order}
						<tr class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50">
							<td class="px-4 py-2">
								<a
									href="/admin/orders/{order.id}"
									class="font-mono text-xs text-zinc-400 hover:text-zinc-800"
								>
									{order.id.slice(0, 8)}&hellip;
								</a>
							</td>
							<td class="px-4 py-2 text-zinc-700">
								{order.customerFirstName ?? '-'}
								{order.customerLastName ?? ''}
							</td>
							<td class="px-4 py-2 font-medium text-zinc-900">
								{Number(order.totalAmount).toFixed(2)} &euro;
							</td>
							<td class="px-4 py-2">
								<span class="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">
									{orderStatusLabels[order.orderStatus] ?? order.orderStatus}
								</span>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="4" class="px-4 py-6 text-center text-sm text-zinc-400"
								>Keine Bestellungen</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="rounded-lg border border-zinc-200 bg-white">
			<div class="border-b border-zinc-100 px-4 py-3">
				<h2 class="text-sm font-semibold text-zinc-900">Bestellungen nach Status</h2>
			</div>
			<div class="space-y-2 p-4">
				{#each data.orderCounts as { status, total }}
					<div class="flex items-center justify-between text-sm">
						<span class="text-zinc-600">{orderStatusLabels[status] ?? status}</span>
						<span class="font-medium text-zinc-900">{total}</span>
					</div>
				{:else}
					<p class="text-sm text-zinc-400 text-center py-4">Keine Bestellungen</p>
				{/each}
				{#if totalOrders > 0}
					<div class="flex justify-between border-t border-zinc-100 pt-2 text-sm font-semibold">
						<span>Gesamt</span>
						<span>{totalOrders}</span>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex flex-wrap gap-4">
		<a
			href="/admin/inventory"
			class="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900">Inventar</a
		>
		<a
			href="/admin/producers"
			class="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900">Hersteller</a
		>
		<a
			href="/admin/orders"
			class="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900">Bestellungen</a
		>
		<a
			href="/admin/customers"
			class="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900">Kunden</a
		>
	</div>
</div>
