<script lang="ts">
	import { ArrowLeft, Package } from 'lucide-svelte';

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

	const orderStatusColors: Record<string, string> = {
		pending: 'badge-warning',
		confirmed: 'badge-info',
		processing: 'badge-info',
		shipped: 'badge-primary',
		delivered: 'badge-success',
		cancelled: 'badge-error',
		refunded: 'badge-ghost'
	};

	const shippingMethodLabels: Record<string, string> = {
		standard: 'Standard',
		express: 'Express',
		next_day: 'Nächster Tag',
		pickup: 'Abholung'
	};
</script>

<svelte:head>
	<title>Bestellungen – Zigarren Puro</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-3xl px-4 py-10">
		<div class="mb-6 flex items-center gap-3">
			<a href="/account" class="btn btn-ghost btn-sm btn-circle">
				<ArrowLeft class="h-4 w-4" />
			</a>
			<div>
				<h1 class="text-2xl font-semibold text-base-content">Bestellungen</h1>
				<p class="text-sm text-base-content/60">Deine Bestellhistorie</p>
			</div>
		</div>

		{#if data.orders.length === 0}
			<div class="flex flex-col items-center gap-4 rounded-2xl bg-base-100 px-6 py-16 text-center shadow-sm ring-1 ring-base-300">
				<Package class="h-12 w-12 text-base-content/20" />
				<div>
					<p class="font-medium text-base-content">Noch keine Bestellungen</p>
					<p class="mt-1 text-sm text-base-content/50">Sobald du etwas bestellst, erscheint es hier.</p>
				</div>
				<a href="/shop" class="btn btn-primary btn-sm mt-2">Zum Shop</a>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				{#each data.orders as order (order.id)}
					<a
						href="/account/orders/{order.id}"
						class="flex flex-col gap-3 rounded-xl bg-base-100 p-5 shadow-sm ring-1 ring-base-300 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
					>
						<div class="flex items-start gap-4">
							<div class="rounded-lg bg-base-200 p-2.5">
								<Package class="h-5 w-5 text-base-content/40" />
							</div>
							<div>
								<p class="font-mono text-xs text-base-content/40">#{order.id.slice(0, 8).toUpperCase()}</p>
								<p class="mt-0.5 text-sm font-medium text-base-content">
									{new Date(order.createdAt).toLocaleDateString('de-DE', {
										day: '2-digit',
										month: 'long',
										year: 'numeric'
									})}
								</p>
								<p class="text-xs text-base-content/50">{shippingMethodLabels[order.shippingMethod] ?? order.shippingMethod}</p>
							</div>
						</div>
						<div class="flex items-center gap-4 sm:flex-col sm:items-end">
							<span class="badge {orderStatusColors[order.orderStatus] ?? 'badge-ghost'} badge-sm">
								{orderStatusLabels[order.orderStatus] ?? order.orderStatus}
							</span>
							<p class="text-base font-semibold text-base-content">
								{Number(order.totalAmount).toFixed(2)} €
							</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
