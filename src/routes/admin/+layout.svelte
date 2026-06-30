<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const nav = [
		{ href: '/admin', label: 'Dashboard', exact: true },
		{ href: '/admin/inventory', label: 'Inventar', exact: false },
		{ href: '/admin/producers', label: 'Hersteller', exact: false },
		{ href: '/admin/orders', label: 'Bestellungen', exact: false },
		{ href: '/admin/customers', label: 'Kunden', exact: false },
		{ href: '/admin/content', label: 'Inhalte', exact: false }
	];

	function isActive(href: string, exact: boolean) {
		return exact ? page.url.pathname === href : page.url.pathname.startsWith(href);
	}
</script>

<div class="flex min-h-screen bg-zinc-50">
	<aside class="sticky top-0 flex min-h-screen w-52 shrink-0 flex-col bg-zinc-900 text-zinc-100">
		<div class="border-b border-zinc-700 px-4 py-5">
			<div class="mb-1 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
				Administration
			</div>
			<div class="text-sm font-bold text-white">Zigarren Puro</div>
		</div>
		<nav class="flex-1 space-y-0.5 p-3">
			{#each nav as item}
				<a
					href={item.href}
					class="flex items-center rounded px-3 py-2 text-sm font-medium transition-colors
					       {isActive(item.href, item.exact)
						? 'bg-zinc-700 text-white'
						: 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>
		<div class="border-t border-zinc-700 p-4">
			<a href="/" class="text-xs text-zinc-500 transition-colors hover:text-zinc-300">
				&larr; Zur Website
			</a>
		</div>
	</aside>

	<div class="min-w-0 flex-1">
		{@render children()}
	</div>
</div>
