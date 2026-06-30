<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let editingId = $state<string | null>(null);
	let showCreateForm = $state(false);

	$effect(() => {
		if (form?.success) {
			editingId = null;
			showCreateForm = false;
		}
	});
</script>

<div class="max-w-4xl p-8">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-zinc-900">Hersteller</h1>
			<p class="mt-0.5 text-sm text-zinc-500">{data.producers.length} Einträge</p>
		</div>
		<button
			onclick={() => {
				showCreateForm = !showCreateForm;
				editingId = null;
			}}
			class="btn btn-sm btn-primary"
		>
			+ Neuer Hersteller
		</button>
	</div>

	{#if form?.error}
		<div class="mb-4 alert text-sm alert-error">{form.error}</div>
	{/if}
	{#if form?.success}
		<div class="mb-4 alert text-sm alert-success">{form.success}</div>
	{/if}

	{#if showCreateForm}
		<div class="card mb-6 border border-zinc-200 bg-base-100 shadow">
			<div class="card-body p-5">
				<h2 class="mb-3 font-semibold text-zinc-800">Neuer Hersteller</h2>
				<form method="POST" action="?/create" use:enhance class="grid grid-cols-2 gap-3">
					<div class="form-control">
						<label for="create-name" class="label py-0.5"
							><span class="label-text text-xs">Name <span class="text-red-500">*</span></span
							></label
						>
						<input id="create-name" name="name" class="input-bordered input input-sm" required />
					</div>
					<div class="form-control">
						<label for="create-country" class="label py-0.5"
							><span class="label-text text-xs">Land <span class="text-red-500">*</span></span
							></label
						>
						<input
							id="create-country"
							name="country"
							class="input-bordered input input-sm"
							required
						/>
					</div>
					<div class="form-control col-span-2">
						<label for="create-description" class="label py-0.5"
							><span class="label-text text-xs">Beschreibung</span></label
						>
						<textarea
							id="create-description"
							name="description"
							class="textarea-bordered textarea textarea-sm"
							rows="2"
						></textarea>
					</div>
					<div class="form-control col-span-2">
						<label for="create-contact" class="label py-0.5"
							><span class="label-text text-xs">Kontakt</span></label
						>
						<input id="create-contact" name="contactInfo" class="input-bordered input input-sm" />
					</div>
					<div class="col-span-2 flex justify-end gap-2">
						<button
							type="button"
							onclick={() => (showCreateForm = false)}
							class="btn btn-ghost btn-sm">Abbrechen</button
						>
						<button type="submit" class="btn btn-sm btn-primary">Erstellen</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<div class="space-y-2">
		{#each data.producers as producer (producer.id)}
			<div class="card border border-zinc-200 bg-base-100 shadow-sm">
				{#if editingId === producer.id}
					<div class="card-body p-5">
						<!-- Logo-Upload -->
						<div class="mb-4 flex items-center gap-4 border-b border-zinc-100 pb-4">
							<div
								class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
							>
								{#if producer.imageUrl}
									<img
										src={producer.imageUrl}
										alt={producer.name}
										class="h-full w-full object-contain p-1"
									/>
								{:else}
									<span class="text-xs text-zinc-400">Logo</span>
								{/if}
							</div>
							<div class="flex flex-1 flex-col gap-2">
								{#if form?.uploadError && form.uploadId === producer.id}
									<p class="text-xs text-red-600">{form.uploadError}</p>
								{/if}
								{#if form?.uploadSuccess && form.uploadId === producer.id}
									<p class="text-xs text-green-600">Logo hochgeladen.</p>
								{/if}
								{#if form?.removeSuccess && form.uploadId === producer.id}
									<p class="text-xs text-zinc-500">Logo entfernt.</p>
								{/if}
								<form
									method="POST"
									action="?/uploadImage"
									enctype="multipart/form-data"
									use:enhance
									class="flex items-center gap-2"
								>
									<input type="hidden" name="id" value={producer.id} />
									<input
										type="file"
										name="image"
										accept="image/jpeg,image/png,image/webp"
										required
										class="cursor-pointer text-xs text-zinc-600 file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-1 file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
									/>
									<button type="submit" class="btn shrink-0 btn-ghost btn-xs">Hochladen</button>
								</form>
								{#if producer.imageUrl}
									<form method="POST" action="?/removeImage" use:enhance>
										<input type="hidden" name="id" value={producer.id} />
										<button
											type="submit"
											class="text-xs text-red-500 underline underline-offset-2 hover:text-red-700"
											>Logo entfernen</button
										>
									</form>
								{/if}
							</div>
						</div>

						<!-- Stammdaten -->
						<form method="POST" action="?/update" use:enhance class="grid grid-cols-2 gap-3">
							<input type="hidden" name="id" value={producer.id} />
							<div class="form-control">
								<label for="edit-name-{producer.id}" class="label py-0.5"
									><span class="label-text text-xs">Name <span class="text-red-500">*</span></span
									></label
								>
								<input
									id="edit-name-{producer.id}"
									name="name"
									value={producer.name}
									class="input-bordered input input-sm"
									required
								/>
							</div>
							<div class="form-control">
								<label for="edit-country-{producer.id}" class="label py-0.5"
									><span class="label-text text-xs">Land <span class="text-red-500">*</span></span
									></label
								>
								<input
									id="edit-country-{producer.id}"
									name="country"
									value={producer.country}
									class="input-bordered input input-sm"
									required
								/>
							</div>
							<div class="form-control col-span-2">
								<label for="edit-description-{producer.id}" class="label py-0.5"
									><span class="label-text text-xs">Beschreibung</span></label
								>
								<textarea
									id="edit-description-{producer.id}"
									name="description"
									class="textarea-bordered textarea textarea-sm"
									rows="2">{producer.description ?? ''}</textarea
								>
							</div>
							<div class="form-control col-span-2">
								<label for="edit-contact-{producer.id}" class="label py-0.5"
									><span class="label-text text-xs">Kontakt</span></label
								>
								<input
									id="edit-contact-{producer.id}"
									name="contactInfo"
									value={producer.contactInfo ?? ''}
									class="input-bordered input input-sm"
								/>
							</div>
							<div class="col-span-2 flex justify-end gap-2">
								<button
									type="button"
									onclick={() => (editingId = null)}
									class="btn btn-ghost btn-sm">Abbrechen</button
								>
								<button type="submit" class="btn btn-sm btn-primary">Speichern</button>
							</div>
						</form>
					</div>
				{:else}
					<div class="card-body flex-row items-center justify-between gap-4 p-4">
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-zinc-200 bg-zinc-100"
							>
								{#if producer.imageUrl}
									<img
										src={producer.imageUrl}
										alt={producer.name}
										class="h-full w-full object-contain p-0.5"
									/>
								{:else}
									<span class="text-xs text-zinc-300">-</span>
								{/if}
							</div>
							<div>
								<div class="font-medium text-zinc-900">{producer.name}</div>
								<div class="text-xs text-zinc-500">
									{producer.country}{producer.description ? ` - ${producer.description}` : ''}
								</div>
							</div>
						</div>
						<div class="flex shrink-0 gap-2">
							<button
								onclick={() => {
									editingId = producer.id;
									showCreateForm = false;
								}}
								class="btn btn-ghost btn-xs">Bearbeiten</button
							>
							<form
								method="POST"
								action="?/delete"
								use:enhance
								onsubmit={(e) => {
									if (!confirm(`"${producer.name}" wirklich löschen?`)) e.preventDefault();
								}}
							>
								<input type="hidden" name="id" value={producer.id} />
								<button type="submit" class="btn btn-outline btn-xs btn-error">Löschen</button>
							</form>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<div class="text-zinc-400 text-sm py-8 text-center">Noch keine Hersteller eingetragen.</div>
		{/each}
	</div>
</div>
