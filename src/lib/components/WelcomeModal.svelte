<script lang="ts">
	import { ShoppingBag, User, Heart, X } from '@lucide/svelte';

	let { firstName, onClose }: { firstName: string; onClose: () => void } = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
	role="dialog"
	aria-modal="true"
	aria-labelledby="welcome-title"
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="absolute inset-0"
		onclick={onClose}
		role="presentation"
	></div>

	<div class="relative w-full max-w-md rounded-2xl bg-base-100 shadow-2xl ring-1 ring-base-300 overflow-hidden">
		<div class="bg-primary/5 px-8 pt-10 pb-8 text-center border-b border-base-300">
			<button
				onclick={onClose}
				class="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle"
				aria-label="Schließen"
			>
				<X class="h-4 w-4" />
			</button>

			<p class="font-serif text-2xl font-semibold tracking-wide text-base-content mb-1">Willkommen, {firstName}!</p>
			<p class="text-sm text-base-content/60 leading-relaxed">
				Ihr Konto ist aktiv. Entdecken Sie unser Sortiment an Premium-Zigarren und Spirituosen.
			</p>
		</div>

		<div class="px-8 py-6 flex flex-col gap-3">
			<a
				href="/shop"
				onclick={onClose}
				class="btn btn-primary w-full gap-2"
			>
				<ShoppingBag class="h-4 w-4" />
				Zum Shop
			</a>

			<div class="grid grid-cols-2 gap-3">
				<a
					href="/account"
					onclick={onClose}
					class="btn btn-outline w-full gap-2"
				>
					<User class="h-4 w-4" />
					Mein Konto
				</a>
				<a
					href="/account/wishlist"
					onclick={onClose}
					class="btn btn-outline w-full gap-2"
				>
					<Heart class="h-4 w-4" />
					Wunschliste
				</a>
			</div>
		</div>

		<p class="text-center text-xs text-base-content/40 pb-5">
			Fragen? <a href="/contact" onclick={onClose} class="underline hover:text-base-content/60">Kontaktieren Sie uns</a>
		</p>
	</div>
</div>
