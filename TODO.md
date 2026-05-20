# TODO

## Offen

- [ ] **UI-Framework auf shadcn-svelte migrieren** -- Aktuell DaisyUI; für einen Premium-Brand mit reguliertem Commerce-Kontext ist shadcn die bessere Basis (mehr Kontrolle, professionelleres Erscheinungsbild, kein generischer DaisyUI-Look).
- [ ] **Zahlungs-Gateway** -- Stripe (Karte) und/oder PayPal integrieren. Schema (`schemaShop`) ist vorbereitet.

---

## Ideen & Strategische Konzepte

> Keine konkreten Tasks -- Denkansätze für die Weiterentwicklung der Plattform.

---

### Zigarren-Sammler-Plattform ("Vivino-Modell für Zigarren-Enthusiasten")

**Kernidee:** Zigarren Puro wird vom reinen Webshop zur führenden deutschsprachigen Community-Plattform für Zigarren-Kenner -- analog zu Vivino für Wein oder Untappd für Craft Beer. Jeder eingeloggte Nutzer bekommt ein persönliches Connoisseur-Profil: eine Art digitales Humidor-Tagebuch kombiniert mit sozialem Netzwerk. Der Shop ist nur noch der Einstieg; die Community ist der Grund zu bleiben.

#### Persönlicher Zigarren-Log

Jede Zigarre in der Datenbank kann ein Nutzer in seinen Sammlerstatus aufnehmen:

| Status | Bedeutung |
|---|---|
| Geraucht | War dabei, kann bewerten |
| Im Humidor | Physisch vorhanden, wird noch gelagert |
| Auf der Wunschliste | Möchte sie ausprobieren |
| Bestellt | Unterwegs |

Pro Eintrag können strukturierte Tasting Notes hinterlegt werden: Zugwiderstand, Brennverhalten, Asche, Aroma (Einlage/Umblatt/Deckblatt), Geschmacksnotizen (Holz, Leder, Kaffee, Kakao, ...), Rauchzeit, Anlass, Paarung (Whisky, Rum, Kaffee).

#### Community-Datenbankpflege ("Missing Cigar"-Requests)

Nutzer können eine Ergänzungsanfrage stellen: Marke, Name, Vitola, Herkunft. Andere Nutzer können upvoten. Ab einer Schwelle (z. B. 10 Votes) landet die Anfrage in einer Admin-Queue. Die Community hilft so aktiv dabei, den Katalog zu vervollständigen -- gut für SEO und Sortimentsplanung.

#### Das Connoisseur-Profil

Öffentliche Profilseite mit:
- Statistiken: Anzahl gerauchter Zigarren, Lieblingsherkunftsländer, Top-Hersteller, Vitola-Verteilung, Rauchjahre
- Showcase: Die 3 Lieblingszigarren prominent hervorgehoben
- Aktivitäts-Feed: optional sichtbar für Follower
- Badges/Achievements (Gamification): "Karibik-Kenner", "Globetrotter", "Connoisseur Elite", "Vintage Hunter"

#### Soziales Netz

Nutzer können anderen Sammlern folgen. Ein persönlicher Feed zeigt, was Freunde aktuell rauchen, neu bewertet haben oder auf die Wunschliste gesetzt haben. Direkter Kaufimpuls ohne Werbung.

#### Business Case

- **Retention:** Ein gepflegtes Profil und eine aufgebaute Freundesliste sind starke Lock-in-Faktoren (vgl. Vivino, Untappd).
- **Conversion:** Social Proof durch echte Tasting Notes von Bekannten schlägt jede Marketingkopie.
- **SEO & Content:** Nutzergenerierte Rezensionen pro Produkt = einzigartiger Longtail-Content.
- **Sortiment:** "Missing Cigar"-Votes sind Echtzeit-Marktforschung -- man weiß genau, was Kunden wollen.
- **Network Effects:** Je mehr Nutzer, desto wertvoller das Netzwerk für jeden einzelnen.
- **Upsell:** Premium-Account ("Humidor Pro") mit erweiterten Statistiken, Export, priorisierten Datenbankwünschen.

#### Technische Anbindung

Neue Tabellen: `cigar_logs` (user_id, product_id, status, date, rating, notes), `tasting_notes` (strukturierte Felder), `cigar_requests` (missing cigars + votes), `follows` (follower/following). Bestehende Wunschliste und Produktbewertungen können in den Log aufgehen.

---

### Abonnement-Service ("Box of the Month")

Kunden abonnieren eine monatliche Lieferbox mit Zigarren und/oder Spirituosen -- kuratiert nach Geschmacksprofil oder als Überraschungsbox. Recurring Revenue, hoher Customer Lifetime Value, und ein starker Differentiator gegenüber dem klassischen Einzelkauf. Bekanntes Modell aus dem Wein-Segment (Vinello, Hello Fresh-Prinzip), im Zigarren-Segment deutschsprachig bisher kaum besetzt.

Technisch: neue Tabelle `subscriptions` (plan, intervall, nächste Lieferung, Status), Integration mit Zahlungs-Gateway (setzt Stripe-Implementierung voraus), Admin-Oberfläche zum Zusammenstellen der monatlichen Box.

---

### Expert-Content (Tasting Guides, Pairing-Empfehlungen)

Redaktionelle Inhalte direkt im Shop: Zigarren-Ratgeber (Stärkegrade, Vitolas, Herkunftsländer), Pairing-Empfehlungen (Zigarre + Rum, Zigarre + Whisky), saisonale Highlights. Doppelter Nutzen: Markenpositionierung als Fachhandel und SEO-Longtail-Traffic für Begriffe, die Produktseiten allein nicht abdecken.

Technisch: eigene `/guides`- oder `/magazin`-Route, einfaches CMS-ähnliches Schema (`articles`: Titel, Slug, Body als Markdown/HTML, Tags, publishedAt) oder zunächst statische Seiten.

---

### Treueprogramm

Punkte für Käufe, Bewertungen, Geburtstag -- einlösbar als Rabatt oder Freiartikel. Erhöht Wiederkaufrate und gibt Anlass für E-Mail-Kommunikation ohne reinen Promotions-Spam. Sinnvoll ab einer kritischen Kundenbasis.

Technisch: neue Tabelle `loyalty_points` (customerId, Punkte, Ereignis, Datum), Anzeige im Account-Dashboard, Einlösung beim Checkout.

---

### B2B-Portal (Gastronomie / Einzelhandel)

Separater Login-Bereich für gewerbliche Kunden (Restaurants, Bars, Tabakfachhändler) mit Staffelpreisen, Mindestbestellmengen und Rechnungskauf. Erschließt einen Absatzkanal mit höherem Volumen pro Bestellung und stabilerer Nachfrage als B2C.

Technisch: neues Flag `isBusinessCustomer` auf `customers`, separate Preistabelle oder Rabattlogik, eigene Checkout-Variante mit Rechnungsoption.
