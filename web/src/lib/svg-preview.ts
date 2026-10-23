// typst.ts embeds an interactivity script that is not valid XML, so an <img> cannot decode the SVG with it. Scripts
// never run inside an <img>, so dropping them loses nothing.
export function previewSvgMarkup(svg: string): string {
  return svg.replace(/<script\b[\s\S]*?<\/script\s*>/gi, "");
}

export function previewSvgBlob(svg: string): Blob {
  return new Blob([previewSvgMarkup(svg)], { type: "image/svg+xml" });
}
