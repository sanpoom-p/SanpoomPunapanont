/*
 * Renders the site from the global SITE object defined in data.js. No content lives here.
 * index.html   -> home page (all sections)
 * project.html -> one project's detail page, chosen by ?id=<project id>
 * 3D models are drawn by js/viewer3d.js, which is loaded only when a page has a model
 * and the site is served over http(s) (browsers block it from file://; the image is shown instead).
 */
(function () {
  "use strict";

  if (typeof SITE === "undefined") {
    console.error("data.js did not load: SITE is undefined.");
    return;
  }

  // ---------- helpers ----------
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value === undefined || value === null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "html") node.innerHTML = value; // only used with trusted, built-in SVG strings
      else node.setAttribute(key, value === true ? "" : value);
    }
    for (const child of [].concat(children || [])) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  }

  const $ = (id) => document.getElementById(id);
  const has = (v) => (Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim()));
  const isFileProtocol = location.protocol === "file:";
  const page = document.body.dataset.page || "home";

  function externalLink(href, label, className) {
    const isExternal = /^https?:\/\//.test(href);
    return el("a", {
      class: className || "btn btn-small",
      href,
      target: isExternal ? "_blank" : null,
      rel: isExternal ? "noopener noreferrer" : null
    }, label);
  }

  function setMeta(selector, attr, value) {
    const tag = document.querySelector(selector);
    if (tag && has(value)) tag.setAttribute(attr, value);
  }

  function youtubeId(url) {
    const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return m ? m[1] : null;
  }

  function youtubeIframe(url, title) {
    return el("iframe", {
      src: "https://www.youtube-nocookie.com/embed/" + youtubeId(url),
      title: "Video: " + title,
      loading: "lazy",
      allow: "accelerometer; encrypted-media; gyroscope; picture-in-picture",
      allowfullscreen: true,
      referrerpolicy: "strict-origin-when-cross-origin"
    });
  }

  function projectUrl(project) {
    return "project.html?id=" + encodeURIComponent(project.id);
  }

  // Which home-page sections have content. Drives both section visibility and the nav.
  const SECTIONS = [
    { id: "about", label: "About", show: () => has(SITE.about) },
    { id: "education", label: "Education", show: () => has(SITE.education) },
    { id: "experience", label: "Experience", show: () => has(SITE.experience) },
    { id: "projects", label: "Projects", show: () => has(SITE.projects) },
    { id: "publications", label: "Publications", show: () => has(SITE.publications) },
    { id: "skills", label: "Skills", show: () => (SITE.skills || []).some((g) => has(g.items)) },
    { id: "awards", label: "Awards", show: () => has(SITE.awards) },
    { id: "highlights", label: "Highlights", show: () => has(SITE.highlights) },
    { id: "contact", label: "Contact", show: () => Object.entries(SITE.contact || {}).some(([k, v]) => ICONS[k] && has(v)) }
  ];

  // ---------- icons (inline SVG, no library) ----------
  const ICONS = {
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.4V17h16V7.4l-8 5.6-8-5.6ZM5.3 7 12 11.7 18.7 7H5.3Z"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
    scholar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 1 9l11 7 9-5.73V17h2V9L12 2Zm-6 11.6V17c0 1.66 2.69 4 6 4s6-2.34 6-4v-3.4l-6 3.82-6-3.82Z"/></svg>',
    orcid: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="2"/><rect x="7" y="10" width="2" height="8" fill="currentColor"/><circle cx="8" cy="7" r="1.25" fill="currentColor"/><path fill="none" stroke="currentColor" stroke-width="2" d="M11.5 10h2.5a4 4 0 0 1 0 8h-2.5z"/></svg>'
  };

  const ARROW_LEFT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ARROW_RIGHT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const CONTACT_LABELS = { email: "Email", github: "GitHub", linkedin: "LinkedIn", scholar: "Google Scholar", orcid: "ORCID" };
  const PROJECT_LINK_LABELS = { paper: "Paper", video: "Video", github: "GitHub", project: "Project page" };
  const PUB_LINK_LABELS = { paper: "Paper", video: "Video", code: "Code" };

  // ---------- shared: nav, meta, footer ----------
  function renderNav() {
    $("nav-brand").textContent = SITE.name || "";
    const prefix = page === "home" ? "" : "index.html";
    if (page !== "home") $("nav-brand").setAttribute("href", "index.html");

    const links = $("nav-links");
    SECTIONS.filter((s) => s.show()).forEach((s) => {
      links.append(el("li", {}, el("a", { href: prefix + "#" + s.id, text: s.label })));
    });

    const toggle = document.querySelector(".nav-toggle");
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.classList.toggle("open", !open);
    });
    links.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("open");
      }
    });
  }

  function renderMeta(title, description, image) {
    const seo = SITE.seo || {};
    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:image"]', "content", image);
    setMeta('meta[property="og:url"]', "content", seo.url);
  }

  function renderFooter() {
    $("footer-text").textContent = "© " + new Date().getFullYear() + " " + (SITE.name || "");
  }

  // A box that shows the project image and, when js/viewer3d.js runs, swaps in a live 3D model.
  // mode: "full" (rotate, zoom, pan), "rotate" (drag to rotate only, page scroll untouched), or false (auto-turn only).
  function modelStage(project, mode) {
    return el("div", {
      class: "model-stage",
      "data-model": project.model,
      "data-interactive": mode || null,
      "data-label": project.modelAlt || "3D model of " + project.title,
      role: "img",
      "aria-label": project.imageAlt || project.title
    }, [
      has(project.image) ? el("img", { class: "model-poster", src: project.image, alt: "", loading: "lazy" }) : null,
      el("div", { class: "model-spinner", "aria-hidden": "true" })
    ]);
  }

  function loadViewer() {
    if (!document.querySelector(".model-stage[data-model]")) return;
    if (isFileProtocol) {
      document.documentElement.classList.add("no-3d");
      return;
    }
    document.body.append(el("script", { type: "module", src: "js/viewer3d.js" }));
  }

  // ---------- publications (used on both pages) ----------
  function normalizeName(name) {
    return String(name).replace(/[†*‡§¶]/g, "").trim().toLowerCase();
  }

  function renderAuthors(authors) {
    const me = normalizeName(SITE.authorName || SITE.name || "");
    const p = el("p", { class: "pub-authors" });
    authors.forEach((a, i) => {
      p.append(normalizeName(a) === me ? el("strong", { text: a }) : a);
      if (i < authors.length - 1) p.append(", ");
    });
    return p;
  }

  function lazyVideoEmbed(details, url, title) {
    // The iframe is only created the first time the user opens the <details>.
    details.addEventListener("toggle", function onToggle() {
      if (!details.open) return;
      details.removeEventListener("toggle", onToggle);
      details.append(el("div", { class: "video-wrap" }, youtubeIframe(url, title)));
    });
  }

  function renderPublication(pub, options) {
    const allowEmbed = !(options && options.noEmbed);
    const links = Object.entries(pub.links || {}).filter(([, href]) => has(href));
    const wantsEmbed = allowEmbed && pub.embedVideo && has(pub.links && pub.links.video) && youtubeId(pub.links.video);
    const showDetails = has(pub.abstract) || wantsEmbed;

    const item = el("li", { class: "pub" }, [
      el("div", { class: "pub-head" }, [
        el("span", { class: "venue-tag", text: "[" + pub.venue + "]" }),
        has(pub.status) ? el("span", { class: "status-tag", text: pub.status }) : null
      ]),
      el("h3", { class: "pub-title", text: pub.title }),
      has(pub.authors) ? renderAuthors(pub.authors) : null,
      has(pub.details) ? el("p", { class: "pub-details muted", text: pub.details }) : null
    ]);

    if (showDetails) {
      const summaryText = has(pub.abstract) ? (wantsEmbed ? "Abstract & video" : "Abstract") : "Video";
      const details = el("details", { class: "pub-abstract" }, [
        el("summary", { text: summaryText }),
        has(pub.abstract) ? el("p", { text: pub.abstract }) : null
      ]);
      if (wantsEmbed) lazyVideoEmbed(details, pub.links.video, pub.title);
      item.append(details);
    }

    if (has(links)) {
      item.append(el("div", { class: "link-row" }, links.map(([k, href]) => externalLink(href, PUB_LINK_LABELS[k] || k))));
    }
    return item;
  }

  // ---------- project showcase (home page) ----------
  // One large slide per project; arrows, dots and the keyboard's left/right keys switch slides.
  function renderShowcase() {
    const projects = SITE.projects || [];
    if (!projects.length) return;
    const pad = (n) => String(n).padStart(2, "0");

    const slides = projects.map((p, i) => {
      const links = Object.entries(p.links || {}).filter(([k, href]) => has(href) && k !== "project");
      return el("article", {
        class: "slide",
        role: "group",
        "aria-roledescription": "slide",
        "aria-label": (i + 1) + " of " + projects.length + ": " + p.title,
        hidden: i !== 0
      }, [
        el("div", { class: "slide-media" }, has(p.model)
          ? [modelStage(p, "rotate"), el("span", { class: "slide-hint", "aria-hidden": "true", text: "Drag to rotate" })]
          : (has(p.image) ? el("img", { class: "slide-img", src: p.image, alt: p.imageAlt || p.title, loading: i ? "lazy" : null }) : null)),
        el("div", { class: "slide-info" }, [
          el("p", { class: "slide-count" }, [el("strong", { text: pad(i + 1) }), " / " + pad(projects.length)]),
          el("h3", { class: "slide-title", text: p.title }),
          el("p", { class: "slide-desc", text: p.description }),
          has(p.tags) ? el("ul", { class: "chips", "aria-label": "Tags" }, p.tags.map((t) => el("li", { class: "chip", text: t }))) : null,
          has(p.highlights) ? el("ul", { class: "slide-highlights", "aria-label": "Key results" }, p.highlights.slice(0, 2).map((h) => el("li", { text: h }))) : null,
          el("div", { class: "link-row" }, [
            el("a", { class: "btn btn-primary", href: projectUrl(p) }, ["View project", el("span", { "aria-hidden": "true", text: "\u00a0→" })]),
            ...links.map(([k, href]) => externalLink(href, PROJECT_LINK_LABELS[k] || k, "btn"))
          ])
        ])
      ]);
    });

    const dots = projects.map((p, i) => el("button", { type: "button", "aria-label": "Show project " + (i + 1) + ": " + p.title }));
    const prev = el("button", { type: "button", class: "showcase-arrow prev", "aria-label": "Previous project", html: ARROW_LEFT });
    const next = el("button", { type: "button", class: "showcase-arrow next", "aria-label": "Next project", html: ARROW_RIGHT });
    const showcase = el("div", { class: "showcase", role: "region", "aria-roledescription": "carousel", "aria-label": "Research projects" }, [
      el("div", { class: "showcase-viewport", "aria-live": "polite" }, slides),
      el("div", { class: "showcase-nav" }, projects.length > 1 ? [prev, el("div", { class: "showcase-dots" }, dots), next] : [])
    ]);

    let current = 0;
    function show(index) {
      current = (index + projects.length) % projects.length;
      slides.forEach((slide, i) => { slide.hidden = i !== current; });
      dots.forEach((dot, i) => dot.setAttribute("aria-current", i === current ? "true" : "false"));
    }
    prev.addEventListener("click", () => show(current - 1));
    next.addEventListener("click", () => show(current + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
    showcase.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { show(current - 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { show(current + 1); e.preventDefault(); }
    });
    show(0);
    $("projects-list").append(showcase);
  }

  // ================= HOME PAGE =================
  function renderHome() {
    renderMeta(SITE.name || document.title, (SITE.seo || {}).description || SITE.tagline, (SITE.seo || {}).image);
    SECTIONS.forEach((s) => { const section = $(s.id); if (section) section.hidden = !s.show(); });

    // Hero
    $("hero-name").textContent = SITE.name || "";
    $("hero-title").textContent = SITE.title || "";
    $("hero-tagline").textContent = SITE.tagline || "";
    const photo = $("hero-photo");
    if (has(SITE.photo)) {
      photo.src = SITE.photo;
      photo.alt = SITE.photoAlt || "Portrait of " + SITE.name;
    } else {
      photo.remove();
    }
    const actions = $("hero-actions");
    if (has(SITE.cv)) actions.append(el("a", { class: "btn btn-primary", href: SITE.cv, download: "" }, "Download CV"));
    actions.append(el("a", { class: "btn", href: "#contact" }, "Contact"));

    // About
    $("about-text").textContent = SITE.about || "";

    // Education
    $("education-list").append(...(SITE.education || []).map((item) => el("li", { class: "timeline-item" }, [
      el("div", { class: "timeline-years", text: item.years }),
      el("div", { class: "timeline-body" }, [
        has(item.logo) ? el("img", { class: "timeline-logo", src: item.logo, alt: item.institution + " logo", loading: "lazy" }) : null,
        el("div", {}, [
          el("h3", { text: item.degree }),
          el("p", { class: "muted", text: item.institution }),
          has(item.note) ? el("p", { class: "timeline-note", text: item.note }) : null
        ])
      ])
    ])));

    // Experience
    $("experience-list").append(...(SITE.experience || []).map((item) => el("li", { class: "timeline-item" }, [
      el("div", { class: "timeline-years", text: item.years }),
      el("div", { class: "timeline-body" }, el("div", {}, [
        el("h3", { text: item.role }),
        el("p", { class: "muted", text: item.organization }),
        has(item.points) ? el("ul", { class: "bullets" }, item.points.map((p) => el("li", { text: p }))) : null
      ]))
    ])));

    renderShowcase();

    // Publications, grouped by year (newest first)
    const pubs = (SITE.publications || []).slice().sort((a, b) => (b.year || 0) - (a.year || 0));
    [...new Set(pubs.map((p) => p.year))].forEach((year) => {
      $("publications-list").append(
        el("h3", { class: "year-heading", text: String(year) }),
        el("ol", { class: "pub-list" }, pubs.filter((p) => p.year === year).map((p) => renderPublication(p)))
      );
    });

    // Skills
    $("skills-list").append(...(SITE.skills || []).filter((g) => has(g.items)).map((g) => el("div", { class: "skill-group" }, [
      has(g.group) ? el("h3", { text: g.group }) : null,
      el("ul", { class: "chips" }, g.items.map((s) => el("li", { class: "chip", text: s })))
    ])));

    // Awards
    $("awards-list").append(...(SITE.awards || []).map((a) => el("li", {}, [
      has(a.year) ? el("span", { class: "award-year", text: a.year }) : null,
      el("span", { text: a.title })
    ])));

    // Highlights
    $("highlights-list").append(...(SITE.highlights || []).map((h) => el("figure", {}, [
      el("img", { src: h.src, alt: h.alt || h.caption || "", loading: "lazy" }),
      has(h.caption) ? el("figcaption", { text: h.caption }) : null
    ])));

    // Contact
    $("contact-list").append(...Object.entries(SITE.contact || {}).filter(([k, v]) => ICONS[k] && has(v)).map(([k, v]) => {
      const a = externalLink(k === "email" ? "mailto:" + v : v, null, "contact-link");
      a.append(el("span", { class: "contact-icon", html: ICONS[k] }), el("span", { text: k === "email" ? v : CONTACT_LABELS[k] }));
      a.setAttribute("aria-label", CONTACT_LABELS[k] + (k === "email" ? ": " + v : ""));
      return el("li", {}, a);
    }));
  }

  // ================= PROJECT DETAIL PAGE =================
  function renderProjectPage() {
    const root = $("project");
    const projects = SITE.projects || [];
    const id = new URLSearchParams(location.search).get("id");
    const index = projects.findIndex((p) => p.id === id);
    const p = projects[index];
    const back = el("a", { class: "back-link", href: "index.html#projects" }, [el("span", { "aria-hidden": "true", text: "← " }), "All projects"]);

    if (!p) {
      renderMeta("Project not found | " + SITE.name, SITE.tagline);
      root.append(back, el("h1", { text: "Project not found" }),
        el("p", { class: "muted", text: "This project does not exist or its link has changed." }));
      return;
    }

    renderMeta(p.title + " | " + SITE.name, p.description, p.image);
    const prevP = projects[(index - 1 + projects.length) % projects.length];
    const nextP = projects[(index + 1) % projects.length];
    const links = Object.entries(p.links || {}).filter(([, href]) => has(href));
    const videos = (p.videos || []).filter((v) => youtubeId(v.url));
    const pubs = (p.publicationIds || []).map((pid) => (SITE.publications || []).find((x) => x.id === pid)).filter(Boolean);

    root.append(
      el("div", { class: "project-topbar" }, [
        back,
        projects.length > 1 ? el("nav", { class: "project-arrows", "aria-label": "Switch project" }, [
          el("a", { class: "showcase-arrow", href: projectUrl(prevP), "aria-label": "Previous project: " + prevP.title, html: ARROW_LEFT }),
          el("a", { class: "showcase-arrow", href: projectUrl(nextP), "aria-label": "Next project: " + nextP.title, html: ARROW_RIGHT })
        ]) : null
      ]),
      el("header", { class: "project-header" }, [
        el("h1", { text: p.title }),
        el("p", { class: "project-lead", text: p.description }),
        has(p.tags) ? el("ul", { class: "chips", "aria-label": "Tags" }, p.tags.map((t) => el("li", { class: "chip", text: t }))) : null,
        has(links) ? el("div", { class: "link-row" }, links.map(([k, href], i) =>
          externalLink(href, PROJECT_LINK_LABELS[k] || k, i === 0 ? "btn btn-primary" : "btn"))) : null
      ])
    );

    // Hero media: interactive 3D model if available, otherwise the project image.
    if (has(p.model)) {
      root.append(el("div", { class: "project-viewer" }, [
        modelStage(p, "full"),
        el("p", { class: "viewer-hint muted" }, [
          el("span", { class: "hint-3d", text: "Drag to rotate · Scroll or pinch to zoom · Right-drag to pan · Double-click to reset" }),
          el("span", { class: "hint-file", text: "The interactive 3D model loads when the site is opened from the web (GitHub Pages or a local server), not from a file on disk." })
        ])
      ]));
    } else if (has(p.image)) {
      root.append(el("figure", { class: "project-figure" }, el("img", { src: p.image, alt: p.imageAlt || p.title })));
    }

    if (has(p.overview)) {
      root.append(el("section", { class: "project-section", "aria-labelledby": "overview-h" }, [
        el("h2", { id: "overview-h", text: "Overview" }), el("p", { class: "project-text", text: p.overview })
      ]));
    }

    if (has(p.highlights)) {
      root.append(el("section", { class: "project-section", "aria-labelledby": "results-h" }, [
        el("h2", { id: "results-h", text: "Key results" }),
        el("ul", { class: "bullets" }, p.highlights.map((h) => el("li", { text: h })))
      ]));
    }

    if (has(videos)) {
      root.append(el("section", { class: "project-section", "aria-labelledby": "videos-h" }, [
        el("h2", { id: "videos-h", text: videos.length > 1 ? "Videos" : "Video" }),
        el("div", { class: "video-grid" }, videos.map((v) => el("figure", { class: "video-item" }, [
          el("div", { class: "video-wrap" }, youtubeIframe(v.url, v.title || p.title)),
          has(v.title) ? el("figcaption", { text: v.title }) : null
        ])))
      ]));
    }

    // When the 3D model took the hero spot, still show the paper figure here.
    if (has(p.model) && has(p.image)) {
      root.append(el("section", { class: "project-section", "aria-labelledby": "figure-h" }, [
        el("h2", { id: "figure-h", text: "Figure" }),
        el("figure", { class: "project-figure" }, el("img", { src: p.image, alt: p.imageAlt || p.title, loading: "lazy" }))
      ]));
    }

    if (has(pubs)) {
      root.append(el("section", { class: "project-section", "aria-labelledby": "pubs-h" }, [
        el("h2", { id: "pubs-h", text: pubs.length > 1 ? "Publications" : "Publication" }),
        el("ol", { class: "pub-list" }, pubs.map((pub) => renderPublication(pub, { noEmbed: true })))
      ]));
    }

    // Previous / next project
    if (projects.length > 1) {
      const prev = prevP;
      const next = nextP;
      root.append(el("nav", { class: "project-pager", "aria-label": "More projects" }, [
        el("a", { href: projectUrl(prev) }, [el("span", { class: "muted", text: "← Previous" }), el("span", { text: prev.title })]),
        el("a", { href: projectUrl(next), class: "pager-next" }, [el("span", { class: "muted", text: "Next →" }), el("span", { text: next.title })])
      ]));
    }
  }

  renderNav();
  if (page === "project") renderProjectPage();
  else renderHome();
  renderFooter();
  loadViewer();
})();
