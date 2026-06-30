<script lang="ts">
	import Picture from '../Picture.svelte';

	// Aktuelle Produkt-Empfehlungen
	const recommendations = [
		{
			id: 1,
			name: 'Cohiba Siglo VI',
			brand: 'Cohiba',
			description:
				'Vollmundige kubanische Premium-Zigarre mit komplexen Aromen von Leder, Kaffee und Gewürzen.',
			price: '89,90',
			originalPrice: '99,90',
			image: '/gallery/cohiba-linea.png',
			badge: 'Bestseller',
			href: '/search?q=Cohiba Siglo VI'
		},
		{
			id: 2,
			name: 'Flor de Copán Robusto',
			brand: 'Flor de Copán',
			description: 'Honduranische Premium-Zigarre mit ausgewogener Würze und natürlicher Süße.',
			price: '12,50',
			originalPrice: null,
			image: '/gallery/flor-de-copan.png',
			badge: 'Neu',
			href: '/search?q=Flor de Copán'
		},
		{
			id: 3,
			name: 'Vegafina Minuto',
			brand: 'Vegafina',
			description:
				'Dominikanische Zigarre mit mildem Charakter, perfekt für Einsteiger und Kenner.',
			price: '8,90',
			originalPrice: '10,90',
			image: '/gallery/vegafina-minuto.png',
			badge: 'Sale',
			href: '/search?q=Vegafina'
		},
		{
			id: 4,
			name: 'Padrón 1964 Anniversary',
			brand: 'Padrón',
			description: 'Nicaraguanische Luxus-Zigarre mit intensiven Aromen von Schokolade und Nüssen.',
			price: '24,90',
			originalPrice: null,
			image: '/static/padron-1964.png',
			badge: 'Premium',
			href: '/search?q=Padrón'
		}
	];
</script>

<!-- Aktuelle Empfehlungen Section -->
<section class="bg-base-200 py-12 lg:py-16">
	<div class="container mx-auto px-6">
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-3xl font-bold text-base-content lg:text-4xl">
				Empfohlen von Menschen mit Zeit morgen
			</h2>
		</div>

		<div class="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
			{#each recommendations as product}
				<a href={product.href} class="group block">
					<div
						class="relative h-72 overflow-hidden rounded-2xl bg-gradient-to-br from-base-200 to-base-300 shadow-lg transition-all duration-500 hover:shadow-2xl"
					>
						<Picture
							src={product.image}
							alt={product.name}
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
						/>

						<!-- Badge -->
						{#if product.badge}
							<div class="absolute top-3 left-3">
								<span
									class="badge badge-sm font-medium
									{product.badge === 'Sale'
										? 'text-white badge-error'
										: product.badge === 'Neu'
											? 'text-white badge-success'
											: product.badge === 'Bestseller'
												? 'text-white badge-warning'
												: 'text-white badge-primary'}"
								>
									{product.badge}
								</span>
							</div>
						{/if}

						<!-- Product Name Overlay -->
						<div
							class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4"
						>
							<h3 class="text-lg font-bold text-white">
								{product.name}
							</h3>
						</div>

						<!-- Hover Overlay -->
						<div
							class="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						></div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>
