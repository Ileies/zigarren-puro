<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		ShoppingCart,
		ArrowRight,
		Lock,
		Truck,
		Trash2,
		Plus,
		Minus,
		Package
	} from '@lucide/svelte';
	import { freeShippingThreshold, shippingCosts } from '$lib/config';

	let { data } = $props();

	function formatPrice(cents: number) {
		return cents.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	}

	const subtotal = $derived(data.items.reduce((sum, item) => sum + item.price * item.qty, 0));
	const shippingCost = $derived(subtotal >= freeShippingThreshold ? 0 : shippingCosts.standard);
	const total = $derived(subtotal + shippingCost);
</script>

<svelte:head>
	<title>Warenkorb – Zigarren Puro</title>
	<meta name="description" content="Ihr Warenkorb bei Zigarren Puro" />
</svelte:head>

<div class="container mx-auto max-w-5xl px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold">Warenkorb</h1>

	{#if data.items.length === 0}
		<div
			class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-base-200 bg-base-100 py-20 text-center"
		>
			<ShoppingCart class="h-14 w-14 text-base-content/20" />
			<div>
				<p class="text-lg font-medium text-base-content/60">Ihr Warenkorb ist leer</p>
				<p class="mt-1 text-sm text-base-content/40">
					Fügen Sie Produkte hinzu, um hier fortzufahren.
				</p>
			</div>
			<a href="/shop" class="btn mt-2 btn-secondary">
				Produkte entdecken
				<ArrowRight class="h-4 w-4" />
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Cart items -->
			<div class="space-y-4 lg:col-span-2">
				{#each data.items as item (item.id)}
					<div class="card border border-base-200 bg-base-100 shadow-sm">
						<div class="card-body flex-row items-start gap-4 p-4">
							<div
								class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-base-200"
							>
								<Package class="h-8 w-8 text-base-content/20" />
							</div>

							<div class="min-w-0 flex-1">
								{#if item.producerName}
									<p class="mb-0.5 text-xs tracking-wide text-base-content/50 uppercase">
										{item.producerName}
									</p>
								{/if}
								<a
									href="/products/{item.id}"
									class="line-clamp-2 font-semibold transition-colors hover:text-secondary"
								>
									{item.name}
								</a>
								<p class="mt-0.5 text-sm font-bold text-secondary">{formatPrice(item.price)}</p>

								<div class="mt-3 flex items-center justify-between">
									<div class="flex items-center gap-1">
										<form method="POST" action="?/update" use:enhance>
											<input type="hidden" name="id" value={item.id} />
											<input type="hidden" name="qty" value={item.qty - 1} />
											<button
												type="submit"
												class="btn btn-circle btn-ghost btn-xs"
												disabled={item.qty <= 1}
											>
												<Minus class="h-3 w-3" />
											</button>
										</form>
										<span class="w-8 text-center text-sm font-medium">{item.qty}</span>
										<form method="POST" action="?/update" use:enhance>
											<input type="hidden" name="id" value={item.id} />
											<input type="hidden" name="qty" value={item.qty + 1} />
											<button
												type="submit"
												class="btn btn-circle btn-ghost btn-xs"
												disabled={item.qty >= 99}
											>
												<Plus class="h-3 w-3" />
											</button>
										</form>
									</div>

									<div class="flex items-center gap-3">
										<span class="text-sm font-semibold">
											{formatPrice(item.price * item.qty)}
										</span>
										<form method="POST" action="?/remove" use:enhance>
											<input type="hidden" name="id" value={item.id} />
											<button
												type="submit"
												class="btn btn-circle text-error btn-ghost btn-xs hover:bg-error/10"
											>
												<Trash2 class="h-3.5 w-3.5" />
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
						<button
							type="submit"
							class="btn gap-1.5 text-error/70 btn-ghost btn-sm hover:text-error"
						>
							<Trash2 class="h-3.5 w-3.5" />
							Warenkorb leeren
						</button>
					</form>
				</div>
			</div>

			<!-- Order summary sidebar -->
			<div class="space-y-4">
				<div class="card border border-base-200 bg-base-100 shadow-sm">
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
									<span class="font-medium text-success">Kostenlos</span>
								{:else}
									<span>{formatPrice(shippingCost)}</span>
								{/if}
							</div>
							<div class="divider my-1"></div>
							<div class="flex justify-between text-base font-semibold">
								<span>Gesamt</span>
								<span>{formatPrice(total)}</span>
							</div>
							<p class="text-xs text-base-content/40">inkl. MwSt. und Tabaksteuer</p>
						</div>
						<a href="/checkout" class="btn mt-4 w-full gap-2 btn-primary">
							<Lock class="h-4 w-4" />
							Zur Kasse
						</a>
						<div class="mt-2 flex items-center justify-center gap-2 text-xs text-base-content/40">
							<Lock class="h-3 w-3" />
							Sichere, verschlüsselte Zahlung
						</div>
					</div>
				</div>

				{#if subtotal < freeShippingThreshold}
					<div class="card border border-base-200 bg-base-100 shadow-sm">
						<div class="card-body py-4">
							<div class="flex items-start gap-3 text-sm">
								<Truck class="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
								<div class="flex-1">
									<p class="text-base-content/70">
										Noch <strong>{formatPrice(freeShippingThreshold - subtotal)}</strong> bis zum kostenlosen
										Versand.
									</p>
									<progress
										class="progress mt-2 w-full progress-secondary"
										value={subtotal}
										max={freeShippingThreshold}
									></progress>
								</div>
							</div>
						</div>
					</div>
				{:else}
					<div class="card border border-success/30 bg-base-100 shadow-sm">
						<div class="card-body py-4">
							<div class="flex items-center gap-3 text-sm">
								<Truck class="h-5 w-5 flex-shrink-0 text-success" />
								<p class="font-medium text-success">Kostenloser Versand inklusive!</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
