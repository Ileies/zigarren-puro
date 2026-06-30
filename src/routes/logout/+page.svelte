<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<svelte:head>
	<title>Abmelden – Zigarren Puro</title>
</svelte:head>

<div class="flex flex-1 items-center justify-center bg-base-200 px-4 py-16">
	<div
		class="w-full max-w-sm rounded-2xl bg-base-100 p-8 text-center shadow-sm ring-1 ring-base-300"
	>
		<h1 class="mb-2 text-xl font-semibold">Abmelden</h1>
		<p class="mb-6 text-sm text-base-content/60">Möchten Sie sich wirklich abmelden?</p>
		<form method="POST" use:enhance class="flex justify-center gap-3">
			<a href="/" class="btn btn-ghost">Abbrechen</a>
			<button type="submit" class="btn btn-primary">Abmelden</button>
		</form>
	</div>
</div>
