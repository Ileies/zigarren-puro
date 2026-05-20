<script lang="ts">
	import { Calendar, Tag, ArrowRight, Mail } from '@lucide/svelte';

	const articles = [
		{
			date: '2025-10-14',
			category: 'Neuheiten',
			title: 'Vegafina Herbst-Edition 2025 eingetroffen',
			excerpt: 'Die limitierte Herbst-Edition von Vegafina ist ab sofort bei uns erhältlich. Mit einem besonders ausgewogenen Connecticut-Deckblatt und extra langer Reifezeit überzeugt sie mit cremiger Komplexität.',
			image: '/brands/vegafina.png',
			imageAlt: 'Vegafina Herbst-Edition 2025'
		},
		{
			date: '2025-09-28',
			category: 'Veranstaltungen',
			title: 'Davidoff Tasting Abend – Ein voller Erfolg',
			excerpt: 'Unser exklusiver Davidoff Tasting Abend im September zog über 30 Gäste an. Zigarrenexperte Markus Held führte durch drei Jahrgänge der Davidoff Millenium Edition – eine unvergessliche Erfahrung.',
			image: '/brands/davidoff.png',
			imageAlt: 'Davidoff Tasting Abend Köln'
		},
		{
			date: '2025-09-05',
			category: 'Hintergrund',
			title: 'Flor de Copán: Tradition aus Honduras',
			excerpt: 'Die Manufaktur in Santa Rosa de Copán gehört zu den letzten wirklich traditionellen Zigarrenherstellern Lateinamerikas. Wir haben uns die Geschichte dieser außergewöhnlichen Marke genauer angesehen.',
			image: '/brands/flor-de-copan.png',
			imageAlt: 'Flor de Copán Honduras'
		},
		{
			date: '2025-08-20',
			category: 'Angebote',
			title: 'Herbst-Rabattaktion: 15 % auf ausgewähltes Zubehör',
			excerpt: 'Vom 1. bis 31. Oktober gewähren wir 15 % Rabatt auf alle Humidore, Zigarrenschneider und Ascher in unserem Sortiment. Jetzt ist der perfekte Zeitpunkt, Ihre Ausstattung zu vervollständigen.',
			image: null,
			imageAlt: ''
		},
		{
			date: '2025-08-01',
			category: 'Neuheiten',
			title: 'Henri Clay jetzt im Sortiment',
			excerpt: 'Wir freuen uns, die kubanisch inspirierte Marke Henri Clay in unser Sortiment aufgenommen zu haben. Die aromatischen Zigarren aus Honduras überzeugen mit mittelkräftigem Charakter und klassischer Eleganz.',
			image: '/brands/henri-clay.png',
			imageAlt: 'Henri Clay Zigarren'
		},
		{
			date: '2025-07-12',
			category: 'Wissen',
			title: 'Die richtige Lagerung von Zigarren',
			excerpt: 'Ob Humidor, Reise-Etui oder Ziploc-Beutel mit Humidifizier – wir erklären, wie Sie Ihre Zigarren optimal lagern und das Aroma dauerhaft erhalten. Mit praktischen Tipps für Einsteiger und Fortgeschrittene.',
			image: null,
			imageAlt: ''
		}
	];

	const categories = ['Alle', 'Neuheiten', 'Veranstaltungen', 'Hintergrund', 'Angebote', 'Wissen'];
	let activeCategory = $state('Alle');

	const filtered = $derived(
		activeCategory === 'Alle' ? articles : articles.filter(a => a.category === activeCategory)
	);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>News & Updates - Zigarren Puro</title>
	<meta name="description" content="Aktuelle Neuigkeiten, Produktneuheiten und Veranstaltungen von Zigarren Puro." />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-5xl">
	<div class="text-center mb-10">
		<h1 class="text-4xl font-bold text-primary mb-4">News & Updates</h1>
		<p class="text-lg text-base-content/70">Neuigkeiten, Produktneuheiten und Wissenswertes rund um die Welt der Zigarre</p>
	</div>

	<!-- Category Filter -->
	<div class="flex flex-wrap gap-2 mb-8 justify-center">
		{#each categories as cat}
			<button
				class="btn btn-sm {activeCategory === cat ? 'btn-secondary' : 'btn-ghost border border-base-300'}"
				onclick={() => (activeCategory = cat)}
			>
				{cat}
			</button>
		{/each}
	</div>

	<!-- Articles Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		{#each filtered as article}
			<article class="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
				{#if article.image}
					<figure class="h-44 bg-base-200 overflow-hidden">
						<img src={article.image} alt={article.imageAlt} class="w-full h-full object-contain p-6" />
					</figure>
				{:else}
					<div class="h-44 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
						<span class="text-4xl">🍃</span>
					</div>
				{/if}
				<div class="card-body">
					<div class="flex items-center gap-3 text-xs text-base-content/50 mb-1">
						<span class="flex items-center gap-1">
							<Calendar class="w-3 h-3" />
							{formatDate(article.date)}
						</span>
						<span class="badge badge-secondary badge-sm">{article.category}</span>
					</div>
					<h2 class="card-title text-base leading-snug">{article.title}</h2>
					<p class="text-sm text-base-content/70 leading-relaxed">{article.excerpt}</p>
				</div>
			</article>
		{/each}
	</div>

	{#if filtered.length === 0}
		<div class="text-center py-16 text-base-content/40">
			<Tag class="w-10 h-10 mx-auto mb-3" />
			<p>Keine Beiträge in dieser Kategorie.</p>
		</div>
	{/if}

	<!-- Newsletter CTA -->
	<div class="card bg-base-100 border border-base-200 shadow-sm mt-12">
		<div class="card-body text-center">
			<Mail class="w-8 h-8 text-secondary mx-auto mb-2" />
			<h2 class="card-title justify-center">Kein Update verpassen</h2>
			<p class="text-sm text-base-content/70 mb-4">Abonnieren Sie unseren Newsletter und erhalten Sie Neuigkeiten, exklusive Angebote und Einladungen zu Tastings direkt in Ihr Postfach.</p>
			<form class="flex flex-col sm:flex-row gap-2 max-w-md mx-auto w-full">
				<input type="email" placeholder="ihre@email.de" class="input input-bordered flex-1" required />
				<button type="submit" class="btn btn-secondary whitespace-nowrap">
					<ArrowRight class="w-4 h-4" />
					Anmelden
				</button>
			</form>
			<p class="text-xs text-base-content/40 mt-2">Abmeldung jederzeit möglich.</p>
		</div>
	</div>
</div>
