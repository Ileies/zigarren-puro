# Zigarren Puro design direction

Build a modern specialist tobacconist: a shop where an adult cigar smoker can recognise a brand, compare cigars and buy with confidence. Classical character comes from typography, proportion, photography and knowledgeable service. Modernity comes from fast browsing, clear information and reliable interaction.

**Keep the existing footer as the visual anchor.** Its dark ground, serif headings, warm accents, practical link columns and contact details already suit the shop. Preserve its composition, colours, content hierarchy and proportions. The storefront should feel related to it. Any eventual footer component migration should be visually equivalent.

## Audience and shopping priorities

The working audience hypothesis is existing adult cigar smokers: regular buyers replenishing a known cigar and enthusiasts comparing unfamiliar ones. Occasional buyers and gift buyers should also find their way. This is a design assumption to validate with the shop's customers, rather than a demographic finding. Do not equate cigar smoking with a particular gender, age bracket beyond adulthood, wealth or taste for conspicuous luxury.

Design around these tasks, in this order:

1. Find a familiar brand, series or exact cigar quickly.
2. Compare origin, strength, format, dimensions, wrapper, price and availability.
3. Understand exactly what is being sold: an individual cigar, pack or box, and its quantity.
4. Choose an alternative using specific product descriptions and advice.
5. Trust the merchant's stock information, delivery details and personal service.

Useful cigar information should remain visible without hover. Experienced smokers should be able to scan familiar terms; short explanations can help less experienced buyers. Avoid onboarding flows and feature tours in the buying journey.

## What needs to change

| Current implementation                                                                                                      | Resulting problem                                                            | Design decision                                                        |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `+page.svelte` stacks a full-height hero, a hero carousel, brand features and another brand carousel                        | Too much promotion before the assortment                                     | One restrained opening image, then immediately useful shopping content |
| `BrandCard.svelte`, `Recommendations.svelte` and `Tasting.svelte` use large radii, gradients, zooms and substantial shadows | Repeated decorative tiles compete for attention                              | Flat catalogue entries, fine dividers and stable product images        |
| Shop and search display generic package icons, although products support images                                             | The assortment lacks a recognisable identity                                 | Display actual cigar and box photography using the stored image URLs   |
| Shop entries emphasise price and colourful stock badges                                                                     | Buyers have little information for comparing cigars                          | Add concise specifications and quiet availability text                 |
| Homepage recommendations are hardcoded and include promotional badges                                                       | Editorial recommendations are disconnected from stock and catalogue truth    | Curate actual product records and explain why each was selected        |
| The hero uses a full-screen treatment and a scroll prompt                                                                   | The shop opens like a campaign landing page                                  | Keep a product or category entry visible near the first screen         |
| Header search inputs are not search forms; some links use `t` while search reads `q`                                        | An apparently functional storefront tool does not complete the shopping task | Make search a real GET form and use supported query parameters         |

Replacing DaisyUI with default shadcn components alone will retain many of these problems. Rework page composition and product information together with the component migration.

## Visual decisions

### Colour

Use warm light surfaces for the catalogue, dark ink for reading and a muted forest green for purchase actions. Introduce tobacco and cedar through real photography. Brass is a restrained accent for rules, focus indicators and selected details.

| Token                | Value     | Purpose                                       |
| -------------------- | --------- | --------------------------------------------- |
| `background`         | `#f7f3eb` | Warm ivory page surface                       |
| `foreground`         | `#2c241f` | Tobacco-brown reading text                    |
| `card`, `popover`    | `#fffcf6` | Slightly lighter product and overlay surfaces |
| `primary`            | `#263d32` | Forest green purchase action                  |
| `primary-foreground` | `#fffcf6` | Text on primary actions                       |
| `secondary`          | `#e9e1d4` | Quiet secondary surfaces                      |
| `muted-foreground`   | `#6b6055` | Readable supporting product information       |
| `accent`             | `#e8dcc4` | Subtle selection or hover surface             |
| `brass`, `ring`      | `#856330` | Small accents and focus indication            |
| `border`             | `#d5cdbf` | Decorative separators                         |
| `input`              | `#958a7c` | More visible form boundaries                  |
| `destructive`        | `#9e302b` | Errors and destructive actions                |

The implementation lives in `src/lib/styles/shadcn.css`. These are the new storefront tokens; the existing footer retains its own current colours, including `#2a2d3a`, black and `#b8834a`. Do not globally recolour the DaisyUI theme to match the new table.

Use one light storefront theme. A dark footer and an occasional dark editorial section provide sufficient contrast. Avoid metallic gradients, black-and-gold surfaces everywhere, glass effects and decorative glow.

### Typography

Keep the existing self-hosted Playfair Display and Manrope families. Playfair Display at 600 suits page headings, editorial headings and selected product names. Use 700 sparingly. Manrope handles prices, specifications, navigation and forms. Avoid introducing a third family during migration.

- Body and interactive control text: 16px minimum, with body line-height around 1.6.
- Supporting metadata: 14px minimum, with sufficient contrast and no low-opacity essential facts.
- Product names: 18-20px; section headings: 28-36px; homepage heading: approximately 36-56px with responsive sizing.
- Limit long editorial copy to about 65 characters per line. Keep catalogue pages wider for comparison.
- Use sentence case. Reserve small, modestly spaced capitals for short brand labels. Avoid tracking-heavy uppercase purchase buttons.
- Keep prices in dark ink, with tabular numerals and unambiguous units. Format amounts for the active locale.

The existing font imports need a script-coverage review for all supported languages. Provide suitable Arabic and Chinese fallbacks where required; do not force Latin letter spacing onto Arabic text.

### Layout and components

Use a shared content width around 1200-1280px, with 16-24px mobile gutters. Use a 4px spacing unit, typically 16-24px within product entries and 48-80px between major sections. Group information through alignment, whitespace and rules.

Product entries are catalogue items: an image, a readable name, specifications, price, availability and one purchase action. Use a fine divider or a restrained border when needed. Avoid enclosing every heading, description or specification in another card.

Use a default 4px control radius, square or subtly softened image areas, and no resting card shadows. Reserve shadows for floating menus and sheets. Primary buttons use forest green; secondary actions use an outline or plain link. Product actions remain at least 44px high. Keep the same reading size across button sizes.

Use Lucide for recognisable functions such as search, cart and filter. Pair unfamiliar icons with labels. Do not replace product images or expertise with large decorative icons. Availability uses words, with colour as additional information. Reserve badges for meaningful, verified exceptions.

### Photography

Show the actual cigar, its band, wrapper and packaging. Use consistent neutral backgrounds and `object-contain` for catalogue photography, preserving the cigar's silhouette. Keep comparable image scales; use responsive image sizes and reserve their dimensions to avoid layout shifts.

Use authentic shop, humidor, tobacco and craftsmanship photographs for editorial sections. A static, well-composed opening photograph can establish atmosphere. Avoid generic executive imagery, sports cars, stock portraits of men smoking, artificial smoke overlays and faux wood textures.

Keep names, prices and specifications outside photographs. A subdued overlay is acceptable when editorial image text needs contrast. Missing images receive a quiet, honest fallback, never a different cigar's photograph.

### Copy and service

Write with the confidence of a helpful tobacconist: specific, concise and welcoming. Prefer origin, blend, dimensions and sourced tasting descriptions over repeated claims of exclusivity. Do not invent founding dates, expertise, awards, stock scarcity or manufacturer facts.

For example, replace a generic heading such as “Entdecken Sie unsere exklusive Premiumwelt” with “Zigarren nach Marke und Herkunft”. A recommendation should explain its character in a short, product-specific sentence. Keep German storefront copy consistent in its form of address and translate every customer-facing message.

Show a clear price, sold quantity, availability and relevant delivery information near the purchase action. Keep existing age information and checkout safeguards. Confirm any shipping, discount or payment claim against the implemented offer before displaying it. This rework does not establish new commercial terms.

## Page composition

### Header and homepage

The header should offer a legible logo, a useful search field, labelled account and cart access, and a compact category navigation. Show only supported categories. Brands and origins deserve direct access once the catalogue supports those destinations. Use at most one factual service line. Use CSS breakpoints for responsive layout and a keyboard-accessible sheet for mobile navigation.

Proposed homepage order:

1. Compact header and category navigation.
2. One static editorial image with a short heading, one primary shop link and an optional advisory link. Avoid a viewport-height minimum.
3. A small, static route into cigar categories, brands or origins backed by real catalogue data.
4. Four to eight available recommendations, with actual product photographs, useful specifications and a short editorial reason.
5. A concise merchant introduction with a genuine shop image and contact or visiting information.
6. Optional small tasting or spirits feature when current content exists.
7. Existing footer, preserving its visual design.

### Shop and search

Use a clear category title, result count and labelled sort control. Desktop filters can sit in a quiet side column; mobile filters use a sheet with visible applied filters and a reset action. Start with fields supported by the catalogue. Store filters in the URL so reload, back navigation and shared links preserve the selection.

Use two to four product columns as space permits, falling back to one when names or specifications would become cramped. Brand and full cigar name come first, followed by origin, strength and dimensions. Display the exact format only when recorded. Show sold quantity beside the price. A shopper should be able to compare items without opening each page.

### Product detail

Use a generous image alongside a composed purchase area: brand, series/name, concise description, price and sold quantity, availability, quantity choice where supported, and purchase action. Follow with a clearly labelled specification list and longer blend or tasting notes. Keep reviews and related products below the primary decision information. Use an accordion for secondary delivery or care information, keeping essential specifications visible.

The current cigar schema contains origin, strength, length, ring gauge, wrapper and optional ageing. It does not contain explicit vitola, pack quantity, cigar blend or smoking-duration fields. Add verified catalogue fields deliberately before promising filters or facts based on them. Never infer strength from wrapper colour or invent smoking durations from dimensions.

### Cart and checkout

Use recognisable product rows, clear quantities and a compact order summary. Keep totals, shipping and available payment choices explicit. Forms need persistent labels and inline validation. Preserve the current server actions, payment flow, age safeguards and newsletter behaviour while changing their presentation.

### Account and administration

Make account pages resemble customer service: orders, addresses and profile forms with modest navigation. Keep the administration interface practical and dense where that helps staff. Dashboard patterns have a place in `/admin`; they should not set the storefront's visual language.

## Interaction and acceptance criteria

- All primary tasks work by keyboard, with visible focus. Sheets trap focus, close on Escape and return focus to their trigger.
- Use at least 44px primary controls and keep form text readable at 200% zoom. Do not hide product facts behind hover.
- Target WCAG AA contrast: 4.5:1 for ordinary text and 3:1 for required control boundaries. Test actual states, including image overlays.
- Respect reduced motion. Use brief colour transitions; remove automatic carousels, card movement and image zoom from the new storefront.
- Verify layouts at 360px, 768px, 1280px and 1536px, with long product names, missing data, empty results and unavailable products.
- Check DE, EN, AR, CN and RU, including RTL navigation, sheet placement, logical spacing and mixed-direction prices or identifiers.
- Keep the footer visually equivalent at desktop and mobile sizes, including newsletter controls, link columns, payment marks and the age notice.

Before wider rollout, ask existing customers to locate a familiar cigar, compare two alternatives and complete a purchase task. Record confusion and task completion rather than assuming this visual direction proves an audience preference.

## Reference points

[Cigarworld's cigar catalogue](https://www.cigarworld.de/zigarren) provides a reference for shopping through brands, countries and cigar characteristics. [Davidoff of Geneva](https://us.davidoffgeneva.com/) provides a reference for presenting named collections and product photography. These inform catalogue structure and editorial treatment; Zigarren Puro keeps its own merchant identity and existing footer.

Implementation tasks and completion criteria: [UI migration plan](ui-migration-plan.md).
