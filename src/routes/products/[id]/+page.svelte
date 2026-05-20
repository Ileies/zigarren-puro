<script lang="ts">
	import { enhance } from '$app/forms';
	import { Package, ShoppingCart, ArrowLeft, MapPin, Award, Check, Heart } from '@lucide/svelte';
	import { ProductType, CigarStrength } from '$lib/types';
	import type { ActionData } from './$types';

	let addedFeedback = $state(false);

	let { data, form }: { data: any; form: ActionData } = $props();

	const isWishlisted = $derived(
		form != null && 'wishlisted' in form ? (form as { wishlisted: boolean }).wishlisted : data.isWishlisted
	);

	function formatPrice(price: string) {
		return parseFloat(price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	}

	const strengthLabels: Record<CigarStrength, string> = {
		[CigarStrength.MILD]: 'Mild',
		[CigarStrength.MEDIUM]: 'Medium',
		[CigarStrength.FULL]: 'Voll'
	};

	const cigarDetails = $derived(
		data.product.productType === ProductType.CIGAR && data.details && 'strength' in data.details
			? data.details as { productId: string; lengthMm: string; ringGauge: string; strength: CigarStrength; wrapperType: string; countryOfOrigin: string; agingTimeMonths: number | null }
			: null
	);
	const cigarilloDetails = $derived(
		data.product.productType === ProductType.CIGARILLO && data.details && 'filterType' in data.details
			? data.details as { productId: string; lengthMm: string; ringGauge: string; filterType: string; wrapperType: string }
			: null
	);
	const beverageDetails = $derived(
		data.product.productType === ProductType.BEVERAGE && data.details && 'volumeMl' in data.details
			? data.details as { productId: string; volumeMl: string; alcoholPercentage: string; type: string; countryOfOrigin: string; agingYears: number | null; tastingNotes: string | null }
			: null
	);
	const toolDetails = $derived(
		data.product.productType === ProductType.TOOL && data.details && 'material' in data.details
			? data.details as { productId: string; material: string; brand: string; specifications: string | null; careInstructions: string | null }
			: null
	);
</script>

<svelte:head>
	<title>{data.product.name} – Zigarren Puro</title>
	<meta name="description" content={data.product.description ?? `${data.product.name} von ${data.product.producerName ?? 'Zigarren Puro'}`} />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-5xl">
	<a href="/shop" class="btn btn-ghost btn-sm gap-1 mb-6 -ml-2">
		<ArrowLeft class="w-4 h-4" />
		Zurück zum Shop
	</a>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-10">
		<!-- Image -->
		<div class="aspect-square bg-base-200 rounded-box flex items-center justify-center">
			<Package class="w-32 h-32 text-base-content/15" />
		</div>

		<!-- Info -->
		<div class="flex flex-col gap-4">
			{#if data.product.producerName}
				<p class="text-sm text-base-content/50 font-medium uppercase tracking-widest flex items-center gap-1.5">
					<Award class="w-4 h-4" />
					{data.product.producerName}
					{#if data.product.producerCountry}
						<span class="text-base-content/30">·</span>
						<MapPin class="w-3.5 h-3.5" />
						{data.product.producerCountry}
					{/if}
				</p>
			{/if}

			<h1 class="text-3xl font-bold leading-tight">{data.product.name}</h1>

			<div class="flex items-center gap-3">
				<span class="text-3xl font-bold text-secondary">{formatPrice(data.product.price)}</span>
				{#if data.product.stock > 0}
					<span class="badge badge-success">{data.product.stock} auf Lager</span>
				{:else}
					<span class="badge badge-error">Vergriffen</span>
				{/if}
			</div>

			{#if data.product.description}
				<p class="text-base-content/70 leading-relaxed">{data.product.description}</p>
			{/if}

			<div class="flex gap-2 mt-2">
				<form
					method="POST"
					action="?/addToCart"
					class="flex-1"
					use:enhance={() => {
						return async ({ update }) => {
							await update({ reset: false });
							addedFeedback = true;
							setTimeout(() => (addedFeedback = false), 2000);
						};
					}}
				>
					<button
						type="submit"
						class="btn btn-secondary btn-lg gap-2 w-full transition-all"
						class:btn-success={addedFeedback}
						disabled={data.product.stock === 0}
					>
						{#if addedFeedback}
							<Check class="w-5 h-5" />
							Hinzugefügt!
						{:else}
							<ShoppingCart class="w-5 h-5" />
							In den Warenkorb
						{/if}
					</button>
				</form>

				<form method="POST" action="?/toggleWishlist" use:enhance={() => ({ update }) => update({ reset: false })}>
					<button
						type="submit"
						class="btn btn-lg btn-ghost border border-base-300"
						title={isWishlisted ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
					>
						<Heart class="w-5 h-5 transition-all" fill={isWishlisted ? 'currentColor' : 'none'} color={isWishlisted ? 'oklch(var(--er))' : 'currentColor'} />
					</button>
				</form>
			</div>

			<p class="text-xs text-base-content/40">Art.-Nr.: {data.product.sku}</p>
		</div>
	</div>

	<!-- Type-specific details -->
	{#if data.details}
		<div class="divider mt-10 mb-6">Produktdetails</div>

		<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
			{#if cigarDetails}
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Länge</div>
					<div class="stat-value text-lg">{cigarDetails.lengthMm} mm</div>
				</div>
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Ringmaß</div>
					<div class="stat-value text-lg">{cigarDetails.ringGauge}</div>
				</div>
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Stärke</div>
					<div class="stat-value text-lg">{strengthLabels[cigarDetails.strength] ?? cigarDetails.strength}</div>
				</div>
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Deckblatt</div>
					<div class="stat-value text-lg">{cigarDetails.wrapperType}</div>
				</div>
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Herkunft</div>
					<div class="stat-value text-lg">{cigarDetails.countryOfOrigin}</div>
				</div>
				{#if cigarDetails.agingTimeMonths}
					<div class="stat bg-base-200 rounded-box p-4">
						<div class="stat-title text-xs">Reifung</div>
						<div class="stat-value text-lg">{cigarDetails.agingTimeMonths} Monate</div>
					</div>
				{/if}
			{/if}

			{#if cigarilloDetails}
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Länge</div>
					<div class="stat-value text-lg">{cigarilloDetails.lengthMm} mm</div>
				</div>
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Ringmaß</div>
					<div class="stat-value text-lg">{cigarilloDetails.ringGauge}</div>
				</div>
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Filter</div>
					<div class="stat-value text-lg">{cigarilloDetails.filterType}</div>
				</div>
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Deckblatt</div>
					<div class="stat-value text-lg">{cigarilloDetails.wrapperType}</div>
				</div>
			{/if}

			{#if beverageDetails}
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Volumen</div>
					<div class="stat-value text-lg">{beverageDetails.volumeMl} ml</div>
				</div>
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Alkohol</div>
					<div class="stat-value text-lg">{beverageDetails.alcoholPercentage} %</div>
				</div>
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Herkunft</div>
					<div class="stat-value text-lg">{beverageDetails.countryOfOrigin}</div>
				</div>
				{#if beverageDetails.agingYears}
					<div class="stat bg-base-200 rounded-box p-4">
						<div class="stat-title text-xs">Reifung</div>
						<div class="stat-value text-lg">{beverageDetails.agingYears} Jahre</div>
					</div>
				{/if}
				{#if beverageDetails.tastingNotes}
					<div class="stat bg-base-200 rounded-box p-4 col-span-2 sm:col-span-3">
						<div class="stat-title text-xs">Geschmack</div>
						<div class="stat-value text-base font-normal leading-relaxed">{beverageDetails.tastingNotes}</div>
					</div>
				{/if}
			{/if}

			{#if toolDetails}
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Material</div>
					<div class="stat-value text-lg">{toolDetails.material}</div>
				</div>
				<div class="stat bg-base-200 rounded-box p-4">
					<div class="stat-title text-xs">Marke</div>
					<div class="stat-value text-lg">{toolDetails.brand}</div>
				</div>
				{#if toolDetails.specifications}
					<div class="stat bg-base-200 rounded-box p-4">
						<div class="stat-title text-xs">Spezifikationen</div>
						<div class="stat-value text-base font-normal">{toolDetails.specifications}</div>
					</div>
				{/if}
				{#if toolDetails.careInstructions}
					<div class="stat bg-base-200 rounded-box p-4 col-span-2 sm:col-span-3">
						<div class="stat-title text-xs">Pflegehinweise</div>
						<div class="stat-value text-base font-normal leading-relaxed">{toolDetails.careInstructions}</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}

	{#if data.product.producerDescription}
		<div class="divider mt-8 mb-6">Über den Hersteller</div>
		<div class="bg-base-200 rounded-box p-6">
			<h2 class="font-semibold text-lg mb-2">{data.product.producerName}</h2>
			<p class="text-base-content/70 leading-relaxed">{data.product.producerDescription}</p>
		</div>
	{/if}
</div>
