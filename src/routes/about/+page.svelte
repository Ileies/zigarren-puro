<script lang="ts">
	import { MapPin, Phone, Mail, Heart, Star, Target } from '@lucide/svelte';
	import { SiFacebook, SiInstagram } from '@icons-pack/svelte-simple-icons';
	import { storeAddress, location, facebook, instagram, phone, email } from '$lib/config';
	import Picture from '$lib/components/Picture.svelte';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Über uns - Zigarren Puro</title>
	<meta
		name="description"
		content="Erfahren Sie mehr über Zigarren Puro - Ihre Experten für Premium-Zigarren und Tabakwaren seit über 20 Jahren"
	/>
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-base-100 to-base-200 py-16 lg:py-24">
	<div class="container mx-auto px-6">
		<div class="mx-auto max-w-4xl text-center">
			<h1 class="mb-6 text-4xl font-bold text-base-content lg:text-6xl">Zigarren Puro</h1>
			<p class="mb-8 text-xl leading-relaxed text-base-content/70 lg:text-2xl">
				Seit über zwei Jahrzehnten Ihre erste Adresse für Premium-Zigarren und edle Spirituosen
			</p>
			<div class="flex justify-center">
				<div class="rounded-full bg-primary/10 px-6 py-3">
					<span class="font-semibold text-primary">Gegründet 2022 • Köln, Deutschland</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Main Story Section -->
<section class="bg-base-100 py-16 lg:py-20">
	<div class="container mx-auto px-6">
		<div class="mx-auto max-w-6xl">
			<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
				<!-- Text Content -->
				<div>
					<h2 class="mb-8 text-3xl font-bold text-base-content lg:text-4xl">Unsere Geschichte</h2>
					<div class="prose prose-lg max-w-none space-y-6 text-base-content/80">
						<p>
							Was als kleine Leidenschaft begann, hat sich zu einem der führenden Fachhändler für
							Tabakwaren und exklusive Genussmittel entwickelt. Unser Geschäftsführer und sein
							erfahrenes Team leben für die Welt der Zigarren.
						</p>
						<p>
							Mit jahrelanger Expertise und einem untrüglichen Gespür für Qualität kuratieren wir
							eine exklusive Auswahl der besten Marken aus aller Welt – von kubanischen Klassikern
							bis hin zu nicaraguanischen Raritäten.
						</p>
						<p>
							Bei uns finden Sie nicht nur erstklassige Produkte, sondern auch die persönliche
							Beratung, die den Unterschied macht. Jede Zigarre erzählt eine Geschichte, und wir
							helfen Ihnen dabei, Ihre ganz persönliche zu finden.
						</p>
					</div>
				</div>

				<!-- Image -->
				<div>
					<div class="relative">
						<div class="overflow-hidden rounded-2xl">
							<Picture
								src="/gallery/cohiba-linea.png"
								alt="Premium Zigarren Collection"
								class="h-96 w-full object-cover"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Values Section -->
<section class="bg-base-200 py-16 lg:py-20">
	<div class="container mx-auto px-6">
		<div class="mx-auto max-w-6xl">
			<div class="mb-16 text-center">
				<h2 class="mb-4 text-3xl font-bold text-base-content lg:text-4xl">Unsere Werte</h2>
				<p class="mx-auto max-w-2xl text-lg text-base-content/70">
					Was uns antreibt und unsere Arbeit prägt
				</p>
			</div>

			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				<div class="rounded-xl bg-base-100 p-8 text-center">
					<div
						class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
					>
						<Heart class="h-8 w-8 text-primary" />
					</div>
					<h3 class="mb-4 text-xl font-bold text-base-content">Leidenschaft</h3>
					<p class="text-base-content/70">
						Unsere Leidenschaft für Premium-Zigarren und edle Spirituosen spüren Sie in jedem
						Gespräch und jeder Empfehlung.
					</p>
				</div>

				<div class="rounded-xl bg-base-100 p-8 text-center">
					<div
						class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10"
					>
						<Star class="h-8 w-8 text-secondary" />
					</div>
					<h3 class="mb-4 text-xl font-bold text-base-content">Qualität</h3>
					<p class="text-base-content/70">
						Wir führen nur Produkte, von denen wir selbst überzeugt sind. Jede Zigarre wird
						sorgfältig ausgewählt und geprüft.
					</p>
				</div>

				<div class="rounded-xl bg-base-100 p-8 text-center">
					<div
						class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10"
					>
						<Target class="h-8 w-8 text-accent" />
					</div>
					<h3 class="mb-4 text-xl font-bold text-base-content">Expertise</h3>
					<p class="text-base-content/70">
						Über 20 Jahre Erfahrung und kontinuierliche Weiterbildung garantieren Ihnen kompetente
						Beratung.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Stats Section -->
<section class="bg-base-100 py-16 lg:py-20">
	<div class="container mx-auto px-6">
		<div class="mx-auto max-w-4xl">
			<div class="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
				<div>
					<div class="mb-2 text-4xl font-bold text-primary lg:text-5xl">20+</div>
					<div class="text-base-content/70">Jahre Erfahrung</div>
				</div>
				<div>
					<div class="mb-2 text-4xl font-bold text-secondary lg:text-5xl">500+</div>
					<div class="text-base-content/70">Premium Marken</div>
				</div>
				<div>
					<div class="mb-2 text-4xl font-bold text-accent lg:text-5xl">5000+</div>
					<div class="text-base-content/70">Zufriedene Kunden</div>
				</div>
				<div>
					<div class="mb-2 text-4xl font-bold text-primary lg:text-5xl">24/7</div>
					<div class="text-base-content/70">Online Service</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Contact & Location Section -->
<section class="bg-base-200 py-16 lg:py-20">
	<div class="container mx-auto px-6">
		<div class="mx-auto max-w-6xl">
			<div class="mb-16 text-center">
				<h2 class="mb-4 text-3xl font-bold text-base-content lg:text-4xl">Besuchen Sie uns</h2>
				<p class="text-lg text-base-content/70">
					In unserem Geschäft in Köln beraten wir Sie gerne persönlich
				</p>
			</div>

			<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
				<!-- Contact Info -->
				<div class="rounded-xl bg-base-100 p-8">
					<h3 class="mb-6 text-2xl font-bold text-base-content">Kontakt & Öffnungszeiten</h3>

					<div class="mb-8 space-y-4">
						<div class="flex items-center gap-4">
							<MapPin class="h-5 w-5 text-primary" />
							<div>
								<div class="font-semibold text-base-content">Zigarren Puro GmbH</div>
								<div class="text-base-content/70">{storeAddress}</div>
							</div>
						</div>

						<div class="flex items-center gap-4">
							<Phone class="h-5 w-5 text-primary" />
							<a href="tel:{phone}" class="text-base-content transition-colors hover:text-primary">
								{phone}
							</a>
						</div>

						<div class="flex items-center gap-4">
							<Mail class="h-5 w-5 text-primary" />
							<a
								href="mailto:{email}"
								class="text-base-content transition-colors hover:text-primary"
							>
								{email}
							</a>
						</div>
					</div>

					<div class="mb-8 border-t border-base-300 pt-6">
						<h4 class="mb-4 font-semibold text-base-content">Öffnungszeiten</h4>
						<div class="space-y-2 text-base-content/70">
							<div class="flex justify-between">
								<span>Montag - Samstag:</span>
								<span>13:00 - 19:00</span>
							</div>
							<div class="flex justify-between">
								<span>Sonntag:</span>
								<span>Geschlossen</span>
							</div>
						</div>
					</div>

					<!-- Social Media -->
					<div>
						<h4 class="mb-4 font-semibold text-base-content">Folgen Sie uns</h4>
						<div class="flex gap-4">
							<a
								href={facebook}
								target="_blank"
								rel="noopener noreferrer"
								class="btn btn-circle transition-colors btn-outline hover:btn-primary"
							>
								<SiFacebook size={20} />
							</a>
							<a
								href={instagram}
								target="_blank"
								rel="noopener noreferrer"
								class="btn btn-circle transition-colors btn-outline hover:btn-primary"
							>
								<SiInstagram size={20} />
							</a>
						</div>
					</div>
				</div>

				<!-- Map/Image placeholder -->
				<div class="rounded-xl bg-base-100 p-8">
					<h3 class="mb-6 text-2xl font-bold text-base-content">Unser Geschäft</h3>
					<div class="mb-6 flex aspect-video items-center justify-center rounded-lg bg-base-200">
						<div class="text-center">
							<MapPin class="mx-auto mb-4 h-12 w-12 text-primary" />
							<p class="text-base-content/70">Interaktive Karte</p>
							<p class="text-sm text-base-content/50">Coming Soon</p>
						</div>
					</div>
					<a href={location} target="_blank" class="btn w-full btn-primary">
						<MapPin class="h-5 w-5" />
						Route planen
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="bg-primary py-16 text-primary-content lg:py-20">
	<div class="container mx-auto px-6 text-center">
		<div class="mx-auto max-w-3xl">
			<h2 class="mb-6 text-3xl font-bold lg:text-4xl">
				Bereit für Ihr nächstes Zigarren-Erlebnis?
			</h2>
			<p class="mb-8 text-xl opacity-90">
				Lassen Sie sich von unserem Expertenteam beraten und entdecken Sie Ihre neue
				Lieblingszigarre.
			</p>
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<a href={resolve('/contact')} class="btn btn-lg btn-secondary"> Kontakt aufnehmen </a>
				<a
					href={resolve('/tastings')}
					class="btn border-primary-content text-primary-content btn-outline btn-lg hover:bg-primary-content hover:text-primary"
				>
					Tasting buchen
				</a>
			</div>
		</div>
	</div>
</section>
