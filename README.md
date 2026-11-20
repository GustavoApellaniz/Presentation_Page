# Gustavo Fraga Apellaniz · Portfolio

Personal portfolio and Google Play developer website.

**Live:** https://gustavoapellaniz.github.io/Presentation_Page/
**Privacy policy:** https://gustavoapellaniz.github.io/Presentation_Page/privacy.html

Plain HTML, CSS and vanilla JavaScript (ES modules). No framework and no build step:
the files in this repository are exactly what GitHub Pages serves.

## Structure

```text
.
├── index.html          # Landing page: hero, projects, stack, short about, contact
├── about.html          # Presentation page: photo, story, timeline, certificates
├── privacy.html        # Privacy policy (URL used in Google Play Console)
├── 404.html            # Styled "not found" page (absolute paths on purpose)
├── css/styles.css      # One stylesheet for every page (design tokens at the top)
├── js/main.js          # One script: nav, name decode, typewriter, rain, reveal, copy email
├── assets/
│   ├── fonts/          # Self-hosted woff2 (Space Grotesk, Inter, JetBrains Mono, OFL)
│   └── img/            # profile.webp/.jpg and the 1200×630 Open Graph image
├── favicon.svg
├── robots.txt
├── sitemap.xml
└── .nojekyll           # Tells GitHub Pages to serve the files as they are
```

## Run it locally

Modules need a web server (opening the file directly will not run the script):

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Update the site

1. Edit a file on GitHub (pencil icon) or locally, then commit and push to the
   branch GitHub Pages publishes.
2. GitHub Pages rebuilds automatically; the change is live in about a minute.

Common edits:

- **Colors:** change the custom properties in `:root` at the top of `css/styles.css`.
- **A project:** each card is an `<article class="card">` in `index.html`.
- **Enable the CV download:** add a PDF **without phone number or age** to `assets/`
  (`CV_Gustavo_Fraga_Apellaniz_EN.pdf`, `CV_Gustavo_Fraga_Apellaniz_FR.pdf`) and remove
  the `hidden` attribute from the CV buttons in `index.html` and `about.html`.
- **App privacy policy:** add a section per app under "App privacy policies" in `privacy.html`.

## Accessibility and motion

Skip link, landmarks, visible focus, keyboard-operable menu and `<details>` panels.
With `prefers-reduced-motion: reduce`, every animation is off and the final state shows at once.
