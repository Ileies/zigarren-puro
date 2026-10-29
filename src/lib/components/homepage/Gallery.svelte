<script lang="ts">
	const photographs = [
		{
			src: '/gallery/cohiba-linea.png',
			alt: 'Cohiba Linea Zigarren',
			name: 'Cohiba Linea',
			detail: 'Kubanische Zigarren',
			className: 'gallery-feature'
		},
		{
			src: '/gallery/flor-de-copan.png',
			alt: 'Flor de Copán Zigarren',
			name: 'Flor de Copán',
			detail: 'Aus Honduras',
			className: ''
		},
		{
			src: '/gallery/parcero-dominicano.png',
			alt: 'Parcero Dominicano Zigarren',
			name: 'Parcero Dominicano',
			detail: 'Dominikanische Republik',
			className: ''
		},
		{
			src: '/gallery/vegafina-minuto.png',
			alt: 'Vegafina Minuto Zigarren',
			name: 'Vegafina Minuto',
			detail: 'Klein im Format',
			className: ''
		}
	];
</script>

<section class="gallery-section" aria-labelledby="gallery-title">
	<div class="gallery-inner">
		<div class="gallery-heading">
			<div>
				<p class="gallery-kicker">Zigarren Puro · Ausgewählte Marken</p>
				<h1 id="gallery-title">
					Tabakkultur, die man<br class="hidden sm:block" /> gern entdeckt.
				</h1>
			</div>
			<a class="gallery-shop-link" href="/shop"
				>Alle Zigarren entdecken <span aria-hidden="true">↗</span></a
			>
		</div>

		<div class="gallery-grid">
			{#each photographs as photograph, index (photograph.src)}
				<a
					href="/shop?type=cigar"
					class="gallery-tile {photograph.className}"
					aria-label="{photograph.name}: Zigarren entdecken"
				>
					<img src={photograph.src} alt={photograph.alt} loading={index === 0 ? 'eager' : 'lazy'} />
					<span class="gallery-caption">
						<span class="gallery-caption-detail">{photograph.detail}</span>
						<span class="gallery-caption-name">{photograph.name}</span>
					</span>
				</a>
			{/each}
		</div>
		<div class="gallery-footnote">
			<span></span> Zigarren aus bekannten Herkunftsländern und Manufakturen
		</div>
	</div>
</section>

<style>
	.gallery-section {
		--gallery-ink: #2c241f;
		--gallery-muted: #71675c;
		background: #f7f3eb;
		color: var(--gallery-ink);
		padding: clamp(1.75rem, 4vw, 3.25rem) 1.25rem 3.5rem;
	}

	.gallery-inner {
		margin-inline: auto;
		max-width: 1280px;
	}

	.gallery-heading {
		align-items: end;
		display: flex;
		justify-content: space-between;
		gap: 2rem;
		margin-bottom: 1.5rem;
	}

	.gallery-kicker {
		color: #765a35;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.11em;
		margin: 0 0 0.6rem;
		text-transform: uppercase;
	}

	h1 {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(2rem, 4vw, 3.25rem);
		font-weight: 600;
		letter-spacing: -0.035em;
		line-height: 1.08;
		margin: 0;
	}

	.gallery-shop-link {
		align-items: center;
		border-bottom: 1px solid #998361;
		color: var(--gallery-ink);
		display: inline-flex;
		flex: 0 0 auto;
		font-size: 0.95rem;
		gap: 0.65rem;
		margin-bottom: 0.2rem;
		min-height: 44px;
		text-decoration: none;
	}

	.gallery-shop-link span {
		color: #765a35;
		font-size: 1.2rem;
	}

	.gallery-grid {
		display: grid;
		gap: 0.85rem;
		grid-template-columns: 1.35fr 1fr 1fr;
		grid-template-rows: clamp(190px, 22vw, 300px) clamp(150px, 17vw, 225px);
	}

	.gallery-tile {
		background: #e9e1d4;
		isolation: isolate;
		min-height: 0;
		overflow: hidden;
		position: relative;
		text-decoration: none;
	}

	.gallery-tile::after {
		background: linear-gradient(0deg, rgb(22 18 15 / 72%), rgb(22 18 15 / 0%) 68%);
		content: '';
		inset: 30% 0 0;
		pointer-events: none;
		position: absolute;
	}

	.gallery-tile img {
		display: block;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transition: transform 350ms ease;
		width: 100%;
	}

	.gallery-tile:hover img,
	.gallery-tile:focus-visible img {
		transform: scale(1.025);
	}

	.gallery-tile:focus-visible {
		outline: 3px solid #856330;
		outline-offset: 3px;
		z-index: 1;
	}

	.gallery-feature {
		grid-column: 1;
		grid-row: 1 / span 2;
	}

	.gallery-caption {
		bottom: 1.1rem;
		color: white;
		display: flex;
		flex-direction: column;
		left: 1.25rem;
		position: absolute;
		right: 1rem;
		z-index: 1;
	}

	.gallery-caption-detail {
		font-size: 0.75rem;
		letter-spacing: 0.07em;
		margin-bottom: 0.2rem;
		text-transform: uppercase;
	}

	.gallery-caption-name {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.1rem, 1.7vw, 1.55rem);
		line-height: 1.2;
	}

	.gallery-feature .gallery-caption {
		bottom: 1.5rem;
		left: 1.5rem;
	}

	.gallery-feature .gallery-caption-name {
		font-size: clamp(1.6rem, 2.5vw, 2.25rem);
	}

	.gallery-footnote {
		align-items: center;
		color: var(--gallery-muted);
		display: flex;
		font-size: 0.875rem;
		gap: 0.6rem;
		margin-top: 1rem;
	}

	.gallery-footnote span {
		background: #856330;
		height: 1px;
		width: 1.75rem;
	}

	@media (max-width: 700px) {
		.gallery-section {
			padding-inline: 1rem;
		}

		.gallery-heading {
			align-items: start;
			flex-direction: column;
			gap: 0.7rem;
			margin-bottom: 1.1rem;
		}

		.gallery-grid {
			gap: 0.6rem;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: minmax(250px, 63vw) minmax(130px, 36vw);
		}

		.gallery-feature {
			grid-column: 1 / -1;
			grid-row: 1;
		}

		.gallery-feature img {
			object-position: center 48%;
		}

		.gallery-caption {
			bottom: 0.75rem;
			left: 0.75rem;
			right: 0.6rem;
		}

		.gallery-caption-detail {
			font-size: 0.65rem;
		}

		.gallery-caption-name {
			font-size: 1.05rem;
		}

		.gallery-feature .gallery-caption {
			bottom: 1rem;
			left: 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.gallery-tile img {
			transition: none;
		}
	}
</style>
