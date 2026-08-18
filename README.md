# Guy Dahan

Live resume: [guyda.dev](https://guyda.dev).

Rust is kept small on purpose. The contract for that is [AGENTS.md](AGENTS.md).

The mark at the top is three traveling swells. [Pretext](https://github.com/chenglou/pretext) only spaces the beads on each line.

## Run

```bash
rustup target add wasm32-unknown-unknown
cargo install trunk
trunk serve
```

Copy lives at the top of `src/main.rs`. Edit consts, not a CMS.

## What is here

```
src/main.rs      resume + Leptos app (one file)
js/mark.js       sea mark (canvas, Pretext as a ruler)
style.css        black / white typesetting
index.html       Trunk entry, theme boot, G favicon
```

That is the whole site. Theme is `html[data-theme]`, set from localStorage or `prefers-color-scheme` before paint. The G in the tab bar is rebuilt as a blob URL when the theme flips — swapping a data-URI `href` in place does not stick.

Push to `main` on GitHub deploys to Vercel (`guyda.dev`).

## What we learned

These were paid for in passes. They belong in [AGENTS.md](AGENTS.md) so they do not get unlearned.

**Minimalism is a file count.** Splitting a one-page resume into `app` / `content` / `hero` modules added ceremony and no reuse. One Rust file, copy as consts, delete anything that is not load-bearing.

**Pretext is a measuring stick, not a typesetter.** Using it to scatter mixed glyphs in a density field looked like ASCII soup. Using it only to space `·` on a stroked sine reads as water. Draw the wave. Beads decorate the stroke.

**Do not clear the canvas by accident.** Setting `canvas.width` every frame resets the bitmap. Size when the box changes.

**Favicons cache on the URL.** Theme-invert only works if you throw away the old `<link rel="icon">` and append a new blob URL.

**The page is a document, not a landing page.** No labeled pull-quote. The line at the bottom is just there. No footnote about GitLab. No extra crates until something is used twice.

**Ship on GitHub `main`.** That is what Vercel watches. `guyda.com` is a different, older site.
