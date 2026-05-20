<script lang="ts">
	import Picture from '../Picture.svelte';
	import { Users, Award, Clock } from '@lucide/svelte';
</script>

<!-- About Section -->
<section class="py-12 lg:py-16 bg-base-100">
	<div class="container mx-auto px-6">
		<div class="max-w-6xl mx-auto">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
				<!-- Text Content -->
				<div class="order-2 lg:order-1">
					<h2 class="text-3xl lg:text-4xl font-bold text-base-content mb-6">
						Über Zigarren Puro
					</h2>
					<div class="prose prose-lg max-w-none text-base-content/80">
						<p class="mb-6">
							Seit über zwei Jahrzehnten sind wir Ihre erste Adresse für Premium-Zigarren und edle Spirituosen. 
							Was als kleine Leidenschaft begann, hat sich zu einem der führenden Fachhändler für Tabakwaren 
							und exklusive Genussmittel entwickelt.
						</p>
						<p class="mb-6">
							Unser Geschäftsführer und sein erfahrenes Team leben für die Welt der Zigarren. Mit jahrelanger 
							Expertise und einem untrüglichen Gespür für Qualität kuratieren wir eine exklusive Auswahl der 
							besten Marken aus aller Welt – von kubanischen Klassikern bis hin zu nicaraguanischen Raritäten.
						</p>
						<p class="mb-8">
							Bei uns finden Sie nicht nur erstklassige Produkte, sondern auch die persönliche Beratung, 
							die den Unterschied macht. Jede Zigarre erzählt eine Geschichte, und wir helfen Ihnen dabei, 
							Ihre ganz persönliche zu finden.
						</p>
					</div>
					
					<!-- Features -->
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
						<div class="flex items-center gap-3">
							<div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
								<Clock class="w-6 h-6 text-primary" />
							</div>
							<div>
								<div class="font-semibold text-base-content">20+ Jahre</div>
								<div class="text-sm text-base-content/60">Erfahrung</div>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
								<Award class="w-6 h-6 text-primary" />
							</div>
							<div>
								<div class="font-semibold text-base-content">Premium</div>
								<div class="text-sm text-base-content/60">Qualität</div>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
								<Users class="w-6 h-6 text-primary" />
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
					<div class="relative group">
						<div class="relative overflow-hidden rounded-2xl shadow-2xl">
							<Picture 
								src="/gallery/geschaeftsfuehrer.jpg" 
								alt="Geschäftsführer von Zigarren Puro in seinem Humidor" 
								class="w-full h-96 lg:h-[500px] object-cover group-hover:scale-105 transition-transform duration-500" 
							/>
							<!-- Subtle overlay for better text readability -->
							<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
							
							<!-- Optional: Floating badge -->
							<div class="absolute top-6 right-6">
								<div class="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
									<span class="text-sm font-medium text-base-content">Seit 2003</span>
								</div>
							</div>
						</div>
						
						<!-- Decorative element -->
						<div class="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
						<div class="absolute -top-6 -left-6 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
