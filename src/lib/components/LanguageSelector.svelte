<script lang="ts">
	import { getLocale, locales, setLocale } from '$lib/messages';
	import { ChevronDown } from '@lucide/svelte';

	let isOpen = $state(false);
	let currentLocale = $state(getLocale());

	// Dynamic flag generation from locale code
	const getFlagEmoji = (locale: string): string => {
		if (locale === 'en') locale = 'us';
		return locale
			.toUpperCase()
			.split('')
			.map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
			.join('');
	};

	const supportedLanguages = locales;

	function handleLanguageChange(locale: (typeof locales)[number]) {
		setLocale(locale);
		currentLocale = locale;
		isOpen = false;
		location.reload();
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
		class="btn flex h-8 min-h-0 items-center gap-1 px-3 btn-ghost transition-colors btn-sm hover:bg-white/10 lg:h-5 lg:gap-0.5 lg:px-1 lg:btn-xs"
		onclick={toggleDropdown}
		aria-label="Select language"
	>
		<span class="text-lg lg:text-sm">{getFlagEmoji(currentLocale)}</span>
		<ChevronDown
			class="h-4 w-4 transition-transform lg:h-2.5 lg:w-2.5 {isOpen ? 'rotate-180' : ''}"
		/>
	</button>

	{#if isOpen}
		<div
			class="absolute top-full right-0 z-[9999] mt-1 min-w-28 rounded-lg border border-base-300 bg-base-100 shadow-lg"
		>
			<ul class="py-1">
				{#each supportedLanguages as locale (locale)}
					<li>
						<button
							class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-base-content transition-colors hover:bg-base-200"
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
