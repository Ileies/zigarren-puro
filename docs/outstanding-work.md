# Zigarren Puro: outstanding work

Status as of 2026-10-31. This document consolidates what is still open. It is based on four inputs:

1. The customer's original concept, `.resources/_Webshop.pdf` (19 pages of annotated wireframes).
2. A code audit of the repository (routes, schema, checkout, hooks, components), including a few behaviour checks against SQLite and `bun run check`.
3. The existing plans: [`TODO.md`](./TODO.md), [`design-direction.md`](./design-direction.md) and [`ui-migration-plan.md`](./ui-migration-plan.md).
4. Desk research on competing cigar shops, Mollie and German tobacco/alcohol rules (section 9 lists its limits).

It does not replace the UI migration plan. The migration plan stays the detailed spec for the visual rework (workstream D below). This document adds everything around it: bugs, payments, compliance, catalogue data, features from the customer's concept, operations and content.

**Payment decision:** the payment provider is **Mollie**, not Stripe. Stripe does not stay live and has been removed from the code (checkout, webhook route, env schema, packages). All Stripe items in `TODO.md` are obsolete (see workstream A).

## How to read this

Priorities:

- **P0** - broken or blocking. Nothing else is meaningful before this is fixed.
- **P1** - required for a legally and commercially sound launch.
- **P2** - important, shortly after launch.
- **P3** - later or optional.

Tasks are unchecked boxes. "Verify" means: I could not confirm it from the code or sources and it needs a look or a decision.

---

## 1. Summary

The shop has solid foundations: accounts, sessions, addresses, a cart, bank-transfer and card checkout, order emails, an admin area for inventory, producers, orders, customers and editable content, five-language i18n infrastructure, error pages, a distinctive footer and a new shadcn-svelte foundation. `bun run check` passes with 0 errors.

It is not launchable yet, for five reasons:

1. **Two core pages are broken at runtime** (search and product detail), because they use SQL functions SQLite does not have. The type checker cannot see this.
2. **There is no working payment path.** Stripe has been removed, bank transfer is switched off until the real IBAN is entered, and the Mollie plan has an unresolved risk: it is not confirmed that Mollie accepts a tobacco and Cuban-cigar merchant.
3. **Compliance is thin.** Age verification relies on a self-declared birth date, and German online tobacco advertising rules may conflict with parts of the customer's concept and with some UI that already exists.
4. **The catalogue is empty and the data model is too small** for what the customer wants to offer (filters by aroma, smoking time, pack sizes, and so on).
5. **Order handling is incomplete:** stock is never decremented, VAT is hardcoded to 0, there are no invoices, no shipping notification and no tracking.

---

## 2. Decisions needed from the customer and the team

These block or shape work below. Ask early, in this order.

| #   | Question                                                                                                                                                                                                                                                       | Blocks                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| D1  | **Does Mollie accept this business?** Get written confirmation from Mollie that cigars (including Cuban origin), cigarillos and spirits are approved, and which payment methods are enabled for tobacco. See A1.                                               | All of workstream A          |
| D2  | **Germany only at launch?** Research recommends yes. Cross-border tobacco distance sales need an authority registration, an age-verification system and destination-country tax. The wireframe itself asks "Versand innerhalb der EU erlaubt???? glaube nein". | Checkout, shipping page      |
| D3  | **Which age-verification method?** Options in B1. This affects cost per order and conversion.                                                                                                                                                                  | Checkout, accounts           |
| D4  | **Legal review of advertising.** One lawyer review of the planned content: "Sale", "Neuheiten", "Empfehlung der Woche", "Zigarre des Monats", brand carousels, awards, discount banners, promotional newsletters. See B2.                                      | Homepage, header, newsletter |
| D5  | **Commercial terms:** free-shipping threshold (code says 150 EUR, the wireframe shows 49 EUR copied from another shop), shipping costs, the "3 % discount on whole boxes" from the wireframe, express shipping.                                                | Cart, checkout, copy         |
| D6  | **Pack sizes.** Which products are sold as single cigar, 5-pack, box? Who maintains this data and from which source (supplier lists)?                                                                                                                          | Catalogue model              |
| D7  | **Languages.** The wireframe asks "Chinesisch? Arabisch? Türkisch?". Current locales are DE, EN, AR, CN and RU. Is Turkish wanted? Are all five actually needed for launch, given most pages are German only today?                                            | i18n scope                   |
| D8  | **Out-of-scope product groups from the wireframe:** pipes, pipe tobacco, shisha tobacco, e-cigarettes, gift ideas, sale. Which are in the first release? Research suggests skipping e-cigarettes in phase 1 (extra duties, payment restrictions).              | Catalogue, navigation        |
| D9  | **Loyalty programme** (points, bronze/silver/gold/platinum tiers): launch feature or later? It also touches advertising rules.                                                                                                                                 | Workstream H                 |
| D10 | **Content and imagery:** the wireframe notes "Bilder müssen besorgt werden" for most sections. Who supplies brand logos, product photos (with usage rights) and the humidor photos?                                                                            | Homepage, catalogue          |
| D11 | **Bank details and company data:** the real IBAN/BIC (still placeholders), VAT ID, register entry for the imprint.                                                                                                                                             | Checkout, legal pages        |

---

## 3. Customer concept versus current state

Source: `_Webshop.pdf`. "Done" means present in the code. It does not mean polished or compliant.

### Global elements

| Concept item                                                                                                   | State       | Notes                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Top service bar (3 % box discount, free shipping threshold, DHL), language switch DE/EN, social icons          | Partial     | Language selector and social icons exist. The service line must match real terms (D5).                                                     |
| Header: logo, search, account, cart widget                                                                     | Partial     | Search inputs submit to `/search?q=`. The links with unsupported parameters (`?t=`, `?flag=sale`) are removed. See B/D workstreams.        |
| Main navigation: Zigarren, Zigarillos, Pfeifen & Tabak, Zubehör, Spirituosen, Geschenkidee, Sale, News & Infos | Partial     | Cigars, cigarillos, accessories, spirits link to `/shop?type=`. Pipes, gifts and sale point to nothing real. News exists as a static page. |
| Mega menu (Ebene 1): countries, popular brands, strength, aroma, "Sonstiges"                                   | Not started | Currently a flat list.                                                                                                                     |
| Footer: address, hours, links, awards, 18+ notice, social, payment marks, newsletter                           | Done        | Preserved as the visual anchor. Payment marks now show only the methods that are live (bank transfer). Extend after D1.                    |
| Newsletter block                                                                                               | Partial     | Guests and customers subscribe with a double opt-in. No send mechanism yet, copy still promotional. See B4.                                |
| Trusted Shops / Käuferschutz badge, "Top Shop" seals                                                           | Not started | Needs a decision and an account.                                                                                                           |

### Homepage

| Concept item                                                                                 | State       | Notes                                                                                                                                           |
| -------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Dynamic rotating banner with link to product ("Mehr Info")                                   | Partial     | A gallery carousel exists. Content is static assets. The design direction recommends removing automatic carousels, and B2 may restrict banners. |
| Brand strip (Rocky Patel, Flor de Copan, Macanudo, ...)                                      | Done        | `AllBrandsCarousel` with 27 logos. Links to working brand pages are missing (no brand pages yet).                                               |
| Featured tiles (Vegafina, Kubanische Zigarren, Kubanische Zigarillos)                        | Partial     | `FeaturedBrands` exists. Destinations are not real catalogue filters.                                                                           |
| Partner logos (Davidoff, Laura Chavin, John Aylesbury, Capitol, Arnold André, Flor de Copan) | Partial     | Partly covered by the brand carousel.                                                                                                           |
| Pipes, cigars, pipe tobacco, accessories tiles, "Empfehlung der Woche"                       | Not started | `Recommendations.svelte` uses hardcoded products. Needs real catalogue data and a legal check (B2).                                             |
| Neuheiten, Zigarre des Monats, Zigarillo des Monats, Zigarren-Sampler tiles                  | Not started | Needs curation workflow in admin.                                                                                                               |
| Workshops, "Zigarrendreher auf Ihrer Veranstaltung", Tastings                                | Partial     | `/tastings` and the `Tasting` component exist. No booking or enquiry flow.                                                                      |
| Whisky, Rum, Gin tiles                                                                       | Partial     | `Spirits.svelte` exists. Beverage types in the schema: wine, whiskey, rum, cognac, vodka. No gin.                                               |
| Walk-in humidor story, store address and hours                                               | Partial     | Exists in `about` and footer. Real photography needed (D10).                                                                                    |

### Category and origin pages (Ebene 1 and 2)

| Concept item                                                                                                                                                    | State       | Notes                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| Category landing with SEO text and sidebar of origin countries (Kuba, Dom. Rep., Honduras, Nicaragua, Peru, Costa Rica, Mexiko, Brasilien/Sumatra, Niederlande) | Not started | `/shop` is one flat page with a type filter.                                                     |
| Origin landing pages with intro text, flags, brand list                                                                                                         | Not started | Needs origin as a first-class, filterable attribute (it is stored per cigar today).              |
| Filters: Format, Preis, Stärke, Aroma, Hersteller, Herkunft, Ringmaß, Durchmesser, Länge, Rauchdauer, weitere Eigenschaften, Bewertung                          | Not started | Only type and sort exist. Schema lacks aroma, smoking time and format. See workstream C.         |
| Sorting                                                                                                                                                         | Partial     | Name and price only.                                                                             |
| Pagination                                                                                                                                                      | Not started | The whole catalogue is loaded at once.                                                           |
| Strength classes: Sehr mild, Mild, Mittelkräftig, Stark                                                                                                         | Partial     | Schema has three values (mild, medium, full). The customer wants four, and competitors use more. |
| Aroma classes: aromatisierte vs. naturbelassene Zigarillos                                                                                                      | Not started | `filterType` is about filters, not flavouring. A flavoured flag is missing.                      |
| Plain "Zigarillos" category, with "Was ist anders als bei Zigarren?" content                                                                                    | Partial     | Product type exists. Content is not written.                                                     |

### Product listing cards and product page (Ebene 3)

| Concept item                                                                                                                       | State       | Notes                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| Card: image, brand, name, rating, strength/aroma scales, length, ring gauge, price                                                 | Not started | Cards show a package icon, name, producer, price and stock badge only.                            |
| Several pack sizes per product (single, 5-pack, box) with price, quantity field, stock per size                                    | Not started | One price and one stock per product. See C2.                                                      |
| "In den Warenkorb" disabled until a quantity is entered; sold out greyed out                                                       | Partial     | Sold out is handled. No per-size quantity.                                                        |
| Sale and "neu" corner ribbons                                                                                                      | Not started | Needs legal clearance (B2). Price-reduction labels also need the 30-day lowest price (PAngV §11). |
| Product page: gallery, description, "Teilen", zoom                                                                                 | Partial     | One image, no gallery, no zoom, no share.                                                         |
| Info block: Deckblatt/Umblatt/Einlage origin, filler type, hand made, flavoured, box-pressed, manufacturer taste notes             | Partial     | Only origin, length, ring gauge, strength, wrapper, ageing exist.                                 |
| Customer aroma ratings (average per aroma) and sub-ratings (Verarbeitung, Abbrand, Zugwiderstand, Rauchvolumen, Intensität, Aroma) | Not started | Reviews have one star rating, a title and a body.                                                 |
| Customer "Fazit" text                                                                                                              | Done        | Review title and body.                                                                            |
| "Produkte mit ähnlichem Aroma anzeigen"                                                                                            | Not started | Needs aroma data.                                                                                 |
| Wishlist ("Zigarren im Humidor speichern für zukünftige Bestellungen")                                                             | Partial     | Wishlist exists. No humidor concept, no "reorder" shortcuts.                                      |
| Spirits product page with "Über [Marke]" brand story and "Kunden kauften auch"                                                     | Not started | Producer has a description. No brand page, no cross-sell.                                         |
| "Product not available? Tell us, we will search for it"                                                                            | Not started | Easy win. See E7.                                                                                 |
| Trust block: free shipping, dispatch next day, secure packaging, "all goods taxed and shipped within the EU"                       | Not started | The last claim conflicts with D2. Do not publish it as drawn.                                     |

### Account, loyalty, other

| Concept item                                                               | State       | Notes                                                               |
| -------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------- |
| Account, orders, addresses, wishlist                                       | Done        | Account area exists.                                                |
| Cart                                                                       | Done        | Cookie-based.                                                       |
| No PayPal for tobacco and Cuban goods                                      | Done        | PayPal is not offered. Keep it that way.                            |
| Points programme with membership levels (bronze to platinum, "VIP-Lounge") | Not started | See H1 and D9.                                                      |
| "Zigarre des Jahres" and Cigar Journal partner block                       | Not started | Editorial block, needs rights to the imagery.                       |
| Pipes, Pfeifenzubehör, Shisha                                              | Not started | See D8.                                                             |
| Age notice "Ab 18" on products                                             | Partial     | Footer notice and registration check exist. No per-product warning. |

---

## 4. Verified defects (fix first)

Found by reading code and running the queries against SQLite 3.53 through `bun:sqlite`.

- [x] **P0 Search is broken.** `src/routes/search/+page.server.ts` uses drizzle's `ilike`, which emits `... ilike ?`. SQLite has no `ILIKE`, so any request with `q` fails with `near "ilike": syntax error`. Replace with `lower(col) like lower(?)` (or `like` with `COLLATE NOCASE`) and escape `%` and `_` in the user input. Consider FTS5 for ranking and umlaut/diacritic folding later.
- [x] **P0 Product detail page is broken.** `src/routes/products/[id]/+page.server.ts` builds `reviewerName` with `LEFT(...)`. SQLite has no `LEFT`, so the review query fails with `no such function: LEFT` on every product page, even without reviews. Use `substr(last_name, 1, 1)`.
- [x] **P0 Add regression tests that execute the real queries** against a temporary SQLite file (search, product detail, shop filters). Type checks and builds pass today despite both bugs.
- [x] **P0 Stock is never decremented.** `checkout/+page.server.ts` validates stock but never reduces it, neither at order creation nor in the payment webhook. Overselling is possible. Decrement atomically (`UPDATE ... SET stock = stock - ? WHERE id = ? AND stock >= ?`) inside one transaction with order creation, and release stock when an unpaid order expires or fails.
- [x] **P0 Cart is cleared before payment succeeds.** `setCart(cookies, [])` runs when the order is created. If the card payment is abandoned, the cart is gone and an orphaned `pending` order stays forever. Clear the cart only after confirmed payment (or on return from a paid status), and expire stale pending orders with a scheduled job.
- [ ] **P0 Placeholder bank data.** `src/lib/config.ts` still has `DE00 0000 ...` and `XXXXXXXX`. Mitigated: bank transfer is hidden at checkout and rejected by the server while the IBAN is a placeholder (`bankTransferAvailable`). Still open: enter the real IBAN and BIC (D11), which switches bank transfer on.
- [x] **P1 VAT is hardcoded to 0.** Orders now store the VAT contained in the gross prices (`taxAmount`), and every order item stores its VAT rate. Rates live in `vatRates` in `src/lib/config.ts` (19 % for all four product types). Still open: confirm the rates with the tax adviser, and show the VAT split per rate on invoices (workstream F).
- [x] **P1 Order identifiers are UUIDs.** Orders get a sequential number starting at `ZP-10001`, shown in emails, the bank transfer reference, the confirmation page, the account and the admin. Orders created before this change have none and show a short id.
- [x] **P1 Server messages are hardcoded German** in checkout, account, auth and review actions. The 30 form error messages are now keys in `messages/serverErrors.json` (all five languages), and the actions call `m.errXxx()`, which answers in the visitor's language because `handleLocale` wraps every request in `runWithLocale`. Still open: the `error(404, ...)` texts in `products/[id]` and the admin routes (the account order page is translated now), the German-only emails, and the hardcoded labels in several Svelte pages ("Mein Konto", "Warenkorb", "Anmelden" in the header, the search page). The ru, ar and cn texts are my translations and should be read by a native speaker before launch.
- [ ] **P2 Saved addresses cannot be deleted once an order used them.** Orders point to the address row and keep no copy, so deleting it would break the order page. The account now refuses with a message (`errAddressInUse`), which is safe but not friendly. Better: copy the address into the order at checkout (or add an `archivedAt` flag), then let the customer delete or hide any address. Needs a schema change and `db:push`. The same copy would also keep old orders correct if an address is ever edited.
- [ ] **P1 Checkout hardcodes `country: 'DE'`** for new addresses (the constant `ADDRESS_COUNTRY` in `src/lib/server/checkout.ts`), while `/shipping` advertises EU delivery with transit times and carriers. Align after D2.
- [x] **P1 Payment marks in the footer** listed cards, Nachnahme, Klarna and SEPA, which are not implemented. The footer now shows only "Vorkasse", and only while bank transfer is available (`bankTransferAvailable`). With no method live the whole block is hidden. Add the other marks back with the Mollie integration (A3), the icons are still in `static/payment-methods`.
- [x] **P1 Header and nav links point to nothing:** the pipes and tobacco, gifts and sale links (`/search?t=...`, `/search?flag=sale`) are removed from the main navigation. Add them back when the catalogue has these groups (D8) and, for sale, after the advertising review (B2). The message keys `pipestobacco`, `gifts` and `sale` are still in `messages/` for that. The header search inputs (desktop and mobile) are now GET forms to `/search?q=...`. Still open: suggestions and filters on the result page (E1).
- [x] **P1 Newsletter subscription silently does nothing for guests.** Guests can now subscribe with a double opt-in (new `newsletter_subscribers` table, confirmation mail, working unsubscribe link). The footer form also shows an error for an invalid address instead of a false success. Still open: see B4.
- [ ] **P2 Admin dashboard and tables are German only and DaisyUI based.** German only is acceptable for staff. The look, the missing settings and the form quality are tracked in workstream J (admin back office), which also replaces the Phase 6 note in workstream D.
- [x] **P2 Admin inventory list shows raw product types.** `typeLabels` in `src/routes/admin/inventory/+page.svelte` was keyed `CIGAR`, `CIGARILLO` and so on, but the stored values are lowercase (`cigar`), so the Typ column showed `cigar` instead of "Zigarre". The keys are lowercase now.
- [x] **P2 Repo hygiene:** `CLAUDE.md` now links `docs/TODO.md`, and `README.md`, `CLAUDE.md`, `docs/TODO.md` and `docs/ui-migration-plan.md` no longer name Stripe as a live provider (the struck-through history line in `docs/TODO.md` stays). Still open: `CLAUDE.md` describes the project in German and has other parts that may be out of date (for example the order and newsletter tables), review it once the schema settles.
- [ ] **P1 No online payment path.** Stripe is removed and bank transfer is gated on the real IBAN (D11), so checkout currently shows a "not possible yet" notice and the submit button is disabled. Going live needs either the real IBAN (bank transfer only) or the Mollie integration (workstream A).
- [x] **P1 Unpaid bank-transfer orders hold their stock forever.** Bank-transfer orders now store `paymentDueAt` (created at + `bankAccount.paymentDeadlineDays`, 7 days, which the terms already state). The confirmation email and page show the deadline and say the order is cancelled after it, and the admin order list shows "Zahlbar bis" or "Überfällig seit". The sweep also sends a reminder two days before the deadline and a cancellation email when it cancels (see the notes below). Confirm the 7 days with the customer in D11.
- [x] **P1 No scheduled expiry sweep.** `expireOverdueOrders` in `orders.ts` cancels every unpaid order past its deadline and returns the stock, through `cancelUnpaidOrder`. `startOrderSweep` (`src/lib/server/orderSweep.ts`) runs it at startup and every 15 minutes from the SvelteKit `init` hook in `hooks.server.ts`. It is guarded against double start (dev reloads) and logs failures to the console. Still open: the Mollie payment expiry (A2) should use the same function once online payments store a deadline, and `expireStaleCardOrders` and `cancelPendingCardOrders` are still unused until then.
- [ ] **P1 Checkout UI is still DaisyUI and has one payment method.** The page still uses the old two-step DaisyUI layout with a hardcoded bank-transfer option. Phase 4 of the UI migration (workstream D) rewrites it with shadcn-svelte, the age-verification step (B1) and the Mollie redirect (A2). Until then only fix defects there, do not restyle.
- [ ] **P1 Test coverage is partial.** There are tests for search, shop, product page, cart loader, the stock and order logic, the checkout order placement (`tests/checkout.test.ts`: totals, shipping, address resolution and ownership, age check, payment gate, stock failures), accounts (`tests/accounts.test.ts`: login and lockout, registration, password reset, email verification, sessions) the admin (`tests/admin.test.ts`: inventory list, filters, paging and stock, product create and update, order list with search, filters, presets and paging, status changes with their rules, emails and history, internal notes, customers, and `tests/adminContent.test.ts`: producers, the content forms, the image uploads and the deletes of producers and products) and the account pages (`tests/account.test.ts`: profile, password and email change, the confirmation link, addresses, wishlist, orders). The checkout and account logic lives in `src/lib/server/checkout.ts` and `accounts.ts` so `bun test` can load it, the routes only translate errors, set cookies and send emails. The admin tests call the route loaders and actions directly. The account and admin order tests replace the mail sender (it needs the SvelteKit runtime) with the stand-in in `tests/mail.ts`, which records the call and can be told to fail, and uploads go to a temporary folder (`UPLOADS_DIR`). Missing: the Svelte pages and their form wiring, the email templates and real sending, the sweep wiring, and an end-to-end purchase test (Playwright, workstream I). The route tests also import `#lib/messages.js`, which is generated, so run `bun run build` once on a fresh clone before `bun test`.

---

**Milestone 0 implementation notes (2026-10-31):**

- Search and product page queries fixed. `bun test` runs tests against a temporary SQLite file (`tests/`): search, shop, product page, cart loader, and the stock and order logic in `src/lib/server/orders.ts` (25 at the end of Milestone 0, 42 after Milestone 1). The missing coverage is listed above as a task.
- Stock is taken in the same transaction that creates the order. It is returned when an unpaid order is cancelled (`cancelUnpaidOrder`) or an admin cancels an order. Reviving a cancelled order takes the stock again and fails if it is gone.
- The cart is cleared when a bank-transfer order is created. The confirmation page also clears it for any order that is not cancelled or failed, which the Mollie return flow will rely on.
- **Stripe removed (2026-10-31):** the embedded checkout and step 3, the webhook route `src/routes/api/stripe/webhook`, the `CSRF_EXEMPT` list in `hooks.server.ts`, the three Stripe variables in `src/env.ts`, and the `stripe` and `@stripe/stripe-js` packages. Left for the Mollie work on purpose, because they are provider-neutral or need a schema change: the `stripeSessionId` column and `markOrderPaid` (idempotent paid transition, looks the order up by that column), `cancelPendingCardOrders`, `expireStaleCardOrders`, and `PaymentMethod.CREDIT_CARD` with its message strings. Customer-facing copy that names Stripe (privacy section 6, terms, FAQ) is also unchanged, see the task in workstream A.
- The four `STRIPE_*` lines in the local and server `.env` files are unused now and should be deleted by hand.

**Milestone 1 implementation notes (2026-10-31), step 6 and the dev seed:**

- Done: order numbers, VAT handling and order item snapshots (step 6), plus the development seed script (part of C1). `src/lib/vat.ts` splits gross prices into net and VAT per rate (shipping is spread over the rates in proportion to the goods), `src/lib/orderNumber.ts` formats the number, and `createOrderReservingStock` assigns the number and writes the snapshots inside the same transaction as the stock reservation.
- **Schema change, apply with `db:push`:** four new nullable columns (`orders.order_number`, `order_items.product_name`, `sku`, `vat_rate`) and a unique index on `order_number`. A dry run on a copy of `local.db` produced only `ALTER TABLE ... ADD` and `CREATE UNIQUE INDEX`, with no data loss. Older orders keep null values and the pages fall back to the live product name and a short id. The `drizzle-kit push` CLI could not connect to SQLite in this environment ("Please install either better-sqlite3 or @libsql/client"), so run it where it works for you and check the output before confirming.
- The VAT rates (19 %) are an assumption until the tax adviser confirms them. Prices are treated as gross, so the order total did not change, only the VAT part that is stored and shown ("Enthaltene MwSt." on the order pages and in the email).
- Not done in Milestone 1: **variants and detail extensions (step 4, C2)** are waiting for D6 (which pack sizes exist) and the strength scale decision, and they break cart cookies, orders and the admin forms. The **catalogue import (step 5, C1)** is waiting for the customer's product list, and its CSV format depends on the variant model, so it should follow step 4. **Generated migrations** are still open (workstream I), and need a baseline for the existing live database before the variants change.
- Tests: 42 in total, adding VAT maths, order numbers, snapshots and the seed (including that every seeded product opens on its product page). The checkout order placement was untested at that point because it imported SvelteKit-only modules, it is covered now (see the coverage task above).

**Milestone 2 implementation notes (2026-10-31), newsletter double opt-in (B4):**

- Done: `newsletter_subscribers` table, `src/lib/server/newsletter.ts` (request, confirm, unsubscribe, withdraw), confirmation and welcome emails, `/newsletter/confirm` page, subscriber fallback on `/unsubscribe`, and a footer error state. Messages `newsletterSuccess` (now asks to confirm) and `newsletterError` are in all five languages. The `List-Unsubscribe` header set by a caller is no longer overwritten by `sendMail`.
- **Schema change, apply with `db:push`:** one new table, `newsletter_subscribers`. No existing table changes.
- Behaviour: the form answers the same way for new, pending and confirmed addresses, so it does not reveal who subscribed. A repeated request inside 10 minutes sends nothing, a later one sends a fresh link and voids the old one. Links last 48 hours. Opening the confirmation link only shows a page, a button press confirms, so mail scanners cannot subscribe anyone. Confirming also turns on `marketingConsent` for a customer with the same email, and every unsubscribe path turns it off.
- Not done: the open items under B4 (content decision, send mechanism, admin view, rate limiting, retention). The existing `unsubscribe` page still unsubscribes on a plain GET, which a link scanner can trigger. Revisit it together with the send mechanism.
- Not done in this chunk: the **unpaid-order expiry and scheduled sweep** (section 4) and **age verification (B1)**. The sweep is independent of Mollie but needs the payment deadline decision, B1 needs D3.
- Tests: 52 in total, ten new ones in `tests/newsletter.test.ts` (confirmation, cooldown, expiry, single use, customer consent sync, unsubscribe, re-subscribe). The two server actions import SvelteKit-only modules and are not covered by `bun test`.
- Lint: `bun run lint` fails on two things that were already there, `scripts/entry.cjs` (`require` imports) and Prettier formatting of this document before this change. The document is now formatted.

**Milestone 2 implementation notes (2026-10-31), unpaid-order expiry:**

- Done: payment deadline on orders, `expireOverdueOrders`, the 15 minute in-process sweep, deadline in the email, confirmation page and admin list. An admin who revives a cancelled unpaid order gets a fresh deadline, otherwise the next sweep would cancel it again.
- **Schema change, apply with `db:push`:** one new nullable column, `orders.payment_due_at`. Orders created before this change have no deadline, so the sweep never cancels them. Cancel those by hand if they are stale.
- Until `db:push` has run, the sweep fails every 15 minutes with a console error (it does not stop the server). Every query that selects whole orders (checkout confirmation, account, admin) fails without the column too, so push before deploying.
- The sweep runs inside the web process. With more than one server process each runs it, which is harmless because `cancelUnpaidOrder` only acts on orders that are still unpaid, but it is wasted work. Under Passenger the process may be stopped when idle, in which case overdue orders wait until the next start. Move it to a systemd timer or cron job if that matters.
- A "payment received" email for the admin status change exists now, see the admin orders notes below. The Mollie webhook still has to send it too (workstream F).
- Tests: nine in `tests/orderExpiry.test.ts` (deadline length, cancel only overdue unpaid, paid and legacy orders untouched, repeat runs, injected clock, revived order). The scheduler itself and the `init` hook are not covered by `bun test`.
- Lint and build pass. `scripts/entry.cjs` is deleted in the working tree (not by me), which is why lint no longer reports it.

**Milestone 2 implementation notes (2026-10-31), unpaid-order emails:**

- Done: the sweep now also emails the customer. Two days before the deadline (or half the period if it is shorter) a bank-transfer order that is still unpaid gets a payment reminder with the bank details. When the sweep cancels an order, the customer gets a cancellation email. Both are German only like the other emails, and the reminder says to ignore it if the customer has already paid.
- **Schema change, apply with `db:push`:** one new nullable column, `orders.payment_reminder_sent_at`. Without it the sweep fails and every query that selects whole orders fails too, same as for `payment_due_at`.
- Behaviour: `claimPaymentReminders` marks an order as reminded before the email goes out, so an SMTP failure loses that one reminder instead of repeating it every 15 minutes (the failure is logged to the console). The same holds for several processes, only one of them gets the order. Orders without a deadline, paid, cancelled and card orders are not reminded, and an order that expires in the same run is cancelled, not reminded. An admin who revives a cancelled order resets the flag, so the new deadline gets its own reminder. `expireOverdueOrders` now returns the cancelled order ids instead of a count.
- Not covered by `bun test`: the email templates and the sweep wiring, because `functions.ts` imports SvelteKit-only modules. The queries behind them are tested (six new tests, 67 in total).
- Cancellation by an admin sends no email. That is the "cancelled" and "refunded" email in workstream F. (Cancellation and "payment received" are done, see the admin orders notes below. "Refunded" waits for Mollie.)

**Admin orders and inventory notes (2026-10-31):**

- **Schema change, apply with `db:push`:** one new table `order_events` and one new nullable column `orders.internal_note`. Both are additions. Until `db:push` has run, every query that selects whole orders fails, so push before deploying. `src/lib/server/db/bootstrap.json` is regenerated by `bun run build` and contains both.
- **Timestamp bug fixed.** The columns were declared `mode: 'timestamp'` (whole seconds), but `defaultNow()` writes milliseconds, so every row created through a default (order and customer `created_at`, and more) read back as the year 58803 and the dates in the admin and on the account pages were wrong. All timestamp columns are now `timestamp_ms`. This changes no table definition, so `db:push` has nothing to do for it. Rows that already exist in a development database mix both units, so recreate it with `db:seed` or fix the old values by hand. There is no production data yet. `tests/accounts.test.ts` no longer expects seconds.
- Status rules, history, internal note, both customer emails, the order list filters and the inventory list paging are described in J5 and J6 below. The new pure pieces are `transitionProblem`, `customerNotices`, `orderHistory` and `saveInternalNote` in `orders.ts`, so they run under `bun test`.
- Behaviour change: the admin can no longer jump from pending straight to shipped (confirm first), cannot ship an unpaid order, cannot cancel a shipped or delivered one, and cannot touch a refunded order. Code that called `applyOrderStatus` with 3 arguments keeps working, it now returns `{ from }` instead of `true` and throws `InvalidTransitionError` for a refused change.
- Not verified: no browser check of the three pages, no real email, the `confirm()` dialog for cancelling and the `use:enhance` wiring of the note form.

---

## 5. Workstreams

### A. Payments: replace Stripe with Mollie

**A1. Confirm Mollie accepts the business (P0, blocks everything below).**

- [ ] Ask Mollie in writing about cigars, cigarillos, Cuban-origin goods and spirits: approval, conditions, enabled methods, and whether the Cuban range is a problem. Reasons for caution from the research:
  - Mollie's own prohibited-products list could not be read (the help page returned 403). Mollie's API does list a `TOBACCO_PRODUCTS` business category, but that is not approval.
  - A 2022 merchant forum post quoting Mollie says tobacco is possible only with few methods, and that cards and Klarna are not available for tobacco. That predates Giropay's shutdown in 2024, so the current method set for tobacco is unknown.
  - Apple Pay is reported as excluded for tobacco.
  - Klarna's own Mollie policy restricts tobacco and prohibits goods from sanctioned countries, and it names Cuba. That is Klarna's policy, not Mollie's, but it needs an explicit answer.
- [ ] If Mollie declines or allows only bank transfer, decide the fallback early (see A6). Do not build the whole integration before this answer.

**A2. Integration design (after A1).**

- [ ] Use the **Payments API**, not the Orders API (reported as deprecated). Payments accept `lines` and `billingAddress`.
- [ ] SDK choice: `@mollie/api-client` is tested on Bun, but the legacy SDK is reported to enter maintenance mode between Nov 2026 and Feb 2027 (two sources disagree). The new generated `mollie-api-typescript` is installable but Bun support is unconfirmed. Plain `fetch` against the REST API is a safe, small alternative. Verify before choosing.
- [ ] Add **Mollie hosted checkout (redirect flow)** to the checkout: create payment with `redirectUrl`, `webhookUrl`, `metadata.orderId`, `description`; redirect the customer. The Stripe embedded checkout, step 3 and `@stripe/stripe-js` are already removed.
- [ ] Send an `Idempotency-Key` (UUID) on every POST (keys are cached for one hour; same key with different parameters returns 400).
- [ ] **Webhook handler** (a `+server.ts` is already an accepted exception for Stripe): Mollie POSTs only a form-encoded `id` (`tr_...`). Fetch the payment from Mollie, map its status to the order, and respond `200` within 15 seconds, including for unknown IDs. Make it idempotent: `markOrderPaid` in `orders.ts` already returns the order only on the first call, so duplicate deliveries send one confirmation email. Re-key it from `stripeSessionId` to the new `paymentReference`. The Stripe webhook route is deleted, and so is the `CSRF_EXEMPT` list in `hooks.server.ts`, so reintroduce an exemption for the new webhook path.
- [ ] The return page must not trust the redirect: read the order status from the DB (set by the webhook) and show "payment pending" when the webhook has not arrived yet. Mollie's retries run up to about 26 hours.
- [ ] Order data model: replace the now unused `stripeSessionId` column with a provider-neutral `paymentProvider` and `paymentReference` column. Keep `PaymentStatus` and add `expired` and `canceled` states. Run `bun run db:push` carefully against production data.
- [ ] Payment expiry: store the expiry and release reserved stock when a payment expires or fails. The release logic exists (`cancelUnpaidOrder`), the scheduled trigger is a separate task in section 4.
- [ ] Environment variables: `MOLLIE_API_KEY` (test and live), webhook base URL. Local testing needs a tunnel because Mollie cannot reach localhost. The Stripe variables and dependency are already removed from the code.
- [ ] **Customer-facing copy that names Stripe:** privacy policy section 6 ("Stripe (Kreditkarte)"), terms (payment methods) and the FAQ ("via Stripe"). It also lists PayPal and cryptocurrencies, which are not planned. Rewrite once A1 and A3 settle which methods and which processor apply. The privacy text needs Mollie's processor details and should be checked by the legal reviewer.

**A3. Payment methods.**

- [ ] Enable only what Mollie approves for tobacco. Candidates from the research: cards, SEPA bank transfer, "Mit Mollie Banküberweisung bezahlen", SEPA direct debit, Przelewy24 (irrelevant for Germany-only), Wero (beta, German availability planned for Q3 2026 and unconfirmed).
- [ ] Not available or not wanted: PayPal (customer decision), Apple Pay (reported excluded), Klarna (see A1). Google Pay unknown.
- [ ] Show payment methods and delivery restrictions at the start of the checkout, as §312j BGB requires.
- [ ] Fees for budgeting: EEA consumer cards 1.80 % + 0.25 EUR, SEPA bank transfer 0.25 EUR, Mollie bank transfer 0.45 % + 0.25 EUR, SEPA direct debit 0.35 EUR, Wero 0.90 % + 0.25 EUR (from Mollie's pricing page at research time, verify).

**A4. Refunds and reconciliation.**

- [ ] Admin action "refund" calling Mollie's refunds endpoint (full and partial). Update `PaymentStatus` and `OrderStatus`, restock when requested. Handle the "queued/pending/failed" refund states and duplicate-request 409s.
- [ ] Keep a payment event log (use the existing `Logger` or a `payment_events` table) for support cases.

**A5. Tests.**

- [ ] Test mode end to end: success, failure, cancel, expired, bank transfer pending then paid, duplicate webhook, webhook before redirect, redirect before webhook. Use Mollie's test cards and magic amounts.

**A6. Fallback if Mollie restricts methods.**

- [ ] Keep a manual prepayment (Vorkasse) path with the real IBAN and a clear payment deadline, and an admin "mark as paid" action (exists as a status dropdown). Consider cash or card payment on pickup in the Cologne store.

### B. Compliance and legal

Everything here comes from desk research and is not legal advice. Items marked "reported" come from secondary sources or search snippets. Get a lawyer (or the Händlerbund or IT-Recht-Kanzlei style service) to confirm before launch.

**B1. Age verification (P1, launch blocker).**

- Current state: the registration form takes a self-entered birth date and rejects under 18. Checkout re-checks the stored date. There is no identity-based check and no delivery-level check.
- Legal basis: §10 Abs. 3 JuSchG forbids offering or delivering tobacco to minors by mail order. §1 Abs. 4 JuSchG defines mail order as a sale without technical or other measures that ensure no shipment to minors. Spirits fall under §9 JuSchG. Nicotine-free e-cigarettes are covered by §10 Abs. 4.
- Reported: checking only an ID-card number is insufficient. A 2014 decision (OLG Frankfurt 6 U 54/14) is cited for the view that DHL "Alterssichtprüfung" is not enough and "Ident-Check ab 18" is the safe choice. This is a law-firm opinion, not binding.
- Competitor models: Noblego combines an identity check before ordering (ID number matched against Schufa, ID upload with manual approval, or a live video check), stores the result on the account, and sends via DHL with an age check at delivery and no Packstation. Several others use only a pop-up gate.
- [ ] Decide the model (D3). A reasonable minimum: verified-age flag on the customer account (provider or manual ID review in admin), plus DHL Ident-Check ab 18 at delivery, no Packstation.
- [ ] Block checkout until the account is verified. Show the requirement before the cart step.
- [ ] Add `ageVerifiedAt`, method and reviewer to `customers`, and an admin queue for manual review if used.
- [ ] Update `/shipping` and the terms to describe the real process. The shipping page already mentions delivery age verification, which must match what is actually booked at DHL.
- [ ] Verify current DHL products and prices. The research found conflicting figures.
- [ ] This closes the existing `TODO.md` item "reliable identity and age verification".

**B2. Tobacco advertising rules (P1, shapes UI and content).**

- Reported: §19 Abs. 2 and 3 TabakerzG extend the advertising ban to online shops. Recent first-instance rulings are cited (LG Hamburg 402 HKO 67/25 of 23 Apr 2026, plus earlier LG München I and LG Köln decisions). They say a specialist online shop may present products neutrally (name, price, pack size, necessary product information) but not use lifestyle imagery, "exklusiv" or "günstig" copy, "Bestseller" or "gratis" labels, discount banners or promotional newsletters. Outcomes on appeal are unknown.
- Spirits are outside the tobacco ban. Separate their promotion from tobacco.
- Where this touches existing work and the customer's concept:
  - Customer concept: rotating promotional banners, "Neuheiten", "Empfehlung der Woche", "Zigarre des Monats", "Sale %" navigation, corner ribbons, points programme, discount hints in the top bar, promotional newsletter.
  - Existing code: header cigar-brand awards, homepage brand gallery carousel, `Recommendations.svelte` ("bestseller" style content), `CallToAction.svelte`, hero copy such as "Premium · Since 2024" (which also conflicts with the design direction's no-invented-claims rule), the "Sale" menu item.
  - The design direction already prefers factual copy and neutral product photography. It also proposes editorial recommendations and atmosphere photography, which should be checked against these rulings.
- [ ] Commission the legal review (D4) before building more promotional UI. Give the reviewer concrete screenshots and the wireframe.
- [ ] Until answered, treat as high risk and keep factual: name, price, pack size, specifications. Avoid sale ribbons, "gratis", "Bestseller", urgency and "exklusiv".
- [ ] If any price reduction is ever shown, PAngV §11 requires the lowest price of the previous 30 days. That needs price history in the schema.
- [ ] Check the newsletter content against the ban (B4).
- [ ] §20b TabakerzG (reported): no free distribution or prize draws outside specialist shops. Relevant to samples, gifts with purchase and giveaways.

**B3. Other legal and tax items.**

- [ ] **Widerruf:** the research reports that a withdrawal button ("Vertrag widerrufen", §356a BGB) has been mandatory since 19 Jun 2026, with no transition period. Verify and implement alongside the existing cancellation page. No tobacco or spirits exclusion from withdrawal was found, so the cancellation terms must say so accurately.
- [ ] **Order button wording** "zahlungspflichtig bestellen" (§312j Abs. 3 BGB). Check the checkout's final button.
- [ ] **Price display:** prices incl. VAT, shipping costs shown (PAngV). Grundpreis per litre for spirits, and for loose or pipe tobacco by weight. Cigars sold per piece are likely exempt (my inference, verify).
- [ ] **Packaging law:** the research reports that the old VerpackG was replaced by the VerpackDG on 12 Aug 2026, with LUCID registration and a system participation for shipping packaging, and existing registrants reportedly having until 12 Nov 2026 to update. Verify against the official register and confirm the shop's status.
- [ ] **Health warnings:** the combined text-image warnings in TabakerzV §§12-14 apply to cigarettes, roll-your-own and water-pipe tobacco. For cigars the research could not find a website requirement. Confirm with the authority or lawyer. The wireframe shows a "Rauchen ist tödlich" notice on a competitor.
- [ ] **Alcohol excise:** domestic B2C sales of tax-paid spirits need no extra consumer-side duty. Confirm any licence or registration the shop needs with the Hauptzollamt (not verified).
- [ ] **Shipping outside Germany:** tobacco to EU consumers needs registration with the authority, an age-verification system and destination-country tax (§22 TabakerzG, §23d TabStG). Mail order of tobacco from another EU state into Germany is unlawful according to Zoll. Switzerland needs registration as an importer (secondary source). USA: not verified. Recommendation: Germany only (D2).
- [ ] **Imprint, privacy policy, terms and cancellation pages** (about 1,500 lines of static German text): have them reviewed against the actual process (Mollie, age verification, Germany-only, analytics). Check that company data, VAT ID and register entry are real (D11).
- [ ] **Analytics and consent:** PostHog keys are empty and the privacy page mentions it. No consent banner was found in the code. Decide before enabling anything non-essential.
- [ ] **E-cigarettes** (if D8 says yes): leaflet and warning duties (§15 TabakerzG), risk reporting (§16), liquid tax, restricted at Mollie and Klarna. Recommendation: not in phase 1.

**B4. Newsletter.**

- [x] Add a `newsletter_subscribers` table (email, status, consent timestamp, confirmation token, language). Guests can subscribe.
- [x] Double opt-in email, working unsubscribe link for subscribers without an account, and recorded consent (`confirmed_at`). Logic in `src/lib/server/newsletter.ts`, confirm page at `/newsletter/confirm`.
- [ ] Decide what the newsletter may contain (B2). Product promotions may be restricted. Service, store and event information is the safer content. Until then the new emails are neutral, but the footer text (`newsletterDesc`) and the `/news` and `/tastings` call-outs still promise "exklusive Angebote und Neuheiten".
- [ ] Create a send mechanism (export to a mail tool, or a simple admin broadcast). The customer wireframe asks for a newsletter "Zigarrenpost". It has to combine confirmed rows of `newsletter_subscribers` with customers whose `marketingConsent` is on, and skip duplicates by email.
- [ ] Admin view and CSV export of subscribers (status, confirmed date), so consent can be shown on request.
- [ ] Consent given through the registration checkbox or the account page has no double opt-in. It rests on the verified account email, which a lawyer should confirm (D4). Switching an account flag off also unsubscribes the matching subscriber row, switching it on does not create one.
- [ ] Rate limiting for the subscribe form (only a 10 minute resend cooldown per address exists), see workstream I.
- [ ] Delete pending rows that were never confirmed after a retention period, and add the newsletter to the privacy policy processor and retention text.

### C. Catalogue data model, import and curation

**C1. Catalogue content (P0 before any real testing).**

- The local database has no products and no producers. There is no seed or import path. The customer's inventory has to come from somewhere.
- [ ] Obtain the full product list from the customer (CSV or supplier price lists), with SKU, producer, type, price, stock, dimensions, strength, origin, wrapper, pack size.
- [ ] Build an **import script** (CSV to producers, products and detail tables, idempotent by SKU) and an admin CSV import and export. Validate with zod and report row errors.
- [x] Add a **seed script** for development with a dozen representative products (single, box, sold out, no image, long names, Cuban, spirit, accessory). Done: `bun run db:seed` (`scripts/seed.ts`), idempotent, refuses to run with `NODE_ENV=production`. The values are placeholders, not sourced data. Single and box are separate products until variants exist (C2).
- [ ] Image workflow: upload exists for product and producer images. Add bulk upload and the admin image gallery already listed in `TODO.md`. Define image size, background and naming rules (see the design direction). Remember usage rights (D10).

**C2. Schema extensions (P1).** Add fields deliberately and only with sourced data. The design direction forbids guessing strength or smoking time.

- [ ] **Sellable variants / pack sizes.** Introduce a `product_variants` (or `product_offers`) table: product, label (single, 5-pack, box of 10, box of 25), `quantity`, price, stock, SKU, EAN. Cart and order items reference the variant. This resolves the "single or box?" question from the design direction, supports per-size prices and stock shown in the wireframe, and allows a box discount. It is a breaking change for cart cookies, orders and admin forms, so do it before launch.
- [ ] **Cigar detail extensions:** format/vitola name, diameter in mm (derivable from ring gauge but customers filter by both), binder origin, filler origin, wrapper variety and colour, filler type (long/short), made by hand, flavoured, box-pressed, series, manufacturer taste notes, smoking time (only where sourced), more strength levels. The customer shows four levels (sehr mild, mild, mittelkräftig, stark). Competitors use up to seven. Pick the scale with the customer.
- [ ] **Aroma model:** a controlled list of aroma notes (wood, coffee, nut, pepper, chocolate, ...) as a join table, used for manufacturer notes and, later, customer ratings and similar-product search.
- [ ] **Cigarillo details:** flavoured flag and flavour, format, pack size, hand-rolled or machine-made.
- [ ] **Beverage details:** add gin to `BeverageType` (the wireframe lists Whisky, Rum, Gin and Cognac) plus brand/series, cask or finish where known.
- [ ] **Brand/producer pages:** add slug, logo, long description, origin country and awards. Brands are a key entry point in the concept and at competitors, but the data lives only in `producers` (name, country, description, image) and only the admin uses it.
- [ ] **Tags:** `products.tags` exists in the schema and admin, but nothing on the storefront reads it. Use it for curation (new, recommended) or drop it.
- [ ] **Availability:** add a visible stock status model (available, low, sold out, expected) and optional "back in stock" subscriptions (E6).
- [ ] **Price history** if reductions are ever shown (B2).
- [x] Order items store a product snapshot (name, SKU, VAT rate) so old orders stay correct after catalogue edits. Still open: the variant label, once variants exist. `order_items.metadata` is still unused.

### D. Storefront UI migration (existing plan)

Follow [`ui-migration-plan.md`](./ui-migration-plan.md). Current state: the shadcn-svelte foundation is installed (Button, Input, Label, Textarea, Checkbox, Separator, Sheet, Accordion), and the storefront tokens exist. All seven phases below are still unchecked in the plan. DaisyUI still drives every page.

Not repeated here, but adjusted by this document:

- [ ] **Sequence change:** do workstream 4 (defects) and C2 (schema: variants, strength, origin) before Phase 1 of the plan. The plan's Phase 1 asks for a verified "sold-quantity model" and listing filters. These cannot be built well on the current one-price-per-product schema.
- [ ] **Phase 1 (shop) additions:** per-variant price and stock on cards, strength and ring gauge spec line, origin filter from the schema, URL-backed filters, server-side pagination. Also fix search (section 4) in the same slice because both pages share the listing contract.
- [ ] **Phase 2 (homepage) adjustments:** the homepage content must pass the advertising review (B2). Prefer catalogue routes (origin, brand, category) over promotional tiles. The brand gallery carousel and awards in the header were added recently and conflict with the plan's "no automatic carousels" rule and with B2.
- [ ] **Phase 4 (checkout) rewrite:** Stripe is already removed from the checkout, so the plan's step 3 and Stripe lifecycle items no longer apply. Add the age-verification step (B1) and the Mollie redirect (A2). Keep the `bankTransferAvailable` gate and the "no payment possible" notice behaviour until a payment method is live.
- [ ] **Phase 5:** the account area is as in the plan.
- [ ] **Phase 6 (admin):** replaced by workstream J. Do not wait for the storefront phases. The admin has no dependency on the catalogue model, so J1 to J3 can run in parallel with Phases 1 to 4. The footer parts of Phase 6 stay as written in the plan.
- [ ] Capture the footer baseline screenshots (still unchecked) before touching shared layout.
- [ ] The design direction says "Do not equate cigar smoking with ...". It should add a short advertising-law note linking to B2.

### E. Shop features from the customer's concept and competitors

**E1. Navigation and discovery (P1).**

- [ ] Mega menu or compact category navigation: origin countries, popular brands, strength, aroma, "Sonstiges". Only link to destinations that exist.
- [x] Working GET search form in header (desktop and mobile). Still open: the result page only supports type and sort (no origin, brand, strength or price filters, which wait for C2), and suggestions as you type.
- [ ] **Origin landing pages** (Kuba, Dominikanische Republik, Honduras, Nicaragua, Peru, Costa Rica, Mexiko, Brasilien, Niederlande, others) with an intro text, flag, brand list and filtered products. This is the core of the customer's Ebene 2 and a main SEO entry point (the wireframe asks for "Verlinkung + Landingpage, SEO + SEA Optimierung").
- [ ] **Brand pages** with description, logo and products. The concept also has "Über Killepitsch"-style brand blocks for spirits.

**E2. Listing and filters (P1).**

- [ ] Filters from the wireframe, in this order of value: origin, brand, strength, price, ring gauge, length, wrapper, pack type (single or box), availability. Later: aroma, smoking time (only sourced data), flavoured, box-pressed, made by hand, rating. Competitors show result counts per filter and a "reset" control. Noblego and Cigarworld are the reference for depth.
- [ ] Sorting: name, price, newest, rating, strength.
- [ ] "Only available now" toggle.
- [ ] Optional compare list (two competitors have it) and a guided "find my cigar" assistant (P3).

**E3. Product page (P1).**

- [ ] Image gallery with several images and zoom on click or tap (the wireframe's hover zoom is not accessible and does not work on touch).
- [ ] Variant table: single, 5-pack, box with price, stock and quantity input, matching the wireframe.
- [ ] Specification list (`dl`) with all recorded facts, plus strength and aroma scales and, where sourced, smoking time.
- [ ] Reviews with sub-ratings as in the customer's concept (Verarbeitung, Abbrand, Zugwiderstand, Rauchvolumen, Intensität, Aroma) and an aggregate per rating. Noblego's model is an overall score plus sub-scores. Customer aroma ratings were not found on any shop the research visited, so this would be distinctive but is also the most work (P2).
- [ ] Similar products (same producer or same strength and origin) and "other customers also bought" later.
- [ ] Share button, structured data (JSON-LD Product with offers and availability).

**E4. Cart (P1).**

- [ ] Variant-aware lines, stock re-check on every load, clear messages for sold-out and changed prices.
- [ ] Order summary with free-shipping progress (only if D5 confirms a threshold).
- [ ] Cart persistence for logged-in customers (the cookie cart is lost on other devices) (P2).
- [ ] Guest checkout is not offered today (login is required). Decide whether that stays, given the age verification requirement (B1) probably needs an account anyway.

**E5. Wishlist and "humidor" (P2).**

- [ ] The concept asks to "save cigars in the humidor for future orders". Rename or extend the wishlist: a personal list with quick re-order, optional notes and a "notify me" toggle. This overlaps with the long-term collector platform in `TODO.md` (Later).

**E6. Availability alerts (P2).** Back-in-stock email subscriptions per product or variant. Cigarworld has a bell on unavailable sizes.

**E7. "Product not available? We will search for it" (P2).** The concept promises it in the intro text. A short form on sold-out and not-found pages that sends an email to the shop and stores the request for the admin. Low effort, high service value.

**E8. Spirits and accessories (P2).** Make spirits filterable by type, origin, volume and ABV. Accessories (cutters, lighters, humidors) need a clean type and a few attributes. The concept also lists pipes and pipe tobacco (D8).

**E9. Gift vouchers and samplers (P2/P3).** Competitors almost all offer gift vouchers and sampler sets. Vouchers need a code model and a payment flow. Samplers fit the variants model as "bundle" products. Do not offer free gifts (B2, §20b).

### F. Orders, fulfilment and admin

The admin-only items in this list (order screens, inventory, dashboard, security, curation) are specified with priorities in workstream J. The fulfilment items below stay here.

- [ ] **Order lifecycle emails** beyond confirmation: payment received, shipped (with tracking link), cancelled by an admin, refunded. Done: the payment reminder and the cancellation after a missed deadline. The set is now confirmation, reminder, deadline cancellation, verification, reset, email change.
- [ ] **Tracking:** add carrier and tracking number to orders, an admin action "mark as shipped" that sends the email, and show it in the customer's order view.
- [ ] **Invoices:** generate a PDF invoice with VAT breakdown per order, attach it to the email, store it. Required for orderly bookkeeping. Quotes and credit notes for refunds.
- [ ] **Shipping labels / DHL:** at minimum an export of shipping data for DHL business customer tools, with the age-check service flag. Direct DHL API integration later.
- [ ] **Admin order screens, inventory, dashboard, security and curation tools:** see J5 to J8. Admin settings are J4.
- [ ] **Store pickup** (click and collect at Weidengasse 25). Competitors offer it and the Cologne shop is a real asset. `ShippingMethod.PICKUP` exists in the enum but isn't offered at checkout. Age check happens in the shop. (P2)
- [ ] **Returns workflow** matching the cancellation terms. (P2)

### G. Content, SEO and internationalisation

**G1. Content to write or collect (P1/P2).** The PDF contains drafts and placeholders:

- [ ] Intro texts for cigars, cigarillos, origin pages, pipes, spirits. Some are drafted in the PDF (cigars, cigarillos, Cuba, humidor). The beginner and history sections are still "Xxxxx". Check them for the advertising rules (B2).
- [ ] Beginner's guide, glossary (Lexikon), strength guide, vitola explanations, pairing guide (cigar plus rum or whisky), "how to smoke cigarillos". These are also the pieces competitors use for SEO, and they are mostly neutral information.
- [ ] Cuban strength classification graphic from the PDF needs a rights check.
- [ ] About, humidor and team copy with real photography. Remove invented claims such as "Since 2024".
- [ ] `/guides` route as already listed under Later in `TODO.md`.

**G2. SEO (P1).**

- [ ] No `robots.txt`, `sitemap.xml` or structured data were found in the repository. Add robots, a generated sitemap (products, brands, origins, content), canonical URLs, Open Graph and JSON-LD (Organization, LocalBusiness for the Cologne store, Product, BreadcrumbList).
- [ ] Per-route titles and descriptions. The homepage description currently uses marketing language ("exklusive Auswahl").
- [ ] Clean URLs with slugs for products, brands and origins instead of UUID-only paths (keep IDs for redirects).
- [ ] Local SEO for the Cologne store (Google Business profile, opening hours markup).
- [ ] The wireframe asks for "SEO + SEA". Paid search for tobacco is itself subject to the advertising ban and platform policies, so treat SEA as a separate decision.

**G3. i18n (P1 decision, P2 execution).**

- Current state: infrastructure for DE, EN, AR, CN and RU is in place. The message files hold about 140 keys (shop, errors, ui). Header, footer, shop and checkout use them. Product detail, cart, account, FAQ, about, contact, legal pages and all server error messages are hardcoded German.
- [ ] Decide languages for launch (D7). A German-only launch with working language switching on shell elements is acceptable if declared. A half-translated site is worse than none.
- [ ] Move every customer-facing string into `messages/*.json`, including server `fail()` messages (return keys, translate in the page).
- [ ] Translate legal pages only with legal review. Keep German as the binding version.
- [ ] RTL, script fallbacks and locale-aware price formatting as in the design direction.
- [ ] Emails are German only. Decide whether they follow the customer's `preferredLanguage`.

### H. Marketing, loyalty and later features

- [ ] **H1. Loyalty programme** (D9): points for orders and reviews, levels bronze/silver/gold/platinum as in the concept. Research found no verifiable competitor terms (Zigarren Herzog's "Schatzkammer" could not be found), and the programme interacts with B2 (discount-like incentives). Treat as P3, design after the legal review.
- [ ] **H2. Box-of-the-month / subscription:** already in `TODO.md` under Later, to be built on Mollie recurring payments instead of Stripe. Research found no competitor with a subscription box. Check Mollie's rules for recurring tobacco payments first.
- [ ] **H3. Collector platform** ("Vivino model") from `TODO.md`: unchanged, P3.
- [ ] **H4. B2B portal** from `TODO.md`: unchanged, P3. Invoice payment and bulk prices need the variants model (C2).
- [ ] **H5. Tastings, workshops, "cigar roller at your event":** the concept has three tiles. Build an enquiry form and an events list first. Booking and payment later (P2/P3).
- [ ] **H6. Reviews integration:** Trusted Shops or a comparable service (Cigarworld, Noblego and Paul Bugge all use Trusted Shops). Needs an account and a decision on cost (P2).
- [ ] **H7. Partner badges** (Davidoff Ambassador, Laura Chavin Depot, John Aylesbury Partner, Habanos Point from the footer concept): make sure the claims are authorised and current.

### I. Quality, security and operations

- [ ] **Automated tests:** `bun test` exists with 253 tests (see `tests/` and section 4). Extend it per the coverage task in section 4, add webhook-mapping tests when Mollie lands, and add Playwright for the purchase path (search, product, cart, checkout in Mollie test mode).
- [ ] **CI:** run `bun run check`, `bun run lint`, tests and `bun run build` on every push.
- [ ] **Backups:** the SQLite file lives on the server (`data/` and `local.db` are excluded from deploy cleanup). Add scheduled, tested backups with off-server copies and a restore drill. Order data is business-critical.
- [ ] **Migrations:** the project uses `drizzle-kit push` against the live database. Move to generated migrations before the variants change in C2, so changes are reviewable and reversible.
- [ ] **Deployment:** the deploy script uploads a build over SSH, cleans the directory and restarts through Plesk Passenger. Add a health check, a rollback copy of the previous build and a deploy log. Run `db:push` or migrations as an explicit, reviewed step.
- [ ] **Monitoring:** error alerts (the `Logger` writes to the DB only), uptime check, a log of failed webhooks and failed emails. Today failed emails are swallowed silently.
- [ ] **Email deliverability:** SPF, DKIM, DMARC for `zigarren-puro.de`, a bounce handling plan, and a test of all templates in common clients.
- [ ] **Security review:** rate limiting for registration, password reset, newsletter and contact forms, CSRF handling (the origin check only applies when an `Origin` header is present), HTTP security headers and a CSP, upload validation (done: the first bytes of an image are checked and the size is limited), cart cookie (unsigned, but prices come from the DB), session handling. Done so far in `src/lib/server/accounts.ts`: the failed-login count starts again after a lock has run out (the first typo after the 15 minutes used to lock the account again), a password reset signs every open session out, and a reset link is claimed atomically so two simultaneous requests cannot both use it. Changing the password or the email in the account goes through the same lock now, and a password change closes the customer's other sessions. Still open: no rate limit on login, registration and reset requests (only the per-account lock), login timing differs for unknown emails (no dummy hash), registration reveals whether an email is taken, and sessions are not listed or revocable by the customer.
- [ ] **Performance:** responsive images and modern formats for catalogue photography, caching headers for static brand assets, pagination (C1), `LCP` on the homepage.
- [ ] **Accessibility and cross-browser pass** as listed in the migration plan's acceptance criteria.
- [ ] **Data protection:** retention of birth dates and ID verification data, data export and deletion on request, a processor list (SMTP, Mollie, age-check provider, PostHog if enabled).
- [ ] **Documentation:** update `README.md` and `CLAUDE.md` (Mollie, new schema, tests, `docs/TODO.md` path). Add a short operations runbook (deploy, backup, restore, rotate keys, handle a failed payment).

### J. Admin back office

Added after a review of the admin routes (2026-10-31). The admin has 19 files and about 3,400 lines: dashboard, inventory (list, create, edit), producers, orders (list, detail), customers (list) and content. It works, but it is thin, has almost nothing to configure and looks inconsistent. The review read the layout, dashboard, inventory list and edit, producers, orders detail, content and the loaders of orders and customers. It did not read the inventory create page, the orders list page or the customers page line by line, so items that depend on them say "verify".

J1 to J3 have no dependency on the catalogue model or the legal answers and can start now. They supersede the single Phase 6 bullet in `ui-migration-plan.md` for everything except the footer.

**What the review found**

- **Two looks.** Inventory, orders, customers, content and the dashboard use hand-written Tailwind (zinc palette). Producers uses DaisyUI (`btn`, `card`, `alert`, `input-bordered`) and the browser `confirm()` dialog for deletes.
- **Form styling is copy-pasted.** `inputClass` and `labelClass` are string constants repeated per file (27 uses in inventory create alone). The four detail blocks (cigar, cigarillo, beverage, tool) are written out twice, in the 402-line create page and the 557-line edit page. A new field, such as gin or flavoured, has to be added in both places and in two server actions.
- **Form feedback is weak.**
  - Server validation returns one message for the whole form (`Ungültige Eingabe`, `Zigarren-Details unvollständig`), never per field.
  - Success and error banners appear at the top of the page, far away from the save button on long forms.
  - There is no unsaved-changes hint, no disabled or busy state on submit, and the hero text form rejects an empty field instead of reverting to the default.
- **Partial saves (fixed).** The inventory update action used to write the product row first and validate the detail fields afterwards, so an incomplete form saved half of itself, and numbers were parsed without a check. Create and update now share `src/lib/server/productForm.ts`: validate everything first, then write the product and its details in one transaction.
- **Layout.** The sidebar is a fixed 13 rem column with no mobile layout. The dashboard repeats the sidebar links at the bottom. There is no settings entry and no way to see who is logged in.
- **Inventory list.** Stock edits have no history. Fixed: filters and sort work without JavaScript (a GET form and sortable column links), the list is paged (25 per page), unknown filter values are ignored, and `updateStock` refuses an unknown product. Earlier fixes: the search escapes `%` and `_` (shared helper `likeContains`, also used by the customer and storefront search), the type column shows its labels, and the low-stock threshold is one constant, `lowStockThreshold` in `config.ts`.
- **Orders.** The detail page edits only two status dropdowns. Contradictory combinations are possible (for example delivered with a failed payment), nothing is confirmed before cancelling or refunding, an admin cancellation sends no email, and the payment method labels still include PayPal and crypto. The list loader filters by status only and loads every order.
- **Customers.** A read-only list with search. There is no detail page, no order history per customer, no consent or age-verification state and no action.
- **Dashboard.** Four counts, the last eight orders and a status table. No revenue, no "needs action" view (paid and not shipped, overdue payments), and pending orders count unpaid and paid ones together.
- **Content.** Only the hero (subtitle, tagline, button, image) and two social links are editable. The defaults in `src/lib/server/content.ts` are "Premium · Since 2024" and "Exklusive Zigarren und Spirituosen ...", which the admin shows as placeholders. That wording conflicts with B2 and with the design direction's no-invented-claims rule. The tag field placeholder suggests "Bestseller, Kubanisch, Premium", which also conflicts with B2.
- **Settings live in code.** `src/lib/config.ts` holds the company name, store and legal address, phone, email, social links, VAT rates, the free-shipping threshold, shipping costs and the bank details with the payment deadline. Changing any of them needs a deploy. `bankTransferAvailable` is computed once at import time from the IBAN constant.

**J1. Shared form kit (P1)**

- [ ] Build admin form components on top of the installed shadcn-svelte primitives (Input, Label, Textarea, Checkbox, Button): a field wrapper (label, hint, required mark, per-field error), select, number input with unit, and a form section card. One place for spacing, focus and error styling.
- [ ] A form footer pattern: sticky save bar with a busy state (`use:enhance` submitting flag), a "saved" confirmation next to the button, and a disabled state while nothing changed.
- [ ] Per-field errors from server actions: validate with zod and return `fail(400, { errors, values })`, so the form keeps what was typed. Use it first for product, producer, content and the new settings screen.
- [ ] A shared `ConfirmDialog` for destructive actions (delete product, delete producer, cancel or refund an order), replacing the inline "Sicher?" block and `confirm()`.
- [ ] One `ProductForm` with the type-specific detail sections, used by create and edit. The detail field definitions live in one list so a new field (C2) is added once. Keep every existing field name so the actions keep working.
- [ ] Acceptance: the same component renders every admin form, keyboard and screen reader labelling work, and `inventory/create` and `inventory/[id]` shrink to a thin wrapper each.

**J2. Admin shell and consistent look (P2)**

- [ ] Layout: collapsible sidebar with a mobile drawer (the installed Sheet), the settings entry, a link to the storefront and the signed-in identity (once J8 exists). Remove the duplicate link row from the dashboard.
- [ ] One table style for lists (sticky header, sortable columns as real links so they work without JavaScript, empty states, pagination).
- [ ] Define the admin look in `design-direction.md`: dense and calm, the same charcoal and brass tokens as the storefront, status colours used only for status. The existing direction is storefront only.
- [ ] Restyle the producers page last, since it is the only DaisyUI page and goes away with Phase 7.

**J3. Defects found in the review (P1)**

- [x] Inventory update: validate the product fields and the detail fields first, then write both in one transaction. Check numeric fields for `NaN` and sensible ranges. Done for create and update (`productForm.ts`), also: a price like `12,50` is read correctly, strength, filter and drink type must be known values, an unknown producer is refused. The form still shows one message for the whole form, per-field errors are J1.
- [x] Inventory list: filters and sort are a GET form and plain links, with pagination (shared `src/routes/admin/Pagination.svelte` and `src/lib/server/pagination.ts`), and a stock filter for low and sold out products. Done earlier: the type labels and the escaped search.
- [ ] Remove "Bestseller" from the tag placeholder and the promotional defaults in `content.ts` (hero subtitle and tagline). Neutral factual defaults until D4 is answered.
- [ ] Order detail: drop PayPal and crypto from the payment labels, or keep them only as labels for old data and say so.
- [x] Product delete: SQLite does not enforce the foreign keys in this project, so a delete left order items, wishlist entries and reviews pointing at nothing. Done in `catalogue.ts`: a product that was ordered is refused (set the stock to 0 to take it out of sale), any other product goes with its details, wishlist entries, reviews and image in one transaction. Deleting a producer with products is refused as well (before, the delete went through and left products without a producer). Still open: a real "deactivate" flag, so an ordered product can leave the shop without stock 0.
- [x] Image uploads (hero, product, producer): the file name was fixed (`hero-bg.<ext>`, `<id>.<ext>`) and the files are served with a one year immutable cache, so a replacement kept showing the old image. Done in `uploads.ts`: the name carries a hash of the content, the old files are removed once the new URL is saved, the first bytes decide the format instead of the reported type, and a producer or product that does not exist gets no file. The content forms validate their links (`isSafeLink`: no `javascript:` or `//host`) and are saved in one transaction.

**J4. Settings screen (P1, needs D5 and D11 answers for the values only)**

- [ ] New `settings` store (key and JSON value, validated with zod, cached per process) with a loader that falls back to the constants in `config.ts`. `config.ts` stays as the defaults, so nothing breaks before anyone saves.
- [ ] Admin pages grouped as: **Company** (name, store and legal address, phone, email, VAT ID, register entry, opening hours), **Shipping** (methods, costs, free-shipping threshold, Germany only flag, dispatch time), **Payment** (IBAN, BIC, account holder, payment deadline, which methods are on), **Tax** (VAT rate per product type, with the note that the adviser must confirm), **Social and links**.
- [ ] Make the storefront read these values at request time: checkout totals, `bankTransferAvailable` (today computed at import), footer, imprint data, emails and the order sweep. Opening hours and addresses are currently also hardcoded in components and legal pages, so list every place and replace it with the setting (verify the count, the audit did not grep it).
- [ ] The IBAN and the VAT rates change money flows. Restrict to the owner role (J8), require the current admin password again to save, show the old and new value in a confirmation step and write an audit entry. This is the main fraud risk of a settings screen.
- [ ] This lets the customer enter the real IBAN themselves, which closes the P0 placeholder item in section 4 without a deploy, and gives D5 and D11 a place to land.
- [ ] Optional later: editable email texts (order confirmation, shipping), and the low-stock threshold per product or globally.

**J5. Orders (P1 before launch)**

- [x] Order list: search by order number (with or without `ZP-`), name or email, filters for order and payment status, shipping method and date, "needs action" presets (to ship, payment overdue) and pagination, all as a GET form. Open: CSV export. It needs a download response, which means a `+server.ts`, and the project allows none except documented exceptions. Decide whether this is one, or build it as a form action that returns the file.
- [x] Order detail, status changes: an allowed-transitions table (`ORDER_TRANSITIONS`, `PAYMENT_TRANSITIONS`, `transitionProblem` in `orders.ts`) replaces the two free dropdowns. The form offers only the statuses the order can move to, and the server checks the same rules. A paid or authorized payment is needed to confirm, process, ship or deliver. Refunds set order and payment together. A late payment can revive a cancelled order. Cancelling asks for confirmation.
- [x] Order detail: an internal note (`orders.internal_note`, never shown to the customer, kept apart from the note the customer writes at checkout) and a status history (`order_events`: who, when, from, to). The sweep and checkout retries are recorded as "System", staff changes as "Admin". With one shared admin password there is no personal name yet, that comes with J8.
- [ ] Order detail: tracking number and carrier with "mark as shipped" (F), and a printable pick list and delivery note. The refund confirm dialog waits for Mollie (A4).
- [x] Send the customer an email for admin cancellations and for "paid". Both go out from the status form, with a checkbox "notify the customer" that is on by default. A failing mail does not undo the status, staff see a warning. The wording of the staff cancellation mail needs the customer's approval (it says nothing about a refund on purpose).
- [ ] Refund action when Mollie lands (A4), using the same confirm dialog.
- [ ] Show the age-verification state on the order once B1 exists.

**J6. Inventory, producers, customers, dashboard (P2)**

- [ ] Inventory: low-stock threshold setting, stock adjustment log (who, when, delta, reason), bulk edit for price and stock, CSV import and export (C1), several images per product (gallery in `TODO.md`), and the variants editor once C2 lands.
- [ ] Producers: slug, logo, long description, country and awards for brand pages (C2), and a list of the producer's products.
- [ ] Customers: detail page with profile, addresses, order history, consent flags, age-verification state and review queue (B1), marketing consent and newsletter status, and a way to disable an account. Data export and deletion on request (I).
- [ ] Newsletter: subscriber list with status and CSV export, and a broadcast form when the content decision (B4) is made.
- [ ] Dashboard: replace counts with "needs action" cards (to ship, overdue payments, sold out, awaiting age review), revenue per day, week and month, and a short activity feed. Count paid and unpaid pending orders separately.
- [ ] Product requests inbox (E7) and back-in-stock requests (E6) when those features exist.

**J7. Content and curation (P2, subject to B2)**

- [ ] Generalise `site_content` into a small content manager: homepage blocks (order, visibility, text, image, link), brand and origin page texts, the service line in the top bar, FAQ entries and the news and tastings lists. Each field shows its default and a "reset" action.
- [ ] A shared image picker over the uploaded files (the gallery in `TODO.md`) with size and format checks, instead of one upload field per form.
- [ ] A review step for promotional blocks: a "legal review needed" flag on anything that is a banner, a recommendation or a discount notice, until D4 is answered.
- [ ] Homepage picks ("Empfehlung der Woche" style) only after the legal review. The admin can ship without them.

**J8. Admin security and audit (P2, P1 if more than one person uses it)**

- Moved from workstream F, unchanged in content: the admin is one shared password over HTTP Basic Auth, with the fixed user `admin`, a non-constant-time comparison and no rate limiting.
- [ ] Named staff accounts with roles (owner, staff) on the customer auth stack, login throttling, a session timeout and a visible logout.
- [ ] Role gates: staff manage orders, inventory and content, only owners change settings, staff accounts and payment actions.
- [ ] Audit log table (actor, action, entity, before and after, time) written by every admin action, with a read-only admin page. Settings and refunds first.
- [ ] Until this exists, at least compare the password in constant time and rate limit `/admin`.

**J9. Tests (P1 with each slice)**

- [ ] Admin tests, `tests/admin.test.ts` (54 tests): inventory list, filters, paging and stock update, product create and update (transaction, validation, SKU conflict, all four types), order list (search, filters, presets, paging), detail, status changes (transition rules, stock return, history, customer emails, mail failure), internal notes, customers search. The transition rules and the history of the sweep are also covered in `tests/orders.test.ts`. Producers, content, the image uploads and the deletes are covered by `tests/adminContent.test.ts` (34 tests). Still to add with each slice: settings validation and fallback, and anything new from J5 (allowed transitions, notes, history).
- [x] Upload tests for the content sniff, the size limit, replacement, rollback when saving fails, and the file route (`tests/adminContent.test.ts`).

---

## 6. Recommended sequence

**Milestone 0: unblock (days).**

1. Send the questions D1, D2, D4, D5, D11 to the customer and Mollie.
2. Fix the verified defects: search, product detail, stock decrement, cart clearing, bank placeholders.
3. Add smoke tests for every route and the purchase path.

**Milestone 1: data foundation.**

4. Variants and detail extensions (C2) with generated migrations.
5. Import script and the customer's catalogue (C1). Seed data for development.
6. Order numbers, VAT handling, order item snapshots.
   6a. Admin form kit and the defects found in the review (J1, J3). These do not depend on the catalogue and can run in parallel with steps 4 and 5. Build the settings screen (J4) before the money work below, so the real IBAN, shipping terms and VAT rates are entered through the admin and not in code.

**Milestone 2: money and compliance.**

7. Mollie integration (A2 to A5) once D1 is answered, with fallback A6 if needed.
8. Age verification (B1).
9. Legal review outcome applied to copy and UI (B2, B3). Newsletter double opt-in (B4).

**Milestone 3: storefront.**

10. UI migration Phases 1 to 4 on top of the new data (workstream D), with E1 to E4 delivered inside those phases.
11. Origin and brand landing pages, SEO basics, content (E1, G1, G2).

**Milestone 4: operations for launch.**

12. Order emails, tracking, invoices, admin order tools (F, J5), the rest of the admin (J2, J6 to J8).
13. Monitoring, backups, deploy hardening, security pass (I).
14. UI migration Phases 5 and 7, remove DaisyUI. The admin part of Phase 6 is workstream J.
15. Pilot with a few existing customers, as the design direction suggests, then launch.

**After launch.** Reviews with sub-ratings, humidor and back-in-stock alerts, product request form, vouchers and samplers, store pickup, events and loyalty programme, then the Later items.

---

## 7. What competitors do that is worth copying or avoiding

From a look at Noblego, Cigarworld, Paul Bugge, Zigarrenversand.ch, Zigarrenschachtel, Tabakhaus24, Zigarrengenuss.ch, Zigarren Herzog, Davidoff (US) and Famous Smoke. Findings are attributed to what was visible on the pages fetched at research time.

**Worth copying**

- Per-pack-size pricing and stock on one page (Cigarworld, Noblego, Paul Bugge), and a compact spec line on listing cards such as "Ø15 L125 Mild" (Noblego).
- Deep but orderly filters: origin, brand, strength, ring gauge, length, wrapper, pack type, smoking time, with result counts and a reset control (Noblego, Cigarworld).
- Honest stock states per size, including "Restbestand" and a back-in-stock email bell (Cigarworld).
- A strong age-verification flow with a stored result (Noblego) instead of a pop-up.
- A flat 3 % discount on whole boxes (Noblego, Paul Bugge, Zigarrenschachtel). Check against B2 before using it as marketing.
- Free shipping thresholds in the 50 to 65 EUR range at German competitors. The current 150 EUR is high. Decide in D5.
- Gift vouchers and sampler sets at almost every shop.
- Trust cues that are factual: walk-in humidor, store in Cologne, Trusted Shops, Habanos and Davidoff partner badges.
- Neutral editorial content: glossary, beginner guide, pairing guide, origin guides. Noblego also has a "Zigarrenmatching" pairing tool.

**Avoid**

- Contradictory shipping information on the same page (Tabakhaus24), a crowded header (Noblego), blank spec fields on a product page (Paul Bugge), and confusing newsletter consent wording (Tabakhaus24).
- Relying on a pop-up age gate only.
- Promotional wording that the reported rulings treat as advertising: "Top-Angebot", "Deal der Woche", "exklusiv", "Bestseller", strike-through sale prices, "Kunden werben Kunden". Several competitors use these anyway. That does not make them safe.
- Customer aroma ratings and a flavour wheel: none of the visited shops had them, so there is no tested pattern to copy. Treat as an experiment.

---

## 8. Open points about the existing documents

- `docs/TODO.md`: its "Now" section (Stripe database push, keys, webhook) is obsolete, and the Stripe webhook route it refers to no longer exists. The "Soon" and "Later" items are covered by workstreams B1, C, D and H. Update it once the team agrees on this document, and keep one source of truth.
- `CLAUDE.md` still lists `STRIPE_SECRET_KEY` as not implemented, links `./TODO.md` and does not mention the Mollie decision. `README.md` also mentions Stripe among the prepared variables.
- `ui-migration-plan.md`: add the sequencing note from workstream D and the Mollie-driven checkout change. Its Phase 4 lines 128 and 130 still require preserving the "Stripe Embedded Checkout lifecycle" and testing Stripe success and cancellation, which no longer applies.
- `design-direction.md`: add the advertising-law caveat (B2) next to the editorial and recommendations guidance.

## 9. Research limits

- **Customer PDF:** read in full (text and page images). It contains wireframes with competitor links, so "see: [shop]" notes show what the customer likes about each, not firm requirements. Red notes are open questions to the developer.
- **Code audit:** broad, not exhaustive. I read the schema, checkout, cart, hooks, webhook, shop, search, product page loaders, admin order and content actions, header and footer excerpts, and ran queries to confirm the two SQL defects. I did not review every Svelte template, the legal text or the admin edit page line by line.
- **Competitor research:** done by an automated agent through web fetches. Zigarren Herzog's "Schatzkammer" could not be found. Several shops were not visited (Cigars International, Smokeinn, Thompson, Cigarmaniacs, Ruiz/Havana House). Some pages were truncated. Cuba-specific and EU or US tobacco shipping rules were not on any fetched page.
- **Mollie and legal research:** Mollie's help-centre pages returned 403, so Mollie's tobacco policy was not read from the source, and the Klarna and Apple Pay statements come from policy pages and search snippets. Court rulings, the VerpackDG date, the withdrawal button and the e-liquid tax figures are reported by secondary sources and were not checked against official texts. **None of this is legal advice.** Confirm everything in section B with a lawyer and with Mollie before relying on it.
