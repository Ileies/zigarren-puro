# Zigarren Puro -- CLAUDE.md

Premium-Webshop für Zigarren und Spirituosen. SvelteKit 5 + Drizzle ORM + SQLite (better-sqlite3). Gehostet auf eigenem Server mit `@sveltejs/adapter-node`.

Offene Tasks: [`TODO.md`](./TODO.md)

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 |
| Styling | Tailwind CSS 4 + DaisyUI 5 |
| Datenbank | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| E-Mail | Nodemailer (SMTP via netcup) |
| Laufzeit | Node.js (Bun nur als Package Manager) |
| Icons | Lucide Svelte |
| Validierung | Zod 4 |
| Analytics | PostHog |

Bun wird nur als Package Manager genutzt (`bun install`, `bun run <script>`). Die App läuft mit Node.js (kein `bun:sqlite`, kein `bun:*`-Imports).

---

## Projektstruktur

```
src/
  app.d.ts                     # Locals: user, dbOffline, device, locale, dir
  hooks.ts                     # reroute-Hook
  hooks.server.ts              # Middleware: handleAdmin > handleChecks > handleAuth > handleLocale
  lib/
    config.ts                  # Domain, Kontaktdaten, bankAccount, Social-Links
    types.ts                   # Enums: LogLevel, TokenType, ProductType, OrderStatus, ...
    messages.ts                # AUTO-GENERIERT -- nie manuell bearbeiten
    i18n-plugin.ts             # Vite-Plugin: messages/*.json -> messages.ts
    app.svelte.ts              # Globaler App-State (Svelte 5 runes)
    components/
      Header.svelte
      Footer.svelte
      Carousel.svelte
      LanguageSelector.svelte
      Map.svelte
      Picture.svelte
      homepage/                # Startseite-Komponenten
    server/
      auth.ts                  # hashPassword, verifyPassword, Session-Management
      functions.ts             # E-Mail-Versand, Hilfsfunktionen
      Logger.ts                # Logging in DB
      db/
        index.ts               # Drizzle-Instanz (Alias: $db)
        schema/
          index.ts             # Re-Export aller Schemas
          schemaAuth.ts        # auth_credentials, sessions, tokens
          schemaShop.ts        # customers, addresses, orders, order_items, wishlists, product_reviews
          schemaProducts.ts    # products, producers, categories, detail-Tabellen
          schemaLog.ts         # logs
  routes/
    +layout.svelte / +layout.server.ts
    +page.svelte                         # Homepage
    (legal)/                             # privacy, terms, imprint, cancellation
    (static)/                            # career
    about/
    account/
      +page                              # Profil-Dashboard
      addresses/
      confirm-email/                     # E-Mail-Änderung bestätigen
      orders/
      wishlist/
    admin/                               # Basic Auth (ADMIN_PASSWORD)
      +page                              # Dashboard
      inventory/[id]/                    # Produkt bearbeiten inkl. Bild-Upload
      orders/ + orders/[id]/
    cart/
    checkout/ + checkout/confirmation/
    contact/
    faq/
    forgot-password/ + reset-password/
    login/ + logout/ + register/ + verify-email/
    news/ + partners/ + tastings/
    newsletter/
    products/[id]/
    returns/ + shipping/
    search/ + shop/
    unsubscribe/
messages/
  de.json   # Standardsprache
  en.json / ar.json / cn.json / ru.json
```

---

## Datenbank

Alias `$db` zeigt auf `src/lib/server/db`.

- `schemaAuth`: `auth_credentials`, `sessions` (30 Tage), `tokens` (einmalig; `metadata` als JSON-String für Zusatzdaten, z. B. neue E-Mail bei `EMAIL_CHANGE`)
- `schemaShop`: `customers` (inkl. `birthDate`), `addresses`, `orders`, `order_items`, `wishlists` (Composite PK: customerId + productId), `product_reviews` (rating 1-5, unique pro Nutzer+Produkt)
- `schemaProducts`: `products`, `producers`, `product_categories`, `product_category_mappings`, `cigar_details`, `cigarillo_details`, `beverage_details`, `tool_details`
- `schemaLog`: `logs`

```bash
bun run db:push    # Schema auf SQLite pushen (kein Migration-File, direktes Push)
```

---

## Auth

- Passwort-Hashing: `crypto.scrypt` mit 16-Byte-Salt (timing-sicher)
- Sessions: Cookie `session` (httpOnly, secure), 30 Tage, Auto-Renewal ab 15 Tagen
- Fehlversuche: 5 Versuche -> 15 Minuten Sperre
- E-Mail-Verifikation: Pflicht nach Registrierung
- E-Mail-Änderung: Neue Adresse + Passwort -> `EMAIL_CHANGE`-Token (neue E-Mail in `metadata`) -> Bestätigungs-E-Mail -> `/account/confirm-email` schreibt DB
- Admin: HTTP Basic Auth via `ADMIN_PASSWORD`

`locals.user` steht auf allen Seiten zur Verfügung (Root-Layout-Server).

---

## i18n

Eigenes Vite-Plugin -- kein Paraglide.

- Übersetzungen in `messages/*.json` (Key-Value, Parameter als `{placeholder}`)
- `messages.ts` wird automatisch generiert -- **niemals manuell bearbeiten**
- `messages.ts` regenerieren: ausschließlich über `bun run dev` oder `bun run build`
- Neue Texte: in alle 5 JSON-Dateien eintragen, dann Dev-Server neu starten
- RTL: Arabisch automatisch erkannt, `locals.dir = "rtl"`
- Server: `locals.locale`, `locals.dir` -- Client: Imports aus `$lib/messages`

---

## Middleware (hooks.server.ts)

1. **handleAdmin** -- `/admin/*` mit Basic Auth absichern
2. **handleChecks** -- DB-Erreichbarkeit (`locals.dbOffline`), User-Agent (`locals.device`)
3. **handleAuth** -- Session validieren, `locals.user` setzen
4. **handleLocale** -- `locals.locale` und `locals.dir` aus Cookie/Accept-Language

---

## Konventionen

- Kein `+server.ts` -- alle Server-Logik in `+page.server.ts` (Form Actions + Load)
- Svelte 5 Runes (`$state`, `$derived`, `$effect`, `$props`) -- kein Legacy-Store-API
- Tailwind 4 -- kein `tailwind.config.js`, Konfiguration direkt im CSS
- Formulare mit `use:enhance` (Progressive Enhancement)
- Logging über `Logger`-Klasse (`src/lib/server/Logger.ts`), schreibt in `logs`-Tabelle
- Alias `$db` zeigt auf `src/lib/server/db`

---

## Umgebungsvariablen

| Variable | Beschreibung |
|---|---|
| `PUBLIC_ORIGIN` | `zigarren-puro.de` |
| `PUBLIC_APP_NAME` | `Zigarren Puro` |
| `ADMIN_PASSWORD` | Passwort für `/admin` |
| `SECRET` | Base64-Token für Token-Generierung |
| `FROM_EMAIL` | `info@zigarren-puro.de` |
| `SMTP_HOST/PORT/USER/PASS` | Netcup-SMTP-Zugangsdaten |
| `OPENAI_API_KEY` | Konfiguriert (Produktbeschreibungen) |
| `STRIPE_SECRET_KEY` | Leer -- noch nicht implementiert |
| `PUBLIC_POSTHOG_KEY` | Leer -- Analytics noch nicht aktiv |
| `GOOGLE_CLIENT_ID/SECRET` | Leer -- OAuth nicht implementiert |

---

## Befehle

```bash
bun run dev          # Dev-Server
bun run build        # Produktions-Build
bun run check        # TypeScript + SvelteKit type check
bun run db:push      # Schema auf DB pushen
bun run format       # Prettier
```
