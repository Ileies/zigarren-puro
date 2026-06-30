<script lang="ts">
	import {
		Mail,
		Users,
		Heart,
		Award,
		Coffee,
		Clock,
		MapPin,
		Briefcase,
		Star,
		Send,
		Phone
	} from '@lucide/svelte';
	import { email, phone, storeAddress } from '$lib/config';
	import { enhance } from '$app/forms';
	import * as m from '$lib/messages';

	let { form }: { form: { success?: boolean; error?: string } | null } = $props();

	let isSubmitting = $state(false);

	const benefits = [
		{
			icon: Heart,
			title: 'Familiäres Arbeitsklima',
			description: 'Persönliche Atmosphäre in einem kleinen, eingespielten Team'
		},
		{
			icon: Award,
			title: 'Expertise entwickeln',
			description: 'Tiefes Wissen über Premium-Zigarren und Tabakkultur'
		},
		{
			icon: Coffee,
			title: 'Flexible Arbeitszeiten',
			description: 'Work-Life-Balance in entspannter Umgebung'
		},
		{
			icon: Users,
			title: 'Kundenkontakt',
			description: 'Beratung von Zigarren-Liebhabern und Kennern'
		}
	];

	const values = [
		{
			icon: Star,
			title: 'Qualität',
			description: 'Wir setzen auf höchste Standards bei Produkten und Service'
		},
		{
			icon: Heart,
			title: 'Leidenschaft',
			description: 'Echte Begeisterung für Zigarren und Tabakkultur'
		},
		{
			icon: Users,
			title: 'Kundenorientierung',
			description: 'Individuelle Beratung und persönlicher Service stehen im Mittelpunkt'
		},
		{
			icon: Award,
			title: 'Expertise',
			description: 'Fundiertes Wissen und kontinuierliche Weiterbildung'
		}
	];
</script>

<svelte:head>
	<title>Karriere - Zigarren Puro</title>
	<meta
		name="description"
		content="Karrieremöglichkeiten bei Zigarren Puro - Werden Sie Teil unseres Teams von Zigarren-Experten"
	/>
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<!-- Header -->
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold text-primary">Karriere bei Zigarren Puro</h1>
		<p class="mx-auto max-w-2xl text-xl text-base-content/70">
			Werden Sie Teil unseres leidenschaftlichen Teams und tauchen Sie ein in die Welt der
			Premium-Zigarren
		</p>
	</div>

	<!-- Current Status -->
	<div class="mb-12 alert alert-info">
		<Briefcase class="h-6 w-6" />
		<div>
			<h3 class="text-lg font-bold">Aktueller Status</h3>
			<p>
				Momentan haben wir keine offenen Stellen zu besetzen. Unser Team ist vollständig und
				arbeitet harmonisch zusammen. Wir freuen uns jedoch über Initiativbewerbungen von
				Zigarren-Enthusiasten!
			</p>
		</div>
	</div>

	<!-- Company Culture -->
	<div class="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
		<div>
			<h2 class="mb-6 text-3xl font-bold text-primary">Unser Arbeitsumfeld</h2>
			<div class="prose prose-lg max-w-none">
				<p class="mb-4 text-base-content/80">
					Bei Zigarren Puro arbeiten Sie in einem einzigartigen Umfeld, wo Tradition auf moderne
					Geschäftspraktiken trifft. Unser Ladengeschäft in Köln ist mehr als nur ein Verkaufsraum –
					es ist ein Ort der Begegnung für Zigarren-Liebhaber aus aller Welt.
				</p>
				<p class="mb-4 text-base-content/80">
					Als kleines, aber feines Unternehmen legen wir Wert auf persönliche Entwicklung, fachliche
					Expertise und ein respektvolles Miteinander. Jeder Mitarbeiter ist ein wichtiger Teil
					unseres Erfolgs.
				</p>
			</div>
		</div>

		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h3 class="mb-4 card-title flex items-center gap-2 text-xl">
					<MapPin class="h-5 w-5 text-secondary" />
					Unser Standort
				</h3>
				<div class="space-y-3">
					<p class="text-base-content/80">
						{storeAddress.split(', ')[0]}<br />
						{storeAddress.split(', ')[1]}<br />
						{storeAddress.split(', ')[2]}
					</p>
					<div class="rounded-lg bg-base-200 p-3">
						<div class="mb-2 flex items-center gap-2">
							<Clock class="h-4 w-4 text-secondary" />
							<span class="font-semibold">Arbeitszeiten:</span>
						</div>
						<p class="text-sm">
							Mo-Sa: 13:00 - 19:00 Uhr<br />
							So: Geschlossen
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Benefits -->
	<div class="mb-16">
		<h2 class="mb-8 text-center text-3xl font-bold text-primary">Was wir bieten</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{#each benefits as benefit (benefit.title)}
				{@const IconComponent = benefit.icon}
				<div class="card bg-base-100 shadow-lg transition-shadow hover:shadow-xl">
					<div class="card-body text-center">
						<div class="mb-4 flex justify-center">
							<div class="rounded-full bg-secondary/10 p-3">
								<IconComponent class="h-6 w-6 text-secondary" />
							</div>
						</div>
						<h3 class="mb-2 card-title justify-center text-lg">{benefit.title}</h3>
						<p class="text-sm text-base-content/70">{benefit.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Company Values -->
	<div class="mb-16">
		<h2 class="mb-8 text-center text-3xl font-bold text-primary">Unsere Werte</h2>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			{#each values as value (value.title)}
				{@const IconComponent = value.icon}
				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<div class="flex items-start gap-4">
							<div class="flex-shrink-0 rounded-full bg-primary/10 p-3">
								<IconComponent class="h-5 w-5 text-primary" />
							</div>
							<div>
								<h3 class="mb-2 card-title text-lg">{value.title}</h3>
								<p class="text-sm text-base-content/70">{value.description}</p>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Ideal Candidate -->
	<div class="card mb-16 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg">
		<div class="card-body">
			<h2 class="mb-8 text-center text-3xl font-bold text-primary">Wen wir suchen</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div>
					<h3 class="mb-4 text-xl font-semibold text-secondary">Persönliche Eigenschaften</h3>
					<ul class="space-y-2">
						<li class="flex items-center gap-2">
							<div class="h-2 w-2 rounded-full bg-secondary"></div>
							<span>Leidenschaft für Zigarren und Tabakkultur</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="h-2 w-2 rounded-full bg-secondary"></div>
							<span>Freude am Umgang mit Menschen</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="h-2 w-2 rounded-full bg-secondary"></div>
							<span>Interesse an Beratung und Verkauf</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="h-2 w-2 rounded-full bg-secondary"></div>
							<span>Zuverlässigkeit und Teamgeist</span>
						</li>
					</ul>
				</div>
				<div>
					<h3 class="mb-4 text-xl font-semibold text-secondary">Wünschenswerte Qualifikationen</h3>
					<ul class="space-y-2">
						<li class="flex items-center gap-2">
							<div class="h-2 w-2 rounded-full bg-secondary"></div>
							<span>Erfahrung im Einzelhandel</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="h-2 w-2 rounded-full bg-secondary"></div>
							<span>Kenntnisse über Zigarrenmarken</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="h-2 w-2 rounded-full bg-secondary"></div>
							<span>Mehrsprachigkeit (DE, EN)</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="h-2 w-2 rounded-full bg-secondary"></div>
							<span>Flexibilität bei Arbeitszeiten</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<!-- Contact Section -->
	<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
		<div>
			<h2 class="mb-6 text-3xl font-bold text-primary">Initiativbewerbung</h2>
			<div class="prose mb-6 max-w-none">
				<p class="text-base-content/80">
					Auch wenn wir aktuell keine offenen Stellen haben, freuen wir uns über
					Initiativbewerbungen von Menschen, die unsere Leidenschaft für Premium-Zigarren teilen.
				</p>
				<p class="text-base-content/80">
					Senden Sie uns gerne Ihre Bewerbungsunterlagen oder nehmen Sie zunächst unverbindlich
					Kontakt mit uns auf. Wir melden uns bei passenden Gelegenheiten gerne bei Ihnen.
				</p>
			</div>

			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="mb-4 card-title">Kontaktdaten</h3>
					<div class="space-y-3">
						<a
							href={`mailto:${email}?subject=Initiativbewerbung`}
							class="flex items-center gap-2 transition-colors hover:text-secondary"
						>
							<Mail class="h-4 w-4" />
							<span>{email}</span>
						</a>
						<a
							href={`tel:${phone.replace(/[^+\d]/g, '')}`}
							class="flex items-center gap-2 transition-colors hover:text-secondary"
						>
							<Phone class="h-4 w-4" />
							<span>{phone}</span>
						</a>
						<div class="flex items-start gap-2">
							<MapPin class="mt-1 h-4 w-4 text-base-content/70" />
							<span class="text-base-content/70">{storeAddress}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Contact Form -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h3 class="mb-4 card-title flex items-center gap-2">
					<Send class="h-5 w-5 text-secondary" />
					Erste Kontaktaufnahme
				</h3>

				{#if form?.success}
					<div class="alert alert-success" role="status">
						<span>{m.careerMessageSent()}</span>
					</div>
				{:else}
					{#if form?.error}
						<div class="mb-4 alert alert-error" role="alert">
							<span>{form.error}</span>
						</div>
					{/if}

					<form
						method="POST"
						class="space-y-4"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ update }) => {
								isSubmitting = false;
								await update();
							};
						}}
					>
						<!-- Honeypot -->
						<input type="text" name="company" class="hidden" tabindex="-1" autocomplete="off" />

						<div class="form-control">
							<label class="label" for="contact-name">
								<span class="label-text">Name *</span>
							</label>
							<input
								id="contact-name"
								type="text"
								name="name"
								placeholder="Ihr vollständiger Name"
								class="input-bordered input"
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
								name="email"
								placeholder="ihre.email@beispiel.de"
								class="input-bordered input"
								required
							/>
						</div>

						<div class="form-control">
							<label class="label" for="contact-message">
								<span class="label-text">Nachricht *</span>
							</label>
							<textarea
								id="contact-message"
								name="message"
								class="textarea-bordered textarea h-32"
								placeholder="Erzählen Sie uns etwas über sich und Ihr Interesse an einer Mitarbeit bei Zigarren Puro..."
								required
							></textarea>
						</div>

						<div class="form-control mt-6">
							<button type="submit" class="btn btn-secondary" disabled={isSubmitting}>
								{#if isSubmitting}
									<span class="loading loading-sm loading-spinner"></span>
									Wird gesendet...
								{:else}
									<Send class="h-4 w-4" />
									Nachricht senden
								{/if}
							</button>
						</div>
					</form>

					<div class="mt-4 text-xs text-base-content/60">
						* Pflichtfelder. Ihre Daten werden vertraulich behandelt und nur für die Bearbeitung
						Ihrer Anfrage verwendet.
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Footer Note -->
	<div class="mt-16 border-t border-base-300 pt-8 text-center">
		<p class="text-sm text-base-content/60">
			Wir sind ein Arbeitgeber, der Chancengleichheit fördert und Vielfalt schätzt.
		</p>
	</div>
</div>
