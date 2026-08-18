# AGENTS.md

This repo is a live resume. The Rust should be a spectacle of minimalism: a pretty, functioning site with almost no machinery behind it.

## Bar

- One visual idea. One page. Black on white / white on black.
- Prefer **one Rust file**. Do not add modules, traits, or helpers until a thing is used twice.
- Copy lives as simple consts at the top of `src/main.rs`. That is the resume.
- If a line is not load-bearing, delete it.
- Pretext draws an **abstract mark**, never words, until explicitly asked otherwise.
- Do not explain, label, or typeset the quote as a pull-quote. Leave it as a colophon.

## Stack

- Leptos CSR, Trunk, Vercel. Pretext only in `js/mark.js`.
- No extra crates, CSS-in-Rust, component folders, or wrapper APIs without a hard need.

## Do not

- Animate readable text with Pretext unless asked.
- Add a file for a single-use component.
- Restyle into a marketing landing page.
- Invent jobs, dates, or links that are not in the resume consts.
