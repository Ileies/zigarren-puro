# TODO

## Offen

### Kernfunktionen (E-Commerce)

- [x] **Checkout** — `/checkout` + `/checkout/confirmation`: 2-Schritt-Flow, Adressauswahl (gespeichert/neu), Versandart (Standard/Express), Vorkasse-Zahlung, Bestellbestätigung mit Bankdaten. **Bankdaten in `confirmation/+page.svelte` und `functions.ts` noch mit echten Daten befüllen.**
- [ ] **Zahlungs-Gateway** — Stripe (Karte) und/oder PayPal integrieren. Schema (`schemaShop`) ist vorbereitet.

### Benutzerbereich

- [ ] **Passwort-Reset** `/forgot-password` — `TokenType.PASSWORD_RESET` ist im Schema definiert, Route und UI fehlen komplett.
- [x] **Mein Konto / Profil** `/account` — Profil bearbeiten (Name, Telefon, Anrede, Marketing-Einwilligung), Passwort ändern; Adressverwaltung unter `/account/addresses`.
- [ ] **Bestellhistorie** — Bestellungen für eingeloggte Nutzer anzeigen (Admin-Seite existiert, Kundenseite fehlt).
- [ ] **Wunschliste** — Schema prüfen/ergänzen, UI in Produktdetail und Profilseite.
- [ ] **Produktbewertungen** — Bewertungsformular auf Produktdetailseite, Anzeige von Durchschnitt und Einzelrezensionen.

### Formulare & Kleinigkeiten

- [ ] **Newsletter-Anmeldung** (Footer) — Formular existiert, aber Submit-Handler fehlt (`TODO`-Kommentar in `Footer.svelte:42`).
- [ ] **Karriere-Bewerbungsformular** `/career` — macht aktuell nur einen Fake-Submit mit `setTimeout`, kein echter Versand (`TODO`-Kommentar in `+page.svelte:15`).

### Admin

- [ ] **Produkt-Detailbearbeitung** `/admin/inventory/[id]` — aktuell Stub. Vollständiges Bearbeitungsformular für alle Produktfelder (inkl. typ-spezifische Details: Zigarren, Spirituosen etc.).

### Compliance & Rechtliches

- [ ] **Altersverifikation beim Checkout** — serverseitig prüfen, dass der Nutzer eingeloggt ist und das hinterlegte Geburtsdatum ≥ 18 Jahre ergibt. Geburtsdatum wird bei der Registrierung bereits erfasst.

## Erledigt

- [x] **Warenkorb** `/cart` — Cookie-basierter Cart-State, Mengenänderung, Entfernen, Leeren, Zwischensumme + Versandberechnung, Badge im Header, "In den Warenkorb" auf Produkt- und Shop-Seite.
- [x] **Produktkatalog** `/shop` — Route mit Datenbankanbindung, Typ-Filter und Sortierung.
- [x] **Suchseite** `/search` — Volltext-Suche (ILIKE) + Typ-Filter mit DB-Anbindung.
- [x] **Produktdetailseite** `/products/[id]` — Vollständige Produktinfos inkl. typ-spezifischer Details (Zigarre, Spirituose, Zubehör).

- [x] Datenbankschema (Auth, Produkte, Shop, Logs)
- [x] Authentifizierung (Registrierung, Login, Logout, E-Mail-Verifizierung)
- [x] Admin-Panel — Dashboard, Inventarverwaltung, Bestellverwaltung
- [x] FAQ `/faq`
- [x] Partner `/partners`
- [x] News `/news`
- [x] Mehrsprachigkeit (DE, EN, ZH, RU, AR) — i18n-Plugin
- [x] Newsletter-Abmeldung `/unsubscribe`
- [x] Kontaktformular `/contact`
- [x] Rechtliche Seiten (Impressum, Datenschutz, AGB, Widerruf)
