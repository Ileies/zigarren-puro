<script lang="ts">
	let { data } = $props();

	const orderStatusLabels: Record<string, string> = {
		pending: 'Ausstehend',
		confirmed: 'Bestätigt',
		processing: 'In Bearbeitung',
		shipped: 'Versandt',
		delivered: 'Geliefert',
		cancelled: 'Storniert',
		refunded: 'Erstattet'
	};

	const paymentStatusLabels: Record<string, string> = {
		pending: 'Ausstehend',
		authorized: 'Autorisiert',
		paid: 'Bezahlt',
		failed: 'Fehlgeschlagen',
		refunded: 'Erstattet'
	};

	const orderStatusColors: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800',
		confirmed: 'bg-blue-100 text-blue-800',
		processing: 'bg-blue-100 text-blue-800',
		shipped: 'bg-indigo-100 text-indigo-800',
		delivered: 'bg-green-100 text-green-800',
		cancelled: 'bg-red-100 text-red-800',
		refunded: 'bg-zinc-100 text-zinc-600'
	};

	const filters = [
		{ label: 'Alle', value: '' },
		{ label: 'Ausstehend', value: 'pending' },
		{ label: 'Bestätigt', value: 'confirmed' },
		{ label: 'In Bearbeitung', value: 'processing' },
		{ label: 'Versandt', value: 'shipped' },
		{ label: 'Geliefert', value: 'delivered' },
		{ label: 'Storniert', value: 'cancelled' },
		{ label: 'Erstattet', value: 'refunded' }
	];
</script>

<div class="p-6">
	<div class="mb-5 flex items-center justify-between">
		<h1 class="text-xl font-bold text-zinc-900">Bestellungen</h1>
		<span class="text-sm text-zinc-400">{data.orders.length} Bestellungen</span>
	</div>

	<div class="mb-5 flex flex-wrap gap-1.5">
		{#each filters as f (f.value)}
			<a
				href="/admin/orders{f.value ? '?status=' + f.value : ''}"
				class="rounded-full px-3 py-1.5 text-xs font-medium transition-colors
				       {(data.statusFilter ?? '') === f.value
					? 'bg-zinc-900 text-white'
					: 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'}"
			>
				{f.label}
			</a>
		{/each}
	</div>

	<div class="overflow-hidden rounded-lg border border-zinc-200 bg-white">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-zinc-200 bg-zinc-50">
					<th class="px-4 py-3 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Bestellung</th
					>
					<th class="px-4 py-3 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Kunde</th
					>
					<th class="px-4 py-3 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Datum</th
					>
					<th class="px-4 py-3 text-right text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Betrag</th
					>
					<th class="px-4 py-3 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Status</th
					>
					<th class="px-4 py-3 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Zahlung</th
					>
					<th class="px-4 py-3"></th>
				</tr>
			</thead>
			<tbody>
				{#each data.orders as order (order.id)}
					<tr class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
						<td class="px-4 py-3">
							<a
								href="/admin/orders/{order.id}"
								class="font-mono text-xs text-zinc-500 hover:text-zinc-900"
							>
								{order.id.slice(0, 8)}&hellip;
							</a>
						</td>
						<td class="px-4 py-3">
							<div class="font-medium text-zinc-800">
								{order.customerFirstName ?? '-'}
								{order.customerLastName ?? ''}
							</div>
							<div class="text-xs text-zinc-400">{order.customerEmail ?? ''}</div>
						</td>
						<td class="px-4 py-3 whitespace-nowrap text-zinc-500">
							{new Date(order.createdAt).toLocaleDateString('de-DE', {
								day: '2-digit',
								month: '2-digit',
								year: 'numeric'
							})}
						</td>
						<td class="px-4 py-3 text-right font-medium text-zinc-900">
							{Number(order.totalAmount).toFixed(2)} &euro;
						</td>
						<td class="px-4 py-3">
							<span
								class="rounded-full px-2 py-0.5 text-xs font-medium {orderStatusColors[
									order.orderStatus
								] ?? 'bg-zinc-100 text-zinc-600'}"
							>
								{orderStatusLabels[order.orderStatus] ?? order.orderStatus}
							</span>
						</td>
						<td class="px-4 py-3 text-xs text-zinc-500">
							{paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
						</td>
						<td class="px-4 py-3 text-right">
							<a
								href="/admin/orders/{order.id}"
								class="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-800"
							>
								Details
							</a>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="7" class="px-4 py-10 text-center text-sm text-zinc-400"
							>Keine Bestellungen gefunden</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
