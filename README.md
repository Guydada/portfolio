# Guy Dahan

Live resume, built in Rust ([Leptos](https://leptos.dev) CSR) and deployed to Vercel with Trunk.

The name is laid out with [Pretext](https://github.com/chenglou/pretext) — measured once, then animated onto a canvas without DOM reflow. The rest of the page is a straightforward typeset resume.

## Run locally

```bash
rustup target add wasm32-unknown-unknown
cargo install trunk
trunk serve
```

Open the printed URL (usually `http://127.0.0.1:8080`).

## Edit the resume

All copy lives in [`src/content.rs`](src/content.rs). Update that file and rebuild.

The Pretext animation lives in [`js/hero.js`](js/hero.js).

## Deploy

GitHub Actions build with Trunk and publish `dist/` to Vercel. In the Vercel project:

- Build command: empty, override on
- Output directory: `dist`

Repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
