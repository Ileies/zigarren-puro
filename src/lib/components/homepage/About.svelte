<script lang="ts">
	import Picture from '../Picture.svelte';
	import { Users, Award, Clock } from '@lucide/svelte';
</script>

<!-- About Section -->
<section class="bg-base-100 py-12 lg:py-16">
	<div class="container mx-auto px-6">
		<div class="mx-auto max-w-6xl">
			<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
				<!-- Text Content -->
				<div class="order-2 lg:order-1">
					<h2 class="mb-6 text-3xl font-bold text-base-content lg:text-4xl">Über Zigarren Puro</h2>
					<div class="prose prose-lg max-w-none text-base-content/80">
						<p class="mb-6">
							Seit über zwei Jahrzehnten sind wir Ihre erste Adresse für Premium-Zigarren und edle
							Spirituosen. Was als kleine Leidenschaft begann, hat sich zu einem der führenden
							Fachhändler für Tabakwaren und exklusive Genussmittel entwickelt.
						</p>
						<p class="mb-6">
							Unser Geschäftsführer und sein erfahrenes Team leben für die Welt der Zigarren. Mit
							jahrelanger Expertise und einem untrüglichen Gespür für Qualität kuratieren wir eine
							exklusive Auswahl der besten Marken aus aller Welt – von kubanischen Klassikern bis
							hin zu nicaraguanischen Raritäten.
						</p>
						<p class="mb-8">
							Bei uns finden Sie nicht nur erstklassige Produkte, sondern auch die persönliche
							Beratung, die den Unterschied macht. Jede Zigarre erzählt eine Geschichte, und wir
							helfen Ihnen dabei, Ihre ganz persönliche zu finden.
						</p>
					</div>

					<!-- Features -->
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
						<div class="flex items-center gap-3">
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
								<Clock class="h-6 w-6 text-primary" />
							</div>
							<div>
								<div class="font-semibold text-base-content">20+ Jahre</div>
								<div class="text-sm text-base-content/60">Erfahrung</div>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
								<Award class="h-6 w-6 text-primary" />
							</div>
							<div>
								<div class="font-semibold text-base-content">Premium</div>
								<div class="text-sm text-base-content/60">Qualität</div>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
								<Users class="h-6 w-6 text-primary" />
							</div>
							<div>
								<div class="font-semibold text-base-content">Persönlich</div>
								<div class="text-sm text-base-content/60">Beratung</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Image -->
				<div class="order-1 lg:order-2">
					<div class="group relative">
						<div class="relative overflow-hidden rounded-2xl shadow-2xl">
							<Picture
								src="/gallery/geschaeftsfuehrer.jpg"
								alt="Geschäftsführer von Zigarren Puro in seinem Humidor"
								class="h-96 w-full object-cover transition-transform duration-500 group-hover:scale-105 lg:h-[500px]"
							/>
							<!-- Subtle overlay for better text readability -->
							<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

							<!-- Optional: Floating badge -->
							<div class="absolute top-6 right-6">
								<div class="rounded-full bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm">
									<span class="text-sm font-medium text-base-content">Seit 2003</span>
								</div>
							</div>
						</div>

						<!-- Decorative element -->
						<div
							class="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl"
						></div>
						<div
							class="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-secondary/10 blur-2xl"
						></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
