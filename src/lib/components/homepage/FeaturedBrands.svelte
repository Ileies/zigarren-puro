<script lang="ts">
	import BrandCard from './BrandCard.svelte';
</script>

<!-- Featured Brands Section -->
<section class="py-12 lg:py-16 bg-base-100">
	<div class="container mx-auto px-6">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
			<BrandCard 
				src="/brands/vegafina.png"
				alt="Vegafina Premium Zigarren"
				title="Vegafina"
				description="Dominikanische Premiumzigarren mit mildem, cremigem Geschmack und ausgewogener Aromatik."
				href="/search?q=Vegafina"
			/>
			
			<BrandCard 
				src="/brands/flor-de-copan.png"
				alt="Flor de Copan Premium Zigarren"
				title="Flor de Copán"
				description="Honduranische Zigarren mit feiner Würze, sanfter Süße und perfekter Balance."
				href="/search?q=Flor de Copán"
			/>
			
			<BrandCard 
				src="/brands/henri-clay.png"
				alt="Henri Clay Premium Zigarren"
				title="Henri Clay"
				description="Aromatische Zigarren mit mittelkräftigem, würzigem Charakter und klassischer Eleganz."
				href="/search?q=Henri Clay"
			/>
		</div>
		
		<!-- Second Row of Brand Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-8">
			<BrandCard 
				src="/brands/john-aylesbury.png"
				alt="John Aylesbury Premium Zigarren"
				title="John Aylesbury"
				description="Deutsche Fachhandelsmarke für exklusive Zigarren, Tabakwaren und Accessoires."
				href="/search?q=John Aylesbury"
			/>
			
			<BrandCard 
				src="/brands/davidoff.png"
				alt="Davidoff Premium Zigarren"
				title="Davidoff"
				description="Luxuszigarren aus der Dominikanischen Republik, berühmt für höchste Qualität und komplexe Aromen."
				href="/search?q=Davidoff"
			/>
			
			<BrandCard 
				src="/brands/laura-chavin.png"
				alt="Laura Chavin Premium Zigarren"
				title="Laura Chavin"
				description="Deutsche Premiumzigarren, handgefertigt in der Dominikanischen Republik aus edelsten Tabaken."
				href="/search?q=Laura Chavin"
			/>
		</div>
	</div>
</section>
