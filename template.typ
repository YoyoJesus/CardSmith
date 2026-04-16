// Business Card Template - US Standard (3.5" x 2")
// This is a reference template; the generator in web/src/lib/typst-generator.ts
// produces output based on this structure.

#let primary-color = rgb("22327F")
#let text-color = rgb("1b1b1b")
#let bg-color = rgb("ffffff")

#set text(size: 8pt, fill: text-color, lang: "en", ligatures: false)

// Layout: Accent Bar
#set page(width: 3.5in, height: 2in, margin: 0pt, fill: bg-color)

#grid(
  columns: (0.12in, 1fr),
  rect(fill: primary-color, width: 100%, height: 2in),
  block(inset: (left: 0.18in, right: 0.2in, top: 0.18in, bottom: 0.18in), width: 100%)[
    #text(14pt, weight: "bold", fill: primary-color)[Jane Doe]
    #linebreak()
    #v(-0.3em)
    #text(8pt, fill: primary-color)[Software Engineer · Acme Corp]
    #v(0.12in)
    #line(length: 100%, stroke: 0.4pt + primary-color)
    #v(0.06in)
    #text(7pt, fill: text-color)[#link("mailto:jane@example.com")[jane\@example.com]]
    #linebreak()
    #text(7pt, fill: text-color)[+1 555 123 4567]
    #linebreak()
    #text(7pt, fill: text-color)[San Francisco, CA]
  ]
)
