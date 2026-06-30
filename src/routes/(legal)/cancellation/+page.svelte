<script lang="ts">
	import {
		Mail,
		Clock,
		FileText,
		AlertTriangle,
		Package,
		CreditCard,
		Truck,
		Shield,
		Phone
	} from '@lucide/svelte';
	import { phone, email } from '$lib/config';
</script>

<svelte:head>
	<title>Widerrufsrecht - Zigarren Puro</title>
	<meta
		name="description"
		content="Widerrufsbelehrung und Informationen zum Widerrufsrecht bei Zigarren Puro"
	/>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<!-- Header -->
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold text-primary">Widerrufsrecht</h1>
		<p class="text-lg text-base-content/70">Widerrufsbelehrung für Verbraucher</p>
	</div>

	<!-- Important Notice for Tobacco Products -->
	<div class="mb-8 alert alert-warning">
		<AlertTriangle class="h-6 w-6" />
		<div>
			<h3 class="text-lg font-bold">Wichtiger Hinweis zu Tabakwaren</h3>
			<p>
				<strong>Tabakwaren sind vom Widerrufsrecht ausgeschlossen</strong>, da sie aus hygienischen
				Gründen nicht für eine Rückgabe geeignet sind und schnell verderben können. Dies gilt gemäß
				§ 312g Abs. 2 Nr. 2 BGB.
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Main Withdrawal Information -->
		<div class="space-y-8 lg:col-span-2">
			<!-- Withdrawal Right -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-6 card-title flex items-center gap-2 text-2xl">
						<Shield class="h-6 w-6 text-secondary" />
						Widerrufsrecht
					</h2>

					<div class="prose prose-sm max-w-none">
						<p class="mb-4 text-base">
							Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
							widerrufen.
						</p>

						<div class="mb-4 rounded-lg bg-base-200 p-4">
							<p class="mb-2 font-semibold">Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag:</p>
							<ul class="list-inside list-disc space-y-1 text-sm">
								<li>
									an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die
									Waren in Besitz genommen haben bzw. hat
								</li>
								<li>
									bei mehreren Waren einer einheitlichen Bestellung: an dem Sie oder ein von Ihnen
									benannter Dritter die letzte Ware in Besitz genommen haben bzw. hat
								</li>
								<li>
									bei Waren, die in mehreren Teilsendungen geliefert werden: an dem Sie oder ein von
									Ihnen benannter Dritter die letzte Teilsendung in Besitz genommen haben bzw. hat
								</li>
							</ul>
						</div>

						<p class="text-base">
							Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Purro International GmbH, Merkenicher
							Hauptstraße 90, 50769 Köln, Deutschland, Telefon: {phone}, E-Mail: {email}) mittels
							einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief oder E-Mail) über
							Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
						</p>

						<p class="mt-4 text-base">
							Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht
							vorgeschrieben ist.
						</p>
					</div>
				</div>
			</div>

			<!-- Withdrawal Deadline -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-6 card-title flex items-center gap-2 text-2xl">
						<Clock class="h-6 w-6 text-secondary" />
						Widerrufsfrist
					</h2>

					<div class="prose prose-sm max-w-none">
						<p class="mb-4 text-base">
							Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die
							Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
						</p>

						<div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="rounded-lg border border-success/20 bg-success/10 p-4">
								<h4 class="mb-2 font-semibold text-success">Fristwahrend</h4>
								<p class="text-sm">Mitteilung vor Ablauf der 14-Tage-Frist abgesendet</p>
							</div>
							<div class="rounded-lg border border-error/20 bg-error/10 p-4">
								<h4 class="mb-2 font-semibold text-error">Zu spät</h4>
								<p class="text-sm">Mitteilung nach Ablauf der 14-Tage-Frist abgesendet</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Consequences of Withdrawal -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-6 card-title flex items-center gap-2 text-2xl">
						<CreditCard class="h-6 w-6 text-secondary" />
						Folgen des Widerrufs
					</h2>

					<div class="prose prose-sm max-w-none">
						<p class="mb-4 text-base">
							Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
							erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten,
							die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns
							angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens
							binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren
							Widerruf dieses Vertrags bei uns eingegangen ist.
						</p>

						<div class="mb-4 rounded-lg bg-base-200 p-4">
							<h4 class="mb-2 font-semibold">Rückzahlungsmodalitäten:</h4>
							<ul class="list-inside list-disc space-y-1 text-sm">
								<li>
									Rückzahlung mit demselben Zahlungsmittel, das Sie bei der ursprünglichen
									Transaktion eingesetzt haben
								</li>
								<li>Keine Entgelte für die Rückzahlung</li>
								<li>Rückzahlung erst nach Erhalt der Waren oder Nachweis der Rücksendung</li>
							</ul>
						</div>

						<p class="text-base">
							Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab
							dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns
							zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf
							der Frist von vierzehn Tagen absenden.
						</p>

						<div class="mt-4 alert alert-info">
							<Package class="h-5 w-5" />
							<div>
								<h4 class="font-bold">Rücksendekosten</h4>
								<p class="text-sm">
									Sie tragen die unmittelbaren Kosten der Rücksendung der Waren. Die Kosten werden
									auf höchstens etwa 15 Euro geschätzt.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Exclusions -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-6 card-title flex items-center gap-2 text-2xl">
						<AlertTriangle class="h-6 w-6 text-secondary" />
						Ausschluss des Widerrufsrechts
					</h2>

					<div class="prose prose-sm max-w-none">
						<p class="mb-4 text-base">Das Widerrufsrecht besteht nicht bei folgenden Verträgen:</p>

						<div class="space-y-4">
							<div class="rounded-lg border border-error/20 bg-error/10 p-4">
								<h4 class="mb-2 flex items-center gap-2 font-semibold text-error">
									<Package class="h-4 w-4" />
									Tabakwaren
								</h4>
								<p class="text-sm">
									Zigarren, Zigarillos, Zigaretten und andere Tabakerzeugnisse sind aus hygienischen
									Gründen und aufgrund ihrer schnellen Verderblichkeit vom Widerrufsrecht
									ausgeschlossen (§ 312g Abs. 2 Nr. 2 BGB).
								</p>
							</div>

							<div class="rounded-lg border border-warning/20 bg-warning/10 p-4">
								<h4 class="mb-2 font-semibold text-warning">Weitere Ausschlüsse</h4>
								<ul class="list-inside list-disc space-y-1 text-sm">
									<li>
										Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle
										Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist
									</li>
									<li>
										Waren, die schnell verderben können oder deren Verfallsdatum schnell
										überschritten würde
									</li>
									<li>
										Waren, die aus hygienischen Gründen nicht zur Rückgabe geeignet sind, wenn sie
										entsiegelt wurden
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Sidebar with Forms and Contact -->
		<div class="space-y-8">
			<!-- Contact for Withdrawal -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
						<Mail class="h-5 w-5 text-secondary" />
						Widerruf kontaktieren
					</h2>

					<div class="space-y-3">
						<div>
							<h4 class="font-semibold">Purro International GmbH</h4>
							<p class="text-sm text-base-content/70">
								Merkenicher Hauptstraße 90<br />50769 Köln<br />Deutschland
							</p>
						</div>

						<div class="divider"></div>

						<div class="space-y-2">
							<a
								href={`tel:${phone.replace(/[^+\d]/g, '')}`}
								class="flex items-center gap-2 transition-colors hover:text-secondary"
							>
								<Phone class="h-4 w-4" />
								<span>{phone}</span>
							</a>
							<a
								href={`mailto:${email}?subject=Widerruf`}
								class="flex items-center gap-2 transition-colors hover:text-secondary"
							>
								<Mail class="h-4 w-4" />
								<span>{email}</span>
							</a>
						</div>
					</div>
				</div>
			</div>

			<!-- Withdrawal Form Template -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
						<FileText class="h-5 w-5 text-secondary" />
						Muster-Widerrufsformular
					</h2>

					<div class="rounded-lg bg-base-200 p-4 text-sm">
						<p class="mb-3 font-semibold">An:</p>
						<p class="mb-4">
							Purro International GmbH<br />
							Merkenicher Hauptstraße 90<br />
							50769 Köln<br />
							Deutschland<br />
							E-Mail: {email}
						</p>

						<p class="mb-3">
							Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den
							Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)
						</p>

						<div class="mb-4 space-y-2">
							<p>– Bestellt am (*)/erhalten am (*) _____________</p>
							<p>– Name des/der Verbraucher(s) _____________</p>
							<p>– Anschrift des/der Verbraucher(s) _____________</p>
							<p>
								– Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier) _____________
							</p>
							<p>– Datum _____________</p>
						</div>

						<p class="text-xs italic">(*) Unzutreffendes streichen.</p>
					</div>

					<div class="mt-4">
						<button class="btn btn-sm btn-secondary" on:click={() => window.print()}>
							<FileText class="h-4 w-4" />
							Formular drucken
						</button>
					</div>
				</div>
			</div>

			<!-- Return Process -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
						<Truck class="h-5 w-5 text-secondary" />
						Rücksendung
					</h2>

					<div class="space-y-3 text-sm">
						<div class="steps steps-vertical">
							<div class="step step-primary">Widerruf erklären</div>
							<div class="step">Ware verpacken</div>
							<div class="step">Rücksendung binnen 14 Tagen</div>
							<div class="step">Rückerstattung erhalten</div>
						</div>

						<div class="mt-4 rounded-lg border border-info/20 bg-info/10 p-3">
							<p class="mb-1 font-semibold text-info">Rücksendeadresse:</p>
							<p class="text-xs">
								Purro International GmbH<br />
								Retouren<br />
								Merkenicher Hauptstraße 90<br />
								50769 Köln<br />
								Deutschland
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Footer Note -->
	<div class="mt-12 border-t border-base-300 pt-8 text-center">
		<p class="text-sm text-base-content/60">
			Stand: {new Date().toLocaleDateString('de-DE')} - Diese Widerrufsbelehrung entspricht den Anforderungen
			des § 312g BGB
		</p>
	</div>
</div>
