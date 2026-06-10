<script lang="ts">
	import { enhance } from '$app/forms';
	import { Lock, Truck, ChevronLeft, Package, CreditCard, Building2, AlertCircle } from '@lucide/svelte';
	import * as m from '$lib/messages';
	import { freeShippingThreshold, shippingCosts } from '$lib/config';
	import { loadStripe, type StripeEmbeddedCheckout } from '@stripe/stripe-js';
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';

	let { data, form } = $props();

	const BUNDESLAENDER = [
		'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen',
		'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen',
		'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
		'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
	];

	const savedShipping = data.addresses.filter((a) => a.type === 'shipping');
	const savedBilling = data.addresses.filter((a) => a.type === 'billing');

	// Step 1 state
	let shippingMode = $state<'saved' | 'new'>(savedShipping.length > 0 ? 'saved' : 'new');
	let selectedShippingId = $state<string>(
		savedShipping.find((a) => a.isDefault)?.id ?? savedShipping[0]?.id ?? ''
	);
	let newShipping = $state({ street: '', city: '', postalCode: '', state: '' });

	let billingSameAsShipping = $state(true);
	let billingMode = $state<'saved' | 'new'>(savedBilling.length > 0 ? 'saved' : 'new');
	let selectedBillingId = $state<string>(
		savedBilling.find((a) => a.isDefault)?.id ?? savedBilling[0]?.id ?? ''
	);
	let newBilling = $state({ street: '', city: '', postalCode: '', state: '' });

	// Navigation
	let step = $state<1 | 2 | 3>(1);
	let step1Errors = $state<Record<string, string>>({});
	let submitting = $state(false);

	// Step 2 state (captured from step 1)
	let capturedShippingId = $state('');
	let capturedShippingStreet = $state('');
	let capturedShippingCity = $state('');
	let capturedShippingPostalCode = $state('');
	let capturedShippingState = $state('');
	let capturedBillingSame = $state(true);
	let capturedBillingId = $state('');
	let capturedBillingStreet = $state('');
	let capturedBillingCity = $state('');
	let capturedBillingPostalCode = $state('');
	let capturedBillingState = $state('');

	let displayShippingAddress = $state<{ street: string; city: string; postalCode: string; state: string } | null>(null);

	let shippingMethod = $state<'standard' | 'express'>('standard');
	let paymentMethod = $state<'bank_transfer' | 'credit_card'>('bank_transfer');

	// Stripe state
	let stripePaymentElement: HTMLDivElement | undefined = $state();
	let stripeError = $state('');
	let stripeCheckout: StripeEmbeddedCheckout | null = $state(null);

	// Totals
	const subtotal = $derived(
		data.items.reduce((sum, item) => sum + item.price * item.qty, 0)
	);
	const shippingCost = $derived(
		subtotal >= freeShippingThreshold ? 0 : shippingCosts[shippingMethod]
	);
	const total = $derived(subtotal + shippingCost);

	function formatPrice(n: number) {
		return n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	}

	// Step 1 validation
	function validateStep1() {
		const errors: Record<string, string> = {};
		if (shippingMode === 'new') {
			if (!newShipping.street) errors.shippingStreet = 'Pflichtfeld';
			if (!newShipping.city) errors.shippingCity = 'Pflichtfeld';
			if (!newShipping.postalCode) errors.shippingPostalCode = 'Pflichtfeld';
			else if (!/^\d{5}$/.test(newShipping.postalCode)) errors.shippingPostalCode = 'Ungültige PLZ';
			if (!newShipping.state) errors.shippingState = 'Pflichtfeld';
		}
		if (!billingSameAsShipping && billingMode === 'new') {
			if (!newBilling.street) errors.billingStreet = 'Pflichtfeld';
			if (!newBilling.city) errors.billingCity = 'Pflichtfeld';
			if (!newBilling.postalCode) errors.billingPostalCode = 'Pflichtfeld';
			else if (!/^\d{5}$/.test(newBilling.postalCode)) errors.billingPostalCode = 'Ungültige PLZ';
			if (!newBilling.state) errors.billingState = 'Pflichtfeld';
		}
		return errors;
	}

	function goToStep2() {
		step1Errors = validateStep1();
		if (Object.keys(step1Errors).length > 0) return;

		capturedShippingId = shippingMode === 'saved' ? selectedShippingId : '';
		capturedShippingStreet = shippingMode === 'new' ? newShipping.street : '';
		capturedShippingCity = shippingMode === 'new' ? newShipping.city : '';
		capturedShippingPostalCode = shippingMode === 'new' ? newShipping.postalCode : '';
		capturedShippingState = shippingMode === 'new' ? newShipping.state : '';

		capturedBillingSame = billingSameAsShipping;
		capturedBillingId = !billingSameAsShipping && billingMode === 'saved' ? selectedBillingId : '';
		capturedBillingStreet = !billingSameAsShipping && billingMode === 'new' ? newBilling.street : '';
		capturedBillingCity = !billingSameAsShipping && billingMode === 'new' ? newBilling.city : '';
		capturedBillingPostalCode = !billingSameAsShipping && billingMode === 'new' ? newBilling.postalCode : '';
		capturedBillingState = !billingSameAsShipping && billingMode === 'new' ? newBilling.state : '';

		if (shippingMode === 'saved') {
			const a = savedShipping.find((a) => a.id === selectedShippingId);
			if (a) displayShippingAddress = { street: a.street, city: a.city, postalCode: a.postalCode, state: a.state };
		} else {
			displayShippingAddress = { ...newShipping };
		}

		step = 2;
	}

	// When the server returns a clientSecret, mount the Stripe embedded checkout
	$effect(() => {
		if (form && 'clientSecret' in form && form.clientSecret && stripePaymentElement) {
			step = 3;
			mountStripeElement(form.clientSecret as string);
		}
	});

	async function mountStripeElement(clientSecret: string) {
		const stripe = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
		if (!stripe) {
			stripeError = 'Stripe konnte nicht geladen werden.';
			return;
		}
		stripeCheckout = await stripe.createEmbeddedCheckoutPage({ clientSecret });
		stripeCheckout.mount('#stripe-payment-element');
	}

	$effect(() => {
		return () => {
			stripeCheckout?.destroy();
		};
	});
</script>

<svelte:head>
	<title>{m.checkoutTitle()} - Zigarren Puro</title>
</svelte:head>

<div class="container mx-auto max-w-5xl px-4 py-10">
	<h1 class="mb-8 text-3xl font-bold">{m.checkoutTitle()}</h1>

	<!-- Step indicator -->
	<div class="mb-8 flex items-center gap-3">
		<div class="flex items-center gap-2">
			<div class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
				{step === 1 ? 'bg-secondary text-secondary-content' : 'bg-secondary/20 text-secondary'}">
				1
			</div>
			<span class="text-sm font-medium">{m.checkoutStep1()}</span>
		</div>
		<div class="h-px flex-1 bg-base-300"></div>
		<div class="flex items-center gap-2">
			<div class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
				{step === 2 ? 'bg-secondary text-secondary-content' : step > 2 ? 'bg-secondary/20 text-secondary' : 'bg-base-300 text-base-content/40'}">
				2
			</div>
			<span class="text-sm {step >= 2 ? 'font-medium' : 'text-base-content/40'}">{m.checkoutStep2()}</span>
		</div>
		{#if paymentMethod === 'credit_card' || step === 3}
			<div class="h-px flex-1 bg-base-300"></div>
			<div class="flex items-center gap-2">
				<div class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
					{step === 3 ? 'bg-secondary text-secondary-content' : 'bg-base-300 text-base-content/40'}">
					3
				</div>
				<span class="text-sm {step === 3 ? 'font-medium' : 'text-base-content/40'}">{m.checkoutStep3()}</span>
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">

		<!-- Left column: steps -->
		<div class="lg:col-span-2">

			<!-- STEP 1: Addresses -->
			{#if step === 1}
				<div class="space-y-6">

					<!-- Shipping address -->
					<div class="card bg-base-100 border border-base-200 shadow-sm">
						<div class="card-body">
							<h2 class="card-title text-base">{m.checkoutShippingAddress()}</h2>

							{#if savedShipping.length > 0}
								<div class="space-y-2 mb-4">
									{#each savedShipping as addr (addr.id)}
										<label class="flex cursor-pointer items-start gap-3 rounded-lg border border-base-200 p-3 hover:border-secondary transition-colors {shippingMode === 'saved' && selectedShippingId === addr.id ? 'border-secondary bg-secondary/5' : ''}">
											<input
												type="radio"
												class="radio radio-secondary radio-sm mt-0.5 shrink-0"
												bind:group={selectedShippingId}
												value={addr.id}
												onchange={() => (shippingMode = 'saved')}
											/>
											<span class="text-sm leading-relaxed">
												{addr.street}, {addr.postalCode} {addr.city}
												{#if addr.isDefault}
													<span class="badge badge-secondary badge-xs ml-1">Standard</span>
												{/if}
											</span>
										</label>
									{/each}
									<label class="flex cursor-pointer items-center gap-3 rounded-lg border border-base-200 p-3 hover:border-secondary transition-colors {shippingMode === 'new' ? 'border-secondary bg-secondary/5' : ''}">
										<input
											type="radio"
											class="radio radio-secondary radio-sm shrink-0"
											bind:group={shippingMode}
											value="new"
										/>
										<span class="text-sm">{m.checkoutNewAddress()}</span>
									</label>
								</div>
							{/if}

							{#if shippingMode === 'new'}
								<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
									<div class="sm:col-span-2">
										<label class="label label-text text-xs pb-1" for="s-street">{m.checkoutStreet()} *</label>
										<input
											id="s-street"
											class="input input-bordered w-full input-sm {step1Errors.shippingStreet ? 'input-error' : ''}"
											bind:value={newShipping.street}
											autocomplete="street-address"
										/>
										{#if step1Errors.shippingStreet}
											<p class="text-error text-xs mt-1">{step1Errors.shippingStreet}</p>
										{/if}
									</div>
									<div>
										<label class="label label-text text-xs pb-1" for="s-plz">{m.checkoutPostalCode()} *</label>
										<input
											id="s-plz"
											class="input input-bordered w-full input-sm {step1Errors.shippingPostalCode ? 'input-error' : ''}"
											bind:value={newShipping.postalCode}
											inputmode="numeric"
											maxlength="5"
											autocomplete="postal-code"
										/>
										{#if step1Errors.shippingPostalCode}
											<p class="text-error text-xs mt-1">{step1Errors.shippingPostalCode}</p>
										{/if}
									</div>
									<div>
										<label class="label label-text text-xs pb-1" for="s-city">{m.checkoutCity()} *</label>
										<input
											id="s-city"
											class="input input-bordered w-full input-sm {step1Errors.shippingCity ? 'input-error' : ''}"
											bind:value={newShipping.city}
											autocomplete="address-level2"
										/>
										{#if step1Errors.shippingCity}
											<p class="text-error text-xs mt-1">{step1Errors.shippingCity}</p>
										{/if}
									</div>
									<div class="sm:col-span-2">
										<label class="label label-text text-xs pb-1" for="s-state">{m.checkoutState()} *</label>
										<select
											id="s-state"
											class="select select-bordered w-full select-sm {step1Errors.shippingState ? 'select-error' : ''}"
											bind:value={newShipping.state}
											autocomplete="address-level1"
										>
											<option value="" disabled selected>{m.checkoutSelectState()}</option>
											{#each BUNDESLAENDER as bl (bl)}
												<option value={bl}>{bl}</option>
											{/each}
										</select>
										{#if step1Errors.shippingState}
											<p class="text-error text-xs mt-1">{step1Errors.shippingState}</p>
										{/if}
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Billing address -->
					<div class="card bg-base-100 border border-base-200 shadow-sm">
						<div class="card-body">
							<h2 class="card-title text-base">{m.checkoutBillingAddress()}</h2>

							<label class="flex cursor-pointer items-center gap-2 mb-4">
								<input type="checkbox" class="checkbox checkbox-secondary checkbox-sm" bind:checked={billingSameAsShipping} />
								<span class="text-sm">{m.checkoutSameAsShipping()}</span>
							</label>

							{#if !billingSameAsShipping}
								{#if savedBilling.length > 0}
									<div class="space-y-2 mb-4">
										{#each savedBilling as addr (addr.id)}
											<label class="flex cursor-pointer items-start gap-3 rounded-lg border border-base-200 p-3 hover:border-secondary transition-colors {billingMode === 'saved' && selectedBillingId === addr.id ? 'border-secondary bg-secondary/5' : ''}">
												<input
													type="radio"
													class="radio radio-secondary radio-sm mt-0.5 shrink-0"
													bind:group={selectedBillingId}
													value={addr.id}
													onchange={() => (billingMode = 'saved')}
												/>
												<span class="text-sm leading-relaxed">
													{addr.street}, {addr.postalCode} {addr.city}
													{#if addr.isDefault}
														<span class="badge badge-secondary badge-xs ml-1">Standard</span>
													{/if}
												</span>
											</label>
										{/each}
										<label class="flex cursor-pointer items-center gap-3 rounded-lg border border-base-200 p-3 hover:border-secondary transition-colors {billingMode === 'new' ? 'border-secondary bg-secondary/5' : ''}">
											<input
												type="radio"
												class="radio radio-secondary radio-sm shrink-0"
												bind:group={billingMode}
												value="new"
											/>
											<span class="text-sm">{m.checkoutNewAddress()}</span>
										</label>
									</div>
								{/if}

								{#if billingMode === 'new'}
									<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
										<div class="sm:col-span-2">
											<label class="label label-text text-xs pb-1" for="b-street">{m.checkoutStreet()} *</label>
											<input
												id="b-street"
												class="input input-bordered w-full input-sm {step1Errors.billingStreet ? 'input-error' : ''}"
												bind:value={newBilling.street}
												autocomplete="street-address"
											/>
											{#if step1Errors.billingStreet}
												<p class="text-error text-xs mt-1">{step1Errors.billingStreet}</p>
											{/if}
										</div>
										<div>
											<label class="label label-text text-xs pb-1" for="b-plz">{m.checkoutPostalCode()} *</label>
											<input
												id="b-plz"
												class="input input-bordered w-full input-sm {step1Errors.billingPostalCode ? 'input-error' : ''}"
												bind:value={newBilling.postalCode}
												inputmode="numeric"
												maxlength="5"
												autocomplete="postal-code"
											/>
											{#if step1Errors.billingPostalCode}
												<p class="text-error text-xs mt-1">{step1Errors.billingPostalCode}</p>
											{/if}
										</div>
										<div>
											<label class="label label-text text-xs pb-1" for="b-city">{m.checkoutCity()} *</label>
											<input
												id="b-city"
												class="input input-bordered w-full input-sm {step1Errors.billingCity ? 'input-error' : ''}"
												bind:value={newBilling.city}
												autocomplete="address-level2"
											/>
											{#if step1Errors.billingCity}
												<p class="text-error text-xs mt-1">{step1Errors.billingCity}</p>
											{/if}
										</div>
										<div class="sm:col-span-2">
											<label class="label label-text text-xs pb-1" for="b-state">{m.checkoutState()} *</label>
											<select
												id="b-state"
												class="select select-bordered w-full select-sm {step1Errors.billingState ? 'select-error' : ''}"
												bind:value={newBilling.state}
												autocomplete="address-level1"
											>
												<option value="" disabled selected>{m.checkoutSelectState()}</option>
												{#each BUNDESLAENDER as bl (bl)}
													<option value={bl}>{bl}</option>
												{/each}
											</select>
											{#if step1Errors.billingState}
												<p class="text-error text-xs mt-1">{step1Errors.billingState}</p>
											{/if}
										</div>
									</div>
								{/if}
							{/if}
						</div>
					</div>

					<button type="button" class="btn btn-primary w-full" onclick={goToStep2}>
						{m.checkoutContinue()}
					</button>
				</div>

			<!-- STEP 2: Shipping, Payment method, Review -->
			{:else if step === 2}
				<form
					method="POST"
					action="?/placeOrder"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							submitting = false;
							await update();
						};
					}}
					class="space-y-6"
				>
					<!-- Hidden: step 1 data -->
					<input type="hidden" name="shippingAddressId" value={capturedShippingId} />
					<input type="hidden" name="shippingStreet" value={capturedShippingStreet} />
					<input type="hidden" name="shippingCity" value={capturedShippingCity} />
					<input type="hidden" name="shippingPostalCode" value={capturedShippingPostalCode} />
					<input type="hidden" name="shippingState" value={capturedShippingState} />
					<input type="hidden" name="billingSameAsShipping" value={capturedBillingSame ? '1' : '0'} />
					<input type="hidden" name="billingAddressId" value={capturedBillingId} />
					<input type="hidden" name="billingStreet" value={capturedBillingStreet} />
					<input type="hidden" name="billingCity" value={capturedBillingCity} />
					<input type="hidden" name="billingPostalCode" value={capturedBillingPostalCode} />
					<input type="hidden" name="billingState" value={capturedBillingState} />
					<input type="hidden" name="paymentMethod" value={paymentMethod} />

					<!-- Delivery address summary -->
					{#if displayShippingAddress}
						<div class="card bg-base-100 border border-base-200 shadow-sm">
							<div class="card-body py-4">
								<div class="flex items-start justify-between gap-4">
									<div class="flex items-start gap-3">
										<Truck class="w-4 h-4 text-base-content/50 mt-0.5 shrink-0" />
										<div class="text-sm">
											<p class="font-medium text-base-content/70 text-xs uppercase tracking-wide mb-1">{m.checkoutDeliveryTo()}</p>
											<p class="font-medium">{data.firstName} {data.lastName}</p>
											<p class="text-base-content/60">{displayShippingAddress.street}, {displayShippingAddress.postalCode} {displayShippingAddress.city}</p>
										</div>
									</div>
									<button type="button" class="btn btn-ghost btn-xs shrink-0" onclick={() => (step = 1)}>
										{m.checkoutBack()}
									</button>
								</div>
							</div>
						</div>
					{/if}

					<!-- Shipping method -->
					<div class="card bg-base-100 border border-base-200 shadow-sm">
						<div class="card-body">
							<h2 class="card-title text-base">{m.checkoutShippingMethod()}</h2>
							<div class="space-y-2">
								<label class="flex cursor-pointer items-center justify-between rounded-lg border border-base-200 p-3 hover:border-secondary transition-colors {shippingMethod === 'standard' ? 'border-secondary bg-secondary/5' : ''}">
									<div class="flex items-center gap-3">
										<input type="radio" name="shippingMethod" class="radio radio-secondary radio-sm" value="standard" bind:group={shippingMethod} />
										<div>
											<p class="text-sm font-medium">{m.checkoutStandard()}</p>
											{#if subtotal >= freeShippingThreshold}
												<p class="text-xs text-success">{m.checkoutFreeShipping()}</p>
											{/if}
										</div>
									</div>
									<span class="text-sm font-semibold">
										{subtotal >= freeShippingThreshold ? m.checkoutFreeShipping() : formatPrice(shippingCosts.standard)}
									</span>
								</label>
								<label class="flex cursor-pointer items-center justify-between rounded-lg border border-base-200 p-3 hover:border-secondary transition-colors {shippingMethod === 'express' ? 'border-secondary bg-secondary/5' : ''}">
									<div class="flex items-center gap-3">
										<input type="radio" name="shippingMethod" class="radio radio-secondary radio-sm" value="express" bind:group={shippingMethod} />
										<p class="text-sm font-medium">{m.checkoutExpress()}</p>
									</div>
									<span class="text-sm font-semibold">{formatPrice(shippingCosts.express)}</span>
								</label>
							</div>
						</div>
					</div>

					<!-- Payment method selection -->
					<div class="card bg-base-100 border border-base-200 shadow-sm">
						<div class="card-body">
							<h2 class="card-title text-base">{m.checkoutPaymentMethod()}</h2>
							<div class="space-y-2">
								<label class="flex cursor-pointer items-start gap-3 rounded-lg border border-base-200 p-4 hover:border-secondary transition-colors {paymentMethod === 'bank_transfer' ? 'border-secondary bg-secondary/5' : ''}">
									<input
										type="radio"
										class="radio radio-secondary radio-sm mt-0.5 shrink-0"
										bind:group={paymentMethod}
										value="bank_transfer"
									/>
									<div class="flex items-start gap-3">
										<Building2 class="w-5 h-5 text-base-content/50 shrink-0 mt-0.5" />
										<div>
											<p class="text-sm font-semibold">{m.checkoutBankTransfer()}</p>
											<p class="text-xs text-base-content/60 mt-0.5">{m.checkoutBankTransferDesc()}</p>
										</div>
									</div>
								</label>
								<label class="flex cursor-pointer items-start gap-3 rounded-lg border border-base-200 p-4 hover:border-secondary transition-colors {paymentMethod === 'credit_card' ? 'border-secondary bg-secondary/5' : ''}">
									<input
										type="radio"
										class="radio radio-secondary radio-sm mt-0.5 shrink-0"
										bind:group={paymentMethod}
										value="credit_card"
									/>
									<div class="flex items-start gap-3">
										<CreditCard class="w-5 h-5 text-base-content/50 shrink-0 mt-0.5" />
										<div>
											<p class="text-sm font-semibold">{m.checkoutCreditCard()}</p>
											<p class="text-xs text-base-content/60 mt-0.5">{m.checkoutCreditCardDesc()}</p>
										</div>
									</div>
								</label>
							</div>
						</div>
					</div>

					<!-- Notes -->
					<div class="card bg-base-100 border border-base-200 shadow-sm">
						<div class="card-body">
							<h2 class="card-title text-base">{m.checkoutNotes()}</h2>
							<textarea
								name="notes"
								class="textarea textarea-bordered w-full text-sm"
								rows="2"
								placeholder={m.checkoutNotesPlaceholder()}
							></textarea>
						</div>
					</div>

					<!-- Error display -->
					{#if form?.error}
						<div class="alert alert-error">
							<AlertCircle class="w-4 h-4 shrink-0" />
							<span class="text-sm">
								{#if form.error === 'age'}
									{m.checkoutAgeError()}
								{:else}
									{form.error}
								{/if}
							</span>
						</div>
					{/if}

					<button type="submit" class="btn btn-primary w-full gap-2" disabled={submitting}>
						{#if submitting}
							<span class="loading loading-spinner loading-sm"></span>
						{:else}
							<Lock class="w-4 h-4" />
						{/if}
						{m.checkoutPlaceOrder()} - {formatPrice(total)}
					</button>

					<p class="text-center text-xs text-base-content/40">{m.checkoutVatNote()}</p>
				</form>

			<!-- STEP 3: Stripe Payment Element -->
			{:else if step === 3}
				<div class="space-y-6">
					<!-- Stripe embedded checkout container -->
					{#if stripeError}
						<div class="alert alert-error">
							<AlertCircle class="w-4 h-4 shrink-0" />
							<span class="text-sm">{stripeError}</span>
						</div>
					{/if}
					<div bind:this={stripePaymentElement}>
						<div id="stripe-payment-element" class="min-h-40">
							<div class="flex items-center justify-center py-12">
								<span class="loading loading-spinner loading-md text-secondary"></span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Right column: order summary -->
		<div class="space-y-4 lg:sticky lg:top-6 lg:h-fit">
			<div class="card bg-base-100 border border-base-200 shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-base">{m.checkoutOrderSummary()}</h2>

					<div class="space-y-3">
						{#each data.items as item (item.id)}
							<div class="flex items-start gap-3">
								<div class="w-10 h-10 bg-base-200 rounded-lg flex-shrink-0 flex items-center justify-center">
									<Package class="w-4 h-4 text-base-content/20" />
								</div>
								<div class="flex-1 min-w-0">
									{#if item.producerName}
										<p class="text-xs text-base-content/40 truncate">{item.producerName}</p>
									{/if}
									<p class="text-sm font-medium line-clamp-2 leading-tight">{item.name}</p>
									<p class="text-xs text-base-content/50 mt-0.5">x {item.qty}</p>
								</div>
								<p class="text-sm font-semibold shrink-0">{formatPrice(item.price * item.qty)}</p>
							</div>
						{/each}
					</div>

					<div class="divider my-2"></div>

					<div class="space-y-1.5 text-sm">
						<div class="flex justify-between text-base-content/60">
							<span>{m.checkoutSubtotal()}</span>
							<span>{formatPrice(subtotal)}</span>
						</div>
						<div class="flex justify-between text-base-content/60">
							<span>{m.shipping()}</span>
							{#if shippingCost === 0}
								<span class="text-success font-medium">{m.checkoutFreeShipping()}</span>
							{:else}
								<span>{formatPrice(shippingCost)}</span>
							{/if}
						</div>
						<div class="divider my-1"></div>
						<div class="flex justify-between font-semibold text-base">
							<span>{m.checkoutTotal()}</span>
							<span>{formatPrice(total)}</span>
						</div>
						<p class="text-xs text-base-content/40 text-right">{m.checkoutVatNote()}</p>
					</div>
				</div>
			</div>

			<div class="flex items-center gap-2 text-xs text-base-content/40 justify-center">
				<Lock class="w-3 h-3" />
				<span>Sichere, verschlüsselte Übertragung</span>
			</div>
		</div>

	</div>
</div>
