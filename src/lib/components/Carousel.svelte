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
	
	const { slides, autoplay = true, interval = 5000 }: { 
		slides: CarouselSlide[], 
		autoplay?: boolean, 
		interval?: number 
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

<div class="relative w-full max-w-6xl mx-auto">
	<div 
		class="relative w-full rounded-xl overflow-hidden shadow-2xl"
		onmouseenter={() => { isPaused = true; }}
		onmouseleave={() => { isPaused = false; }}
		role="region"
		aria-label="Image carousel"
		style="height: 430px;"
	>
		{#each slides as slide, index}
			<div 
				class="absolute inset-0 transition-opacity duration-500 {index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}"
			>
				<Picture src={slide.src} alt={slide.alt} class="w-full h-full" />
				<div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
				<div class="absolute bottom-6 left-6 text-white">
					<h3 class="text-2xl font-bold mb-2">{slide.title}</h3>
					<p class="text-lg opacity-90">{slide.description}</p>
				</div>
			</div>
		{/each}
		
		<!-- Arrow Navigation -->
		<div class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2 z-20">
			<button 
				onclick={() => currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1}
				class="btn btn-circle btn-sm bg-white/20 border-white/30 text-white hover:bg-white/30"
				aria-label="Previous slide"
			>❮</button>
			<button 
				onclick={() => currentSlide = (currentSlide + 1) % slides.length}
				class="btn btn-circle btn-sm bg-white/20 border-white/30 text-white hover:bg-white/30"
				aria-label="Next slide"
			>❯</button>
		</div>
		
		<!-- Navigation Dots - Inside Image -->
		<div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
			{#each slides as _, index}
				<button 
					onclick={() => currentSlide = index} 
					class="w-3 h-3 rounded-full transition-colors {index === currentSlide ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}"
					aria-label="Go to slide {index + 1}"
				></button>
			{/each}
		</div>
	</div>
</div>
