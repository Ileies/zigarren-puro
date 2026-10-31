# Zigarren Puro - TODO

## Now

- **[INFRA]** Run `bun run db:push` to apply `stripe_session_id` column migration
- **[INFRA]** Fill `.env`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **[INFRA]** Register Stripe webhook in dashboard: `https://zigarren-puro.de/api/stripe/webhook` (events: `checkout.session.completed`, `checkout.session.async_payment_failed`)

## Soon

- **[FEATURE]** Add an image gallery to `/admin` so admins can select pictures.
- **[FEATURE]** Implement reliable identity and age verification to enforce the 18+ requirement before users can purchase age-restricted products.
- **[DESIGN]** Rework the storefront as a modern specialist cigar shop, preserving the existing footer. shadcn-svelte foundation is installed; follow the [design direction](docs/design-direction.md) and the [route-by-route migration plan](docs/ui-migration-plan.md) to replace DaisyUI and apply the new principles.

## Later

- **[FEATURE]** Zigarren-Sammler-Plattform ("Vivino model"): personal cigar log (tasted/cellar/wishlist/ordered) with tasting notes, community "Missing Cigar" requests with upvotes, public connoisseur profile with statistics and badges, social follow system and feed
- **[FEATURE]** Abo-Box: monthly curated delivery box ("Box of the Month") with Stripe Subscriptions
- **[FEATURE]** Expert-Content: `/guides` route with cigar guides, strength levels, vitola explanations, pairing recommendations (cigar + rum/whisky)
- **[FEATURE]** Treueprogramm: points for purchases, reviews, birthday - redeemable as discount or free item
- **[FEATURE]** B2B-Portal: separate area for restaurants/bars/tobacco retailers with bulk pricing, minimum order quantities, and invoice payment

---

- ~~**[FEATURE]** Stripe payment gateway - Embedded Checkout, Kreditkarte + Banküberweisung~~
