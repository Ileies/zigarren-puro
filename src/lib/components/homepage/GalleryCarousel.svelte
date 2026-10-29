<script lang="ts">
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';

	const slides = [
		{
			src: '/gallery/cohiba-linea.png',
			alt: 'Cohiba Linea Zigarren',
			name: 'Cohiba Linea',
			origin: 'Kuba'
		},
		{
			src: '/gallery/flor-de-copan.png',
			alt: 'Flor de Copán Zigarren',
			name: 'Flor de Copán',
			origin: 'Honduras'
		},
		{
			src: '/gallery/parcero-dominicano.png',
			alt: 'Parcero Dominicano Zigarren',
			name: 'Parcero Dominicano',
			origin: 'Dominikanische Republik'
		},
		{
			src: '/gallery/vegafina-minuto.png',
			alt: 'Vegafina Minuto Zigarren',
			name: 'Vegafina Minuto',
			origin: 'Dominikanische Republik'
		}
	];

	let current = $state(0);

	function previous() {
		current = (current - 1 + slides.length) % slides.length;
	}

	function next() {
		current = (current + 1) % slides.length;
	}
</script>

<section class="carousel-section" aria-label="Marken im Fokus">
	<div class="carousel-inner">
		<div class="carousel-frame" aria-live="polite" aria-atomic="true">
			{#each slides as slide, index (slide.src)}
				<div
					class="carousel-slide"
					class:active={index === current}
					aria-hidden={index !== current}
				>
					<img
						src={slide.src}
						alt={slide.alt}
						fetchpriority={index === current ? 'high' : 'auto'}
					/>
					<div class="carousel-shade"></div>
					<div class="carousel-copy">
						<p>Marken im Fokus <span aria-hidden="true">·</span> {slide.origin}</p>
						<h1>{slide.name}</h1>
						<a href="/shop?type=cigar">Zigarren entdecken <span aria-hidden="true">↗</span></a>
					</div>
				</div>
			{/each}

			<div class="carousel-controls">
				<button type="button" onclick={previous} aria-label="Vorherige Marke">
					<ArrowLeft size={19} />
				</button>
				<div class="carousel-dots" aria-label="Folie auswählen">
					{#each slides as slide, index (slide.src)}
						<button
							type="button"
							class:current={index === current}
							aria-label="{slide.name} anzeigen"
							aria-current={index === current ? 'true' : undefined}
							onclick={() => (current = index)}
						></button>
					{/each}
				</div>
				<button type="button" onclick={next} aria-label="Nächste Marke">
					<ArrowRight size={19} />
				</button>
			</div>
		</div>
	</div>
</section>

<style>
	.carousel-section {
		background: #f7f3eb;
		padding: clamp(1rem, 2.5vw, 2rem) 1.25rem 0;
	}

	.carousel-inner {
		margin-inline: auto;
		max-width: 1280px;
	}

	.carousel-frame {
		background: #e9e1d4;
		height: clamp(300px, 39vw, 510px);
		isolation: isolate;
		min-height: 0;
		overflow: hidden;
		position: relative;
	}

	.carousel-slide {
		inset: 0;
		opacity: 0;
		pointer-events: none;
		position: absolute;
		transition: opacity 300ms ease;
	}

	.carousel-slide.active {
		opacity: 1;
		pointer-events: auto;
		z-index: 1;
	}

	.carousel-slide > img {
		display: block;
		height: 100%;
		object-fit: cover;
		object-position: center 45%;
		width: 100%;
	}

	.carousel-shade {
		background: linear-gradient(
			90deg,
			rgb(23 19 16 / 72%),
			rgb(23 19 16 / 24%) 55%,
			transparent 85%
		);
		inset: 0;
		position: absolute;
	}

	.carousel-copy {
		bottom: clamp(2.75rem, 6vw, 5rem);
		color: #fffcf6;
		left: clamp(1.5rem, 6vw, 5rem);
		max-width: 36rem;
		position: absolute;
	}

	.carousel-copy p {
		color: #ead9b9;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		margin: 0 0 0.7rem;
		text-transform: uppercase;
	}

	.carousel-copy p span {
		padding-inline: 0.25rem;
	}

	.carousel-copy h1 {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(2.5rem, 6vw, 5rem);
		font-weight: 600;
		letter-spacing: -0.035em;
		line-height: 1.02;
		margin: 0 0 1.35rem;
	}

	.carousel-copy a {
		align-items: center;
		border-bottom: 1px solid #c9a76e;
		color: #fffcf6;
		display: inline-flex;
		font-size: 0.95rem;
		gap: 0.65rem;
		min-height: 44px;
		text-decoration: none;
	}

	.carousel-copy a span {
		color: #e8c98f;
		font-size: 1.2rem;
	}

	.carousel-controls {
		align-items: center;
		bottom: 1rem;
		display: flex;
		gap: 0.75rem;
		position: absolute;
		right: 1rem;
		z-index: 2;
	}

	.carousel-controls > button {
		align-items: center;
		background: rgb(247 243 235 / 94%);
		border: 1px solid rgb(255 252 246 / 70%);
		color: #2c241f;
		cursor: pointer;
		display: inline-flex;
		height: 44px;
		justify-content: center;
		width: 44px;
	}

	.carousel-controls > button:focus-visible,
	.carousel-dots button:focus-visible {
		outline: 3px solid #c9a76e;
		outline-offset: 3px;
	}

	.carousel-dots {
		align-items: center;
		display: flex;
		gap: 0.5rem;
	}

	.carousel-dots button {
		background: rgb(255 252 246 / 65%);
		border: 0;
		border-radius: 99px;
		cursor: pointer;
		height: 8px;
		padding: 0;
		width: 8px;
	}

	.carousel-dots button.current {
		background: #fffcf6;
		width: 22px;
	}

	@media (max-width: 700px) {
		.carousel-section {
			padding-inline: 1rem;
		}

		.carousel-frame {
			height: min(112vw, 440px);
		}

		.carousel-slide > img {
			object-position: 58% center;
		}

		.carousel-shade {
			background: linear-gradient(0deg, rgb(23 19 16 / 75%), rgb(23 19 16 / 10%) 75%);
		}

		.carousel-copy {
			bottom: 4.5rem;
			left: 1.1rem;
			right: 1rem;
		}

		.carousel-copy h1 {
			font-size: clamp(2.2rem, 10vw, 3.4rem);
		}

		.carousel-controls {
			bottom: 0.55rem;
			right: 0.55rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.carousel-slide {
			transition: none;
		}
	}
</style>
