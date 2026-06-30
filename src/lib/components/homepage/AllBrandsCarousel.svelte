<script lang="ts">
	import BrandsCarousel from './BrandsCarousel.svelte';

	const allBrands = [
		{ name: 'A.J. Fernandez', src: '/allbrands/a-j-fernandez.png' },
		{ name: 'Alec Bradley', src: '/allbrands/alec-bradley.png' },
		{ name: 'Brick House', src: '/allbrands/brick-house.png' },
		{ name: 'Camacho', src: '/allbrands/camacho.png' },
		{ name: 'Cigar Kings', src: '/allbrands/cigarkings.png' },
		{ name: 'Cohiba', src: '/allbrands/cohiba.png' },
		{ name: 'Davidoff', src: '/allbrands/davidoff.png' },
		{ name: 'De Olifant', src: '/allbrands/de-olifant.png' },
		{ name: 'Drew Estate', src: '/allbrands/draw-estate.png' },
		{ name: 'Guantanamera', src: '/allbrands/guantanamera.png' },
		{ name: 'Handelsgold', src: '/allbrands/handelsgold.png' },
		{ name: 'Joya de Nicaragua', src: '/allbrands/joya-de-nicaragua.png' },
		{ name: 'La Aurora', src: '/allbrands/la-aurora.png' },
		{ name: 'Laura Chavin', src: '/allbrands/laura-chavin.png' },
		{ name: 'Macanudo', src: '/allbrands/macanudo.png' },
		{ name: 'Montecristo', src: '/allbrands/montecristo.png' },
		{ name: 'Montosa', src: '/allbrands/montosa.png' },
		{ name: 'Moods', src: '/allbrands/moods.png' },
		{ name: 'Paradiso', src: '/allbrands/paradiso.png' },
		{ name: 'Rocky Patel', src: '/allbrands/rocky-patel.png' },
		{ name: 'Romeo y Julieta', src: '/allbrands/romeo-y-julieta.png' },
		{ name: 'Skelton', src: '/allbrands/skelton.png' },
		{ name: 'The Griffins', src: '/allbrands/the-griffins.png' },
		{ name: 'Toscano', src: '/allbrands/toscano.png' },
		{ name: 'Villa Zamorano', src: '/allbrands/villa-zamorano.png' },
		{ name: 'Villiger', src: '/allbrands/villiger.png' },
		{ name: 'Zino', src: '/allbrands/zino.png' }
	];
</script>

<!-- All Brands Carousel Section -->
<section class="bg-base-200 py-12">
	<div class="container mx-auto px-6">
		<div class="mb-8 text-center">
			<h2 class="mb-3 text-2xl font-bold text-base-content lg:text-3xl">
				Weitere <span class="text-secondary">Premium Marken</span>
			</h2>
			<p class="text-base text-base-content/70">
				Entdecken Sie unser komplettes Sortiment weltbekannter Zigarrenmarken
			</p>
		</div>

		<BrandsCarousel brands={allBrands} />
	</div>
</section>
