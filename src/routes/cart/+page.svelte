<script lang="ts">
	import { enhance } from '$app/forms';
	import { ShoppingCart, ArrowRight, Lock, Truck, Trash2, Plus, Minus, Package } from 'lucide-svelte';

	let { data } = $props();

	function formatPrice(cents: number) {
		return cents.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	}

	const FREE_SHIPPING_THRESHOLD = 150;
	const SHIPPING_COST = 5.99;

	const subtotal = $derived(
		data.items.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0)
	);
	const shippingCost = $derived(subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST);
	const total = $derived(subtotal + shippingCost);
</script>

<svelte:head>
	<title>Warenkorb – Zigarren Puro</title>
	<meta name="description" content="Ihr Warenkorb bei Zigarren Puro" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-5xl">
	<h1 class="text-3xl font-bold mb-8">Warenkorb</h1>

	{#if data.items.length === 0}
		<div class="flex flex-col items-center justify-center py-20 text-center gap-4 bg-base-100 rounded-2xl border border-base-200">
			<ShoppingCart class="w-14 h-14 text-base-content/20" />
			<div>
				<p class="text-lg font-medium text-base-content/60">Ihr Warenkorb ist leer</p>
				<p class="text-sm text-base-content/40 mt-1">Fügen Sie Produkte hinzu, um hier fortzufahren.</p>
			</div>
			<a href="/shop" class="btn btn-secondary mt-2">
				Produkte entdecken
				<ArrowRight class="w-4 h-4" />
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Cart items -->
			<div class="lg:col-span-2 space-y-4">
				{#each data.items as item (item.id)}
					<div class="card bg-base-100 border border-base-200 shadow-sm">
						<div class="card-body p-4 flex-row gap-4 items-start">
							<div class="w-20 h-20 bg-base-200 rounded-lg flex-shrink-0 flex items-center justify-center">
								<Package class="w-8 h-8 text-base-content/20" />
							</div>

							<div class="flex-1 min-w-0">
								{#if item.producerName}
									<p class="text-xs text-base-content/50 uppercase tracking-wide mb-0.5">{item.producerName}</p>
								{/if}
								<a
									href="/products/{item.id}"
									class="font-semibold hover:text-secondary transition-colors line-clamp-2"
								>
									{item.name}
								</a>
								<p class="text-sm text-secondary font-bold mt-0.5">{formatPrice(parseFloat(item.price))}</p>

								<div class="flex items-center justify-between mt-3">
									<div class="flex items-center gap-1">
										<form method="POST" action="?/update" use:enhance>
											<input type="hidden" name="id" value={item.id} />
											<input type="hidden" name="qty" value={item.qty - 1} />
											<button
												type="submit"
												class="btn btn-ghost btn-xs btn-circle"
												disabled={item.qty <= 1}
											>
												<Minus class="w-3 h-3" />
											</button>
										</form>
										<span class="w-8 text-center font-medium text-sm">{item.qty}</span>
										<form method="POST" action="?/update" use:enhance>
											<input type="hidden" name="id" value={item.id} />
											<input type="hidden" name="qty" value={item.qty + 1} />
											<button
												type="submit"
												class="btn btn-ghost btn-xs btn-circle"
												disabled={item.qty >= 99}
											>
												<Plus class="w-3 h-3" />
											</button>
										</form>
									</div>

									<div class="flex items-center gap-3">
										<span class="font-semibold text-sm">
											{formatPrice(parseFloat(item.price) * item.qty)}
										</span>
										<form method="POST" action="?/remove" use:enhance>
											<input type="hidden" name="id" value={item.id} />
											<button
												type="submit"
												class="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
											>
												<Trash2 class="w-3.5 h-3.5" />
											</button>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}

				<div class="text-right">
					<form method="POST" action="?/clear" use:enhance>
						<button type="submit" class="btn btn-ghost btn-sm text-error/70 hover:text-error gap-1.5">
							<Trash2 class="w-3.5 h-3.5" />
							Warenkorb leeren
						</button>
					</form>
				</div>
			</div>

			<!-- Order summary sidebar -->
			<div class="space-y-4">
				<div class="card bg-base-100 border border-base-200 shadow-sm">
					<div class="card-body">
						<h2 class="card-title text-lg">Bestellübersicht</h2>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between text-base-content/60">
								<span>Zwischensumme</span>
								<span>{formatPrice(subtotal)}</span>
							</div>
							<div class="flex justify-between text-base-content/60">
								<span>Versand</span>
								{#if shippingCost === 0}
									<span class="text-success font-medium">Kostenlos</span>
								{:else}
									<span>{formatPrice(shippingCost)}</span>
								{/if}
							</div>
							<div class="divider my-1"></div>
							<div class="flex justify-between font-semibold text-base">
								<span>Gesamt</span>
								<span>{formatPrice(total)}</span>
							</div>
							<p class="text-xs text-base-content/40">inkl. MwSt. und Tabaksteuer</p>
						</div>
						<a href="/checkout" class="btn btn-primary w-full mt-4 gap-2">
							<Lock class="w-4 h-4" />
							Zur Kasse
						</a>
						<div class="flex items-center gap-2 text-xs text-base-content/40 justify-center mt-2">
							<Lock class="w-3 h-3" />
							Sichere, verschlüsselte Zahlung
						</div>
					</div>
				</div>

				{#if subtotal < FREE_SHIPPING_THRESHOLD}
					<div class="card bg-base-100 border border-base-200 shadow-sm">
						<div class="card-body py-4">
							<div class="flex items-start gap-3 text-sm">
								<Truck class="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
								<div class="flex-1">
									<p class="text-base-content/70">
										Noch <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}</strong> bis zum kostenlosen Versand.
									</p>
									<progress
										class="progress progress-secondary w-full mt-2"
										value={subtotal}
										max={FREE_SHIPPING_THRESHOLD}
									></progress>
								</div>
							</div>
						</div>
					</div>
				{:else}
					<div class="card bg-base-100 border border-success/30 shadow-sm">
						<div class="card-body py-4">
							<div class="flex items-center gap-3 text-sm">
								<Truck class="w-5 h-5 text-success flex-shrink-0" />
								<p class="text-success font-medium">Kostenloser Versand inklusive!</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
