# Guy Dahan

A live resume. Rust is kept small on purpose — see [AGENTS.md](AGENTS.md).

The mark at the top is [Pretext](https://github.com/chenglou/pretext) measuring a field of dots, then drawing them as a path. It does not set type.

## Run

```bash
rustup target add wasm32-unknown-unknown
cargo install trunk
trunk serve
```

Copy lives at the top of `src/main.rs`.
