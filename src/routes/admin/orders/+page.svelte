<script lang="ts">
	import { formatOrderNumber } from '#lib/orderNumber.js';
	import {
		orderStatusLabels,
		paymentStatusLabels,
		shippingMethodLabels
	} from '#lib/orderLabels.js';
	import Pagination from '../Pagination.svelte';

	let { data } = $props();

	const now = new Date();

	const orderStatusColors: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800',
		confirmed: 'bg-blue-100 text-blue-800',
		processing: 'bg-blue-100 text-blue-800',
		shipped: 'bg-indigo-100 text-indigo-800',
		delivered: 'bg-green-100 text-green-800',
		cancelled: 'bg-red-100 text-red-800',
		refunded: 'bg-zinc-100 text-zinc-600'
	};

	// "Needs action" shortcuts. A shortcut link drops the other filters, so it shows exactly this list.
	const presets = [
		{ label: 'Alle', value: '' },
		{ label: 'Zu versenden', value: 'toShip' },
		{ label: 'Zahlung überfällig', value: 'overdue' }
	];

	const fieldClass =
		'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none';
	const labelClass = 'mb-1 block text-xs font-medium tracking-wide text-zinc-500 uppercase';

	const active = $derived(Object.values(data.filters).some(Boolean));
</script>

<div class="p-6">
	<div class="mb-5 flex items-center justify-between">
		<h1 class="text-xl font-bold text-zinc-900">Bestellungen</h1>
		<span class="text-sm text-zinc-400">
			{data.paging.total}
			{data.paging.total === 1 ? 'Bestellung' : 'Bestellungen'}{active ? ' (gefiltert)' : ''}
		</span>
	</div>

	<div class="mb-4 flex flex-wrap gap-1.5">
		{#each presets as preset (preset.value)}
			<a
				href="/admin/orders{preset.value ? '?preset=' + preset.value : ''}"
				class="rounded-full px-3 py-1.5 text-xs font-medium transition-colors
				       {data.filters.preset === preset.value
					? 'bg-zinc-900 text-white'
					: 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'}"
			>
				{preset.label}
			</a>
		{/each}
	</div>

	<form
		method="GET"
		action="/admin/orders"
		class="mb-5 rounded-lg border border-zinc-200 bg-white p-4"
	>
		<input type="hidden" name="preset" value={data.filters.preset} />
		<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
			<div class="md:col-span-3">
				<label class={labelClass} for="q">Suche</label>
				<input
					id="q"
					type="search"
					name="q"
					value={data.filters.q}
					placeholder="Bestellnummer, Name oder E-Mail"
					class={fieldClass}
				/>
			</div>
			<div>
				<label class={labelClass} for="status">Bestellstatus</label>
				<select id="status" name="status" class={fieldClass}>
					<option value="">Alle</option>
					{#each Object.entries(orderStatusLabels) as [value, label] (value)}
						<option {value} selected={data.filters.status === value}>{label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class={labelClass} for="payment">Zahlungsstatus</label>
				<select id="payment" name="payment" class={fieldClass}>
					<option value="">Alle</option>
					{#each Object.entries(paymentStatusLabels) as [value, label] (value)}
						<option {value} selected={data.filters.payment === value}>{label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class={labelClass} for="shipping">Versandart</label>
				<select id="shipping" name="shipping" class={fieldClass}>
					<option value="">Alle</option>
					{#each Object.entries(shippingMethodLabels) as [value, label] (value)}
						<option {value} selected={data.filters.shipping === value}>{label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class={labelClass} for="from">Bestellt ab</label>
				<input id="from" type="date" name="from" value={data.filters.from} class={fieldClass} />
			</div>
			<div>
				<label class={labelClass} for="to">Bestellt bis</label>
				<input id="to" type="date" name="to" value={data.filters.to} class={fieldClass} />
			</div>
			<div class="flex items-end gap-2">
				<button
					type="submit"
					class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
				>
					Filtern
				</button>
				{#if active}
					<a
						href="/admin/orders"
						class="px-2 py-2 text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-800"
					>
						Zurücksetzen
					</a>
				{/if}
			</div>
		</div>
	</form>

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
								{formatOrderNumber(order)}
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
							{#if order.paymentStatus === 'pending' && order.orderStatus === 'pending' && order.paymentDueAt}
								{@const due = new Date(order.paymentDueAt)}
								<div class={due < now ? 'font-medium text-red-600' : 'text-zinc-400'}>
									{due < now ? 'Überfällig seit' : 'Zahlbar bis'}
									{due.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
								</div>
							{/if}
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

	<Pagination paging={data.paging} path="/admin/orders" params={data.filters} />
</div>
