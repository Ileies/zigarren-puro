<script lang="ts">
	let { data } = $props();

	function formatDate(ts: Date | null) {
		if (!ts) return '-';
		return new Date(ts).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		const q = new FormData(e.target as HTMLFormElement).get('search') as string;
		const url = new URL(window.location.href);
		if (q) url.searchParams.set('search', q);
		else url.searchParams.delete('search');
		window.location.href = url.toString();
	}
</script>

<div class="max-w-5xl p-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-xl font-bold text-zinc-900">Kunden</h1>
			<p class="mt-0.5 text-sm text-zinc-500">
				{data.customers.length}
				{data.search ? '(gefiltert)' : ''}
			</p>
		</div>
	</div>

	<form onsubmit={handleSearch} class="mb-6 flex gap-2">
		<input
			type="text"
			name="search"
			placeholder="Name oder E-Mail suchen..."
			value={data.search}
			class="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
		/>
		<button
			type="submit"
			class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
		>
			Suchen
		</button>
		{#if data.search}
			<a
				href="/admin/customers"
				class="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
			>
				Zurücksetzen
			</a>
		{/if}
	</form>

	<div class="overflow-hidden rounded-lg border border-zinc-200 bg-white">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-zinc-200 bg-zinc-50">
					<th class="px-4 py-3 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Name</th
					>
					<th class="px-4 py-3 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>E-Mail</th
					>
					<th
						class="px-4 py-3 text-center text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Verifiziert</th
					>
					<th class="px-4 py-3 text-right text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Bestellungen</th
					>
					<th class="px-4 py-3 text-right text-xs font-medium tracking-wide text-zinc-500 uppercase"
						>Registriert</th
					>
				</tr>
			</thead>
			<tbody>
				{#each data.customers as customer (customer.id)}
					<tr class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
						<td class="px-4 py-3 font-medium text-zinc-900">
							{customer.firstName}
							{customer.lastName}
						</td>
						<td class="px-4 py-3 text-zinc-500">{customer.email}</td>
						<td class="px-4 py-3 text-center">
							{#if customer.isVerified}
								<span class="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
									>Ja</span
								>
							{:else}
								<span class="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500"
									>Nein</span
								>
							{/if}
						</td>
						<td class="px-4 py-3 text-right text-zinc-700 tabular-nums">{customer.orderCount}</td>
						<td class="px-4 py-3 text-right text-xs text-zinc-400"
							>{formatDate(customer.createdAt)}</td
						>
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
