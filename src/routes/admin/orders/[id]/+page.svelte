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

<div class="max-w-3xl p-6">
	<div class="mb-6 flex items-center gap-3">
		<a href="/admin/orders" class="text-sm text-zinc-400 hover:text-zinc-700">&larr; Bestellungen</a
		>
		<span class="text-zinc-300">/</span>
		<span class="font-mono text-sm text-zinc-600">{order.id.slice(0, 8)}&hellip;</span>
	</div>

	{#if form?.success}
		<div
			class="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
		>
			Status wurde aktualisiert.
		</div>
	{/if}
	{#if form?.error}
		<div class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
			{form.error}
		</div>
	{/if}

	<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="rounded-lg border border-zinc-200 bg-white p-4">
			<h2 class="mb-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Bestellinfo</h2>
			<dl class="space-y-1.5 text-sm">
				<div class="flex justify-between gap-4">
					<dt class="shrink-0 text-zinc-500">ID</dt>
					<dd class="font-mono text-xs break-all text-zinc-700">{order.id}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-zinc-500">Erstellt</dt>
					<dd class="text-zinc-700">
						{new Date(order.createdAt).toLocaleDateString('de-DE', {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric'
						})}
					</dd>
				</div>
				{#if order.placedAt}
					<div class="flex justify-between">
						<dt class="text-zinc-500">Aufgegeben</dt>
						<dd class="text-zinc-700">
							{new Date(order.placedAt).toLocaleDateString('de-DE', {
								day: '2-digit',
								month: '2-digit',
								year: 'numeric'
							})}
						</dd>
					</div>
				{/if}
				<div class="flex justify-between">
					<dt class="text-zinc-500">Versandart</dt>
					<dd class="text-zinc-700">
						{shippingMethodLabels[order.shippingMethod] ?? order.shippingMethod}
					</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-zinc-500">Zahlungsart</dt>
					<dd class="text-zinc-700">
						{paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
					</dd>
				</div>
			</dl>
		</div>

		<div class="rounded-lg border border-zinc-200 bg-white p-4">
			<h2 class="mb-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Kunde</h2>
			{#if order.customer}
				<dl class="space-y-1.5 text-sm">
					<div class="flex justify-between">
						<dt class="text-zinc-500">Name</dt>
						<dd class="text-zinc-700">{order.customer.firstName} {order.customer.lastName}</dd>
					</div>
					<div class="flex justify-between gap-4">
						<dt class="shrink-0 text-zinc-500">E-Mail</dt>
						<dd class="break-all text-zinc-700">{order.customer.email}</dd>
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

		<div class="rounded-lg border border-zinc-200 bg-white p-4">
			<h2 class="mb-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
				Lieferadresse
			</h2>
			{#if order.shippingAddress}
				<address class="space-y-0.5 text-sm text-zinc-700 not-italic">
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

		<div class="rounded-lg border border-zinc-200 bg-white p-4">
			<h2 class="mb-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
				Rechnungsadresse
			</h2>
			{#if order.billingAddress}
				<address class="space-y-0.5 text-sm text-zinc-700 not-italic">
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

	<div class="mb-6 overflow-hidden rounded-lg border border-zinc-200 bg-white">
		<div class="border-b border-zinc-100 px-4 py-3">
			<h2 class="text-sm font-semibold text-zinc-900">Artikel</h2>
		</div>
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-zinc-100 bg-zinc-50">
					<th class="px-4 py-2 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Produkt</th
					>
					<th class="px-4 py-2 text-right text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Einzelpreis</th
					>
					<th class="px-4 py-2 text-right text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Menge</th
					>
					<th class="px-4 py-2 text-right text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Gesamt</th
					>
				</tr>
			</thead>
			<tbody>
				{#each order.items as item (item.id)}
					<tr class="border-b border-zinc-50 last:border-0">
						<td class="px-4 py-3 text-zinc-800">{item.product?.name ?? 'Unbekannt'}</td>
						<td class="px-4 py-3 text-right text-zinc-600"
							>{Number(item.unitPrice).toFixed(2)} &euro;</td
						>
						<td class="px-4 py-3 text-right text-zinc-600">{item.quantity}</td>
						<td class="px-4 py-3 text-right font-medium text-zinc-900"
							>{Number(item.subtotal).toFixed(2)} &euro;</td
						>
					</tr>
				{:else}
					<tr>
						<td colspan="4" class="px-4 py-6 text-center text-sm text-zinc-400">Keine Artikel</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<div class="space-y-1 border-t border-zinc-100 px-4 py-3 text-sm">
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
			<div
				class="flex justify-between border-t border-zinc-100 pt-1 text-base font-semibold text-zinc-900"
			>
				<span>Gesamt</span>
				<span>{Number(order.totalAmount).toFixed(2)} &euro;</span>
			</div>
		</div>
	</div>

	{#if order.notes}
		<div class="mb-6 rounded-lg border border-zinc-200 bg-white p-4">
			<h2 class="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Notizen</h2>
			<p class="text-sm text-zinc-700">{order.notes}</p>
		</div>
	{/if}

	<div class="rounded-lg border border-zinc-200 bg-white p-5">
		<h2 class="mb-4 text-sm font-semibold text-zinc-900">Status aktualisieren</h2>
		<form method="POST" action="?/updateStatus" use:enhance class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label
						class="mb-1 block text-xs font-medium tracking-wide text-zinc-500 uppercase"
						for="orderStatus"
					>
						Bestellstatus <span class="text-red-500">*</span>
					</label>
					<select
						id="orderStatus"
						name="orderStatus"
						class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
					>
						{#each Object.entries(orderStatusLabels) as [value, label] (value)}
							<option {value} selected={order.orderStatus === value}>{label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label
						class="mb-1 block text-xs font-medium tracking-wide text-zinc-500 uppercase"
						for="paymentStatus"
					>
						Zahlungsstatus <span class="text-red-500">*</span>
					</label>
					<select
						id="paymentStatus"
						name="paymentStatus"
						class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
					>
						{#each Object.entries(paymentStatusLabels) as [value, label] (value)}
							<option {value} selected={order.paymentStatus === value}>{label}</option>
						{/each}
					</select>
				</div>
			</div>
			<button
				type="submit"
				class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
			>
				Status speichern
			</button>
		</form>
	</div>
</div>
