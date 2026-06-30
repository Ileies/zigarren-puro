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

<div class="min-h-screen flex bg-zinc-50">
	<aside class="w-52 shrink-0 bg-zinc-900 text-zinc-100 flex flex-col min-h-screen sticky top-0">
		<div class="px-4 py-5 border-b border-zinc-700">
			<div class="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Administration</div>
			<div class="font-bold text-white text-sm">Zigarren Puro</div>
		</div>
		<nav class="flex-1 p-3 space-y-0.5">
			{#each nav as item}
				<a
					href={item.href}
					class="flex items-center px-3 py-2 rounded text-sm font-medium transition-colors
					       {isActive(item.href, item.exact)
					           ? 'bg-zinc-700 text-white'
					           : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>
		<div class="p-4 border-t border-zinc-700">
			<a href="/" class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
				&larr; Zur Website
			</a>
		</div>
	</aside>

	<div class="flex-1 min-w-0">
		{@render children()}
	</div>
</div>
