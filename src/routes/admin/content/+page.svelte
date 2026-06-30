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

<div class="p-6 max-w-3xl">
	<h1 class="text-xl font-bold text-zinc-900 mb-1">Website-Inhalte</h1>
	<p class="text-sm text-zinc-500 mb-8">Texte und Bilder der Startseite bearbeiten</p>

	{#if form?.error}
		<div class="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			{form.error}
		</div>
	{/if}

	<!-- Hero-Bereich -->
	<section class="mb-8">
		<h2 class="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4">
			Startseite - Hero-Bereich
		</h2>

		<!-- Hero Hintergrundbild -->
		<div class="bg-white rounded-lg border border-zinc-200 p-5 mb-4">
			<h3 class="text-sm font-semibold text-zinc-800 mb-3">Hintergrundbild</h3>

			{#if form?.imageSuccess}
				<div class="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
					Bild erfolgreich hochgeladen.
				</div>
			{/if}

			<div class="mb-4">
				<div class="relative w-full h-48 rounded overflow-hidden bg-zinc-100 border border-zinc-200">
					<img
						src={heroImagePreview ?? data.content.hero_bg_image}
						alt="Hero Vorschau"
						class="w-full h-full object-cover"
					/>
					<div class="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex items-center justify-center">
						<span class="text-white text-sm font-medium opacity-80">Vorschau</span>
					</div>
				</div>
			</div>

			<form
				method="POST"
				action="?/uploadHeroImage"
				enctype="multipart/form-data"
				use:enhance
			>
				<div class="flex items-center gap-3">
					<input
						type="file"
						name="hero_image"
						accept="image/jpeg,image/png,image/webp"
						bind:files={heroImageFile}
						class="block text-sm text-zinc-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-zinc-200 file:bg-zinc-50 file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-100 cursor-pointer"
					/>
					<button
						type="submit"
						class="shrink-0 px-4 py-1.5 text-sm font-medium bg-zinc-900 text-white rounded hover:bg-zinc-700 transition-colors"
					>
						Hochladen
					</button>
				</div>
				<p class="mt-1.5 text-xs text-zinc-400">JPG, PNG oder WebP, max. 5 MB</p>
			</form>
		</div>

		<!-- Hero Texte -->
		<div class="bg-white rounded-lg border border-zinc-200 p-5">
			<h3 class="text-sm font-semibold text-zinc-800 mb-3">Texte & CTA</h3>

			{#if form?.heroSuccess}
				<div class="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
					Änderungen gespeichert.
				</div>
			{/if}

			<form method="POST" action="?/updateHero" use:enhance>
				<div class="space-y-4">
					<div>
						<label for="hero_subtitle" class="block text-xs font-medium text-zinc-600 mb-1">
							Untertitel <span class="text-zinc-400">(oberhalb des Titels)</span>
						</label>
						<input
							id="hero_subtitle"
							name="hero_subtitle"
							type="text"
							value={data.content.hero_subtitle}
							placeholder={data.defaults.hero_subtitle}
							class="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-400"
						/>
					</div>

					<div>
						<label for="hero_tagline" class="block text-xs font-medium text-zinc-600 mb-1">
							Tagline <span class="text-zinc-400">(unterhalb des Titels)</span>
						</label>
						<textarea
							id="hero_tagline"
							name="hero_tagline"
							rows="2"
							value={data.content.hero_tagline}
							placeholder={data.defaults.hero_tagline}
							class="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
						></textarea>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="hero_cta_text" class="block text-xs font-medium text-zinc-600 mb-1">
								Button-Text
							</label>
							<input
								id="hero_cta_text"
								name="hero_cta_text"
								type="text"
								value={data.content.hero_cta_text}
								placeholder={data.defaults.hero_cta_text}
								class="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-400"
							/>
						</div>
						<div>
							<label for="hero_cta_link" class="block text-xs font-medium text-zinc-600 mb-1">
								Button-Link
							</label>
							<input
								id="hero_cta_link"
								name="hero_cta_link"
								type="text"
								value={data.content.hero_cta_link}
								placeholder={data.defaults.hero_cta_link}
								class="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-400"
							/>
						</div>
					</div>
				</div>

				<div class="mt-4 flex justify-end">
					<button
						type="submit"
						class="px-5 py-2 text-sm font-medium bg-zinc-900 text-white rounded hover:bg-zinc-700 transition-colors"
					>
						Speichern
					</button>
				</div>
			</form>
		</div>
	</section>

	<!-- Social Links -->
	<section>
		<h2 class="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4">Social Links</h2>

		<div class="bg-white rounded-lg border border-zinc-200 p-5">
			{#if form?.socialSuccess}
				<div class="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
					Social Links gespeichert.
				</div>
			{/if}

			<form method="POST" action="?/updateSocial" use:enhance>
				<div class="space-y-4">
					<div>
						<label for="social_facebook" class="block text-xs font-medium text-zinc-600 mb-1">
							Facebook URL
						</label>
						<input
							id="social_facebook"
							name="social_facebook"
							type="url"
							value={data.content.social_facebook}
							placeholder={data.defaults.social_facebook}
							class="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-400"
						/>
					</div>

					<div>
						<label for="social_instagram" class="block text-xs font-medium text-zinc-600 mb-1">
							Instagram URL
						</label>
						<input
							id="social_instagram"
							name="social_instagram"
							type="url"
							value={data.content.social_instagram}
							placeholder={data.defaults.social_instagram}
							class="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-400"
						/>
					</div>
				</div>

				<div class="mt-4 flex justify-end">
					<button
						type="submit"
						class="px-5 py-2 text-sm font-medium bg-zinc-900 text-white rounded hover:bg-zinc-700 transition-colors"
					>
						Speichern
					</button>
				</div>
			</form>
		</div>
	</section>
</div>
