<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let heroImagePreview = $state<string | null>(null);
	let heroImageFile: FileList | undefined = $state();

	$effect(() => {
		if (heroImageFile && heroImageFile[0]) {
			const reader = new FileReader();
			reader.onload = (e) => {
				heroImagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(heroImageFile[0]);
		}
	});
</script>

<div class="max-w-3xl p-6">
	<h1 class="mb-1 text-xl font-bold text-zinc-900">Website-Inhalte</h1>
	<p class="mb-8 text-sm text-zinc-500">Texte und Bilder der Startseite bearbeiten</p>

	{#if form?.error}
		<div class="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			{form.error}
		</div>
	{/if}

	<!-- Hero-Bereich -->
	<section class="mb-8">
		<h2 class="mb-4 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
			Startseite - Hero-Bereich
		</h2>

		<!-- Hero Hintergrundbild -->
		<div class="mb-4 rounded-lg border border-zinc-200 bg-white p-5">
			<h3 class="mb-3 text-sm font-semibold text-zinc-800">Hintergrundbild</h3>

			{#if form?.imageSuccess}
				<div
					class="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
				>
					Bild erfolgreich hochgeladen.
				</div>
			{/if}

			<div class="mb-4">
				<div
					class="relative h-48 w-full overflow-hidden rounded border border-zinc-200 bg-zinc-100"
				>
					<img
						src={heroImagePreview ?? data.content.hero_bg_image}
						alt="Hero Vorschau"
						class="h-full w-full object-cover"
					/>
					<div
						class="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/40 to-black/60"
					>
						<span class="text-sm font-medium text-white opacity-80">Vorschau</span>
					</div>
				</div>
			</div>

			<form method="POST" action="?/uploadHeroImage" enctype="multipart/form-data" use:enhance>
				<div class="flex items-center gap-3">
					<input
						type="file"
						name="hero_image"
						accept="image/jpeg,image/png,image/webp"
						bind:files={heroImageFile}
						class="block cursor-pointer text-sm text-zinc-600 file:mr-3 file:rounded file:border file:border-zinc-200 file:bg-zinc-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-100"
					/>
					<button
						type="submit"
						class="shrink-0 rounded bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
					>
						Hochladen
					</button>
				</div>
				<p class="mt-1.5 text-xs text-zinc-400">JPG, PNG oder WebP, max. 5 MB</p>
			</form>
		</div>

		<!-- Hero Texte -->
		<div class="rounded-lg border border-zinc-200 bg-white p-5">
			<h3 class="mb-3 text-sm font-semibold text-zinc-800">Texte & CTA</h3>

			{#if form?.heroSuccess}
				<div
					class="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
				>
					Änderungen gespeichert.
				</div>
			{/if}

			<form method="POST" action="?/updateHero" use:enhance>
				<div class="space-y-4">
					<div>
						<label for="hero_subtitle" class="mb-1 block text-xs font-medium text-zinc-600">
							Untertitel <span class="text-zinc-400">(oberhalb des Titels)</span>
						</label>
						<input
							id="hero_subtitle"
							name="hero_subtitle"
							type="text"
							value={data.content.hero_subtitle}
							placeholder={data.defaults.hero_subtitle}
							class="w-full rounded border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
						/>
					</div>

					<div>
						<label for="hero_tagline" class="mb-1 block text-xs font-medium text-zinc-600">
							Tagline <span class="text-zinc-400">(unterhalb des Titels)</span>
						</label>
						<textarea
							id="hero_tagline"
							name="hero_tagline"
							rows="2"
							value={data.content.hero_tagline}
							placeholder={data.defaults.hero_tagline}
							class="w-full resize-none rounded border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
						></textarea>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="hero_cta_text" class="mb-1 block text-xs font-medium text-zinc-600">
								Button-Text
							</label>
							<input
								id="hero_cta_text"
								name="hero_cta_text"
								type="text"
								value={data.content.hero_cta_text}
								placeholder={data.defaults.hero_cta_text}
								class="w-full rounded border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
							/>
						</div>
						<div>
							<label for="hero_cta_link" class="mb-1 block text-xs font-medium text-zinc-600">
								Button-Link
							</label>
							<input
								id="hero_cta_link"
								name="hero_cta_link"
								type="text"
								value={data.content.hero_cta_link}
								placeholder={data.defaults.hero_cta_link}
								class="w-full rounded border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
							/>
						</div>
					</div>
				</div>

				<div class="mt-4 flex justify-end">
					<button
						type="submit"
						class="rounded bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
					>
						Speichern
					</button>
				</div>
			</form>
		</div>
	</section>

	<!-- Social Links -->
	<section>
		<h2 class="mb-4 text-sm font-semibold tracking-wide text-zinc-500 uppercase">Social Links</h2>

		<div class="rounded-lg border border-zinc-200 bg-white p-5">
			{#if form?.socialSuccess}
				<div
					class="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
				>
					Social Links gespeichert.
				</div>
			{/if}

			<form method="POST" action="?/updateSocial" use:enhance>
				<div class="space-y-4">
					<div>
						<label for="social_facebook" class="mb-1 block text-xs font-medium text-zinc-600">
							Facebook URL
						</label>
						<input
							id="social_facebook"
							name="social_facebook"
							type="url"
							value={data.content.social_facebook}
							placeholder={data.defaults.social_facebook}
							class="w-full rounded border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
						/>
					</div>

					<div>
						<label for="social_instagram" class="mb-1 block text-xs font-medium text-zinc-600">
							Instagram URL
						</label>
						<input
							id="social_instagram"
							name="social_instagram"
							type="url"
							value={data.content.social_instagram}
							placeholder={data.defaults.social_instagram}
							class="w-full rounded border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
						/>
					</div>
				</div>

				<div class="mt-4 flex justify-end">
					<button
						type="submit"
						class="rounded bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
					>
						Speichern
					</button>
				</div>
			</form>
		</div>
	</section>
</div>
