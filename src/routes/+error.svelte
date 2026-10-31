<script lang="ts">
	import { page } from '$app/state';
	import { email } from '#lib/config.js';
	import * as m from '#lib/messages.js';

	const isServerError = $derived(page.status >= 500);
	const copy = $derived.by(() => {
		switch (page.status) {
			case 401:
				return { title: m.errorUnauthorizedTitle(), description: m.errorUnauthorizedDescription() };
			case 403:
				return { title: m.errorForbiddenTitle(), description: m.errorForbiddenDescription() };
			case 404:
				return { title: m.errorNotFoundTitle(), description: m.errorNotFoundDescription() };
			case 410:
				return { title: m.errorGoneTitle(), description: m.errorGoneDescription() };
			case 429:
				return { title: m.errorRateLimitTitle(), description: m.errorRateLimitDescription() };
			default:
				return isServerError
					? { title: m.errorServerTitle(), description: m.errorServerDescription() }
					: { title: m.errorRequestTitle(), description: m.errorRequestDescription() };
		}
	});
</script>

<svelte:head>
	<title>{page.status} · {copy.title} | Zigarren Puro</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="error-page" aria-labelledby="error-title">
	<div class="error-card">
		<p class="error-brand">Zigarren Puro</p>
		<div class="error-ornament" aria-hidden="true"><span></span></div>
		<p class="error-status">{page.status}</p>
		<h1 id="error-title">{copy.title}</h1>
		<p class="error-description">{copy.description}</p>

		<div class="error-actions">
			{#if isServerError}
				<a class="error-button error-button-primary" href={page.url.href} data-sveltekit-reload>
					{m.errorRetry()}
				</a>
				<a class="error-button" href="/">{m.errorHome()}</a>
			{:else}
				<a class="error-button error-button-primary" href="/">{m.errorHome()}</a>
				<a class="error-button" href="/shop">{m.errorShop()}</a>
			{/if}
		</div>

		<p class="error-help">
			{m.errorHelp()}
			<a href={`mailto:${email}`}>{m.errorContact()}</a>
		</p>
	</div>
</section>

<style>
	.error-page {
		display: grid;
		flex: 1;
		min-height: 100vh;
		min-height: 100dvh;
		place-items: center;
		padding: clamp(2rem, 6vw, 5rem) 1rem;
		background: #f7f4ee;
		color: #302a23;
	}

	/* The normal layout already supplies the available height. */
	:global(main) > .error-page {
		min-height: 0;
	}

	.error-card {
		position: relative;
		width: 100%;
		max-width: 58rem;
		border: 1px solid #d9cdbb;
		padding: clamp(2.5rem, 6vw, 4.5rem) clamp(1.25rem, 5vw, 4rem);
		text-align: center;
	}

	.error-card::before {
		position: absolute;
		inset: 6px;
		border: 1px solid #e8dfd2;
		pointer-events: none;
		content: '';
	}

	.error-brand {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.25em;
		text-transform: uppercase;
	}

	.error-ornament {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin: 1.5rem auto 2rem;
		color: #947347;
	}

	.error-ornament::before,
	.error-ornament::after {
		width: 3rem;
		height: 1px;
		background: #c9b797;
		content: '';
	}

	.error-ornament span {
		width: 6px;
		height: 6px;
		border: 1px solid currentColor;
		transform: rotate(45deg);
	}

	.error-status {
		margin: 0 0 1.5rem;
		color: #947347;
		font-family: var(--font-serif, Georgia, serif);
		font-size: clamp(6rem, 16vw, 10rem);
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.04em;
	}

	h1 {
		margin: 0;
		font-family: var(--font-serif, Georgia, serif);
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 600;
		line-height: 1.25;
		text-wrap: balance;
	}

	.error-description {
		max-width: 31rem;
		margin: 1.25rem auto 0;
		color: #6c6257;
		font-size: 1rem;
		line-height: 1.8;
		text-wrap: pretty;
	}

	.error-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 2rem;
	}

	.error-button {
		display: inline-flex;
		min-height: 3.25rem;
		align-items: center;
		justify-content: center;
		border: 1px solid #b7a68d;
		padding: 0.75rem 1.5rem;
		color: #302a23;
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none;
	}

	.error-button:hover {
		background: #ece5d9;
	}

	.error-button-primary {
		border-color: #302a23;
		background: #302a23;
		color: #fffaf2;
	}

	.error-button-primary:hover {
		border-color: #514334;
		background: #514334;
	}

	a:focus-visible {
		outline: 2px solid #947347;
		outline-offset: 4px;
	}

	.error-help {
		margin-top: 2.25rem;
		color: #6c6257;
		font-size: 0.875rem;
		line-height: 1.8;
	}

	.error-help a {
		display: inline-block;
		color: #59462f;
		font-size: 1rem;
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	.error-help a:hover {
		color: #302a23;
	}

	@media (max-width: 480px) {
		.error-actions {
			flex-direction: column;
		}
	}
</style>
