<script lang="ts">
	import Picture from '#lib/components/Picture.svelte';
	import { onMount } from 'svelte';

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

	const brandsPerView = 5;
	const canSlide = $derived(brands.length > brandsPerView);
	const cloneCount = $derived(canSlide ? brandsPerView : 0);
	const slides = $derived(
		canSlide
			? [...brands.slice(-brandsPerView), ...brands, ...brands.slice(0, brandsPerView)]
			: brands
	);
	let currentIndex = $state(brandsPerView);
	let isPaused = $state(false);
	let isResetting = $state(false);
	let resetFrame = 0;

	function move(direction: number) {
		if (!canSlide) return;

		const nextIndex = currentIndex + direction;
		if (isResetting || nextIndex < 0 || nextIndex > brands.length + cloneCount) {
			resetPosition(nextIndex);
		} else {
			currentIndex = nextIndex;
		}
	}

	function resetPosition(index: number) {
		// The cloned logos match this position, so the reset is invisible.
		isResetting = true;
		currentIndex =
			cloneCount + ((((index - cloneCount) % brands.length) + brands.length) % brands.length);
		cancelAnimationFrame(resetFrame);
		resetFrame = requestAnimationFrame(() => {
			resetFrame = requestAnimationFrame(() => {
				isResetting = false;
			});
		});
	}

	function next() {
		move(1);
	}

	function prev() {
		move(-1);
	}

	function finishTransition(event: TransitionEvent) {
		if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;

		if (currentIndex >= brands.length + cloneCount || currentIndex < cloneCount) {
			resetPosition(currentIndex);
		}
	}

	onMount(() => {
		const autoSlideInterval = setInterval(() => {
			if (!isPaused && autoplay) next();
		}, interval);

		return () => {
			clearInterval(autoSlideInterval);
			cancelAnimationFrame(resetFrame);
		};
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
			class="flex duration-500 ease-in-out"
			class:transition-transform={!isResetting}
			class:transition-none={isResetting}
			style="transform: translateX(-{canSlide ? currentIndex * (100 / brandsPerView) : 0}%)"
			ontransitionend={finishTransition}
		>
			{#each slides as brand, index (`${index}-${brand.name}`)}
				{@const isClone = index < cloneCount || index >= cloneCount + brands.length}
				<div
					class="flex-shrink-0 px-4"
					style="width: {100 / brandsPerView}%"
					aria-hidden={isClone ? true : undefined}
				>
					<a
						href="/search?q={encodeURIComponent(brand.name)}"
						tabindex={isClone ? -1 : undefined}
						class="group block flex h-32 cursor-pointer items-center justify-center rounded-lg bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg"
						title="Suche nach {brand.name}"
					>
						<Picture
							src={brand.src}
							alt={brand.name}
							class="h-24 w-24 transition-all duration-300 group-hover:scale-110"
						/>
					</a>
				</div>
			{/each}
		</div>
	</div>

	<!-- Navigation Arrows -->
	<button
		disabled={!canSlide}
		onclick={prev}
		class="btn absolute top-1/2 left-2 btn-circle -translate-y-1/2 transform border-0 bg-white/80 shadow-md btn-sm hover:bg-white"
		aria-label="Previous brands">❮</button
	>

	<button
		disabled={!canSlide}
		onclick={next}
		class="btn absolute top-1/2 right-2 btn-circle -translate-y-1/2 transform border-0 bg-white/80 shadow-md btn-sm hover:bg-white"
		aria-label="Next brands">❯</button
	>
</div>
