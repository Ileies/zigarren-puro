<script lang="ts">
	import { Mail, Clock, FileText, AlertTriangle, Package, CreditCard, Truck, Shield, Phone } from 'lucide-svelte';
	import { phone, email } from '$lib/config';
</script>

<svelte:head>
	<title>Widerrufsrecht - Zigarren Puro</title>
	<meta name="description" content="Widerrufsbelehrung und Informationen zum Widerrufsrecht bei Zigarren Puro" />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<!-- Header -->
	<div class="text-center mb-12">
		<h1 class="text-4xl font-bold text-primary mb-4">Widerrufsrecht</h1>
		<p class="text-lg text-base-content/70">Widerrufsbelehrung für Verbraucher</p>
	</div>

	<!-- Important Notice for Tobacco Products -->
	<div class="alert alert-warning mb-8">
		<AlertTriangle class="w-6 h-6" />
		<div>
			<h3 class="font-bold text-lg">Wichtiger Hinweis zu Tabakwaren</h3>
			<p>
				<strong>Tabakwaren sind vom Widerrufsrecht ausgeschlossen</strong>, da sie aus hygienischen Gründen nicht für eine Rückgabe geeignet sind und schnell verderben können. Dies gilt gemäß § 312g Abs. 2 Nr. 2 BGB.
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Main Withdrawal Information -->
		<div class="lg:col-span-2 space-y-8">
			<!-- Withdrawal Right -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-2xl mb-6 flex items-center gap-2">
						<Shield class="w-6 h-6 text-secondary" />
						Widerrufsrecht
					</h2>
					
					<div class="prose prose-sm max-w-none">
						<p class="text-base mb-4">
							Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
						</p>
						
						<div class="bg-base-200 p-4 rounded-lg mb-4">
							<p class="font-semibold mb-2">Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag:</p>
							<ul class="list-disc list-inside space-y-1 text-sm">
								<li>an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat</li>
								<li>bei mehreren Waren einer einheitlichen Bestellung: an dem Sie oder ein von Ihnen benannter Dritter die letzte Ware in Besitz genommen haben bzw. hat</li>
								<li>bei Waren, die in mehreren Teilsendungen geliefert werden: an dem Sie oder ein von Ihnen benannter Dritter die letzte Teilsendung in Besitz genommen haben bzw. hat</li>
							</ul>
						</div>
						
						<p class="text-base">
							Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Purro International GmbH, Merkenicher Hauptstraße 90, 50769 Köln, Deutschland, Telefon: {phone}, E-Mail: {email}) mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
						</p>
						
						<p class="text-base mt-4">
							Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
						</p>
					</div>
				</div>
			</div>

			<!-- Withdrawal Deadline -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-2xl mb-6 flex items-center gap-2">
						<Clock class="w-6 h-6 text-secondary" />
						Widerrufsfrist
					</h2>
					
					<div class="prose prose-sm max-w-none">
						<p class="text-base mb-4">
							Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
						</p>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
							<div class="bg-success/10 border border-success/20 p-4 rounded-lg">
								<h4 class="font-semibold text-success mb-2">Fristwahrend</h4>
								<p class="text-sm">Mitteilung vor Ablauf der 14-Tage-Frist abgesendet</p>
							</div>
							<div class="bg-error/10 border border-error/20 p-4 rounded-lg">
								<h4 class="font-semibold text-error mb-2">Zu spät</h4>
								<p class="text-sm">Mitteilung nach Ablauf der 14-Tage-Frist abgesendet</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Consequences of Withdrawal -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-2xl mb-6 flex items-center gap-2">
						<CreditCard class="w-6 h-6 text-secondary" />
						Folgen des Widerrufs
					</h2>
					
					<div class="prose prose-sm max-w-none">
						<p class="text-base mb-4">
							Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
						</p>
						
						<div class="bg-base-200 p-4 rounded-lg mb-4">
							<h4 class="font-semibold mb-2">Rückzahlungsmodalitäten:</h4>
							<ul class="list-disc list-inside space-y-1 text-sm">
								<li>Rückzahlung mit demselben Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben</li>
								<li>Keine Entgelte für die Rückzahlung</li>
								<li>Rückzahlung erst nach Erhalt der Waren oder Nachweis der Rücksendung</li>
							</ul>
						</div>
						
						<p class="text-base">
							Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.
						</p>
						
						<div class="alert alert-info mt-4">
							<Package class="w-5 h-5" />
							<div>
								<h4 class="font-bold">Rücksendekosten</h4>
								<p class="text-sm">Sie tragen die unmittelbaren Kosten der Rücksendung der Waren. Die Kosten werden auf höchstens etwa 15 Euro geschätzt.</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Exclusions -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-2xl mb-6 flex items-center gap-2">
						<AlertTriangle class="w-6 h-6 text-secondary" />
						Ausschluss des Widerrufsrechts
					</h2>
					
					<div class="prose prose-sm max-w-none">
						<p class="text-base mb-4">
							Das Widerrufsrecht besteht nicht bei folgenden Verträgen:
						</p>
						
						<div class="space-y-4">
							<div class="bg-error/10 border border-error/20 p-4 rounded-lg">
								<h4 class="font-semibold text-error mb-2 flex items-center gap-2">
									<Package class="w-4 h-4" />
									Tabakwaren
								</h4>
								<p class="text-sm">
									Zigarren, Zigarillos, Zigaretten und andere Tabakerzeugnisse sind aus hygienischen Gründen und aufgrund ihrer schnellen Verderblichkeit vom Widerrufsrecht ausgeschlossen (§ 312g Abs. 2 Nr. 2 BGB).
								</p>
							</div>
							
							<div class="bg-warning/10 border border-warning/20 p-4 rounded-lg">
								<h4 class="font-semibold text-warning mb-2">Weitere Ausschlüsse</h4>
								<ul class="list-disc list-inside space-y-1 text-sm">
									<li>Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist</li>
									<li>Waren, die schnell verderben können oder deren Verfallsdatum schnell überschritten würde</li>
									<li>Waren, die aus hygienischen Gründen nicht zur Rückgabe geeignet sind, wenn sie entsiegelt wurden</li>
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
					<h2 class="card-title text-xl mb-4 flex items-center gap-2">
						<Mail class="w-5 h-5 text-secondary" />
						Widerruf kontaktieren
					</h2>
					
					<div class="space-y-3">
						<div>
							<h4 class="font-semibold">Purro International GmbH</h4>
							<p class="text-sm text-base-content/70">Merkenicher Hauptstraße 90<br>50769 Köln<br>Deutschland</p>
						</div>
						
						<div class="divider"></div>
						
						<div class="space-y-2">
							<a href={`tel:${phone.replace(/[^+\d]/g, '')}`} class="flex items-center gap-2 hover:text-secondary transition-colors">
								<Phone class="w-4 h-4" />
								<span>{phone}</span>
							</a>
							<a href={`mailto:${email}?subject=Widerruf`} class="flex items-center gap-2 hover:text-secondary transition-colors">
								<Mail class="w-4 h-4" />
								<span>{email}</span>
							</a>
						</div>
					</div>
				</div>
			</div>

			<!-- Withdrawal Form Template -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-xl mb-4 flex items-center gap-2">
						<FileText class="w-5 h-5 text-secondary" />
						Muster-Widerrufsformular
					</h2>
					
					<div class="bg-base-200 p-4 rounded-lg text-sm">
						<p class="font-semibold mb-3">An:</p>
						<p class="mb-4">
							Purro International GmbH<br>
							Merkenicher Hauptstraße 90<br>
							50769 Köln<br>
							Deutschland<br>
							E-Mail: {email}
						</p>
						
						<p class="mb-3">
							Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)
						</p>
						
						<div class="space-y-2 mb-4">
							<p>– Bestellt am (*)/erhalten am (*) _____________</p>
							<p>– Name des/der Verbraucher(s) _____________</p>
							<p>– Anschrift des/der Verbraucher(s) _____________</p>
							<p>– Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier) _____________</p>
							<p>– Datum _____________</p>
						</div>
						
						<p class="text-xs italic">(*) Unzutreffendes streichen.</p>
					</div>
					
					<div class="mt-4">
						<button class="btn btn-secondary btn-sm" on:click={() => window.print()}>
							<FileText class="w-4 h-4" />
							Formular drucken
						</button>
					</div>
				</div>
			</div>

			<!-- Return Process -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-xl mb-4 flex items-center gap-2">
						<Truck class="w-5 h-5 text-secondary" />
						Rücksendung
					</h2>
					
					<div class="space-y-3 text-sm">
						<div class="steps steps-vertical">
							<div class="step step-primary">Widerruf erklären</div>
							<div class="step">Ware verpacken</div>
							<div class="step">Rücksendung binnen 14 Tagen</div>
							<div class="step">Rückerstattung erhalten</div>
						</div>
						
						<div class="bg-info/10 border border-info/20 p-3 rounded-lg mt-4">
							<p class="font-semibold text-info mb-1">Rücksendeadresse:</p>
							<p class="text-xs">
								Purro International GmbH<br>
								Retouren<br>
								Merkenicher Hauptstraße 90<br>
								50769 Köln<br>
								Deutschland
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Footer Note -->
	<div class="text-center mt-12 pt-8 border-t border-base-300">
		<p class="text-sm text-base-content/60">
			Stand: {new Date().toLocaleDateString('de-DE')} - Diese Widerrufsbelehrung entspricht den Anforderungen des § 312g BGB
		</p>
	</div>
</div>
