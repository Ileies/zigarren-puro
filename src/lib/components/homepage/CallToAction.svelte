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

<section bind:this={sectionEl} class="py-12 lg:py-16 bg-gradient-to-r from-secondary to-accent text-white">
	<div class="container mx-auto px-6 text-center">
		<h2 class="text-3xl lg:text-4xl font-bold mb-6">
			{prefix}<span aria-live="polite">{dynamicText}</span><span>?</span>
		</h2>
		<p class="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
			Lassen Sie sich von unseren Experten beraten und finden Sie Ihre perfekte Zigarre
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<button class="btn btn-primary btn-lg text-lg px-8">
				Jetzt Shop besuchen
			</button>
			<button class="btn btn-outline btn-lg text-lg px-8 text-white border-white hover:bg-white hover:text-secondary">
				Katalog anfordern
			</button>
		</div>
	</div>
</section>
