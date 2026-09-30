# Entropy · Website

Die Website von Entropy: Red Teaming für LLM-Anwendungen, Englisch und Deutsch.

**Live-Vorschau:** __PAGES_URL__

Die Seite ist eine einzige, eigenständige HTML-Datei. Schriften, Fotos und Code sind eingebettet, sie lädt nichts von fremden Servern, setzt keine Cookies und trackt nicht. Eine strenge Content Security Policy lässt nur genau den eigenen Code laufen.

## Was wo liegt

| Pfad | Inhalt |
| --- | --- |
| `src/index.html` | Die Seite: Layout, Stil, Code und alle Texte (EN/DE) |
| `src/404.html` | Die Fehlerseite |
| `src/assets/` | Schriften (mit Lizenz), Teamfotos, Logo-Pfad, App-Icon |
| `build.py` | Baut aus `src/` die fertige Seite |
| `dist/` | **Die fertige Seite zum Hochladen.** Nie von Hand ändern |

## Texte ändern

Alle Texte stehen in `src/index.html` im Block `const COPY = {`, zuerst Englisch (`en`), dann Deutsch (`de`). Jeder Text hat einen Schlüssel, zum Beispiel `'hero.sub'`. Ändert immer beide Sprachen.

Danach die Seite bauen:

```bash
python3 build.py
```

Es braucht nur Python 3, keine weiteren Pakete. Dann `src/` und `dist/` zusammen committen. GitHub prüft bei jedem Push, ob `dist/` zu `src/` passt.

Warum nicht direkt `dist/index.html` bearbeiten? Die Sicherheitsrichtlinie enthält einen Fingerabdruck (Hash) des Codes. Jede Änderung von Hand bricht ihn, und der Browser blockiert dann die Seite. `build.py` berechnet ihn neu.

## Veröffentlichen

**Netlify (empfohlen).** Auf netlify.com „Add new site“ → „Import from GitHub“ → dieses Repository wählen. Die Einstellungen kommen aus `netlify.toml`, es muss nichts gebaut werden. Danach:

1. Unter **Forms** die Formularerkennung einschalten und einmal neu deployen. Anfragen landen dann im Netlify-Dashboard.
2. Unter **Forms → Notifications** eine E-Mail-Adresse für neue Anfragen eintragen.
3. Unter **Domain management** die eigene Domain verbinden.

Ab dann geht jeder Push auf `main` automatisch live.

**Anderer Hoster.** Den Inhalt von `dist/` hochladen (alle fünf Dateien). Das Anfrageformular sendet an `/`, das funktioniert so nur mit Netlify Forms. Für einen anderen Empfänger: `python3 build.py --form https://…` mit der Adresse des eigenen Endpunkts.

**GitHub Pages.** Die Live-Vorschau oben baut sich bei jedem Push auf `main` selbst. Dort sendet das Formular nichts und zeigt das auch so an.

## Offen

- Impressum: vollständige Anschrift ergänzen, sobald sie feststeht (Pflicht nach § 5 DDG).
- Vorschaubild für LinkedIn und WhatsApp, sobald die Domain feststeht.

## Lizenzen

Host Grotesk und JetBrains Mono stehen unter der SIL Open Font License 1.1, siehe `src/assets/fonts/`. Alles andere © Entropy, alle Rechte vorbehalten.
