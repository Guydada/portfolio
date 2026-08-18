use leptos::prelude::*;
use web_sys::window;

struct Profile {
    name: &'static str,
    title: &'static str,
    location: &'static str,
    email: &'static str,
    phone: &'static str,
    linkedin: &'static str,
    github: &'static str,
    summary: &'static str,
}

struct Job {
    company: &'static str,
    location: &'static str,
    role: &'static str,
    dates: &'static str,
    points: &'static [&'static str],
}

struct Skill {
    name: &'static str,
    blurb: &'static str,
    items: &'static str,
}

struct School {
    name: &'static str,
    degree: &'static str,
    dates: &'static str,
    note: &'static str,
}

const ME: Profile = Profile {
    name: "Guy Dahan",
    title: "Senior Solutions Architect  ·  AI Engineer  ·  Technical Lead",
    location: "Omer, Israel",
    email: "dahan.guy@icloud.com",
    phone: "+972 54-439-7380",
    linkedin: "https://www.linkedin.com/in/guy-da/",
    github: "https://github.com/Guydada",
    summary: "AI engineer and senior solutions architect serving as a technical lead. Edge-optimized computer vision, generative AI, and agentic systems — from problem framing through deployment, optimization, and evaluation.",
};

const QUOTE: &str = "every distance is a walking distance";

const JOBS: &[Job] = &[
    Job {
        company: "NVIDIA",
        location: "Tel-Aviv, Israel",
        role: "Senior Solutions Architect  ·  Tech Lead",
        dates: "Dec 2023 — Present",
        points: &[
            "Tech lead for agentic AI platforms: harnesses, evaluation, and optimization pipelines.",
            "Local AI and Physical AI — LLM/VLM, computer vision, inference, and edge deployment.",
            "TensorRT, DeepStream, NIM, Jetson; reference architectures and production solutions.",
        ],
    },
    Job {
        company: "Captain's Eye",
        location: "Tel-Aviv, Israel",
        role: "Computer Vision Engineer  ·  AI Team Lead",
        dates: "2022 — 2023",
        points: &[
            "Deep-learning pipelines with DeepStream, TensorRT, and ONNX for production throughput.",
            "Company MLOps: collection, synthetic data, curation, deployment. R&D team lead.",
        ],
    },
    Job {
        company: "Siemens DISW",
        location: "Tel-Aviv, Israel",
        role: "Software Engineer  ·  Simulation Engineer",
        dates: "Oct 2020 — Jul 2022",
        points: &[
            "Core robotics team. C/C++ simulation software, computer vision, AI for robotics.",
        ],
    },
    Job {
        company: "Israeli Navy",
        location: "Israel",
        role: "Chief Engineer  ·  Project Manager  ·  Lieutenant Commander (Rav-Seren, OF-3)",
        dates: "Jul 2011 — Oct 2019",
        points: &[
            "Led 35 mechanics and engineers on an operational warship. Head of Sa'ar 6 operating project.",
        ],
    },
];

const SKILLS: &[Skill] = &[
    Skill {
        name: "Generative AI",
        blurb: "Agentic frameworks and RAG evaluation",
        items: "LLM, VLM, VLA, RAG, Physical AI, Robotics, TensorRT-LLM, NIM",
    },
    Skill {
        name: "Software",
        blurb: "Design through production",
        items: "Python, C/C++, CUDA, Rust, Simulation, Linux, Jetson, GPU",
    },
    Skill {
        name: "MLOps",
        blurb: "Training through deployment",
        items: "DataOps, synthetic data, Omniverse, Docker, Terraform, AWS, GitLab, Ansible",
    },
    Skill {
        name: "CV & edge",
        blurb: "Performance on edge and cloud",
        items: "TensorRT, DeepStream, Triton, JetPack, Holoscan, GStreamer",
    },
];

const SCHOOLS: &[School] = &[
    School {
        name: "Tel-Aviv University",
        degree: "BSc, Digital Sciences for Hi-Tech",
        dates: "2019 — 2022",
        note: "Additional major beyond an undergraduate degree",
    },
    School {
        name: "University of Haifa",
        degree: "BA, Multidisciplinary Studies",
        dates: "2013 — 2014",
        note: "Israeli Naval Officers Academy Program",
    },
];

fn main() {
    mount_to_body(App);
}

/// Live resume. Theme is a class on the shell; Pretext lives in `js/mark.js`.
#[component]
fn App() -> impl IntoView {
    let dark: RwSignal<bool> = RwSignal::new(html_is_dark());
    Effect::new(move |_| set_theme(dark.get()));

    view! {
        <div class="page">
            <header class="masthead">
                <p class="kicker">Resume</p>
                <button
                    class="theme-toggle"
                    type="button"
                    on:click=move |_| dark.update(|on| *on = !*on)
                >
                    {move || if dark.get() { "White" } else { "Black" }}
                </button>
            </header>

            <canvas class="mark" aria-hidden="true"></canvas>
            <h1>{ME.name}</h1>
            <p class="title">{ME.title}</p>
            <p class="meta">
                {ME.location}
                " · "
                <a href=format!("mailto:{}", ME.email)>{ME.email}</a>
            </p>
            <p class="summary">{ME.summary}</p>

            <Section label="Experience">
                <ol class="jobs">
                    {JOBS
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
                        .map(|skill| {
                            view! {
                                <li>
                                    <h3>{skill.name}</h3>
                                    <p class="skill-blurb">{skill.blurb}</p>
                                    <p class="skill-items">{skill.items}</p>
                                </li>
                            }
                        })
                        .collect_view()}
                </ul>
            </Section>

            <Section label="Education">
                <ul class="schools">
                    {SCHOOLS
                        .iter()
                        .map(|school| {
                            view! {
                                <li>
                                    <div class="job-head">
                                        <div>
                                            <h3>{school.name}</h3>
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

            <Section label="Contact">
                <ul class="contact">
                    <li><a href=format!("mailto:{}", ME.email)>{ME.email}</a></li>
                    <li><a href="tel:+972544397380">{ME.phone}</a></li>
                    <li><a href=ME.linkedin rel="noreferrer" target="_blank">LinkedIn</a></li>
                    <li><a href=ME.github rel="noreferrer" target="_blank">GitHub</a></li>
                </ul>
            </Section>

            <p class="colophon">{QUOTE}</p>
        </div>
    }
}

/// Labeled block with a top rule.
#[component]
fn Section(label: &'static str, children: Children) -> impl IntoView {
    view! { <section class="section"><h2>{label}</h2>{children()}</section> }
}

/// Theme already stamped on `<html>` by the boot script.
fn html_is_dark() -> bool {
    window()
        .and_then(|win| win.document())
        .and_then(|doc| doc.document_element())
        .and_then(|root| root.get_attribute("data-theme"))
        .is_some_and(|theme| theme == "dark")
}

/// Keep `<html data-theme>` and localStorage in sync with the toggle.
fn set_theme(dark: bool) {
    let Some(win) = window() else {
        return;
    };
    let Some(root) = win.document().and_then(|doc| doc.document_element()) else {
        return;
    };
    let theme: &str = if dark { "dark" } else { "light" };
    let _ = root.set_attribute("data-theme", theme);
    if let Ok(Some(storage)) = win.local_storage() {
        let _ = storage.set_item("theme", theme);
    }
}

#[cfg(test)]
mod tests {
    use super::{JOBS, ME, QUOTE, SCHOOLS, SKILLS};

    #[test]
    fn resume_core() {
        assert_eq!(ME.name, "Guy Dahan");
        assert_eq!(JOBS.len(), 4);
        assert_eq!(SKILLS.len(), 4);
        assert_eq!(SCHOOLS.len(), 2);
        assert_eq!(QUOTE, "every distance is a walking distance");
    }
}
