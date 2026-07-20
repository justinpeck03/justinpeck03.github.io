// Renders the engineering project grid on the home page from structured JSON.
// Kept data-driven so the same source feeds the individual project pages later.
(function () {
  const grid = document.getElementById("work-grid");
  if (!grid) return;

  // `no-cache` = always revalidate with the server (via ETag) before using a
  // cached copy, so edits to the JSON show up on the next load instead of
  // being masked by a stale browser/CDN cache.
  fetch("content/engineering-projects.json", { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then((data) => {
      const frag = document.createDocumentFragment();
      (data.projects || []).forEach((p) => {
        frag.appendChild(buildCard(p));
      });
      grid.appendChild(frag);
    })
    .catch((err) => {
      grid.innerHTML =
        '<p class="fallback">Could not load projects (' +
        err.message +
        "). Serve the site over http (not a file:// path).</p>";
    });

  function buildCard(project) {
    // Each project page will live at project.html?slug=<slug> (built next).
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
})();
