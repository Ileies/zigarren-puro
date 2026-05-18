# Placeholder Komponente

Eine wiederverwendbare Svelte-Komponente für noch nicht implementierte Routes und Seiten.

## Verwendung

```svelte
<script lang="ts">
	import Placeholder from '$lib/components/Placeholder.svelte';
</script>

<Placeholder 
	title="Seite in Entwicklung"
	description="Diese Seite wird derzeit entwickelt."
/>
```

## Props

| Prop | Typ | Standard | Beschreibung |
|------|-----|----------|-------------|
| `title` | `string` | `'Seite in Entwicklung'` | Hauptüberschrift der Platzhalter-Seite |
| `description` | `string` | `'Diese Seite wird derzeit entwickelt und ist bald verfügbar.'` | Beschreibungstext |
| `showBackButton` | `boolean` | `true` | Zeigt den "Zurück" Button an |
| `showHomeButton` | `boolean` | `true` | Zeigt den "Zur Startseite" Button an |
| `customMessage` | `string` | `''` | Überschreibt die Standard-Beschreibung wenn gesetzt |

## Features

- **Responsive Design**: Funktioniert auf allen Bildschirmgrößen
- **Animationen**: Subtile Animationen für bessere UX
- **Konsistentes Styling**: Verwendet das DaisyUI Theme-System
- **Marken-Integration**: Zeigt das Zigarren Puro Logo
- **Interaktive Elemente**: Zurück- und Home-Buttons
- **Progress Indicator**: Visueller Fortschrittsbalken

## Beispiele

### Basis-Verwendung
```svelte
<Placeholder />
```

### Mit benutzerdefinierten Props
```svelte
<Placeholder 
	title="Produktkatalog"
	description="Unser vollständiger Katalog wird bald verfügbar sein."
	showBackButton={false}
/>
```

### Mit benutzerdefinierter Nachricht
```svelte
<Placeholder 
	title="News & Updates"
	customMessage="Folgen Sie uns auf Social Media für die neuesten Updates!"
/>
```

## Styling

Die Komponente verwendet:
- **Tailwind CSS** für Layout und Spacing
- **DaisyUI** für Theme-konsistente Farben
- **Lucide Svelte** Icons für visuelle Elemente
- **Custom CSS** für spezielle Animationen

## Implementierte Beispiele

- `/news` - News-Bereich Platzhalter
- `/search` - Produktsuche Platzhalter mit dynamischen Titeln
