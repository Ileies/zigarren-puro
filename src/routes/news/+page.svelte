<script lang="ts">
	import { Calendar, Tag, ArrowRight, Mail } from '@lucide/svelte';

	const articles = [
		{
			date: '2025-10-14',
			category: 'Neuheiten',
			title: 'Vegafina Herbst-Edition 2025 eingetroffen',
			excerpt:
				'Die limitierte Herbst-Edition von Vegafina ist ab sofort bei uns erhältlich. Mit einem besonders ausgewogenen Connecticut-Deckblatt und extra langer Reifezeit überzeugt sie mit cremiger Komplexität.',
			image: '/brands/vegafina.png',
			imageAlt: 'Vegafina Herbst-Edition 2025'
		},
		{
			date: '2025-09-28',
			category: 'Veranstaltungen',
			title: 'Davidoff Tasting Abend – Ein voller Erfolg',
			excerpt:
				'Unser exklusiver Davidoff Tasting Abend im September zog über 30 Gäste an. Zigarrenexperte Markus Held führte durch drei Jahrgänge der Davidoff Millenium Edition – eine unvergessliche Erfahrung.',
			image: '/brands/davidoff.png',
			imageAlt: 'Davidoff Tasting Abend Köln'
		},
		{
			date: '2025-09-05',
			category: 'Hintergrund',
			title: 'Flor de Copán: Tradition aus Honduras',
			excerpt:
				'Die Manufaktur in Santa Rosa de Copán gehört zu den letzten wirklich traditionellen Zigarrenherstellern Lateinamerikas. Wir haben uns die Geschichte dieser außergewöhnlichen Marke genauer angesehen.',
			image: '/brands/flor-de-copan.png',
			imageAlt: 'Flor de Copán Honduras'
		},
		{
			date: '2025-08-20',
			category: 'Angebote',
			title: 'Herbst-Rabattaktion: 15 % auf ausgewähltes Zubehör',
			excerpt:
				'Vom 1. bis 31. Oktober gewähren wir 15 % Rabatt auf alle Humidore, Zigarrenschneider und Ascher in unserem Sortiment. Jetzt ist der perfekte Zeitpunkt, Ihre Ausstattung zu vervollständigen.',
			image: null,
			imageAlt: ''
		},
		{
			date: '2025-08-01',
			category: 'Neuheiten',
			title: 'Henri Clay jetzt im Sortiment',
			excerpt:
				'Wir freuen uns, die kubanisch inspirierte Marke Henri Clay in unser Sortiment aufgenommen zu haben. Die aromatischen Zigarren aus Honduras überzeugen mit mittelkräftigem Charakter und klassischer Eleganz.',
			image: '/brands/henri-clay.png',
			imageAlt: 'Henri Clay Zigarren'
		},
		{
			date: '2025-07-12',
			category: 'Wissen',
			title: 'Die richtige Lagerung von Zigarren',
			excerpt:
				'Ob Humidor, Reise-Etui oder Ziploc-Beutel mit Humidifizier – wir erklären, wie Sie Ihre Zigarren optimal lagern und das Aroma dauerhaft erhalten. Mit praktischen Tipps für Einsteiger und Fortgeschrittene.',
			image: null,
			imageAlt: ''
		}
	];

	const categories = ['Alle', 'Neuheiten', 'Veranstaltungen', 'Hintergrund', 'Angebote', 'Wissen'];
	let activeCategory = $state('Alle');

	const filtered = $derived(
		activeCategory === 'Alle' ? articles : articles.filter((a) => a.category === activeCategory)
	);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>News & Updates - Zigarren Puro</title>
	<meta
		name="description"
		content="Aktuelle Neuigkeiten, Produktneuheiten und Veranstaltungen von Zigarren Puro."
	/>
</svelte:head>

<div class="container mx-auto max-w-5xl px-4 py-8">
	<div class="mb-10 text-center">
		<h1 class="mb-4 text-4xl font-bold text-primary">News & Updates</h1>
		<p class="text-lg text-base-content/70">
			Neuigkeiten, Produktneuheiten und Wissenswertes rund um die Welt der Zigarre
		</p>
	</div>

	<!-- Category Filter -->
	<div class="mb-8 flex flex-wrap justify-center gap-2">
		{#each categories as cat (cat)}
			<button
				class="btn btn-sm {activeCategory === cat
					? 'btn-secondary'
					: 'border border-base-300 btn-ghost'}"
				onclick={() => (activeCategory = cat)}
			>
				{cat}
			</button>
		{/each}
	</div>

	<!-- Articles Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		{#each filtered as article (article.title)}
			<article
				class="card border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
			>
				{#if article.image}
					<figure class="h-44 overflow-hidden bg-base-200">
						<img
							src={article.image}
							alt={article.imageAlt}
							class="h-full w-full object-contain p-6"
						/>
					</figure>
				{:else}
					<div
						class="flex h-44 items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10"
					>
						<span class="text-4xl">🍃</span>
					</div>
				{/if}
				<div class="card-body">
					<div class="mb-1 flex items-center gap-3 text-xs text-base-content/50">
						<span class="flex items-center gap-1">
							<Calendar class="h-3 w-3" />
							{formatDate(article.date)}
						</span>
						<span class="badge badge-sm badge-secondary">{article.category}</span>
					</div>
					<h2 class="card-title text-base leading-snug">{article.title}</h2>
					<p class="text-sm leading-relaxed text-base-content/70">{article.excerpt}</p>
				</div>
			</article>
		{/each}
	</div>

	{#if filtered.length === 0}
		<div class="py-16 text-center text-base-content/40">
			<Tag class="mx-auto mb-3 h-10 w-10" />
			<p>Keine Beiträge in dieser Kategorie.</p>
		</div>
	{/if}

	<!-- Newsletter CTA -->
	<div class="card mt-12 border border-base-200 bg-base-100 shadow-sm">
		<div class="card-body text-center">
			<Mail class="mx-auto mb-2 h-8 w-8 text-secondary" />
			<h2 class="card-title justify-center">Kein Update verpassen</h2>
			<p class="mb-4 text-sm text-base-content/70">
				Abonnieren Sie unseren Newsletter und erhalten Sie Neuigkeiten, exklusive Angebote und
				Einladungen zu Tastings direkt in Ihr Postfach.
			</p>
			<form class="mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row">
				<input
					type="email"
					placeholder="ihre@email.de"
					class="input-bordered input flex-1"
					required
				/>
				<button type="submit" class="btn whitespace-nowrap btn-secondary">
					<ArrowRight class="h-4 w-4" />
					Anmelden
				</button>
			</form>
			<p class="mt-2 text-xs text-base-content/40">Abmeldung jederzeit möglich.</p>
		</div>
	</div>
</div>
