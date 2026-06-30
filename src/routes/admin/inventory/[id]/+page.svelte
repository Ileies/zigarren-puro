<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form }: { data: any; form: Record<string, unknown> | null } = $props();
	let product = $derived(data.product);

	const typeLabels: Record<string, string> = {
		cigar: 'Zigarre',
		cigarillo: 'Zigarillo',
		beverage: 'Getränk',
		tool: 'Zubehör'
	};

	let confirmDelete = $state(false);

	const inputClass =
		'w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500';
	const labelClass = 'block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1';
</script>

<div class="max-w-2xl p-6">
	<div class="mb-6 flex items-center gap-3">
		<a href="/admin/inventory" class="text-sm text-zinc-400 hover:text-zinc-700">&larr; Inventar</a>
		<span class="text-zinc-300">/</span>
		<span class="text-sm text-zinc-600">{product.name}</span>
	</div>

	<div class="mb-6 flex items-start justify-between">
		<div>
			<h1 class="text-xl font-bold text-zinc-900">{product.name}</h1>
			<div class="mt-0.5 text-sm text-zinc-400">
				{typeLabels[product.productType] ?? product.productType}
			</div>
		</div>
	</div>

	{#if form?.success}
		<div
			class="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
		>
			Produkt wurde gespeichert.
		</div>
	{/if}
	{#if form?.imageSuccess}
		<div
			class="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
		>
			Bild wurde hochgeladen.
		</div>
	{/if}
	{#if form?.imageRemoved}
		<div class="mb-4 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
			Bild wurde entfernt.
		</div>
	{/if}
	{#if form?.error}
		<div class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
			{form.error}
		</div>
	{/if}

	<!-- Image upload -->
	<div class="mb-6 rounded-lg border border-zinc-200 bg-white p-5">
		<h2 class="mb-4 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Produktbild</h2>
		<div class="flex items-start gap-5">
			<div
				class="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-100"
			>
				{#if product.imageUrl}
					<img src={product.imageUrl} alt={product.name} class="h-full w-full object-cover" />
				{:else}
					<span class="text-xs text-zinc-400">Kein Bild</span>
				{/if}
			</div>
			<div class="flex flex-1 flex-col gap-3">
				<form method="POST" action="?/uploadImage" enctype="multipart/form-data" use:enhance>
					<label class={labelClass} for="image">JPG, PNG oder WebP · max. 5 MB</label>
					<div class="mt-1 flex gap-2">
						<input
							id="image"
							name="image"
							type="file"
							accept="image/jpeg,image/png,image/webp"
							required
							class="flex-1 cursor-pointer text-sm text-zinc-600 file:mr-3 file:rounded file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
						/>
						<button
							type="submit"
							class="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white transition-colors hover:bg-zinc-700"
						>
							Hochladen
						</button>
					</div>
				</form>
				{#if product.imageUrl}
					<form method="POST" action="?/removeImage" use:enhance>
						<button
							type="submit"
							class="text-xs text-red-500 underline underline-offset-2 hover:text-red-700"
						>
							Bild entfernen
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>

	<form method="POST" action="?/update" use:enhance class="mb-6 space-y-6">
		<!-- Base fields -->
		<div class="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
			<h2 class="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Basisfelder</h2>

			<div>
				<label class={labelClass} for="name">Name <span class="text-red-500">*</span></label>
				<input id="name" name="name" type="text" value={product.name} required class={inputClass} />
			</div>

			<div>
				<label class={labelClass} for="description">Beschreibung</label>
				<textarea id="description" name="description" rows="4" class="{inputClass} resize-y"
					>{product.description ?? ''}</textarea
				>
			</div>

			<div>
				<label class={labelClass} for="producerId"
					>Hersteller <span class="text-red-500">*</span></label
				>
				<select id="producerId" name="producerId" required class={inputClass}>
					{#each data.producers as producer}
						<option value={producer.id} selected={producer.id === product.producerId}>
							{producer.name}
						</option>
					{/each}
				</select>
			</div>

			<div class="grid grid-cols-3 gap-4">
				<div>
					<label class={labelClass} for="price">Preis (€) <span class="text-red-500">*</span></label
					>
					<input
						id="price"
						name="price"
						type="number"
						step="0.01"
						min="0"
						value={product.price}
						required
						class={inputClass}
					/>
				</div>
				<div>
					<label class={labelClass} for="stock"
						>Lagerbestand <span class="text-red-500">*</span></label
					>
					<input
						id="stock"
						name="stock"
						type="number"
						min="0"
						value={product.stock}
						required
						class={inputClass}
					/>
				</div>
				<div>
					<label class={labelClass} for="sku">SKU <span class="text-red-500">*</span></label>
					<input id="sku" name="sku" type="text" value={product.sku} required class={inputClass} />
				</div>
			</div>

			<div>
				<label class={labelClass} for="tags"
					>Tags <span class="font-normal text-zinc-400 normal-case">(kommagetrennt)</span></label
				>
				<input
					id="tags"
					name="tags"
					type="text"
					value={JSON.parse(product.tags ?? '[]').join(', ')}
					placeholder="z.B. Bestseller, Kubanisch, Premium"
					class={inputClass}
				/>
			</div>
		</div>

		<!-- Cigar details -->
		{#if product.productType === 'cigar'}
			<div class="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
				<h2 class="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
					Zigarren-Details
				</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="lengthMm"
							>Länge (mm) <span class="text-red-500">*</span></label
						>
						<input
							id="lengthMm"
							name="lengthMm"
							type="number"
							step="0.1"
							min="0"
							value={product.cigarDetails?.lengthMm ?? ''}
							required
							class={inputClass}
						/>
					</div>
					<div>
						<label class={labelClass} for="ringGauge"
							>Ringmaß <span class="text-red-500">*</span></label
						>
						<input
							id="ringGauge"
							name="ringGauge"
							type="number"
							step="0.1"
							min="0"
							value={product.cigarDetails?.ringGauge ?? ''}
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="strength"
							>Stärke <span class="text-red-500">*</span></label
						>
						<select id="strength" name="strength" required class={inputClass}>
							<option value="mild" selected={product.cigarDetails?.strength === 'mild'}>Mild</option
							>
							<option value="medium" selected={product.cigarDetails?.strength === 'medium'}
								>Medium</option
							>
							<option value="full" selected={product.cigarDetails?.strength === 'full'}>Full</option
							>
						</select>
					</div>
					<div>
						<label class={labelClass} for="wrapperType"
							>Deckblatt <span class="text-red-500">*</span></label
						>
						<input
							id="wrapperType"
							name="wrapperType"
							type="text"
							value={product.cigarDetails?.wrapperType ?? ''}
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="countryOfOrigin"
							>Herkunft <span class="text-red-500">*</span></label
						>
						<input
							id="countryOfOrigin"
							name="countryOfOrigin"
							type="text"
							value={product.cigarDetails?.countryOfOrigin ?? ''}
							required
							class={inputClass}
						/>
					</div>
					<div>
						<label class={labelClass} for="agingTimeMonths">Reifung (Monate)</label>
						<input
							id="agingTimeMonths"
							name="agingTimeMonths"
							type="number"
							min="0"
							value={product.cigarDetails?.agingTimeMonths ?? ''}
							class={inputClass}
						/>
					</div>
				</div>
			</div>
		{/if}

		<!-- Cigarillo details -->
		{#if product.productType === 'cigarillo'}
			<div class="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
				<h2 class="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
					Zigarillo-Details
				</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="lengthMm"
							>Länge (mm) <span class="text-red-500">*</span></label
						>
						<input
							id="lengthMm"
							name="lengthMm"
							type="number"
							step="0.1"
							min="0"
							value={product.cigarilloDetails?.lengthMm ?? ''}
							required
							class={inputClass}
						/>
					</div>
					<div>
						<label class={labelClass} for="ringGauge"
							>Ringmaß <span class="text-red-500">*</span></label
						>
						<input
							id="ringGauge"
							name="ringGauge"
							type="number"
							step="0.1"
							min="0"
							value={product.cigarilloDetails?.ringGauge ?? ''}
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="filterType"
							>Filter <span class="text-red-500">*</span></label
						>
						<select id="filterType" name="filterType" required class={inputClass}>
							<option value="none" selected={product.cigarilloDetails?.filterType === 'none'}
								>Ohne Filter</option
							>
							<option value="regular" selected={product.cigarilloDetails?.filterType === 'regular'}
								>Regular</option
							>
							<option
								value="charcoal"
								selected={product.cigarilloDetails?.filterType === 'charcoal'}>Aktivkohle</option
							>
						</select>
					</div>
					<div>
						<label class={labelClass} for="wrapperType"
							>Deckblatt <span class="text-red-500">*</span></label
						>
						<input
							id="wrapperType"
							name="wrapperType"
							type="text"
							value={product.cigarilloDetails?.wrapperType ?? ''}
							required
							class={inputClass}
						/>
					</div>
				</div>
			</div>
		{/if}

		<!-- Beverage details -->
		{#if product.productType === 'beverage'}
			<div class="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
				<h2 class="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
					Getränke-Details
				</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="beverageType"
							>Typ <span class="text-red-500">*</span></label
						>
						<select id="beverageType" name="beverageType" required class={inputClass}>
							<option value="wine" selected={product.beverageDetails?.type === 'wine'}>Wein</option>
							<option value="whiskey" selected={product.beverageDetails?.type === 'whiskey'}
								>Whiskey</option
							>
							<option value="rum" selected={product.beverageDetails?.type === 'rum'}>Rum</option>
							<option value="cognac" selected={product.beverageDetails?.type === 'cognac'}
								>Cognac</option
							>
							<option value="vodka" selected={product.beverageDetails?.type === 'vodka'}
								>Vodka</option
							>
						</select>
					</div>
					<div>
						<label class={labelClass} for="countryOfOrigin"
							>Herkunft <span class="text-red-500">*</span></label
						>
						<input
							id="countryOfOrigin"
							name="countryOfOrigin"
							type="text"
							value={product.beverageDetails?.countryOfOrigin ?? ''}
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="volumeMl"
							>Volumen (ml) <span class="text-red-500">*</span></label
						>
						<input
							id="volumeMl"
							name="volumeMl"
							type="number"
							step="1"
							min="0"
							value={product.beverageDetails?.volumeMl ?? ''}
							required
							class={inputClass}
						/>
					</div>
					<div>
						<label class={labelClass} for="alcoholPercentage"
							>Alkohol (%) <span class="text-red-500">*</span></label
						>
						<input
							id="alcoholPercentage"
							name="alcoholPercentage"
							type="number"
							step="0.1"
							min="0"
							max="100"
							value={product.beverageDetails?.alcoholPercentage ?? ''}
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="agingYears">Reifung (Jahre)</label>
						<input
							id="agingYears"
							name="agingYears"
							type="number"
							min="0"
							value={product.beverageDetails?.agingYears ?? ''}
							class={inputClass}
						/>
					</div>
				</div>

				<div>
					<label class={labelClass} for="tastingNotes">Geschmacksnotizen</label>
					<textarea id="tastingNotes" name="tastingNotes" rows="3" class="{inputClass} resize-y"
						>{product.beverageDetails?.tastingNotes ?? ''}</textarea
					>
				</div>
			</div>
		{/if}

		<!-- Tool details -->
		{#if product.productType === 'tool'}
			<div class="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
				<h2 class="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Zubehör-Details</h2>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class={labelClass} for="brand">Marke <span class="text-red-500">*</span></label>
						<input
							id="brand"
							name="brand"
							type="text"
							value={product.toolDetails?.brand ?? ''}
							required
							class={inputClass}
						/>
					</div>
					<div>
						<label class={labelClass} for="material"
							>Material <span class="text-red-500">*</span></label
						>
						<input
							id="material"
							name="material"
							type="text"
							value={product.toolDetails?.material ?? ''}
							required
							class={inputClass}
						/>
					</div>
				</div>

				<div>
					<label class={labelClass} for="specifications">Spezifikationen</label>
					<textarea id="specifications" name="specifications" rows="2" class="{inputClass} resize-y"
						>{product.toolDetails?.specifications ?? ''}</textarea
					>
				</div>

				<div>
					<label class={labelClass} for="careInstructions">Pflegehinweise</label>
					<textarea
						id="careInstructions"
						name="careInstructions"
						rows="2"
						class="{inputClass} resize-y">{product.toolDetails?.careInstructions ?? ''}</textarea
					>
				</div>
			</div>
		{/if}

		<div>
			<button
				type="submit"
				class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
			>
				Speichern
			</button>
		</div>
	</form>

	<!-- Delete -->
	<div class="rounded-lg border border-red-200 bg-white p-5">
		<h2 class="mb-2 text-xs font-semibold tracking-wide text-red-500 uppercase">Gefahrenzone</h2>
		{#if confirmDelete}
			<p class="mb-3 text-sm text-zinc-600">
				Sicher? Das Produkt wird dauerhaft gelöscht und kann nicht wiederhergestellt werden.
			</p>
			<div class="flex gap-2">
				<form method="POST" action="?/delete" use:enhance>
					<button
						type="submit"
						class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
					>
						Ja, löschen
					</button>
				</form>
				<button
					type="button"
					onclick={() => (confirmDelete = false)}
					class="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
				>
					Abbrechen
				</button>
			</div>
		{:else}
			<button
				type="button"
				onclick={() => (confirmDelete = true)}
				class="text-sm text-red-600 underline underline-offset-2 hover:text-red-800"
			>
				Produkt löschen
			</button>
		{/if}
	</div>
</div>
