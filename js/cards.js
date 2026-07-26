// Shared helpers used by both the home grid and the project pages, so the
// project card looks identical everywhere and there is one place to change it.
window.Portfolio = (function () {
  const PROJECTS_URL = "content/engineering-projects.json";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // `no-cache` = always revalidate with the server (via ETag) before using a
  // cached copy, so edits to the JSON show up on the next load instead of
  // being masked by a stale browser/CDN cache.
  function loadProjects() {
    return fetch(PROJECTS_URL, { cache: "no-cache" }).then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
  }

  function buildCard(project) {
    const a = document.createElement("a");
    a.className = "card";
    a.href = "project.html?slug=" + encodeURIComponent(project.slug);

    const media = document.createElement("div");
    media.className = "card__media";

    const img = document.createElement("img");
    img.className = "card__img";
    img.src = project.thumbnail;
    img.alt = project.category + " — " + project.title;
    img.loading = "lazy";
    media.appendChild(img);

    // Title overlays the image and is revealed on hover; the organization
    // sits below the card so it is always readable.
    const caption = document.createElement("div");
    caption.className = "card__caption";
    caption.innerHTML =
      '<span class="card__title">' + escapeHtml(project.title) + "</span>";
    media.appendChild(caption);

    a.appendChild(media);

    const org = document.createElement("span");
    org.className = "card__org";
    org.textContent = project.category;
    a.appendChild(org);

    return a;
  }

  // Compact card for horizontal-scroll rails (e.g. "More projects"). Same
  // treatment as the grid card: hover-revealed title, organization below.
  function buildRailCard(project) {
    const a = document.createElement("a");
    a.className = "rail-card";
    a.href = "project.html?slug=" + encodeURIComponent(project.slug);

    const media = document.createElement("div");
    media.className = "rail-card__media";

    const img = document.createElement("img");
    img.className = "rail-card__img";
    img.src = project.thumbnail;
    img.alt = project.category + " — " + project.title;
    img.loading = "lazy";
    media.appendChild(img);

    const caption = document.createElement("div");
    caption.className = "rail-card__caption";
    caption.innerHTML =
      '<span class="rail-card__title">' + escapeHtml(project.title) + "</span>";
    media.appendChild(caption);

    a.appendChild(media);

    const org = document.createElement("span");
    org.className = "rail-card__org";
    org.textContent = project.category;
    a.appendChild(org);

    return a;
  }

  // Wire prev/next buttons to page a horizontal rail, disabling them at the
  // ends. Instant scroll (behavior "auto") for reliable, jump-free paging.
  function wireRailArrows(rail, prev, next) {
    if (!rail || !prev || !next) return;
    const nav = prev.parentElement;
    function update() {
      const max = rail.scrollWidth - rail.clientWidth;
      const scrollable = max > 4;
      if (nav) nav.style.display = scrollable ? "" : "none";
      prev.disabled = rail.scrollLeft <= 4;
      next.disabled = rail.scrollLeft >= max - 4;
    }
    prev.addEventListener("click", function () {
      rail.scrollBy({ left: -rail.clientWidth * 0.85, behavior: "auto" });
      update();
    });
    next.addEventListener("click", function () {
      rail.scrollBy({ left: rail.clientWidth * 0.85, behavior: "auto" });
      update();
    });
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    // Re-check once layout/fonts have settled (widths can shift after first paint)
    requestAnimationFrame(update);
    window.addEventListener("load", update);
  }

  return {
    PROJECTS_URL,
    escapeHtml,
    loadProjects,
    buildCard,
    buildRailCard,
    wireRailArrows,
  };
})();
