<script lang="ts">
	import { Globe, Award, Mail, ArrowRight } from '@lucide/svelte';
	import { email } from '$lib/config';

	const brands = [
		{
			name: 'Vegafina',
			logo: '/brands/vegafina.png',
			country: 'Dominikanische Republik',
			type: 'Premiumzigarren',
			description: 'Vegafina steht für milden, cremigen Genuss auf höchstem Niveau. Die Zigarren werden in Santiago de los Caballeros aus sorgfältig selektierten Tabaken handgefertigt und überzeugen durch ihre ausgewogene, aromatische Rauchcharakteristik.',
			since: 2019
		},
		{
			name: 'Flor de Copán',
			logo: '/brands/flor-de-copan.png',
			country: 'Honduras',
			type: 'Premiumzigarren',
			description: 'In der alten Tabakstadt Santa Rosa de Copán rollt Flor de Copán seit Jahrzehnten handwerkliche Ausnahmezigarren. Feine Würze, sanfte Süße und ein sauberer Abgang machen sie zu Lieblingen unter Kennern.',
			since: 2020
		},
		{
			name: 'Henri Clay',
			logo: '/brands/henri-clay.png',
			country: 'Honduras',
			type: 'Premiumzigarren',
			description: 'Henri Clay vereint klassische Eleganz mit mittelkräftigem Charakter. Die Zigarren sind nach dem legendären kubanischen Zigarrenhersteller Henri Clay benannt und setzen die Tradition aromatischer Longfiller fort.',
			since: 2025
		},
		{
			name: 'John Aylesbury',
			logo: '/brands/john-aylesbury.png',
			country: 'Deutschland',
			type: 'Fachhandelsmarke',
			description: 'John Aylesbury ist eine der renommiertesten deutschen Fachhandelsmarken für Tabakwaren. Das Portfolio umfasst handgefertigte Zigarren, Pfeifentabake und hochwertige Accessoires – stets mit dem Anspruch an kompromisslose Qualität.',
			since: 2019
		},
		{
			name: 'Davidoff',
			logo: '/brands/davidoff.png',
			country: 'Dominikanische Republik',
			type: 'Luxuszigarren',
			description: 'Davidoff gilt weltweit als Inbegriff des Zigarrenluxus. Die in Santiago gefertigten Zigarren begeistern seit Jahrzehnten Connaisseure mit komplexen Aromenprofilen, makelloser Konstruktion und unverwechselbarer Eleganz.',
			since: 2021
		},
		{
			name: 'Laura Chavin',
			logo: '/brands/laura-chavin.png',
			country: 'Dominikanische Republik / Deutschland',
			type: 'Premiumzigarren',
			description: 'Laura Chavin ist eine erfolgreiche deutsche Premiumzigarrenmarke, die in der Dominikanischen Republik aus edelsten Tabaken handgefertigt wird. Die harmonischen, ausgewogenen Zigarren sind ideal für den täglichen Genuss auf höchstem Niveau.',
			since: 2022
		}
	];
</script>

<svelte:head>
	<title>Unsere Marken & Partner - Zigarren Puro</title>
	<meta name="description" content="Entdecken Sie die exklusiven Premiumzigarren-Marken und Partner von Zigarren Puro." />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-5xl">
	<div class="text-center mb-12">
		<h1 class="text-4xl font-bold text-primary mb-4">Unsere Marken & Partner</h1>
		<p class="text-lg text-base-content/70 max-w-2xl mx-auto">
			Wir arbeiten ausschließlich mit Herstellern zusammen, die für Handwerkskunst, Qualitätstabak und nachhaltige Produktion stehen.
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
		{#each brands as brand}
			<div class="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
				<div class="card-body">
					<div class="flex items-start gap-4">
						<div class="w-20 h-20 bg-base-200 rounded-lg flex items-center justify-center flex-shrink-0 p-2">
							<img src={brand.logo} alt={brand.name} class="w-full h-full object-contain" />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex flex-wrap items-center gap-2 mb-1">
								<h2 class="font-bold text-lg">{brand.name}</h2>
								<span class="badge badge-secondary badge-sm">{brand.type}</span>
							</div>
							<div class="flex flex-wrap items-center gap-3 text-xs text-base-content/50 mb-3">
								<span class="flex items-center gap-1">
									<Globe class="w-3 h-3" />
									{brand.country}
								</span>
								<span class="flex items-center gap-1">
									<Award class="w-3 h-3" />
									Partner seit {brand.since}
								</span>
							</div>
						</div>
					</div>
					<p class="text-sm text-base-content/70 leading-relaxed">{brand.description}</p>
					<div class="card-actions mt-3">
						<a href={`/search?q=${encodeURIComponent(brand.name)}`} class="btn btn-sm btn-ghost text-secondary hover:bg-secondary/10">
							Produkte entdecken
							<ArrowRight class="w-4 h-4" />
						</a>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Become a Partner CTA -->
	<div class="card bg-base-100 border border-base-200 shadow-sm">
		<div class="card-body text-center">
			<Award class="w-10 h-10 text-secondary mx-auto mb-2" />
			<h2 class="card-title justify-center text-xl">Partnerschaft anfragen</h2>
			<p class="text-sm text-base-content/70 max-w-lg mx-auto mb-4">
				Sie sind Hersteller oder Importeur hochwertiger Zigarren, Spirituosen oder Tabakwaren und möchten mit uns zusammenarbeiten? Wir freuen uns über Ihre Anfrage.
			</p>
			<a href={`mailto:${email}?subject=Partnerschaftsanfrage`} class="btn btn-secondary mx-auto">
				<Mail class="w-4 h-4" />
				Kontakt aufnehmen
			</a>
		</div>
	</div>
</div>
