// ============================================================
// In the Media — science-communication output by the lab.
//
// Rendered by js/media.js on media.html, newest first (sorted on
// `date`, so entries can be added anywhere in this array).
//
// Fields
//   date        ISO "YYYY-MM-DD". Drives the sort order, the date on the
//               entry (formatted in js/media.js) and the watermark year
//               shown on the first entry of each year.
//   type        "interview" | "podcast" | "event". Not shown as a label
//               anywhere — it only picks the glyph on the placeholder
//               tile, so it matters only while `image` is null.
//   outlet      Publication / programme / organiser. Also the caption on
//               the placeholder tile.
//   title       Short — one line. It is the link to `url`.
//   description Two or three sentences. Plain HTML is allowed and is
//               inserted as-is: end with a sentence carrying the link,
//               e.g. 'Read the interview <a href="…">here</a>.'
//               Current lab members named here are turned into links to
//               their profile page automatically — write the name out in
//               full ("Renée Visser"), no markup needed.
//   url         The output itself. Used for the title link.
//   image       Optional path to a photo, e.g. "images/media/parool.jpg".
//               Leave null (or omit) to fall back to the placeholder tile.
//               Photos are cropped to 4:3 — supply something roughly
//               landscape and at least 640px wide.
//   imageAlt    Alt text, required whenever `image` is set.
// ============================================================

const mediaItems = [
  {
    date: "2026-07-01",
    type: "event",
    outlet: "Weekend van de Wetenschap",
    title: "The lab at Weekend van de Wetenschap",
    description: "On 3 October 2026 the Amsterdam Emotional Memory Lab takes part in Weekend van de Wetenschap, the national science weekend. Visitors get to see the range of ways we study emotional memory, from an experiment on smell and memory to a live demonstration of fear conditioning and how you actually measure it. More about the event <a href=\"https://weekendvandewetenschap.nl/\" target=\"_blank\" rel=\"noopener\">here</a>.",
    url: "https://weekendvandewetenschap.nl/",
    image: "images/media/weekend_wetenschap.png",
    imageAlt: "Logo of Weekend van de Wetenschap, the national science weekend."
  },
  {
    date: "2026-06-12",
    type: "podcast",
    outlet: "NRC — Het Uur",
    title: "Merel Kindt on fear research and its clinical use",
    description: "Merel Kindt was a guest on the NRC podcast <em>Het Uur</em>, talking through her research on fear and her clinical work on treating fear memories. The conversation also turns to a broader question: are we living in more frightening times, or have we become less resilient? Listen to the episode <a href=\"https://www.nrc.nl/nieuws/2026/06/12/merel-kindt-leven-we-in-engere-tijden-of-zijn-we-minder-veerkrachtig-angstpsycholoog-a4929972\" target=\"_blank\" rel=\"noopener\">here</a>.",
    url: "https://www.nrc.nl/nieuws/2026/06/12/merel-kindt-leven-we-in-engere-tijden-of-zijn-we-minder-veerkrachtig-angstpsycholoog-a4929972",
    image: "images/media/het_uur.png",
    imageAlt: "Cover art for the NRC podcast Het Uur."
  },
  {
    date: "2026-04-28",
    type: "podcast",
    outlet: "NTR Focus op Wetenschap",
    title: "Imagery rescripting and emotional memory in the brain",
    description: "Renée Visser, Floris Tijhuis and Sophie Rameckers joined the NTR podcast <em>Focus op Wetenschap</em> to discuss their ongoing study on imagery rescripting: can you edit a painful memory, and what does that look like in the brain? Presenter Syb Faes went through the MRI session and the therapy protocol himself. Listen to the episode <a href=\"https://npo.nl/luister/podcasts/101-focus-op-wetenschap/140176\" target=\"_blank\" rel=\"noopener\">here</a>.",
    url: "https://npo.nl/luister/podcasts/101-focus-op-wetenschap/140176",
    image: "images/media/focus.jpeg",
    imageAlt: "Cover art for the NTR podcast Focus op Wetenschap."
  },
  {
    date: "2025-12-04",
    type: "interview",
    outlet: "Het Parool",
    title: "Faya Reinhold on sleep and emotional memory",
    description: "Het Parool interviewed Faya Reinhold about the results of her dissertation on sleep and emotional memory. She explains what sleep contributes to the way emotional experiences are stored, and what the consequences are when good sleep is missing for a long stretch of time. Read the interview <a href=\"https://www.parool.nl/nederland/wat-zijn-de-gevolgen-als-je-lange-tijd-slecht-slaapt~b7e5265d/\" target=\"_blank\" rel=\"noopener\">here</a>.",
    url: "https://www.parool.nl/nederland/wat-zijn-de-gevolgen-als-je-lange-tijd-slecht-slaapt~b7e5265d/",
    image: "images/media/parool_faya.png",
    imageAlt: "Illustration of a woman asleep in bed while shadowy figures loom around her."
  }
];
