<script lang="ts">
	const { src, alt, w, h }: { src: string, alt: string, w: number, h: number } = $props();
</script>

<div 
	class="relative overflow-hidden rounded-md" 
	style="width: {w}px; height: {h}px;"
>
	<img 
		{src} 
		{alt} 
		loading="lazy" 
		class="absolute inset-0 w-full h-full object-cover"
	/>
</div>
