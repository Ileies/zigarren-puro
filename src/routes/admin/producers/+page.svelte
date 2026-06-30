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

<div class="p-8 max-w-4xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold text-zinc-900">Hersteller</h1>
			<p class="text-sm text-zinc-500 mt-0.5">{data.producers.length} Einträge</p>
		</div>
		<button
			onclick={() => { showCreateForm = !showCreateForm; editingId = null; }}
			class="btn btn-sm btn-primary"
		>
			+ Neuer Hersteller
		</button>
	</div>

	{#if form?.error}
		<div class="alert alert-error mb-4 text-sm">{form.error}</div>
	{/if}
	{#if form?.success}
		<div class="alert alert-success mb-4 text-sm">{form.success}</div>
	{/if}

	{#if showCreateForm}
		<div class="card bg-base-100 shadow border border-zinc-200 mb-6">
			<div class="card-body p-5">
				<h2 class="font-semibold text-zinc-800 mb-3">Neuer Hersteller</h2>
				<form method="POST" action="?/create" use:enhance class="grid grid-cols-2 gap-3">
					<div class="form-control">
						<label for="create-name" class="label py-0.5"><span class="label-text text-xs">Name <span class="text-red-500">*</span></span></label>
						<input id="create-name" name="name" class="input input-sm input-bordered" required />
					</div>
					<div class="form-control">
						<label for="create-country" class="label py-0.5"><span class="label-text text-xs">Land <span class="text-red-500">*</span></span></label>
						<input id="create-country" name="country" class="input input-sm input-bordered" required />
					</div>
					<div class="form-control col-span-2">
						<label for="create-description" class="label py-0.5"><span class="label-text text-xs">Beschreibung</span></label>
						<textarea id="create-description" name="description" class="textarea textarea-sm textarea-bordered" rows="2"></textarea>
					</div>
					<div class="form-control col-span-2">
						<label for="create-contact" class="label py-0.5"><span class="label-text text-xs">Kontakt</span></label>
						<input id="create-contact" name="contactInfo" class="input input-sm input-bordered" />
					</div>
					<div class="col-span-2 flex gap-2 justify-end">
						<button type="button" onclick={() => (showCreateForm = false)} class="btn btn-sm btn-ghost">Abbrechen</button>
						<button type="submit" class="btn btn-sm btn-primary">Erstellen</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<div class="space-y-2">
		{#each data.producers as producer (producer.id)}
			<div class="card bg-base-100 shadow-sm border border-zinc-200">
				{#if editingId === producer.id}
					<div class="card-body p-5">
						<!-- Logo-Upload -->
						<div class="flex items-center gap-4 mb-4 pb-4 border-b border-zinc-100">
							<div class="w-16 h-16 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
								{#if producer.imageUrl}
									<img src={producer.imageUrl} alt={producer.name} class="w-full h-full object-contain p-1" />
								{:else}
									<span class="text-xs text-zinc-400">Logo</span>
								{/if}
							</div>
							<div class="flex flex-col gap-2 flex-1">
								{#if form?.uploadError && form.uploadId === producer.id}
									<p class="text-xs text-red-600">{form.uploadError}</p>
								{/if}
								{#if form?.uploadSuccess && form.uploadId === producer.id}
									<p class="text-xs text-green-600">Logo hochgeladen.</p>
								{/if}
								{#if form?.removeSuccess && form.uploadId === producer.id}
									<p class="text-xs text-zinc-500">Logo entfernt.</p>
								{/if}
								<form method="POST" action="?/uploadImage" enctype="multipart/form-data" use:enhance class="flex items-center gap-2">
									<input type="hidden" name="id" value={producer.id} />
									<input
										type="file"
										name="image"
										accept="image/jpeg,image/png,image/webp"
										required
										class="text-xs text-zinc-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
									/>
									<button type="submit" class="btn btn-xs btn-ghost shrink-0">Hochladen</button>
								</form>
								{#if producer.imageUrl}
									<form method="POST" action="?/removeImage" use:enhance>
										<input type="hidden" name="id" value={producer.id} />
										<button type="submit" class="text-xs text-red-500 hover:text-red-700 underline underline-offset-2">Logo entfernen</button>
									</form>
								{/if}
							</div>
						</div>

						<!-- Stammdaten -->
						<form method="POST" action="?/update" use:enhance class="grid grid-cols-2 gap-3">
							<input type="hidden" name="id" value={producer.id} />
							<div class="form-control">
								<label for="edit-name-{producer.id}" class="label py-0.5"><span class="label-text text-xs">Name <span class="text-red-500">*</span></span></label>
								<input id="edit-name-{producer.id}" name="name" value={producer.name} class="input input-sm input-bordered" required />
							</div>
							<div class="form-control">
								<label for="edit-country-{producer.id}" class="label py-0.5"><span class="label-text text-xs">Land <span class="text-red-500">*</span></span></label>
								<input id="edit-country-{producer.id}" name="country" value={producer.country} class="input input-sm input-bordered" required />
							</div>
							<div class="form-control col-span-2">
								<label for="edit-description-{producer.id}" class="label py-0.5"><span class="label-text text-xs">Beschreibung</span></label>
								<textarea id="edit-description-{producer.id}" name="description" class="textarea textarea-sm textarea-bordered" rows="2">{producer.description ?? ''}</textarea>
							</div>
							<div class="form-control col-span-2">
								<label for="edit-contact-{producer.id}" class="label py-0.5"><span class="label-text text-xs">Kontakt</span></label>
								<input id="edit-contact-{producer.id}" name="contactInfo" value={producer.contactInfo ?? ''} class="input input-sm input-bordered" />
							</div>
							<div class="col-span-2 flex gap-2 justify-end">
								<button type="button" onclick={() => (editingId = null)} class="btn btn-sm btn-ghost">Abbrechen</button>
								<button type="submit" class="btn btn-sm btn-primary">Speichern</button>
							</div>
						</form>
					</div>
				{:else}
					<div class="card-body p-4 flex-row items-center justify-between gap-4">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
								{#if producer.imageUrl}
									<img src={producer.imageUrl} alt={producer.name} class="w-full h-full object-contain p-0.5" />
								{:else}
									<span class="text-xs text-zinc-300">-</span>
								{/if}
							</div>
							<div>
								<div class="font-medium text-zinc-900">{producer.name}</div>
								<div class="text-xs text-zinc-500">{producer.country}{producer.description ? ` - ${producer.description}` : ''}</div>
							</div>
						</div>
						<div class="flex gap-2 shrink-0">
							<button onclick={() => { editingId = producer.id; showCreateForm = false; }} class="btn btn-xs btn-ghost">Bearbeiten</button>
							<form method="POST" action="?/delete" use:enhance onsubmit={(e) => { if (!confirm(`"${producer.name}" wirklich löschen?`)) e.preventDefault(); }}>
								<input type="hidden" name="id" value={producer.id} />
								<button type="submit" class="btn btn-xs btn-error btn-outline">Löschen</button>
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
