# AGENTS.md

This repo is a live resume at [guyda.dev](https://guyda.dev). The Rust should be a spectacle of minimalism: a pretty, functioning site with almost no machinery behind it.

## Bar

- One visual idea. One page. Black on white / white on black.
- Prefer **one Rust file**. Do not add modules, traits, or helpers until a thing is used twice.
- Copy lives as simple consts at the top of `src/main.rs`. That is the resume.
- If a line is not load-bearing, delete it.
- Pretext draws an **abstract mark**, never words, until explicitly asked otherwise.
- The mark is three stroked swells with measured beads. Do not go back to a glyph density field.
- Do not explain, label, or typeset the quote as a pull-quote. Leave it as a colophon.

## Layout

| Path | Job |
|---|---|
| `src/main.rs` | The whole app: resume consts, theme, one `Section` |
| `js/mark.js` | Canvas sea mark. Self-boots. No wasm-bindgen. |
| `style.css` | Typesetting. Light/dark via `html[data-theme]`. |
| `index.html` | Trunk, fonts, theme boot, G favicon, link-preview tags |
| `og.png` | WhatsApp / X card: G over three swells. Rebuild with `python3 og.py`. |
| `og.py` | Paints `og.png`. Not part of the site runtime. |
| `Trunk.toml` | `target = index.html`, `dist = dist` |

Do not re-split into `app.rs` / `content.rs` / `hero.rs`. One file is the point.

## Stack

- Leptos CSR, Trunk, Vercel. Pretext only in `js/mark.js`.
- No extra crates, CSS-in-Rust, component folders, or wrapper APIs without a hard need.
- Leptos 0.8 needs rustc ≥ 1.88. Edition 2021.

## Mark

- Pretext measures the width of `·` so beads sit on a line. It does not typeset the resume.
- Draw the wave as a **stroked sine**. Beads are ticks on that stroke.
- A field of mixed glyphs (`#%=*+`) reads as soup, not as water. Do not do that.
- Size the canvas when the box changes, not every frame. Resetting `canvas.width` every tick clears the picture.
- Respect `prefers-reduced-motion`: freeze at `t = 0`.

## Favicon

Browsers cache `link[rel=icon]` by URL. Mutating `href` on a data URI often does nothing.

Rebuild: paint SVG → blob URL → **remove** every icon `<link>` → append a new one. `paintChrome()` in `index.html` already does this. Call it when `data-theme` changes.

## Ship

Work only on `main`. Commit and push there. Do not keep feature branches — delete them after they land.

Push `main` on GitHub (`Guydada/portfolio`). `.github/workflows/vercel_deploy.yml` Trunk-builds and deploys **`./dist`**, never the source tree. Markdown-only changes do not ship. Overlapping production deploys cancel so an unbuilt page cannot flash live.

- Live site is **guyda.dev** (Vercel). `guyda.com` is an old Netlify site. Do not point people there.
- This Cursor Origin remote does not push deploys. GitHub Actions do.

## Do not

- Animate readable text with Pretext unless asked.
- Add a file for a single-use component.
- Restyle into a marketing landing page.
- Invent jobs, dates, or links that are not in the resume consts.
- Footnote where the code “lives” (GitLab or otherwise) on the page.
- Label the quote.
- Add `console_error_panic_hook`, `wasm-bindgen`, or JS interop from Rust for the mark.
