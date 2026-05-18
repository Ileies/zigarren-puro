<script lang="ts">
	import { ShoppingCart, ArrowRight, Lock, Truck } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Warenkorb - Zigarren Puro</title>
	<meta name="description" content="Ihr Warenkorb bei Zigarren Puro" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-5xl">
	<h1 class="text-3xl font-bold mb-8">Warenkorb</h1>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Cart items area -->
		<div class="lg:col-span-2">
			<!-- Empty state -->
			<div class="flex flex-col items-center justify-center py-20 text-center gap-4 bg-base-100 rounded-2xl border border-base-200">
				<ShoppingCart class="w-14 h-14 text-base-content/20" />
				<div>
					<p class="text-lg font-medium text-base-content/60">Ihr Warenkorb ist leer</p>
					<p class="text-sm text-base-content/40 mt-1">Fügen Sie Produkte hinzu, um hier fortzufahren.</p>
				</div>
				<a href="/search" class="btn btn-secondary mt-2">
					Produkte entdecken
					<ArrowRight class="w-4 h-4" />
				</a>
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
							<span>–</span>
						</div>
						<div class="flex justify-between text-base-content/60">
							<span>Versand</span>
							<span>wird berechnet</span>
						</div>
						<div class="divider my-1"></div>
						<div class="flex justify-between font-semibold text-base">
							<span>Gesamt</span>
							<span>–</span>
						</div>
						<p class="text-xs text-base-content/40">inkl. MwSt. und Tabaksteuer</p>
					</div>
					<button class="btn btn-primary w-full mt-4" disabled>
						<Lock class="w-4 h-4" />
						Zur Kasse
					</button>
					<div class="flex items-center gap-2 text-xs text-base-content/40 justify-center mt-2">
						<Lock class="w-3 h-3" />
						Sichere, verschlüsselte Zahlung
					</div>
				</div>
			</div>

			<!-- Free shipping hint -->
			<div class="card bg-base-100 border border-base-200 shadow-sm">
				<div class="card-body py-4">
					<div class="flex items-center gap-3 text-sm">
						<Truck class="w-5 h-5 text-secondary flex-shrink-0" />
						<p class="text-base-content/70">Kostenloser Versand ab <strong>150 €</strong> Bestellwert innerhalb Deutschlands.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
