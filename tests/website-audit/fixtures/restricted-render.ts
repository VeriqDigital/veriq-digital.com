import { strongFoundationsHtml } from "./foundations";

// A generic reconstruction fixture: responsive CSS would override a wide
// fallback layout, but its external origin is intentionally disallowed.
export const dynamicRestrictedHtml = strongFoundationsHtml.replace("</head>", `
  <style>main { min-width: 2400px; }</style>
  ${Array.from({ length: 8 }, (_, index) => `<link rel="stylesheet" href="https://assets.example.test/layout-${index}.css">`).join("")}
  ${'<script>document.querySelector("main").style.minWidth = "0";</script>'.repeat(20)}
  </head>`);
