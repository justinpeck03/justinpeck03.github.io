// Renders a single project page from the shared JSON, based on ?slug= in the
// URL, then lists every other project at the bottom as a "more work" library.
(function () {
  const root = document.getElementById("project-root");
  const moreGrid = document.getElementById("more-grid");
  if (!root) return;

  const slug = new URLSearchParams(location.search).get("slug");

  // Placeholder header + first image block while the JSON loads
  root.innerHTML =
    '<div class="project__header" aria-hidden="true">' +
    '<div class="skel skel-line"></div>' +
    '<div class="skel skel-title"></div>' +
    "</div>" +
    '<div class="proj-flow" aria-hidden="true">' +
    '<div class="proj-text">' +
    '<div class="skel skel-line"></div><div class="skel skel-line"></div>' +
    '<div class="skel skel-line"></div>' +
    "</div>" +
    '<div class="skel skel-media"></div>' +
    "</div>";

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
  function arOf(entry) {
    return entry && typeof entry === "object" && entry.ar ? entry.ar : 1;
  }

  function renderProject(p) {
    const esc = Portfolio.escapeHtml;

    root.innerHTML = ""; // clear the loading skeleton before appending content

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

    const flow = document.createElement("div");
    flow.className = "proj-flow";
    const layout = p.layout && p.layout.length ? p.layout : defaultLayout(p);
    layout.forEach((block) => flow.appendChild(renderBlock(block, p)));
    root.appendChild(flow);
  }

  // Default flow when a project has no explicit layout: text, image image,
  // text, image image … keeping each paragraph intact.
  function defaultLayout(p) {
    const nParas = (p.paragraphs || []).length;
    const nImgs = (p.images || []).length;
    const blocks = [];
    let pi = 0;
    let ii = 0;
    while (pi < nParas || ii < nImgs) {
      if (pi < nParas) {
        blocks.push({ t: "text", p: pi });
        pi += 1;
      }
      if (ii < nImgs) {
        const pair = [];
        for (let k = 0; k < 2 && ii < nImgs; k++) {
          pair.push(ii);
          ii += 1;
        }
        blocks.push(pair.length === 1 ? { t: "single", img: pair[0] } : { t: "row", img: pair });
      }
    }
    return blocks;
  }

  // Build a <figure> for image index `idx`, captioning it from highlights[idx].
  function figureFor(p, idx, className) {
    const images = p.images || [];
    const highlights = p.highlights || [];
    const fig = document.createElement("figure");
    if (className) fig.className = className;

    const img = document.createElement("img");
    img.src = srcOf(images[idx]);
    img.alt = p.title;
    img.loading = "lazy";
    fig.appendChild(img);

    const caption = highlights[idx];
    if (caption) {
      const cap = document.createElement("figcaption");
      cap.textContent = caption;
      fig.appendChild(cap);
    }
    return fig;
  }

  function renderBlock(block, p) {
    if (block.t === "text") {
      const d = document.createElement("div");
      d.className = "proj-text";
      const el = document.createElement("p");
      el.textContent = (p.paragraphs || [])[block.p] || "";
      d.appendChild(el);
      return d;
    }

    if (block.t === "aside") {
      const d = document.createElement("div");
      d.className = "proj-aside";
      const t = document.createElement("div");
      t.className = "proj-aside__text";
      const el = document.createElement("p");
      el.textContent = (p.paragraphs || [])[block.p] || "";
      t.appendChild(el);
      d.appendChild(t);
      d.appendChild(figureFor(p, block.img));
      return d;
    }

    if (block.t === "row") {
      const d = document.createElement("div");
      d.className = "proj-row";
      const images = p.images || [];
      block.img.forEach((idx) => {
        const cell = figureFor(p, idx, "proj-cell");
        // flex-grow proportional to aspect ratio -> equal heights across the
        // row. Seed with the stored ratio, then correct from the image's real
        // dimensions once it loads (authoritative, avoids bad metadata).
        cell.style.flexGrow = String(arOf(images[idx]));
        const img = cell.querySelector("img");
        const applyAR = () => {
          if (img.naturalWidth && img.naturalHeight) {
            cell.style.flexGrow = String(img.naturalWidth / img.naturalHeight);
          }
        };
        if (img.complete) applyAR();
        img.addEventListener("load", applyAR);
        d.appendChild(cell);
      });
      return d;
    }

    // full / large / single -> one image at varying widths
    const d = document.createElement("div");
    d.className = "proj-single proj-single--" + block.t;
    d.appendChild(figureFor(p, block.img));
    return d;
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
