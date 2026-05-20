<script lang="ts">
	import { Cigarette, Wine } from '@lucide/svelte';
</script>

<section class="py-12 lg:py-16 bg-base-200">
	<div class="container mx-auto px-6">
		<div class="flex w-full flex-col lg:flex-row max-w-6xl mx-auto gap-6 lg:gap-0">
			<!-- Rum Tasting Image (Left) -->
			<a class="relative group cursor-pointer grow" href="/tastings">
				<div
					class="relative overflow-hidden h-80 bg-gradient-to-br from-base-200 to-base-300 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700">
					<img
						alt="Rum Verkostung"
						class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
						src="/gallery/rum-tasting.jpg"
					/>
					<!-- Gradient Overlay -->
					<div
						class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<!-- Title Overlay -->
					<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
						<h3 class="text-white font-bold text-lg flex items-center gap-2">
							<Wine class="w-5 h-5 text-amber-400" />
							Rum Verkostungen
						</h3>
					</div>
					<!-- Hover Overlay -->
					<div
						class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
				</div>
			</a>

			<!-- Custom Divider -->
			<div class="hidden lg:flex items-center justify-center px-6">
				<div class="w-px h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
			</div>
			<div class="lg:hidden flex justify-center py-4">
				<div class="h-px w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
			</div>

			<!-- Cigar Tasting Image (Right) -->
			<a class="relative group cursor-pointer grow" href="/tastings">
				<div
					class="relative overflow-hidden h-80 bg-gradient-to-br from-base-200 to-base-300 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700">
					<img
						alt="Zigarren Verkostung"
						class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
						src="/gallery/cigar-tasting.jpg"
					/>
					<!-- Gradient Overlay -->
					<div
						class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<!-- Title Overlay -->
					<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
						<h3 class="text-white font-bold text-lg flex items-center gap-2">
							<Cigarette class="w-5 h-5 text-amber-400" />
							Zigarren Verkostungen
						</h3>
					</div>
					<!-- Hover Overlay -->
					<div
						class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
				</div>
			</a>
		</div>
	</div>
</section>