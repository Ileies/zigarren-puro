# Zigarren Puro - TODO

## Now

- **[INFRA]** Run `bun run db:push` for the new order and newsletter columns and tables (see [outstanding-work.md](./outstanding-work.md), section 4)
- **[INFRA]** Delete the unused `STRIPE_*` lines from `.env` (local and server)
- **[PAYMENT]** The payment provider is Mollie, not Stripe. The plan is in [outstanding-work.md](./outstanding-work.md), workstream A

## Soon

- **[FEATURE]** Add an image gallery to `/admin` so admins can select pictures.
- **[FEATURE]** Implement reliable identity and age verification to enforce the 18+ requirement before users can purchase age-restricted products.
- **[DESIGN]** Rework the storefront as a modern specialist cigar shop, preserving the existing footer. shadcn-svelte foundation is installed; follow the [design direction](./design-direction.md) and the [route-by-route migration plan](./ui-migration-plan.md) to replace DaisyUI and apply the new principles.

## Later

- **[FEATURE]** Zigarren-Sammler-Plattform ("Vivino model"): personal cigar log (tasted/cellar/wishlist/ordered) with tasting notes, community "Missing Cigar" requests with upvotes, public connoisseur profile with statistics and badges, social follow system and feed
- **[FEATURE]** Abo-Box: monthly curated delivery box ("Box of the Month") with Mollie recurring payments (check Mollie's rules for tobacco first)
- **[FEATURE]** Expert-Content: `/guides` route with cigar guides, strength levels, vitola explanations, pairing recommendations (cigar + rum/whisky)
- **[FEATURE]** Treueprogramm: points for purchases, reviews, birthday - redeemable as discount or free item
- **[FEATURE]** B2B-Portal: separate area for restaurants/bars/tobacco retailers with bulk pricing, minimum order quantities, and invoice payment

---

- ~~**[FEATURE]** Stripe payment gateway - Embedded Checkout, Kreditkarte + Banküberweisung~~ (removed again, replaced by the Mollie plan)
