<script lang="ts">
	import { MapPin, Mail, Phone, Clock, Send, Car, Train } from '@lucide/svelte';
	import Map from '$lib/components/Map.svelte';
	export let form: any;

	const addressLines = [
		'Zigarren Puro',
		'Richard-Wagner-Str. 11',
		'50674 Köln'
	];

	const openingHours = [
		{ day: 'Mo–Sa', hours: '13:00 – 19:00' },
		{ day: 'So', hours: 'Geschlossen' }
	];

	const topics = [
		{ value: 'info', label: 'Allgemeine Anfragen' },
		{ value: 'beratung', label: 'Produktberatung' },
		{ value: 'events', label: 'Events & Tastings' },
		{ value: 'bestellungen', label: 'Bestellungen & Versand' },
		{ value: 'rechtliches', label: 'Rechtliche Fragen' },
		{ value: 'support', label: 'Technischer Support' }
	];
</script>

<svelte:head>
	<title>Kontakt | Zigarren Puro</title>
	<meta name="description" content="Kontaktieren Sie Zigarren Puro – wir beraten Sie gern persönlich zu Zigarren, Accessoires und Tastings." />
</svelte:head>

<section class="bg-base-200">
	<div class="container mx-auto px-6 py-12 lg:py-16">
		<div class="max-w-6xl mx-auto">
			<div class="text-center mb-10">
				<h1 class="text-3xl lg:text-4xl font-bold text-base-content">Kontakt</h1>
				<p class="text-base-content/80 mt-3 max-w-3xl mx-auto">
					Wir freuen uns auf Ihre Nachricht. Ob Beratung, Bestellung oder Events – wir sind für Sie da.
				</p>
			</div>

			{#if form?.success}
				<div class="alert alert-success mb-6" role="status">
					<span>Vielen Dank! Ihre Nachricht wurde erfolgreich versendet.</span>
				</div>
			{:else if form?.error}
				<div class="alert alert-error mb-6" role="alert">
					<span>{form.error}</span>
				</div>
			{/if}

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
				<!-- Contact Form -->
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title">Schreiben Sie uns</h2>
						<p class="text-base-content/70 mb-4">
							Haben Sie Fragen zu unseren Produkten oder benötigen eine persönliche Beratung? 
							Wir helfen Ihnen gerne weiter und antworten meist innerhalb von 24 Stunden.
						</p>
						<form method="POST" class="space-y-6">
							<!-- Honeypot -->
							<input type="text" name="company" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />

							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div class="form-control w-full">
									<label class="label" for="contact-name">
										<span class="label-text">Ihr Name</span>
									</label>
									<input id="contact-name" name="name" required class="input input-bordered w-full" placeholder="Max Mustermann" />
								</div>
								<div class="form-control w-full">
									<label class="label" for="contact-email">
										<span class="label-text">E-Mail</span>
									</label>
									<input id="contact-email" name="email" type="email" required class="input input-bordered w-full" placeholder="max@example.com" />
								</div>
							</div>

							<div class="form-control w-full">
								<label class="label" for="contact-topic">
									<span class="label-text">Thema</span>
								</label>
								<select id="contact-topic" name="topic" class="select select-bordered w-full" required>
									<option disabled selected>Wählen Sie ein Thema</option>
									{#each topics as topic}
										<option value={topic.value}>{topic.label}</option>
									{/each}
								</select>
							</div>

							<div class="form-control w-full">
								<label class="label" for="contact-subject">
									<span class="label-text">Betreff</span>
								</label>
								<input id="contact-subject" name="subject" class="input input-bordered w-full" placeholder="Frage zu ..." />
							</div>

							<div class="form-control w-full">
								<label class="label" for="contact-message">
									<span class="label-text">Nachricht</span>
								</label>
								<textarea id="contact-message" name="message" required class="textarea textarea-bordered min-h-40 w-full" placeholder="Wie können wir helfen?"></textarea>
							</div>

							<div class="form-control mb-8">
								<label class="label cursor-pointer justify-start gap-3">
									<input type="checkbox" name="consent" class="checkbox checkbox-xs" required />
									<span class="label-text text-sm">Ich stimme der <a href="/privacy" class="link">Datenschutzerklärung</a> zu.</span>
								</label>
							</div>

							<div class="form-control">
								<button class="btn btn-primary w-full">
									<Send class="w-4 h-4" />
									<span>Nachricht senden</span>
								</button>
							</div>
						</form>
					</div>
				</div>

				<!-- Contact Details -->
				<div class="space-y-6">
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title">So erreichen Sie uns</h2>
							<div class="space-y-4">
								<div class="flex items-start gap-3">
									<MapPin class="w-5 h-5 text-primary mt-0.5" />
									<div class="text-base-content/80">
										{#each addressLines as line}
											<div>{line}</div>
										{/each}
									</div>
								</div>
								<div class="flex items-center gap-3">
									<Phone class="w-5 h-5 text-primary" />
									<a href="tel:+492213985684" class="link">+49 221 3985684</a>
								</div>
								<div class="flex items-center gap-3">
									<Mail class="w-5 h-5 text-primary" />
									<a href="mailto:info@zigarren-puro.de" class="link">info@zigarren-puro.de</a>
								</div>
							</div>
						</div>
					</div>

					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h3 class="card-title flex items-center gap-2"><Clock class="w-5 h-5" /> Öffnungszeiten</h3>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
								{#each openingHours as item}
									<div class="flex items-center justify-between p-3 rounded-lg bg-base-200">
										<span class="font-medium">{item.day}</span>
										<span class="text-base-content/70">{item.hours}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>

					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h3 class="card-title flex items-center gap-2"><Car class="w-5 h-5" /> Anfahrt & Parken</h3>
							<div class="space-y-4 mt-2">
								<div class="flex items-start gap-3">
									<Train class="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
									<div class="text-sm">
										<div class="font-medium mb-1">Öffentliche Verkehrsmittel</div>
										<div class="text-base-content/70">Direkt hinter dem Kölner Hauptbahnhof - nur 2 Min. zu Fuß vom Bahnhof</div>
									</div>
								</div>
								<div class="flex items-start gap-3">
									<Car class="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
									<div class="text-sm">
										<div class="font-medium mb-1">Parken</div>
										<div class="text-base-content/70 space-y-1">
											<div>• Parkhaus Hauptbahnhof (3 Min. Fußweg)</div>
											<div>• Parkhaus am Dom (5 Min. Fußweg)</div>
											<div>• Begrenzte Straßenparkplätze verfügbar</div>
										</div>
									</div>
								</div>
								<div class="bg-info/10 p-3 rounded-lg">
									<div class="text-sm text-info-content">
										<strong>Tipp:</strong> Am besten mit der Bahn anreisen - wir sind super zentral gelegen!
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="container mx-auto px-6 pb-12 lg:pb-16">
		<div class="max-w-6xl mx-auto overflow-hidden rounded-2xl shadow-2xl">
			<Map width="100%" height="420" />
		</div>
	</div>
</section>
