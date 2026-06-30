<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let order = $derived(data.order);

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

	const shippingMethodLabels: Record<string, string> = {
		standard: 'Standard',
		express: 'Express',
		next_day: 'Nächster Tag',
		pickup: 'Abholung'
	};

	const paymentMethodLabels: Record<string, string> = {
		credit_card: 'Kreditkarte',
		paypal: 'PayPal',
		bank_transfer: 'Überweisung',
		crypto: 'Krypto'
	};
</script>

<div class="p-6 max-w-3xl">
	<div class="flex items-center gap-3 mb-6">
		<a href="/admin/orders" class="text-sm text-zinc-400 hover:text-zinc-700">&larr; Bestellungen</a>
		<span class="text-zinc-300">/</span>
		<span class="font-mono text-sm text-zinc-600">{order.id.slice(0, 8)}&hellip;</span>
	</div>

	{#if form?.success}
		<div class="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
			Status wurde aktualisiert.
		</div>
	{/if}
	{#if form?.error}
		<div class="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
			{form.error}
		</div>
	{/if}

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
		<div class="bg-white rounded-lg border border-zinc-200 p-4">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Bestellinfo</h2>
			<dl class="space-y-1.5 text-sm">
				<div class="flex justify-between gap-4">
					<dt class="text-zinc-500 shrink-0">ID</dt>
					<dd class="font-mono text-xs text-zinc-700 break-all">{order.id}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-zinc-500">Erstellt</dt>
					<dd class="text-zinc-700">
						{new Date(order.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
					</dd>
				</div>
				{#if order.placedAt}
					<div class="flex justify-between">
						<dt class="text-zinc-500">Aufgegeben</dt>
						<dd class="text-zinc-700">
							{new Date(order.placedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
						</dd>
					</div>
				{/if}
				<div class="flex justify-between">
					<dt class="text-zinc-500">Versandart</dt>
					<dd class="text-zinc-700">{shippingMethodLabels[order.shippingMethod] ?? order.shippingMethod}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-zinc-500">Zahlungsart</dt>
					<dd class="text-zinc-700">{paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}</dd>
				</div>
			</dl>
		</div>

		<div class="bg-white rounded-lg border border-zinc-200 p-4">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Kunde</h2>
			{#if order.customer}
				<dl class="space-y-1.5 text-sm">
					<div class="flex justify-between">
						<dt class="text-zinc-500">Name</dt>
						<dd class="text-zinc-700">{order.customer.firstName} {order.customer.lastName}</dd>
					</div>
					<div class="flex justify-between gap-4">
						<dt class="text-zinc-500 shrink-0">E-Mail</dt>
						<dd class="text-zinc-700 break-all">{order.customer.email}</dd>
					</div>
					{#if order.customer.phone}
						<div class="flex justify-between">
							<dt class="text-zinc-500">Telefon</dt>
							<dd class="text-zinc-700">{order.customer.phone}</dd>
						</div>
					{/if}
				</dl>
			{:else}
				<p class="text-sm text-zinc-400">Kein Kunde verknüpft</p>
			{/if}
		</div>

		<div class="bg-white rounded-lg border border-zinc-200 p-4">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Lieferadresse</h2>
			{#if order.shippingAddress}
				<address class="not-italic text-sm text-zinc-700 space-y-0.5">
					<div>{order.shippingAddress.street}</div>
					<div>{order.shippingAddress.postalCode} {order.shippingAddress.city}</div>
					{#if order.shippingAddress.state}
						<div>{order.shippingAddress.state}</div>
					{/if}
					<div>{order.shippingAddress.country}</div>
				</address>
			{:else}
				<p class="text-sm text-zinc-400">Keine Adresse</p>
			{/if}
		</div>

		<div class="bg-white rounded-lg border border-zinc-200 p-4">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Rechnungsadresse</h2>
			{#if order.billingAddress}
				<address class="not-italic text-sm text-zinc-700 space-y-0.5">
					<div>{order.billingAddress.street}</div>
					<div>{order.billingAddress.postalCode} {order.billingAddress.city}</div>
					{#if order.billingAddress.state}
						<div>{order.billingAddress.state}</div>
					{/if}
					<div>{order.billingAddress.country}</div>
				</address>
			{:else}
				<p class="text-sm text-zinc-400">Keine Adresse</p>
			{/if}
		</div>
	</div>

	<div class="bg-white rounded-lg border border-zinc-200 overflow-hidden mb-6">
		<div class="px-4 py-3 border-b border-zinc-100">
			<h2 class="font-semibold text-zinc-900 text-sm">Artikel</h2>
		</div>
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-zinc-100 bg-zinc-50">
					<th class="text-left px-4 py-2 text-xs text-zinc-500 font-medium uppercase tracking-wide">Produkt</th>
					<th class="text-right px-4 py-2 text-xs text-zinc-500 font-medium uppercase tracking-wide">Einzelpreis</th>
					<th class="text-right px-4 py-2 text-xs text-zinc-500 font-medium uppercase tracking-wide">Menge</th>
					<th class="text-right px-4 py-2 text-xs text-zinc-500 font-medium uppercase tracking-wide">Gesamt</th>
				</tr>
			</thead>
			<tbody>
				{#each order.items as item}
					<tr class="border-b border-zinc-50 last:border-0">
						<td class="px-4 py-3 text-zinc-800">{item.product?.name ?? 'Unbekannt'}</td>
						<td class="px-4 py-3 text-right text-zinc-600">{Number(item.unitPrice).toFixed(2)} &euro;</td>
						<td class="px-4 py-3 text-right text-zinc-600">{item.quantity}</td>
						<td class="px-4 py-3 text-right font-medium text-zinc-900">{Number(item.subtotal).toFixed(2)} &euro;</td>
					</tr>
				{:else}
					<tr>
						<td colspan="4" class="px-4 py-6 text-center text-sm text-zinc-400">Keine Artikel</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<div class="px-4 py-3 border-t border-zinc-100 space-y-1 text-sm">
			<div class="flex justify-between text-zinc-500">
				<span>Zwischensumme</span>
				<span>{Number(order.subtotalAmount).toFixed(2)} &euro;</span>
			</div>
			<div class="flex justify-between text-zinc-500">
				<span>Versand</span>
				<span>{Number(order.shippingAmount).toFixed(2)} &euro;</span>
			</div>
			<div class="flex justify-between text-zinc-500">
				<span>MwSt.</span>
				<span>{Number(order.taxAmount).toFixed(2)} &euro;</span>
			</div>
			<div class="flex justify-between font-semibold text-zinc-900 text-base pt-1 border-t border-zinc-100">
				<span>Gesamt</span>
				<span>{Number(order.totalAmount).toFixed(2)} &euro;</span>
			</div>
		</div>
	</div>

	{#if order.notes}
		<div class="bg-white rounded-lg border border-zinc-200 p-4 mb-6">
			<h2 class="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Notizen</h2>
			<p class="text-sm text-zinc-700">{order.notes}</p>
		</div>
	{/if}

	<div class="bg-white rounded-lg border border-zinc-200 p-5">
		<h2 class="font-semibold text-zinc-900 text-sm mb-4">Status aktualisieren</h2>
		<form method="POST" action="?/updateStatus" use:enhance class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1" for="orderStatus">
						Bestellstatus <span class="text-red-500">*</span>
					</label>
					<select
						id="orderStatus"
						name="orderStatus"
						class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-zinc-500"
					>
						{#each Object.entries(orderStatusLabels) as [value, label]}
							<option {value} selected={order.orderStatus === value}>{label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1" for="paymentStatus">
						Zahlungsstatus <span class="text-red-500">*</span>
					</label>
					<select
						id="paymentStatus"
						name="paymentStatus"
						class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-zinc-500"
					>
						{#each Object.entries(paymentStatusLabels) as [value, label]}
							<option {value} selected={order.paymentStatus === value}>{label}</option>
						{/each}
					</select>
				</div>
			</div>
			<button
				type="submit"
				class="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-700 transition-colors"
			>
				Status speichern
			</button>
		</form>
	</div>
</div>
