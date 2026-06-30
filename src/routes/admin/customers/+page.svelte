<script lang="ts">
	let { data } = $props();

	function formatDate(ts: Date | null) {
		if (!ts) return '-';
		return new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
	}

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		const q = new FormData(e.target as HTMLFormElement).get('search') as string;
		const url = new URL(window.location.href);
		if (q) url.searchParams.set('search', q); else url.searchParams.delete('search');
		window.location.href = url.toString();
	}
</script>

<div class="p-6 max-w-5xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-xl font-bold text-zinc-900">Kunden</h1>
			<p class="text-sm text-zinc-500 mt-0.5">{data.customers.length} {data.search ? '(gefiltert)' : ''}</p>
		</div>
	</div>

	<form onsubmit={handleSearch} class="flex gap-2 mb-6">
		<input
			type="text"
			name="search"
			placeholder="Name oder E-Mail suchen..."
			value={data.search}
			class="flex-1 border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
		/>
		<button type="submit" class="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-700 transition-colors">
			Suchen
		</button>
		{#if data.search}
			<a href="/admin/customers" class="px-4 py-2 rounded-md text-sm font-medium border border-zinc-300 text-zinc-600 hover:bg-zinc-50 transition-colors">
				Zurücksetzen
			</a>
		{/if}
	</form>

	<div class="bg-white rounded-lg border border-zinc-200 overflow-hidden">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-zinc-200 bg-zinc-50">
					<th class="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Name</th>
					<th class="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">E-Mail</th>
					<th class="text-center px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Verifiziert</th>
					<th class="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Bestellungen</th>
					<th class="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Registriert</th>
				</tr>
			</thead>
			<tbody>
				{#each data.customers as customer}
					<tr class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
						<td class="px-4 py-3 font-medium text-zinc-900">
							{customer.firstName} {customer.lastName}
						</td>
						<td class="px-4 py-3 text-zinc-500">{customer.email}</td>
						<td class="px-4 py-3 text-center">
							{#if customer.isVerified}
								<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Ja</span>
							{:else}
								<span class="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded font-medium">Nein</span>
							{/if}
						</td>
						<td class="px-4 py-3 text-right tabular-nums text-zinc-700">{customer.orderCount}</td>
						<td class="px-4 py-3 text-right text-zinc-400 text-xs">{formatDate(customer.createdAt)}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="5" class="px-4 py-10 text-center text-sm text-zinc-400">
							{data.search ? 'Keine Kunden gefunden.' : 'Noch keine Kunden registriert.'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
