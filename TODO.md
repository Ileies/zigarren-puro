# TODO

## Offen

### Kernfunktionen (E-Commerce)

- [x] **Checkout** — `/checkout` + `/checkout/confirmation`: 2-Schritt-Flow, Adressauswahl (gespeichert/neu), Versandart (Standard/Express), Vorkasse-Zahlung, Bestellbestätigung mit Bankdaten. **Bankdaten in `confirmation/+page.svelte` und `functions.ts` noch mit echten Daten befüllen.**
- [ ] **Zahlungs-Gateway** — Stripe (Karte) und/oder PayPal integrieren. Schema (`schemaShop`) ist vorbereitet.

### Benutzerbereich

- [x] **Passwort-Reset** `/forgot-password` + `/reset-password` — E-Mail-Flow mit 1h-Token, User-Enumeration-sicher.
- [x] **Mein Konto / Profil** `/account` — Profil bearbeiten (Name, Telefon, Anrede, Marketing-Einwilligung), Passwort ändern; Adressverwaltung unter `/account/addresses`.
- [x] **Bestellhistorie** — Bestellungen für eingeloggte Nutzer anzeigen (Admin-Seite existiert, Kundenseite fehlt).
- [ ] **Wunschliste** — Schema prüfen/ergänzen, UI in Produktdetail und Profilseite.
- [ ] **Produktbewertungen** — Bewertungsformular auf Produktdetailseite, Anzeige von Durchschnitt und Einzelrezensionen.

### Formulare & Kleinigkeiten

- [x] **Newsletter-Anmeldung** (Footer) — POSTet an `/newsletter?/subscribe`; setzt `marketingConsent` für bestehende Kunden, sendet Bestätigungs-E-Mail.
- [x] **Karriere-Bewerbungsformular** `/career` — sendet E-Mail an Shop-Postfach, Honeypot, Erfolgs-/Fehlermeldung.

### Admin

- [x] **Produkt-Detailbearbeitung** `/admin/inventory/[id]` — vollständiges Bearbeitungsformular für alle Produktfelder (inkl. typ-spezifische Details: Zigarren, Spirituosen etc.).

### Compliance & Rechtliches

- [x] **Altersverifikation beim Checkout** — serverseitig prüfen, dass der Nutzer eingeloggt ist und das hinterlegte Geburtsdatum ≥ 18 Jahre ergibt. Geburtsdatum wird bei der Registrierung bereits erfasst.

## Ideen & Strategische Konzepte

> Keine konkreten Tasks — Denkansätze für die Weiterentwicklung der Plattform.

---

### Zigarren-Sammler-Plattform ("Vivino-Modell für Zigarren-Enthusiasten")

**Kernidee:** Zigarren Puro wird vom reinen Webshop zur führenden deutschsprachigen Community-Plattform für Zigarren-Kenner — analog zu Vivino für Wein oder Untappd für Craft Beer. Jeder eingeloggte Nutzer bekommt ein persönliches Connoisseur-Profil: eine Art digitales Humidor-Tagebuch kombiniert mit sozialem Netzwerk. Der Shop ist nur noch der Einstieg; die Community ist der Grund zu bleiben.

#### Persönlicher Zigarren-Log

Jede Zigarre in der Datenbank kann ein Nutzer in seinen Sammlerstatus aufnehmen:

| Status | Bedeutung |
|---|---|
| **Geraucht** | War dabei, kann bewerten |
| **Im Humidor** | Physisch vorhanden, wird noch gelagert |
| **Auf der Wunschliste** | Möchte sie ausprobieren |
| **Bestellt** | Unterwegs |

Pro Eintrag können strukturierte **Tasting Notes** hinterlegt werden: Zugwiderstand, Brennverhalten, Asche, Aroma (Einlage/Umblatt/Deckblatt), Geschmacksnotizen (Holz, Leder, Kaffee, Kakao, …), Rauchzeit, Anlass, Paarung (Whisky, Rum, Kaffee). Das ist wertvoller als jede Produktbeschreibung vom Hersteller.

#### Community-Datenbankpflege ("Missing Cigar"-Requests)

Viele Kleinserien, Private-Label-Zigarren und Neuheiten fehlen in jeder Datenbank. Nutzer können eine **Ergänzungsanfrage** stellen: Marke, Name, Vitola, Herkunft. Andere Nutzer können diese Anfrage upvoten. Ab einer Schwelle (z. B. 10 Votes) landet sie in einer Admin-Queue — die Community hilft also aktiv dabei, den Katalog vollständig zu machen, was wiederum SEO und Sortimentsplanung zugute kommt.

#### Das Connoisseur-Profil

Öffentliche Profilseite mit:
- **Statistiken:** Anzahl gerauchter Zigarren, Lieblingsherkunftsländer (Karte!), Top-Hersteller, Vitola-Verteilung, durchschnittliche Bewertung, Rauchjahre
- **Showcase:** Die 3 Lieblingszigarren prominent hervorgehoben
- **Aktivitäts-Feed:** "Hat heute eine Cohiba Behike 56 geraucht" — optional sichtbar für Follower
- **Badges/Achievements:** Gamification-Elemente wie "Karibik-Kenner" (10 kubanische Zigarren), "Globetrotter" (Zigarren aus 10 Ländern), "Connoisseur Elite" (100 verschiedene Zigarren), "Vintage Hunter" (Zigarre mit ≥10 Jahren Reifung)

#### Soziales Netz

Nutzer können anderen Sammlern **folgen**. Ein persönlicher Feed zeigt, was Freunde aktuell rauchen, neu bewertet haben oder auf die Wunschliste gesetzt haben. Das schafft sozialen Druck ("mein Freund hat diese Cohiba — ich will sie auch probieren") und direkten Kaufimpuls ohne Werbung.

#### Warum das funktioniert (Business Case)

- **Retention:** Ein gepflegtes Profil und eine aufgebaute Freundesliste sind starke Lock-in-Faktoren. Vivino und Untappd haben damit jeweils Millionen User dauerhaft gebunden.
- **Conversion:** Social Proof durch echte Tasting Notes von Bekannten überzeugt stärker als Produktbeschreibungen. "Mein Freund Max gibt ihr 9/10" schlägt jede Marketingkopie.
- **SEO & Content:** Hunderte nutzergenerierte Rezensionen pro Produkt = einzigartiger Longtail-Content, der sich von selbst aufbaut.
- **Sortiment:** Die "Missing Cigar"-Votes sind marktforschung in Echtzeit — man weiß genau, was Kunden haben wollen, bevor man einkauft.
- **Network Effects:** Je mehr Nutzer, desto wertvoller das Netzwerk für jeden einzelnen → Wachstum beschleunigt sich selbst.
- **Upsell:** Premium-Account ("Humidor Pro") mit erweiterten Statistiken, Export-Funktion, priorisierten Datenbankwünschen.

#### Technische Anbindung

- Neue Tabellen: `cigar_logs` (user_id, product_id, status, date, rating, notes), `tasting_notes` (strukturierte Felder), `cigar_requests` (missing cigars + votes), `follows` (follower/following)
- Bestehende Wunschliste (`TODO: offen`) kann direkt als "Wunschliste"-Status im Log aufgehen
- Bestehende Produktbewertungen (`TODO: offen`) werden Teil der Tasting Notes

---

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
