# Website live schalten

Diese Anleitung bringt die Seite auf eure eigene Domain. Sie braucht keine Programmierkenntnisse.

**Welcher Weg?**

- **Weg A: Netlify** (empfohlen, kostenlos). Das Anfrageformular funktioniert, jede Änderung auf GitHub geht automatisch live, und die Sicherheits-Header werden gesetzt. Etwa 20 Minuten.
- **Weg B: Dateien bei eurem bestehenden Hoster hochladen** (IONOS, Strato, All-Inkl …). Das geht, wenn die Domain dort schon Webspace hat. Das Formular sendet dann aber nichts.
- **Ihr habt Wix, Squarespace, Jimdo oder einen anderen Baukasten?** Dort lässt sich diese Seite nicht einbauen. Nehmt Weg A und verbindet eure Domain mit Netlify (A5).

---

## Vorbereitung: Zugang zu GitHub

Das Repository gehört gerade Oscars GitHub-Konto. Für eine Firma sauberer ist eine **GitHub-Organisation**, in der alle Gründer Admin sind. Das ist kostenlos:

1. **Oscar:** Auf github.com oben rechts auf das Profilbild → **Your organizations** → **New organization** → Plan **Free**. Einen Namen wählen, zum Beispiel `entropy-security`.
2. **Oscar:** Im Repository **Settings** → ganz unten **Transfer ownership** → die neue Organisation wählen. Links, Commits und Einstellungen bleiben erhalten.
3. **Oscar:** In der Organisation **People** → **Invite member** → Natalies GitHub-Name oder E-Mail → Rolle **Owner**.
4. **Natalie:** Falls noch nicht vorhanden, auf github.com ein Konto anlegen. Dann die Einladung aus der E-Mail annehmen.

Ohne Organisation geht es auch: Im Repository **Settings → Collaborators → Add people** Natalie einladen. Dann muss aber Oscar den Netlify-Schritt A2 machen, weil nur der Eigentümer Netlify den Zugriff erlauben kann.

Nach einem Umzug in eine Organisation ändert sich die Adresse der Live-Vorschau zu `https://<organisation>.github.io/entropy-website/`. Tragt sie in der `README.md` ein.

---

## Weg A: Netlify

Netlify benennt Menüpunkte ab und zu um. Wenn ein Name nicht genau passt, heißt er sinngemäß so.

### A1. Konto anlegen

1. netlify.com öffnen → **Sign up** → **Sign up with GitHub**.
2. Bei GitHub bestätigen, dass Netlify euer Konto lesen darf.

### A2. Seite mit GitHub verbinden

1. Im Netlify-Dashboard **Add new project** → **Import an existing project** → **GitHub**.
2. GitHub fragt, auf welche Repositories Netlify zugreifen darf. **Only select repositories** → `entropy-website` → **Install / Save**.
3. Zurück bei Netlify `entropy-website` anklicken.
4. Die Einstellungen sind schon ausgefüllt, sie kommen aus der Datei `netlify.toml`:
   - Branch to deploy: `main`
   - Build command: `python3 build.py`
   - Publish directory: `dist`

   Nichts ändern, **Deploy** klicken.
5. Nach etwa einer Minute ist die Seite unter einer Adresse wie `https://irgendein-name.netlify.app` online. Unter **Project configuration → Change project name** könnt ihr sie zum Beispiel in `entropy.netlify.app` ändern.

### A3. Anfrageformular einschalten

1. Im Projekt links **Forms** → **Enable form detection**.
2. Links **Deploys** → **Trigger deploy** → **Deploy project**. Erst dieser neue Deploy erkennt das Formular.
3. Danach steht unter **Forms** ein Formular namens **request**.

### A4. Benachrichtigung per E-Mail

1. **Project configuration → Notifications → Emails and webhooks → Form submission notifications** → **Add notification** → **Email notification**.
2. Form: **request**. E-Mail: die Adresse, an die neue Anfragen gehen sollen.
3. **Save**.

**Test:** Die Netlify-Adresse öffnen, eine Testanfrage senden. Sie muss unter **Forms → request** erscheinen und per E-Mail ankommen. Spam fängt ein unsichtbares Feld ab. Was trotzdem durchrutscht, landet unter **Forms → Spam**.

### A5. Eigene Domain verbinden

1. **Domain management** → **Add a domain** → eure Domain eingeben, zum Beispiel `entropy.de` → **Verify** → **Add domain**.
2. Netlify zeigt jetzt, was bei eurem Domain-Anbieter einzutragen ist. Zwei Möglichkeiten:
   - **Einfach:** Netlify übernimmt die Domain („Set up Netlify DNS“). Netlify nennt vier Nameserver. Diese beim Domain-Anbieter unter „Nameserver ändern“ eintragen. Achtung, falls über die Domain E-Mails laufen: Dann müssen die MX-Einträge vorher bei Netlify DNS angelegt werden. Sonst lieber die zweite Möglichkeit.
   - **Behutsam:** Beim Domain-Anbieter nur zwei DNS-Einträge ändern, E-Mail bleibt unberührt:
     - `A`-Eintrag für die Domain selbst (`@`) → die IP, die Netlify anzeigt
     - `CNAME`-Eintrag für `www` → eure `….netlify.app`-Adresse
3. Warten. Das dauert meist Minuten, selten bis zu 24 Stunden. Netlify richtet HTTPS danach von selbst ein. Unter **Domain management → HTTPS** muss am Ende „Your site has HTTPS enabled“ stehen.

### A6. Fertig: prüfen

- Die Seite auf dem Handy und am Laptop öffnen, einmal durchscrollen, die Sprache wechseln.
- Ganz unten im Live-Audit muss „0 Tracker · 0 Cookies · 0 externe Anfragen“ stehen.
- Optional: die Domain bei securityheaders.com prüfen. Erwartet wird die Bestnote.

**Ab jetzt:** Jede Änderung, die auf GitHub in `main` landet, ist nach etwa einer Minute live.

---

## Weg B: Bestehender Hoster

### B1. Dateien holen

1. Auf GitHub im Repository oben **Code** → **Download ZIP**.
2. Die ZIP entpacken und den Ordner **`dist`** öffnen. Darin liegen:
   `index.html`, `404.html`, `.htaccess`, `_headers`, `robots.txt`, `apple-touch-icon.png`

   `.htaccess` ist eine versteckte Datei. Auf dem Mac im Finder mit **⌘ + ⇧ + .** sichtbar machen.

### B2. Hochladen

1. Beim Hoster einloggen und den **Dateimanager** öffnen, oder per FTP mit FileZilla verbinden. Die Zugangsdaten stehen im Kundenmenü des Hosters.
2. In den Ordner wechseln, auf den die Domain zeigt. Meist heißt er `htdocs`, `public_html` oder trägt den Namen der Domain.
3. Alle Dateien aus `dist` dort hineinladen, auch `.htaccess`. Eine vorhandene `index.html` wird ersetzt. Vorher sichern, falls ihr sie noch braucht.

### B3. HTTPS einschalten

Im Kundenmenü des Hosters das SSL-Zertifikat für die Domain aktivieren. Bei vielen Hostern heißt das „SSL“ oder „Let’s Encrypt“, dazu die Option „HTTPS erzwingen“.

### B4. Prüfen

Wie in A6. Die Sicherheits-Header kommen hier aus der `.htaccess`.

**Wichtig bei Weg B:** Das Anfrageformular braucht einen Empfänger. Beim normalen Webspace zeigt es nach dem Absenden eine Fehlermeldung. Entweder Weg A nehmen, oder mit `python3 build.py --form https://…` einen eigenen Formular-Endpunkt eintragen, siehe `README.md`.

**Updates bei Weg B:** Nach jeder Änderung den `dist`-Ordner erneut hochladen.

---

## Wenn etwas nicht klappt

| Problem | Lösung |
| --- | --- |
| Die Seite ist schwarz oder ohne Schrift | `dist/index.html` wurde von Hand geändert. Neu bauen mit `python3 build.py` oder die Datei neu von GitHub laden |
| Das Formular zeigt „Das hat nicht geklappt“ | Bei Netlify: A3 wiederholen, danach neu deployen. Bei Weg B: siehe den Hinweis oben |
| Die Domain zeigt noch die alte Seite | DNS braucht Zeit. Nach ein paar Stunden neu versuchen, den Browser-Cache leeren |
| Der GitHub-Check ist rot („dist/ is out of date“) | Jemand hat `src/` geändert, aber nicht neu gebaut. `python3 build.py` ausführen, `dist/` committen |
