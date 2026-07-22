// Builds the single-page Cycling page from content/cycling-resume.json:
// bio + photos, career highlights next to an Instagram grid, 2026 schedule,
// results by season (collapsible) with result links, team, sponsors, connect.
(function () {
  const root = document.getElementById("cycling-root");
  if (!root) return;

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // 1 -> 1st, 2 -> 2nd, 3 -> 3rd, 11 -> 11th, 22 -> 22nd ...
  function ordinal(n) {
    const num = parseInt(n, 10);
    if (isNaN(num)) return String(n);
    const tens = num % 100;
    if (tens >= 11 && tens <= 13) return num + "th";
    switch (num % 10) {
      case 1: return num + "st";
      case 2: return num + "nd";
      case 3: return num + "rd";
      default: return num + "th";
    }
  }

  // Add ordinal suffixes to each day number in a date string, e.g.
  // "May 2-4" -> "May 2nd-4th", "February 1" -> "February 1st".
  function ordinalizeDate(date) {
    return String(date).replace(/\d+/g, (m) => ordinal(m));
  }

  fetch("content/cycling-resume.json", { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(render)
    .catch((err) => {
      root.innerHTML =
        '<p class="fallback">Could not load cycling content (' +
        err.message +
        "). Serve the site over http (not a file:// path).</p>";
    });

  function render(d) {
    root.innerHTML = [
      bio(d),
      highlights(d.top_results, d.instagram_grid, d.instagram),
      schedule(d.schedule),
      seasons(d.results_by_season),
      externalLinks(d.external_links),
      team(d.team),
      sponsors(d.sponsors),
    ].join("\n");
  }

  // 1. Bio with two photos on the side; DOB / hometown / based-in at the bottom
  function bio(d) {
    const paras = (d.background || []).map((p) => "<p>" + esc(p) + "</p>").join("");
    const details = (d.bio_details || []).length
      ? '<ul class="cy-bio__details">' +
        d.bio_details.map((x) => "<li>" + esc(x) + "</li>").join("") +
        "</ul>"
      : "";
    const photos = (d.bio_photos || [])
      .map((src) => '<img src="' + esc(src) + '" alt="Justin Peck racing" loading="lazy" />')
      .join("");
    return (
      '<section class="cy-bio">' +
      '<div class="cy-bio__text">' +
      '<h1 class="cy-bio__headline">About Justin Peck</h1>' +
      paras +
      details +
      "</div>" +
      '<div class="cy-bio__photos">' +
      photos +
      "</div>" +
      "</section>"
    );
  }

  // 2. Career highlights next to the Instagram grid
  function highlights(top, grid, ig) {
    const rows = (top || [])
      .map(
        (r) =>
          '<li class="hl"><span class="hl__place">' +
          esc(r.placing) +
          '</span><span class="hl__race">' +
          esc(r.race) +
          "</span></li>"
      )
      .join("");

    const tiles = (grid || [])
      .map(
        (item) =>
          '<a class="ig-grid__item" href="' +
          esc(item.link) +
          '" target="_blank" rel="noopener">' +
          '<img src="' +
          esc(item.img) +
          '" alt="Instagram post" loading="lazy" />' +
          "</a>"
      )
      .join("");

    return (
      '<section class="cy-section">' +
      '<h2 class="cy-section__label">Career highlights</h2>' +
      '<div class="cy-highlights">' +
      '<ul class="hl-list">' +
      rows +
      "</ul>" +
      '<div class="ig-block">' +
      '<div class="ig-grid">' +
      tiles +
      "</div>" +
      '<a class="ig-follow" href="' +
      esc(ig) +
      '" target="_blank" rel="noopener">@justin__peck on Instagram &rarr;</a>' +
      "</div>" +
      "</div>" +
      "</section>"
    );
  }

  // 3. 2026 schedule
  function schedule(sched) {
    if (!sched) return "";
    const rows = (sched.events || [])
      .map(function (e) {
        if (e.note) {
          return (
            '<li class="sch"><span class="sch__date">' +
            esc(e.month || "") +
            '</span><span class="sch__event">' +
            esc(e.note) +
            '</span><span class="sch__loc"></span></li>'
          );
        }
        const date = [e.month, e.dates].filter(Boolean).join(" ");
        return (
          '<li class="sch"><span class="sch__date">' +
          esc(date) +
          '</span><span class="sch__event">' +
          esc(e.event || "") +
          '</span><span class="sch__loc">' +
          esc(e.location || "") +
          "</span></li>"
        );
      })
      .join("");
    return (
      '<section class="cy-section">' +
      '<h2 class="cy-section__label">' +
      esc(sched.heading || "2026 Schedule") +
      "</h2>" +
      '<ul class="sch-list">' +
      rows +
      "</ul>" +
      "</section>"
    );
  }

  // 4. Results by season (collapsible): placing / race / date, with ordinals
  function seasons(bySeason) {
    if (!bySeason) return "";
    const years = Object.keys(bySeason).sort((a, b) => b.localeCompare(a));
    const blocks = years
      .map(function (year, i) {
        const rows = (bySeason[year] || [])
          .map(
            (r) =>
              '<li class="res"><span class="res__place">' +
              esc(ordinal(r.placing)) +
              '</span><span class="res__race">' +
              esc(r.race) +
              '</span><span class="res__date">' +
              esc(ordinalizeDate(r.date || "")) +
              "</span></li>"
          )
          .join("");
        return (
          '<details class="season"' +
          (i === 0 ? " open" : "") +
          ">" +
          '<summary class="season__summary"><span>' +
          esc(year) +
          ' Season</span><span class="season__count">' +
          (bySeason[year] || []).length +
          " races</span></summary>" +
          '<ul class="res-list">' +
          rows +
          "</ul>" +
          "</details>"
        );
      })
      .join("");
    return (
      '<section class="cy-section">' +
      '<h2 class="cy-section__label">Results by season</h2>' +
      '<div class="seasons">' +
      blocks +
      "</div>" +
      "</section>"
    );
  }

  // External ranking / results links
  function externalLinks(links) {
    if (!links || !links.length) return "";
    const buttons = links
      .map(
        (l) =>
          '<a class="pill-link" href="' +
          esc(l.url) +
          '" target="_blank" rel="noopener">' +
          esc(l.label) +
          " &rarr;</a>"
      )
      .join("");
    return '<div class="cy-links">' + buttons + "</div>";
  }

  // 5. Team
  function team(t) {
    if (!t) return "";
    return (
      '<section class="cy-section">' +
      '<h2 class="cy-section__label">Team</h2>' +
      '<a class="team-card" href="' +
      esc(t.url) +
      '" target="_blank" rel="noopener">' +
      (t.logo
        ? '<img class="team-card__logo" src="' +
          esc(t.logo) +
          '" alt="' +
          esc(t.name) +
          ' logo" loading="lazy" />'
        : "") +
      '<span class="team-card__name">' +
      esc(t.name) +
      "</span>" +
      "</a>" +
      "</section>"
    );
  }

  // 6. Sponsors
  function sponsors(list) {
    if (!list || !list.length) return "";
    const items = list
      .map(
        (s) =>
          '<a class="sponsor" href="' +
          esc(s.url) +
          '" target="_blank" rel="noopener" aria-label="' +
          esc(s.name) +
          '">' +
          '<img src="' +
          esc(s.logo) +
          '" alt="' +
          esc(s.name) +
          ' logo" loading="lazy" />' +
          "</a>"
      )
      .join("");
    return (
      '<section class="cy-section">' +
      '<h2 class="cy-section__label">Sponsors</h2>' +
      '<div class="sponsors">' +
      items +
      "</div>" +
      "</section>"
    );
  }
})();
