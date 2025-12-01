// Web runtime helpers for Homy Mini (exposes required functions)
//
// Functions implemented:
// - name_app_mini() -> string
// - web_package_mini() -> string
// - web_mini_version() -> string
// - mini_version() -> string
// - mini_app_icon() -> data URI (string) or path string
//
// The module also exports the functions as named exports.

const METADATA = {
  name: 'Homy Mini',
  package: 'kingrevocation20-dev/homy',
  webVersion: '0.1.0-web',
  coreVersion: '0.1.0',
};

// Inline simple SVG icon as a data URI for portability.
// You can replace the SVG with assets/icon.svg if you prefer an external file.
const ICON_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 24 24' fill='none' stroke='none'>
  <rect width='100%' height='100%' rx='6' fill='#071735'/>
  <g transform='translate(4,4)'>
    <rect width='16' height='16' rx='3' fill='#0AA0D8'/>
    <path d='M5 8h6M5 11h10M5 14h6' stroke='#072033' stroke-width='0.9' stroke-linecap='round' stroke-linejoin='round' opacity='0.95'/>
  </g>
</svg>`;

function svgToDataURI(svg) {
  // encode spaces and # safely
  const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export function name_app_mini() {
  return METADATA.name;
}

export function web_package_mini() {
  return METADATA.package;
}

export function web_mini_version() {
  return METADATA.webVersion;
}

export function mini_version() {
  return METADATA.coreVersion;
}

export function mini_app_icon() {
  // Return data URI by default. If you prefer an external asset, return '/assets/icon.svg'
  return svgToDataURI(ICON_SVG);
}

// Also attach to window if available (for non-module consumers)
if (typeof window !== 'undefined') {
  window.name_app_mini = name_app_mini;
  window.web_package_mini = web_package_mini;
  window.web_mini_version = web_mini_version;
  window.mini_version = mini_version;
  window.mini_app_icon = mini_app_icon;
}