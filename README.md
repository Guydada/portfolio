# Guy Dahan

A live resume. Rust is kept small on purpose — see [AGENTS.md](AGENTS.md).

The mark at the top is a [Pretext](https://github.com/chenglou/pretext) sea: glyphs measured by width and ink, then laid on rolling waves.

## Run

```bash
rustup target add wasm32-unknown-unknown
cargo install trunk
trunk serve
```

Copy lives at the top of `src/main.rs`.
