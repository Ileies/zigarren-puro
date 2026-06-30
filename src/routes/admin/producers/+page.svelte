<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let editingId = $state<string | null>(null);
	let showCreateForm = $state(false);

	function startEdit(id: string) {
		editingId = id;
		showCreateForm = false;
	}

	function cancelEdit() {
		editingId = null;
	}

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
						<label for="create-name" class="label py-0.5"><span class="label-text text-xs">Name *</span></label>
						<input id="create-name" name="name" class="input input-sm input-bordered" required />
					</div>
					<div class="form-control">
						<label for="create-country" class="label py-0.5"><span class="label-text text-xs">Land *</span></label>
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
						<form method="POST" action="?/update" use:enhance class="grid grid-cols-2 gap-3">
							<input type="hidden" name="id" value={producer.id} />
							<div class="form-control">
								<label for="edit-name-{producer.id}" class="label py-0.5"><span class="label-text text-xs">Name *</span></label>
								<input id="edit-name-{producer.id}" name="name" value={producer.name} class="input input-sm input-bordered" required />
							</div>
							<div class="form-control">
								<label for="edit-country-{producer.id}" class="label py-0.5"><span class="label-text text-xs">Land *</span></label>
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
								<button type="button" onclick={cancelEdit} class="btn btn-sm btn-ghost">Abbrechen</button>
								<button type="submit" class="btn btn-sm btn-primary">Speichern</button>
							</div>
						</form>
					</div>
				{:else}
					<div class="card-body p-4 flex-row items-center justify-between">
						<div>
							<div class="font-medium text-zinc-900">{producer.name}</div>
							<div class="text-xs text-zinc-500">{producer.country}{producer.description ? ` - ${producer.description}` : ''}</div>
						</div>
						<div class="flex gap-2 shrink-0">
							<button onclick={() => startEdit(producer.id)} class="btn btn-xs btn-ghost">Bearbeiten</button>
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
