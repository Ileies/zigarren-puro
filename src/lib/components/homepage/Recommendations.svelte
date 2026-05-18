<script lang="ts">
	import Picture from '../Picture.svelte';
	
	// Aktuelle Produkt-Empfehlungen
	const recommendations = [
		{
			id: 1,
			name: "Cohiba Siglo VI",
			brand: "Cohiba",
			description: "Vollmundige kubanische Premium-Zigarre mit komplexen Aromen von Leder, Kaffee und Gewürzen.",
			price: "89,90",
			originalPrice: "99,90",
			image: "/gallery/cohiba-linea.png",
			badge: "Bestseller",
			href: "/search?q=Cohiba Siglo VI"
		},
		{
			id: 2,
			name: "Flor de Copán Robusto",
			brand: "Flor de Copán",
			description: "Honduranische Premium-Zigarre mit ausgewogener Würze und natürlicher Süße.",
			price: "12,50",
			originalPrice: null,
			image: "/gallery/flor-de-copan.png",
			badge: "Neu",
			href: "/search?q=Flor de Copán"
		},
		{
			id: 3,
			name: "Vegafina Minuto",
			brand: "Vegafina",
			description: "Dominikanische Zigarre mit mildem Charakter, perfekt für Einsteiger und Kenner.",
			price: "8,90",
			originalPrice: "10,90",
			image: "/gallery/vegafina-minuto.png",
			badge: "Sale",
			href: "/search?q=Vegafina"
		},
		{
			id: 4,
			name: "Padrón 1964 Anniversary",
			brand: "Padrón",
			description: "Nicaraguanische Luxus-Zigarre mit intensiven Aromen von Schokolade und Nüssen.",
			price: "24,90",
			originalPrice: null,
			image: "/static/padron-1964.png",
			badge: "Premium",
			href: "/search?q=Padrón"
		}
	];
</script>

<!-- Aktuelle Empfehlungen Section -->
<section class="py-12 lg:py-16 bg-base-200">
	<div class="container mx-auto px-6">
		<div class="text-center mb-12">
			<h2 class="text-3xl lg:text-4xl font-bold text-base-content mb-4">
				Empfohlen von Menschen mit Zeit morgen
			</h2>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
			{#each recommendations as product}
				<a href={product.href} class="group block">
					<div class="relative overflow-hidden h-72 bg-gradient-to-br from-base-200 to-base-300 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
						<Picture 
							src={product.image} 
							alt={product.name} 
							class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
						/>
						
						<!-- Badge -->
						{#if product.badge}
							<div class="absolute top-3 left-3">
								<span class="badge badge-sm font-medium
									{product.badge === 'Sale' ? 'badge-error text-white' : 
									 product.badge === 'Neu' ? 'badge-success text-white' : 
									 product.badge === 'Bestseller' ? 'badge-warning text-white' : 
									 'badge-primary text-white'}">
									{product.badge}
								</span>
							</div>
						{/if}
						
						<!-- Product Name Overlay -->
						<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
							<h3 class="text-white font-bold text-lg">
								{product.name}
							</h3>
						</div>
						
						<!-- Hover Overlay -->
						<div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

