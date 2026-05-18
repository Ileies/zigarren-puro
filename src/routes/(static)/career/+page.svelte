<script lang="ts">
	import { Mail, Users, Heart, Award, Coffee, Clock, MapPin, Briefcase, Star, Send, Phone } from 'lucide-svelte';
	import { email, phone, storeAddress } from '$lib/config';
	
	let contactEmail = $state('');
	let contactMessage = $state('');
	let contactName = $state('');
	let isSubmitting = $state(false);
	
	const handleContactSubmit = async (e: Event) => {
		e.preventDefault();
		if (!contactEmail.trim() || !contactMessage.trim() || !contactName.trim()) return;

		isSubmitting = true;
		// TODO: Implement contact form submission
		setTimeout(() => {
			isSubmitting = false;
			contactEmail = '';
			contactMessage = '';
			contactName = '';
			// Show success message
		}, 1000);
	};

	const benefits = [
		{ icon: Heart, title: 'Familiäres Arbeitsklima', description: 'Persönliche Atmosphäre in einem kleinen, eingespielten Team' },
		{ icon: Award, title: 'Expertise entwickeln', description: 'Tiefes Wissen über Premium-Zigarren und Tabakkultur' },
		{ icon: Coffee, title: 'Flexible Arbeitszeiten', description: 'Work-Life-Balance in entspannter Umgebung' },
		{ icon: Users, title: 'Kundenkontakt', description: 'Beratung von Zigarren-Liebhabern und Kennern' }
	];

	const values = [
		{ icon: Star, title: 'Qualität', description: 'Wir setzen auf höchste Standards bei Produkten und Service' },
		{ icon: Heart, title: 'Leidenschaft', description: 'Echte Begeisterung für Zigarren und Tabakkultur' },
		{ icon: Users, title: 'Kundenorientierung', description: 'Individuelle Beratung und persönlicher Service stehen im Mittelpunkt' },
		{ icon: Award, title: 'Expertise', description: 'Fundiertes Wissen und kontinuierliche Weiterbildung' }
	];
</script>

<svelte:head>
	<title>Karriere - Zigarren Puro</title>
	<meta name="description" content="Karrieremöglichkeiten bei Zigarren Puro - Werden Sie Teil unseres Teams von Zigarren-Experten" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<!-- Header -->
	<div class="text-center mb-12">
		<h1 class="text-4xl font-bold text-primary mb-4">Karriere bei Zigarren Puro</h1>
		<p class="text-xl text-base-content/70 max-w-2xl mx-auto">
			Werden Sie Teil unseres leidenschaftlichen Teams und tauchen Sie ein in die Welt der Premium-Zigarren
		</p>
	</div>

	<!-- Current Status -->
	<div class="alert alert-info mb-12">
		<Briefcase class="w-6 h-6" />
		<div>
			<h3 class="font-bold text-lg">Aktueller Status</h3>
			<p>
				Momentan haben wir keine offenen Stellen zu besetzen. Unser Team ist vollständig und arbeitet harmonisch zusammen. 
				Wir freuen uns jedoch über Initiativbewerbungen von Zigarren-Enthusiasten!
			</p>
		</div>
	</div>

	<!-- Company Culture -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
		<div>
			<h2 class="text-3xl font-bold text-primary mb-6">Unser Arbeitsumfeld</h2>
			<div class="prose prose-lg max-w-none">
				<p class="text-base-content/80 mb-4">
					Bei Zigarren Puro arbeiten Sie in einem einzigartigen Umfeld, wo Tradition auf moderne Geschäftspraktiken trifft. 
					Unser Ladengeschäft in Köln ist mehr als nur ein Verkaufsraum – es ist ein Ort der Begegnung für Zigarren-Liebhaber 
					aus aller Welt.
				</p>
				<p class="text-base-content/80 mb-4">
					Als kleines, aber feines Unternehmen legen wir Wert auf persönliche Entwicklung, fachliche Expertise und 
					ein respektvolles Miteinander. Jeder Mitarbeiter ist ein wichtiger Teil unseres Erfolgs.
				</p>
			</div>
		</div>

		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h3 class="card-title text-xl mb-4 flex items-center gap-2">
					<MapPin class="w-5 h-5 text-secondary" />
					Unser Standort
				</h3>
				<div class="space-y-3">
					<p class="text-base-content/80">
						{storeAddress.split(', ')[0]}<br>
						{storeAddress.split(', ')[1]}<br>
						{storeAddress.split(', ')[2]}
					</p>
					<div class="bg-base-200 p-3 rounded-lg">
						<div class="flex items-center gap-2 mb-2">
							<Clock class="w-4 h-4 text-secondary" />
							<span class="font-semibold">Arbeitszeiten:</span>
						</div>
						<p class="text-sm">
							Mo-Sa: 13:00 - 19:00 Uhr<br>
							So: Geschlossen
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Benefits -->
	<div class="mb-16">
		<h2 class="text-3xl font-bold text-primary text-center mb-8">Was wir bieten</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each benefits as benefit (benefit.title)}
				{@const IconComponent = benefit.icon}
				<div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
					<div class="card-body text-center">
						<div class="flex justify-center mb-4">
							<div class="bg-secondary/10 p-3 rounded-full">
								<IconComponent class="w-6 h-6 text-secondary" />
							</div>
						</div>
						<h3 class="card-title text-lg justify-center mb-2">{benefit.title}</h3>
						<p class="text-sm text-base-content/70">{benefit.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Company Values -->
	<div class="mb-16">
		<h2 class="text-3xl font-bold text-primary text-center mb-8">Unsere Werte</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			{#each values as value (value.title)}
				{@const IconComponent = value.icon}
				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<div class="flex items-start gap-4">
							<div class="bg-primary/10 p-3 rounded-full flex-shrink-0">
								<IconComponent class="w-5 h-5 text-primary" />
							</div>
							<div>
								<h3 class="card-title text-lg mb-2">{value.title}</h3>
								<p class="text-sm text-base-content/70">{value.description}</p>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Ideal Candidate -->
	<div class="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg mb-16">
		<div class="card-body">
			<h2 class="text-3xl font-bold text-primary text-center mb-8">Wen wir suchen</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div>
					<h3 class="text-xl font-semibold mb-4 text-secondary">Persönliche Eigenschaften</h3>
					<ul class="space-y-2">
						<li class="flex items-center gap-2">
							<div class="w-2 h-2 bg-secondary rounded-full"></div>
							<span>Leidenschaft für Zigarren und Tabakkultur</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="w-2 h-2 bg-secondary rounded-full"></div>
							<span>Freude am Umgang mit Menschen</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="w-2 h-2 bg-secondary rounded-full"></div>
							<span>Interesse an Beratung und Verkauf</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="w-2 h-2 bg-secondary rounded-full"></div>
							<span>Zuverlässigkeit und Teamgeist</span>
						</li>
					</ul>
				</div>
				<div>
					<h3 class="text-xl font-semibold mb-4 text-secondary">Wünschenswerte Qualifikationen</h3>
					<ul class="space-y-2">
						<li class="flex items-center gap-2">
							<div class="w-2 h-2 bg-secondary rounded-full"></div>
							<span>Erfahrung im Einzelhandel</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="w-2 h-2 bg-secondary rounded-full"></div>
							<span>Kenntnisse über Zigarrenmarken</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="w-2 h-2 bg-secondary rounded-full"></div>
							<span>Mehrsprachigkeit (DE, EN)</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="w-2 h-2 bg-secondary rounded-full"></div>
							<span>Flexibilität bei Arbeitszeiten</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<!-- Contact Section -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
		<div>
			<h2 class="text-3xl font-bold text-primary mb-6">Initiativbewerbung</h2>
			<div class="prose max-w-none mb-6">
				<p class="text-base-content/80">
					Auch wenn wir aktuell keine offenen Stellen haben, freuen wir uns über Initiativbewerbungen 
					von Menschen, die unsere Leidenschaft für Premium-Zigarren teilen.
				</p>
				<p class="text-base-content/80">
					Senden Sie uns gerne Ihre Bewerbungsunterlagen oder nehmen Sie zunächst unverbindlich Kontakt 
					mit uns auf. Wir melden uns bei passenden Gelegenheiten gerne bei Ihnen.
				</p>
			</div>
			
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title mb-4">Kontaktdaten</h3>
					<div class="space-y-3">
						<a href={`mailto:${email}?subject=Initiativbewerbung`} class="flex items-center gap-2 hover:text-secondary transition-colors">
							<Mail class="w-4 h-4" />
							<span>{email}</span>
						</a>
						<a href={`tel:${phone.replace(/[^+\d]/g, '')}`} class="flex items-center gap-2 hover:text-secondary transition-colors">
							<Phone class="w-4 h-4" />
							<span>{phone}</span>
						</a>
						<div class="flex items-start gap-2">
							<MapPin class="w-4 h-4 mt-1 text-base-content/70" />
							<span class="text-base-content/70">{storeAddress}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Contact Form -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h3 class="card-title mb-4 flex items-center gap-2">
					<Send class="w-5 h-5 text-secondary" />
					Erste Kontaktaufnahme
				</h3>
				
				<form onsubmit={handleContactSubmit} class="space-y-4">
					<div class="form-control">
						<label class="label" for="contact-name">
							<span class="label-text">Name *</span>
						</label>
						<input 
							id="contact-name"
							type="text" 
							placeholder="Ihr vollständiger Name" 
							class="input input-bordered" 
							bind:value={contactName}
							required 
						/>
					</div>
					
					<div class="form-control">
						<label class="label" for="contact-email">
							<span class="label-text">E-Mail *</span>
						</label>
						<input 
							id="contact-email"
							type="email" 
							placeholder="ihre.email@beispiel.de" 
							class="input input-bordered" 
							bind:value={contactEmail}
							required 
						/>
					</div>
					
					<div class="form-control">
						<label class="label" for="contact-message">
							<span class="label-text">Nachricht *</span>
						</label>
						<textarea 
							id="contact-message"
							class="textarea textarea-bordered h-32" 
							placeholder="Erzählen Sie uns etwas über sich und Ihr Interesse an einer Mitarbeit bei Zigarren Puro..."
							bind:value={contactMessage}
							required
						></textarea>
					</div>
					
					<div class="form-control mt-6">
						<button 
							type="submit" 
							class="btn btn-secondary"
							disabled={isSubmitting}
						>
							{#if isSubmitting}
								<span class="loading loading-spinner loading-sm"></span>
								Wird gesendet...
							{:else}
								<Send class="w-4 h-4" />
								Nachricht senden
							{/if}
						</button>
					</div>
				</form>
				
				<div class="text-xs text-base-content/60 mt-4">
					* Pflichtfelder. Ihre Daten werden vertraulich behandelt und nur für die Bearbeitung Ihrer Anfrage verwendet.
				</div>
			</div>
		</div>
	</div>

	<!-- Footer Note -->
	<div class="text-center mt-16 pt-8 border-t border-base-300">
		<p class="text-sm text-base-content/60">
			Wir sind ein Arbeitgeber, der Chancengleichheit fördert und Vielfalt schätzt.
		</p>
	</div>
</div>
