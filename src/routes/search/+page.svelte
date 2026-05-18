<script lang="ts">
	import { page } from '$app/state';
	import { Search, SlidersHorizontal, Package } from 'lucide-svelte';

	const filters = [
		{ key: 'cigars',        label: 'Zigarren' },
		{ key: 'zigarillos',    label: 'Zigarillos' },
		{ key: 'spirits',       label: 'Spirituosen' },
		{ key: 'accessories',   label: 'Zubehör' },
		{ key: 'pipes tobacco', label: 'Pfeifen & Tabak' },
		{ key: 'gifts',         label: 'Geschenke' },
		{ key: 'sale',          label: 'Sale' },
	];

	const searchQuery = $derived(page.url.searchParams.get('q') || '');
	const activeFlag  = $derived(page.url.searchParams.get('flag') || '');

	const pageTitle = $derived(
		searchQuery
			? `Suche: „${searchQuery}"`
			: filters.find(f => f.key === activeFlag)?.label ?? 'Alle Produkte'
	);

	function buildUrl(params: Record<string, string>) {
		const u = new URLSearchParams();
		for (const [k, v] of Object.entries(params)) if (v) u.set(k, v);
		return `/search?${u.toString()}`;
	}
</script>

<svelte:head>
	<title>{pageTitle} - Zigarren Puro</title>
	<meta name="description" content="Durchsuchen Sie unsere exklusive Auswahl an Premiumzigarren, Spirituosen und Zubehör." />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<!-- Search bar -->
	<form action="/search" method="GET" class="mb-6">
		<label class="input input-bordered flex items-center gap-2 max-w-xl mx-auto">
			<Search class="w-4 h-4 text-base-content/40" />
			<input
				type="text"
				name="q"
				value={searchQuery}
				placeholder="Marke, Stärke, Herkunft …"
				class="grow"
			/>
			<button type="submit" class="btn btn-sm btn-secondary -mr-2">Suchen</button>
		</label>
	</form>

	<!-- Category chips -->
	<div class="flex flex-wrap gap-2 mb-8 justify-center">
		<a
			href="/search"
			class="btn btn-sm {!activeFlag && !searchQuery ? 'btn-secondary' : 'btn-ghost border border-base-300'}"
		>
			Alle
		</a>
		{#each filters as f}
			<a
				href={buildUrl({ flag: f.key })}
				class="btn btn-sm {activeFlag === f.key ? 'btn-secondary' : 'btn-ghost border border-base-300'}"
			>
				{f.label}
			</a>
		{/each}
	</div>

	<!-- Header row -->
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold">{pageTitle}</h1>
		<button class="btn btn-ghost btn-sm gap-1 text-base-content/60" disabled>
			<SlidersHorizontal class="w-4 h-4" />
			Filter
		</button>
	</div>

	<!-- Empty / coming-soon state -->
	<div class="flex flex-col items-center justify-center py-24 text-center gap-4 text-base-content/40">
		<Package class="w-14 h-14" />
		<div>
			<p class="text-lg font-medium text-base-content/60">Produktkatalog in Kürze verfügbar</p>
			<p class="text-sm mt-1">
				{#if searchQuery}
					Für „{searchQuery}" wurden noch keine Produkte indexiert.
				{:else}
					Die Produktdatenbank wird derzeit befüllt. Schauen Sie bald wieder vorbei.
				{/if}
			</p>
		</div>
		<a href="/contact" class="btn btn-secondary btn-sm mt-2">Persönlich anfragen</a>
	</div>
</div>
