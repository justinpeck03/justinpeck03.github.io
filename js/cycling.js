// Builds the single-page Cycling page from content/cycling-resume.json:
// bio + photos, highlight results, "follow along" Instagram grid, 2026
// schedule, results by season (collapsible), team, sponsors, and connect.
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
    const html = [
      bio(d),
      highlights(d.top_results, d.follow_grid, d.instagram),
      schedule(d.schedule),
      seasons(d.results_by_season),
      team(d.team),
      sponsors(d.sponsors),
      connect(d.connect),
    ].join("\n");
    root.innerHTML = html;
  }

  // 1. Bio with two photos on the side
  function bio(d) {
    const paras = (d.background || []).map((p) => "<p>" + esc(p) + "</p>").join("");
    const photos = (d.bio_photos || [])
      .map((src) => '<img src="' + esc(src) + '" alt="Justin Peck racing" loading="lazy" />')
      .join("");
    return (
      '<section class="cy-bio">' +
      '<div class="cy-bio__text">' +
      '<h1 class="cy-bio__headline">Racing</h1>' +
      (d.license ? '<p class="cy-bio__license">' + esc(d.license) + "</p>" : "") +
      paras +
      "</div>" +
      '<div class="cy-bio__photos">' +
      photos +
      "</div>" +
      "</section>"
    );
  }

  // 2. Highlight results + "Follow along!" Instagram grid
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
        (src) =>
          '<a class="ig-grid__item" href="' +
          esc(ig) +
          '" target="_blank" rel="noopener">' +
          '<img src="' +
          esc(src) +
          '" alt="Justin Peck on Instagram" loading="lazy" />' +
          "</a>"
      )
      .join("");

    const handle = "@justin__peck";
    return (
      '<section class="cy-section">' +
      '<h2 class="cy-section__label">Highlight results</h2>' +
      '<ul class="hl-list">' +
      rows +
      "</ul>" +
      "</section>" +
      '<section class="cy-follow">' +
      '<h2 class="cy-follow__title">Follow along!</h2>' +
      '<div class="ig-grid">' +
      tiles +
      "</div>" +
      '<a class="cy-follow__cta" href="' +
      esc(ig) +
      '" target="_blank" rel="noopener">' +
      esc(handle) +
      " on Instagram &rarr;</a>" +
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
            "</span><span class=\"sch__loc\"></span></li>"
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

  // 4. Results by season (collapsible), date / race / placing — no category
  function seasons(bySeason) {
    if (!bySeason) return "";
    // newest season first, open the first one by default
    const years = Object.keys(bySeason).sort((a, b) => b.localeCompare(a));
    const blocks = years
      .map(function (year, i) {
        const rows = (bySeason[year] || [])
          .map(function (r) {
            const podium = ["1", "2", "3"].indexOf(String(r.placing).trim()) !== -1;
            return (
              '<li class="res' +
              (podium ? " res--podium" : "") +
              '"><span class="res__place">' +
              esc(r.placing) +
              '</span><span class="res__race">' +
              esc(r.race) +
              '</span><span class="res__date">' +
              esc(r.date || "") +
              "</span></li>"
            );
          })
          .join("");
        return (
          '<details class="season"' +
          (i === 0 ? " open" : "") +
          ">" +
          '<summary class="season__summary"><span>' +
          esc(year) +
          " Season</span><span class=\"season__count\">" +
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

  // 6. Sponsors — logos linked out
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

  // 7. Connect
  function connect(c) {
    if (!c) return "";
    const links = [];
    if (c.email) {
      links.push(
        '<a class="connect__link" href="mailto:' +
          esc(c.email) +
          '">' +
          esc(c.email) +
          "</a>"
      );
    }
    if (c.instagram) {
      links.push(
        '<a class="connect__link" href="' +
          esc(c.instagram) +
          '" target="_blank" rel="noopener">Instagram</a>'
      );
    }
    return (
      '<section class="connect">' +
      '<h2 class="connect__title">Let’s connect</h2>' +
      '<p class="connect__lead">Reach out about racing, results, or sponsorship.</p>' +
      '<div class="connect__links">' +
      links.join("") +
      "</div></section>"
    );
  }
})();
