/* Renders every section from the global SITE object defined in data.js. No content lives here. */
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

  // Hide a section (and its nav link) when its data is empty.
  function toggleSection(id, show) {
    const section = $(id);
    if (section) section.hidden = !show;
  }

  // ---------- icons (inline SVG, no library) ----------
  const ICONS = {
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.4V17h16V7.4l-8 5.6-8-5.6ZM5.3 7 12 11.7 18.7 7H5.3Z"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
    scholar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 1 9l11 7 9-5.73V17h2V9L12 2Zm-6 11.6V17c0 1.66 2.69 4 6 4s6-2.34 6-4v-3.4l-6 3.82-6-3.82Z"/></svg>',
    orcid: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="2"/><rect x="7" y="10" width="2" height="8" fill="currentColor"/><circle cx="8" cy="7" r="1.25" fill="currentColor"/><path fill="none" stroke="currentColor" stroke-width="2" d="M11.5 10h2.5a4 4 0 0 1 0 8h-2.5z"/></svg>'
  };

  const CONTACT_LABELS = {
    email: "Email",
    github: "GitHub",
    linkedin: "LinkedIn",
    scholar: "Google Scholar",
    orcid: "ORCID"
  };

  // ---------- head / meta ----------
  function renderMeta() {
    const seo = SITE.seo || {};
    const description = seo.description || SITE.tagline || "";
    document.title = SITE.name || document.title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", SITE.name);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:image"]', "content", seo.image);
    setMeta('meta[property="og:url"]', "content", seo.url);
  }

  // ---------- hero ----------
  function renderHero() {
    $("nav-brand").textContent = SITE.name || "";
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
    if (has(SITE.cv)) {
      actions.append(el("a", { class: "btn btn-primary", href: SITE.cv, download: "" }, "Download CV"));
    }
    actions.append(el("a", { class: "btn", href: "#contact" }, "Contact"));
  }

  // ---------- about ----------
  function renderAbout() {
    toggleSection("about", has(SITE.about));
    $("about-text").textContent = SITE.about || "";
  }

  // ---------- education / experience timelines ----------
  function renderEducation() {
    const list = SITE.education || [];
    toggleSection("education", has(list));
    $("education-list").append(...list.map((item) => el("li", { class: "timeline-item" }, [
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
  }

  function renderExperience() {
    const list = SITE.experience || [];
    toggleSection("experience", has(list));
    $("experience-list").append(...list.map((item) => el("li", { class: "timeline-item" }, [
      el("div", { class: "timeline-years", text: item.years }),
      el("div", { class: "timeline-body" }, el("div", {}, [
        el("h3", { text: item.role }),
        el("p", { class: "muted", text: item.organization }),
        has(item.points) ? el("ul", { class: "bullets" }, item.points.map((p) => el("li", { text: p }))) : null
      ]))
    ])));
  }

  // ---------- projects ----------
  const PROJECT_LINK_LABELS = { paper: "Paper", video: "Video", github: "GitHub", project: "Project page" };

  function renderProjects() {
    const list = SITE.projects || [];
    toggleSection("projects", has(list));
    $("projects-list").append(...list.map((p) => {
      const links = Object.entries(p.links || {}).filter(([, href]) => has(href));
      return el("article", { class: "card" }, [
        has(p.image) ? el("img", { class: "card-img", src: p.image, alt: p.imageAlt || p.title, loading: "lazy" }) : null,
        el("div", { class: "card-body" }, [
          el("h3", { text: p.title }),
          el("p", { text: p.description }),
          has(p.tags) ? el("ul", { class: "chips", "aria-label": "Tags" }, p.tags.map((t) => el("li", { class: "chip", text: t }))) : null,
          has(links) ? el("div", { class: "link-row" }, links.map(([k, href]) => externalLink(href, PROJECT_LINK_LABELS[k] || k))) : null
        ])
      ]);
    }));
  }

  // ---------- publications ----------
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

  function renderVideoEmbed(details, url, title) {
    const id = youtubeId(url);
    if (!id) return;
    // Lazy: the iframe is only created the first time the user opens the <details>.
    details.addEventListener("toggle", function onToggle() {
      if (!details.open) return;
      details.removeEventListener("toggle", onToggle);
      details.append(el("div", { class: "video-wrap" }, el("iframe", {
        src: "https://www.youtube-nocookie.com/embed/" + id,
        title: "Video: " + title,
        loading: "lazy",
        allow: "accelerometer; encrypted-media; gyroscope; picture-in-picture",
        allowfullscreen: true,
        referrerpolicy: "strict-origin-when-cross-origin"
      })));
    });
  }

  const PUB_LINK_LABELS = { paper: "Paper", video: "Video", code: "Code" };

  function renderPublication(pub) {
    const links = Object.entries(pub.links || {}).filter(([, href]) => has(href));
    const wantsEmbed = pub.embedVideo && has(pub.links && pub.links.video) && youtubeId(pub.links.video);
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
      if (wantsEmbed) renderVideoEmbed(details, pub.links.video, pub.title);
      item.append(details);
    }

    if (has(links)) {
      item.append(el("div", { class: "link-row" }, links.map(([k, href]) => externalLink(href, PUB_LINK_LABELS[k] || k))));
    }
    return item;
  }

  function renderPublications() {
    const list = (SITE.publications || []).slice().sort((a, b) => (b.year || 0) - (a.year || 0));
    toggleSection("publications", has(list));
    const container = $("publications-list");
    const years = [...new Set(list.map((p) => p.year))];
    years.forEach((year) => {
      container.append(
        el("h3", { class: "year-heading", text: String(year) }),
        el("ol", { class: "pub-list" }, list.filter((p) => p.year === year).map(renderPublication))
      );
    });
  }

  // ---------- skills ----------
  function renderSkills() {
    const groups = (SITE.skills || []).filter((g) => has(g.items));
    toggleSection("skills", has(groups));
    $("skills-list").append(...groups.map((g) => el("div", { class: "skill-group" }, [
      has(g.group) ? el("h3", { text: g.group }) : null,
      el("ul", { class: "chips" }, g.items.map((s) => el("li", { class: "chip", text: s })))
    ])));
  }

  // ---------- awards ----------
  function renderAwards() {
    const list = SITE.awards || [];
    toggleSection("awards", has(list));
    $("awards-list").append(...list.map((a) => el("li", {}, [
      has(a.year) ? el("span", { class: "award-year", text: a.year }) : null,
      el("span", { text: a.title })
    ])));
  }

  // ---------- highlights ----------
  function renderHighlights() {
    const list = SITE.highlights || [];
    toggleSection("highlights", has(list));
    $("highlights-list").append(...list.map((h) => el("figure", {}, [
      el("img", { src: h.src, alt: h.alt || h.caption || "", loading: "lazy" }),
      has(h.caption) ? el("figcaption", { text: h.caption }) : null
    ])));
  }

  // ---------- contact ----------
  function renderContact() {
    const entries = Object.entries(SITE.contact || {}).filter(([k, v]) => ICONS[k] && has(v));
    toggleSection("contact", has(entries));
    $("contact-list").append(...entries.map(([k, v]) => {
      const href = k === "email" ? "mailto:" + v : v;
      const a = externalLink(href, null, "contact-link");
      a.append(el("span", { class: "contact-icon", html: ICONS[k] }), el("span", { text: k === "email" ? v : CONTACT_LABELS[k] }));
      a.setAttribute("aria-label", CONTACT_LABELS[k] + (k === "email" ? ": " + v : ""));
      return el("li", {}, a);
    }));
  }

  // ---------- nav ----------
  function renderNav() {
    const links = $("nav-links");
    document.querySelectorAll("main section[data-section]").forEach((section) => {
      if (section.hidden) return;
      links.append(el("li", {}, el("a", { href: "#" + section.id, text: section.dataset.section })));
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

  function renderFooter() {
    $("footer-text").textContent = "© " + new Date().getFullYear() + " " + (SITE.name || "");
  }

  renderMeta();
  renderHero();
  renderAbout();
  renderEducation();
  renderExperience();
  renderProjects();
  renderPublications();
  renderSkills();
  renderAwards();
  renderHighlights();
  renderContact();
  renderNav(); // last, so it only lists sections that rendered
  renderFooter();
})();
