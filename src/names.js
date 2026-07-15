(() => {
const DINO_NAME_STARTS = [
  "Brullende", "Knetterende", "Sluwe", "Dappere", "Machtige", "Flitsende",
  "Mollige", "Vurige", "Slaperige", "Wilde", "Blije", "Stekelige",
  "Donderende", "Stampende", "Grommende", "Razende", "Zwiepende", "Mopperende",
  "Knorrige", "Bibberende", "Hongerige", "Nieuwsgierige", "Ondeugende", "Verstrooide"
];

const DINO_NAME_ENDS = [
  "Bronto", "Raptor", "Tricera", "Stego", "Ptero", "Rex",
  "Ankylo", "Dilo", "Spino", "Carno", "Fossielsnuit", "Staartzwieper",
  "Brachio", "Allo", "Iguanodon", "Pachy", "Mosrug", "Lavapoot",
  "Bottenkraker", "Klauwteen", "Platenkop", "Oerstaart", "Vulkaansnuit", "Kiezelbuik"
];

const MAX_DINO_NAME_LENGTH = 24;

function buildDinoNames() {
  return DINO_NAME_STARTS.flatMap((start) => DINO_NAME_ENDS.map((end) => (
    `${start} ${end}`.slice(0, MAX_DINO_NAME_LENGTH).trimEnd()
  )));
}

function randomDinoName(random = Math.random, excludedNames = []) {
  const excluded = new Set([...excludedNames].map((name) => String(name).toLowerCase()));
  const available = buildDinoNames().filter((name) => !excluded.has(name.toLowerCase()));
  if (available.length === 0) return "Dappere Dino";
  const index = Math.min(available.length - 1, Math.floor(Math.max(0, random()) * available.length));
  return available[index];
}

const ExplodingDinosNames = {
  DINO_NAME_STARTS,
  DINO_NAME_ENDS,
  MAX_DINO_NAME_LENGTH,
  buildDinoNames,
  randomDinoName
};

globalThis.ExplodingDinosNames = ExplodingDinosNames;
if (typeof module !== "undefined" && module.exports) module.exports = ExplodingDinosNames;
})();
