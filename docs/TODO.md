# Zigarren Puro - TODO

Reviewed against the repository on 2026-10-31. This is the short task index; [outstanding-work.md](./outstanding-work.md) tracks the detailed backend and launch work, and the [UI migration plan](./ui-migration-plan.md) tracks the redesign. Work currently being changed by another agent is not counted as complete here.

## Now

- **[INFRA]** Run `bun run db:push` for the new order and newsletter columns and tables (see [outstanding-work.md](./outstanding-work.md), section 4)
- **[INFRA]** Delete the unused `STRIPE_*` lines from `.env` (local and server)
- **[PAYMENT]** Implement Mollie after provider approval and configure real bank details before enabling bank transfer. Stripe removal is complete; Mollie integration is still open. See [outstanding-work.md](./outstanding-work.md), workstream A and decision D11

## Soon

- **[FEATURE]** Add a shared image gallery/picker to `/admin` so admins can select existing pictures. Individual product, producer and hero image uploads already exist; a reusable picker does not. See workstream J7
- **[FEATURE]** Implement reliable identity and age verification to enforce the 18+ requirement before users can purchase age-restricted products. Birth-date checks already exist; they do not verify identity. See workstream B1
- **[DESIGN]** Rework the storefront as a modern specialist cigar shop, preserving the existing footer. shadcn-svelte foundation is installed; follow the [design direction](./design-direction.md) and the [route-by-route migration plan](./ui-migration-plan.md) to replace DaisyUI and apply the new principles.

## Verified complete in code

- [x] Install the shadcn-svelte foundation, owned primitives and storefront tokens. Page migration and DaisyUI removal remain open in the [UI migration plan](./ui-migration-plan.md).
- [x] Fix SQLite search and product-review queries, with regression tests in `tests/routes.test.ts`.
- [x] Make desktop/mobile header search submit to `/search?q=` and remove unsupported main-navigation destinations.
- [x] Add atomic stock reservation/release, sequential order numbers, order-item snapshots and VAT calculation. Covered by `tests/orders.test.ts` and `tests/vat.test.ts`; tax-rate confirmation and invoices remain open.
- [x] Add unpaid-order deadlines, expiry, reminder claims and scheduled reminder/cancellation emails. Query behavior is covered by `tests/orderExpiry.test.ts`; SMTP delivery and deployment are not verified here.
- [x] Add newsletter double opt-in, confirmation and unsubscribe behavior, plus honest footer success/error feedback. Backend behavior is covered by `tests/newsletter.test.ts`; broadcasts and the subscriber admin remain open.
- [x] Add the idempotent development catalogue seed and the Bun SQLite schema-push command, covered by `tests/seed.test.ts` and `tests/db-push.test.ts`. This does not confirm the schema has been applied on the server or the customer's catalogue imported.

## Later

- **[FEATURE]** Zigarren-Sammler-Plattform ("Vivino model"): personal cigar log (tasted/cellar/wishlist/ordered) with tasting notes, community "Missing Cigar" requests with upvotes, public connoisseur profile with statistics and badges, social follow system and feed
- **[FEATURE]** Abo-Box: monthly curated delivery box ("Box of the Month") with Mollie recurring payments (check Mollie's rules for tobacco first)
- **[FEATURE]** Expert-Content: `/guides` route with cigar guides, strength levels, vitola explanations, pairing recommendations (cigar + rum/whisky)
- **[FEATURE]** Treueprogramm: points for purchases, reviews, birthday - redeemable as discount or free item
- **[FEATURE]** B2B-Portal: separate area for restaurants/bars/tobacco retailers with bulk pricing, minimum order quantities, and invoice payment

---

- ~~**[FEATURE]** Stripe payment gateway - Embedded Checkout, Kreditkarte + Banküberweisung~~ (removed again, replaced by the Mollie plan)
