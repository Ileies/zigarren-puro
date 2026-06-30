<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Package,
		ShoppingCart,
		ArrowLeft,
		MapPin,
		Award,
		Check,
		Heart,
		Star,
		Pencil,
		Trash2
	} from '@lucide/svelte';
	import { ProductType, CigarStrength } from '$lib/types';
	import type { ActionData } from './$types';

	let addedFeedback = $state(false);
	let selectedRating = $state(0);
	let hoverRating = $state(0);
	let editingReview = $state(false);

	let { data, form }: { data: any; form: ActionData } = $props();

	const isWishlisted = $derived(
		form != null && 'wishlisted' in form
			? (form as { wishlisted: boolean }).wishlisted
			: data.isWishlisted
	);

	const reviewSuccess = $derived(form != null && 'reviewSuccess' in form);
	const reviewDeleted = $derived(form != null && 'reviewDeleted' in form);
	const reviewError = $derived(
		form != null && 'reviewError' in form ? (form as { reviewError: string }).reviewError : null
	);

	$effect(() => {
		if (reviewSuccess) {
			editingReview = false;
			selectedRating = 0;
		}
	});

	$effect(() => {
		if (data.userReview && !editingReview) {
			selectedRating = data.userReview.rating;
		}
	});

	function formatPrice(price: string) {
		return parseFloat(price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	}

	function formatDate(date: string | Date) {
		return new Date(date).toLocaleDateString('de-DE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	const strengthLabels: Record<CigarStrength, string> = {
		[CigarStrength.MILD]: 'Mild',
		[CigarStrength.MEDIUM]: 'Medium',
		[CigarStrength.FULL]: 'Voll'
	};

	const cigarDetails = $derived(
		data.product.productType === ProductType.CIGAR && data.details && 'strength' in data.details
			? (data.details as {
					productId: string;
					lengthMm: string;
					ringGauge: string;
					strength: CigarStrength;
					wrapperType: string;
					countryOfOrigin: string;
					agingTimeMonths: number | null;
				})
			: null
	);
	const cigarilloDetails = $derived(
		data.product.productType === ProductType.CIGARILLO &&
			data.details &&
			'filterType' in data.details
			? (data.details as {
					productId: string;
					lengthMm: string;
					ringGauge: string;
					filterType: string;
					wrapperType: string;
				})
			: null
	);
	const beverageDetails = $derived(
		data.product.productType === ProductType.BEVERAGE && data.details && 'volumeMl' in data.details
			? (data.details as {
					productId: string;
					volumeMl: string;
					alcoholPercentage: string;
					type: string;
					countryOfOrigin: string;
					agingYears: number | null;
					tastingNotes: string | null;
				})
			: null
	);
	const toolDetails = $derived(
		data.product.productType === ProductType.TOOL && data.details && 'material' in data.details
			? (data.details as {
					productId: string;
					material: string;
					brand: string;
					specifications: string | null;
					careInstructions: string | null;
				})
			: null
	);
</script>

<svelte:head>
	<title>{data.product.name} – Zigarren Puro</title>
	<meta
		name="description"
		content={data.product.description ??
			`${data.product.name} von ${data.product.producerName ?? 'Zigarren Puro'}`}
	/>
</svelte:head>

<div class="container mx-auto max-w-5xl px-4 py-8">
	<a href="/shop" class="btn mb-6 -ml-2 gap-1 btn-ghost btn-sm">
		<ArrowLeft class="h-4 w-4" />
		Zurück zum Shop
	</a>

	<div class="grid grid-cols-1 gap-10 md:grid-cols-2">
		<!-- Image -->
		<div
			class="flex aspect-square items-center justify-center overflow-hidden rounded-box bg-base-200"
		>
			{#if data.product.imageUrl}
				<img
					src={data.product.imageUrl}
					alt={data.product.name}
					class="h-full w-full object-cover"
				/>
			{:else}
				<Package class="h-32 w-32 text-base-content/15" />
			{/if}
		</div>

		<!-- Info -->
		<div class="flex flex-col gap-4">
			{#if data.product.producerName}
				<p
					class="flex items-center gap-1.5 text-sm font-medium tracking-widest text-base-content/50 uppercase"
				>
					<Award class="h-4 w-4" />
					{data.product.producerName}
					{#if data.product.producerCountry}
						<span class="text-base-content/30">·</span>
						<MapPin class="h-3.5 w-3.5" />
						{data.product.producerCountry}
					{/if}
				</p>
			{/if}

			<h1 class="text-3xl leading-tight font-bold">{data.product.name}</h1>

			{#if data.reviewCount > 0}
				<div class="flex items-center gap-2">
					<div class="flex gap-0.5">
						{#each [1, 2, 3, 4, 5] as star}
							<Star
								class="h-4 w-4 {star <= Math.round(data.avgRating)
									? 'text-warning'
									: 'text-base-content/20'}"
								fill={star <= Math.round(data.avgRating) ? 'currentColor' : 'none'}
							/>
						{/each}
					</div>
					<span class="text-sm font-medium">{data.avgRating.toFixed(1)}</span>
					<span class="text-sm text-base-content/50"
						>({data.reviewCount} {data.reviewCount === 1 ? 'Bewertung' : 'Bewertungen'})</span
					>
				</div>
			{/if}

			<div class="flex items-center gap-3">
				<span class="text-3xl font-bold text-secondary">{formatPrice(data.product.price)}</span>
				{#if data.product.stock > 0}
					<span class="badge badge-success">{data.product.stock} auf Lager</span>
				{:else}
					<span class="badge badge-error">Vergriffen</span>
				{/if}
			</div>

			{#if data.product.description}
				<p class="leading-relaxed text-base-content/70">{data.product.description}</p>
			{/if}

			<div class="mt-2 flex gap-2">
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
						class="btn w-full gap-2 transition-all btn-lg btn-secondary"
						class:btn-success={addedFeedback}
						disabled={data.product.stock === 0}
					>
						{#if addedFeedback}
							<Check class="h-5 w-5" />
							Hinzugefügt!
						{:else}
							<ShoppingCart class="h-5 w-5" />
							In den Warenkorb
						{/if}
					</button>
				</form>

				<form
					method="POST"
					action="?/toggleWishlist"
					use:enhance={() =>
						({ update }) =>
							update({ reset: false })}
				>
					<button
						type="submit"
						class="btn border border-base-300 btn-ghost btn-lg"
						title={isWishlisted ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
					>
						<Heart
							class="h-5 w-5 transition-all"
							fill={isWishlisted ? 'currentColor' : 'none'}
							color={isWishlisted ? 'oklch(var(--er))' : 'currentColor'}
						/>
					</button>
				</form>
			</div>

			<p class="text-xs text-base-content/40">Art.-Nr.: {data.product.sku}</p>
		</div>
	</div>

	<!-- Type-specific details -->
	{#if data.details}
		<div class="divider mt-10 mb-6">Produktdetails</div>

		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
			{#if cigarDetails}
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Länge</div>
					<div class="stat-value text-lg">{cigarDetails.lengthMm} mm</div>
				</div>
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Ringmaß</div>
					<div class="stat-value text-lg">{cigarDetails.ringGauge}</div>
				</div>
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Stärke</div>
					<div class="stat-value text-lg">
						{strengthLabels[cigarDetails.strength] ?? cigarDetails.strength}
					</div>
				</div>
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Deckblatt</div>
					<div class="stat-value text-lg">{cigarDetails.wrapperType}</div>
				</div>
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Herkunft</div>
					<div class="stat-value text-lg">{cigarDetails.countryOfOrigin}</div>
				</div>
				{#if cigarDetails.agingTimeMonths}
					<div class="stat rounded-box bg-base-200 p-4">
						<div class="stat-title text-xs">Reifung</div>
						<div class="stat-value text-lg">{cigarDetails.agingTimeMonths} Monate</div>
					</div>
				{/if}
			{/if}

			{#if cigarilloDetails}
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Länge</div>
					<div class="stat-value text-lg">{cigarilloDetails.lengthMm} mm</div>
				</div>
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Ringmaß</div>
					<div class="stat-value text-lg">{cigarilloDetails.ringGauge}</div>
				</div>
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Filter</div>
					<div class="stat-value text-lg">{cigarilloDetails.filterType}</div>
				</div>
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Deckblatt</div>
					<div class="stat-value text-lg">{cigarilloDetails.wrapperType}</div>
				</div>
			{/if}

			{#if beverageDetails}
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Volumen</div>
					<div class="stat-value text-lg">{beverageDetails.volumeMl} ml</div>
				</div>
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Alkohol</div>
					<div class="stat-value text-lg">{beverageDetails.alcoholPercentage} %</div>
				</div>
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Herkunft</div>
					<div class="stat-value text-lg">{beverageDetails.countryOfOrigin}</div>
				</div>
				{#if beverageDetails.agingYears}
					<div class="stat rounded-box bg-base-200 p-4">
						<div class="stat-title text-xs">Reifung</div>
						<div class="stat-value text-lg">{beverageDetails.agingYears} Jahre</div>
					</div>
				{/if}
				{#if beverageDetails.tastingNotes}
					<div class="col-span-2 stat rounded-box bg-base-200 p-4 sm:col-span-3">
						<div class="stat-title text-xs">Geschmack</div>
						<div class="stat-value text-base leading-relaxed font-normal">
							{beverageDetails.tastingNotes}
						</div>
					</div>
				{/if}
			{/if}

			{#if toolDetails}
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Material</div>
					<div class="stat-value text-lg">{toolDetails.material}</div>
				</div>
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title text-xs">Marke</div>
					<div class="stat-value text-lg">{toolDetails.brand}</div>
				</div>
				{#if toolDetails.specifications}
					<div class="stat rounded-box bg-base-200 p-4">
						<div class="stat-title text-xs">Spezifikationen</div>
						<div class="stat-value text-base font-normal">{toolDetails.specifications}</div>
					</div>
				{/if}
				{#if toolDetails.careInstructions}
					<div class="col-span-2 stat rounded-box bg-base-200 p-4 sm:col-span-3">
						<div class="stat-title text-xs">Pflegehinweise</div>
						<div class="stat-value text-base leading-relaxed font-normal">
							{toolDetails.careInstructions}
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}

	{#if data.product.producerDescription}
		<div class="divider mt-8 mb-6">Über den Hersteller</div>
		<div class="rounded-box bg-base-200 p-6">
			<h2 class="mb-2 text-lg font-semibold">{data.product.producerName}</h2>
			<p class="leading-relaxed text-base-content/70">{data.product.producerDescription}</p>
		</div>
	{/if}

	<!-- Reviews section -->
	<div class="divider mt-10 mb-6">Kundenbewertungen</div>

	{#if data.reviewCount > 0}
		<div class="mb-8 flex items-center gap-4">
			<span class="text-5xl font-bold">{data.avgRating.toFixed(1)}</span>
			<div>
				<div class="mb-1 flex gap-0.5">
					{#each [1, 2, 3, 4, 5] as star}
						<Star
							class="h-6 w-6 {star <= Math.round(data.avgRating)
								? 'text-warning'
								: 'text-base-content/20'}"
							fill={star <= Math.round(data.avgRating) ? 'currentColor' : 'none'}
						/>
					{/each}
				</div>
				<p class="text-sm text-base-content/50">
					{data.reviewCount}
					{data.reviewCount === 1 ? 'Bewertung' : 'Bewertungen'}
				</p>
			</div>
		</div>
	{:else}
		<p class="mb-8 text-base-content/50">Noch keine Bewertungen. Seien Sie der Erste!</p>
	{/if}

	{#if reviewDeleted}
		<div class="mb-4 alert alert-info">
			<Check class="h-4 w-4" />
			Ihre Bewertung wurde gelöscht.
		</div>
	{/if}

	<!-- User's existing review or write form -->
	{#if data.userReview && !editingReview}
		<div class="mb-6 rounded-box border-l-4 border-secondary bg-base-200 p-5">
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1">
					<p class="mb-1 text-xs text-base-content/50">Ihre Bewertung</p>
					<div class="mb-2 flex gap-0.5">
						{#each [1, 2, 3, 4, 5] as star}
							<Star
								class="h-4 w-4 {star <= data.userReview.rating
									? 'text-warning'
									: 'text-base-content/20'}"
								fill={star <= data.userReview.rating ? 'currentColor' : 'none'}
							/>
						{/each}
					</div>
					{#if data.userReview.title}
						<p class="font-semibold">{data.userReview.title}</p>
					{/if}
					{#if data.userReview.body}
						<p class="mt-1 text-sm leading-relaxed text-base-content/70">{data.userReview.body}</p>
					{/if}
				</div>
				<div class="flex shrink-0 gap-2">
					<button
						type="button"
						class="btn gap-1 btn-ghost btn-sm"
						onclick={() => {
							editingReview = true;
							selectedRating = data.userReview.rating;
						}}
					>
						<Pencil class="h-3.5 w-3.5" />
						Bearbeiten
					</button>
					<form
						method="POST"
						action="?/deleteReview"
						use:enhance={() =>
							({ update }) =>
								update({ reset: false })}
					>
						<button type="submit" class="btn gap-1 text-error btn-ghost btn-sm">
							<Trash2 class="h-3.5 w-3.5" />
							Löschen
						</button>
					</form>
				</div>
			</div>
		</div>
	{:else if data.userReview === null && !data.user}
		<div class="mb-6 rounded-box bg-base-200 p-5 text-center">
			<p class="mb-2 text-base-content/60">Melden Sie sich an, um eine Bewertung zu schreiben.</p>
			<a href="/login" class="btn btn-sm btn-secondary">Anmelden</a>
		</div>
	{:else}
		<!-- Write or edit form -->
		<div class="mb-6 rounded-box bg-base-200 p-5">
			<h3 class="mb-4 font-semibold">
				{editingReview ? 'Bewertung bearbeiten' : 'Bewertung schreiben'}
			</h3>

			{#if reviewSuccess}
				<div class="mb-4 alert alert-success">
					<Check class="h-4 w-4" />
					Vielen Dank für Ihre Bewertung!
				</div>
			{/if}
			{#if reviewError}
				<div class="mb-4 alert alert-error">{reviewError}</div>
			{/if}

			<form
				method="POST"
				action="?/submitReview"
				use:enhance={() =>
					({ update }) =>
						update({ reset: false })}
			>
				<input type="hidden" name="rating" value={selectedRating} />

				<div class="mb-4">
					<p class="label-text mb-1">Sterne *</p>
					<div class="flex gap-1" role="group" aria-label="Sternebewertung auswählen">
						{#each [1, 2, 3, 4, 5] as star}
							<button
								type="button"
								class="p-0.5 transition-transform hover:scale-110"
								onmouseenter={() => (hoverRating = star)}
								onmouseleave={() => (hoverRating = 0)}
								onclick={() => (selectedRating = star)}
								aria-label="{star} Stern{star > 1 ? 'e' : ''}"
							>
								<Star
									class="h-8 w-8 transition-colors {(hoverRating || selectedRating) >= star
										? 'text-warning'
										: 'text-base-content/20'}"
									fill={(hoverRating || selectedRating) >= star ? 'currentColor' : 'none'}
								/>
							</button>
						{/each}
					</div>
				</div>

				<div class="mb-3">
					<label class="label" for="review-title"
						><span class="label-text">Titel (optional)</span></label
					>
					<input
						id="review-title"
						name="title"
						type="text"
						class="input-bordered input w-full"
						maxlength="120"
						value={editingReview ? (data.userReview?.title ?? '') : ''}
						placeholder="Kurze Zusammenfassung..."
					/>
				</div>

				<div class="mb-4">
					<label class="label" for="review-body"
						><span class="label-text">Erfahrungsbericht (optional)</span></label
					>
					<textarea
						id="review-body"
						name="body"
						class="textarea-bordered textarea w-full"
						rows="4"
						placeholder="Teilen Sie Ihre Erfahrungen mit diesem Produkt..."
						>{editingReview ? (data.userReview?.body ?? '') : ''}</textarea
					>
				</div>

				<div class="flex gap-2">
					<button type="submit" class="btn btn-secondary" disabled={selectedRating === 0}>
						{editingReview ? 'Änderungen speichern' : 'Bewertung einreichen'}
					</button>
					{#if editingReview}
						<button type="button" class="btn btn-ghost" onclick={() => (editingReview = false)}>
							Abbrechen
						</button>
					{/if}
				</div>
			</form>
		</div>
	{/if}

	<!-- Review list (excluding user's own) -->
	{#if data.reviews.length > 0}
		<div class="flex flex-col gap-4">
			{#each data.reviews.filter((r: any) => !data.userReview || r.id !== data.userReview.id) as review}
				<div class="rounded-box bg-base-200 p-5">
					<div class="mb-2 flex items-start justify-between gap-2">
						<div>
							<div class="mb-1 flex gap-0.5">
								{#each [1, 2, 3, 4, 5] as star}
									<Star
										class="h-4 w-4 {star <= review.rating
											? 'text-warning'
											: 'text-base-content/20'}"
										fill={star <= review.rating ? 'currentColor' : 'none'}
									/>
								{/each}
							</div>
							{#if review.title}
								<p class="font-semibold">{review.title}</p>
							{/if}
						</div>
						<div class="shrink-0 text-right">
							<p class="text-sm font-medium">{review.reviewerName}</p>
							<p class="text-xs text-base-content/40">{formatDate(review.createdAt)}</p>
						</div>
					</div>
					{#if review.body}
						<p class="text-sm leading-relaxed text-base-content/70">{review.body}</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
