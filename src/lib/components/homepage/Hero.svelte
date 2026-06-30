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

<section class="relative flex min-h-screen items-center justify-center overflow-hidden">
	<!-- Background image -->
	<div
		class="absolute inset-0 scale-105 bg-cover bg-center"
		style="background-image: url('{bgImage}');"
	></div>

	<!-- Gradient overlay -->
	<div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>

	<!-- Content -->
	<div class="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
		<p
			class="mb-6 text-sm font-light tracking-[0.4em] text-amber-400 uppercase opacity-90 md:text-base"
		>
			{subtitle}
		</p>
		<h1 class="mb-6 text-5xl leading-none font-bold tracking-tight md:text-7xl lg:text-8xl">
			Zigarren Puro
		</h1>
		<p
			class="mx-auto mb-12 max-w-2xl text-lg font-light tracking-wide opacity-80 md:text-xl lg:text-2xl"
		>
			{tagline}
		</p>
		<a
			href={ctaLink}
			class="btn border-2 border-white bg-transparent px-10 text-sm font-semibold tracking-widest text-white uppercase transition-all duration-300 btn-lg hover:bg-white hover:text-black"
		>
			{ctaText}
		</a>
	</div>

	<!-- Scroll indicator -->
	<div
		class="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/50"
	>
		<span class="text-xs tracking-widest uppercase">Scroll</span>
		<div class="h-8 w-px animate-pulse bg-white/30"></div>
	</div>
</section>
