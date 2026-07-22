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

    const caption = document.createElement("div");
    caption.className = "card__caption";
    caption.innerHTML =
      '<span class="card__category">' +
      escapeHtml(project.category) +
      '</span><span class="card__title">' +
      escapeHtml(project.title) +
      "</span>";
    media.appendChild(caption);

    a.appendChild(media);
    return a;
  }

  // Compact card for horizontal-scroll rails (e.g. "More projects"): image
  // on top, plain caption below instead of a hover overlay.
  function buildRailCard(project) {
    const a = document.createElement("a");
    a.className = "rail-card";
    a.href = "project.html?slug=" + encodeURIComponent(project.slug);

    const img = document.createElement("img");
    img.className = "rail-card__img";
    img.src = project.thumbnail;
    img.alt = project.category + " — " + project.title;
    img.loading = "lazy";
    a.appendChild(img);

    const caption = document.createElement("div");
    caption.className = "rail-card__caption";
    caption.innerHTML =
      '<span class="rail-card__title">' +
      escapeHtml(project.title) +
      '</span><span class="rail-card__category">' +
      escapeHtml(project.category) +
      "</span>";
    a.appendChild(caption);

    return a;
  }

  return { PROJECTS_URL, escapeHtml, loadProjects, buildCard, buildRailCard };
})();
