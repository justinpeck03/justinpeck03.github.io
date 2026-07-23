// Renders a single project page from the shared JSON, based on ?slug= in the
// URL, then lists every other project at the bottom as a "more work" library.
(function () {
  const root = document.getElementById("project-root");
  const moreGrid = document.getElementById("more-grid");
  if (!root) return;

  const slug = new URLSearchParams(location.search).get("slug");

  Portfolio.loadProjects()
    .then((data) => {
      const projects = data.projects || [];
      const project = projects.find((p) => p.slug === slug);
      if (!project) {
        root.innerHTML =
          '<p class="fallback">Project not found. <a href="work.html">Back to all work</a>.</p>';
        return;
      }
      document.title = "Justin Peck — " + project.title;
      renderProject(project);
      renderMore(projects, project);
    })
    .catch((err) => {
      root.innerHTML =
        '<p class="fallback">Could not load this project (' +
        err.message +
        "). Serve the site over http (not a file:// path).</p>";
    });

  function srcOf(entry) {
    return typeof entry === "string" ? entry : entry.src;
  }

  function renderProject(p) {
    const esc = Portfolio.escapeHtml;

    const header = document.createElement("header");
    header.className = "project__header";
    header.innerHTML =
      '<a class="project__back" href="work.html">&larr; All work</a>' +
      '<p class="project__eyebrow">' +
      esc(p.category) +
      '</p><h1 class="project__title">' +
      esc(p.title) +
      "</h1>";
    root.appendChild(header);

    const paras = p.paragraphs || [];
    const images = p.images || [];
    const highlights = p.highlights || []; // highlights[i] captions images[i]

    // Interleave: text, image image, text, image image … keeping each
    // paragraph intact. Leftover images continue as pairs; leftover
    // paragraphs continue as text.
    const flow = document.createElement("div");
    flow.className = "proj-flow";

    let pi = 0;
    let ii = 0;
    while (pi < paras.length || ii < images.length) {
      if (pi < paras.length) {
        const text = document.createElement("div");
        text.className = "proj-text";
        const el = document.createElement("p");
        el.textContent = paras[pi];
        text.appendChild(el);
        flow.appendChild(text);
        pi += 1;
      }
      if (ii < images.length) {
        const pair = images.slice(ii, ii + 2);
        const figs = document.createElement("div");
        figs.className =
          "proj-figs" + (pair.length === 1 ? " proj-figs--single" : "");
        pair.forEach((entry, j) => {
          const globalIndex = ii + j;
          const fig = document.createElement("figure");
          fig.className = "proj-fig";

          const img = document.createElement("img");
          img.src = srcOf(entry);
          img.alt = p.title;
          img.loading = "lazy";
          fig.appendChild(img);

          const caption = highlights[globalIndex];
          if (caption) {
            const cap = document.createElement("figcaption");
            cap.textContent = caption;
            fig.appendChild(cap);
          }
          figs.appendChild(fig);
        });
        flow.appendChild(figs);
        ii += pair.length;
      }
    }
    root.appendChild(flow);
  }

  function renderMore(projects, current) {
    if (!moreGrid) return;
    const frag = document.createDocumentFragment();
    projects
      .filter((p) => p.slug !== current.slug)
      .forEach((p) => frag.appendChild(Portfolio.buildRailCard(p)));
    moreGrid.appendChild(frag);
    setupRailArrows(moreGrid);
  }

  // Wire the prev/next buttons to page the rail by one viewport width, and
  // disable them at the start/end so it's clear when there's more to see.
  function setupRailArrows(rail) {
    const prev = document.querySelector(".more__arrow--prev");
    const next = document.querySelector(".more__arrow--next");
    if (!prev || !next) return;

    function update() {
      const max = rail.scrollWidth - rail.clientWidth;
      prev.disabled = rail.scrollLeft <= 4;
      next.disabled = rail.scrollLeft >= max - 4;
    }

    prev.addEventListener("click", () => {
      rail.scrollBy({ left: -rail.clientWidth * 0.9, behavior: "auto" });
      update();
    });
    next.addEventListener("click", () => {
      rail.scrollBy({ left: rail.clientWidth * 0.9, behavior: "auto" });
      update();
    });
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }
})();
