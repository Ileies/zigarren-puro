<script lang="ts">
	import Picture from '../Picture.svelte';
	import { onMount, onDestroy } from 'svelte';

	interface Brand {
		name: string;
		src: string;
	}

	const {
		brands,
		autoplay = true,
		interval = 3000
	}: {
		brands: Brand[];
		autoplay?: boolean;
		interval?: number;
	} = $props();

	let currentIndex = $state(0);
	let autoSlideInterval: NodeJS.Timeout;
	let isPaused = $state(false);

	// Show 5 brands at once on large screens, 3 on medium, 2 on small
	const brandsPerView = 5;
	const maxIndex = $derived(Math.max(0, brands.length - brandsPerView));

	function autoNext() {
		if (!isPaused && autoplay) {
			currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
		}
	}

	function next() {
		currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
	}

	function prev() {
		currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
	}

	onMount(() => {
		if (autoplay) {
			autoSlideInterval = setInterval(autoNext, interval);
		}
	});

	onDestroy(() => {
		if (autoSlideInterval) {
			clearInterval(autoSlideInterval);
		}
	});
</script>

<div
	class="relative w-full"
	onmouseenter={() => {
		isPaused = true;
	}}
	onmouseleave={() => {
		isPaused = false;
	}}
	role="region"
	aria-label="Brand logos carousel"
>
	<!-- Carousel Container -->
	<div class="overflow-hidden">
		<div
			class="flex transition-transform duration-500 ease-in-out"
			style="transform: translateX(-{currentIndex * (100 / brandsPerView)}%)"
		>
			{#each brands as brand}
				<div class="flex-shrink-0 px-4" style="width: {100 / brandsPerView}%">
					<a
						href="/search?q={encodeURIComponent(brand.name)}"
						class="group block flex h-32 cursor-pointer items-center justify-center rounded-lg bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg"
						title="Suche nach {brand.name}"
					>
						<Picture
							src={brand.src}
							alt={brand.name}
							class="h-24 w-24 grayscale transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0"
						/>
					</a>
				</div>
			{/each}
		</div>
	</div>

	<!-- Navigation Arrows -->
	<button
		onclick={prev}
		class="btn absolute top-1/2 left-2 btn-circle -translate-y-1/2 transform border-0 bg-white/80 shadow-md btn-sm hover:bg-white"
		aria-label="Previous brands">❮</button
	>

	<button
		onclick={next}
		class="btn absolute top-1/2 right-2 btn-circle -translate-y-1/2 transform border-0 bg-white/80 shadow-md btn-sm hover:bg-white"
		aria-label="Next brands">❯</button
	>
</div>
