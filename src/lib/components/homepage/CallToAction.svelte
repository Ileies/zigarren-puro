<script lang="ts">
	import { onMount } from 'svelte';

	let sectionEl: HTMLElement;
	const prefix = 'Bereit für ';
	let dynamicText = 'den Umzug in den Humidor';
	const finalText = 'das perfekte Zigarrenerlebnis';
	let hasAnimated = false;

	async function animate() {
		if (hasAnimated) return;
		hasAnimated = true;

		// Delete the text
		await new Promise<void>((resolve) => {
			const intervalMs = 40;
			const timer = setInterval(() => {
				if (dynamicText.length === 0) {
					clearInterval(timer);
					resolve();
				} else {
					dynamicText = dynamicText.slice(0, -1);
				}
			}, intervalMs);
		});

		// Type the final text
		await new Promise<void>((resolve) => {
			const intervalMs = 60;
			let index = 0;
			const timer = setInterval(() => {
				if (index >= finalText.length) {
					clearInterval(timer);
					resolve();
				} else {
					dynamicText += finalText[index];
					index += 1;
				}
			}, intervalMs);
		});
	}

	onMount(() => {
		if (!sectionEl) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setTimeout(animate, 1000);
						observer.disconnect();
						break;
					}
				}
			},
			{ threshold: 0.25 }
		);
		observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section
	bind:this={sectionEl}
	class="bg-gradient-to-r from-secondary to-accent py-12 text-white lg:py-16"
>
	<div class="container mx-auto px-6 text-center">
		<h2 class="mb-6 text-3xl font-bold lg:text-4xl">
			{prefix}<span aria-live="polite">{dynamicText}</span><span>?</span>
		</h2>
		<p class="mx-auto mb-8 max-w-2xl text-xl opacity-90">
			Lassen Sie sich von unseren Experten beraten und finden Sie Ihre perfekte Zigarre
		</p>
		<div class="flex flex-col justify-center gap-4 sm:flex-row">
			<button class="btn px-8 text-lg btn-lg btn-primary"> Jetzt Shop besuchen </button>
			<button
				class="btn border-white px-8 text-lg text-white btn-outline btn-lg hover:bg-white hover:text-secondary"
			>
				Katalog anfordern
			</button>
		</div>
	</div>
</section>
