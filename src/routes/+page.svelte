<script lang="ts">
	import Hero from '$lib/components/homepage/Hero.svelte';
	import HeroCarousel from '$lib/components/homepage/HeroCarousel.svelte';
	import FeaturedBrands from '$lib/components/homepage/FeaturedBrands.svelte';
	import AllBrandsCarousel from '$lib/components/homepage/AllBrandsCarousel.svelte';
	import CallToAction from '$lib/components/homepage/CallToAction.svelte';
	import Recommendations from '$lib/components/homepage/Recommendations.svelte';
	import About from '$lib/components/homepage/About.svelte';
	import Tasting from '$lib/components/homepage/Tasting.svelte';
	import Spirits from '$lib/components/homepage/Spirits.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Zigarren Puro - Premium Zigarren & Tabakwaren</title>
	<meta name="description" content="Entdecken Sie unsere exklusive Auswahl an Premium-Zigarren von weltbekannten Marken." />
</svelte:head>

<Hero
	bgImage={data.content.hero_bg_image}
	subtitle={data.content.hero_subtitle}
	tagline={data.content.hero_tagline}
	ctaText={data.content.hero_cta_text}
	ctaLink={data.content.hero_cta_link}
/>
<HeroCarousel />
<FeaturedBrands />
<AllBrandsCarousel />
<CallToAction />
<Recommendations />
<About />
<Tasting />
<Spirits />
