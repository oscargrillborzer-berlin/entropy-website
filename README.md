# Entropy · Website

The website of Entropy: red teaming for LLM applications, in English and German.

**Live preview:** https://oscargrillborzer-berlin.github.io/entropy-website/

**Going live:** step by step in [docs/LAUNCH.md](docs/LAUNCH.md)

The site is a single, self-contained HTML page. Fonts, photos and code are built in: it loads nothing from other servers, sets no cookies and does no tracking. A strict Content Security Policy lets only its own code run. The repository contains no passwords, API keys or credentials, and the site needs none.

## Layout

```
src/
  index.html        Page skeleton: head, sections, request form (English default texts)
  styles.css        The whole design
  js/               The code, one file per job, in this order:
    core.js           Settings and small helpers
    mark.js           Logo and watermarks
    copy.js           ALL TEXTS, English and German  ← change texts here
    i18n.js           Language switch
    icons.js          Icons
    board.js          The chessboard and the game
    dial.js           The compass with the eight directions of attack
    story.js          Scrolling → chess moves
    status.js         Status line at the bottom, step counter
    form.js           Request form
    audit.js          The live audit in the footer
    sheets.js         Legal notice, privacy, vulnerability reports
    keys.js           Keyboard shortcuts
    main.js           Start-up and animation loop
  404.html          Not-found page
  assets/           Fonts (with licence), team photos, logo shape, app icon
build.py            Builds the finished site from src/ into dist/
dist/               THE FINISHED SITE, READY TO UPLOAD. Never edit by hand
docs/LAUNCH.md      Guide: taking the site live
```

## Changing texts

1. Open `src/js/copy.js`. Every text appears twice: English first, then German.
   ```js
   'hero.sub': [
     'We attack your AI application the way a real attacker would, …',
     'Wir greifen Ihre KI-Anwendung so an, wie es ein echter Angreifer tun würde, …',
   ],
   ```
2. Change both lines. Write quotation marks inside a text as typographic characters (’ “ ” „), not as `'`.
3. Build the site and check it:
   ```bash
   python3 build.py
   ```
   Only Python 3 is needed, no other packages. Then open `dist/index.html` in a browser.
4. Commit and push `src/` and `dist/` together.

Why not edit `dist/index.html` directly? The security policy contains a fingerprint (hash) of the code. Any change by hand breaks it, and the browser then blocks the page. `build.py` recalculates it on every build.

## Automatic checks

On every push and every pull request, GitHub checks:

- that `dist/` is exactly what `src/` builds (otherwise the check fails),
- that the page's code parses without errors.

Then GitHub rebuilds the live preview. Once a month Dependabot proposes updates for the GitHub Actions. GitHub secret scanning blocks any push that looks like it contains a password or key.

## Build options

| Command | Result |
| --- | --- |
| `python3 build.py` | Production build into `dist/`. The form posts to `/` (Netlify Forms) |
| `python3 build.py --form https://…` | The form posts to your own endpoint, which is allowed in the security policy |
| `python3 build.py --form none` | Form in prototype mode, sends nothing |
| `python3 build.py --base /path/` | For a site that is not served from the root of the domain |
| `python3 build.py --out folder` | Another output folder (inside the repository only) |

`dist/` carries the security headers twice: as `_headers` for Netlify and Cloudflare Pages, and as `.htaccess` for classic hosts such as IONOS, Strato or All-Inkl.

## Still open

- Legal notice: add the full postal address once it is fixed (required by § 5 DDG in Germany). The text is in `src/js/copy.js` under `sh.legal`.
- Preview image for LinkedIn and WhatsApp, once the domain is fixed.

## Security and licences

Please report vulnerabilities privately, see [SECURITY.md](SECURITY.md).

Host Grotesk and JetBrains Mono are licensed under the SIL Open Font License 1.1, see `src/assets/fonts/`. Everything else © Entropy, all rights reserved.
