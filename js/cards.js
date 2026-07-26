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

  // Apple's product pages prefix names like " Watch" with their logo mark;
  // do the same for the Apple project so the title reads the same way.
  const APPLE_LOGO_SVG =
    '<svg class="title-logo" viewBox="0 0 384 512" aria-hidden="true">' +
    '<path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>' +
    "</svg>";

  function titleHtml(project) {
    const title = escapeHtml(project.title);
    return project.category === "Apple" ? APPLE_LOGO_SVG + title : title;
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
      '<span class="card__title">' + titleHtml(project) + "</span>";
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
      '<span class="rail-card__title">' + titleHtml(project) + "</span>";
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
    titleHtml,
    loadProjects,
    buildCard,
    buildRailCard,
    wireRailArrows,
  };
})();
