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
```HOMY
homy.start
 (
lib: https 
start_app_mini:foxd//
start_app_mini: ar/en
start_app_mini_firebase: 
"js"
firebase: 
start_app_mini_admob: id() ad()  . 
. setting: 
name_app_mini() 
web_package_mini() 
web_mini_version() 
mini_version() 
mini_app_icon() 
setting /
. body@
"html"
  <div class="card" role="application" aria-labelledby="app-name">
    <div class="left">
      <div class="icon-wrap" id="iconWrap" aria-hidden="false">
        <img id="appIcon" alt="App icon" src="" />
      </div>
      <div class="meta">
        <h1 id="app-name">Homy Mini — Playground</h1>
        <div class="line">Package: <span id="pkg" class="value"></span></div>
        <div class="line">Web version: <span id="webver" class="value"></span></div>
        <div class="line">Core version: <span id="corever" class="value"></span></div>
        <div class="line">Runtime: <span id="runtime" class="value">browser</span></div>
      </div>
      <div class="small">Quick actions</div>
      <div class="controls">
        <button id="runBtn">Run</button>
        <button id="formatBtn" class="secondary">Show example</button>
        <button id="clearOut" class="secondary">Clear output</button>
      </div>
      <footer>This playground transpiles HomyLang to JS in the browser and executes it in a sandboxed iframe.</footer>
    </div>
    <div>
      <div class="editor">
        <label class="small">HomyLang source</label>
        <textarea id="editor" aria-label="HomyLang editor"></textarea>
        <div style="display:flex;gap:12px;align-items:flex-start;margin-top:8px">
          <div style="flex:1">
            <label class="small">Output</label>
            <pre id="output" aria-live="polite">-- output appears here --</pre>
          </div>
          <div style="width:220px">
            <label class="small">Transpiled JS</label>
            <pre id="transpiled" style="height:200px;white-space:pre-wrap;overflow:auto">-- transpiled JS --</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
"css"
(style:
homy,body{height:100%;margin:0;background:linear-gradient(180deg,var(--bg) 0%, #07101a 100%);display:flex;align-items:center;justify-content:center;padding:20px;}
    .card{width:min(1100px,98vw);background:linear-gradient(180deg,var(--card), #07121b);box-shadow:0 8px 30px rgba(2,6,23,0.6);border-radius:var(--radius);padding:20px;display:grid;grid-template-columns:240px 1fr;gap:20px;align-items:start;}
    .left{display:flex;flex-direction:column;gap:12px}
    .icon-wrap{width:120px;height:120px;border-radius:12px;background:var(--glass);display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(255,255,255,0.03);}
    .icon-wrap img{max-width:100%;max-height:100%;display:block}
    h1{margin:0;font-size:18px}
    .meta{display:flex;flex-direction:column;gap:6px}
    .meta .line{color:var(--muted);font-size:13px;display:flex;gap:8px;align-items:center}
    .meta .value{color:var(--accent);font-weight:600}
    .editor{display:flex;flex-direction:column;gap:8px}
    textarea{width:100%;height:360px;background:#021226;color:#dbe9f5;border-radius:8px;padding:12px;font-family: monospace, ui-monospace; font-size:13px; border:1px solid rgba(255,255,255,0.03); resize:vertical}
    pre{background:rgba(0,0,0,0.08);padding:12px;border-radius:8px;color:#dbe9f5;overflow:auto;min-height:120px}
    .controls{display:flex;gap:8px;align-items:center}
    button{background:linear-gradient(180deg,var(--accent), #3ec7db);border:none;color:#012;padding:8px 12px;border-radius:8px;font-weight:700;cursor:pointer}
    button.secondary{background:transparent;border:1px solid rgba(255,255,255,0.04);color:var(--muted);font-weight:600}
    footer{margin-top:10px;color:var(--muted);font-size:12px}
    .small{font-size:13px;color:var(--muted)}
    @media (max-width:900px)
{.card{grid-template-columns:1fr;}})
Call: ran.html
/body
)
```

Notes:
- The icon is provided as an inline data URI for portability, but `assets/icon.svg` is included if you want an external file.
- This is a front-end companion to the HomyLang prototype. It does not run the HomyLang transpiler in-browser — that is still implemented as a Node.js module in `src/` for now.
- If you'd like, I can extend this to:
  - Run the transpiler in the browser (compile to JS using the same AST → JS logic)
  - Provide a REPL editor to author HomyLang code and execute it (via transpilation)
  - Add download / package generation UI
