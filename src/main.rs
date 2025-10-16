// Use the recommended prelude for modern Leptos versions
use leptos::prelude::*;

#[component]
fn App(increment: i32) -> impl IntoView {
    // 'create_signal' has been renamed to 'signal'
    let (count, set_count) = signal(0);

    view! {
        <div class="container">
            <picture>
                <source srcset="https://raw.githubusercontent.com/leptos-rs/leptos/main/docs/logos/Leptos_logo_pref_dark_RGB.svg" media="(prefers-color-scheme: dark)"/>
                <img src="https://raw.githubusercontent.com/leptos-rs/leptos/main/docs/logos/Leptos_logo_RGB.svg" alt="Leptos Logo" height="200" width="400"/>
            </picture>

            <h1>"Welcome to Leptos"</h1>
            <h2><i>"On Vercel"</i></h2>

            <button
                on:click=move |_| {
                    set_count.update(|n| *n += increment);
                }
            >
                "Click me: "
                {count}
            </button>
        </div>
    }
}

fn main() {
    // 'mount_to_body' is included in the prelude
    mount_to_body(|| {
        view! {
            <App increment=5 />
        }
    })
}

