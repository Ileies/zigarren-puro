# Zigarren Puro — CLAUDE.md

Onlineshop für Premiumzigarren und Spirituosen. SvelteKit 5 + Drizzle ORM + PostgreSQL (Supabase). Mehrsprachig (DE/EN/AR/CN/RU). Gehostet auf eigenem Server mit `@sveltejs/adapter-node`.

## Offene Aufgaben

Alle offenen und erledigten Features sind in [`TODO.md`](./TODO.md) gepflegt. Vor Beginn neuer Features dort nachschauen.

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 |
| Styling | Tailwind CSS 4 + DaisyUI 5 |
| Datenbank | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| E-Mail | Nodemailer (SMTP via netcup) |
| Laufzeit | Bun |
| Icons | Lucide Svelte |
| Validierung | Zod 4 |
| Analytics | PostHog |

Kein `bunx` — immer `bun x` verwenden.

---

## Verzeichnisstruktur

```
src/
├── app.d.ts                    # Locals-Interface (user, dbOffline, device, locale, dir)
├── hooks.ts                    # reroute-Hook
├── hooks.server.ts             # Middleware-Kette: handleAdmin → handleChecks → handleAuth → handleLocale
├── lib/
│   ├── config.ts               # Domain, Kontaktdaten, Social-Links
│   ├── types.ts                # Enums: LogLevel, TokenType, ProductType, OrderStatus, PaymentMethod, …
│   ├── messages.ts             # AUTO-GENERIERT vom i18n-Plugin — nicht manuell bearbeiten
│   ├── i18n-plugin.ts          # Vite-Plugin: kompiliert messages/*.json → messages.ts
│   ├── app.svelte.ts           # Globaler App-State (Svelte 5 runes)
│   ├── components/
│   │   ├── Header.svelte
│   │   ├── Footer.svelte
│   │   ├── Carousel.svelte
│   │   ├── LanguageSelector.svelte
│   │   ├── Map.svelte
│   │   ├── Picture.svelte
│   │   ├── Placeholder.svelte
│   │   └── homepage/           # Nur auf der Startseite verwendete Komponenten
│   └── server/
│       ├── auth.ts             # hashPassword, verifyPassword, Session-Management
│       ├── functions.ts        # E-Mail-Versand, Hilfsfunktionen
│       ├── Logger.ts           # Strukturiertes Logging (schreibt in DB)
│       └── db/
│           ├── index.ts        # Drizzle-Instanz
│           └── schema/
│               ├── index.ts    # Re-Export aller Schemas
│               ├── schemaAuth.ts     # auth_credentials, sessions, tokens
│               ├── schemaShop.ts     # customers, addresses, orders, order_items
│               ├── schemaProducts.ts # producers, products, categories, detail-Tabellen
│               └── schemaLog.ts      # logs
├── routes/
│   ├── +layout.svelte          # Haupt-Layout: Header, Footer, Error-Toast
│   ├── +layout.server.ts       # Lädt: dbOffline, user (für alle Seiten)
│   ├── +error.svelte
│   ├── (legal)/                # Routegruppe: /privacy, /terms, /imprint, /cancellation
│   ├── (static)/               # Routegruppe: /career
│   ├── admin/                  # Basic-Auth geschützt (ADMIN_PASSWORD)
│   │   ├── +layout.svelte
│   │   ├── inventory/[id]/     # Stub — vollständige Bearbeitung fehlt noch
│   │   └── orders/[id]/
│   └── …                       # login, register, logout, verify-email, contact, search, cart, …
messages/
├── de.json                     # Standardsprache
├── en.json
├── ar.json
├── cn.json
└── ru.json
```

---

## Datenbank

Schema-Dateien liegen unter `src/lib/server/db/schema/`. Alias: `$db` → `src/lib/server/db`.

**Schema-Übersicht:**

- `schemaAuth`: `auth_credentials`, `sessions` (30 Tage), `tokens` (einmalige Tokens für Verifikation/Reset/Abmeldung)
- `schemaShop`: `customers` (inkl. `birthDate` für Altersverifikation), `addresses`, `orders`, `order_items`
- `schemaProducts`: `products` (Basis), `producers`, `product_categories`, `product_category_mappings`, plus Detailtabellen:
  - `cigar_details` (Länge, Ringmaß, Stärke, Deckblatt, Herkunft, Reifung)
  - `cigarillo_details`
  - `beverage_details` (Volumen, ABV, Typ, Land, Reifung, Geschmacksnotizen)
  - `tool_details` (Material, Marke, Pflegehinweise)
- `schemaLog`: `logs`

**Migrations:**
```bash
bun run db:push    # Schema auf Supabase pushen (kein Migration-File, direktes Push)
```

---

## Auth

- Passwort-Hashing: `crypto.scrypt` mit 16-Byte-Salt (timing-sicher)
- Sessions: Cookie `session` (httpOnly, secure), 30-Tage-Ablauf, Auto-Renewal ab 15 Tagen
- Fehlversuche: 5 Versuche → 15 Minuten Sperre
- E-Mail-Verifikation: Pflicht nach Registrierung (Token in `tokens`-Tabelle)
- Admin-Bereich: HTTP Basic Auth, Passwort aus `ADMIN_PASSWORD`-Env

`locals.user` ist im Root-Layout-Server geladen und steht auf allen Seiten zur Verfügung.

---

## i18n

**Nicht Paraglide** — eigenes Vite-Plugin (`src/lib/i18n-plugin.ts`).

- Übersetzungen: `messages/*.json` (Schlüssel-Wert, Parameter mit `{placeholder}`)
- Standardsprache: `de`
- `messages.ts` wird **automatisch generiert** — **niemals manuell bearbeiten oder manuell neu generieren**
- Neue Texte: In alle 5 JSON-Dateien eintragen, dann `bun run dev` neu starten
- `messages.ts` regenerieren: **immer** über `bun run dev` oder `bun run build` — nie per Script oder Bash-Einzeiler
- Sprachauswahl: Cookie `LOCALE` (Browser oder LanguageSelector-Komponente)
- RTL: Arabisch wird automatisch erkannt, `locals.dir` = `"rtl"`
- Zugriff auf dem Server: `locals.locale`, `locals.dir`
- Zugriff im Client: importierte Funktionen aus `$lib/messages`

---

## Middleware (hooks.server.ts)

Reihenfolge der Handle-Kette:

1. **handleAdmin** — `/admin/*`-Routen mit Basic Auth absichern
2. **handleChecks** — DB-Erreichbarkeit prüfen (`locals.dbOffline`), User-Agent auswerten (`locals.device`)
3. **handleAuth** — Session-Cookie validieren, `locals.user` setzen
4. **handleLocale** — `locals.locale` und `locals.dir` aus Cookie/Accept-Language auflösen

---

## Umgebungsvariablen (`.env`)

| Variable | Beschreibung |
|---|---|
| `DATABASE_URL` | PostgreSQL-Verbindungsstring (Supabase) |
| `PUBLIC_ORIGIN` | `zigarren-puro.de` |
| `PUBLIC_APP_NAME` | `Zigarren Puro` |
| `ADMIN_PASSWORD` | Passwort für `/admin`-Bereich |
| `SECRET` | Base64-Token für Token-Generierung |
| `FROM_EMAIL` | `info@zigarren-puro.de` |
| `SMTP_HOST/PORT/USER/PASS` | Netcup-SMTP-Zugangsdaten |
| `OPENAI_API_KEY` | Konfiguriert (Produktbeschreibungen) |
| `STRIPE_SECRET_KEY` | Leer — Stripe noch nicht implementiert |
| `PUBLIC_POSTHOG_KEY` | Leer — Analytics noch nicht aktiv |
| `GOOGLE_CLIENT_ID/SECRET` | Leer — OAuth nicht implementiert |

---

## Wichtige Konventionen

- **Kein `+server.ts`** — alle Server-Logik läuft über `+page.server.ts` Form Actions und Load-Funktionen
- **Svelte 5 Runes** (`$state`, `$derived`, `$effect`) — kein Legacy-Store-API
- **Tailwind 4** — kein `tailwind.config.js`, Konfiguration direkt im CSS
- **Keine API-Routes** — REST-ähnliche Logik über SvelteKit Form Actions
- **Formulare** — Progressive Enhancement mit `use:enhance`
- **Fehler-Logging** — über `Logger`-Klasse (`src/lib/server/Logger.ts`), schreibt in `logs`-Tabelle
- **Alias `$db`** → `src/lib/server/db` (Drizzle-Instanz + Schema-Imports)

---

## Häufige Befehle

```bash
bun run dev          # Dev-Server starten
bun run build        # Produktions-Build
bun run check        # TypeScript + SvelteKit type check
bun run db:push      # Schema auf DB pushen
bun run format       # Prettier
```
