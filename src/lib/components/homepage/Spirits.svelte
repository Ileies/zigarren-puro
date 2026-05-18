<script lang="ts">
	import Picture from '../Picture.svelte';
</script>

<!-- Spirituosen Section -->
<section class="py-12 lg:py-16 bg-base-100">
	<div class="container mx-auto px-6">
		<div class="text-left mb-8 max-w-6xl mx-auto">
			<h2 class="text-2xl lg:text-3xl font-bold text-base-content">
				Die höfliche Art, noch zu bleiben.
			</h2>
		</div>
		
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
			{#each ['Whiskey', 'Rum', 'Gin', 'Cognac'] as spirit}
				<a href={`/search?category=${spirit.toLowerCase()}`} class="group block">
					<div class="relative overflow-hidden h-48 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
						<Picture
							src={`/categories/${spirit.toLowerCase()}.png`} 
							alt={spirit} 
							class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
						/>
												
						<!-- Spirit Name Overlay -->
						<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
							<h3 class="text-white font-bold text-lg">
								{spirit}
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
