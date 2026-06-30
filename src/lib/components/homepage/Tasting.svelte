<script lang="ts">
	import { Cigarette, Wine } from '@lucide/svelte';
</script>

<section class="bg-base-200 py-12 lg:py-16">
	<div class="container mx-auto px-6">
		<div class="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:gap-0">
			<!-- Rum Tasting Image (Left) -->
			<a class="group relative grow cursor-pointer" href="/tastings">
				<div
					class="relative h-80 overflow-hidden rounded-3xl bg-gradient-to-br from-base-200 to-base-300 shadow-xl transition-all duration-700 hover:shadow-2xl"
				>
					<img
						alt="Rum Verkostung"
						class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
						src="/gallery/rum-tasting.jpg"
					/>
					<!-- Gradient Overlay -->
					<div
						class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					></div>
					<!-- Title Overlay -->
					<div
						class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4"
					>
						<h3 class="flex items-center gap-2 text-lg font-bold text-white">
							<Wine class="h-5 w-5 text-amber-400" />
							Rum Verkostungen
						</h3>
					</div>
					<!-- Hover Overlay -->
					<div
						class="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					></div>
				</div>
			</a>

			<!-- Custom Divider -->
			<div class="hidden items-center justify-center px-6 lg:flex">
				<div
					class="h-32 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"
				></div>
			</div>
			<div class="flex justify-center py-4 lg:hidden">
				<div
					class="h-px w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
				></div>
			</div>

			<!-- Cigar Tasting Image (Right) -->
			<a class="group relative grow cursor-pointer" href="/tastings">
				<div
					class="relative h-80 overflow-hidden rounded-3xl bg-gradient-to-br from-base-200 to-base-300 shadow-xl transition-all duration-700 hover:shadow-2xl"
				>
					<img
						alt="Zigarren Verkostung"
						class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
						src="/gallery/cigar-tasting.jpg"
					/>
					<!-- Gradient Overlay -->
					<div
						class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					></div>
					<!-- Title Overlay -->
					<div
						class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4"
					>
						<h3 class="flex items-center gap-2 text-lg font-bold text-white">
							<Cigarette class="h-5 w-5 text-amber-400" />
							Zigarren Verkostungen
						</h3>
					</div>
					<!-- Hover Overlay -->
					<div
						class="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					></div>
				</div>
			</a>
		</div>
	</div>
</section>
