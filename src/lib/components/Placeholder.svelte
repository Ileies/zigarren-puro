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
		{ href: '/', icon: Home, title: 'Startseite', description: 'Premium-Zigarren entdecken', color: 'text-primary' },
		{ href: '/about', icon: Users, title: 'Über uns', description: 'Unsere Geschichte', color: 'text-secondary' },
		{ href: '/contact', icon: Phone, title: 'Kontakt', description: 'Persönliche Beratung', color: 'text-accent' },
		{ href: '/tastings', icon: Flame, title: 'Tastings', description: 'Verkostungsevents', color: 'text-primary' },
		{ href: '/(legal)/imprint', icon: MapPin, title: 'Impressum', description: 'Rechtliche Informationen', color: 'text-secondary' }
	];
</script>

<div class="min-h-screen bg-base-100 flex items-center justify-center px-4 py-8">
	<div class="max-w-4xl w-full text-center">
		<Construction class="w-12 h-12 text-primary mx-auto mb-3" />

		<!-- Title -->
		<h1 class="text-3xl md:text-4xl font-bold text-base-content mb-4">
			{title}
		</h1>

		<!-- Description -->
		<p class="text-lg text-base-content/70 mb-8 max-w-2xl mx-auto">
			{customMessage || description}
		</p>

		<!-- Navigation -->
		<div class="mb-8">
			<h2 class="text-xl font-semibold text-base-content mb-6">
				Schauen Sie sich solange diese Seiten an:
			</h2>
		</div>

		<!-- Clean navigation grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
			{#each navigationLinks as link}
				<a href={link.href} class="bg-base-200 rounded-lg p-6 hover:bg-base-300 transition-colors">
					<svelte:component this={link.icon} class="w-8 h-8 {link.color} mx-auto mb-3" />
					<h3 class="font-semibold text-base-content mb-2">{link.title}</h3>
					<p class="text-sm text-base-content/60">{link.description}</p>
				</a>
			{/each}
		</div>

		<!-- Contact info -->
		<div class="bg-base-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
			<h3 class="font-semibold text-base-content mb-4">Haben Sie Fragen?</h3>
			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
				<a href="tel:{phone}" class="flex items-center gap-2 text-base-content hover:text-primary transition-colors">
					<Phone class="w-4 h-4" />
					{phone}
				</a>
				<a href="mailto:{email}" class="flex items-center gap-2 text-base-content hover:text-primary transition-colors">
					<Mail class="w-4 h-4" />
					{email}
				</a>
			</div>
			
			<!-- Social Media Links -->
			<div class="flex justify-center items-center gap-4">
				<span class="text-sm text-base-content/60">Folgen Sie uns:</span>
				<a href={facebook} target="_blank" rel="noopener noreferrer" class="text-base-content hover:text-primary transition-colors">
					<SiFacebook size={20} />
				</a>
				<a href={instagram} target="_blank" rel="noopener noreferrer" class="text-base-content hover:text-primary transition-colors">
					<SiInstagram size={20} />
				</a>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
			{#if showBackButton}
				<button 
					onclick={() => history.back()} 
					class="btn btn-outline btn-lg gap-2 hover:btn-primary transition-colors"
				>
					<ArrowLeft class="w-5 h-5" />
					Zurück
				</button>
			{/if}

			{#if showHomeButton}
				<a 
					href="/" 
					class="btn btn-primary btn-lg gap-2 hover:btn-secondary transition-colors"
				>
					<Home class="w-5 h-5" />
					Zur Startseite
				</a>
			{/if}
		</div>
	</div>
</div>
