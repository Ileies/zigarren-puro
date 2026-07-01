<script lang="ts">
	import { Construction, ArrowLeft, Home, Phone, Mail, MapPin, Flame, Users } from '@lucide/svelte';
	import { SiFacebook, SiInstagram } from '@icons-pack/svelte-simple-icons';
	import { facebook, instagram, phone, email } from '$lib/config';

	export let title = 'Seite in Entwicklung';
	export let description = 'Diese Seite wird derzeit entwickelt und ist bald verfügbar.';
	export let showBackButton = true;
	export let showHomeButton = true;
	export let customMessage = '';

	const navigationLinks = [
		{
			href: '/',
			icon: Home,
			title: 'Startseite',
			description: 'Premium-Zigarren entdecken',
			color: 'text-primary'
		},
		{
			href: '/about',
			icon: Users,
			title: 'Über uns',
			description: 'Unsere Geschichte',
			color: 'text-secondary'
		},
		{
			href: '/contact',
			icon: Phone,
			title: 'Kontakt',
			description: 'Persönliche Beratung',
			color: 'text-accent'
		},
		{
			href: '/tastings',
			icon: Flame,
			title: 'Tastings',
			description: 'Verkostungsevents',
			color: 'text-primary'
		},
		{
			href: '/(legal)/imprint',
			icon: MapPin,
			title: 'Impressum',
			description: 'Rechtliche Informationen',
			color: 'text-secondary'
		}
	];
</script>

<div class="flex min-h-screen items-center justify-center bg-base-100 px-4 py-8">
	<div class="w-full max-w-4xl text-center">
		<Construction class="mx-auto mb-3 h-12 w-12 text-primary" />

		<!-- Title -->
		<h1 class="mb-4 text-3xl font-bold text-base-content md:text-4xl">
			{title}
		</h1>

		<!-- Description -->
		<p class="mx-auto mb-8 max-w-2xl text-lg text-base-content/70">
			{customMessage || description}
		</p>

		<!-- Navigation -->
		<div class="mb-8">
			<h2 class="mb-6 text-xl font-semibold text-base-content">
				Schauen Sie sich solange diese Seiten an:
			</h2>
		</div>

		<!-- Clean navigation grid -->
		<div class="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each navigationLinks as link (link.href)}
				<a href={link.href} class="rounded-lg bg-base-200 p-6 transition-colors hover:bg-base-300">
					<svelte:component this={link.icon} class="h-8 w-8 {link.color} mx-auto mb-3" />
					<h3 class="mb-2 font-semibold text-base-content">{link.title}</h3>
					<p class="text-sm text-base-content/60">{link.description}</p>
				</a>
			{/each}
		</div>

		<!-- Contact info -->
		<div class="mx-auto mb-8 max-w-2xl rounded-lg bg-base-200 p-6">
			<h3 class="mb-4 font-semibold text-base-content">Haben Sie Fragen?</h3>
			<div class="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
				<a
					href="tel:{phone}"
					class="flex items-center gap-2 text-base-content transition-colors hover:text-primary"
				>
					<Phone class="h-4 w-4" />
					{phone}
				</a>
				<a
					href="mailto:{email}"
					class="flex items-center gap-2 text-base-content transition-colors hover:text-primary"
				>
					<Mail class="h-4 w-4" />
					{email}
				</a>
			</div>

			<!-- Social Media Links -->
			<div class="flex items-center justify-center gap-4">
				<span class="text-sm text-base-content/60">Folgen Sie uns:</span>
				<a
					href={facebook}
					target="_blank"
					rel="noopener noreferrer"
					class="text-base-content transition-colors hover:text-primary"
				>
					<SiFacebook size={20} />
				</a>
				<a
					href={instagram}
					target="_blank"
					rel="noopener noreferrer"
					class="text-base-content transition-colors hover:text-primary"
				>
					<SiInstagram size={20} />
				</a>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			{#if showBackButton}
				<button
					onclick={() => history.back()}
					class="btn gap-2 transition-colors btn-outline btn-lg hover:btn-primary"
				>
					<ArrowLeft class="h-5 w-5" />
					Zurück
				</button>
			{/if}

			{#if showHomeButton}
				<a href="/" class="btn gap-2 transition-colors btn-lg btn-primary hover:btn-secondary">
					<Home class="h-5 w-5" />
					Zur Startseite
				</a>
			{/if}
		</div>
	</div>
</div>
