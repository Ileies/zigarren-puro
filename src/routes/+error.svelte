<script>
	import '../app.css';
	import { page } from '$app/state';
</script>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
	<main class="grid min-h-full place-items-center px-6 py-24 sm:py-32">
		<h1 class="text-center text-4xl font-bold text-error">
			{page.status}
		</h1>
		<div>
			<p class="mt-4 text-center text-lg text-base-content/80">
				{#if page.status === 404}
					The page you are looking for does not exist.
				{:else}
					An error occurred.<br />
					<span class="mt-4 text-sm text-gray-600">
						{page.error?.message}
					</span>
				{/if}
			</p>
			<p class="mt-10 text-center">
				<a class="btn" href="/">Go back home</a>
			</p>
		</div>
	</main>
</div>
