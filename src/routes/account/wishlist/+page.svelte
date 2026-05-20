<script lang="ts">
	import { enhance } from '$app/forms';
	import { Heart, ShoppingCart, Trash2, Package, ArrowLeft } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatPrice(price: string) {
		return parseFloat(price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	}

	let addedIds = $state<Set<string>>(new Set());

	function markAdded(id: string) {
		addedIds = new Set([...addedIds, id]);
		setTimeout(() => {
			addedIds = new Set([...addedIds].filter((x) => x !== id));
		}, 2000);
	}
</script>

<svelte:head>
	<title>Wunschliste – Zigarren Puro</title>
	<meta name="description" content="Ihre Wunschliste bei Zigarren Puro." />
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-3xl px-4 py-10">
		<div class="mb-6 flex items-center gap-3">
			<a href="/account" class="btn btn-ghost btn-sm gap-1 -ml-2">
				<ArrowLeft class="h-4 w-4" />
				Mein Konto
			</a>
		</div>

		<div class="mb-8 flex items-center gap-3">
			<Heart class="h-6 w-6 text-error" fill="currentColor" />
			<h1 class="text-2xl font-semibold">Wunschliste</h1>
			{#if data.items.length > 0}
				<span class="badge badge-ghost">{data.items.length}</span>
			{/if}
		</div>

		{#if data.items.length === 0}
			<div class="rounded-2xl bg-base-100 p-12 text-center shadow-sm ring-1 ring-base-300">
				<Heart class="mx-auto mb-4 h-12 w-12 text-base-content/20" />
				<p class="font-medium text-base-content/60">Ihre Wunschliste ist leer.</p>
				<a href="/shop" class="btn btn-primary mt-6">Zum Shop</a>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				{#each data.items as item (item.productId)}
					<div class="flex items-center gap-4 rounded-2xl bg-base-100 p-4 shadow-sm ring-1 ring-base-300">
						<!-- Placeholder image -->
						<div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-base-200">
							<Package class="h-7 w-7 text-base-content/20" />
						</div>

						<!-- Info -->
						<div class="min-w-0 flex-1">
							{#if item.producerName}
								<p class="text-xs text-base-content/50 uppercase tracking-wide">{item.producerName}</p>
							{/if}
							<a
								href="/products/{item.productId}"
								class="font-medium text-base-content hover:text-primary transition-colors line-clamp-1"
							>
								{item.name}
							</a>
							<p class="mt-0.5 text-sm font-semibold text-secondary">{formatPrice(item.price)}</p>
						</div>

						<!-- Actions -->
						<div class="flex shrink-0 items-center gap-2">
							<form
								method="POST"
								action="?/addToCart"
								use:enhance={() => ({ update }) => {
									update({ reset: false });
									markAdded(item.productId);
								}}
							>
								<input type="hidden" name="productId" value={item.productId} />
								<button
									type="submit"
									class="btn btn-sm btn-secondary gap-1.5 transition-all"
									class:btn-success={addedIds.has(item.productId)}
									disabled={item.stock === 0}
									title={item.stock === 0 ? 'Vergriffen' : 'In den Warenkorb'}
								>
									<ShoppingCart class="h-4 w-4" />
									{#if addedIds.has(item.productId)}
										Hinzugefügt
									{:else if item.stock === 0}
										Vergriffen
									{:else}
										Warenkorb
									{/if}
								</button>
							</form>

							<form
								method="POST"
								action="?/remove"
								use:enhance={() => ({ update }) => update()}
							>
								<input type="hidden" name="productId" value={item.productId} />
								<button type="submit" class="btn btn-sm btn-ghost text-error" title="Entfernen">
									<Trash2 class="h-4 w-4" />
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
