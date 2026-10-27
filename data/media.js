// ============================================================
// In the Media — science-communication output by the lab.
//
// Rendered by js/media.js on media.html, newest first (sorted on
// `date`, so entries can be added anywhere in this array).
//
// The page is Dutch by default, with a switch to English, so every entry
// carries its text twice, under `nl` and `en`. If one language is missing,
// the other is shown in its place.
//
// Fields
//   date        ISO "YYYY-MM-DD". Drives the sort order, the date on the
//               entry (formatted in js/media.js, in the page language) and
//               the watermark year shown on the first entry of each year.
//   type        "interview" | "podcast" | "event". Not shown as a label
//               anywhere — it only picks the glyph on the placeholder
//               tile, so it matters only while `image` is null.
//   outlet      Publication / programme / organiser. Also the caption on
//               the placeholder tile. Proper name, so not translated.
//   url         The output itself. Used for the title link.
//   image       Optional path to a photo, e.g. "images/media/parool.jpg".
//               Leave null (or omit) to fall back to the placeholder tile.
//               Photos are cropped to 4:3 — supply something roughly
//               landscape and at least 640px wide.
//   nl / en     One object per language:
//     title       Short — one line. It is the link to `url`.
//     description Two or three sentences. Plain HTML is allowed and is
//                 inserted as-is: end with a sentence carrying the link,
//                 e.g. 'Lees het interview <a href="…">hier</a>.'
//                 Current lab members named here are turned into links to
//                 their profile page automatically — write the name out in
//                 full ("Renée Visser"), no markup needed.
//     imageAlt    Alt text, required whenever `image` is set.
// ============================================================

const mediaItems = [
  {
    date: "2026-10-03",
    type: "event",
    outlet: "Weekend van de Wetenschap",
    url: "https://lnkd.in/p/dY4DN6Ac",
    image: "images/media/weekend_wetenschap.jpg",
    nl: {
      title: "Het lab op het Weekend van de Wetenschap",
      description: "Op 3 oktober 2026 deed het Amsterdam Emotional Memory Lab mee aan het Weekend van de Wetenschap, het landelijke wetenschapsweekend. Kinderen kregen de rol van onderzoeker en gaven hun ouders elektrische shocks om te laten zien hoe angstconditionering werkt. Ouders en kinderen probeerden samen mysterieuze geuren te raden en ontdekten hoe sterk geur verbonden is met ons emotionele geheugen. Kortom: een leuke en leerzame dag voor jong en oud! Meer over het evenement lees je <a href=\"https://lnkd.in/p/dY4DN6Ac\" target=\"_blank\" rel=\"noopener\">hier</a>.",
      imageAlt: "Zes leden van het lab in bijpassende witte T-shirts poseren samen bij de stand op het Weekend van de Wetenschap."
    },
    en: {
      title: "The lab at Weekend van de Wetenschap",
      description: "On 3 October 2026 the Amsterdam Emotional Memory Lab took part in Weekend van de Wetenschap, the national science weekend. Children took on an experimenter role and administered electric shocks to their parents to see how fear conditioning works. Parents and children both tried to guess mystery smells while learning how powerfully smell connects to our emotional memory. All in all, a fun and educational day for all! More about the event <a href=\"https://lnkd.in/p/dY4DN6Ac\" target=\"_blank\" rel=\"noopener\">here</a>.",
      imageAlt: "Six members of the lab in matching white T-shirts posing together at the Weekend van de Wetenschap stand."
    }
  },
  {
    date: "2026-06-12",
    type: "podcast",
    outlet: "NRC — Het Uur",
    url: "https://www.nrc.nl/nieuws/2026/06/12/merel-kindt-leven-we-in-engere-tijden-of-zijn-we-minder-veerkrachtig-angstpsycholoog-a4929972",
    image: "images/media/het_uur.jpg",
    nl: {
      title: "Merel Kindt over angstonderzoek en de toepassing in de kliniek",
      description: "Merel Kindt was te gast in de NRC-podcast <em>Het Uur</em> en vertelde over haar onderzoek naar angst en haar klinische werk aan de behandeling van angstherinneringen. Het gesprek gaat ook over een bredere vraag: leven we in engere tijden, of zijn we minder veerkrachtig geworden? Luister de aflevering <a href=\"https://www.nrc.nl/nieuws/2026/06/12/merel-kindt-leven-we-in-engere-tijden-of-zijn-we-minder-veerkrachtig-angstpsycholoog-a4929972\" target=\"_blank\" rel=\"noopener\">hier</a>.",
      imageAlt: "Coverbeeld van de NRC-podcast Het Uur."
    },
    en: {
      title: "Merel Kindt on fear research and its clinical use",
      description: "Merel Kindt was a guest on the NRC podcast <em>Het Uur</em>, talking through her research on fear and her clinical work on treating fear memories. The conversation also turns to a broader question: are we living in more frightening times, or have we become less resilient? Listen to the episode <a href=\"https://www.nrc.nl/nieuws/2026/06/12/merel-kindt-leven-we-in-engere-tijden-of-zijn-we-minder-veerkrachtig-angstpsycholoog-a4929972\" target=\"_blank\" rel=\"noopener\">here</a>.",
      imageAlt: "Cover art for the NRC podcast Het Uur."
    }
  },
  {
    date: "2026-04-28",
    type: "podcast",
    outlet: "NTR Focus op Wetenschap",
    url: "https://npo.nl/luister/podcasts/101-focus-op-wetenschap/140176",
    image: "images/media/focus.jpeg",
    nl: {
      title: "Imagery rescripting en emotioneel geheugen in de hersenen",
      description: "Renée Visser, Floris Tijhuis en Sophie Rameckers schoven aan bij de NTR-podcast <em>Focus op Wetenschap</em> om hun lopende studie naar imagery rescripting te bespreken: kun je een pijnlijke herinnering bewerken, en hoe ziet dat eruit in de hersenen? Presentator Syb Faes onderging zelf de MRI-sessie en het therapieprotocol. Luister de aflevering <a href=\"https://npo.nl/luister/podcasts/101-focus-op-wetenschap/140176\" target=\"_blank\" rel=\"noopener\">hier</a>.",
      imageAlt: "Coverbeeld van de NTR-podcast Focus op Wetenschap."
    },
    en: {
      title: "Imagery rescripting and emotional memory in the brain",
      description: "Renée Visser, Floris Tijhuis and Sophie Rameckers joined the NTR podcast <em>Focus op Wetenschap</em> to discuss their ongoing study on imagery rescripting: can you edit a painful memory, and what does that look like in the brain? Presenter Syb Faes went through the MRI session and the therapy protocol himself. Listen to the episode <a href=\"https://npo.nl/luister/podcasts/101-focus-op-wetenschap/140176\" target=\"_blank\" rel=\"noopener\">here</a>.",
      imageAlt: "Cover art for the NTR podcast Focus op Wetenschap."
    }
  },
  {
    date: "2025-12-04",
    type: "interview",
    outlet: "Het Parool",
    url: "https://www.parool.nl/nederland/wat-zijn-de-gevolgen-als-je-lange-tijd-slecht-slaapt~b7e5265d/",
    image: "images/media/parool_faya.jpg",
    nl: {
      title: "Faya Reinhold over slaap en emotioneel geheugen",
      description: "Het Parool interviewde Faya Reinhold over de resultaten van haar proefschrift over slaap en emotioneel geheugen. Ze legt uit wat slaap bijdraagt aan de manier waarop emotionele ervaringen worden opgeslagen, en wat de gevolgen zijn als goede slaap langere tijd uitblijft. Lees het interview <a href=\"https://www.parool.nl/nederland/wat-zijn-de-gevolgen-als-je-lange-tijd-slecht-slaapt~b7e5265d/\" target=\"_blank\" rel=\"noopener\">hier</a>.",
      imageAlt: "Illustratie van een slapende vrouw in bed, omringd door schimmige figuren."
    },
    en: {
      title: "Faya Reinhold on sleep and emotional memory",
      description: "Het Parool interviewed Faya Reinhold about the results of her dissertation on sleep and emotional memory. She explains what sleep contributes to the way emotional experiences are stored, and what the consequences are when good sleep is missing for a long stretch of time. Read the interview <a href=\"https://www.parool.nl/nederland/wat-zijn-de-gevolgen-als-je-lange-tijd-slecht-slaapt~b7e5265d/\" target=\"_blank\" rel=\"noopener\">here</a>.",
      imageAlt: "Illustration of a woman asleep in bed while shadowy figures loom around her."
    }
  }
];
