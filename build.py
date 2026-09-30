#!/usr/bin/env python3
"""Builds the Entropy website into self-contained pages.

    python3 build.py
        Production build into dist/. The request form posts to "/" (Netlify Forms).

    python3 build.py --out _site --base /entropy-website/ --form none
        Preview build, as GitHub Pages serves it: under a sub-path, form in prototype mode.

Fonts, photos and the mark are inlined, so a page loads nothing from anywhere else.
The Content Security Policy allows exactly the inline style and script of each page,
by hash. That is why the pages in dist/ are never edited by hand: change src/, then build.
Only the Python standard library is needed.
"""
import argparse
import base64
import hashlib
import pathlib
import shutil
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
ASSETS = SRC / 'assets'
# The page script, in the order it runs. All files share one scope (one closure in the page).
SCRIPTS = ['core', 'mark', 'copy', 'i18n', 'icons', 'board', 'dial', 'story', 'status', 'form', 'audit', 'sheets', 'keys', 'main']


def b64(path):
    return base64.b64encode(path.read_bytes()).decode()


def sha256(text):
    return "'sha256-" + base64.b64encode(hashlib.sha256(text.encode('utf-8')).digest()).decode() + "'"


def between(text, start, end):
    i = text.index(start) + len(start)
    return text[i:text.index(end, i)]


def indent(text):
    return ''.join('  ' + line if line.strip() else line for line in text.splitlines(True))


def assemble():
    """src/index.html with src/styles.css and src/js/*.js put in place."""
    styles = '\n' + indent((SRC / 'styles.css').read_text())
    script = '\n(() => {\n' + indent('\n'.join((SRC / 'js' / f'{name}.js').read_text() for name in SCRIPTS)) + '})();\n'
    return fill((SRC / 'index.html').read_text(), {'__STYLES__': styles, '__SCRIPT__': script})


def fill(text, values):
    for key, value in values.items():
        assert key in text, f'{key} is missing'
        text = text.replace(key, value)
    return text


def policy(script, style, connect="'self'"):
    return (f"default-src 'none'; script-src {script}; style-src {style}; img-src 'self' data:; font-src data:; "
            f"connect-src {connect}; form-action 'self'; base-uri 'none'")


def main():
    ap = argparse.ArgumentParser(description='Build the Entropy website.')
    ap.add_argument('--out', default='dist', help='output folder (default: dist)')
    ap.add_argument('--base', default='/', help='path the site is served from (default: /)')
    ap.add_argument('--form', default='/', help="where the request form posts, or 'none' for prototype mode (default: /)")
    args = ap.parse_args()
    base = args.base if args.base.endswith('/') else args.base + '/'
    out = (ROOT / args.out).resolve()
    if out == ROOT or not out.is_relative_to(ROOT):
        raise SystemExit('--out has to be a folder inside the repository, it gets replaced on every build')

    mark = (ASSETS / 'mark.txt').read_text().strip()
    icon_svg = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><rect width='180' height='180' rx='36' fill='%2308090B'/>"
                f"<g transform='translate(90 90) scale(0.62)'><path fill='%23F2F3F4' d='{mark}'/></g></svg>")
    icon = 'data:image/svg+xml,' + urllib.parse.quote(icon_svg, safe="'=/:%#(),.-")
    common = {'__ICON__': icon, '__BASE__': base}

    page = fill(assemble(), {
        '__HOST_WOFF2__': b64(ASSETS / 'fonts/HostGrotesk.woff2'),
        '__JBM_WOFF2__': b64(ASSETS / 'fonts/JetBrainsMono.woff2'),
        '__NATALIE__': 'data:image/jpeg;base64,' + b64(ASSETS / 'team/natalie.jpg'),
        '__IVAN__': 'data:image/jpeg;base64,' + b64(ASSETS / 'team/ivan.jpg'),
        '__OSCAR__': 'data:image/jpeg;base64,' + b64(ASSETS / 'team/oscar.jpg'),
        '__STAR_D_URI__': urllib.parse.quote(mark, safe=' -.,'),
        **common,
    })
    endpoint = 'null' if args.form == 'none' else "'" + args.form + "'"
    page = fill(page, {'const FORM_ENDPOINT = null;': f'const FORM_ENDPOINT = {endpoint};'})
    # a form endpoint on another server has to be allowed explicitly
    target = urllib.parse.urlsplit(args.form)
    connect = "'self'" + (f' {target.scheme}://{target.netloc}' if target.netloc else '')
    style, script = between(page, '<style>', '</style>'), between(page, '<script>', '</script>')
    page = fill(page, {'__CSP__': policy(sha256(script), sha256(style), connect)})

    not_found = fill((SRC / '404.html').read_text(), common)
    style_404 = between(not_found, '<style>', '</style>')
    not_found = fill(not_found, {'__CSP__': policy("'none'", sha256(style_404))})

    # The same policy as a response header adds what a <meta> tag cannot: frame-ancestors.
    # _headers is read by Netlify and Cloudflare Pages, .htaccess by Apache hosts (IONOS, Strato, All-Inkl …).
    security_headers = {
        'Content-Security-Policy': policy(sha256(script), f'{sha256(style)} {sha256(style_404)}', connect)
                                   + "; frame-ancestors 'none'; upgrade-insecure-requests",
        'Strict-Transport-Security': 'max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'no-referrer',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
        'Cross-Origin-Opener-Policy': 'same-origin',
    }
    headers = '/*\n' + ''.join(f'  {name}: {value}\n' for name, value in security_headers.items())
    htaccess = ('# Apache hosts: security headers, our 404 page, no folder listings. Generated by build.py.\n'
                f'ErrorDocument 404 {base}404.html\n'
                'Options -Indexes\n'
                '<IfModule mod_headers.c>\n'
                + ''.join(f'  Header always set {name} "{value}"\n' for name, value in security_headers.items())
                + '</IfModule>\n')

    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    (out / 'index.html').write_text(page)
    (out / '404.html').write_text(not_found)
    (out / '_headers').write_text(headers)
    (out / '.htaccess').write_text(htaccess)
    (out / 'robots.txt').write_text('User-agent: *\nAllow: /\n')
    shutil.copy(ASSETS / 'apple-touch-icon.png', out / 'apple-touch-icon.png')
    print(f'Built {out.relative_to(ROOT)}/: ' + ', '.join(
        f'{p.name} ({max(1, p.stat().st_size // 1024)} KB)' for p in sorted(out.iterdir(), key=lambda p: p.name.lstrip('._'))))


if __name__ == '__main__':
    main()
