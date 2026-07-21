// Renders the engineering project grid on the home page from structured JSON.
// Card markup + data loading live in cards.js so the project pages reuse them.
(function () {
  const grid = document.getElementById("work-grid");
  if (!grid) return;

  Portfolio.loadProjects()
    .then((data) => {
      const frag = document.createDocumentFragment();
      (data.projects || []).forEach((p) => frag.appendChild(Portfolio.buildCard(p)));
      grid.appendChild(frag);
    })
    .catch((err) => {
      grid.innerHTML =
        '<p class="fallback">Could not load projects (' +
        err.message +
        "). Serve the site over http (not a file:// path).</p>";
    });
})();
