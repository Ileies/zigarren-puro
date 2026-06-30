<script lang="ts">
	import {
		RefreshCcw,
		AlertTriangle,
		CheckCircle,
		XCircle,
		Package,
		Mail,
		Phone,
		Clock,
		CreditCard
	} from '@lucide/svelte';
	import { email, phone } from '$lib/config';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Rückgabe & Umtausch - Zigarren Puro</title>
	<meta name="description" content="Rückgabe- und Umtauschbedingungen bei Zigarren Puro" />
</svelte:head>

<div class="container mx-auto max-w-5xl px-4 py-8">
	<!-- Header -->
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold text-primary">Rückgabe & Umtausch</h1>
		<p class="text-lg text-base-content/70">Was kann zurückgegeben werden – und wie</p>
	</div>

	<!-- Tobacco Exclusion Notice -->
	<div class="mb-8 alert alert-error">
		<XCircle class="h-6 w-6 flex-shrink-0" />
		<div>
			<h3 class="text-lg font-bold">Tabakwaren vom Rückgaberecht ausgeschlossen</h3>
			<p>
				Zigarren, Zigarillos, Zigaretten und alle anderen Tabakerzeugnisse können aus hygienischen
				und rechtlichen Gründen (§ 312g Abs. 2 Nr. 2 BGB) <strong>nicht</strong> zurückgegeben oder umgetauscht
				werden. Dies gilt auch für ungeöffnete Packungen.
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<div class="space-y-6 lg:col-span-2">
			<!-- Was kann zurückgegeben werden -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
						<RefreshCcw class="h-5 w-5 text-secondary" />
						Was kann zurückgegeben werden?
					</h2>
					<div class="space-y-3">
						<div
							class="flex items-start gap-3 rounded-lg border border-success/20 bg-success/10 p-3"
						>
							<CheckCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
							<div class="text-sm">
								<p class="font-semibold text-success">Zubehör & Accessoires</p>
								<p class="text-base-content/70">
									Aschenbecher, Humidore, Feuerzeuge, Zigarrenschneider, Aufbewahrungsboxen –
									innerhalb von 14 Tagen nach Erhalt, unbenutzt und in Originalverpackung.
								</p>
							</div>
						</div>
						<div
							class="flex items-start gap-3 rounded-lg border border-success/20 bg-success/10 p-3"
						>
							<CheckCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
							<div class="text-sm">
								<p class="font-semibold text-success">Spirituosen (ungeöffnet)</p>
								<p class="text-base-content/70">
									Ungeöffnete Spirituosen können innerhalb von 14 Tagen zurückgegeben werden, sofern
									das Originalsiegel unbeschädigt ist.
								</p>
							</div>
						</div>
						<div class="flex items-start gap-3 rounded-lg border border-error/20 bg-error/10 p-3">
							<XCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-error" />
							<div class="text-sm">
								<p class="font-semibold text-error">Tabakwaren – nicht möglich</p>
								<p class="text-base-content/70">
									Zigarren, Zigarillos, Pfeifentabak und alle weiteren Tabakerzeugnisse sind
									gesetzlich vom Widerrufsrecht ausgeschlossen.
								</p>
							</div>
						</div>
						<div class="flex items-start gap-3 rounded-lg border border-error/20 bg-error/10 p-3">
							<XCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-error" />
							<div class="text-sm">
								<p class="font-semibold text-error">Geöffnete oder benutzte Artikel</p>
								<p class="text-base-content/70">
									Artikel, die geöffnet, benutzt oder deren Originalverpackung beschädigt wurde,
									können nicht zurückgenommen werden.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Rückgabe-Prozess -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
						<Package class="h-5 w-5 text-secondary" />
						So funktioniert die Rückgabe
					</h2>
					<div class="space-y-4">
						<ul class="steps steps-vertical w-full">
							<li class="step step-primary">
								<div class="pl-4 text-left">
									<p class="font-semibold">Rückgabe ankündigen</p>
									<p class="text-sm text-base-content/60">
										Kontaktieren Sie uns per E-Mail oder Telefon mit Ihrer Bestellnummer und dem
										Grund der Rückgabe.
									</p>
								</div>
							</li>
							<li class="step step-primary">
								<div class="pl-4 text-left">
									<p class="font-semibold">Rücksendung verpacken</p>
									<p class="text-sm text-base-content/60">
										Packen Sie den Artikel sorgfältig in die Originalverpackung. Legen Sie Ihre
										Bestellnummer bei.
									</p>
								</div>
							</li>
							<li class="step">
								<div class="pl-4 text-left">
									<p class="font-semibold">Paket absenden</p>
									<p class="text-sm text-base-content/60">
										Senden Sie das Paket an unsere Rücksendeadresse (s. rechts). Die Versandkosten
										tragen Sie als Kunde.
									</p>
								</div>
							</li>
							<li class="step">
								<div class="pl-4 text-left">
									<p class="font-semibold">Erstattung erhalten</p>
									<p class="text-sm text-base-content/60">
										Nach Eingang und Prüfung der Ware erstatten wir den Kaufpreis innerhalb von 14
										Tagen auf dem ursprünglichen Zahlungsweg.
									</p>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- Transportschäden -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
						<AlertTriangle class="h-5 w-5 text-secondary" />
						Transportschäden
					</h2>
					<div class="prose prose-sm max-w-none space-y-3">
						<p>Wenn Ihre Lieferung sichtbar beschädigt ankommt, gehen Sie bitte wie folgt vor:</p>
						<ul>
							<li>
								Nehmen Sie das Paket <strong>unter Vorbehalt</strong> an und lassen Sie sich den Schaden
								vom Zusteller bestätigen
							</li>
							<li>Dokumentieren Sie den Schaden mit Fotos (Außenverpackung und Inhalt)</li>
							<li>Kontaktieren Sie uns innerhalb von <strong>48 Stunden</strong> nach Erhalt</li>
						</ul>
						<p>Bei Transportschäden übernehmen wir die Kosten für Ersatz oder Rückerstattung.</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Rücksendeadresse -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-3 card-title flex items-center gap-2 text-lg">
						<Package class="h-5 w-5 text-secondary" />
						Rücksendeadresse
					</h2>
					<div class="rounded-lg bg-base-200 p-4 text-sm">
						<p>
							Purro International GmbH<br />
							– Retouren –<br />
							Merkenicher Hauptstraße 90<br />
							50769 Köln<br />
							Deutschland
						</p>
					</div>
					<p class="mt-2 text-xs text-base-content/60">
						Bitte legen Sie immer Ihre Bestellnummer bei.
					</p>
				</div>
			</div>

			<!-- Erstattung -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-3 card-title flex items-center gap-2 text-lg">
						<CreditCard class="h-5 w-5 text-secondary" />
						Erstattung
					</h2>
					<div class="space-y-2 text-sm">
						<div class="flex items-center gap-2">
							<Clock class="h-4 w-4 text-secondary" />
							<span>Binnen 14 Tagen nach Wareneingang</span>
						</div>
						<p class="text-base-content/60">
							Die Rückzahlung erfolgt über dasselbe Zahlungsmittel, das Sie bei der Bestellung
							verwendet haben.
						</p>
						<p class="text-xs text-base-content/60">
							Rücksendekosten (ca. 5,90–9,90 €) werden nicht erstattet, außer bei Transportschäden
							oder Falschlieferungen.
						</p>
					</div>
				</div>
			</div>

			<!-- Kontakt -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-3 card-title flex items-center gap-2 text-lg">
						<Mail class="h-5 w-5 text-secondary" />
						Kontakt
					</h2>
					<div class="space-y-3 text-sm">
						<a
							href={`mailto:${email}?subject=Rückgabe`}
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
						<p class="text-xs text-base-content/60">Mo–Fr: 13:00–19:00 Uhr</p>
					</div>
				</div>
			</div>

			<!-- Link zur Widerrufsbelehrung -->
			<div class="card border border-secondary/30 bg-base-100 shadow-lg">
				<div class="card-body">
					<p class="text-sm">
						Vollständige rechtliche Informationen finden Sie in unserer <a
							href={resolve('/cancellation')}
							class="link font-medium link-secondary">Widerrufsbelehrung</a
						>.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
