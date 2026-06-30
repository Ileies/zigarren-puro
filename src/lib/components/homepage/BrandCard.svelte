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
		buttonText = 'Mehr erfahren',
		href = '#'
	}: BrandCardProps = $props();
</script>

<div
	class="group overflow-hidden rounded-xl bg-base-100 shadow-lg transition-all duration-300 hover:shadow-2xl"
>
	<div class="relative h-64 overflow-hidden">
		<Picture
			{src}
			{alt}
			class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
		/>
		<div
			class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		></div>
	</div>
	<div class="p-6">
		<h3 class="mb-2 text-xl font-bold text-base-content">{title}</h3>
		<p class="mb-4 text-base-content/70">{description}</p>
		<a {href} class="btn btn-sm btn-secondary">{buttonText}</a>
	</div>
</div>
