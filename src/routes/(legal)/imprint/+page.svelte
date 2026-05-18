<script lang="ts">
	import { Mail, MapPin, Phone, Shield, User, Building, FileText, Scale, Store, ArrowRight } from 'lucide-svelte';
	import Map from '$lib/components/Map.svelte';
	import { phone, email, storeAddress, legalAddress } from '$lib/config';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Impressum - Zigarren Puro</title>
	<meta name="description" content="Impressum und rechtliche Angaben der Purro International GmbH" />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<!-- Header -->
	<div class="text-center mb-12">
		<h1 class="text-4xl font-bold text-primary mb-4">Impressum</h1>
		<p class="text-lg text-base-content/70">Angaben gemäß § 5 TMG</p>
	</div>

	<!-- Company Overview Section -->
	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
		<!-- Basic Company Info -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<Building class="w-5 h-5 text-secondary" />
					Firmenangaben
				</h2>
				
				<div class="space-y-4">
					<div>
						<h3 class="font-semibold text-lg">Purro International GmbH</h3>
						<div class="flex items-start gap-2 mt-2">
							<MapPin class="w-4 h-4 mt-1 text-secondary flex-shrink-0" />
							<div>
								<p class="font-medium text-sm text-base-content/70 mb-1">Rechtliche Anschrift:</p>
								<p>{legalAddress.split(', ')[0]}</p>
								<p>{legalAddress.split(', ')[1]}</p>
								<p>{legalAddress.split(', ')[2]}</p>
							</div>
						</div>
					</div>

					<div class="divider"></div>

					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<User class="w-4 h-4 text-secondary" />
							<span><strong>Geschäftsführer:</strong> Nurettin Cidem</span>
						</div>
						<div class="flex items-center gap-2">
							<FileText class="w-4 h-4 text-secondary" />
							<span><strong>Handelsregister:</strong> Amtsgericht Köln, HRB 108254</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Store Location -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<Store class="w-5 h-5 text-secondary" />
					Ladengeschäft
				</h2>
				
				<div class="space-y-3">
					<div class="flex items-start gap-2">
						<MapPin class="w-4 h-4 mt-1 text-secondary flex-shrink-0" />
						<div>
							<p class="font-medium text-sm text-base-content/70 mb-1">Geschäftsadresse:</p>
							<p>{storeAddress.split(', ')[0]}</p>
							<p>{storeAddress.split(', ')[1]}</p>
							<p>{storeAddress.split(', ')[2]}</p>
						</div>
					</div>
					
					<div class="bg-base-200 p-3 rounded-lg">
						<p class="text-sm">
							<strong>Öffnungszeiten:</strong><br>
							Mo-Sa: 13:00 - 19:00 Uhr<br>
							So: Geschlossen
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Contact Information -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<Mail class="w-5 h-5 text-secondary" />
					Kontakt
				</h2>
				
				<div class="space-y-3">
					<a href={`tel:${phone.replace(/[^+\d]/g, '')}`} class="flex items-center gap-2 hover:text-secondary transition-colors">
						<Phone class="w-4 h-4" />
						<span>{phone}</span>
					</a>
					<a href={`mailto:${email}`} class="flex items-center gap-2 hover:text-secondary transition-colors">
						<Mail class="w-4 h-4" />
						<span>{email}</span>
					</a>
				</div>
				
				<div class="mt-4">
					<a href={resolve("/contact")} class="text-sm text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1 font-medium">
						<ArrowRight class="w-3 h-3" />
						Weitere Kontaktmöglichkeiten
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Secondary Information Section -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
		<!-- Tax Information -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<FileText class="w-5 h-5 text-secondary" />
					Steuerliche Angaben
				</h2>
				
				<div class="space-y-2">
					<p><strong>Umsatzsteuer-ID:</strong> DE355392038</p>
					<p><strong>Steuernummer:</strong> 217/5773/2002</p>
					<p><strong>Gewerbeanzeige:</strong> Stadt Köln</p>
				</div>
			</div>
		</div>

		<!-- Youth Protection -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<Shield class="w-5 h-5 text-secondary" />
					Jugendschutz
				</h2>
				
				<div class="space-y-2">
					<p><strong>Jugendschutzbeauftragter:</strong> Nurettin Cidem</p>
					<a href="mailto:jugendschutz@zigarren-puro.de" class="flex items-center gap-2 hover:text-secondary transition-colors">
						<Mail class="w-4 h-4" />
						<span>jugendschutz@zigarren-puro.de</span>
					</a>
				</div>
				
				<div class="alert alert-warning mt-4">
					<Shield class="w-5 h-5" />
					<div>
						<h4 class="font-bold">Wichtiger Hinweis</h4>
						<p class="text-sm">Der Verkauf von Tabakwaren ist nur an Personen ab 18 Jahren gestattet. Wir sind verpflichtet, das Alter unserer Kunden zu überprüfen.</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Location and Legal Section -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
		<!-- Location Map -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<MapPin class="w-5 h-5 text-secondary" />
					Unser Standort
				</h2>
				
				<div class="rounded-lg overflow-hidden">
					<Map width="100%" height="350" />
				</div>
				
				<div class="mt-4 text-sm text-base-content/70">
					<p><strong>Besuchen Sie uns:</strong></p>
					<p>{storeAddress}</p>
					<p class="mt-2">Unser Ladengeschäft befindet sich im Herzen von Köln. Hier können Sie unsere Premium-Zigarren persönlich begutachten und sich fachkundig beraten lassen.</p>
				</div>
			</div>
		</div>

		<!-- Dispute Resolution -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4 flex items-center gap-2">
					<Scale class="w-5 h-5 text-secondary" />
					Streitbeilegung
				</h2>
				
				<div class="space-y-3">
					<p class="text-sm">
						Wir sind grundsätzlich bereit, an einem außergerichtlichen Schlichtungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
					</p>
					
					<div class="bg-base-200 p-4 rounded-lg">
						<h4 class="font-semibold mb-2">EU-Streitschlichtung</h4>
						<p class="text-sm">
							Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
						</p>
						<a 
							href="https://ec.europa.eu/consumers/odr/" 
							target="_blank" 
							rel="noopener noreferrer"
							class="link link-secondary text-sm"
						>
							https://ec.europa.eu/consumers/odr/
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Legal Notice Section -->
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
			<h2 class="card-title text-2xl mb-6">Haftungsausschluss</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
				<div>
					<h4 class="font-semibold mb-3 text-base">Haftung für Inhalte</h4>
					<p>
						Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
					</p>
				</div>
				
				<div>
					<h4 class="font-semibold mb-3 text-base">Haftung für Links</h4>
					<p>
						Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
					</p>
				</div>
				
				<div>
					<h4 class="font-semibold mb-3 text-base">Urheberrecht</h4>
					<p>
						Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Footer Note -->
	<div class="text-center mt-12 pt-8 border-t border-base-300">
		<p class="text-sm text-base-content/60">
			Stand: {new Date().toLocaleDateString('de-DE')}
		</p>
	</div>
</div>
