<script lang="ts">
	import { HelpCircle, Package, Truck, Shield, RefreshCcw, Mail, Phone } from '@lucide/svelte';
	import { email, phone } from '$lib/config';

	const sections = [
		{
			icon: Package,
			title: 'Produkte & Qualität',
			items: [
				{
					q: 'Wie werden die Zigarren bei Ihnen gelagert?',
					a: 'Alle unsere Zigarren werden in professionellen Humidoren bei einer relativen Luftfeuchtigkeit von 68–72 % und einer Temperatur von 16–18 °C gelagert. So bewahren wir die optimale Reife und das volle Aroma jeder Zigarre bis zur Auslieferung.'
				},
				{
					q: 'Sind Ihre Zigarren handgefertigt?',
					a: 'Ja, alle Premiumzigarren in unserem Sortiment sind Longfiller – handgerollte Zigarren, bei denen der Einlagetabak aus ganzen Blättern besteht. Wir führen keine maschinell gefertigten Kurzfüller.'
				},
				{
					q: 'Was bedeuten die Stärkeangaben (leicht, mittel, voll)?',
					a: 'Die Stärke beschreibt den Nikotingehalt und die Intensität des Rauchs. Leichte Zigarren eignen sich gut für Einsteiger, mittlere für gelegentliche Genießer und volle Zigarren für erfahrene Aficionados. Unsere Produktbeschreibungen geben Ihnen detaillierte Hinweise zur Wahl.'
				},
				{
					q: 'Führen Sie auch Zigarren für Einsteiger?',
					a: 'Absolut. Wir empfehlen Einsteigern milde Zigarillos oder leichte Zigarren aus der Dominikanischen Republik (z. B. Vegafina). Besuchen Sie uns gerne im Ladengeschäft – wir beraten Sie persönlich.'
				}
			]
		},
		{
			icon: Package,
			title: 'Bestellung & Zahlung',
			items: [
				{
					q: 'Welche Zahlungsmethoden akzeptieren Sie?',
					a: 'Wir akzeptieren Kreditkarten (Visa, Mastercard, American Express via Stripe), PayPal, Banküberweisung (Vorkasse) sowie ausgewählte Kryptowährungen. Alle Zahlungen sind verschlüsselt und sicher.'
				},
				{
					q: 'Kann ich meine Bestellung nach der Aufgabe noch ändern?',
					a: 'Bestellungen können bis zur Bearbeitung storniert oder geändert werden. Kontaktieren Sie uns bitte so schnell wie möglich per E-Mail oder Telefon, wenn Sie Ihre Bestellung anpassen möchten. Nach Versand ist keine Änderung mehr möglich.'
				},
				{
					q: 'Bekomme ich eine Bestellbestätigung?',
					a: 'Ja, nach erfolgreicher Bestellung erhalten Sie automatisch eine Bestätigungs-E-Mail mit Ihrer Bestellnummer und einer Zusammenfassung. Bei Versand erhalten Sie eine weitere E-Mail mit Ihrer Tracking-Nummer.'
				},
				{
					q: 'Kann ich auch telefonisch oder per E-Mail bestellen?',
					a: 'Für Großbestellungen oder besondere Wünsche beraten wir Sie gerne persönlich. Rufen Sie uns an oder schreiben Sie uns – wir finden eine Lösung.'
				}
			]
		},
		{
			icon: Truck,
			title: 'Versand & Lieferung',
			items: [
				{
					q: 'Wie lange dauert die Lieferung?',
					a: 'Innerhalb Deutschlands liefern wir in der Regel innerhalb von 2–4 Werktagen. In andere EU-Länder dauert es je nach Destination 3–10 Werktage. Bestellungen, die bis 12:00 Uhr eingehen, werden noch am selben Tag bearbeitet.'
				},
				{
					q: 'Ab welchem Bestellwert ist Versand kostenlos?',
					a: 'Ab einem Bestellwert von 150 € liefern wir innerhalb Deutschlands versandkostenfrei. Weitere Informationen zu unseren Versandkonditionen finden Sie auf der Versandseite.'
				},
				{
					q: 'Liefern Sie ins EU-Ausland?',
					a: 'Ja, wir liefern in alle EU-Länder. Bitte beachten Sie, dass für Tabakwaren in einzelnen Ländern zusätzliche Zoll- oder Steuerpflichten bestehen können. Wir informieren Sie im Bestellprozess über anfallende Versandkosten.'
				},
				{
					q: 'Was passiert, wenn ich bei der Lieferung nicht zuhause bin?',
					a: 'Bei Tabakwaren ist eine persönliche Übergabe mit Altersverifikation gesetzlich vorgeschrieben. Ist niemand anzutreffen, hinterlässt der Zusteller eine Benachrichtigung und die Sendung liegt bei der nächsten Abholstation. Paketboxen oder Nachbarzustellung sind für altersverifizierungspflichtige Sendungen nicht möglich.'
				}
			]
		},
		{
			icon: Shield,
			title: 'Jugendschutz & Altersverifikation',
			items: [
				{
					q: 'Warum wird mein Ausweis bei der Lieferung geprüft?',
					a: 'Der Verkauf und die Abgabe von Tabakwaren ist in Deutschland gesetzlich auf Personen ab 18 Jahren beschränkt (§ 9 TabakerzG). Zusteller sind daher verpflichtet, die Volljährigkeit des Empfängers anhand eines gültigen Ausweisdokuments zu prüfen.'
				},
				{
					q: 'Was gilt als gültiges Ausweisdokument?',
					a: 'Anerkannt werden Personalausweis, Reisepass sowie Führerschein im Kartenformat (EU-Standard). Das Dokument muss ein Lichtbild und das Geburtsdatum enthalten und gültig sein.'
				},
				{
					q: 'Welche Daten werden zur Altersverifikation gespeichert?',
					a: 'Wir speichern bei der Registrierung Ihr Geburtsdatum zur Altersverifikation. Dieses wird ausschließlich für den gesetzlich vorgeschriebenen Zweck verwendet und nicht an Dritte weitergegeben, außer an den Versanddienstleister im Rahmen der Zustellung. Mehr dazu in unserer Datenschutzerklärung.'
				}
			]
		},
		{
			icon: RefreshCcw,
			title: 'Rückgabe & Reklamation',
			items: [
				{
					q: 'Kann ich Zigarren zurückgeben?',
					a: 'Nein. Tabakwaren sind gemäß § 312g Abs. 2 Nr. 2 BGB vom gesetzlichen Widerrufsrecht ausgeschlossen. Dies gilt auch für ungeöffnete Packungen, da Zigarren schnell verderben können und aus hygienischen Gründen nicht zurückgenommen werden.'
				},
				{
					q: 'Was mache ich bei beschädigter oder falscher Lieferung?',
					a: 'Bitte kontaktieren Sie uns innerhalb von 48 Stunden nach Erhalt mit Fotos der beschädigten Sendung und Ihrer Bestellnummer. Wir prüfen den Fall und kümmern uns um Ersatz oder Rückerstattung – auf unsere Kosten.'
				},
				{
					q: 'Kann ich Zubehör zurückgeben?',
					a: 'Ja, unbenutzte Zubehörartikel (Humidore, Schneider, Aschenbecher etc.) können innerhalb von 14 Tagen in Originalverpackung zurückgegeben werden. Die Rücksendekosten tragen Sie als Kunde. Weitere Details in unseren Rückgabebedingungen.'
				}
			]
		}
	];
</script>

<svelte:head>
	<title>FAQ – Häufige Fragen - Zigarren Puro</title>
	<meta
		name="description"
		content="Antworten auf häufig gestellte Fragen zu Produkten, Bestellung, Versand und Jugendschutz bei Zigarren Puro."
	/>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold text-primary">Häufige Fragen</h1>
		<p class="text-lg text-base-content/70">
			Finden Sie schnell Antworten auf die häufigsten Fragen
		</p>
	</div>

	<div class="space-y-8">
		{#each sections as section (section.title)}
			<div>
				<h2 class="mb-3 flex items-center gap-2 text-xl font-semibold text-base-content">
					<svelte:component this={section.icon} class="h-5 w-5 text-secondary" />
					{section.title}
				</h2>
				<div class="space-y-2">
					{#each section.items as item (item.q)}
						<div class="collapse-arrow collapse border border-base-200 bg-base-100 shadow-sm">
							<input type="checkbox" />
							<div class="collapse-title font-medium">{item.q}</div>
							<div class="collapse-content">
								<p class="text-sm leading-relaxed text-base-content/80">{item.a}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Contact CTA -->
	<div class="card mt-12 border border-base-200 bg-base-100 shadow-lg">
		<div class="card-body text-center">
			<HelpCircle class="mx-auto mb-2 h-10 w-10 text-secondary" />
			<h2 class="card-title justify-center text-xl">Ihre Frage ist nicht dabei?</h2>
			<p class="text-sm text-base-content/70">Unser Team hilft Ihnen gerne persönlich weiter.</p>
			<div class="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
				<a href={`tel:${phone.replace(/[^+\d]/g, '')}`} class="btn btn-outline btn-secondary">
					<Phone class="h-4 w-4" />
					{phone}
				</a>
				<a href={`mailto:${email}`} class="btn btn-secondary">
					<Mail class="h-4 w-4" />
					{email}
				</a>
			</div>
		</div>
	</div>
</div>
