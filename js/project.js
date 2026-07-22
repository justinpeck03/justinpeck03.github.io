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
          '<p class="fallback">Project not found. <a href="index.html">Back to all work</a>.</p>';
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

  function imgSrc(entry) {
    return typeof entry === "string" ? entry : entry.src;
  }
  function imgCaption(entry) {
    return typeof entry === "string" ? "" : entry.caption || "";
  }

  // Lead with the chosen thumbnail, then the remaining images in order.
  function orderedImages(project) {
    const imgs = (project.images || []).slice();
    const i = imgs.findIndex((e) => imgSrc(e) === project.thumbnail);
    if (i > 0) imgs.unshift(imgs.splice(i, 1)[0]);
    return imgs;
  }

  function renderProject(p) {
    const esc = Portfolio.escapeHtml;

    const header = document.createElement("header");
    header.className = "project__header";
    header.innerHTML =
      '<a class="project__back" href="index.html">&larr; All work</a>' +
      '<p class="project__eyebrow">' +
      esc(p.category) +
      '</p><h1 class="project__title">' +
      esc(p.title) +
      "</h1>";
    root.appendChild(header);

    if (p.paragraphs && p.paragraphs.length) {
      const body = document.createElement("div");
      body.className = "project__body";
      p.paragraphs.forEach((para) => {
        const el = document.createElement("p");
        el.textContent = para;
        body.appendChild(el);
      });
      root.appendChild(body);
    }

    if (p.highlights && p.highlights.length) {
      const tags = document.createElement("ul");
      tags.className = "project__tags";
      p.highlights.forEach((h) => {
        const li = document.createElement("li");
        li.textContent = h;
        tags.appendChild(li);
      });
      root.appendChild(tags);
    }

    const images = orderedImages(p);
    if (images.length) {
      const gallery = document.createElement("div");
      gallery.className = "gallery";
      images.forEach((entry) => {
        const fig = document.createElement("figure");
        fig.className = "gallery__item";

        const img = document.createElement("img");
        img.src = imgSrc(entry);
        img.alt = p.title;
        img.loading = "lazy";
        fig.appendChild(img);

        const caption = imgCaption(entry);
        if (caption) {
          const cap = document.createElement("figcaption");
          cap.textContent = caption;
          fig.appendChild(cap);
        }
        gallery.appendChild(fig);
      });
      root.appendChild(gallery);
    }
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
