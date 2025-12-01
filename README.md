# Homy Mini — web dashboard

This small web dashboard exposes a few runtime helpers for the Homy Mini project and provides an index.html front-end.

Open `index.html` in your browser (double-click or serve it from any static file server). The page shows:

- App icon
- Package identifier
- Web build version
- Core (mini) version

Available global functions (also exported from `src/web.js`):
- `name_app_mini()` -> string
- `web_package_mini()` -> string
- `web_mini_version()` -> string
- `mini_version()` -> string
- `mini_app_icon()` -> data URI string for an SVG icon

Example usage in the browser console:
```js
name_app_mini() // "Homy Mini"
web_package_mini() // "kingrevocation20-dev/homy"
mini_app_icon() // data:image/svg+xml;...
```

Notes:
- The icon is provided as an inline data URI for portability, but `assets/icon.svg` is included if you want an external file.
- This is a front-end companion to the HomyLang prototype. It does not run the HomyLang transpiler in-browser — that is still implemented as a Node.js module in `src/` for now.
- If you'd like, I can extend this to:
  - Run the transpiler in the browser (compile to JS using the same AST → JS logic)
  - Provide a REPL editor to author HomyLang code and execute it (via transpilation)
  - Add download / package generation UI