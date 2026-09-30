# Entropy · Website

Die Website von Entropy: Red Teaming für LLM-Anwendungen, Englisch und Deutsch.

**Live-Vorschau:** https://oscargrillborzer-berlin.github.io/entropy-website/

**Live gehen:** Schritt für Schritt in [docs/LAUNCH.md](docs/LAUNCH.md)

Die Seite ist eine einzige, eigenständige HTML-Datei. Schriften, Fotos und Code sind eingebettet: Sie lädt nichts von fremden Servern, setzt keine Cookies und trackt nicht. Eine strenge Content Security Policy lässt nur genau den eigenen Code laufen. Im Repository liegen keine Passwörter, API-Schlüssel oder Zugangsdaten, und die Seite braucht auch keine.

## Aufbau

```
src/
  index.html        Gerüst der Seite: Kopf, Abschnitte, Formular (englische Standardtexte)
  styles.css        Das gesamte Design
  js/               Der Code, ein Teil pro Aufgabe, in dieser Reihenfolge:
    core.js           Einstellungen und kleine Helfer
    mark.js           Logo und Wasserzeichen
    copy.js           ALLE TEXTE, Englisch und Deutsch  ← hier Texte ändern
    i18n.js           Sprachwechsel
    icons.js          Icons
    board.js          Das Schachbrett und die Partie
    dial.js           Der Kompass mit den acht Angriffsrichtungen
    story.js          Scrollen → Spielzug
    status.js         Statusleiste unten, Schritt-Anzeige
    form.js           Anfrageformular
    audit.js          Das Live-Audit im Footer
    sheets.js         Impressum, Datenschutz, Schwachstelle melden
    keys.js           Tastenkürzel
    main.js           Start und Animationsschleife
  404.html          Fehlerseite
  assets/           Schriften (mit Lizenz), Teamfotos, Logo-Form, App-Icon
build.py            Baut aus src/ die fertige Seite nach dist/
dist/               DIE FERTIGE SEITE ZUM HOCHLADEN. Nie von Hand ändern
docs/LAUNCH.md      Anleitung: Website live schalten
```

## Texte ändern

1. `src/js/copy.js` öffnen. Jeder Text steht dort zweimal: erst Englisch, dann Deutsch.
   ```js
   'hero.sub': [
     'We attack your AI application the way a real attacker would, …',
     'Wir greifen Ihre KI-Anwendung so an, wie es ein echter Angreifer tun würde, …',
   ],
   ```
2. Beide Zeilen ändern. Anführungszeichen im Text als typografische Zeichen schreiben (’ „ “), nicht als `'`.
3. Seite bauen und prüfen:
   ```bash
   python3 build.py
   ```
   Es braucht nur Python 3, keine weiteren Pakete. Dann `dist/index.html` im Browser öffnen.
4. `src/` und `dist/` zusammen committen und pushen.

Warum nicht direkt `dist/index.html` bearbeiten? Die Sicherheitsrichtlinie enthält einen Fingerabdruck (Hash) des Codes. Jede Änderung von Hand bricht ihn, und der Browser blockiert dann die Seite. `build.py` berechnet ihn bei jedem Bau neu.

## Automatische Prüfungen

Bei jedem Push und jedem Pull Request prüft GitHub:

- ob `dist/` genau das ist, was `src/` ergibt (sonst schlägt der Check fehl),
- ob der Code der Seite fehlerfrei geparst wird.

Danach baut GitHub die Live-Vorschau neu. Dependabot schlägt einmal im Monat Updates für die GitHub Actions vor. GitHub Secret Scanning blockiert Pushes, die aussehen, als enthielten sie Passwörter oder Schlüssel.

## Build-Optionen

| Befehl | Ergebnis |
| --- | --- |
| `python3 build.py` | Produktion nach `dist/`. Das Formular sendet an `/` (Netlify Forms) |
| `python3 build.py --form https://…` | Formular sendet an einen eigenen Endpunkt, der in der Sicherheitsrichtlinie freigegeben wird |
| `python3 build.py --form none` | Formular im Prototyp-Modus, sendet nichts |
| `python3 build.py --base /pfad/` | Für eine Seite, die nicht direkt unter der Domain liegt |
| `python3 build.py --out ordner` | Anderer Ausgabeordner (nur innerhalb des Repositorys) |

In `dist/` liegen die Sicherheits-Header zweimal: als `_headers` für Netlify und Cloudflare Pages und als `.htaccess` für klassische Hoster wie IONOS, Strato oder All-Inkl.

## Offen

- Impressum: vollständige Anschrift ergänzen, sobald sie feststeht (Pflicht nach § 5 DDG). Der Text steht in `src/js/copy.js` unter `sh.legal`.
- Vorschaubild für LinkedIn und WhatsApp, sobald die Domain feststeht.

## Sicherheit und Lizenzen

Schwachstellen bitte vertraulich melden, siehe [SECURITY.md](SECURITY.md).

Host Grotesk und JetBrains Mono stehen unter der SIL Open Font License 1.1, siehe `src/assets/fonts/`. Alles andere © Entropy, alle Rechte vorbehalten.
