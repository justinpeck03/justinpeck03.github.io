// Builds the About page from content/resume.json: an intro (bio + photo), a
// scroll-revealed timeline of education + experience, and the resume download.
// Data-driven so edits to resume.json flow straight through.
(function () {
  const root = document.getElementById("about-root");
  if (!root) return;

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Placeholder intro + photo while the JSON loads
  root.innerHTML =
    '<div class="about-intro" aria-hidden="true">' +
    '<div class="about-intro__text">' +
    '<div class="skel skel-title"></div>' +
    '<div class="skel skel-line"></div><div class="skel skel-line"></div>' +
    '<div class="skel skel-line"></div><div class="skel skel-line"></div>' +
    "</div>" +
    '<div class="about-intro__photo"><div class="skel skel-media"></div></div>' +
    "</div>";

  fetch("content/resume.json", { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(render)
    .catch((err) => {
      root.innerHTML =
        '<p class="fallback">Could not load about content (' +
        err.message +
        "). Serve the site over http (not a file:// path).</p>";
    });

  function render(data) {
    const parts = [];
    parts.push(intro(data.about));
    parts.push(timeline(data.timeline));
    parts.push(section("Resume", resume(data.resume)));
    root.innerHTML = parts.join("\n");
    initTimeline();
  }

  // Education + experience as one vertical timeline: a centre line with a logo
  // marker per entry, content cards alternating sides on desktop.
  function timeline(items) {
    if (!items || !items.length) return "";
    const rows = items
      .map(function (item, i) {
        const side = i % 2 === 0 ? "tl__item--left" : "tl__item--right";
        const bullets = (item.bullets || []).length
          ? '<ul class="tl__bullets">' +
            item.bullets.map((b) => "<li>" + esc(b) + "</li>").join("") +
            "</ul>"
          : "";
        return (
          '<li class="tl__item ' +
          side +
          '">' +
          '<div class="tl__marker' +
          (item.logoFill ? " tl__marker--fill" : "") +
          '">' +
          (item.logo
            ? '<img src="' +
              esc(item.logo) +
              '" alt="" loading="lazy" />'
            : "") +
          "</div>" +
          '<p class="tl__date">' +
          esc(item.date || "") +
          "</p>" +
          '<article class="tl__card">' +
          '<h3 class="tl__title">' +
          esc(item.title) +
          "</h3>" +
          (item.org ? '<p class="tl__org">' + esc(item.org) + "</p>" : "") +
          bullets +
          "</article></li>"
        );
      })
      .join("");
    return (
      '<section class="timeline" aria-label="Education and experience">' +
      '<ol class="tl"><span class="tl__line" aria-hidden="true">' +
      '<span class="tl__line-fill"></span></span>' +
      rows +
      "</ol></section>"
    );
  }

  // Reveal each entry as it scrolls into view, and fill the centre line to
  // match scroll progress. Honors prefers-reduced-motion by showing it all.
  function initTimeline() {
    const items = [].slice.call(document.querySelectorAll(".tl__item"));
    if (!items.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const list = document.querySelector(".tl");
    const fill = document.querySelector(".tl__line-fill");
    let ticking = false;

    // Driven off scroll position rather than IntersectionObserver so that a
    // fast scroll or a jump partway down the page still reveals everything
    // above the fold instead of leaving gaps.
    function update() {
      ticking = false;
      const trigger = window.innerHeight * 0.88;
      items.forEach(function (el) {
        if (
          !el.classList.contains("is-visible") &&
          el.getBoundingClientRect().top < trigger
        ) {
          el.classList.add("is-visible");
        }
      });
      if (!list || !fill) return;
      const r = list.getBoundingClientRect();
      // 0 when the list top reaches the viewport middle, 1 at its bottom
      const progress = (window.innerHeight * 0.5 - r.top) / r.height;
      fill.style.transform =
        "scaleY(" + Math.max(0, Math.min(1, progress)) + ")";
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  function intro(about) {
    if (!about) return "";
    const bio = (about.bio || []).map((p) => "<p>" + esc(p) + "</p>").join("");
    return (
      '<section class="about-intro">' +
      '<div class="about-intro__text">' +
      '<h1 class="about-intro__headline">' +
      esc(about.headline || "About") +
      "</h1>" +
      bio +
      "</div>" +
      (about.photo
        ? '<div class="about-intro__photo"><img src="' +
          esc(about.photo) +
          '" alt="Justin Peck" /></div>'
        : "") +
      "</section>"
    );
  }

  // Two-column labeled section: small label on the left, content on the right.
  function section(label, bodyHtml) {
    return (
      '<section class="about-section">' +
      '<h2 class="about-section__label">' +
      esc(label) +
      "</h2>" +
      '<div class="about-section__body">' +
      bodyHtml +
      "</div></section>"
    );
  }

  function resume(r) {
    if (!r || !r.pdf) return "";
    const button =
      '<a class="resume-download" href="' +
      esc(r.pdf) +
      '" download>Download PDF</a>';
    const preview = r.preview
      ? '<img class="resume-preview" src="' +
        esc(r.preview) +
        '" alt="Preview of Justin Peck’s resume" loading="lazy" />'
      : "";
    return button + preview;
  }
})();
