<script lang="ts">
	const { src, alt, class: className = "" }: { src: string, alt: string, class?: string } = $props();
</script>

<div class="relative overflow-hidden rounded-md {className}">
	<img 
		{src} 
		{alt} 
		loading="lazy" 
		class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
	/>
</div>
