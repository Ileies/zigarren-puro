<script lang="ts">
	import { MapPin, Mail, Phone, Clock, Send, Car, Train } from '@lucide/svelte';
	import Map from '$lib/components/Map.svelte';
	export let form: any;

	const addressLines = ['Zigarren Puro', 'Richard-Wagner-Str. 11', '50674 Köln'];

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
	<meta
		name="description"
		content="Kontaktieren Sie Zigarren Puro – wir beraten Sie gern persönlich zu Zigarren, Accessoires und Tastings."
	/>
</svelte:head>

<section class="bg-base-200">
	<div class="container mx-auto px-6 py-12 lg:py-16">
		<div class="mx-auto max-w-6xl">
			<div class="mb-10 text-center">
				<h1 class="text-3xl font-bold text-base-content lg:text-4xl">Kontakt</h1>
				<p class="mx-auto mt-3 max-w-3xl text-base-content/80">
					Wir freuen uns auf Ihre Nachricht. Ob Beratung, Bestellung oder Events – wir sind für Sie
					da.
				</p>
			</div>

			{#if form?.success}
				<div class="mb-6 alert alert-success" role="status">
					<span>Vielen Dank! Ihre Nachricht wurde erfolgreich versendet.</span>
				</div>
			{:else if form?.error}
				<div class="mb-6 alert alert-error" role="alert">
					<span>{form.error}</span>
				</div>
			{/if}

			<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
				<!-- Contact Form -->
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title">Schreiben Sie uns</h2>
						<p class="mb-4 text-base-content/70">
							Haben Sie Fragen zu unseren Produkten oder benötigen eine persönliche Beratung? Wir
							helfen Ihnen gerne weiter und antworten meist innerhalb von 24 Stunden.
						</p>
						<form method="POST" class="space-y-6">
							<!-- Honeypot -->
							<input
								type="text"
								name="company"
								tabindex="-1"
								autocomplete="off"
								class="hidden"
								aria-hidden="true"
							/>

							<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div class="form-control w-full">
									<label class="label" for="contact-name">
										<span class="label-text">Ihr Name</span>
									</label>
									<input
										id="contact-name"
										name="name"
										required
										class="input-bordered input w-full"
										placeholder="Max Mustermann"
									/>
								</div>
								<div class="form-control w-full">
									<label class="label" for="contact-email">
										<span class="label-text">E-Mail</span>
									</label>
									<input
										id="contact-email"
										name="email"
										type="email"
										required
										class="input-bordered input w-full"
										placeholder="max@example.com"
									/>
								</div>
							</div>

							<div class="form-control w-full">
								<label class="label" for="contact-topic">
									<span class="label-text">Thema</span>
								</label>
								<select
									id="contact-topic"
									name="topic"
									class="select-bordered select w-full"
									required
								>
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
								<input
									id="contact-subject"
									name="subject"
									class="input-bordered input w-full"
									placeholder="Frage zu ..."
								/>
							</div>

							<div class="form-control w-full">
								<label class="label" for="contact-message">
									<span class="label-text">Nachricht</span>
								</label>
								<textarea
									id="contact-message"
									name="message"
									required
									class="textarea-bordered textarea min-h-40 w-full"
									placeholder="Wie können wir helfen?"
								></textarea>
							</div>

							<div class="form-control mb-8">
								<label class="label cursor-pointer justify-start gap-3">
									<input type="checkbox" name="consent" class="checkbox checkbox-xs" required />
									<span class="label-text text-sm"
										>Ich stimme der <a href="/privacy" class="link">Datenschutzerklärung</a> zu.</span
									>
								</label>
							</div>

							<div class="form-control">
								<button class="btn w-full btn-primary">
									<Send class="h-4 w-4" />
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
									<MapPin class="mt-0.5 h-5 w-5 text-primary" />
									<div class="text-base-content/80">
										{#each addressLines as line}
											<div>{line}</div>
										{/each}
									</div>
								</div>
								<div class="flex items-center gap-3">
									<Phone class="h-5 w-5 text-primary" />
									<a href="tel:+492213985684" class="link">+49 221 3985684</a>
								</div>
								<div class="flex items-center gap-3">
									<Mail class="h-5 w-5 text-primary" />
									<a href="mailto:info@zigarren-puro.de" class="link">info@zigarren-puro.de</a>
								</div>
							</div>
						</div>
					</div>

					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h3 class="card-title flex items-center gap-2">
								<Clock class="h-5 w-5" /> Öffnungszeiten
							</h3>
							<div class="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
								{#each openingHours as item}
									<div class="flex items-center justify-between rounded-lg bg-base-200 p-3">
										<span class="font-medium">{item.day}</span>
										<span class="text-base-content/70">{item.hours}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>

					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h3 class="card-title flex items-center gap-2">
								<Car class="h-5 w-5" /> Anfahrt & Parken
							</h3>
							<div class="mt-2 space-y-4">
								<div class="flex items-start gap-3">
									<Train class="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
									<div class="text-sm">
										<div class="mb-1 font-medium">Öffentliche Verkehrsmittel</div>
										<div class="text-base-content/70">
											Direkt hinter dem Kölner Hauptbahnhof - nur 2 Min. zu Fuß vom Bahnhof
										</div>
									</div>
								</div>
								<div class="flex items-start gap-3">
									<Car class="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
									<div class="text-sm">
										<div class="mb-1 font-medium">Parken</div>
										<div class="space-y-1 text-base-content/70">
											<div>• Parkhaus Hauptbahnhof (3 Min. Fußweg)</div>
											<div>• Parkhaus am Dom (5 Min. Fußweg)</div>
											<div>• Begrenzte Straßenparkplätze verfügbar</div>
										</div>
									</div>
								</div>
								<div class="rounded-lg bg-info/10 p-3">
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
		<div class="mx-auto max-w-6xl overflow-hidden rounded-2xl shadow-2xl">
			<Map width="100%" height="420" />
		</div>
	</div>
</section>
