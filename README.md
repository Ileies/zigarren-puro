# Zigarren Puro

Premium-Webshop für Zigarren, Zigarillos, Spirituosen und Zubehör.

## Stack

| Bereich   | Technologie                                                     |
| --------- | --------------------------------------------------------------- |
| Framework | SvelteKit 3 + Svelte 5                                          |
| Styling   | Tailwind CSS 4 + shadcn-svelte; DaisyUI 5 während der Migration |
| Datenbank | SQLite via Bun SQLite + Drizzle ORM                             |
| Laufzeit  | Bun                                                             |
| E-Mail    | Nodemailer (netcup SMTP)                                        |
| Auth      | crypto.scrypt, eigenes Session-System                           |
| i18n      | Eigenes Vite-Plugin (DE/EN/AR/CN/RU)                            |

## Voraussetzungen

- Bun 1.4 oder neuer

## Setup

```bash
bun install
bun run db:push        # Schema in DB pushen
bun run dev
```

## Befehle

```bash
bun run dev       # Dev-Server
bun run build     # Produktions-Build
bun run check     # TypeScript + SvelteKit type check
bun run ui:add    # Weitere shadcn-svelte-Komponenten hinzufügen
bun run db:push   # Schema auf DB pushen
bun run format    # Prettier
```

Der Produktions-Build läuft mit Bun. `bun run build` erzeugt den Server unter `build`; starte ihn mit `bun ./build`.

## Design und UI Migration

Die neue UI-Basis ist mit shadcn-svelte eingerichtet. DaisyUI bleibt während der schrittweisen Migration für bestehende Seiten aktiv. Der bestehende Footer bleibt gestalterisch erhalten.

- [Designentscheidungen](docs/design-direction.md): Zielgruppe, Gestaltung, Produktdarstellung und Seitenaufbau.
- [Migrationsplan](docs/ui-migration-plan.md): Einrichtung, Theme-Grenzen, konkrete Aufgaben pro Route und Abnahmekriterien.

Neue Komponenten über `bun run ui:add <name>` hinzufügen und aus `#lib/components/ui/<name>/index.js` importieren. SvelteKit 3 hat den früheren `$lib`-Import entfernt; die Konfiguration nutzt deshalb den bestehenden `#lib`-Alias des Projekts. Migrierte Bereiche mit `.puro-ui` umschließen; den bestehenden Footer dabei ausnehmen. `shadcn init` nicht erneut ausführen, da es das globale CSS überschreiben kann.

## Umgebungsvariablen

| Variable                   | Beschreibung                                |
| -------------------------- | ------------------------------------------- |
| `DATABASE_PATH`            | SQLite-Datei, Standard `./local.db`         |
| `PUBLIC_ORIGIN`            | Produktions-Domain                          |
| `PUBLIC_APP_NAME`          | App-Name                                    |
| `ADMIN_PASSWORD`           | Passwort für `/admin`                       |
| `SECRET`                   | Base64-Token für Token-Generierung          |
| `FROM_EMAIL`               | Absender-Adresse für transaktionale E-Mails |
| `SMTP_HOST/PORT/USER/PASS` | SMTP-Zugangsdaten                           |
| `OPENAI_API_KEY`           | Für Produktbeschreibungen                   |

Weitere Variablen (Stripe, PostHog, Google OAuth) sind vorbereitet, aber noch nicht aktiv.
