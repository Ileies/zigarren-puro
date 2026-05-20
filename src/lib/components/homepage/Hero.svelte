<script lang="ts">
	import { heroTagline, heroCtaButton } from '$lib/messages';
</script>

<section class="relative min-h-screen flex items-center justify-center overflow-hidden">
	<!-- Background image -->
	<div
		class="absolute inset-0 bg-cover bg-center scale-105"
		style="background-image: url('/gallery/cohiba-linea.png');"
	></div>

	<!-- Gradient overlay -->
	<div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>

	<!-- Content -->
	<div class="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
		<p class="text-sm md:text-base font-light tracking-[0.4em] uppercase text-amber-400 mb-6 opacity-90">
			Premium · Since 2024
		</p>
		<h1 class="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-none">
			Zigarren Puro
		</h1>
		<p class="text-lg md:text-xl lg:text-2xl mb-12 opacity-80 font-light tracking-wide max-w-2xl mx-auto">
			{heroTagline()}
		</p>
		<a
			href="/shop"
			class="btn btn-lg border-2 border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300 px-10 tracking-widest uppercase text-sm font-semibold"
		>
			{heroCtaButton()}
		</a>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50">
		<span class="text-xs tracking-widest uppercase">Scroll</span>
		<div class="w-px h-8 bg-white/30 animate-pulse"></div>
	</div>
</section>
