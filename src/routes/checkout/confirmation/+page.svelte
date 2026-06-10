<script lang="ts">
	import { CheckCircle, Package, Building2, CreditCard, Truck, ArrowRight } from '@lucide/svelte';
	import * as m from '$lib/messages';
	import { bankAccount } from '$lib/config';

	let { data } = $props();

	const orderShort = data.order.id.slice(0, 8).toUpperCase();
	const isCreditCard = data.order.paymentMethod === 'credit_card';

	function formatPrice(n: string | number) {
		return parseFloat(String(n)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	}
</script>

<svelte:head>
	<title>Bestellung bestätigt - Zigarren Puro</title>
</svelte:head>

<div class="container mx-auto max-w-2xl px-4 py-16">

	<!-- Success header -->
	<div class="text-center mb-10">
		<div class="flex justify-center mb-4">
			<div class="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
				<CheckCircle class="w-8 h-8 text-success" />
			</div>
		</div>
		<h1 class="text-2xl font-bold mb-2">{m.checkoutConfirmed()}</h1>
		<p class="text-base-content/60 text-sm">{m.checkoutEmailSent()}</p>
	</div>

	<!-- Order number -->
	<div class="card bg-base-100 border border-base-200 shadow-sm mb-6">
		<div class="card-body py-4 flex-row items-center justify-between">
			<div>
				<p class="text-xs text-base-content/50 uppercase tracking-wide">{m.checkoutOrderNumber()}</p>
				<p class="text-xl font-bold font-mono tracking-wider mt-0.5">#{orderShort}</p>
			</div>
			<div class="text-right">
				<p class="text-xs text-base-content/50 uppercase tracking-wide">Gesamt</p>
				<p class="text-xl font-bold text-secondary mt-0.5">{formatPrice(data.order.totalAmount)}</p>
			</div>
		</div>
	</div>

	<!-- Payment info: bank transfer or credit card -->
	{#if isCreditCard}
		<div class="card bg-base-100 border border-success/30 shadow-sm mb-6">
			<div class="card-body">
				<div class="flex items-center gap-2 mb-2">
					<CreditCard class="w-5 h-5 text-success" />
					<h2 class="font-semibold">Zahlung erfolgreich</h2>
				</div>
				<p class="text-sm text-base-content/70">
					Ihre Kartenzahlung wurde erfolgreich verarbeitet. Wir bereiten Ihre Bestellung nun für den Versand vor.
				</p>
			</div>
		</div>
	{:else}
		<div class="card bg-base-100 border border-warning/30 shadow-sm mb-6">
			<div class="card-body">
				<div class="flex items-center gap-2 mb-4">
					<Building2 class="w-5 h-5 text-warning" />
					<h2 class="font-semibold">{m.checkoutBankDetails()}</h2>
				</div>
				<p class="text-sm text-base-content/70 mb-4">{m.checkoutBankPaymentNote()}</p>
				<div class="bg-base-200 rounded-lg p-4 space-y-2 text-sm font-mono">
					<div class="flex justify-between gap-4">
						<span class="text-base-content/50 shrink-0">Kontoinhaber</span>
						<span class="font-semibold text-right">{bankAccount.accountHolder}</span>
					</div>
					<div class="flex justify-between gap-4">
						<span class="text-base-content/50 shrink-0">IBAN</span>
						<span class="font-semibold text-right">{bankAccount.iban}</span>
					</div>
					<div class="flex justify-between gap-4">
						<span class="text-base-content/50 shrink-0">BIC</span>
						<span class="font-semibold">{bankAccount.bic}</span>
					</div>
					<div class="divider my-1"></div>
					<div class="flex justify-between gap-4">
						<span class="text-base-content/50 shrink-0">Betrag</span>
						<span class="font-bold text-secondary">{formatPrice(data.order.totalAmount)}</span>
					</div>
					<div class="flex justify-between gap-4">
						<span class="text-base-content/50 shrink-0">Verwendungszweck</span>
						<span class="font-bold">#{orderShort}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Order items -->
	<div class="card bg-base-100 border border-base-200 shadow-sm mb-6">
		<div class="card-body">
			<h2 class="font-semibold mb-4 flex items-center gap-2">
				<Package class="w-4 h-4" />
				Bestellte Artikel
			</h2>
			<div class="space-y-3">
				{#each data.items as item (item.id)}
					<div class="flex items-center justify-between gap-4 text-sm">
						<span class="flex-1 min-w-0">
							<span class="font-medium">{item.productName ?? 'Produkt'}</span>
							<span class="text-base-content/50 ml-1">x{item.quantity}</span>
						</span>
						<span class="font-semibold shrink-0">{formatPrice(item.subtotal ?? '0')}</span>
					</div>
				{/each}
				<div class="divider my-1"></div>
				<div class="flex justify-between text-sm text-base-content/60">
					<span>Zwischensumme</span>
					<span>{formatPrice(data.order.subtotalAmount)}</span>
				</div>
				<div class="flex justify-between text-sm text-base-content/60">
					<span>Versand</span>
					{#if data.order.shippingAmount === 0}
						<span class="text-success">Kostenlos</span>
					{:else}
						<span>{formatPrice(data.order.shippingAmount)}</span>
					{/if}
				</div>
				<div class="flex justify-between font-bold">
					<span>Gesamt</span>
					<span>{formatPrice(data.order.totalAmount)}</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Shipping address -->
	{#if data.shippingAddress}
		<div class="card bg-base-100 border border-base-200 shadow-sm mb-8">
			<div class="card-body py-4">
				<div class="flex items-start gap-3">
					<Truck class="w-4 h-4 text-base-content/50 mt-0.5 shrink-0" />
					<div class="text-sm">
						<p class="text-xs text-base-content/50 uppercase tracking-wide mb-1">{m.checkoutDeliveryTo()}</p>
						<p class="font-medium">{data.firstName} {data.lastName}</p>
						<p class="text-base-content/60">{data.shippingAddress.street}</p>
						<p class="text-base-content/60">{data.shippingAddress.postalCode} {data.shippingAddress.city}</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Actions -->
	<div class="flex flex-col sm:flex-row gap-3">
		<a href="/shop" class="btn btn-primary flex-1 gap-2">
			{m.checkoutContinueShopping()}
			<ArrowRight class="w-4 h-4" />
		</a>
		<a href="/account" class="btn btn-ghost flex-1">
			Mein Konto
		</a>
	</div>
</div>
