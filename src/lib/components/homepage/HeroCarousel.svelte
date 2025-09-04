<script lang="ts">
	import Carousel from '../Carousel.svelte';
	
	const carouselSlides = [
		{
			id: 'slide1',
			src: '/gallery/cohiba-linea.png',
			alt: 'Cohiba Linea Premium Zigarren',
			title: 'Cohiba Linea',
			description: 'Kubanische Exzellenz in Perfektion'
		},
		{
			id: 'slide2',
			src: '/gallery/flor-de-copan.png',
			alt: 'Flor de Copán Premium Zigarren',
			title: 'Flor de Copán',
			description: 'Honduranische Tradition mit komplexen Aromen'
		},
		{
			id: 'slide3',
			src: '/gallery/parcero-dominicano.png',
			alt: 'Parcero Dominicano Premium Zigarren',
			title: 'Parcero Dominicano',
			description: 'Dominikanische Handwerkskunst'
		},
		{
			id: 'slide4',
			src: '/gallery/vegafina-minuto.png',
			alt: 'Vegafina Minuto Premium Zigarren',
			title: 'Vegafina Minuto',
			description: 'Kompakte Eleganz für den perfekten Moment'
		}
	];
</script>

<!-- Carousel Section -->
<section class="py-8 bg-base-200/50">
	<div class="container mx-auto px-6">
		<Carousel slides={carouselSlides} />
	</div>
</section>
