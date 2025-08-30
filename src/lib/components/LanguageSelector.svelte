<script lang="ts">
	import { getLocale, locales, setLocale } from '$lib/paraglide/runtime';
	import { ChevronDown } from 'lucide-svelte';

	let isOpen = $state(false);
	let currentLocale = $state(getLocale());

	// Dynamic flag generation from locale code
	const getFlagEmoji = (locale: string): string => {
		if (locale === 'en') locale = 'us';
		return locale.toUpperCase()
			.split('')
			.map(char => String.fromCodePoint(0x1F1E6 + char.charCodeAt(0) - 65))
			.join('');
	};

	// Use all supported locales from Paraglide
	const supportedLanguages = locales;

	function handleLanguageChange(locale: typeof locales[number]) {
		setLocale(locale);
		currentLocale = locale;
		isOpen = false;
	}

	function toggleDropdown(event: MouseEvent) {
		event.stopPropagation();
		isOpen = !isOpen;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.language-selector')) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (typeof window !== 'undefined') {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="language-selector relative">
	<button
		class="btn btn-ghost btn-sm lg:btn-xs hover:bg-white/10 transition-colors flex items-center gap-1 lg:gap-0.5 min-h-0 h-8 lg:h-5 px-3 lg:px-1"
		onclick={toggleDropdown}
		aria-label="Select language"
	>
		<span class="text-lg lg:text-sm">{getFlagEmoji(currentLocale)}</span>
		<ChevronDown class="w-4 h-4 lg:w-2.5 lg:h-2.5 transition-transform {isOpen ? 'rotate-180' : ''}" />
	</button>

	{#if isOpen}
		<div
			class="absolute top-full right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-[9999] min-w-28">
			<ul class="py-1">
				{#each supportedLanguages as locale (locale)}
					<li>
						<button
							class="w-full px-3 py-2 text-left hover:bg-base-200 transition-colors flex items-center gap-2 text-sm text-base-content"
							onclick={() => handleLanguageChange(locale)}
							class:bg-base-200={locale === currentLocale}
						>
							<span class="text-base">{getFlagEmoji(locale)}</span>
							<span class="text-sm text-base-content">{locale.toUpperCase()}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div> 