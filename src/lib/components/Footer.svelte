<script lang="ts">
	import { Award, Facebook, Globe, Instagram, Mail, MapPin, Phone, Shield, Truck } from 'lucide-svelte';
	import { address, location, facebook, instagram, phone, email } from '$lib/config';
	import { m } from '$lib/paraglide/messages.js';

	const customerServiceLinks = [
		{ title: m.contact(), href: '/contact' },
		{ title: m.shipping(), href: '/shipping' },
		{ title: m.returns(), href: '/returns' },
		{ title: m.faq(), href: '/faq' }
	];

	const companyLinks = [
		{ title: m.aboutUs(), href: '/about' },
		{ title: m.news(), href: '/news' },
		{ title: m.careers(), href: '/careers' },
		{ title: m.partners(), href: '/partners' }
	];

	const legalLinks = [
		{ title: m.privacy(), href: '/privacy' },
		{ title: m.terms(), href: '/terms' },
		{ title: m.imprint(), href: '/imprint' },
		{ title: m.cancellationRight(), href: '/cancellation' }
	];

	const features = [
		{ icon: Award, text: m.qualityGuarantee() },
		{ icon: Truck, text: m.worldwideShipping() },
		{ icon: Shield, text: m.securePayment() }
	];

	let customerEmail = $state('');
	let isSubscribing = $state(false);

	const handleNewsletterSubmit = async (e: Event) => {
		e.preventDefault();
		if (!customerEmail.trim()) return;

		isSubscribing = true;
		// TODO: Implement newsletter subscription
		setTimeout(() => {
			isSubscribing = false;
			customerEmail = '';
		}, 1000);
	};
</script>

<footer class="bg-neutral text-neutral-content">
	<!-- Main Footer Content -->
	<div class="container mx-auto px-4 py-12">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
			<!-- Company Info & Newsletter -->
			<div class="lg:col-span-1">
				<div class="mb-6">
					<img src="/logo.png" alt="Zigarren Puro" class="h-16 mb-4" />
					<p class="text-sm text-neutral-content/80 mb-4">
						{m.expertCurated()} - {m.companyDescription()}
					</p>
				</div>

				<!-- Newsletter Signup -->
				<div class="mb-6">
					<h3 class="text-lg font-semibold mb-3">{m.newsletter()}</h3>
					<p class="text-sm text-neutral-content/80 mb-4">{m.newsletterDesc()}</p>
					<form onsubmit={handleNewsletterSubmit} class="flex gap-2">
						<label class="input input-bordered input-sm bg-base-100 text-base-content flex-1">
							<Mail class="w-4 h-4 opacity-70" />
							<input 
								type="email" 
								placeholder={m.yourEmail()} 
								bind:value={customerEmail}
								required
								class="grow bg-transparent"
							/>
						</label>
						<button 
							type="submit" 
							class="btn btn-secondary btn-sm flex-shrink-0"
							disabled={isSubscribing}
						>
							{isSubscribing ? m.processing() : m.subscribe()}
						</button>
					</form>
				</div>

				<!-- Social Media -->
				<div>
					<h4 class="font-medium mb-3">{m.followUs()}</h4>
					<div class="flex gap-3">
						<a
							href={facebook}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Facebook"
							class="btn btn-circle btn-outline btn-sm hover:btn-secondary transition-colors"
						>
							<Facebook class="w-4 h-4" />
						</a>
						<a
							href={instagram}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Instagram"
							class="btn btn-circle btn-outline btn-sm hover:btn-secondary transition-colors"
						>
							<Instagram class="w-4 h-4" />
						</a>
					</div>
				</div>
			</div>

			<!-- Customer Service -->
			<div>
				<h3 class="text-lg font-semibold mb-4">{m.customerService()}</h3>
				<ul class="space-y-2">
					{#each customerServiceLinks as link (link.title)}
						<li>
							<a href={link.href} class="text-sm hover:text-secondary transition-colors">
								{link.title}
							</a>
						</li>
					{/each}
				</ul>

				<!-- Contact Info -->
				<div class="mt-6">
					<h4 class="font-medium mb-3">{m.contact()}</h4>
					<div class="space-y-2 text-sm text-neutral-content/80">
						<a class="flex items-center gap-2" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
							<Phone class="w-4 h-4" />
							<span>{phone}</span>
						</a>
						<a class="flex items-center gap-2" href={`mailto:${email}`}>
							<Mail class="w-4 h-4" />
							<span>{email}</span>
						</a>
						<a class="flex items-start gap-2" href={location} target="_blank">
							<MapPin class="w-4 h-4 mt-0.5" />
							<span>Zigarren Puro GmbH<br />{address.split(', ')[0]}<br />{address.split(', ')[1]}</span>
						</a>
					</div>
				</div>
			</div>

			<!-- Company -->
			<div>
				<h3 class="text-lg font-semibold mb-4">{m.company()}</h3>
				<ul class="space-y-2">
					{#each companyLinks as link (link.title)}
						<li>
							<a href={link.href} class="text-sm hover:text-secondary transition-colors">
								{link.title}
							</a>
						</li>
					{/each}
				</ul>

				<!-- Opening Hours -->
				<div class="mt-6">
					<h4 class="font-medium mb-3">Öffnungszeiten</h4>
					<div class="space-y-1 text-sm text-neutral-content/80">
						<div class="flex justify-between">
							<span>Mo-Sa:</span>
							<span class="mr-5">13:00 - 19:00</span>
						</div>
						<div class="flex justify-between">
							<span>So:</span>
							<span class="mr-5">Geschlossen</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Legal -->
			<div>
				<h3 class="text-lg font-semibold mb-4">{m.legal()}</h3>
				<ul class="space-y-2">
					{#each legalLinks as link (link.title)}
						<li>
							<a href={link.href} class="text-sm hover:text-secondary transition-colors">
								{link.title}
							</a>
						</li>
					{/each}
				</ul>

				<!-- Awards & Partners -->
				<div class="mt-6">
					<h4 class="font-medium mb-3">Unsere Partner</h4>
					<div class="flex gap-4 items-center">
						<div class="grayscale hover:grayscale-0 transition-all duration-300">
							<img src="/awards/davidoff.png" alt="Davidoff" class="h-16 object-contain" />
						</div>
						<div class="grayscale hover:grayscale-0 transition-all duration-300">
							<img src="/awards/habanos.png" alt="Habanos" class="h-16 object-contain" />
						</div>
					</div>
				</div>

				<!-- Payment Methods -->
				<div class="mt-6">
					<h4 class="font-medium mb-3">{m.paymentMethods()}</h4>
					<div class="grid grid-cols-3 gap-2">
						{#each ['VISA', 'MC', 'PayPal', 'SEPA', 'Crypto', 'Klarna'] as method (method)}
							<!-- Payment method icons/logos would go here -->
							<div class="bg-base-100 rounded p-2 text-center text-xs text-base-content">{method}</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Age Verification Notice -->
	<div class="bg-warning text-warning-content">
		<div class="container mx-auto px-4 py-3">
			<div class="flex items-center justify-center gap-3 text-sm">
				<Shield class="w-5 h-5" />
				<div class="text-center">
					<span class="font-medium">{m.ageVerification()}</span>
					<span class="hidden sm:inline"> - {m.ageVerificationText()}</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Bottom Bar -->
	<div class="bg-primary text-primary-content">
		<div class="container mx-auto px-4 py-4">
			<div class="flex flex-col md:flex-row justify-between items-center gap-4">
				<div class="text-sm text-center md:text-left">
					<p>© {new Date().getFullYear()} Zigarren Puro GmbH - {m.copyright()}</p>
				</div>

				<div class="flex items-center gap-4 text-xs text-primary-content/80">
					<div class="flex items-center gap-1">
						<Globe class="w-4 h-4" />
						<span>{m.madeInGermany()}</span>
					</div>
					<div class="flex items-center gap-1">
						<Shield class="w-4 h-4" />
						<span>{m.sslSecure()}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</footer>
