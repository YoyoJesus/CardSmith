import type { BusinessCardData, CardSize } from "./types";

function typstString(str: string): string {
  return `"${str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")}"`;
}

function safeColor(color: string, fallback: string): string {
  return /^[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

function cardDimensions(size: CardSize): { width: string; height: string } {
  switch (size) {
    case "eu":
      return { width: "85mm", height: "55mm" };
    case "square":
      return { width: "2.5in", height: "2.5in" };
    case "us":
    default:
      return { width: "3.5in", height: "2in" };
  }
}

function contactItems(data: BusinessCardData): string[] {
  const items: string[] = [];
  if (data.email)
    items.push(
      `link(${typstString(`mailto:${data.email}`)}, ${typstString(data.email)})`,
    );
  if (data.phone) items.push(typstString(data.phone));
  if (data.website) {
    const url = /^https?:\/\//i.test(data.website)
      ? data.website
      : `https://${data.website}`;
    items.push(
      `link(${typstString(url)}, ${typstString(data.website.replace(/^https?:\/\//i, ""))})`,
    );
  }
  if (data.linkedin)
    items.push(
      `link(${typstString(`https://linkedin.com/in/${data.linkedin}`)}, ${typstString(`linkedin.com/in/${data.linkedin}`)})`,
    );
  if (data.github)
    items.push(
      `link(${typstString(`https://github.com/${data.github}`)}, ${typstString(`github.com/${data.github}`)})`,
    );
  if (data.twitter)
    items.push(
      `link(${typstString(`https://x.com/${data.twitter}`)}, ${typstString(`x.com/${data.twitter}`)})`,
    );
  if (data.location) items.push(typstString(data.location));
  return items;
}

function contactBlock(data: BusinessCardData, fontSize = "7pt"): string {
  const items = contactItems(data);
  if (!items.length) return "";
  return items
    .map((item) => `    #text(${fontSize}, fill: text-color, ${item})`)
    .join("\n    #linebreak()\n");
}

function layoutBar(
  data: BusinessCardData,
  dims: ReturnType<typeof cardDimensions>,
): string {
  const titleLine = [data.title, data.company].filter(Boolean).join(" · ");
  return `
#set page(width: ${dims.width}, height: ${dims.height}, margin: 0pt, fill: bg-color)

#grid(
  columns: (0.12in, 1fr),
  rect(fill: primary-color, width: 100%, height: ${dims.height}),
  block(inset: (left: 0.18in, right: 0.2in, top: 0.18in, bottom: 0.18in), width: 100%)[
    #text(14pt, weight: "bold", fill: primary-color, ${typstString(data.name)})
    #linebreak()
    #v(-0.3em)
    #text(8pt, fill: primary-color, ${typstString(titleLine)})
    #v(0.12in)
    #line(length: 100%, stroke: 0.4pt + primary-color)
    #v(0.06in)
${contactBlock(data, "7pt")}
  ]
)`;
}

function layoutClassic(
  data: BusinessCardData,
  dims: ReturnType<typeof cardDimensions>,
): string {
  const titleLine = [data.title, data.company].filter(Boolean).join(" · ");
  return `
#set page(width: ${dims.width}, height: ${dims.height},
  margin: (left: 0.25in, right: 0.25in, top: 0.18in, bottom: 0.18in),
  fill: bg-color)

#text(15pt, weight: "bold", fill: primary-color, ${typstString(data.name)})
#linebreak()
#v(-0.25em)
#text(8.5pt, fill: primary-color, ${typstString(titleLine)})
#v(0.1in)
#line(length: 100%, stroke: 0.5pt + primary-color)
#v(0.06in)
${contactBlock(data, "7pt")}`;
}

function layoutCentered(
  data: BusinessCardData,
  dims: ReturnType<typeof cardDimensions>,
): string {
  const titleLine = [data.title, data.company].filter(Boolean).join(" · ");
  const items = contactItems(data);
  const contactJoined = items.length
    ? items
        .map((i) => `#${i}`)
        .join([" ", "#text(fill: primary-color)[ | ]", " "].join(""))
    : "";
  return `
#set page(width: ${dims.width}, height: ${dims.height},
  margin: (left: 0.2in, right: 0.2in, top: 0.2in, bottom: 0.2in),
  fill: bg-color)
#set align(center)

#v(1fr)
#text(15pt, weight: "bold", fill: primary-color, ${typstString(data.name)})
#linebreak()
#v(-0.25em)
#text(8.5pt, fill: primary-color, ${typstString(titleLine)})
#v(0.08in)
#line(length: 80%, stroke: 0.5pt + primary-color)
#v(0.06in)
#text(6.5pt, fill: text-color)[${contactJoined}]
#v(1fr)`;
}

function layoutHeader(
  data: BusinessCardData,
  dims: ReturnType<typeof cardDimensions>,
): string {
  const titleLine = [data.title, data.company].filter(Boolean).join(" · ");
  const headerHeight =
    dims.height === "2in"
      ? "0.75in"
      : dims.height === "55mm"
        ? "20mm"
        : "0.9in";
  return `
#set page(width: ${dims.width}, height: ${dims.height}, margin: 0pt, fill: bg-color)

#block(fill: primary-color, width: 100%, height: ${headerHeight},
  inset: (left: 0.2in, right: 0.2in, top: 0.13in, bottom: 0.1in))[
  #text(15pt, weight: "bold", fill: bg-color, ${typstString(data.name)})
  #linebreak()
  #v(-0.3em)
  #text(8pt, fill: rgb(230, 230, 255), ${typstString(titleLine)})
]
#block(width: 100%, inset: (left: 0.2in, right: 0.2in, top: 0.12in, bottom: 0.1in))[
${contactBlock(data, "7pt")}
]`;
}

export function generateTypstCode(data: BusinessCardData): string {
  const dims = cardDimensions(data.size);

  const header = `#let primary-color = rgb("${safeColor(data.primaryColor, "22327F")}")
#let text-color = rgb("${safeColor(data.textColor, "1b1b1b")}")
#let bg-color = rgb("${safeColor(data.bgColor, "ffffff")}")

#set text(size: 8pt, fill: text-color, lang: "en", ligatures: false)`;

  let body: string;
  switch (data.layout) {
    case "classic":
      body = layoutClassic(data, dims);
      break;
    case "centered":
      body = layoutCentered(data, dims);
      break;
    case "header":
      body = layoutHeader(data, dims);
      break;
    case "bar":
    default:
      body = layoutBar(data, dims);
      break;
  }

  return `${header}\n${body}`;
}
