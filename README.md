# Guy Dahan

A live resume. Rust is kept small on purpose — see [AGENTS.md](AGENTS.md).

The mark at the top is a [Pretext](https://github.com/chenglou/pretext) smoke field: glyphs measured by width and ink, then advected. It does not set type.

## Run

```bash
rustup target add wasm32-unknown-unknown
cargo install trunk
trunk serve
```

Copy lives at the top of `src/main.rs`.
