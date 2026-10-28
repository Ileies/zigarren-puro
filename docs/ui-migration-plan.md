# DaisyUI to shadcn migration plan

Migrate the storefront in reviewable increments, applying the [design direction](design-direction.md) to each changed page. The goal is a useful, classical cigar shop with modern interactions. A mechanical component swap will not achieve that goal.

**Preserve the footer's visual design.** Capture it before migration. Convert its remaining controls only when needed to remove DaisyUI, keeping its layout, colours, type, spacing and behaviour equivalent. Keep functional UI changes and catalogue/backend changes in separate commits where they can be reviewed independently.

## Foundation already installed

- [x] Configure `components.json` for Tailwind 4, TypeScript, the stone base palette, Lucide and the existing `#lib` alias.
- [x] Add explicit `#lib` paths to `tsconfig.json`, allowing the shadcn CLI to resolve aliases with this project's SvelteKit 3 configuration.
- [x] Install `bits-ui`, `@internationalized/date`, `tailwind-variants`, `clsx`, `tailwind-merge` and `tw-animate-css` alongside DaisyUI.
- [x] Add owned Button, Input, Label, Textarea, Checkbox, Separator, Sheet and Accordion components under `src/lib/components/ui`.
- [x] Add the `cn` helper and Svelte component types in `src/lib/utils.ts`.
- [x] Add storefront tokens in `src/lib/styles/shadcn.css` and import them through `src/app.css`.
- [x] Adapt buttons and text fields to 16px text, restrained radii and primary control heights of at least 44px.
- [x] Add the sheet close label in all five locales through `messages/ui.json`.

This foundation intentionally leaves existing page templates and the DaisyUI theme in place. The unchecked phases below are the remaining redesign and migration work.

## Working with the new components

Follow the [shadcn-svelte CLI documentation](https://www.shadcn-svelte.com/docs/cli) when adding a needed primitive:

```bash
bun run ui:add native-select
bun run ui:add dialog dropdown-menu
```

The script pins CLI 1.7.1. `components.json` places generated files in this repository; these are owned source code. Review generated defaults against the design direction. Keep the current accessible control dimensions, translate new text and retain `data-slot` attributes. Do not run `init` again: it can overwrite the project's global CSS. Do not use `--overwrite` without reviewing local customisations. Review an upstream update as a source change before applying it.

Import primitives through their `#lib/components/ui/<component>/index.js` entry points. SvelteKit 3 rejects the former `$lib` runtime imports, so the setup follows the project's existing package import alias. Keep sibling imports inside a component family local. Keep shop-specific components in a separate `src/lib/components/shop/` directory instead of mixing product logic into generic primitives.

### Temporary theme boundary

Wrap each migrated page or substantial section in `class="puro-ui"`. This sets its ivory background and dark text and switches `primary`, `secondary` and `accent` to the storefront palette. The same three token mappings are applied to `[data-slot]` elements, so generated primitives and portalled sheets receive the right colours independently of their DOM location.

DaisyUI uses those three colour names too. Their Tailwind mappings are deliberately indirect; converting them to `@theme inline` while DaisyUI remains would make legacy utilities pick up the new colours. Other shadcn token mappings use `@theme inline` as described in the [theming documentation](https://www.shadcn-svelte.com/docs/theming).

Do not put `.puro-ui` on the root layout around the existing header and footer. Do not mix `.btn`, `.input`, `.card`, or other DaisyUI component classes onto new primitives. Migrate a complete section and its nested legacy controls together, since colour variables inherit into children. Plain elements using `buttonVariants()` need a `.puro-ui` ancestor or their own `data-slot="button"`.

Use semantic utilities such as `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border` and `text-brass` in migrated templates. Do not introduce new `base-*` or `*-content` colours. The storefront remains light; the class-based `dark` variant does not opt into the user's system dark preference.

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import * as m from '#lib/messages.js';
</script>

<section class="puro-ui px-4 py-8">
	<form method="POST" action="/newsletter?/subscribe" use:enhance>
		<Label for="newsletter-email">{m.yourEmail()}</Label>
		<Input id="newsletter-email" name="email" type="email" autocomplete="email" required />
		<Button type="submit">{m.subscribe()}</Button>
	</form>
</section>
```

Always set `type="submit"` on form actions: the new Button defaults to `type="button"`. Retain input names, constraints, bindings, hidden values, action URLs and action-result handling. The example illustrates component wiring; it is not a replacement for the footer's existing newsletter feedback flow.

## Component replacement decisions

| Existing pattern                                         | Replacement                                                                                         | Apply the new direction                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `btn`, `btn-*`                                           | Button, or a normal text link                                                                       | One primary purchase action; outline and ghost for supporting tasks      |
| `input`, `textarea`, `label`                             | Input, Textarea, Label                                                                              | Persistent labels, 16px entry text, visible boundaries and inline errors |
| `select`                                                 | Native Select for simple lists; Select only when justified                                          | Familiar sorting and country selection; preserve native form values      |
| `checkbox`, `radio`, `toggle`                            | Checkbox, native radios or Radio Group; Switch only for immediate settings                          | Preserve names and submitted values; do not style consent as a setting   |
| `drawer`                                                 | Sheet                                                                                               | Accessible mobile navigation and filters with focus management           |
| Custom language dropdown                                 | Dropdown Menu or a labelled native select                                                           | Keyboard access and current-language indication                          |
| `modal`, custom modal overlays                           | Dialog; Alert Dialog for consequential confirmation                                                 | Accessible titles, descriptions, Escape and restored focus               |
| `collapse`                                               | Accordion or native `details`                                                                       | Secondary information only; keep purchase facts visible                  |
| `card`, `card-body`, `card-title`                        | Semantic `article`, sections and Tailwind layout                                                    | Flat product entries and fine rules instead of nested panels             |
| `badge`                                                  | Plain stock text; Badge only for verified exceptions                                                | Avoid a rainbow of status pills                                          |
| `alert`, `toast`                                         | Inline status/error with suitable live-region semantics                                             | Clear feedback close to its cause; do not hide purchase failures         |
| `tabs`, `steps`, `join`                                  | Tabs for actual panels; links for navigation; ordered list for checkout steps; explicit flex layout | No segmented dashboard navigation on the shop                            |
| `rating` or custom star controls                         | Accessible radio group with labelled choices                                                        | Keyboard selection and textual review counts                             |
| Tables, stats, loading indicators                        | Native tables or Table; simple status/spinner                                                       | Keep dense operational layouts in administration                         |
| `rounded-box`, `rounded-selector`, `base-*`, `*-content` | Owned radii and semantic storefront tokens                                                          | Remove DaisyUI styling dependencies as well as component classes         |

## Phase 1 Catalogue data and the first shop page

Start with `/shop` as a complete vertical slice. Its new catalogue entry becomes the reference for subsequent storefront work.

- [ ] Capture desktop/mobile screenshots of the current footer and record its current colours and control sizes. Include long translated labels and the newsletter success state.
- [ ] In `src/lib/server/db/schema/schemaProducts.ts` and inventory forms, audit which SKU represents a single cigar, pack or box. Define a verified sold-quantity model before labelling prices per cigar or per box. If new fields are needed, backfill them from the catalogue without guessing.
- [ ] Extend `src/routes/shop/+page.server.ts` and `src/routes/search/+page.server.ts` to select existing `imageUrl`, cigar origin, strength, length, ring gauge and wrapper. Share a typed listing contract/query helper so the two pages show consistent facts. Handle missing detail records and other product types explicitly.
- [ ] Add `src/lib/components/shop/ProductCard.svelte`: actual image, producer, full name, a short specification line, price with verified sold quantity, text availability and one Button. Use an `article`, fine rules, `object-contain`, modest radii and no image zoom or resting shadow. Keep links and forms separate without nested interactive elements.
- [ ] Add a shared price formatter using the active locale and EUR. Preserve current numeric price semantics and totals during this UI migration.
- [ ] Replace `/shop/+page.svelte` cards, category pills and sort styling. Use a `.puro-ui` boundary, a catalogue title and a labelled Native Select. Leave result counts quiet and product names prominent.
- [ ] Preserve `/cart?/add`, hidden product IDs and progressive enhancement. Show added feedback only for a successful action result; preserve a visible failure state instead of treating every response as success.
- [ ] Add URL-backed producer, origin and strength filters using recorded data; retain sort/type/other filters when one changes. Validate server query values. Do not add a vitola or smoking-time filter before those values exist.
- [ ] Add server-side pagination with deterministic ordering and reset the page when filters change. Do not load an entire growing catalogue into one grid.

**Done when:** a shopper can recognise, compare and add a real cigar from the new listing. Filtering, reload and browser back preserve state; empty results and missing images are clear. The existing footer looks the same.

## Phase 2 Header and homepage

- [ ] Replace `Header.svelte`'s DaisyUI drawer with Sheet and Button. Use CSS breakpoint layout instead of initial `window.innerWidth` rendering and the unmanaged resize listener. Preserve logo, account identity and cart count.
- [ ] Turn desktop and mobile search into labelled GET forms targeting `/search` with `name="q"`. Fix `t` links to use supported parameters. Remove category or sale destinations until the backend actually implements their meaning.
- [ ] Migrate `LanguageSelector.svelte` to an accessible language control and retain locale selection behaviour. Keep category navigation readable and use a single factual service line.
- [ ] Rework `homepage/Hero.svelte` into one static editorial opening, with the existing logo identity, a short serif heading and one shop action. Remove the full-viewport minimum and animated scroll prompt. Keep the assortment close to the first screen.
- [ ] Simplify `src/routes/+page.svelte` to the homepage order in the design direction. Remove duplicate promotional entry points rather than recreating every current section using shadcn Card.
- [ ] Replace `HeroCarousel.svelte` and the homepage use of `AllBrandsCarousel.svelte` with static, useful category/brand/origin links. Update `FeaturedBrands.svelte` and `BrandCard.svelte` into restrained image-and-text links to working catalogue destinations.
- [ ] Replace `Recommendations.svelte`'s hardcoded products with curated existing product records loaded by `src/routes/+page.server.ts`. Reuse ProductCard, verify stock and images, and remove unsupported bestseller/sale claims and broken asset paths.
- [ ] Simplify `CallToAction.svelte`, `About.svelte`, `Tasting.svelte` and `Spirits.svelte`: remove gold gradients, floating blobs, heavy shadows and image zoom. Retain only useful, current content. Keep genuine merchant and tasting photography.
- [ ] Translate new storefront copy using the existing format: message-key arrays in `messages/*.json` for DE/EN/AR/CN/RU. Regenerate `messages.ts` only with `bun run dev` or `bun run build`.

**Done when:** the homepage reads as a cigar merchant, the first screen offers a clear shopping path, both search forms work, navigation works with keyboard/RTL, and no automated carousel competes with product choice. The footer remains the visual anchor.

## Phase 3 Search and product detail

- [ ] Reuse the Phase 1 listing, filters, sort, price formatting and pagination on `/search`. Preserve `q` across all interactions and validate searches against SQLite's supported case-insensitive matching. Test actual query execution rather than relying on type checks.
- [ ] Recompose `products/[id]/+page.svelte` around the real image and one purchase area. Show brand/name, sold quantity, price, availability and dimensions/strength near the action. Keep the current detail image support and honest fallback.
- [ ] Replace decorative product specification panels with a semantic `dl`. Keep origin, length, ring gauge, wrapper and strength visible; use Accordion for secondary delivery/care information. Do not invent missing blend or format data.
- [ ] Migrate cart, wishlist and review controls to the owned primitives. Preserve named actions, author permissions, rating values, error messages, edit/delete flow and successful action feedback. Use keyboard-operable rating choices.
- [ ] Add a small related-products section only when backed by catalogue records and a clear relationship, such as the same producer. Avoid an unrelated promotional grid.

**Done when:** the shop and search present the same product consistently. Purchase, wishlist and review actions behave as before, with essential buying facts visible without opening panels.

## Phase 4 Cart and checkout

- [ ] Rework `cart/+page.svelte` into flat product rows and a compact summary. Use actual images, readable full names, explicit quantities, accessible update/remove controls and clear empty-cart feedback.
- [ ] Replace `checkout/+page.svelte`'s repeated card containers and DaisyUI inputs with a calm form layout, Input, Label, Checkbox and native radios or Radio Group. Preserve address names, hidden captured fields and billing/shipping bindings.
- [ ] Present checkout steps as a labelled ordered list with the current step identified. Keep errors next to their fields with `aria-invalid` and `aria-describedby`, plus a summary when several fields fail.
- [ ] Preserve saved/new address selection, shipping choice, available payment methods, age checks, bank-transfer action and Stripe Embedded Checkout lifecycle. Keep Stripe-managed controls within its supported styling surface.
- [ ] Restyle `checkout/confirmation/+page.svelte` with a clear order number, status and next step. Match actual payment status rather than assuming every return is paid.
- [ ] Exercise guest/login redirects, invalid addresses, unavailable stock, quantity changes, duplicate submission protection, bank transfer, Stripe test success/cancellation/failure and a failed server response. Use test configuration and avoid real orders or charges.

**Done when:** totals and order/payment outcomes match the existing server behaviour, all available purchase paths work, errors remain actionable and checkout has no DaisyUI styling dependency.

## Phase 5 Account and remaining public pages

- [ ] Migrate `login`, `register`, `forgot-password`, `reset-password`, `verify-email`, `unsubscribe` and `account/confirm-email`. Preserve field names, autocomplete, verification flows, redirects and action errors. Use plain forms and readable headings.
- [ ] Rework `account/+page.svelte`, `account/addresses`, `account/orders`, `account/orders/[id]` and `account/wishlist` as customer-service pages. Replace large navigation tiles with modest links. Use Tabs only for actual local panels and Dialog for the logout confirmation.
- [ ] Migrate `WelcomeModal.svelte` to Dialog if it is retained. Preserve welcome visibility and close behaviour; do not let this prompt interrupt an ongoing purchase unnecessarily.
- [ ] Migrate `contact`, `faq`, `shipping`, `returns`, `about`, `news`, `partners`, `tastings`, `(static)/career` and `(legal)/*`. Use editorial layouts; replace FAQ collapse controls with Accordion or native details. Verify that payment and shipping copy matches the available service.
- [ ] Audit `Placeholder.svelte`, shared Carousel usages, and all error/offline/empty/success views for legacy classes. Preserve the existing error-page work and root-layout service notice while changing only their remaining styling dependencies.

**Done when:** public routes and customer account flows share the same type, spacing and controls; form actions and translations remain intact. No generic dashboard panels have been introduced to editorial pages.

## Phase 6 Administration and footer compatibility

- [ ] Migrate `admin/+layout.svelte` and every admin route, including inventory create/edit, producer uploads, content, orders and customers. Retain useful tables, filters and compact staff navigation. Keep server loads/actions and upload field names intact.
- [ ] Remove remaining DaisyUI styling from `src/routes/+layout.svelte` and any shared component only after its consumers are ready. Keep `.puro-ui` off the footer.
- [ ] Replace only the footer's newsletter input/button and social-button implementation as needed. Preserve `use:enhance`, submitting/success states, names and action URLs. Add local footer styles/tokens to retain the current charcoal, black, brass, white and age-notice colours when DaisyUI is removed.
- [ ] Preserve the footer's current compact control sizes with explicit local variants or overrides. Compare screenshots against Phase 1 at each breakpoint; retain columns, logo size, serif headings, gaps, links, contact details, payment marks and age notice. Include focus and disabled states in the comparison.

**Done when:** staff workflows still work and the footer's implementation no longer needs DaisyUI while its appearance remains equivalent. Footer redesign is outside this migration.

## Phase 7 Remove DaisyUI and finish

- [ ] Search all templates and styles for DaisyUI component classes, state variants, radius variables, colour utilities and `data-theme` assumptions. Resolve leftovers before removing the plugin. Do not rely on a search for `btn` alone.
- [ ] Remove `daisyui` and both DaisyUI plugin blocks from `src/app.css`, then update the Bun lockfile. Remove the legacy `.btn` typography overrides only when no consumers remain. Remove or narrow broad link/button sizing overrides only with equivalent readable sizes already present in the owned primitives and footer.
- [ ] Remove the temporary three-colour remapping from `.puro-ui, [data-slot]` after all legacy consumers have migrated. Retain the normal shadcn token definitions and any meaningful page surface class. Verify portalled content again after simplifying the bridge.
- [ ] Delete obsolete carousel/tile components only after confirming no remaining imports. Remove unused font packages or assets only after checking live references, including the footer.
- [ ] Update README and project guidance to identify shadcn-svelte as the UI system. Mark the migration task complete only after these cleanup gates pass.

**Done when:** DaisyUI is absent from dependencies, plugins and runtime styling; all routes render correctly; the footer remains recognisable and unchanged in composition.

## Verification required for each migrated slice

Before staging, run `git diff --name-only` and stage only session changes. Run `bun run check`, `bun run build`, ESLint and Prettier checks appropriate to the touched files before committing. Keep changes small enough to review a complete user journey.

For changed interactive pages, verify keyboard navigation, focus, form values, successful and failed actions, empty/missing-data states, 200% zoom and narrow viewports. Verify Arabic RTL and long translations. Respect reduced motion. Compare legacy and migrated surfaces together, including portalled sheets and the preserved footer.

For catalogue/query changes, add focused behaviour checks for combined filters, pagination, query validation and SQLite execution. For cart/checkout changes, check totals and actual action results. A successful build alone does not verify those behaviours.

## Final review scenarios

1. Find a known brand or exact cigar through search, then return to the same filtered result set.
2. Compare two cigars by origin, strength, dimensions, sold quantity and price without opening each detail page.
3. Buy an available item through each configured payment path, with correct totals and confirmation status.
4. Recover from empty results, a missing image, unavailable stock and a failed action without false success feedback.
5. Use mobile navigation, filters, account forms and the newsletter by keyboard, including RTL.
6. Compare the footer against its original desktop and mobile screenshots and confirm the design has been preserved.
