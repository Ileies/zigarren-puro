<script lang="ts">
	import { Scale, ShoppingCart, AlertTriangle, CreditCard, Truck, Shield, Phone, Mail, FileText, Package, RefreshCcw } from '@lucide/svelte';
	import { phone, email, legalAddress, storeAddress } from '$lib/config';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>AGB - Zigarren Puro</title>
	<meta name="description" content="Allgemeine Geschäftsbedingungen der Purro International GmbH" />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-5xl">
	<!-- Header -->
	<div class="text-center mb-12">
		<h1 class="text-4xl font-bold text-primary mb-4">Allgemeine Geschäftsbedingungen</h1>
		<p class="text-lg text-base-content/70">Purro International GmbH</p>
	</div>

	<!-- Age Warning -->
	<div class="alert alert-warning mb-8">
		<AlertTriangle class="w-6 h-6 flex-shrink-0" />
		<div>
			<h3 class="font-bold text-lg">Jugendschutz – Mindestalter 18 Jahre</h3>
			<p>Der Erwerb von Tabakwaren und Spirituosen ist ausschließlich Personen ab 18 Jahren gestattet. Durch Abgabe einer Bestellung bestätigen Sie, das erforderliche Mindestalter erreicht zu haben.</p>
		</div>
	</div>

	<div class="space-y-6">

		<!-- § 1 Geltungsbereich -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<Scale class="w-5 h-5 text-secondary" />
					§ 1 Geltungsbereich und Anbieter
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>(1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge, die zwischen der</p>
					<div class="bg-base-200 p-4 rounded-lg">
						<p><strong>Purro International GmbH</strong><br>
						{legalAddress.split(', ')[0]}<br>
						{legalAddress.split(', ')[1]}<br>
						{legalAddress.split(', ')[2]}<br>
						Geschäftsführer: Nurettin Cidem<br>
						Handelsregister: Amtsgericht Köln, HRB 108254<br>
						USt-IdNr.: DE355392038<br>
						Telefon: {phone}<br>
						E-Mail: {email}</p>
					</div>
					<p>(nachfolgend „Anbieter") und Ihnen als Verbraucher oder Unternehmer (nachfolgend „Kunde") über den Online-Shop <strong>zigarren-puro.de</strong> geschlossen werden.</p>
					<p>(2) Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.</p>
					<p>(3) Als Verbraucher gilt jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbstständigen beruflichen Tätigkeit zugerechnet werden können.</p>
				</div>
			</div>
		</div>

		<!-- § 2 Vertragsschluss -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<ShoppingCart class="w-5 h-5 text-secondary" />
					§ 2 Vertragsschluss
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>(1) Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung (invitatio ad offerendum) dar.</p>
					<p>(2) Durch Anklicken des Bestellbuttons gibt der Kunde ein verbindliches Angebot zum Kauf der im Warenkorb befindlichen Waren ab.</p>
					<p>(3) Der Anbieter bestätigt den Eingang der Bestellung unverzüglich per E-Mail (Eingangsbestätigung). Diese stellt noch keine Annahme des Angebots dar. Der Vertrag kommt zustande, wenn der Anbieter die Annahme der Bestellung erklärt oder die Ware versendet.</p>
					<p>(4) Die Vertragssprache ist Deutsch. Der Vertragstext wird nach Vertragsschluss vom Anbieter gespeichert und dem Kunden auf Anfrage zugänglich gemacht.</p>
				</div>
			</div>
		</div>

		<!-- § 3 Altersverifikation -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<Shield class="w-5 h-5 text-secondary" />
					§ 3 Altersverifikation
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>(1) Tabakwaren und Spirituosen dürfen gemäß § 9 JuSchG und § 9 TabakerzG nur an Personen ab 18 Jahren abgegeben werden.</p>
					<p>(2) Mit der Bestellung versichert der Kunde, das 18. Lebensjahr vollendet zu haben.</p>
					<p>(3) Der Anbieter ist berechtigt, im Rahmen der Lieferung eine Altersverifikation durch den Zusteller durchführen zu lassen. Bei Nichtvorlage eines gültigen Ausweisdokuments oder Nichterfüllung der Altersanforderung wird die Sendung nicht ausgeliefert.</p>
					<p>(4) Der Anbieter behält sich vor, Bestellungen abzulehnen, wenn Anzeichen auf eine Minderjährigkeit des Kunden hinweisen.</p>
				</div>
			</div>
		</div>

		<!-- § 4 Preise und Versandkosten -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<CreditCard class="w-5 h-5 text-secondary" />
					§ 4 Preise und Versandkosten
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>(1) Alle Preise verstehen sich in Euro inklusive der gesetzlichen Mehrwertsteuer sowie inklusive der anfallenden Tabaksteuer.</p>
					<p>(2) Zusätzlich zu den Produktpreisen fallen Versandkosten an, die im Bestellprozess gesondert ausgewiesen werden.</p>
					<p>(3) Für Lieferungen innerhalb Deutschlands gilt:</p>
					<div class="bg-base-200 p-4 rounded-lg">
						<ul class="list-disc list-inside space-y-1 text-sm">
							<li>Standardversand: Die aktuellen Versandkosten werden im Checkout angezeigt</li>
							<li>Ab einem Bestellwert von 150 € ist die Lieferung innerhalb Deutschlands kostenlos</li>
						</ul>
					</div>
					<p>(4) Für Lieferungen in andere EU-Länder gelten abweichende Versandkosten, die im Bestellprozess angezeigt werden.</p>
					<p>(5) Der Anbieter behält sich vor, Preise jederzeit zu ändern. Maßgeblich ist der zum Zeitpunkt der Bestellung angezeigte Preis.</p>
				</div>
			</div>
		</div>

		<!-- § 5 Zahlung -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<CreditCard class="w-5 h-5 text-secondary" />
					§ 5 Zahlungsbedingungen
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>(1) Die Zahlung ist mit Abschluss der Bestellung fällig. Folgende Zahlungsarten werden angeboten:</p>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
						<div class="bg-base-200 p-3 rounded-lg text-sm">
							<p class="font-semibold mb-1">Kreditkarte</p>
							<p class="text-base-content/70">Visa, Mastercard, American Express – abgewickelt über Stripe</p>
						</div>
						<div class="bg-base-200 p-3 rounded-lg text-sm">
							<p class="font-semibold mb-1">PayPal</p>
							<p class="text-base-content/70">Sofortige Zahlung über Ihr PayPal-Konto</p>
						</div>
						<div class="bg-base-200 p-3 rounded-lg text-sm">
							<p class="font-semibold mb-1">Banküberweisung</p>
							<p class="text-base-content/70">Vorkasse – Versand nach Zahlungseingang</p>
						</div>
						<div class="bg-base-200 p-3 rounded-lg text-sm">
							<p class="font-semibold mb-1">Kryptowährung</p>
							<p class="text-base-content/70">Bitcoin, Ethereum und weitere (Details im Checkout)</p>
						</div>
					</div>
					<p>(2) Bei Zahlung per Vorkasse (Banküberweisung) ist der Betrag innerhalb von 7 Tagen nach Bestelleingang zu überweisen. Erfolgt keine Zahlung innerhalb dieser Frist, ist der Anbieter berechtigt, vom Vertrag zurückzutreten.</p>
					<p>(3) Im Falle des Zahlungsverzugs ist der Anbieter berechtigt, Verzugszinsen in gesetzlicher Höhe (§ 288 BGB) zu verlangen.</p>
				</div>
			</div>
		</div>

		<!-- § 6 Lieferung -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<Truck class="w-5 h-5 text-secondary" />
					§ 6 Lieferung und Versand
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>(1) Lieferungen erfolgen an die vom Kunden angegebene Lieferadresse innerhalb der EU.</p>
					<p>(2) Die Lieferfrist beträgt in der Regel 2–5 Werktage innerhalb Deutschlands. Für EU-Auslandslieferungen gelten abweichende Fristen, die im Bestellprozess angezeigt werden.</p>
					<p>(3) Tabakwaren dürfen ausschließlich an volljährige Personen übergeben werden. Die Zustellung erfolgt daher mit Altersverifikation durch den Zusteller (Personalausweispflicht).</p>
					<p>(4) Kann die Lieferung wegen Nichterfüllung der Altersanforderung nicht ausgeführt werden, trägt der Kunde die anfallenden Rücksendekosten.</p>
					<p>(5) Das Lieferrisiko (Gefahr des zufälligen Untergangs und der zufälligen Verschlechterung) geht mit Übergabe der Ware an den Kunden oder eine von ihm beauftragte Person auf den Kunden über. Bei Verbrauchern gilt dies unabhängig davon, ob die Sendung versichert ist oder nicht.</p>
				</div>
			</div>
		</div>

		<!-- § 7 Widerrufsrecht -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<RefreshCcw class="w-5 h-5 text-secondary" />
					§ 7 Widerrufsrecht und Rückgabe
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>(1) Verbrauchern steht grundsätzlich ein gesetzliches Widerrufsrecht zu. Die genauen Bedingungen entnehmen Sie bitte der gesonderten Widerrufsbelehrung.</p>
					<div class="alert alert-warning">
						<AlertTriangle class="w-5 h-5" />
						<div>
							<p class="font-semibold">Wichtiger Hinweis: Tabakwaren ausgeschlossen</p>
							<p class="text-sm">Tabakwaren (Zigarren, Zigarillos, Zigaretten etc.) sind gemäß § 312g Abs. 2 Nr. 2 BGB vom Widerrufsrecht ausgeschlossen, da sie schnell verderben können und aus hygienischen Gründen nicht für eine Rückgabe geeignet sind.</p>
						</div>
					</div>
					<p>(2) Für zulässige Rücksendungen trägt der Kunde die unmittelbaren Rücksendekosten.</p>
					<p>(3) Die vollständige Widerrufsbelehrung mit Muster-Widerrufsformular ist unter <a href={resolve('/cancellation')} class="link link-secondary">Widerrufsrecht</a> abrufbar.</p>
				</div>
			</div>
		</div>

		<!-- § 8 Gewährleistung -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<Package class="w-5 h-5 text-secondary" />
					§ 8 Gewährleistung und Mängelrechte
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>(1) Es gelten die gesetzlichen Gewährleistungsrechte. Die Verjährungsfrist für Mängelansprüche beträgt zwei Jahre ab Lieferung der Ware.</p>
					<p>(2) Als Mangel gilt nicht die natürliche Reifung und Veränderung von Tabakwaren, sofern diese sachgemäß gelagert werden. Zigarren und Zigarillos sind empfindliche Naturprodukte und sollten bei einer relativen Luftfeuchtigkeit von 65–72 % und einer Temperatur von 16–20 °C gelagert werden.</p>
					<p>(3) Bitte prüfen Sie die gelieferte Ware unmittelbar nach Erhalt auf offensichtliche Transportschäden. Mängel sind dem Anbieter unverzüglich anzuzeigen.</p>
					<p>(4) Zur Geltendmachung von Mängelansprüchen wenden Sie sich bitte an:<br>
					<a href={`mailto:${email}`} class="link link-secondary">{email}</a> | <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} class="link link-secondary">{phone}</a></p>
				</div>
			</div>
		</div>

		<!-- § 9 Haftung -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<Shield class="w-5 h-5 text-secondary" />
					§ 9 Haftungsbeschränkung
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>(1) Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper und Gesundheit.</p>
					<p>(2) Bei einfacher Fahrlässigkeit haftet der Anbieter nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht), deren Erfüllung die ordnungsgemäße Durchführung des Vertrages überhaupt erst ermöglicht. Die Haftung ist in diesem Fall auf den typischerweise vorhersehbaren Schaden begrenzt.</p>
					<p>(3) Eine weitergehende Haftung des Anbieters ist ausgeschlossen. Die vorstehenden Haftungsbeschränkungen gelten auch zugunsten der Erfüllungsgehilfen des Anbieters.</p>
				</div>
			</div>
		</div>

		<!-- § 10 Datenschutz -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<FileText class="w-5 h-5 text-secondary" />
					§ 10 Datenschutz
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>Informationen zur Erhebung, Verarbeitung und Nutzung personenbezogener Daten entnehmen Sie bitte unserer <a href={resolve('/privacy')} class="link link-secondary">Datenschutzerklärung</a>.</p>
				</div>
			</div>
		</div>

		<!-- § 11 Schlussbestimmungen -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<Scale class="w-5 h-5 text-secondary" />
					§ 11 Schlussbestimmungen
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG). Für Verbraucher mit gewöhnlichem Aufenthalt in einem anderen EU-Mitgliedstaat gelten zusätzlich die zwingenden Schutzvorschriften des jeweiligen Aufenthaltslandes.</p>
					<p>(2) Gerichtsstand für Streitigkeiten mit Unternehmern ist Köln. Für Verbraucher gilt der gesetzliche Gerichtsstand.</p>
					<p>(3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, berührt dies die Wirksamkeit der übrigen Bestimmungen nicht. An die Stelle der unwirksamen Bestimmung tritt die gesetzliche Regelung.</p>
					<p>(4) Der Anbieter ist zur Teilnahme an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle nicht verpflichtet und nicht bereit. Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" class="link link-secondary">ec.europa.eu/consumers/odr</a></p>
				</div>
			</div>
		</div>

	</div>

	<!-- Footer Note -->
	<div class="text-center mt-12 pt-8 border-t border-base-300">
		<p class="text-sm text-base-content/60">
			Stand: {new Date().toLocaleDateString('de-DE')} – Diese AGB wurden für die Purro International GmbH erstellt.
		</p>
	</div>
</div>
