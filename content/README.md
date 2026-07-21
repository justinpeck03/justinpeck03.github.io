# Editing site content

All engineering content lives in **`engineering-projects.json`**. The home
page grid and every project page are generated from this one file, so you only
edit here — no HTML needed.

## Structure

```jsonc
{
  "cover": { ... },          // name / contact used on the home hero (optional)
  "projects": [
    {
      "slug": "sram-rockshox-rear-shock",   // URL id — don't change once shared
      "category": "SRAM / RockShox",         // small label above the title
      "title": "Rear Shock",                 // project title (card + page heading)
      "thumbnail": "assets/images/engineering/sram-rockshox-rear-shock/02.png",
      "paragraphs": [                         // body text — one string per paragraph
        "First paragraph...",
        "Second paragraph..."
      ],
      "highlights": [                         // short tags shown as pills
        "Air Volume CAD",
        "Damper Simulation (MATLAB)"
      ],
      "images": [                             // gallery, shown in this order
        { "src": "assets/images/engineering/sram-rockshox-rear-shock/02.png", "caption": "" },
        { "src": "assets/images/engineering/sram-rockshox-rear-shock/03.png", "caption": "Positive volume token" }
      ]
    }
  ]
}
```

## Common edits

- **Add / change text:** edit the `paragraphs` array. Each string is its own
  paragraph. Add a paragraph by adding another `"..."` (comma-separated).
- **Caption an image:** fill in its `"caption"`. Leave `""` for no caption.
- **Reorder images:** reorder the objects in `images`. The `thumbnail` image is
  automatically shown first on the project page regardless of its position.
- **Change the card image:** point `thumbnail` at any path in that project's
  `images`.
- **Add a new image:** drop the file in the project's folder under
  `assets/images/engineering/<slug>/`, then add an entry to `images`.

## Tips

- It's JSON, so keep the commas and quotes valid. A missing comma will stop the
  page from loading. If a page goes blank, that's the first thing to check.
- After saving, commit and push; the live site updates on the next load.
