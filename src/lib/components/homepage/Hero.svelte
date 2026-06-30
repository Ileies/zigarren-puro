<script lang="ts">
	interface Props {
		bgImage?: string;
		subtitle?: string;
		tagline?: string;
		ctaText?: string;
		ctaLink?: string;
	}

	let {
		bgImage = '/gallery/cohiba-linea.png',
		subtitle = 'Premium · Since 2024',
		tagline = 'Exklusive Zigarren und Spirituosen aus aller Welt - für wahre Kenner.',
		ctaText = 'Shop besuchen',
		ctaLink = '/shop'
	}: Props = $props();
</script>

<section class="relative min-h-screen flex items-center justify-center overflow-hidden">
	<!-- Background image -->
	<div
		class="absolute inset-0 bg-cover bg-center scale-105"
		style="background-image: url('{bgImage}');"
	></div>

	<!-- Gradient overlay -->
	<div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>

	<!-- Content -->
	<div class="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
		<p class="text-sm md:text-base font-light tracking-[0.4em] uppercase text-amber-400 mb-6 opacity-90">
			{subtitle}
		</p>
		<h1 class="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-none">
			Zigarren Puro
		</h1>
		<p class="text-lg md:text-xl lg:text-2xl mb-12 opacity-80 font-light tracking-wide max-w-2xl mx-auto">
			{tagline}
		</p>
		<a
			href={ctaLink}
			class="btn btn-lg border-2 border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300 px-10 tracking-widest uppercase text-sm font-semibold"
		>
			{ctaText}
		</a>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50">
		<span class="text-xs tracking-widest uppercase">Scroll</span>
		<div class="w-px h-8 bg-white/30 animate-pulse"></div>
	</div>
</section>
