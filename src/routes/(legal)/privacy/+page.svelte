<script lang="ts">
	import {
		Shield,
		Mail,
		Server,
		BarChart2,
		CreditCard,
		Bell,
		Cookie,
		User,
		Scale,
		AlertTriangle,
		Eye
	} from '@lucide/svelte';
	import { phone, email, legalAddress } from '$lib/config';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Datenschutz - Zigarren Puro</title>
	<meta
		name="description"
		content="Datenschutzerklärung der Purro International GmbH gemäß DSGVO"
	/>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="container mx-auto max-w-5xl px-4 py-8">
	<!-- Header -->
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold text-primary">Datenschutzerklärung</h1>
		<p class="text-lg text-base-content/70">Informationen gemäß Art. 13, 14 DSGVO</p>
	</div>

	<div class="space-y-6">
		<!-- 1. Verantwortlicher -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
					<User class="h-5 w-5 text-secondary" />
					1. Verantwortlicher
				</h2>
				<div class="prose prose-sm max-w-none">
					<p>Verantwortlicher im Sinne der DSGVO ist:</p>
					<div class="mt-3 rounded-lg bg-base-200 p-4">
						<p>
							<strong>Purro International GmbH</strong><br />
							{legalAddress.split(', ')[0]}<br />
							{legalAddress.split(', ')[1]}<br />
							{legalAddress.split(', ')[2]}<br />
							Geschäftsführer: Nurettin Cidem<br />
							Telefon: {phone}<br />
							E-Mail: <a href={`mailto:${email}`} class="link link-secondary">{email}</a>
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- 2. Grundsätze -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
					<Shield class="h-5 w-5 text-secondary" />
					2. Grundsätze der Datenverarbeitung
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>
						Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung einer
						funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Eine
						Verarbeitung erfolgt regelmäßig nur mit Ihrer Einwilligung oder soweit eine gesetzliche
						Erlaubnis besteht.
					</p>
					<p>Rechtsgrundlagen für die Verarbeitung sind insbesondere:</p>
					<ul>
						<li><strong>Art. 6 Abs. 1 lit. a DSGVO</strong> – Einwilligung</li>
						<li>
							<strong>Art. 6 Abs. 1 lit. b DSGVO</strong> – Vertragserfüllung oder vorvertragliche Maßnahmen
						</li>
						<li>
							<strong>Art. 6 Abs. 1 lit. c DSGVO</strong> – Erfüllung einer rechtlichen Verpflichtung
						</li>
						<li><strong>Art. 6 Abs. 1 lit. f DSGVO</strong> – Berechtigte Interessen</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- 3. Hosting -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
					<Server class="h-5 w-5 text-secondary" />
					3. Hosting
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>
						Diese Website wird bei der <strong>netcup GmbH</strong> (Daimlerstraße 25, 76185 Karlsruhe,
						Deutschland) gehostet. Die Server befinden sich in Deutschland.
					</p>
					<p>
						Beim Aufruf der Website werden automatisch folgende Daten erhoben und in Server-Logfiles
						gespeichert:
					</p>
					<ul>
						<li>IP-Adresse (anonymisiert)</li>
						<li>Datum und Uhrzeit des Zugriffs</li>
						<li>Aufgerufene URL</li>
						<li>Übertragene Datenmenge</li>
						<li>Browser-Typ und -Version</li>
						<li>Betriebssystem</li>
						<li>Referrer-URL</li>
					</ul>
					<p>
						Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren,
						stabilen Betrieb). Logfiles werden spätestens nach 30 Tagen gelöscht.
					</p>
				</div>
			</div>
		</div>

		<!-- 4. Kontakt -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
					<Mail class="h-5 w-5 text-secondary" />
					4. Kontaktaufnahme
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>
						Wenn Sie uns per E-Mail, Telefon oder über das Kontaktformular kontaktieren, verarbeiten
						wir Ihre Angaben (Name, E-Mail-Adresse, Nachricht sowie ggf. Telefonnummer) zur
						Bearbeitung Ihrer Anfrage.
					</p>
					<p>
						Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahme) bzw. Art. 6 Abs.
						1 lit. f DSGVO (berechtigtes Interesse). Die Daten werden gelöscht, sobald Ihre Anfrage
						abschließend bearbeitet ist und keine gesetzliche Aufbewahrungspflicht besteht.
					</p>
				</div>
			</div>
		</div>

		<!-- 5. Kundenkonto & Bestellungen -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
					<User class="h-5 w-5 text-secondary" />
					5. Kundenkonto und Bestellungen
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>
						Zur Nutzung unseres Online-Shops können Sie ein Kundenkonto erstellen. Dabei verarbeiten
						wir:
					</p>
					<ul>
						<li>Name, E-Mail-Adresse, Passwort (gehashed)</li>
						<li>
							Geburtsdatum (zur gesetzlich vorgeschriebenen Altersverifikation für Tabakwaren)
						</li>
						<li>Liefer- und Rechnungsadressen</li>
						<li>Bestellhistorie und Zahlungsinformationen</li>
					</ul>
					<p>
						Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. c
						DSGVO (gesetzliche Pflicht zur Altersverifikation gem. § 9 TabakerzG).
					</p>
					<p>
						Bestelldaten werden gemäß gesetzlicher Aufbewahrungspflichten (§ 147 AO, § 257 HGB) für
						10 Jahre gespeichert. Das Kundenkonto kann jederzeit gelöscht werden; gesetzlich
						aufbewahrungspflichtige Daten werden davon nicht berührt.
					</p>
				</div>
			</div>
		</div>

		<!-- 6. Zahlungsabwicklung -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
					<CreditCard class="h-5 w-5 text-secondary" />
					6. Zahlungsabwicklung
				</h2>
				<div class="prose prose-sm max-w-none space-y-4">
					<div class="rounded-lg bg-base-200 p-4">
						<h4 class="mb-2 font-semibold">Stripe (Kreditkarte)</h4>
						<p class="text-sm">
							Kreditkartenzahlungen werden über die <strong>Stripe Payments Europe Ltd.</strong>, 1
							Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland, abgewickelt. Die Eingabe
							der Kartendaten erfolgt direkt auf den Seiten von Stripe. Wir erhalten lediglich eine
							Zahlungsbestätigung, keine vollständigen Kartendaten. Datenschutzerklärung:
							<a
								href="https://stripe.com/de/privacy"
								target="_blank"
								rel="noopener noreferrer"
								class="link link-secondary">stripe.com/de/privacy</a
							>
						</p>
					</div>
					<div class="rounded-lg bg-base-200 p-4">
						<h4 class="mb-2 font-semibold">PayPal</h4>
						<p class="text-sm">
							PayPal-Zahlungen werden über die <strong
								>PayPal (Europe) S.à r.l. et Cie, S.C.A.</strong
							>, 22-24 Boulevard Royal, 2449 Luxemburg, abgewickelt. Bei Auswahl von PayPal werden
							Sie auf die PayPal-Website weitergeleitet. Datenschutzerklärung:
							<a
								href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full"
								target="_blank"
								rel="noopener noreferrer"
								class="link link-secondary">paypal.com</a
							>
						</p>
					</div>
					<p>
						Rechtsgrundlage für die Weitergabe an Zahlungsdienstleister: Art. 6 Abs. 1 lit. b DSGVO.
					</p>
				</div>
			</div>
		</div>

		<!-- 7. Newsletter -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
					<Bell class="h-5 w-5 text-secondary" />
					7. Newsletter
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>
						Mit Ihrer Einwilligung können Sie unseren Newsletter abonnieren. Wir versenden dann
						Informationen über Angebote, neue Produkte und Veranstaltungen an Ihre E-Mail-Adresse.
					</p>
					<p>
						Wir verwenden das Double-Opt-in-Verfahren: Nach Ihrer Anmeldung erhalten Sie eine
						Bestätigungs-E-Mail. Erst nach Bestätigung wird Ihre Adresse in den Verteiler
						aufgenommen.
					</p>
					<p>
						Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Ihre Einwilligung können Sie
						jederzeit widerrufen – entweder über den Abmeldelink in jeder Newsletter-E-Mail oder
						unter <a href={resolve('/unsubscribe')} class="link link-secondary"
							>zigarren-puro.de/unsubscribe</a
						>.
					</p>
					<p>
						Nach Abmeldung wird Ihre E-Mail-Adresse unverzüglich aus dem Verteiler entfernt. Wir
						speichern die erteilte Einwilligung zum Nachweiszweck (Datum, IP-Adresse) gemäß Art. 7
						Abs. 1 DSGVO.
					</p>
				</div>
			</div>
		</div>

		<!-- 8. Analytics -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
					<BarChart2 class="h-5 w-5 text-secondary" />
					8. Web-Analyse
				</h2>
				<div class="prose prose-sm max-w-none space-y-4">
					<div class="rounded-lg bg-base-200 p-4">
						<h4 class="mb-2 font-semibold">Google Analytics</h4>
						<p class="text-sm">
							Wir nutzen Google Analytics, einen Webanalysedienst der <strong
								>Google Ireland Limited</strong
							>, Gordon House, Barrow Street, Dublin 4, Irland. Google Analytics verwendet Cookies,
							die eine Analyse der Benutzung der Website ermöglichen. Die erzeugten Informationen
							werden in der Regel an einen Server von Google übertragen und dort gespeichert.
						</p>
						<p class="mt-2 text-sm">
							Wir haben IP-Anonymisierung aktiviert. Die Datenübertragung in Drittländer erfolgt auf
							Grundlage der EU-Standardvertragsklauseln. Datenschutzerklärung: <a
								href="https://policies.google.com/privacy"
								target="_blank"
								rel="noopener noreferrer"
								class="link link-secondary">policies.google.com/privacy</a
							>
						</p>
					</div>
					<div class="rounded-lg bg-base-200 p-4">
						<h4 class="mb-2 font-semibold">PostHog</h4>
						<p class="text-sm">
							Wir nutzen PostHog (PostHog Inc., 965 Mission St, San Francisco, CA 94103, USA) zur
							Analyse des Nutzerverhaltens. PostHog wird für uns in der EU-Region betrieben; Daten
							werden auf EU-Servern gespeichert. Weitere Informationen: <a
								href="https://posthog.com/privacy"
								target="_blank"
								rel="noopener noreferrer"
								class="link link-secondary">posthog.com/privacy</a
							>
						</p>
					</div>
					<p>
						Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung via Cookie-Banner). Sie können
						die Erfassung durch Analyse-Cookies jederzeit über die Cookie-Einstellungen ablehnen
						oder widerrufen.
					</p>
				</div>
			</div>
		</div>

		<!-- 9. Cookies -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
					<Cookie class="h-5 w-5 text-secondary" />
					9. Cookies
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>
						Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die Ihr Browser auf
						Ihrem Endgerät speichert.
					</p>
					<div class="overflow-x-auto">
						<table class="table table-sm text-sm">
							<thead>
								<tr>
									<th>Kategorie</th>
									<th>Zweck</th>
									<th>Rechtsgrundlage</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td class="font-medium">Notwendig</td>
									<td>Session, Warenkorb, Login</td>
									<td>Art. 6 Abs. 1 lit. b DSGVO</td>
								</tr>
								<tr>
									<td class="font-medium">Analyse</td>
									<td>Google Analytics, PostHog</td>
									<td>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</td>
								</tr>
								<tr>
									<td class="font-medium">Marketing</td>
									<td>Personalisierte Werbung</td>
									<td>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</td>
								</tr>
							</tbody>
						</table>
					</div>
					<p>
						Sie können Ihre Cookie-Einstellungen jederzeit über unser Cookie-Banner ändern.
						Notwendige Cookies können nicht deaktiviert werden, da der Shop sonst nicht
						funktioniert.
					</p>
				</div>
			</div>
		</div>

		<!-- 10. Altersverifikation -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
					<AlertTriangle class="h-5 w-5 text-secondary" />
					10. Altersverifikation bei Tabakwaren
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>
						Aufgrund der gesetzlichen Pflicht zur Altersverifikation bei Tabakwaren (§ 9 TabakerzG)
						erheben wir bei der Registrierung das Geburtsdatum. Diese Angabe ist zur
						Vertragserfüllung zwingend erforderlich.
					</p>
					<p>Rechtsgrundlage: Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Verpflichtung).</p>
					<p>
						Zusteller sind verpflichtet, die Volljährigkeit des Empfängers anhand des
						Personalausweises zu überprüfen. Das Geburtsdatum wird zu diesem Zweck an den jeweiligen
						Versanddienstleister übermittelt.
					</p>
				</div>
			</div>
		</div>

		<!-- 11. Betroffenenrechte -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
					<Eye class="h-5 w-5 text-secondary" />
					11. Ihre Rechte
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div class="rounded-lg bg-base-200 p-3 text-sm">
							<p class="font-semibold">Auskunft (Art. 15 DSGVO)</p>
							<p class="text-base-content/70">Welche Daten wir von Ihnen verarbeiten</p>
						</div>
						<div class="rounded-lg bg-base-200 p-3 text-sm">
							<p class="font-semibold">Berichtigung (Art. 16 DSGVO)</p>
							<p class="text-base-content/70">Korrektur unrichtiger Daten</p>
						</div>
						<div class="rounded-lg bg-base-200 p-3 text-sm">
							<p class="font-semibold">Löschung (Art. 17 DSGVO)</p>
							<p class="text-base-content/70">Löschung Ihrer gespeicherten Daten</p>
						</div>
						<div class="rounded-lg bg-base-200 p-3 text-sm">
							<p class="font-semibold">Einschränkung (Art. 18 DSGVO)</p>
							<p class="text-base-content/70">Einschränkung der Verarbeitung</p>
						</div>
						<div class="rounded-lg bg-base-200 p-3 text-sm">
							<p class="font-semibold">Datenübertragbarkeit (Art. 20 DSGVO)</p>
							<p class="text-base-content/70">
								Übermittlung Ihrer Daten in maschinenlesbarem Format
							</p>
						</div>
						<div class="rounded-lg bg-base-200 p-3 text-sm">
							<p class="font-semibold">Widerspruch (Art. 21 DSGVO)</p>
							<p class="text-base-content/70">Widerspruch gegen die Verarbeitung</p>
						</div>
					</div>
					<p>
						Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: <a
							href={`mailto:${email}`}
							class="link link-secondary">{email}</a
						>
						| {phone}
					</p>
					<div class="mt-4 alert alert-info">
						<Scale class="h-5 w-5" />
						<div>
							<p class="font-semibold">Beschwerderecht</p>
							<p class="text-sm">
								Sie haben das Recht, sich bei der zuständigen Aufsichtsbehörde zu beschweren.
								Zuständig ist der Landesbeauftragte für Datenschutz und Informationsfreiheit
								Nordrhein-Westfalen: <a
									href="https://www.ldi.nrw.de"
									target="_blank"
									rel="noopener noreferrer"
									class="link link-secondary">ldi.nrw.de</a
								>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 12. Datensicherheit -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title flex items-center gap-2 text-xl">
					<Shield class="h-5 w-5 text-secondary" />
					12. Datensicherheit
				</h2>
				<div class="prose prose-sm max-w-none space-y-3">
					<p>
						Wir treffen angemessene technische und organisatorische Schutzmaßnahmen, um Ihre Daten
						gegen unbeabsichtigte oder unrechtmäßige Löschung, Veränderung oder unberechtigten
						Zugriff zu schützen.
					</p>
					<p>
						Die Datenübertragung zwischen Ihrem Browser und unserem Server erfolgt verschlüsselt
						über TLS/HTTPS. Passwörter werden mit Argon2 gehasht und nie im Klartext gespeichert.
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Footer Note -->
	<div class="mt-12 border-t border-base-300 pt-8 text-center">
		<p class="text-sm text-base-content/60">
			Stand: {new Date().toLocaleDateString('de-DE')} – Diese Datenschutzerklärung entspricht den Anforderungen
			der DSGVO.
		</p>
	</div>
</div>
