<script lang="ts">
	import Picture from '../Picture.svelte';
	
	interface BrandCardProps {
		src: string;
		alt: string;
		title: string;
		description: string;
		buttonText?: string;
		href?: string;
	}
	
	const { 
		src, 
		alt, 
		title, 
		description, 
		buttonText = "Mehr erfahren",
		href = "#"
	}: BrandCardProps = $props();
</script>

<div class="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
	<div class="relative overflow-hidden h-60">
		<Picture src={src} alt={alt} class="w-full h-full" />
		<div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
	</div>
	<div class="p-6">
		<h3 class="text-xl font-bold text-base-content mb-2">{title}</h3>
		<p class="text-base-content/70 mb-4">{description}</p>
		<a href={href} class="btn btn-secondary btn-sm">{buttonText}</a>
	</div>
</div>
