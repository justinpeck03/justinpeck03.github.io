// Standard contact section, injected at the bottom of every page so it stays
// identical site-wide. Edit the details here in one place.
(function () {
  const mount = document.getElementById("site-footer");
  if (!mount) return;

  const email = "justinpeck03@gmail.com";
  const linkedin = "https://www.linkedin.com/in/peck-justin/";
  const instagram = "https://www.instagram.com/justin__peck/";

  const linkedinIcon =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>';

  const instagramIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="2" y="2" width="20" height="20" rx="5.5"/>' +
    '<circle cx="12" cy="12" r="4.2"/>' +
    '<circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/></svg>';

  mount.className = "contact";
  mount.innerHTML =
    '<h2 class="contact__title">Contact</h2>' +
    '<a class="contact__email" href="mailto:' + email + '">' + email + "</a>" +
    '<div class="contact__socials">' +
    '<a class="contact__icon" href="' + linkedin + '" target="_blank" rel="noopener" aria-label="LinkedIn">' +
    linkedinIcon + "</a>" +
    '<a class="contact__icon" href="' + instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' +
    instagramIcon + "</a>" +
    "</div>" +
    '<p class="contact__copyright">&copy; 2026 Justin Peck</p>';
})();
