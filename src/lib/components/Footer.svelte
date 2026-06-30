<script lang="ts">
	import { Award, Globe, Mail, MapPin, Phone, Shield, Truck } from '@lucide/svelte';
	import { SiFacebook, SiInstagram } from '@icons-pack/svelte-simple-icons';
	import {
		storeAddress,
		location,
		facebook as defaultFacebook,
		instagram as defaultInstagram,
		phone,
		email
	} from '$lib/config';
	import * as m from '$lib/messages';
	import { enhance } from '$app/forms';

	interface Props {
		facebook?: string;
		instagram?: string;
	}

	let { facebook = defaultFacebook, instagram = defaultInstagram }: Props = $props();

	const customerServiceLinks = [
		{ title: m.contact(), href: '/contact' },
		{ title: m.shipping(), href: '/shipping' },
		{ title: m.returns(), href: '/returns' },
		{ title: m.faq(), href: '/faq' }
	];

	const companyLinks = [
		{ title: m.aboutUs(), href: '/about' },
		{ title: m.news(), href: '/news' },
		{ title: m.careers(), href: '/career' },
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
	let subscribeSuccess = $state(false);

	const methods = [
		{
			title: 'VISA & MC',
			icon: 'visa-mc',
			description: 'VISA & MC'
		},
		{
			title: 'Amex',
			icon: 'amex',
			description: 'Amex'
		},
		{
			title: 'Vorkasse',
			icon: 'vorkasse',
			description: 'Vorkasse'
		},
		{
			title: 'SEPA',
			icon: 'sepa',
			description: 'SEPA'
		},
		{
			title: 'Nachnahme',
			icon: 'nachnahme',
			description: 'Nachnahme'
		},
		{
			title: 'Klarna',
			icon: 'klarna-sofort',
			description: 'Klarna'
		}
	];
	// TODO: maybe add Giro, Google, Apple
</script>

<footer class="bg-neutral text-neutral-content">
	<!-- Main Footer Content -->
	<div class="container mx-auto px-4 py-12">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
			<!-- Company Info & Newsletter -->
			<div class="lg:col-span-1">
				<div class="mb-6">
					<img src="/logo.png" alt="Zigarren Puro" class="mb-4 h-16" />
					<p class="mb-4 text-sm text-neutral-content/80">
						{m.expertCurated()} - {m.companyDescription()}
					</p>
				</div>

				<!-- Newsletter Signup -->
				<div class="mb-6">
					<h3 class="mb-3 text-lg font-semibold">{m.newsletter()}</h3>
					<p class="mb-4 text-sm text-neutral-content/80">{m.newsletterDesc()}</p>
					{#if subscribeSuccess}
						<p class="text-sm text-success">{m.newsletterSuccess()}</p>
					{:else}
						<form
							action="/newsletter?/subscribe"
							method="POST"
							class="flex gap-2"
							use:enhance={() => {
								isSubscribing = true;
								return async ({ result, update }) => {
									isSubscribing = false;
									if (result.type === 'success') {
										subscribeSuccess = true;
										customerEmail = '';
									} else {
										await update();
									}
								};
							}}
						>
							<label class="input-bordered input input-sm flex-1 bg-base-100 text-base-content">
								<Mail class="h-4 w-4 opacity-70" />
								<input
									type="email"
									name="email"
									placeholder={m.yourEmail()}
									bind:value={customerEmail}
									required
									class="grow bg-transparent"
								/>
							</label>
							<button
								type="submit"
								class="btn flex-shrink-0 btn-sm btn-secondary"
								disabled={isSubscribing}
							>
								{isSubscribing ? m.processing() : m.subscribe()}
							</button>
						</form>
					{/if}
				</div>

				<!-- Social Media -->
				<div>
					<h4 class="mb-3 font-medium">{m.followUs()}</h4>
					<div class="flex gap-3">
						<a
							href={facebook}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Facebook"
							class="btn btn-circle transition-colors btn-outline btn-sm hover:btn-secondary"
						>
							<SiFacebook size={16} />
						</a>
						<a
							href={instagram}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Instagram"
							class="btn btn-circle transition-colors btn-outline btn-sm hover:btn-secondary"
						>
							<SiInstagram size={16} />
						</a>
					</div>
				</div>
			</div>

			<!-- Customer Service -->
			<div>
				<h3 class="mb-4 text-lg font-semibold">{m.customerService()}</h3>
				<ul class="space-y-2">
					{#each customerServiceLinks as link (link.title)}
						<li>
							<a href={link.href} class="text-sm transition-colors hover:text-secondary">
								{link.title}
							</a>
						</li>
					{/each}
				</ul>

				<!-- Contact Info -->
				<div class="mt-6">
					<h4 class="mb-3 font-medium">{m.contact()}</h4>
					<div class="space-y-2 text-sm text-neutral-content/80">
						<a class="flex items-center gap-2" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
							<Phone class="h-4 w-4" />
							<span>{phone}</span>
						</a>
						<a class="flex items-center gap-2" href={`mailto:${email}`}>
							<Mail class="h-4 w-4" />
							<span>{email}</span>
						</a>
						<a class="flex items-start gap-2" href={location} target="_blank">
							<MapPin class="mt-0.5 h-4 w-4" />
							<span
								>Zigarren Puro GmbH<br />{storeAddress.split(', ')[0]}<br />{storeAddress.split(
									', '
								)[1]}</span
							>
						</a>
					</div>
				</div>
			</div>

			<!-- Company -->
			<div>
				<h3 class="mb-4 text-lg font-semibold">{m.company()}</h3>
				<ul class="space-y-2">
					{#each companyLinks as link (link.title)}
						<li>
							<a href={link.href} class="text-sm transition-colors hover:text-secondary">
								{link.title}
							</a>
						</li>
					{/each}
				</ul>

				<!-- Opening Hours -->
				<div class="mt-6">
					<h4 class="mb-3 font-medium">Öffnungszeiten</h4>
					<div class="space-y-1 text-sm text-neutral-content/80">
						<div class="flex gap-4">
							<span class="min-w-[3rem]">Mo-Sa:</span>
							<span>13:00 - 19:00</span>
						</div>
						<div class="flex gap-4">
							<span class="min-w-[3rem]">So:</span>
							<span>Geschlossen</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Legal -->
			<div>
				<h3 class="mb-4 text-lg font-semibold">{m.legal()}</h3>
				<ul class="space-y-2">
					{#each legalLinks as link (link.title)}
						<li>
							<a href={link.href} class="text-sm transition-colors hover:text-secondary">
								{link.title}
							</a>
						</li>
					{/each}
				</ul>

				<!-- Awards & Partners -->
				<div class="mt-6">
					<h4 class="mb-3 font-medium">{m.awards()}</h4>
					<div class="flex items-center gap-4">
						<div class="grayscale transition-all duration-300 hover:grayscale-0">
							<img src="/awards/davidoff.png" alt="Davidoff" class="h-16 object-contain" />
						</div>
						<div class="grayscale transition-all duration-300 hover:grayscale-0">
							<img src="/awards/habanos.png" alt="Habanos" class="h-16 object-contain" />
						</div>
					</div>
				</div>

				<!-- Payment Methods -->
				<div class="mt-6">
					<h4 class="mb-3 font-medium">{m.paymentMethods()}</h4>
					<div class="grid max-w-[200px] grid-cols-3 gap-2">
						{#each methods as method (method)}
							<img
								src={`/payment-methods/${method.icon}.svg`}
								alt={method.title}
								title={method.title}
								class="h-10"
							/>
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
				<Shield class="h-5 w-5" />
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
			<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
				<div class="text-center text-sm md:text-left">
					<p>© {new Date().getFullYear()} Zigarren Puro GmbH - {m.copyright()}</p>
				</div>

				<div class="flex items-center gap-4 text-xs text-primary-content/80">
					<div class="flex items-center gap-1">
						<Globe class="h-4 w-4" />
						<span>{m.madeInGermany()}</span>
					</div>
					<div class="flex items-center gap-1">
						<Shield class="h-4 w-4" />
						<span>{m.sslSecure()}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</footer>
