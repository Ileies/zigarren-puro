<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<svelte:head>
	<title>Abmelden – Zigarren Puro</title>
</svelte:head>

<div class="flex flex-1 items-center justify-center bg-base-200 px-4 py-16">
	<div class="rounded-2xl bg-base-100 p-8 shadow-sm ring-1 ring-base-300 text-center max-w-sm w-full">
		<h1 class="text-xl font-semibold mb-2">Abmelden</h1>
		<p class="text-base-content/60 text-sm mb-6">Möchten Sie sich wirklich abmelden?</p>
		<form method="POST" use:enhance class="flex gap-3 justify-center">
			<a href="/" class="btn btn-ghost">Abbrechen</a>
			<button type="submit" class="btn btn-primary">Abmelden</button>
		</form>
	</div>
</div>
