<script lang="ts">
	import Picture from '../Picture.svelte';
</script>

<!-- Spirituosen Section -->
<section class="bg-base-100 py-12 lg:py-16">
	<div class="container mx-auto px-6">
		<div class="mx-auto mb-8 max-w-6xl text-left">
			<h2 class="text-2xl font-bold text-base-content lg:text-3xl">
				Die höfliche Art, noch zu bleiben.
			</h2>
		</div>

		<div class="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4">
			{#each ['Whiskey', 'Rum', 'Gin', 'Cognac'] as spirit}
				<a href={`/search?category=${spirit.toLowerCase()}`} class="group block">
					<div
						class="relative h-48 overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 shadow-md transition-all duration-300 hover:shadow-xl"
					>
						<Picture
							src={`/categories/${spirit.toLowerCase()}.png`}
							alt={spirit}
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
						/>

						<!-- Spirit Name Overlay -->
						<div
							class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4"
						>
							<h3 class="text-lg font-bold text-white">
								{spirit}
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
