three.js r186 (v0.186.1), MIT licence (see LICENSE).
Copied from https://cdn.jsdelivr.net/npm/three@0.186.1/ so the site has no runtime CDN dependency.
build/three.module.min.js was edited only to import ./three.core.min.js instead of ./three.core.js.
The addons' bare 'three' imports were rewritten to '../../build/three.module.min.js' so no import map is needed.
