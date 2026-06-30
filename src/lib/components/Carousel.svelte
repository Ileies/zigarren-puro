<script lang="ts">
	import Picture from './Picture.svelte';
	import { onMount, onDestroy } from 'svelte';

	interface CarouselSlide {
		id: string;
		src: string;
		alt: string;
		title: string;
		description: string;
	}

	const {
		slides,
		autoplay = true,
		interval = 5000
	}: {
		slides: CarouselSlide[];
		autoplay?: boolean;
		interval?: number;
	} = $props();

	let currentSlide = $state(0);
	let autoSlideInterval: NodeJS.Timeout;
	let isPaused = $state(false);

	function autoNextSlide() {
		if (!isPaused && autoplay) {
			currentSlide = (currentSlide + 1) % slides.length;
		}
	}

	onMount(() => {
		if (autoplay) {
			autoSlideInterval = setInterval(autoNextSlide, interval);
		}
	});

	onDestroy(() => {
		if (autoSlideInterval) {
			clearInterval(autoSlideInterval);
		}
	});
</script>

<div class="relative mx-auto w-full max-w-6xl">
	<div
		class="relative w-full overflow-hidden rounded-xl shadow-2xl"
		onmouseenter={() => {
			isPaused = true;
		}}
		onmouseleave={() => {
			isPaused = false;
		}}
		role="region"
		aria-label="Image carousel"
		style="height: 430px;"
	>
		{#each slides as slide, index}
			<div
				class="absolute inset-0 transition-opacity duration-500 {index === currentSlide
					? 'z-10 opacity-100'
					: 'z-0 opacity-0'}"
			>
				<Picture src={slide.src} alt={slide.alt} class="h-full w-full" />
				<div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
				<div class="absolute bottom-6 left-6 text-white">
					<h3 class="mb-2 text-2xl font-bold">{slide.title}</h3>
					<p class="text-lg opacity-90">{slide.description}</p>
				</div>
			</div>
		{/each}

		<!-- Arrow Navigation -->
		<div
			class="absolute top-1/2 right-5 left-5 z-20 flex -translate-y-1/2 transform justify-between"
		>
			<button
				onclick={() => (currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1)}
				class="btn btn-circle border-white/30 bg-white/20 text-white btn-sm hover:bg-white/30"
				aria-label="Previous slide">❮</button
			>
			<button
				onclick={() => (currentSlide = (currentSlide + 1) % slides.length)}
				class="btn btn-circle border-white/30 bg-white/20 text-white btn-sm hover:bg-white/30"
				aria-label="Next slide">❯</button
			>
		</div>

		<!-- Navigation Dots - Inside Image -->
		<div class="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 transform gap-2">
			{#each slides as _, index}
				<button
					onclick={() => (currentSlide = index)}
					class="h-3 w-3 rounded-full transition-colors {index === currentSlide
						? 'bg-white'
						: 'bg-white/40 hover:bg-white/60'}"
					aria-label="Go to slide {index + 1}"
				></button>
			{/each}
		</div>
	</div>
</div>
