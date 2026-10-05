# Sanpoom Punapanont — Academic Portfolio

A single-page academic portfolio in plain HTML, CSS and vanilla JavaScript. There is no build step, no npm and no framework. It runs on GitHub Pages as-is, and also works when you open `index.html` directly from disk.

```
index.html           home page skeleton, meta tags
project.html         project detail page (project.html?id=<project id>)
data.js              ALL content (edit this)
script.js            renders both pages from data.js
js/viewer3d.js       interactive 3D model viewer (three.js)
css/theme.css        colors, fonts, spacing, radius (CSS variables)
css/layout.css       structure and responsive layout
assets/img/          profile photo, favicon, project images
assets/models/       3D models (.glb) for the projects
assets/cv/CV.pdf     the downloadable CV
vendor/three/        local copy of three.js (MIT), so no CDN is needed
tools/3mf_to_glb.py  converts CAD .3MF exports into .glb models
.nojekyll            tells GitHub Pages to serve files as-is
```

## Editing content (`data.js`)

All content lives in one global object, `const SITE = { ... }`, in `data.js`. You only need to edit this file to update the site.

- **Hide a section:** set its list to an empty array (for example `highlights: []`). The section and its nav link both disappear.
- **Hide a contact icon or link button:** set its value to `""`.
- **Publications:** entries are grouped by `year`, newest first. Each one has a `venue` tag (shown as `[IROS-2025]`), an optional `status` label (for example `"Under review"`), `authors`, `details`, an `abstract` (shown inside a collapsible block) and `links` (`paper`, `video`, `code`). Set `embedVideo: true` to embed a YouTube `video` link inside the abstract block. The iframe only loads when a visitor opens that block.
- **Your name in author lists** is bolded automatically when it matches `authorName`. Markers such as `†` are ignored when matching.
- **Projects:** each project gets its own detail page at `project.html?id=<id>`, and the home-page card links to it. The detail page shows the 3D model (or the image), `overview`, `highlights` (key results), every entry in `videos` as an embedded YouTube player, the `links` buttons, and the publications listed in `publicationIds`. A new project needs a unique `id`.
- Items still marked `TODO` in `data.js` need your input.

Use `data.js` rather than a JSON file: browsers block `fetch()` for local files, so a JSON file would break the site when it is opened from disk.

## Images and the CV

| What | Where | Then |
| --- | --- | --- |
| Profile photo | `assets/img/profile.jpg` (square, at least 400×400) | Set `photo: "assets/img/profile.jpg"` in `data.js` |
| Project images | `assets/img/projects/` | Set each project's `image` and `imageAlt` |
| Education logos (optional) | `assets/img/logos/` | Set `logo` on an education entry |
| Highlights gallery | `assets/img/highlights/` | Add `{ src, alt, caption }` items to `highlights` |
| CV | `assets/cv/CV.pdf` | Replace the file. The path is set by `cv` |
| Favicon | `assets/img/favicon.svg` | Replace the file (keep the name or update `index.html`) |

| 3D model | `assets/models/` (`.glb`) | Set the project's `model` and `modelAlt` |

Always write meaningful `alt` text that describes what the image shows.

## 3D models

The home page shows one project at a time in a large showcase. Use the ‹ › arrows, the dots, or the keyboard's left and right keys to switch project. Its 3D model turns slowly on its own and can be dragged to rotate (zoom is off there so page scrolling isn't captured). After you let go, it waits about 1.5 s, glides back to its starting view, and starts turning again. The timings are `RETURN_DELAY` and `RETURN_TIME` at the top of the viewer code in `js/viewer3d.js`. The detail page has a full viewer you can drag, zoom and pan. Models load only when they scroll into view. If WebGL or the model is unavailable, the project `image` is shown instead.

**Adding a model:**

1. Export the CAD assembly as `.3MF` (SolidWorks: *Save As → 3MF*), or export `.glb` directly if your tool supports it.
2. Convert it:
   ```sh
   python3 tools/3mf_to_glb.py "path/to/Model.3MF" assets/models/my-project.glb
   ```
   The script needs only the standard library. It keeps the part colors and prints the triangle count and file size. If the model appears standing on end or lying on its side, run it again with `--z-up`.
3. In `data.js`, set `model: "assets/models/my-project.glb"` and a `modelAlt` description on the project.

Keep models under about 3 MB. If an export is too heavy, simplify it in your CAD tool first, for example by hiding fasteners or internal parts. Anyone can download a model shown on the site, so publish only CAD you're allowed to share.

**When 3D works:** browsers block 3D models on pages opened straight from disk (`file://`). On disk the site shows the project image and a short note instead. Use GitHub Pages or `python3 -m http.server` to see the models.

## Changing the theme

Every color, font, spacing value, radius and shadow is a CSS variable in `:root` at the top of `css/theme.css`. There is a light/dark switch (sun/moon button) in the header. Dark is the default, and each visitor's choice is remembered in their browser. Dark colours are set in the first `:root` block of `css/theme.css` and light colours in `:root[data-theme="light"]`; change both when restyling. In the dark theme, `--gradient-page` sets the background glows, and `--color-accent`/`--color-accent-2` set the coral-to-lilac gradient used on buttons, headings and highlights (`--gradient-accent`). To use a Google Font, add its `<link>` tag to the `<head>` of `index.html` and put the font family first in `--font-sans`. You should not need to touch `css/layout.css` to restyle the site.

## Link previews (meta / Open Graph)

`script.js` fills the description and Open Graph tags from `SITE.seo` when the page loads. Social-media crawlers don't run JavaScript, though, so the same values are also hard-coded in the `<head>` of `index.html`. If you change `seo` in `data.js`, update those tags too. Once the site is live, set `seo.url` and make `og:image` an absolute URL (for example `https://<username>.github.io/<repo>/assets/img/projects/lithe-joint.jpg`) so link previews show the image.

## Previewing locally

Double-click `index.html` to check content and layout (3D models show as images), or run a local server to get everything:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Embedded YouTube players may refuse to play when the page is opened from `file://`. They work through the local server and on GitHub Pages.

## Publishing on GitHub Pages

1. Push this repository to GitHub.
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Source: Deploy from a branch**.
4. Choose branch **main** and folder **/ (root)**, then click **Save**.
5. After a minute or so, the site is live at `https://<username>.github.io/<repo>/`.

## Private source material

`Sanpoom_CV/` holds the original source files, including transcripts, ID documents and large videos. It is listed in `.gitignore` and must never be committed. Copy only the files you want public into `assets/`.
