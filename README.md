# Zigarren Puro

Premium-Webshop für Zigarren, Zigarillos, Spirituosen und Zubehör.

## Stack

| Bereich | Technologie |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 |
| Styling | Tailwind CSS 4 + DaisyUI 5 |
| Datenbank | PostgreSQL (Supabase) via Drizzle ORM |
| Laufzeit | Bun |
| E-Mail | Nodemailer (netcup SMTP) |
| Auth | crypto.scrypt, eigenes Session-System |
| i18n | Eigenes Vite-Plugin (DE/EN/AR/CN/RU) |

## Voraussetzungen

- Bun
- PostgreSQL-Datenbank (Supabase-Projekt)

## Setup

```bash
bun install
cp .env.example .env   # Variablen befüllen
bun run db:push        # Schema in DB pushen
bun run dev
```

## Befehle

```bash
bun run dev       # Dev-Server
bun run build     # Produktions-Build
bun run check     # TypeScript + SvelteKit type check
bun run db:push   # Schema auf DB pushen
bun run format    # Prettier
```

## Umgebungsvariablen

| Variable | Beschreibung |
|---|---|
| `DATABASE_URL` | PostgreSQL-Verbindungsstring |
| `PUBLIC_ORIGIN` | Produktions-Domain |
| `PUBLIC_APP_NAME` | App-Name |
| `ADMIN_PASSWORD` | Passwort für `/admin` |
| `SECRET` | Base64-Token für Token-Generierung |
| `FROM_EMAIL` | Absender-Adresse für transaktionale E-Mails |
| `SMTP_HOST/PORT/USER/PASS` | SMTP-Zugangsdaten |
| `OPENAI_API_KEY` | Für Produktbeschreibungen |

Weitere Variablen (Stripe, PostHog, Google OAuth) sind vorbereitet, aber noch nicht aktiv.
