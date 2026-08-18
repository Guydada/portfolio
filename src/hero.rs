//! Canvas hero bound to the Pretext layout runtime.

use leptos::html;
use leptos::prelude::*;
use wasm_bindgen::prelude::*;
use web_sys::HtmlCanvasElement;

use crate::content::PROFILE;

#[wasm_bindgen(module = "/js/hero.js")]
extern "C" {
    #[wasm_bindgen(js_name = mountHero)]
    fn mount_hero(canvas: &HtmlCanvasElement, text: &str, color: &str);

    #[wasm_bindgen(js_name = setHeroColor)]
    fn set_hero_color(color: &str);

    #[wasm_bindgen(js_name = unmountHero)]
    fn unmount_hero();
}

/// Large name drawn with Pretext-measured glyph positions.
#[component]
pub fn HeroName(dark: Signal<bool>) -> impl IntoView {
    let canvas_ref: NodeRef<html::Canvas> = NodeRef::new();

    Effect::new(move |_| {
        let Some(canvas) = canvas_ref.get() else {
            return;
        };
        let color: &'static str = if dark.get_untracked() {
            "#f4f4f1"
        } else {
            "#111111"
        };
        mount_hero(&canvas, PROFILE.name, color);
        on_cleanup(|| {
            unmount_hero();
        });
    });

    Effect::new(move |_| {
        let color: &'static str = if dark.get() { "#f4f4f1" } else { "#111111" };
        set_hero_color(color);
    });

    view! {
        <div class="hero-type">
            <h1 class="sr-only">{PROFILE.name}</h1>
            <canvas
                node_ref=canvas_ref
                class="hero-canvas"
                aria-hidden="true"
            ></canvas>
        </div>
    }
}
