<script lang="ts">
	import { Globe, Award, Mail, ArrowRight } from '@lucide/svelte';
	import { email } from '$lib/config';

	const brands = [
		{
			name: 'Vegafina',
			logo: '/brands/vegafina.png',
			country: 'Dominikanische Republik',
			type: 'Premiumzigarren',
			description:
				'Vegafina steht für milden, cremigen Genuss auf höchstem Niveau. Die Zigarren werden in Santiago de los Caballeros aus sorgfältig selektierten Tabaken handgefertigt und überzeugen durch ihre ausgewogene, aromatische Rauchcharakteristik.',
			since: 2019
		},
		{
			name: 'Flor de Copán',
			logo: '/brands/flor-de-copan.png',
			country: 'Honduras',
			type: 'Premiumzigarren',
			description:
				'In der alten Tabakstadt Santa Rosa de Copán rollt Flor de Copán seit Jahrzehnten handwerkliche Ausnahmezigarren. Feine Würze, sanfte Süße und ein sauberer Abgang machen sie zu Lieblingen unter Kennern.',
			since: 2020
		},
		{
			name: 'Henri Clay',
			logo: '/brands/henri-clay.png',
			country: 'Honduras',
			type: 'Premiumzigarren',
			description:
				'Henri Clay vereint klassische Eleganz mit mittelkräftigem Charakter. Die Zigarren sind nach dem legendären kubanischen Zigarrenhersteller Henri Clay benannt und setzen die Tradition aromatischer Longfiller fort.',
			since: 2025
		},
		{
			name: 'John Aylesbury',
			logo: '/brands/john-aylesbury.png',
			country: 'Deutschland',
			type: 'Fachhandelsmarke',
			description:
				'John Aylesbury ist eine der renommiertesten deutschen Fachhandelsmarken für Tabakwaren. Das Portfolio umfasst handgefertigte Zigarren, Pfeifentabake und hochwertige Accessoires – stets mit dem Anspruch an kompromisslose Qualität.',
			since: 2019
		},
		{
			name: 'Davidoff',
			logo: '/brands/davidoff.png',
			country: 'Dominikanische Republik',
			type: 'Luxuszigarren',
			description:
				'Davidoff gilt weltweit als Inbegriff des Zigarrenluxus. Die in Santiago gefertigten Zigarren begeistern seit Jahrzehnten Connaisseure mit komplexen Aromenprofilen, makelloser Konstruktion und unverwechselbarer Eleganz.',
			since: 2021
		},
		{
			name: 'Laura Chavin',
			logo: '/brands/laura-chavin.png',
			country: 'Dominikanische Republik / Deutschland',
			type: 'Premiumzigarren',
			description:
				'Laura Chavin ist eine erfolgreiche deutsche Premiumzigarrenmarke, die in der Dominikanischen Republik aus edelsten Tabaken handgefertigt wird. Die harmonischen, ausgewogenen Zigarren sind ideal für den täglichen Genuss auf höchstem Niveau.',
			since: 2022
		}
	];
</script>

<svelte:head>
	<title>Unsere Marken & Partner - Zigarren Puro</title>
	<meta
		name="description"
		content="Entdecken Sie die exklusiven Premiumzigarren-Marken und Partner von Zigarren Puro."
	/>
</svelte:head>

<div class="container mx-auto max-w-5xl px-4 py-8">
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold text-primary">Unsere Marken & Partner</h1>
		<p class="mx-auto max-w-2xl text-lg text-base-content/70">
			Wir arbeiten ausschließlich mit Herstellern zusammen, die für Handwerkskunst, Qualitätstabak
			und nachhaltige Produktion stehen.
		</p>
	</div>

	<div class="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2">
		{#each brands as brand (brand.name)}
			<div
				class="card border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
			>
				<div class="card-body">
					<div class="flex items-start gap-4">
						<div
							class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-base-200 p-2"
						>
							<img src={brand.logo} alt={brand.name} class="h-full w-full object-contain" />
						</div>
						<div class="min-w-0 flex-1">
							<div class="mb-1 flex flex-wrap items-center gap-2">
								<h2 class="text-lg font-bold">{brand.name}</h2>
								<span class="badge badge-sm badge-secondary">{brand.type}</span>
							</div>
							<div class="mb-3 flex flex-wrap items-center gap-3 text-xs text-base-content/50">
								<span class="flex items-center gap-1">
									<Globe class="h-3 w-3" />
									{brand.country}
								</span>
								<span class="flex items-center gap-1">
									<Award class="h-3 w-3" />
									Partner seit {brand.since}
								</span>
							</div>
						</div>
					</div>
					<p class="text-sm leading-relaxed text-base-content/70">{brand.description}</p>
					<div class="mt-3 card-actions">
						<a
							href={`/search?q=${encodeURIComponent(brand.name)}`}
							class="btn text-secondary btn-ghost btn-sm hover:bg-secondary/10"
						>
							Produkte entdecken
							<ArrowRight class="h-4 w-4" />
						</a>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Become a Partner CTA -->
	<div class="card border border-base-200 bg-base-100 shadow-sm">
		<div class="card-body text-center">
			<Award class="mx-auto mb-2 h-10 w-10 text-secondary" />
			<h2 class="card-title justify-center text-xl">Partnerschaft anfragen</h2>
			<p class="mx-auto mb-4 max-w-lg text-sm text-base-content/70">
				Sie sind Hersteller oder Importeur hochwertiger Zigarren, Spirituosen oder Tabakwaren und
				möchten mit uns zusammenarbeiten? Wir freuen uns über Ihre Anfrage.
			</p>
			<a href={`mailto:${email}?subject=Partnerschaftsanfrage`} class="btn mx-auto btn-secondary">
				<Mail class="h-4 w-4" />
				Kontakt aufnehmen
			</a>
		</div>
	</div>
</div>
