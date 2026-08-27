#!/usr/bin/env python3
"""Regenerate social-share assets. Run from the repo root after adding a
project or editing project.html:  python3 scripts/build-previews.py

It produces:
  * assets/og/og-<page>.jpg      1200x630 preview cards (cover-cropped)
  * <slug>.html                  one static page per project, carrying its own
                                  OpenGraph/Twitter meta + data-slug, cloned
                                  from project.html so scrapers (which don't run
                                  JS) get a per-project preview image.
"""
import json, re, html, os
from PIL import Image, ImageOps

BASE = "https://justinpeck.me"
TW, TH = 1200, 630
A = "assets/images"

def cover(src, dst, fx=0.5, fy=0.5, q=85):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    W, H = im.size
    s = max(TW / W, TH / H)
    im = im.resize((round(W * s), round(H * s)), Image.LANCZOS)
    nw, nh = im.size
    x0, y0 = round((nw - TW) * fx), round((nh - TH) * fy)
    im.crop((x0, y0, x0 + TW, y0 + TH)).save(dst, "JPEG", quality=q, optimize=True, progressive=True)

def esc(s): return html.escape(s, quote=True)

def main():
    os.makedirs("assets/og", exist_ok=True)
    d = json.load(open("content/engineering-projects.json"))

    # main pages (source image, horizontal focus, vertical focus)
    cover(f"{A}/about/portrait.jpg", "assets/og/og-home.jpg",  fy=0.30)
    cover(f"{A}/about/portrait.jpg", "assets/og/og-about.jpg", fy=0.30)
    cover(f"{A}/engineering/bike-builders-of-berkeley-lugged-carbon-fiber-downhill-bike/01.jpg",
          "assets/og/og-work.jpg")
    cover(f"{A}/cycling/photo-1.jpg", "assets/og/og-cycling.jpg", fy=0.42)

    tpl = open("project.html").read()
    for p in d["projects"]:
        slug, title, cat = p["slug"], p["title"], p["category"]
        cover(p["images"][0]["src"] if p.get("images") else p["thumbnail"],
              f"assets/og/og-{slug}.jpg")

        para = (p.get("paragraphs") or [""])[0].replace("\n", " ").strip()
        if len(para) > 185:
            para = para[:185].rsplit(" ", 1)[0].rstrip(",.;:") + "…"
        desc, ogtitle = esc(para), f"{esc(title)} — {esc(cat)}"
        img, url = f"{BASE}/assets/og/og-{slug}.jpg", f"{BASE}/{slug}.html"

        s = tpl
        s = re.sub(r"<title>.*?</title>", f"<title>{esc(title)} — Justin Peck</title>", s, 1, re.S)
        s = re.sub(r'<meta name="description" content="[^"]*" />',
                   f'<meta name="description" content="{desc}" />', s, 1)
        s = re.sub(r'<link rel="canonical" href="[^"]*" />', f'<link rel="canonical" href="{url}" />', s, 1)
        for prop, val in [("og:title", ogtitle), ("og:description", desc), ("og:url", url),
                          ("og:image", img), ("og:image:alt", esc(f"{cat} — {title}"))]:
            s = re.sub(rf'(<meta property="{prop}" content=")[^"]*(" />)', rf"\g<1>{val}\g<2>", s, 1)
        for name, val in [("twitter:title", ogtitle), ("twitter:description", desc), ("twitter:image", img)]:
            s = re.sub(rf'(<meta name="{name}" content=")[^"]*(" />)', rf"\g<1>{val}\g<2>", s, 1)
        s = s.replace('<article class="project" id="project-root">',
                      f'<article class="project" id="project-root" data-slug="{slug}">', 1)
        open(f"{slug}.html", "w").write(s)
    print(f"built {len(d['projects'])} project pages + {len(d['projects'])+4} OG images")

if __name__ == "__main__":
    main()
