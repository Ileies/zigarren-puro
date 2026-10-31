<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { PageInfo } from '#lib/server/pagination.js';

	let {
		paging,
		path,
		params
	}: {
		paging: PageInfo;
		/** The list page, for example `/admin/orders`. */
		path: string;
		/** The active filters. Empty values are left out of the links. */
		params: Record<string, string>;
	} = $props();

	function href(page: number) {
		const query = new SvelteURLSearchParams();
		for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
		if (page > 1) query.set('page', String(page));
		const text = query.toString();
		return text ? `${path}?${text}` : path;
	}

	const linkClass =
		'rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-400';
	const from = $derived(paging.total === 0 ? 0 : paging.offset + 1);
	const to = $derived(Math.min(paging.offset + paging.pageSize, paging.total));
</script>

{#if paging.pages > 1}
	<nav class="mt-4 flex items-center justify-between" aria-label="Seiten">
		<span class="text-xs text-zinc-400">{from} bis {to} von {paging.total}</span>
		<div class="flex items-center gap-2">
			{#if paging.page > 1}
				<a href={href(paging.page - 1)} rel="prev" class={linkClass}>&larr; Zurück</a>
			{/if}
			<span class="text-xs text-zinc-500">Seite {paging.page} von {paging.pages}</span>
			{#if paging.page < paging.pages}
				<a href={href(paging.page + 1)} rel="next" class={linkClass}>Weiter &rarr;</a>
			{/if}
		</div>
	</nav>
{/if}
