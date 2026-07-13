(() => {
const MIN_OPPONENTS = 1;
const MAX_OPPONENTS = 4;
const DEFAULT_OPPONENTS = 1;
const playerColors = ["#2f7d4f", "#d45d32", "#2d6f9f", "#b36a22", "#7a56a6"];
const portraitPromptBase = "playful prehistoric cartoon board game portrait, head and shoulders dinosaur character, chunky shapes, bold clean outlines, warm colors, expressive friendly face, simple softly lit background, circular avatar composition, no text, no letters, no numbers, no watermark";

const opponentPersonas = [
  {
    personaId: "rex",
    name: "Rex de Archeoloog",
    gender: "male",
    role: "Archeoloog",
    species: "Tyrannosaurus rex",
    speciesShort: "T. rex",
    initials: "RA",
    playStyle: "archaeologist",
    color: "#d45d32",
    portrait: "assets/players/portraits/rex-archeoloog.png",
    portraitPrompt: `${portraitPromptBase}, Tyrannosaurus rex with a broad snout and tiny arms, curious dinosaur archaeologist wearing a monocle and field hat, surrounded by fossils and small excavation tools`
  },
  {
    personaId: "nova",
    name: "Nova de Vulkaanwachter",
    gender: "female",
    role: "Vulkaanwachter",
    species: "Parasaurolophus",
    speciesShort: "Parasaurolophus",
    initials: "NV",
    playStyle: "volcanic",
    color: "#e05f4f",
    portrait: "assets/players/portraits/nova-vulkaanwachter.png",
    portraitPrompt: `${portraitPromptBase}, Parasaurolophus with a long backward head crest, confident dinosaur volcano watcher wearing safety goggles, holding a glowing lava lantern, warm volcanic rim light`
  },
  {
    personaId: "kiki",
    name: "Kiki de Bottenfluisteraar",
    gender: "female",
    role: "Bottenfluisteraar",
    species: "Velociraptor",
    speciesShort: "Velociraptor",
    initials: "KB",
    playStyle: "sneaky",
    color: "#7a56a6",
    portrait: "assets/players/portraits/kiki-bottenfluisteraar.png",
    portraitPrompt: `${portraitPromptBase}, feathered Velociraptor with alert eyes and small sickle claws, clever dinosaur bone whisperer with a bone necklace and smart mischievous smile, fossil shapes in the background`
  },
  {
    personaId: "bram",
    name: "Bram Brulbaard",
    gender: "male",
    role: "Brulbaard",
    species: "Carnotaurus",
    speciesShort: "Carnotaurus",
    initials: "BB",
    playStyle: "aggressive",
    color: "#b33b2e",
    portrait: "assets/players/portraits/bram-brulbaard.png",
    portraitPrompt: `${portraitPromptBase}, Carnotaurus with two short brow horns and a sturdy head, theatrical dinosaur with a neat beard, sash, and grand opera-singing posture, powerful but playful roar energy`
  },
  {
    personaId: "luna",
    name: "Luna de Tijdlijnkundige",
    gender: "female",
    role: "Tijdlijnkundige",
    species: "Triceratops",
    speciesShort: "Triceratops",
    initials: "LT",
    playStyle: "careful",
    color: "#2d6f9f",
    portrait: "assets/players/portraits/luna-tijdlijnkundige.png",
    portraitPrompt: `${portraitPromptBase}, Triceratops with three horns and a rounded frill, thoughtful dinosaur timeline scholar wearing a starry cloak and holding a small hourglass, amber time glow`
  },
  {
    personaId: "otto",
    name: "Otto de Kaartkapitein",
    gender: "male",
    role: "Kaartkapitein",
    species: "Pteranodon",
    speciesShort: "Pteranodon",
    initials: "OK",
    playStyle: "captain",
    color: "#2f8f8a",
    portrait: "assets/players/portraits/otto-kaartkapitein.png",
    portraitPrompt: `${portraitPromptBase}, Pteranodon with a long beak and swept head crest, cheerful flying reptile card captain wearing a captain hat, holding a fan of blank playing cards, nautical adventure mood`
  },
  {
    personaId: "mira",
    name: "Mira de Mosridder",
    gender: "female",
    role: "Mosridder",
    species: "Ankylosaurus",
    speciesShort: "Ankylosaurus",
    initials: "MM",
    playStyle: "defensive",
    color: "#4f8f3a",
    portrait: "assets/players/portraits/mira-mosridder.png",
    portraitPrompt: `${portraitPromptBase}, Ankylosaurus with bony armor plates and a sturdy rounded face, brave dinosaur moss knight wearing a soft moss cloak and carrying a small wooden shield, gentle forest guardian mood`
  },
  {
    personaId: "puck",
    name: "Puck de Platenmaker",
    gender: "male",
    role: "Platenmaker",
    species: "Stegosaurus",
    speciesShort: "Stegosaurus",
    initials: "PP",
    playStyle: "chaotic",
    color: "#b36a22",
    portrait: "assets/players/portraits/puck-platenmaker.png",
    portraitPrompt: `${portraitPromptBase}, Stegosaurus with friendly face and visible back plates, lively dinosaur plate artist with carved wooden stamp tools and playful messy creative energy`
  },
  {
    personaId: "tara",
    name: "Tara de Trucjager",
    gender: "female",
    role: "Trucjager",
    species: "Dilophosaurus",
    speciesShort: "Dilophosaurus",
    initials: "TT",
    playStyle: "tricky",
    color: "#c45a8a",
    portrait: "assets/players/portraits/tara-trucjager.png",
    portraitPrompt: `${portraitPromptBase}, Dilophosaurus with two delicate head crests, agile dinosaur trick hunter wearing a small hunter hat and performing blank card tricks, sly friendly grin`
  }
];

function getOpponentSelection(selection) {
  if (Array.isArray(selection)) {
    return selection
      .map((personaId) => opponentPersonas.find((persona) => persona.personaId === personaId))
      .filter(Boolean)
      .slice(0, MAX_OPPONENTS);
  }

  const opponentCount = Math.max(MIN_OPPONENTS, Math.min(MAX_OPPONENTS, Number(selection ?? DEFAULT_OPPONENTS)));
  return opponentPersonas.slice(0, opponentCount);
}

function createPlayers(selection) {
  const opponents = getOpponentSelection(selection);

  return [
    { id: "player", name: "Jij", color: playerColors[0], isHuman: true },
    ...opponents.map((persona, index) => ({
      ...persona,
      id: `pc${index + 1}`,
      color: persona.color ?? playerColors[(index % (playerColors.length - 1)) + 1],
      isHuman: false
    }))
  ];
}

globalThis.ExplodingDinosPlayers = {
  MIN_OPPONENTS,
  MAX_OPPONENTS,
  DEFAULT_OPPONENTS,
  playerColors,
  opponentPersonas,
  portraitPromptBase,
  getOpponentSelection,
  createPlayers
};
})();
