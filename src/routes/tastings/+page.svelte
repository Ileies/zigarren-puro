<script lang="ts">
	import { Wine, Cigarette, Calendar, Users, Clock, MapPin } from '@lucide/svelte';
	import * as m from '$lib/messages';

	// Sample tasting events data - this could come from a database or API
	const rumTastings = [
		{
			id: 1,
			title: 'Premium Caribbean Rums',
			date: '2024-01-15',
			time: '19:00',
			duration: '2 Stunden',
			participants: 12,
			location: 'Tasting Lounge',
			description: 'Eine Reise durch die karibischen Inseln mit exquisiten Rums',
			image: '/spirits/caribbean-rum.jpg'
		},
		{
			id: 2,
			title: 'Aged Whiskey & Rum Pairing',
			date: '2024-01-22',
			time: '18:30',
			duration: '2.5 Stunden',
			participants: 8,
			location: 'VIP Lounge',
			description: 'Entdecken Sie die perfekte Harmonie zwischen Whiskey und Rum',
			image: '/spirits/whiskey-rum.jpg'
		}
	];

	const cigarTastings = [
		{
			id: 3,
			title: 'Havana Classics',
			date: '2024-01-18',
			time: '20:00',
			duration: '3 Stunden',
			participants: 10,
			location: 'Zigarren Lounge',
			description: 'Die legendären Zigarren aus Kuba - eine Reise in die Tradition',
			image: '/cigars/havana-classics.jpg'
		},
		{
			id: 4,
			title: 'Dominican Masterpieces',
			date: '2024-01-25',
			time: '19:30',
			duration: '2.5 Stunden',
			participants: 15,
			location: 'Humidor Room',
			description: 'Erleben Sie die Vielfalt dominikanischer Zigarrenkunst',
			image: '/cigars/dominican.jpg'
		}
	];
</script>

<svelte:head>
	<title>{m.tastingEvents()} - Zigarren Puro</title>
	<meta name="description" content={m.joinOurTastings()} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-base-100 to-base-200">
	<!-- Hero Section -->
	<section
		class="bg-gradient-to-r from-amber-50 to-amber-100 py-16 dark:from-amber-900/20 dark:to-amber-800/20"
	>
		<div class="container mx-auto px-4 text-center">
			<h1 class="mb-6 text-5xl font-bold text-base-content">{m.tastingEvents()}</h1>
			<p class="mx-auto max-w-3xl text-xl text-base-content/70">
				{m.joinOurTastings()}
			</p>
		</div>
	</section>

	<!-- Main Content -->
	<section class="py-16">
		<div class="container mx-auto px-4">
			<!-- Main Content with Fancy Divider -->
			<div class="relative grid gap-8 lg:grid-cols-2 lg:gap-16">
				<!-- Rum Tastings (Left) -->
				<div class="space-y-6">
					<div class="text-center lg:text-left">
						<div class="mb-4 flex items-center justify-center gap-3 lg:justify-start">
							<div class="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
								<Wine class="h-8 w-8 text-amber-600" />
							</div>
							<h2 class="text-3xl font-bold text-base-content">{m.rumTastings()}</h2>
						</div>
						<p class="mb-6 text-lg text-base-content/70">
							{m.rumTastingDesc()}
						</p>
					</div>

					<!-- Rum Events -->
					<div class="space-y-6">
						{#each rumTastings as event}
							<div
								class="card bg-base-100 shadow-lg transition-shadow duration-300 hover:shadow-xl"
							>
								<div class="card-body">
									<h3 class="card-title text-xl">{event.title}</h3>
									<p class="mb-4 text-base-content/60">{event.description}</p>

									<div class="grid grid-cols-2 gap-4 text-sm">
										<div class="flex items-center gap-2">
											<Calendar class="h-4 w-4 text-primary" />
											<span>{event.date}</span>
										</div>
										<div class="flex items-center gap-2">
											<Clock class="h-4 w-4 text-primary" />
											<span>{event.time}</span>
										</div>
										<div class="flex items-center gap-2">
											<Users class="h-4 w-4 text-primary" />
											<span>{event.participants} Plätze</span>
										</div>
										<div class="flex items-center gap-2">
											<MapPin class="h-4 w-4 text-primary" />
											<span>{event.location}</span>
										</div>
									</div>

									<div class="mt-4 card-actions justify-end">
										<button class="btn btn-outline btn-sm">{m.learnMore()}</button>
										<button class="btn btn-sm btn-primary">{m.bookNow()}</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Fancy Divider -->
				<div
					class="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 transform lg:block"
				>
					<div class="relative h-full">
						<div
							class="absolute inset-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"
						></div>
					</div>
				</div>

				<!-- Mobile Divider -->
				<div class="lg:hidden">
					<div class="divider divider-primary">
						<div class="flex items-center gap-4">
							<Wine class="h-6 w-6 text-amber-600" />
							<div class="h-3 w-3 rounded-full bg-primary"></div>
							<Cigarette class="h-6 w-6 text-amber-700" />
						</div>
					</div>
				</div>

				<!-- Cigar Tastings (Right) -->
				<div class="space-y-6">
					<div class="text-center lg:text-left">
						<div class="mb-4 flex items-center justify-center gap-3 lg:justify-start">
							<div class="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
								<Cigarette class="h-8 w-8 text-amber-700" />
							</div>
							<h2 class="text-3xl font-bold text-base-content">{m.cigarTastings()}</h2>
						</div>
						<p class="mb-6 text-lg text-base-content/70">
							{m.cigarTastingDesc()}
						</p>
					</div>

					<!-- Cigar Events -->
					<div class="space-y-6">
						{#each cigarTastings as event}
							<div
								class="card bg-base-100 shadow-lg transition-shadow duration-300 hover:shadow-xl"
							>
								<div class="card-body">
									<h3 class="card-title text-xl">{event.title}</h3>
									<p class="mb-4 text-base-content/60">{event.description}</p>

									<div class="grid grid-cols-2 gap-4 text-sm">
										<div class="flex items-center gap-2">
											<Calendar class="h-4 w-4 text-primary" />
											<span>{event.date}</span>
										</div>
										<div class="flex items-center gap-2">
											<Clock class="h-4 w-4 text-primary" />
											<span>{event.time}</span>
										</div>
										<div class="flex items-center gap-2">
											<Users class="h-4 w-4 text-primary" />
											<span>{event.participants} Plätze</span>
										</div>
										<div class="flex items-center gap-2">
											<MapPin class="h-4 w-4 text-primary" />
											<span>{event.location}</span>
										</div>
									</div>

									<div class="mt-4 card-actions justify-end">
										<button class="btn btn-outline btn-sm">{m.learnMore()}</button>
										<button class="btn btn-sm btn-primary">{m.bookNow()}</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Call to Action -->
			<div class="mt-16 text-center">
				<div class="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg">
					<div class="card-body">
						<h3 class="mb-4 card-title justify-center text-2xl">{m.upcomingEvents()}</h3>
						<p class="mb-6 text-base-content/70">
							Verpassen Sie nicht unsere exklusiven Verkostungsevents. Melden Sie sich für unseren
							Newsletter an und erhalten Sie als Erste Informationen über neue Termine.
						</p>
						<div class="card-actions justify-center">
							<button class="btn btn-lg btn-primary">
								{m.subscribe()}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
