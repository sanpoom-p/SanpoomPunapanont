# Sanpoom Punapanont — Academic Portfolio

A single-page academic portfolio in plain HTML, CSS and vanilla JavaScript. There is no build step, no npm and no framework. It runs on GitHub Pages as-is, and also works when you open `index.html` directly from disk.

```
index.html         page skeleton, meta tags
data.js            ALL content (edit this)
script.js          renders every section from data.js
css/theme.css      colors, fonts, spacing, radius (CSS variables)
css/layout.css     structure and responsive layout
assets/img/        profile photo, favicon, project images
assets/cv/CV.pdf   the downloadable CV
.nojekyll          tells GitHub Pages to serve files as-is
```

## Editing content (`data.js`)

All content lives in one global object, `const SITE = { ... }`, in `data.js`. You only need to edit this file to update the site.

- **Hide a section:** set its list to an empty array (for example `highlights: []`). The section and its nav link both disappear.
- **Hide a contact icon or link button:** set its value to `""`.
- **Publications:** entries are grouped by `year`, newest first. Each one has a `venue` tag (shown as `[IROS-2025]`), an optional `status` label (for example `"Under review"`), `authors`, `details`, an `abstract` (shown inside a collapsible block) and `links` (`paper`, `video`, `code`). Set `embedVideo: true` to embed a YouTube `video` link inside the abstract block. The iframe only loads when a visitor opens that block.
- **Your name in author lists** is bolded automatically when it matches `authorName`. Markers such as `†` are ignored when matching.
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

Always write meaningful `alt` text that describes what the image shows.

## Changing the theme

Every color, font, spacing value, radius and shadow is a CSS variable in `:root` at the top of `css/theme.css`. Change `--color-accent` to recolor the whole site. To use a Google Font, add its `<link>` tag to the `<head>` of `index.html` and put the font family first in `--font-sans`. You should not need to touch `css/layout.css` to restyle the site.

## Link previews (meta / Open Graph)

`script.js` fills the description and Open Graph tags from `SITE.seo` when the page loads. Social-media crawlers don't run JavaScript, though, so the same values are also hard-coded in the `<head>` of `index.html`. If you change `seo` in `data.js`, update those tags too. Once the site is live, set `seo.url` and make `og:image` an absolute URL (for example `https://<username>.github.io/<repo>/assets/img/projects/lithe-joint.jpg`) so link previews show the image.

## Previewing locally

Double-click `index.html`, or run a local server:

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
