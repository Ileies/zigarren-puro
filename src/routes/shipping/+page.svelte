<script lang="ts">
	import {
		Truck,
		Clock,
		MapPin,
		Shield,
		Package,
		AlertTriangle,
		CheckCircle,
		Euro
	} from '@lucide/svelte';
	import { email, phone } from '$lib/config';
</script>

<svelte:head>
	<title>Versand & Lieferung - Zigarren Puro</title>
	<meta name="description" content="Versandoptionen, Lieferzeiten und Kosten bei Zigarren Puro" />
</svelte:head>

<div class="container mx-auto max-w-5xl px-4 py-8">
	<!-- Header -->
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold text-primary">Versand & Lieferung</h1>
		<p class="text-lg text-base-content/70">
			Alles zu Lieferzeiten, Kosten und Besonderheiten bei Tabakwaren
		</p>
	</div>

	<!-- Age Verification Notice -->
	<div class="mb-8 alert alert-warning">
		<AlertTriangle class="h-6 w-6 flex-shrink-0" />
		<div>
			<h3 class="font-bold">Altersverifikation bei der Lieferung</h3>
			<p>
				Tabakwaren dürfen gesetzlich nur an Personen ab 18 Jahren übergeben werden. Der Zusteller
				ist verpflichtet, Ihren Personalausweis zu prüfen. Bitte halten Sie diesen bei der Lieferung
				bereit.
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<div class="space-y-6 lg:col-span-2">
			<!-- Lieferzeiten -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
						<Clock class="h-5 w-5 text-secondary" />
						Lieferzeiten
					</h2>
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th>Region</th>
									<th>Lieferzeit</th>
									<th>Versandart</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<div class="flex items-center gap-2">
											<MapPin class="h-4 w-4 text-secondary" />
											Deutschland
										</div>
									</td>
									<td>2–4 Werktage</td>
									<td>DHL / DPD</td>
								</tr>
								<tr>
									<td>
										<div class="flex items-center gap-2">
											<MapPin class="h-4 w-4 text-secondary" />
											EU (Nachbarländer)
										</div>
									</td>
									<td>3–6 Werktage</td>
									<td>DHL International</td>
								</tr>
								<tr>
									<td>
										<div class="flex items-center gap-2">
											<MapPin class="h-4 w-4 text-secondary" />
											Übriges EU-Ausland
										</div>
									</td>
									<td>5–10 Werktage</td>
									<td>DHL International</td>
								</tr>
							</tbody>
						</table>
					</div>
					<p class="mt-2 text-sm text-base-content/60">
						Werktage: Montag bis Freitag, ohne gesetzliche Feiertage. Bestellungen, die bis 12:00
						Uhr eingehen, werden in der Regel noch am gleichen Tag bearbeitet.
					</p>
				</div>
			</div>

			<!-- Versandkosten -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
						<Euro class="h-5 w-5 text-secondary" />
						Versandkosten
					</h2>
					<div class="space-y-4">
						<div
							class="flex items-start gap-3 rounded-lg border border-success/20 bg-success/10 p-4"
						>
							<CheckCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
							<div>
								<p class="font-semibold text-success">Kostenloser Versand ab 150 €</p>
								<p class="text-sm">
									Für alle Bestellungen innerhalb Deutschlands ab einem Warenwert von 150 € liefern
									wir versandkostenfrei.
								</p>
							</div>
						</div>
						<div class="overflow-x-auto">
							<table class="table">
								<thead>
									<tr>
										<th>Region</th>
										<th>Versandkosten</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>Deutschland</td>
										<td>5,90 €</td>
									</tr>
									<tr>
										<td>Österreich, Niederlande, Belgien, Luxemburg</td>
										<td>9,90 €</td>
									</tr>
									<tr>
										<td>Frankreich, Italien, Spanien, Polen und weitere EU-Länder</td>
										<td>14,90 €</td>
									</tr>
								</tbody>
							</table>
						</div>
						<p class="text-sm text-base-content/60">
							Alle Preise inkl. MwSt. Für Länder, die nicht aufgeführt sind, wird der Versandpreis
							im Checkout berechnet.
						</p>
					</div>
				</div>
			</div>

			<!-- Verpackung -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
						<Package class="h-5 w-5 text-secondary" />
						Verpackung und Sorgfalt
					</h2>
					<div class="prose prose-sm max-w-none space-y-3">
						<p>
							Zigarren und Zigarillos sind empfindliche Naturprodukte, die sachgemäßer Lagerung
							bedürfen. Wir verpacken jede Bestellung sorgfältig:
						</p>
						<ul>
							<li>Klimatisierte Lagerung im Humidor bis zum Versand</li>
							<li>Feuchtigkeitsregulierende Verpackung für den Transport</li>
							<li>Stabile Kartonage zum Schutz vor Beschädigungen</li>
							<li>Diskreter, wertig wirkender Versand ohne Aufdruck des Inhalts</li>
						</ul>
						<p>
							Bitte prüfen Sie die Lieferung bei Erhalt auf sichtbare Transportschäden und nehmen
							Sie beschädigte Sendungen unter Vorbehalt an oder verweigern Sie die Annahme.
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Altersverifikation Details -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-3 card-title flex items-center gap-2 text-lg">
						<Shield class="h-5 w-5 text-secondary" />
						Altersverifikation
					</h2>
					<div class="space-y-3 text-sm">
						<p>Gesetzlich vorgeschrieben für alle Tabakwaren (§ 9 TabakerzG):</p>
						<div class="steps steps-vertical text-xs">
							<div class="step step-primary">Zusteller klingelt an der Tür</div>
							<div class="step step-primary">Personalausweis vorzeigen</div>
							<div class="step step-primary">Volljährigkeit bestätigt → Übergabe</div>
						</div>
						<div class="alert-sm mt-2 alert alert-error">
							<AlertTriangle class="h-4 w-4" />
							<p class="text-xs">
								Bei fehlendem Ausweis oder Minderjährigkeit wird nicht zugestellt. Die
								Rücksendekosten trägt der Kunde.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Kontakt bei Fragen -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-3 card-title flex items-center gap-2 text-lg">
						<Truck class="h-5 w-5 text-secondary" />
						Fragen zur Lieferung?
					</h2>
					<div class="space-y-3 text-sm">
						<p>Unser Team hilft Ihnen gerne weiter:</p>
						<a
							href={`tel:${phone.replace(/[^+\d]/g, '')}`}
							class="flex items-center gap-2 transition-colors hover:text-secondary"
						>
							<span>📞</span>
							<span>{phone}</span>
						</a>
						<a
							href={`mailto:${email}`}
							class="flex items-center gap-2 transition-colors hover:text-secondary"
						>
							<span>✉️</span>
							<span>{email}</span>
						</a>
						<p class="text-xs text-base-content/60">Mo–Fr: 13:00–19:00 Uhr</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
