//! Single-page resume layout.

use leptos::prelude::*;
use web_sys::window;

use crate::content::{
    contact_links, School, SkillGroup, EDUCATION, EXPERIENCE, LANGUAGES, PROFILE, SKILLS,
};
use crate::hero::HeroName;

/// Root resume page with a black/white theme.
#[component]
pub fn App() -> impl IntoView {
    let dark: RwSignal<bool> = RwSignal::new(read_initial_dark());

    Effect::new(move |_| {
        persist_theme(dark.get());
    });

    view! {
        <div class="page">
            <header class="masthead">
                <p class="kicker">Resume</p>
                <button
                    class="theme-toggle"
                    type="button"
                    aria-label=move || {
                        if dark.get() {
                            "Switch to white"
                        } else {
                            "Switch to black"
                        }
                    }
                    on:click=move |_| dark.update(|value| *value = !*value)
                >
                    {move || if dark.get() { "White" } else { "Black" }}
                </button>
            </header>

            <HeroName dark=dark.into() />

            <p class="title">{PROFILE.title}</p>
            <p class="meta">
                <span>{PROFILE.location}</span>
                <span aria-hidden="true">" · "</span>
                <a href=format!("mailto:{}", PROFILE.email)>{PROFILE.email}</a>
            </p>

            <p class="summary">{PROFILE.summary}</p>

            <Section label="Experience">
                <ol class="jobs">
                    {EXPERIENCE
                        .iter()
                        .map(|job| {
                            view! {
                                <li class="job">
                                    <div class="job-head">
                                        <div>
                                            <h3>{job.company}</h3>
                                            <p class="job-role">{job.role}</p>
                                        </div>
                                        <p class="job-dates">{job.dates}</p>
                                    </div>
                                    <p class="job-location">{job.location}</p>
                                    <ul>
                                        {job
                                            .points
                                            .iter()
                                            .map(|point| view! { <li>{*point}</li> })
                                            .collect_view()}
                                    </ul>
                                </li>
                            }
                        })
                        .collect_view()}
                </ol>
            </Section>

            <Section label="Skills">
                <ul class="skills">
                    {SKILLS
                        .iter()
                        .map(|group: &SkillGroup| {
                            view! {
                                <li>
                                    <h3>{group.name}</h3>
                                    <p class="skill-blurb">{group.blurb}</p>
                                    <p class="skill-items">{group.items}</p>
                                </li>
                            }
                        })
                        .collect_view()}
                </ul>
            </Section>

            <Section label="Education">
                <ul class="schools">
                    {EDUCATION
                        .iter()
                        .map(|school: &School| {
                            view! {
                                <li>
                                    <div class="job-head">
                                        <div>
                                            <h3>{school.school}</h3>
                                            <p class="job-role">{school.degree}</p>
                                        </div>
                                        <p class="job-dates">{school.dates}</p>
                                    </div>
                                    <p class="job-location">{school.note}</p>
                                </li>
                            }
                        })
                        .collect_view()}
                </ul>
            </Section>

            <Section label="Languages">
                <ul class="langs">
                    {LANGUAGES
                        .iter()
                        .map(|(name, level)| {
                            view! {
                                <li>
                                    <span>{*name}</span>
                                    <span>{*level}</span>
                                </li>
                            }
                        })
                        .collect_view()}
                </ul>
            </Section>

            <Section label="Contact">
                <ul class="contact">
                    {contact_links()
                        .into_iter()
                        .map(|link| {
                            let target: Option<&'static str> =
                                if link.external { Some("_blank") } else { None };
                            let rel: Option<&'static str> =
                                if link.external { Some("noreferrer") } else { None };
                            view! {
                                <li>
                                    <a href=link.href target=target rel=rel>
                                        {link.label}
                                    </a>
                                </li>
                            }
                        })
                        .collect_view()}
                </ul>
                <p class="note">
                    "Most of my professional work lives on GitLab rather than GitHub."
                </p>
            </Section>
        </div>
    }
}

/// Labeled resume section.
#[component]
fn Section(label: &'static str, children: Children) -> impl IntoView {
    view! {
        <section class="section">
            <h2>{label}</h2>
            {children()}
        </section>
    }
}

/// Read the stored theme, falling back to the system preference.
fn read_initial_dark() -> bool {
    let Some(win) = window() else {
        return false;
    };
    if let Ok(Some(storage)) = win.local_storage() {
        if let Ok(Some(value)) = storage.get_item("theme") {
            return value == "dark";
        }
    }
    win.match_media("(prefers-color-scheme: dark)")
        .ok()
        .flatten()
        .map(|query| query.matches())
        .unwrap_or(false)
}

/// Persist theme and mirror it onto the document root.
fn persist_theme(dark: bool) {
    let Some(win) = window() else {
        return;
    };
    let Some(document) = win.document() else {
        return;
    };
    let Some(root) = document.document_element() else {
        return;
    };
    let theme: &str = if dark { "dark" } else { "light" };
    let _ = root.set_attribute("data-theme", theme);
    if let Ok(Some(storage)) = win.local_storage() {
        let _ = storage.set_item("theme", theme);
    }
}
