// Renders the engineering projects on the home / work pages, grouped into
// categories (Internships, Personal Projects, Class Projects). Each category
// is a horizontal-scroll rail of cards. Card markup + data loading live in
// cards.js so the project pages reuse them.
(function () {
  const mount = document.getElementById("work-grid");
  if (!mount) return;

  Portfolio.loadProjects()
    .then((data) => {
      const projects = data.projects || [];
      const bySlug = {};
      projects.forEach((p) => (bySlug[p.slug] = p));

      const groups =
        data.groups && data.groups.length
          ? data.groups
          : [{ name: "", slugs: projects.map((p) => p.slug) }];

      mount.innerHTML = "";
      groups.forEach((group) => buildCategory(group, bySlug));
    })
    .catch((err) => {
      mount.innerHTML =
        '<p class="fallback">Could not load projects (' +
        err.message +
        "). Serve the site over http (not a file:// path).</p>";
    });

  function buildCategory(group, bySlug) {
    const section = document.createElement("section");
    section.className = "cat";

    const head = document.createElement("div");
    head.className = "cat__head";
    const title = document.createElement("h2");
    title.className = "cat__title";
    title.textContent = group.name || "";
    head.appendChild(title);

    const nav = document.createElement("div");
    nav.className = "cat__nav";
    nav.innerHTML =
      '<button class="more__arrow more__arrow--prev" type="button" aria-label="Scroll left">&larr;</button>' +
      '<button class="more__arrow more__arrow--next" type="button" aria-label="Scroll right">&rarr;</button>';
    head.appendChild(nav);
    section.appendChild(head);

    const rail = document.createElement("div");
    rail.className = "cat__rail";
    (group.slugs || []).forEach((slug) => {
      const p = bySlug[slug];
      if (p) rail.appendChild(Portfolio.buildCard(p));
    });
    section.appendChild(rail);

    // wireRailArrows shows the nav only when the rail overflows (and keeps it
    // in sync on scroll / resize), so categories that fit hide their arrows.
    mount.appendChild(section);
    Portfolio.wireRailArrows(
      rail,
      nav.querySelector(".more__arrow--prev"),
      nav.querySelector(".more__arrow--next")
    );
  }
})();
