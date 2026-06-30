<script lang="ts">
	import { BadgePercent, CircleUser, Menu, Search, ShoppingCart, Truck, X } from '@lucide/svelte';
	import { SiFacebook, SiInstagram } from '@icons-pack/svelte-simple-icons';
	import LanguageSelector from './LanguageSelector.svelte';
	import { facebook, instagram } from '$lib/config';
	import * as m from '$lib/messages';
	import type { SessionValidationResult } from '$lib/server/auth';

	let { user, cartCount = 0 }: { user: SessionValidationResult['user']; cartCount?: number } = $props();

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
					<div class="flex items-center justify-center px-4 py-4 relative">
						<a href="/"><img src="/logo.png" alt="Zigarren Puro" class="max-h-36" /></a>

						<!-- Language selector positioned on top of logo -->
						<div class="absolute top-2 right-2">
							<LanguageSelector />
						</div>
					</div>

					<!-- Search bar with account and cart buttons -->
					<div class="px-4 pb-4">
						<div class="flex gap-3 justify-between">
							<label for="mobile-drawer"
										 class="btn btn-ghost btn-circle transition-colors flex-shrink-0">
								<Menu class="w-7 h-7" />
							</label>

							<div class="flex-1">
								<label
									class="input input-bordered bg-neutral text-neutral-content border-neutral-focus focus-within:border-secondary transition-colors w-full">
									<Search class="w-5 h-5 opacity-70" />
									<input type="search" placeholder={m.search()}
												 class="grow bg-transparent placeholder:text-neutral-content/60" />
								</label>
							</div>

							<div class="flex items-center gap-5 flex-shrink-0">
								<a href={user ? '/account' : '/login'} class="text-primary-content/70 hover:text-primary-content transition-colors" aria-label={user ? 'Mein Konto' : 'Anmelden'}>
									<CircleUser class="w-8 h-8" />
								</a>
								<a href="/cart" class="relative text-primary-content/70 hover:text-primary-content transition-colors" aria-label="Warenkorb">
									<ShoppingCart class="w-8 h-8" />
									{#if cartCount > 0}<span class="badge badge-accent badge-xs absolute -top-1 -right-1 font-bold">{cartCount > 99 ? '99+' : cartCount}</span>{/if}
								</a>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<!-- Top bar - Desktop only -->
				<div class="flex justify-between items-center px-6 py-1 text-sm bg-secondary text-secondary-content">
					<span class="flex gap-1 items-center"><BadgePercent class="w-4 h-4" /> {m.benefit1()}</span>
					<span>{m.benefit2()}</span>
					<span class="hidden xl:flex gap-1 items-center"><Truck class="w-4 h-4" /> {m.benefit3()}</span>
					<div class="flex gap-4 items-center">
						<a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
							 class="hover:text-accent transition-colors">
							<SiFacebook size={16} />
						</a>
						<a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
							 class="hover:text-accent transition-colors">
							<SiInstagram size={16} />
						</a>
						<LanguageSelector />
					</div>
				</div>
				<!-- Desktop Header -->
				<div class="block">
					<div class="flex justify-between items-center px-3 sm:px-6 gap-2 py-2 sm:gap-4">
						<!-- Logo -->
						<a class="flex items-center space-x-4 flex-shrink-0" href="/">
							<img src="/logo.png" alt="Zigarren Puro" class="h-32 xl:h-36" />
						</a>

						<label
							class="input input-bordered bg-neutral text-neutral-content border-neutral-focus w-48 sm:w-64 lg:w-96 xl:w-[500px] 2xl:w-[600px] focus-within:border-secondary transition-colors">
							<Search class="w-4 h-4 opacity-70" />
							<input type="search" placeholder={m.search()}
										 class="grow bg-transparent placeholder:text-neutral-content/60" />
						</label>

						<!-- Icons -->
						<div class="flex items-center gap-6 flex-shrink-0">
							{#if user}
								<div class="dropdown dropdown-end">
									<button tabindex="0" class="flex items-center gap-2 text-primary-content/70 hover:text-primary-content transition-colors cursor-pointer" aria-label="Konto">
										<CircleUser class="w-7 h-7" />
										<span class="hidden xl:block text-base tracking-wide">{user.firstName}</span>
									</button>
									<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
									<ul tabindex="0" class="dropdown-content menu bg-base-100 text-base-content rounded-box z-50 w-52 p-2 shadow-lg ring-1 ring-base-300 mt-1">
										<li class="menu-title text-xs px-3 py-1">{user.firstName} {user.lastName}</li>
										<li><a href="/account">Mein Konto</a></li>
										<li><a href="/account/orders">Meine Bestellungen</a></li>
										<li>
											<form method="POST" action="/logout">
												<button type="submit" class="w-full text-left text-error">Abmelden</button>
											</form>
										</li>
									</ul>
								</div>
							{:else}
								<a class="flex items-center gap-2 text-primary-content/70 hover:text-primary-content transition-colors" href="/login" aria-label="Anmelden">
									<CircleUser class="w-7 h-7" />
									<span class="hidden xl:block text-base tracking-wide">Anmelden</span>
								</a>
							{/if}
							<a class="flex items-center gap-2 text-primary-content/70 hover:text-primary-content transition-colors" href="/cart" aria-label="Warenkorb">
								<ShoppingCart class="w-7 h-7" />
								<span class="hidden xl:block text-base tracking-wide">Warenkorb</span>
								{#if cartCount > 0}<span class="text-accent text-base font-semibold">{cartCount > 99 ? '99+' : cartCount}</span>{/if}
							</a>
						</div>
					</div>

					<!-- Desktop Navigation -->
					<nav class="bg-neutral text-neutral-content px-3 sm:px-6">
						<ul class="flex overflow-x-auto">
							{#each navigation as navItem (navItem.title)}
								<li class="flex-1">
									<a href={navItem.href}
										 class="flex items-center justify-center py-2 px-1 text-xs sm:text-sm md:text-base whitespace-nowrap hover:bg-white/10 transition-colors font-normal h-full">
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
			<aside class="min-h-full w-80 bg-base-100 text-base-content flex flex-col">
				<!-- Drawer Header -->
				<div
					class="flex items-center justify-between p-6 bg-primary text-primary-content border-b border-primary-focus">
					<div class="flex items-center gap-3">
						<img src="/logo.png" alt="Zigarren Puro" class="h-8" />
						<h2 class="text-xl font-bold">{m.categories()}</h2>
					</div>
					<label for="mobile-drawer" class="btn btn-ghost btn-circle btn-sm">
						<X class="w-6 h-6" />
					</label>
				</div>

				<!-- Navigation Menu -->
				<div class="flex-1 overflow-y-auto">
					<ul class="menu w-full p-0">
						{#each navigation as navItem (navItem.title)}
							<li class="border-b border-base-200 last:border-b-0">
								<a
									href={navItem.href}
									class="flex items-center px-6 py-4 text-lg font-medium hover:bg-primary hover:text-primary-content transition-all duration-200 rounded-none"
									onclick={() => mobileMenuOpen = false}
								>
									<span class="flex-1">{navItem.title}</span>
									{#if navItem.title === 'Sale %'}
										<span class="badge badge-accent badge-sm">NEU</span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Drawer Footer -->
				<div class="mt-auto p-6 bg-base-200 border-t border-base-300">
					<!-- User / Auth -->
					<div class="mb-5">
						{#if user}
							<p class="text-sm font-medium text-base-content mb-2">
								Hallo, {user.firstName}
							</p>
							<div class="flex gap-2">
								<a href="/account" onclick={() => mobileMenuOpen = false} class="btn btn-outline btn-sm flex-1">Mein Konto</a>
								<form method="POST" action="/logout" class="flex-1">
									<button type="submit" class="btn btn-ghost btn-sm w-full text-error">Abmelden</button>
								</form>
							</div>
						{:else}
							<div class="flex gap-2">
								<a href="/login" onclick={() => mobileMenuOpen = false} class="btn btn-primary btn-sm flex-1">Anmelden</a>
								<a href="/register" onclick={() => mobileMenuOpen = false} class="btn btn-outline btn-sm flex-1">Registrieren</a>
							</div>
						{/if}
					</div>

					<div class="text-center mb-4">
						<p class="text-sm font-medium text-base-content/80 mb-3">{m.followUs()}</p>
						<div class="flex justify-center gap-4">
							<a
								href={facebook}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Facebook"
								class="btn btn-circle btn-outline btn-sm hover:btn-primary transition-colors"
							>
								<SiFacebook size={20} />
							</a>
							<a
								href={instagram}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Instagram"
								class="btn btn-circle btn-outline btn-sm hover:btn-primary transition-colors"
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
