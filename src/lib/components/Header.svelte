<script lang="ts">
	import { BadgePercent, CircleUser, Menu, Search, ShoppingCart, Truck, X } from '@lucide/svelte';
	import { SiFacebook, SiInstagram } from '@icons-pack/svelte-simple-icons';
	import LanguageSelector from './LanguageSelector.svelte';
	import { facebook, instagram } from '$lib/config';
	import * as m from '$lib/messages';
	import type { SessionValidationResult } from '$lib/server/auth';

	let { user, cartCount = 0 }: { user: SessionValidationResult['user']; cartCount?: number } =
		$props();

	const navigation = [
		{ title: m.cigars(), href: '/shop?type=cigar' },
		{ title: m.zigarillos(), href: '/shop?type=cigarillo' },
		{ title: m.pipestobacco(), href: '/search?t=pipes+tobacco' },
		{ title: m.accessories(), href: '/shop?type=tool' },
		{ title: m.spirits(), href: '/shop?type=beverage' },
		{ title: m.gifts(), href: '/search?t=gifts' },
		{ title: m.sale(), href: '/search?flag=sale' },
		{ title: m.news(), href: '/news' }
	];

	let mobileMenuOpen = $state(false);
	let isMobile = $state(false);

	// Check if we're on mobile
	if (typeof window !== 'undefined') {
		const checkMobile = () => {
			isMobile = window.innerWidth < 1024;
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
	}
</script>

<!-- Mobile Drawer -->
<div class="drawer">
	<input id="mobile-drawer" type="checkbox" class="drawer-toggle" bind:checked={mobileMenuOpen} />

	<div class="drawer-content">
		<header class="w-full bg-primary text-primary-content">
			{#if isMobile}
				<!-- Mobile Header -->
				<div class="bg-primary">
					<!-- Top section with logo, menu, and language selector -->
					<div class="relative flex items-center justify-center px-4 py-4">
						<a href="/"><img src="/logo.png" alt="Zigarren Puro" class="max-h-36" /></a>

						<!-- Language selector positioned on top of logo -->
						<div class="absolute top-2 right-2">
							<LanguageSelector />
						</div>
					</div>

					<!-- Search bar with account and cart buttons -->
					<div class="px-4 pb-4">
						<div class="flex justify-between gap-3">
							<label
								for="mobile-drawer"
								class="btn btn-circle flex-shrink-0 btn-ghost transition-colors"
							>
								<Menu class="h-7 w-7" />
							</label>

							<div class="flex-1">
								<label
									class="input-bordered border-neutral-focus input w-full bg-neutral text-neutral-content transition-colors focus-within:border-secondary"
								>
									<Search class="h-5 w-5 opacity-70" />
									<input
										type="search"
										placeholder={m.search()}
										class="grow bg-transparent placeholder:text-neutral-content/60"
									/>
								</label>
							</div>

							<div class="flex flex-shrink-0 items-center gap-5">
								<a
									href={user ? '/account' : '/login'}
									class="text-primary-content/70 transition-colors hover:text-primary-content"
									aria-label={user ? 'Mein Konto' : 'Anmelden'}
								>
									<CircleUser class="h-8 w-8" />
								</a>
								<a
									href="/cart"
									class="relative text-primary-content/70 transition-colors hover:text-primary-content"
									aria-label="Warenkorb"
								>
									<ShoppingCart class="h-8 w-8" />
									{#if cartCount > 0}<span
											class="absolute -top-1 -right-1 badge badge-xs font-bold badge-accent"
											>{cartCount > 99 ? '99+' : cartCount}</span
										>{/if}
								</a>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<!-- Top bar - Desktop only -->
				<div
					class="flex items-center justify-between bg-secondary px-6 py-1 text-sm text-secondary-content"
				>
					<span class="flex items-center gap-1"
						><BadgePercent class="h-4 w-4" /> {m.benefit1()}</span
					>
					<span>{m.benefit2()}</span>
					<span class="hidden items-center gap-1 xl:flex"
						><Truck class="h-4 w-4" /> {m.benefit3()}</span
					>
					<div class="flex items-center gap-4">
						<a
							href={facebook}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Facebook"
							class="transition-colors hover:text-accent"
						>
							<SiFacebook size={16} />
						</a>
						<a
							href={instagram}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Instagram"
							class="transition-colors hover:text-accent"
						>
							<SiInstagram size={16} />
						</a>
						<LanguageSelector />
					</div>
				</div>
				<!-- Desktop Header -->
				<div class="block">
					<div class="flex items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6">
						<!-- Logo -->
						<a class="flex flex-shrink-0 items-center space-x-4" href="/">
							<img src="/logo.png" alt="Zigarren Puro" class="h-32 xl:h-36" />
						</a>

						<label
							class="input-bordered border-neutral-focus input w-48 bg-neutral text-neutral-content transition-colors focus-within:border-secondary sm:w-64 lg:w-96 xl:w-[500px] 2xl:w-[600px]"
						>
							<Search class="h-4 w-4 opacity-70" />
							<input
								type="search"
								placeholder={m.search()}
								class="grow bg-transparent placeholder:text-neutral-content/60"
							/>
						</label>

						<!-- Icons -->
						<div class="flex flex-shrink-0 items-center gap-6">
							<a
								class="flex items-center gap-2 text-primary-content/70 transition-colors hover:text-primary-content"
								href={user ? '/account' : '/login'}
								aria-label={user ? 'Mein Konto' : 'Anmelden'}
							>
								<CircleUser class="h-7 w-7" />
								<span class="hidden text-base tracking-wide xl:block"
									>{user ? user.firstName : 'Anmelden'}</span
								>
							</a>
							<a
								class="flex items-center gap-2 text-primary-content/70 transition-colors hover:text-primary-content"
								href="/cart"
								aria-label="Warenkorb"
							>
								<ShoppingCart class="h-7 w-7" />
								<span class="hidden text-base tracking-wide xl:block">Warenkorb</span>
								{#if cartCount > 0}<span class="text-base font-semibold text-accent"
										>{cartCount > 99 ? '99+' : cartCount}</span
									>{/if}
							</a>
						</div>
					</div>

					<!-- Desktop Navigation -->
					<nav class="bg-neutral px-3 text-neutral-content sm:px-6">
						<ul class="flex overflow-x-auto">
							{#each navigation as navItem (navItem.title)}
								<li class="flex-1">
									<a
										href={navItem.href}
										class="flex h-full items-center justify-center px-1 py-2 text-xs font-normal whitespace-nowrap transition-colors hover:bg-white/10 sm:text-sm md:text-base"
									>
										{navItem.title}
									</a>
								</li>
							{/each}
						</ul>
					</nav>
				</div>
			{/if}
		</header>
	</div>

	{#if isMobile}
		<!-- Mobile Drawer Sidebar -->
		<div class="drawer-side">
			<label for="mobile-drawer" class="drawer-overlay"></label>
			<aside class="flex min-h-full w-80 flex-col bg-base-100 text-base-content">
				<!-- Drawer Header -->
				<div
					class="border-primary-focus flex items-center justify-between border-b bg-primary p-6 text-primary-content"
				>
					<div class="flex items-center gap-3">
						<img src="/logo.png" alt="Zigarren Puro" class="h-8" />
						<h2 class="text-xl font-bold">{m.categories()}</h2>
					</div>
					<label for="mobile-drawer" class="btn btn-circle btn-ghost btn-sm">
						<X class="h-6 w-6" />
					</label>
				</div>

				<!-- Navigation Menu -->
				<div class="flex-1 overflow-y-auto">
					<ul class="menu w-full p-0">
						{#each navigation as navItem (navItem.title)}
							<li class="border-b border-base-200 last:border-b-0">
								<a
									href={navItem.href}
									class="flex items-center rounded-none px-6 py-4 text-lg font-medium transition-all duration-200 hover:bg-primary hover:text-primary-content"
									onclick={() => (mobileMenuOpen = false)}
								>
									<span class="flex-1">{navItem.title}</span>
									{#if navItem.title === 'Sale %'}
										<span class="badge badge-sm badge-accent">NEU</span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Drawer Footer -->
				<div class="mt-auto border-t border-base-300 bg-base-200 p-6">
					<!-- User / Auth -->
					<div class="mb-5">
						{#if user}
							<p class="mb-2 text-sm font-medium text-base-content">
								Hallo, {user.firstName}
							</p>
							<div class="flex gap-2">
								<a
									href="/account"
									onclick={() => (mobileMenuOpen = false)}
									class="btn flex-1 btn-outline btn-sm">Mein Konto</a
								>
								<form method="POST" action="/logout" class="flex-1">
									<button type="submit" class="btn w-full text-error btn-ghost btn-sm"
										>Abmelden</button
									>
								</form>
							</div>
						{:else}
							<div class="flex gap-2">
								<a
									href="/login"
									onclick={() => (mobileMenuOpen = false)}
									class="btn flex-1 btn-sm btn-primary">Anmelden</a
								>
								<a
									href="/register"
									onclick={() => (mobileMenuOpen = false)}
									class="btn flex-1 btn-outline btn-sm">Registrieren</a
								>
							</div>
						{/if}
					</div>

					<div class="mb-4 text-center">
						<p class="mb-3 text-sm font-medium text-base-content/80">{m.followUs()}</p>
						<div class="flex justify-center gap-4">
							<a
								href={facebook}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Facebook"
								class="btn btn-circle transition-colors btn-outline btn-sm hover:btn-primary"
							>
								<SiFacebook size={20} />
							</a>
							<a
								href={instagram}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Instagram"
								class="btn btn-circle transition-colors btn-outline btn-sm hover:btn-primary"
							>
								<SiInstagram size={20} />
							</a>
						</div>
					</div>

					<div class="text-center text-xs text-base-content/60">
						<p>© {new Date().getFullYear()} Zigarren Puro</p>
					</div>
				</div>
			</aside>
		</div>
	{/if}
</div>
