<script lang="ts">
	import HeroCarousel from '$lib/components/homepage/HeroCarousel.svelte';
	import FeaturedBrands from '$lib/components/homepage/FeaturedBrands.svelte';
	import AllBrandsCarousel from '$lib/components/homepage/AllBrandsCarousel.svelte';
	import CallToAction from '$lib/components/homepage/CallToAction.svelte';
	import Recommendations from '$lib/components/homepage/Recommendations.svelte';
	import About from '$lib/components/homepage/About.svelte';
	import Tasting from '$lib/components/homepage/Tasting.svelte';
	import Spirits from '$lib/components/homepage/Spirits.svelte';
</script>

<svelte:head>
	<title>Zigarren Puro - Premium Zigarren & Tabakwaren</title>
	<meta name="description" content="Entdecken Sie unsere exklusive Auswahl an Premium-Zigarren von weltbekannten Marken." />
</svelte:head>

<HeroCarousel />
<FeaturedBrands />
<AllBrandsCarousel />
<CallToAction />
<Recommendations />
<About />
<Tasting />
<Spirits />
