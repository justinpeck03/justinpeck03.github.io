# Portfolio site — design brief

## Purpose
Personal site combining a mechanical engineering product design portfolio,
resume, and mountain bike racing resume + race reports. Single coherent site,
two content "sides" (engineering / racing) sharing one design system.

## Site structure
- **Home** — hero intro, horizontal-scroll preview of engineering projects,
  teaser link into racing section
- **Engineering**
  - Project gallery (12 projects, horizontal scroll on the overview)
  - Individual project detail pages (full writeup, images, specs)
  - Resume (downloadable PDF + on-page version)
- **Mountain biking**
  - Racing resume / bio
  - Race reports (by season, results + writeups)

## Visual direction
- **Palette:** charcoal / near-black, Apple-inspired
  - Background: `#161617` (page), `#1d1d1f` (cards/nav)
  - Text: `#f5f5f7` (primary), `#a1a1a6` (secondary), `#6e6e73` (muted)
  - Borders: `#2c2c2e`, hairline (0.5px), no drop shadows
- **Typography:** system sans (-apple-system / SF Pro stack), tight
  letter-spacing on headlines, sentence case throughout
- **Layout:**
  - Flat surfaces, no gradients, rounded-corner cards (12px)
  - Horizontal scroll-snap rail for the 12 project cards on the overview
  - Same card component (image + title + tag) reused for race reports —
    this is what keeps the engineering and racing sides feeling like one site
- **Nav:** simple top bar, name/logo left, section links right

## Content pipeline
- Resume + portfolio source: PDF / Keynote exports
- Extract via code (not vision) into structured data:
  - `python-pptx` (or equivalent) to pull text + images from the Keynote
    export (`.pptx`), not from flattened slide images
  - One JSON entry per project: `title`, `category`, `description`, `images`
  - Resume body content as markdown
- Only use Claude's vision to spot-check extraction quality, not for the
  full pass

## Build notes
- Static site — no backend/database needed
- Claude Code should read this file first before generating any pages
- Plan with `opusplan` (Opus for structure/architecture decisions), then
  implement with Sonnet
- Batch similar work (e.g. generate all 12 project pages from the JSON
  data in one pass) rather than one-by-one prompts

## Deployment
- Host: GitHub Pages or Netlify (free tier, static site)
- Domain: cheap registrar (Cloudflare Registrar or Namecheap), custom
  domain pointed at host via DNS
- Repo: work locally, push to GitHub when ready to deploy (see workflow
  notes in chat)
