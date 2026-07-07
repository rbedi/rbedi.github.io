# Rishi Bedi — personal blog

A tiny, static, no-build blog. Plain HTML + one CSS file. Hosts on GitHub
Pages for free. No backend, no framework, no build step.

## Structure

```
.
├── index.html              # homepage: the list of posts
├── styles.css              # all styling (edit tokens at the top to reskin)
├── .nojekyll               # tells GitHub Pages to serve files as-is
├── posts/
│   └── <slug>/
│       ├── index.html      # one post, served at /posts/<slug>/
│       └── image.png       # images for that post live beside it
└── README.md
```

Each post is a **folder** with an `index.html`, so its URL is a clean
`/posts/<slug>/` — no `.html` in the address.

## Adding a new post

The intended workflow: **hand Claude the `.md` file** and it will

1. create `posts/<slug>/index.html` from the Markdown,
2. drop any images you provide into `posts/<slug>/`,
3. add one `<li>` to the list in `index.html`.

Supported in posts: headings, **bold**/_italic_, links, lists, block quotes,
horizontal rules / section separators (`---` → `<hr>`), inline images (with
optional captions), code, and **endnotes/footnotes** (`[^1]` in Markdown →
numbered notes at the bottom that link back and forth).
Footnotes written inline in prose (e.g. `(* Footnote: …)`) are converted to
proper numbered endnotes.

**Figures.** A plain `<figure><img><figcaption></figure>` renders inline at the
column width. Optional classes on the `<figure>`:

- `class="diagram"` — puts the image on a light card (keeps diagrams with dark
  ink legible even in dark mode; use it for anything with a transparent
  background).
- `class="wide"` — lets the figure break out wider than the text column, for
  detailed diagrams.
- `class="narrow"` — caps the figure at ~60% of the max text width, centered,
  for small charts that would look oversized full-width.

Combine with `diagram` as needed, e.g. `class="diagram wide"` or
`class="diagram narrow"`. See `posts/ai-drug-discovery/` for real examples.

**Social previews (Twitter/X, etc.).** Each post's `<head>` sets
`twitter:card = summary_large_image` plus `og:image` so links unfurl as a large
image card. The image must be a **1200×630** file referenced by an **absolute**
URL (`https://rishibedi.com/posts/<slug>/og-image.png`) — relative paths are
ignored by scrapers. Generate one from a post's first figure with:

```bash
python3 -c "from PIL import Image; s=Image.open('posts/<slug>/<figure>.png').convert('RGBA'); \
W,H=1200,630; bg=Image.new('RGB',(W,H),(255,255,255)); cw=W-120; \
r=s.resize((cw,round(s.height*cw/s.width))); bg.paste(r,((W-cw)//2,(H-r.height)//2),r); \
bg.save('posts/<slug>/og-image.png',optimize=True)"
```

Platforms cache unfurls aggressively, so after publishing you may need to
re-scrape (e.g. paste the URL into <https://cards-dev.twitter.com/validator> or
append a throwaway `?v=2` to the link) before the new card shows.

**Table of contents.** Each post includes `toc.js`, which auto-builds a
navigator from the post's `<h2>`/`<h3>` headings. It floats in the left margin
and highlights the section you're reading, but only on wide screens (≥1280px);
on narrower windows and mobile it's hidden and the post is unaffected. No JS =
no TOC, nothing else changes. To shorten a heading's label in the TOC, add a
`data-toc` attribute, e.g. `<h3 data-toc="Reason #1">Reason #1: …</h3>`.
(The keep-`toc.js` line is already in the example post template.)

To do it by hand instead: copy `posts/example-post/` to a new folder, rename
it to your slug, and replace the title, date, and the content inside
`<div class="prose">`. Then add a line to the list in `index.html`.

## Editing the homepage

- **Name / bio / links:** the `<header class="site-header">` block in `index.html`.
- **Post list:** the `<ul class="post-list">` block — newest first. Each entry
  is a title + a date.

## Changing the look

All colors, fonts, and the column width are CSS variables at the top of
`styles.css` (`:root`). Dark mode is handled automatically from the reader's
system setting. Change `--accent` to reskin the highlight color; change
`--font-serif` to swap the reading typeface.

## Preview locally

Because posts use relative paths, just opening `index.html` in a browser works.
For links to behave exactly like production, serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a repo. For the shortest URL (`https://<user>.github.io`), name it
   `<user>.github.io`. Any other name gives `https://<user>.github.io/<repo>/`
   — both work because all paths in this site are relative.
2. Push these files to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial blog"
   git branch -M main
   git remote add origin git@github.com:<user>/<repo>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source:** _Deploy
   from a branch_, **Branch:** `main` / `root`. Save.
4. Wait ~1 minute, then visit your Pages URL.

A custom domain (e.g. `rishibedi.com`) can be set later under Settings → Pages
→ Custom domain.
