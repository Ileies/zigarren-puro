<script>
	import '../app.css';
	import { page } from '$app/state';
</script>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
	<main class="grid min-h-full place-items-center px-6 py-24 sm:py-32">
		<h1 class="text-error text-4xl font-bold text-center">
			{page.status}
		</h1>
		<div>
			<p class="text-center text-base-content/80 text-lg mt-4">
				{#if page.status === 404}
					The page you are looking for does not exist.
				{:else}
					An error occurred.<br>
					<span class="text-sm text-gray-600 mt-4">
            {page.error?.message}
          </span>
				{/if}
			</p>
			<p class="text-center mt-10">
				<a class="btn" href="/">Go back home</a>
			</p>
		</div>
	</main>
</div>