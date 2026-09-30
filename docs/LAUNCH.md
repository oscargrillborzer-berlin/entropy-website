# Taking the website live

This guide puts the site on your own domain. No programming knowledge needed.

**Which way?**

- **Way A: Netlify** (recommended, free). The request form works, every change on GitHub goes live automatically, and the security headers are set. About 20 minutes.
- **Way B: upload the files to your existing host** (IONOS, Strato, All-Inkl …). Works if the domain already has web space there, but the request form won’t send anything.
- **Using Wix, Squarespace, Jimdo or another site builder?** This site can’t be embedded there. Use Way A and connect your domain to Netlify (A5).

---

## Preparation: access to GitHub

The repository currently belongs to Oscar’s GitHub account. For a company, a **GitHub organization** in which every founder is an admin is cleaner. It’s free:

1. **Oscar:** On github.com, profile picture (top right) → **Your organizations** → **New organization** → plan **Free**. Pick a name, for example `entropy-security`.
2. **Oscar:** In the repository, **Settings** → at the very bottom **Transfer ownership** → choose the new organization. Links, commits and settings are kept.
3. **Oscar:** In the organization, **People** → **Invite member** → Natalie’s GitHub username or email → role **Owner**.
4. **Natalie:** Create a GitHub account if you don’t have one yet, then accept the invitation from the email.

It also works without an organization: in the repository, **Settings → Collaborators → Add people** and invite Natalie. But then Oscar has to do Netlify step A2, because only the owner can give Netlify access.

After moving to an organization, the live preview’s address becomes `https://<organization>.github.io/entropy-website/`. Update it in `README.md`.

---

## Way A: Netlify

Netlify renames menu items from time to time. If a name doesn’t match exactly, look for the closest one.

### A1. Create an account

1. Open netlify.com → **Sign up** → **Sign up with GitHub**.
2. Confirm on GitHub that Netlify may read your account.

### A2. Connect the site to GitHub

1. In the Netlify dashboard: **Add new project** → **Import an existing project** → **GitHub**.
2. GitHub asks which repositories Netlify may access. **Only select repositories** → `entropy-website` → **Install / Save**.
3. Back on Netlify, click `entropy-website`.
4. The settings are already filled in from the file `netlify.toml`:
   - Branch to deploy: `main`
   - Build command: `python3 build.py`
   - Publish directory: `dist`

   Change nothing, click **Deploy**.
5. After about a minute the site is online at an address like `https://some-name.netlify.app`. Under **Project configuration → Change project name** you can change it, for example to `entropy.netlify.app`.

### A3. Turn on the request form

1. In the project, on the left, **Forms** → **Enable form detection**.
2. On the left, **Deploys** → **Trigger deploy** → **Deploy project**. Only this new deploy detects the form.
3. Afterwards **Forms** lists a form called **request**.

### A4. Get new requests by email

1. **Project configuration → Notifications → Emails and webhooks → Form submission notifications** → **Add notification** → **Email notification**.
2. Form: **request**. Email: the address new requests should go to.
3. **Save**.

**Test:** Open the Netlify address and send a test request. It must appear under **Forms → request** and arrive by email. An invisible field catches spam bots. Anything that still gets through ends up under **Forms → Spam**.

### A5. Connect your own domain

1. **Domain management** → **Add a domain** → enter your domain, for example `entropy.de` → **Verify** → **Add domain**.
2. Netlify now shows what to set up at your domain provider. Two options:
   - **Simple:** Netlify takes over the domain (“Set up Netlify DNS”). Netlify lists four name servers; enter them at your domain provider under “change name servers”. Careful if the domain is used for email: then the MX records have to be created in Netlify DNS first. Otherwise, prefer the second option.
   - **Careful:** Change only two DNS records at your domain provider; email stays untouched:
     - `A` record for the domain itself (`@`) → the IP address Netlify shows
     - `CNAME` record for `www` → your `….netlify.app` address
3. Wait. This usually takes minutes, rarely up to 24 hours. Netlify then sets up HTTPS by itself. Under **Domain management → HTTPS** it should finally say “Your site has HTTPS enabled”.

### A6. Done: check it

- Open the site on a phone and on a laptop, scroll through once, switch the language.
- At the very bottom, the live audit must say “0 trackers · 0 cookies · 0 external requests”.
- Optional: check the domain on securityheaders.com. The top grade is expected.

**From now on:** every change that lands in `main` on GitHub is live after about a minute.

---

## Way B: existing host

### B1. Get the files

1. On GitHub, in the repository: **Code** → **Download ZIP**.
2. Unzip it and open the **`dist`** folder. It contains:
   `index.html`, `404.html`, `.htaccess`, `_headers`, `robots.txt`, `apple-touch-icon.png`

   `.htaccess` is a hidden file. On a Mac, press **⌘ + ⇧ + .** in Finder to show it.

### B2. Upload

1. Log in at your host and open the **file manager**, or connect via FTP with FileZilla. The login details are in your host’s customer area.
2. Go to the folder the domain points to. It is usually called `htdocs` or `public_html`, or carries the domain’s name.
3. Upload all files from `dist` into it, including `.htaccess`. An existing `index.html` gets replaced, so back it up first if you still need it.

### B3. Turn on HTTPS

In your host’s customer area, activate the SSL certificate for the domain. Many hosts call it “SSL” or “Let’s Encrypt”, with an option like “force HTTPS”.

### B4. Check it

As in A6. The security headers come from `.htaccess` here.

**Important for Way B:** the request form needs a receiver. On plain web space it shows an error message after sending. Either use Way A, or set your own form endpoint with `python3 build.py --form https://…`, see `README.md`.

**Updates with Way B:** upload the `dist` folder again after every change.

---

## If something doesn’t work

| Problem | Fix |
| --- | --- |
| The page is black or has no fonts | `dist/index.html` was edited by hand. Rebuild with `python3 build.py`, or download the file from GitHub again |
| The form says “That didn’t go through” | On Netlify: repeat A3, then deploy again. On Way B: see the note above |
| The domain still shows the old site | DNS takes time. Try again in a few hours and clear the browser cache |
| The GitHub check is red (“dist/ is out of date”) | Someone changed `src/` without rebuilding. Run `python3 build.py`, commit `dist/` |
