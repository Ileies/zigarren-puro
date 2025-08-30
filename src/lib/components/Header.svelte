<script lang="ts">
	import { BadgePercent, CircleUser, Facebook, Instagram, Menu, Search, ShoppingCart, Truck, X } from 'lucide-svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import { facebook, instagram } from '$lib/config';
	import { m } from '$lib/paraglide/messages.js';

	const navigation = [
		{ title: m.cigars(), href: '/search?t=cigars' },
		{ title: m.zigarillos(), href: '/search?t=zigarillos' },
		{ title: m.pipestobacco(), href: '/search?t=pipes+tobacco' },
		{ title: m.accessories(), href: '/search?t=accessories' },
		{ title: m.spirits(), href: '/search?t=spirits' },
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

							<div class="flex items-center gap-2 flex-shrink-0">
								<a href="/login" class="btn btn-ghost btn-circle transition-colors"
									 aria-label="Login">
									<CircleUser class="w-7 h-7" />
								</a>
								<a href="/cart" class="btn btn-ghost btn-circle transition-colors relative"
									 aria-label="Cart">
									<ShoppingCart class="w-7 h-7" />
									<span class="badge badge-accent badge-xs absolute -top-1 -right-1 hidden">0</span>
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
							<Facebook class="w-4 h-4" />
						</a>
						<a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
							 class="hover:text-accent transition-colors">
							<Instagram class="w-4 h-4" />
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
						<div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
							<a class="btn btn-ghost transition-colors p-2" href="/login" aria-label="Login">
								<CircleUser class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
							</a>
							<a class="btn btn-ghost transition-colors p-2 relative" href="/cart" aria-label="Cart">
								<ShoppingCart class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
								<!-- Cart badge placeholder -->
								<span class="badge badge-accent badge-xs absolute -top-1 -right-1 hidden">0</span>
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
								<Facebook class="w-5 h-5" />
							</a>
							<a
								href={instagram}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Instagram"
								class="btn btn-circle btn-outline btn-sm hover:btn-primary transition-colors"
							>
								<Instagram class="w-5 h-5" />
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
