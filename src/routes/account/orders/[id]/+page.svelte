<script lang="ts">
	import { ArrowLeft, MapPin, Package, Truck } from 'lucide-svelte';

	let { data } = $props();

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

	const orderStatusColors: Record<string, string> = {
		pending: 'badge-warning',
		confirmed: 'badge-info',
		processing: 'badge-info',
		shipped: 'badge-primary',
		delivered: 'badge-success',
		cancelled: 'badge-error',
		refunded: 'badge-ghost'
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

<svelte:head>
	<title>Bestellung #{order.id.slice(0, 8).toUpperCase()} – Zigarren Puro</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-3xl px-4 py-10">
		<div class="mb-6 flex items-center gap-3">
			<a href="/account/orders" class="btn btn-ghost btn-sm btn-circle">
				<ArrowLeft class="h-4 w-4" />
			</a>
			<div>
				<h1 class="text-2xl font-semibold text-base-content">
					Bestellung <span class="font-mono text-lg">#{order.id.slice(0, 8).toUpperCase()}</span>
				</h1>
				<p class="text-sm text-base-content/60">
					{new Date(order.createdAt).toLocaleDateString('de-DE', {
						day: '2-digit',
						month: 'long',
						year: 'numeric'
					})}
				</p>
			</div>
			<span class="badge {orderStatusColors[order.orderStatus] ?? 'badge-ghost'} ml-auto">
				{orderStatusLabels[order.orderStatus] ?? order.orderStatus}
			</span>
		</div>

		<!-- Order info + address -->
		<div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="rounded-xl bg-base-100 p-5 shadow-sm ring-1 ring-base-300">
				<h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-base-content">
					<Package class="h-4 w-4 text-base-content/40" />
					Bestelldetails
				</h2>
				<dl class="space-y-1.5 text-sm">
					<div class="flex justify-between gap-4">
						<dt class="text-base-content/50">Bestellnr.</dt>
						<dd class="font-mono text-xs text-base-content/70 break-all">{order.id}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-base-content/50">Versandart</dt>
						<dd class="text-base-content">{shippingMethodLabels[order.shippingMethod] ?? order.shippingMethod}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-base-content/50">Zahlungsart</dt>
						<dd class="text-base-content">{paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-base-content/50">Zahlungsstatus</dt>
						<dd class="text-base-content">{paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}</dd>
					</div>
					{#if order.placedAt}
						<div class="flex justify-between">
							<dt class="text-base-content/50">Aufgegeben am</dt>
							<dd class="text-base-content">
								{new Date(order.placedAt).toLocaleDateString('de-DE', {
									day: '2-digit',
									month: '2-digit',
									year: 'numeric'
								})}
							</dd>
						</div>
					{/if}
				</dl>
			</div>

			<div class="rounded-xl bg-base-100 p-5 shadow-sm ring-1 ring-base-300">
				<h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-base-content">
					<Truck class="h-4 w-4 text-base-content/40" />
					Lieferadresse
				</h2>
				{#if order.shippingAddress}
					<address class="not-italic text-sm text-base-content/80 space-y-0.5">
						<p>{order.shippingAddress.street}</p>
						<p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
						{#if order.shippingAddress.state}
							<p>{order.shippingAddress.state}</p>
						{/if}
						<p>{order.shippingAddress.country}</p>
					</address>
				{:else}
					<p class="text-sm text-base-content/40">Keine Adresse</p>
				{/if}

				{#if order.billingAddress && order.billingAddress.id !== order.shippingAddress?.id}
					<h2 class="mb-3 mt-5 flex items-center gap-2 text-sm font-semibold text-base-content">
						<MapPin class="h-4 w-4 text-base-content/40" />
						Rechnungsadresse
					</h2>
					<address class="not-italic text-sm text-base-content/80 space-y-0.5">
						<p>{order.billingAddress.street}</p>
						<p>{order.billingAddress.postalCode} {order.billingAddress.city}</p>
						{#if order.billingAddress.state}
							<p>{order.billingAddress.state}</p>
						{/if}
						<p>{order.billingAddress.country}</p>
					</address>
				{/if}
			</div>
		</div>

		<!-- Items -->
		<div class="mb-4 overflow-hidden rounded-xl bg-base-100 shadow-sm ring-1 ring-base-300">
			<div class="border-b border-base-200 px-5 py-3">
				<h2 class="text-sm font-semibold text-base-content">Artikel</h2>
			</div>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-base-200 bg-base-200/50">
						<th class="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-base-content/50">Produkt</th>
						<th class="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-base-content/50">Einzelpreis</th>
						<th class="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-base-content/50">Menge</th>
						<th class="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-base-content/50">Gesamt</th>
					</tr>
				</thead>
				<tbody>
					{#each order.items as item (item.id)}
						<tr class="border-b border-base-200/50 last:border-0">
							<td class="px-5 py-3 text-base-content">
								{#if item.product}
									<a href="/products/{item.product.id}" class="hover:text-primary transition-colors">
										{item.product.name}
									</a>
								{:else}
									<span class="text-base-content/40">Produkt nicht mehr verfügbar</span>
								{/if}
							</td>
							<td class="px-5 py-3 text-right text-base-content/60">{Number(item.unitPrice).toFixed(2)} €</td>
							<td class="px-5 py-3 text-right text-base-content/60">{item.quantity}</td>
							<td class="px-5 py-3 text-right font-medium text-base-content">{Number(item.subtotal).toFixed(2)} €</td>
						</tr>
					{:else}
						<tr>
							<td colspan="4" class="px-5 py-8 text-center text-sm text-base-content/40">Keine Artikel</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<div class="border-t border-base-200 px-5 py-4 space-y-1.5 text-sm">
				<div class="flex justify-between text-base-content/60">
					<span>Zwischensumme</span>
					<span>{Number(order.subtotalAmount).toFixed(2)} €</span>
				</div>
				<div class="flex justify-between text-base-content/60">
					<span>Versand</span>
					<span>{Number(order.shippingAmount).toFixed(2)} €</span>
				</div>
				<div class="flex justify-between text-base-content/60">
					<span>MwSt.</span>
					<span>{Number(order.taxAmount).toFixed(2)} €</span>
				</div>
				<div class="flex justify-between border-t border-base-200 pt-2 text-base font-semibold text-base-content">
					<span>Gesamt</span>
					<span>{Number(order.totalAmount).toFixed(2)} €</span>
				</div>
			</div>
		</div>

		{#if order.notes}
			<div class="rounded-xl bg-base-100 p-5 shadow-sm ring-1 ring-base-300">
				<h2 class="mb-2 text-sm font-semibold text-base-content">Anmerkungen</h2>
				<p class="text-sm text-base-content/70">{order.notes}</p>
			</div>
		{/if}
	</div>
</div>
