<script lang="ts">
	import { Users, Award, Clock, MapPin, Phone, Mail, Heart, Star, Target } from '@lucide/svelte';
	import { SiFacebook, SiInstagram } from '@icons-pack/svelte-simple-icons';
	import { storeAddress, location, facebook, instagram, phone, email } from '$lib/config';
	import Picture from '$lib/components/Picture.svelte';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Über uns - Zigarren Puro</title>
	<meta name="description" content="Erfahren Sie mehr über Zigarren Puro - Ihre Experten für Premium-Zigarren und Tabakwaren seit über 20 Jahren" />
</svelte:head>

<!-- Hero Section -->
<section class="py-16 lg:py-24 bg-gradient-to-br from-base-100 to-base-200">
	<div class="container mx-auto px-6">
		<div class="max-w-4xl mx-auto text-center">
			<h1 class="text-4xl lg:text-6xl font-bold text-base-content mb-6">
				Zigarren Puro
			</h1>
			<p class="text-xl lg:text-2xl text-base-content/70 mb-8 leading-relaxed">
				Seit über zwei Jahrzehnten Ihre erste Adresse für Premium-Zigarren und edle Spirituosen
			</p>
			<div class="flex justify-center">
				<div class="bg-primary/10 rounded-full px-6 py-3">
					<span class="text-primary font-semibold">Gegründet 2022 • Köln, Deutschland</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Main Story Section -->
<section class="py-16 lg:py-20 bg-base-100">
	<div class="container mx-auto px-6">
		<div class="max-w-6xl mx-auto">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
				<!-- Text Content -->
				<div>
					<h2 class="text-3xl lg:text-4xl font-bold text-base-content mb-8">
						Unsere Geschichte
					</h2>
					<div class="prose prose-lg max-w-none text-base-content/80 space-y-6">
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
								class="w-full h-96 object-cover" 
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Values Section -->
<section class="py-16 lg:py-20 bg-base-200">
	<div class="container mx-auto px-6">
		<div class="max-w-6xl mx-auto">
			<div class="text-center mb-16">
				<h2 class="text-3xl lg:text-4xl font-bold text-base-content mb-4">
					Unsere Werte
				</h2>
				<p class="text-lg text-base-content/70 max-w-2xl mx-auto">
					Was uns antreibt und unsere Arbeit prägt
				</p>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div class="bg-base-100 rounded-xl p-8 text-center">
					<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
						<Heart class="w-8 h-8 text-primary" />
					</div>
					<h3 class="text-xl font-bold text-base-content mb-4">Leidenschaft</h3>
					<p class="text-base-content/70">
						Unsere Leidenschaft für Premium-Zigarren und edle Spirituosen spüren Sie in jedem Gespräch und jeder Empfehlung.
					</p>
				</div>
				
				<div class="bg-base-100 rounded-xl p-8 text-center">
					<div class="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
						<Star class="w-8 h-8 text-secondary" />
					</div>
					<h3 class="text-xl font-bold text-base-content mb-4">Qualität</h3>
					<p class="text-base-content/70">
						Wir führen nur Produkte, von denen wir selbst überzeugt sind. Jede Zigarre wird sorgfältig ausgewählt und geprüft.
					</p>
				</div>
				
				<div class="bg-base-100 rounded-xl p-8 text-center">
					<div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
						<Target class="w-8 h-8 text-accent" />
					</div>
					<h3 class="text-xl font-bold text-base-content mb-4">Expertise</h3>
					<p class="text-base-content/70">
						Über 20 Jahre Erfahrung und kontinuierliche Weiterbildung garantieren Ihnen kompetente Beratung.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Stats Section -->
<section class="py-16 lg:py-20 bg-base-100">
	<div class="container mx-auto px-6">
		<div class="max-w-4xl mx-auto">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
				<div>
					<div class="text-4xl lg:text-5xl font-bold text-primary mb-2">20+</div>
					<div class="text-base-content/70">Jahre Erfahrung</div>
				</div>
				<div>
					<div class="text-4xl lg:text-5xl font-bold text-secondary mb-2">500+</div>
					<div class="text-base-content/70">Premium Marken</div>
				</div>
				<div>
					<div class="text-4xl lg:text-5xl font-bold text-accent mb-2">5000+</div>
					<div class="text-base-content/70">Zufriedene Kunden</div>
				</div>
				<div>
					<div class="text-4xl lg:text-5xl font-bold text-primary mb-2">24/7</div>
					<div class="text-base-content/70">Online Service</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Contact & Location Section -->
<section class="py-16 lg:py-20 bg-base-200">
	<div class="container mx-auto px-6">
		<div class="max-w-6xl mx-auto">
			<div class="text-center mb-16">
				<h2 class="text-3xl lg:text-4xl font-bold text-base-content mb-4">
					Besuchen Sie uns
				</h2>
				<p class="text-lg text-base-content/70">
					In unserem Geschäft in Köln beraten wir Sie gerne persönlich
				</p>
			</div>
			
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
				<!-- Contact Info -->
				<div class="bg-base-100 rounded-xl p-8">
					<h3 class="text-2xl font-bold text-base-content mb-6">Kontakt & Öffnungszeiten</h3>
					
					<div class="space-y-4 mb-8">
						<div class="flex items-center gap-4">
							<MapPin class="w-5 h-5 text-primary" />
							<div>
								<div class="font-semibold text-base-content">Zigarren Puro GmbH</div>
								<div class="text-base-content/70">{storeAddress}</div>
							</div>
						</div>
						
						<div class="flex items-center gap-4">
							<Phone class="w-5 h-5 text-primary" />
							<a href="tel:{phone}" class="text-base-content hover:text-primary transition-colors">
								{phone}
							</a>
						</div>
						
						<div class="flex items-center gap-4">
							<Mail class="w-5 h-5 text-primary" />
							<a href="mailto:{email}" class="text-base-content hover:text-primary transition-colors">
								{email}
							</a>
						</div>
					</div>
					
					<div class="border-t border-base-300 pt-6 mb-8">
						<h4 class="font-semibold text-base-content mb-4">Öffnungszeiten</h4>
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
						<h4 class="font-semibold text-base-content mb-4">Folgen Sie uns</h4>
						<div class="flex gap-4">
							<a href={facebook} target="_blank" rel="noopener noreferrer"
								 class="btn btn-circle btn-outline hover:btn-primary transition-colors">
								<SiFacebook size={20} />
							</a>
							<a href={instagram} target="_blank" rel="noopener noreferrer"
								 class="btn btn-circle btn-outline hover:btn-primary transition-colors">
								<SiInstagram size={20} />
							</a>
						</div>
					</div>
				</div>
				
				<!-- Map/Image placeholder -->
				<div class="bg-base-100 rounded-xl p-8">
					<h3 class="text-2xl font-bold text-base-content mb-6">Unser Geschäft</h3>
					<div class="aspect-video bg-base-200 rounded-lg flex items-center justify-center mb-6">
						<div class="text-center">
							<MapPin class="w-12 h-12 text-primary mx-auto mb-4" />
							<p class="text-base-content/70">Interaktive Karte</p>
							<p class="text-sm text-base-content/50">Coming Soon</p>
						</div>
					</div>
					<a href={location} target="_blank" 
						 class="btn btn-primary w-full">
						<MapPin class="w-5 h-5" />
						Route planen
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-16 lg:py-20 bg-primary text-primary-content">
	<div class="container mx-auto px-6 text-center">
		<div class="max-w-3xl mx-auto">
			<h2 class="text-3xl lg:text-4xl font-bold mb-6">
				Bereit für Ihr nächstes Zigarren-Erlebnis?
			</h2>
			<p class="text-xl mb-8 opacity-90">
				Lassen Sie sich von unserem Expertenteam beraten und entdecken Sie Ihre neue Lieblingszigarre.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a href={resolve("/contact")} class="btn btn-secondary btn-lg">
					Kontakt aufnehmen
				</a>
				<a href={resolve("/tastings")} class="btn btn-outline btn-lg text-primary-content border-primary-content hover:bg-primary-content hover:text-primary">
					Tasting buchen
				</a>
			</div>
		</div>
	</div>
</section>
