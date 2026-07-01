<script lang="ts">
	import { CheckCircle, Package, Building2, CreditCard, Truck, ArrowRight } from '@lucide/svelte';
	import * as m from '$lib/messages';
	import { bankAccount } from '$lib/config';

	let { data } = $props();

	const orderShort = $derived(data.order.id.slice(0, 8).toUpperCase());
	const isCreditCard = $derived(data.order.paymentMethod === 'credit_card');

	function formatPrice(n: string | number) {
		return parseFloat(String(n)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	}
</script>

<svelte:head>
	<title>Bestellung bestätigt - Zigarren Puro</title>
</svelte:head>

<div class="container mx-auto max-w-2xl px-4 py-16">
	<!-- Success header -->
	<div class="mb-10 text-center">
		<div class="mb-4 flex justify-center">
			<div class="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
				<CheckCircle class="h-8 w-8 text-success" />
			</div>
		</div>
		<h1 class="mb-2 text-2xl font-bold">{m.checkoutConfirmed()}</h1>
		<p class="text-sm text-base-content/60">{m.checkoutEmailSent()}</p>
	</div>

	<!-- Order number -->
	<div class="card mb-6 border border-base-200 bg-base-100 shadow-sm">
		<div class="card-body flex-row items-center justify-between py-4">
			<div>
				<p class="text-xs tracking-wide text-base-content/50 uppercase">
					{m.checkoutOrderNumber()}
				</p>
				<p class="mt-0.5 font-mono text-xl font-bold tracking-wider">#{orderShort}</p>
			</div>
			<div class="text-right">
				<p class="text-xs tracking-wide text-base-content/50 uppercase">Gesamt</p>
				<p class="mt-0.5 text-xl font-bold text-secondary">{formatPrice(data.order.totalAmount)}</p>
			</div>
		</div>
	</div>

	<!-- Payment info: bank transfer or credit card -->
	{#if isCreditCard}
		<div class="card mb-6 border border-success/30 bg-base-100 shadow-sm">
			<div class="card-body">
				<div class="mb-2 flex items-center gap-2">
					<CreditCard class="h-5 w-5 text-success" />
					<h2 class="font-semibold">Zahlung erfolgreich</h2>
				</div>
				<p class="text-sm text-base-content/70">
					Ihre Kartenzahlung wurde erfolgreich verarbeitet. Wir bereiten Ihre Bestellung nun für den
					Versand vor.
				</p>
			</div>
		</div>
	{:else}
		<div class="card mb-6 border border-warning/30 bg-base-100 shadow-sm">
			<div class="card-body">
				<div class="mb-4 flex items-center gap-2">
					<Building2 class="h-5 w-5 text-warning" />
					<h2 class="font-semibold">{m.checkoutBankDetails()}</h2>
				</div>
				<p class="mb-4 text-sm text-base-content/70">{m.checkoutBankPaymentNote()}</p>
				<div class="space-y-2 rounded-lg bg-base-200 p-4 font-mono text-sm">
					<div class="flex justify-between gap-4">
						<span class="shrink-0 text-base-content/50">Kontoinhaber</span>
						<span class="text-right font-semibold">{bankAccount.accountHolder}</span>
					</div>
					<div class="flex justify-between gap-4">
						<span class="shrink-0 text-base-content/50">IBAN</span>
						<span class="text-right font-semibold">{bankAccount.iban}</span>
					</div>
					<div class="flex justify-between gap-4">
						<span class="shrink-0 text-base-content/50">BIC</span>
						<span class="font-semibold">{bankAccount.bic}</span>
					</div>
					<div class="divider my-1"></div>
					<div class="flex justify-between gap-4">
						<span class="shrink-0 text-base-content/50">Betrag</span>
						<span class="font-bold text-secondary">{formatPrice(data.order.totalAmount)}</span>
					</div>
					<div class="flex justify-between gap-4">
						<span class="shrink-0 text-base-content/50">Verwendungszweck</span>
						<span class="font-bold">#{orderShort}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Order items -->
	<div class="card mb-6 border border-base-200 bg-base-100 shadow-sm">
		<div class="card-body">
			<h2 class="mb-4 flex items-center gap-2 font-semibold">
				<Package class="h-4 w-4" />
				Bestellte Artikel
			</h2>
			<div class="space-y-3">
				{#each data.items as item (item.id)}
					<div class="flex items-center justify-between gap-4 text-sm">
						<span class="min-w-0 flex-1">
							<span class="font-medium">{item.productName ?? 'Produkt'}</span>
							<span class="ml-1 text-base-content/50">x{item.quantity}</span>
						</span>
						<span class="shrink-0 font-semibold">{formatPrice(item.subtotal ?? '0')}</span>
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
		<div class="card mb-8 border border-base-200 bg-base-100 shadow-sm">
			<div class="card-body py-4">
				<div class="flex items-start gap-3">
					<Truck class="mt-0.5 h-4 w-4 shrink-0 text-base-content/50" />
					<div class="text-sm">
						<p class="mb-1 text-xs tracking-wide text-base-content/50 uppercase">
							{m.checkoutDeliveryTo()}
						</p>
						<p class="font-medium">{data.firstName} {data.lastName}</p>
						<p class="text-base-content/60">{data.shippingAddress.street}</p>
						<p class="text-base-content/60">
							{data.shippingAddress.postalCode}
							{data.shippingAddress.city}
						</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Actions -->
	<div class="flex flex-col gap-3 sm:flex-row">
		<a href="/shop" class="btn flex-1 gap-2 btn-primary">
			{m.checkoutContinueShopping()}
			<ArrowRight class="h-4 w-4" />
		</a>
		<a href="/account" class="btn flex-1 btn-ghost"> Mein Konto </a>
	</div>
</div>
