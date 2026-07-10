(() => {
const MIN_OPPONENTS = 1;
const MAX_OPPONENTS = 4;
const DEFAULT_OPPONENTS = 1;
const playerColors = ["#2f7d4f", "#d45d32", "#2d6f9f", "#b36a22", "#7a56a6"];

const opponentPersonas = [
  { name: "Rex de Archeoloog", gender: "male", role: "Archeoloog", initials: "RA", playStyle: "balanced", portraitTodo: "dino met monocle en veldhoed tussen fossielen" },
  { name: "Nova de Vulkaanwachter", gender: "female", role: "Vulkaanwachter", initials: "NV", playStyle: "bold", portraitTodo: "dino met veiligheidsbril en gloeiende lavalantaarn" },
  { name: "Kiki de Bottenfluisteraar", gender: "female", role: "Bottenfluisteraar", initials: "KB", playStyle: "sneaky", portraitTodo: "dino met bottenketting en slimme glimlach" },
  { name: "Bram Brulbaard", gender: "male", role: "Brulbaard", initials: "BB", playStyle: "aggressive", portraitTodo: "dino met nette baard, sjerp en grote operahouding" },
  { name: "Luna de Tijdlijnkundige", gender: "female", role: "Tijdlijnkundige", initials: "LT", playStyle: "careful", portraitTodo: "dino met sterrenmantel en zandloper" },
  { name: "Otto de Kaartkapitein", gender: "male", role: "Kaartkapitein", initials: "OK", playStyle: "balanced", portraitTodo: "dino met kapiteinspet en stapel kaarten" },
  { name: "Mira de Mosridder", gender: "female", role: "Mosridder", initials: "MM", playStyle: "defensive", portraitTodo: "dino met mosmantel en houten schild" },
  { name: "Puck de Pootafdrukker", gender: "male", role: "Pootafdrukker", initials: "PP", playStyle: "chaotic", portraitTodo: "dino met inktpot en pootafdrukstempels" },
  { name: "Tara de Trucjager", gender: "female", role: "Trucjager", initials: "TT", playStyle: "tricky", portraitTodo: "dino met jagershoedje en kaarttrucs" }
];

function createPlayers(opponentCount) {
  return [
    { id: "player", name: "Jij", color: playerColors[0], isHuman: true },
    ...Array.from({ length: opponentCount }, (_, index) => ({
      ...opponentPersonas[index % opponentPersonas.length],
      id: `pc${index + 1}`,
      color: playerColors[index + 1],
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
  createPlayers
};
})();
