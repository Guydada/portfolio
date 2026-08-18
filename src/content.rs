//! Resume copy kept in one place so the site stays easy to update.

pub struct Profile {
    pub name: &'static str,
    pub title: &'static str,
    pub location: &'static str,
    pub email: &'static str,
    pub phone: &'static str,
    pub phone_href: &'static str,
    pub linkedin: &'static str,
    pub github: &'static str,
    pub summary: &'static str,
}

pub struct Job {
    pub company: &'static str,
    pub location: &'static str,
    pub role: &'static str,
    pub dates: &'static str,
    pub points: &'static [&'static str],
}

pub struct SkillGroup {
    pub name: &'static str,
    pub blurb: &'static str,
    pub items: &'static str,
}

pub struct School {
    pub school: &'static str,
    pub degree: &'static str,
    pub dates: &'static str,
    pub note: &'static str,
}

pub struct Link {
    pub label: &'static str,
    pub href: &'static str,
    pub external: bool,
}

pub const PROFILE: Profile = Profile {
    name: "Guy Dahan",
    title: "Senior Solutions Architect  ·  AI Engineer  ·  Technical Lead",
    location: "Omer, Israel",
    email: "dahan.guy@icloud.com",
    phone: "+972 54-439-7380",
    phone_href: "tel:+972544397380",
    linkedin: "https://www.linkedin.com/in/guy-da/",
    github: "https://github.com/Guyda",
    summary: "AI engineer and senior solutions architect serving as a technical lead. I specialize in edge-optimized computer vision, generative AI, and agentic systems — owning delivery from problem framing and prototyping through deployment, optimization, and evaluation.",
};

pub const EXPERIENCE: &[Job] = &[
    Job {
        company: "NVIDIA",
        location: "Tel-Aviv, Israel",
        role: "Senior Solutions Architect  ·  Tech Lead",
        dates: "Dec 2023 — Present",
        points: &[
            "Tech lead for agentic AI platforms: agent harnesses, evaluation systems, and optimization pipelines using current agentic techniques.",
            "Lead development of local AI and Physical AI — LLM/VLM systems, computer vision, inference optimization, and edge deployment.",
            "Deep work across TensorRT, DeepStream, NIM, Jetson, and accelerated inference; ship reference architectures and production-oriented solutions.",
        ],
    },
    Job {
        company: "Captain's Eye",
        location: "Tel-Aviv, Israel",
        role: "Computer Vision Engineer  ·  AI Team Lead",
        dates: "2022 — 2023",
        points: &[
            "Built deep-learning pipelines with DeepStream, TensorRT, and ONNX, focused on production throughput and model performance.",
            "Ran company-wide MLOps: data collection, synthetic data, curation, and model deployment.",
            "R&D team lead.",
        ],
    },
    Job {
        company: "Siemens DISW",
        location: "Tel-Aviv, Israel",
        role: "Software Engineer  ·  Simulation Engineer",
        dates: "Oct 2020 — Jul 2022",
        points: &[
            "Research and development in the core robotics team.",
            "C/C++ development for engineering simulation software, including computer vision systems.",
            "Implemented and evaluated AI for robotics use cases.",
        ],
    },
    Job {
        company: "Israeli Navy",
        location: "Israel",
        role: "Chief Engineer  ·  Project Manager  ·  Lieutenant Commander (Rav-Seren, OF-3)",
        dates: "Jul 2011 — Oct 2019",
        points: &[
            "Led a team of 35 mechanics and engineering professionals operating and maintaining an operational warship.",
            "Head of the Sa'ar 6 missile ship operating project.",
            "Managed projects from procurement through commissioning.",
        ],
    },
];

pub const SKILLS: &[SkillGroup] = &[
    SkillGroup {
        name: "Generative AI",
        blurb: "Agentic frameworks and RAG evaluation systems",
        items: "LLM, VLM, VLA, RAG, Physical AI, Robotics, TensorRT-LLM, TensorRT-Edge-LLM, Cosmos Reason, NIM",
    },
    SkillGroup {
        name: "Software ownership",
        blurb: "Architecting scalable solutions from design to production",
        items: "Python, C/C++, CUDA, Rust, Simulation, Linux, Windows, macOS, Jetson, GPU, Spark",
    },
    SkillGroup {
        name: "MLOps & infrastructure",
        blurb: "Full-lifecycle orchestration from training to deployment",
        items: "DataOps, AIOps, synthetic data, Omniverse, Docker, Terraform, AWS, system design, Git, GitLab, Ansible, uv",
    },
    SkillGroup {
        name: "CV & edge",
        blurb: "SOTA performance tuning for edge and cloud",
        items: "TensorRT, DeepStream, Triton, JetPack, Holoscan, GStreamer",
    },
];

pub const EDUCATION: &[School] = &[
    School {
        school: "Tel-Aviv University",
        degree: "BSc, Digital Sciences for Hi-Tech",
        dates: "2019 — 2022",
        note: "Additional major beyond an undergraduate degree",
    },
    School {
        school: "University of Haifa",
        degree: "BA, Multidisciplinary Studies",
        dates: "2013 — 2014",
        note: "Israeli Naval Officers Academy Program",
    },
];

pub const LANGUAGES: &[(&str, &str)] = &[("Hebrew", "Native"), ("English", "Full professional")];

pub fn contact_links() -> [Link; 4] {
    [
        Link {
            label: PROFILE.email,
            href: concat!("mailto:", "dahan.guy@icloud.com"),
            external: false,
        },
        Link {
            label: PROFILE.phone,
            href: PROFILE.phone_href,
            external: false,
        },
        Link {
            label: "LinkedIn",
            href: PROFILE.linkedin,
            external: true,
        },
        Link {
            label: "GitHub",
            href: PROFILE.github,
            external: true,
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::{contact_links, EDUCATION, EXPERIENCE, PROFILE, SKILLS};

    #[test]
    fn profile_matches_resume() {
        assert_eq!(PROFILE.name, "Guy Dahan");
        assert!(PROFILE.email.contains('@'));
        assert!(PROFILE.summary.len() > 80);
    }

    #[test]
    fn experience_covers_core_roles() {
        let companies: Vec<&str> = EXPERIENCE.iter().map(|job| job.company).collect();
        assert_eq!(
            companies,
            ["NVIDIA", "Captain's Eye", "Siemens DISW", "Israeli Navy"]
        );
        assert!(EXPERIENCE.iter().all(|job| !job.points.is_empty()));
    }

    #[test]
    fn skills_and_education_are_populated() {
        assert_eq!(SKILLS.len(), 4);
        assert_eq!(EDUCATION.len(), 2);
        assert_eq!(contact_links().len(), 4);
    }
}
