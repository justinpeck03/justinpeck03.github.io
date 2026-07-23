// Builds the About page from content/resume.json: an intro (bio + photo),
// spaced resume sections (education, experience, skills, interests), and a
// connect block. Data-driven so edits to resume.json flow straight through.
(function () {
  const root = document.getElementById("about-root");
  if (!root) return;

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  fetch("content/resume.json", { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(render)
    .catch((err) => {
      root.innerHTML =
        '<p class="fallback">Could not load about content (' +
        err.message +
        "). Serve the site over http (not a file:// path).</p>";
    });

  function render(data) {
    const parts = [];
    parts.push(intro(data.about));
    parts.push(section("Education", education(data.education)));
    parts.push(section("Experience", experience(data.experience)));
    parts.push(section("Skills", skills(data.skills)));
    parts.push(section("Interests", interests(data.background_and_interests)));
    parts.push(section("Resume", resume(data.resume)));
    root.innerHTML = parts.join("\n");
  }

  function intro(about) {
    if (!about) return "";
    const bio = (about.bio || []).map((p) => "<p>" + esc(p) + "</p>").join("");
    return (
      '<section class="about-intro">' +
      '<div class="about-intro__text">' +
      '<h1 class="about-intro__headline">' +
      esc(about.headline || "About") +
      "</h1>" +
      bio +
      "</div>" +
      (about.photo
        ? '<div class="about-intro__photo"><img src="' +
          esc(about.photo) +
          '" alt="Justin Peck" /></div>'
        : "") +
      "</section>"
    );
  }

  // Two-column labeled section: small label on the left, content on the right.
  function section(label, bodyHtml) {
    return (
      '<section class="about-section">' +
      '<h2 class="about-section__label">' +
      esc(label) +
      "</h2>" +
      '<div class="about-section__body">' +
      bodyHtml +
      "</div></section>"
    );
  }

  function education(list) {
    return (list || [])
      .map(
        (e) =>
          '<div class="entry">' +
          '<div class="entry__head">' +
          "<h3>" +
          esc(e.school) +
          "</h3>" +
          (e.dates ? '<span class="entry__dates">' + esc(e.dates) + "</span>" : "") +
          "</div>" +
          (e.details || [])
            .map((d) => '<p class="entry__detail">' + esc(d) + "</p>")
            .join("") +
          "</div>"
      )
      .join("");
  }

  function experience(list) {
    return (list || [])
      .map(function (job) {
        const roles = (job.roles || [])
          .map(
            (r) =>
              '<div class="role">' +
              '<div class="entry__head">' +
              "<h4>" +
              esc(r.title) +
              "</h4>" +
              (r.dates
                ? '<span class="entry__dates">' + esc(r.dates) + "</span>"
                : "") +
              "</div>" +
              (r.bullets && r.bullets.length
                ? "<ul>" +
                  r.bullets.map((b) => "<li>" + esc(b) + "</li>").join("") +
                  "</ul>"
                : "") +
              "</div>"
          )
          .join("");
        return (
          '<div class="entry">' +
          '<div class="entry__head">' +
          "<h3>" +
          esc(job.company) +
          "</h3>" +
          (job.location
            ? '<span class="entry__dates">' + esc(job.location) + "</span>"
            : "") +
          "</div>" +
          roles +
          "</div>"
        );
      })
      .join("");
  }

  function skills(groups) {
    if (!groups) return "";
    return Object.keys(groups)
      .map(
        (cat) =>
          '<div class="skills-group">' +
          "<h4>" +
          esc(cat) +
          "</h4>" +
          '<ul class="pills">' +
          groups[cat].map((s) => "<li>" + esc(s) + "</li>").join("") +
          "</ul>" +
          "</div>"
      )
      .join("");
  }

  function interests(map) {
    if (!map) return "";
    return Object.keys(map)
      .map(
        (k) =>
          '<div class="entry">' +
          "<h3>" +
          esc(k) +
          "</h3>" +
          '<p class="entry__detail">' +
          esc(map[k]) +
          "</p>" +
          "</div>"
      )
      .join("");
  }

  function resume(r) {
    if (!r || !r.pdf) return "";
    const button =
      '<a class="resume-download" href="' +
      esc(r.pdf) +
      '" download>Download PDF</a>';
    const preview = r.preview
      ? '<img class="resume-preview" src="' +
        esc(r.preview) +
        '" alt="Preview of Justin Peck’s resume" loading="lazy" />'
      : "";
    return button + preview;
  }
})();
