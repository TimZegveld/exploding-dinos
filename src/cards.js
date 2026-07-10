const cardCatalog = {
  meteor: {
    name: "Meteorietinslag",
    text: "Trek je deze zonder Schuilgrot, dan ben je uitgeschakeld.",
    kind: "danger",
    playable: false
  },
  shelter: {
    name: "Schuilgrot",
    text: "Redt je automatisch van een Meteorietinslag.",
    kind: "defuse",
    playable: false
  },
  raptor: {
    name: "Raptor Aanval",
    text: "Het doelwit moet nu 2 kaarten trekken.",
    kind: "action",
    playable: true
  },
  targetedRaptor: {
    name: "Gerichte Raptorjacht",
    text: "Kies wie nu 2 kaarten moet trekken.",
    kind: "action",
    playable: true,
    design: {
      tone: "targeted-raptor",
      icon: "claw",
      image: "assets/cards/illustrations/targeted-raptor-hunt.jpg"
    }
  },
  sprint: {
    name: "Dino Sprint",
    text: "Sla je beurt over. Bij extra beurten sprint je er 1 extra kwijt.",
    kind: "action",
    playable: true,
    design: {
      tone: "sprint",
      icon: "speed",
      image: "assets/cards/illustrations/dino-sprint.jpg"
    }
  },
  trike: {
    name: "Triceratops Blik",
    text: "Bekijk de bovenste 3 kaarten van de trekstapel.",
    kind: "action",
    playable: true
  },
  oracle: {
    name: "Tijdlijn Kneden",
    text: "Bekijk de bovenste 3 kaarten en leg ze terug in jouw volgorde.",
    kind: "action",
    playable: true,
    design: {
      tone: "oracle",
      icon: "timeline",
      image: "assets/cards/illustrations/oracle-timeline.jpg"
    }
  },
  volcano: {
    name: "Vulkaan Shuffle",
    text: "Schud de trekstapel en bekijk daarna de bovenste kaart.",
    kind: "action",
    playable: true,
    design: {
      tone: "volcano",
      icon: "volcano",
      image: "assets/cards/illustrations/volcano-shuffle.png"
    }
  },
  dig: {
    name: "Diep Graven",
    text: "Bekijk onderop. Neem die kaart, of trek blind van boven.",
    kind: "action",
    playable: true,
    design: {
      tone: "dig",
      icon: "dig",
      image: "assets/cards/illustrations/diep-graven.png"
    }
  },
  fossil: {
    name: "Fossielgraaier",
    text: "Kies een gesloten kaart van de ander en steel die.",
    kind: "action",
    playable: true,
    design: {
      tone: "fossil",
      icon: "fossil",
      image: "assets/cards/illustrations/fossil-grazer.jpg"
    }
  },
  nope: {
    name: "Brul Terug",
    text: "Reageer op een actiekaart van de ander en blokkeer die.",
    kind: "action",
    playable: false,
    design: {
      tone: "nope",
      icon: "roar",
      image: "assets/cards/illustrations/brul-terug-roar.jpg"
    }
  },
  feral: {
    name: "Wilde Dino",
    text: "Joker voor dino-soortkaarten. Activeert de andere soortbeloning.",
    kind: "set",
    playable: false
  },
  miniRaptor: {
    name: "Mini-Raptor",
    text: "Speel als paar. Kies een doelwit en steel snel 1 willekeurige kaart.",
    kind: "set",
    playable: false,
    design: {
      tone: "mini-raptor",
      icon: "claw",
      image: "assets/cards/illustrations/mini-raptor-quick-steal.png"
    }
  },
  stegoSnack: {
    name: "Stego Snack",
    text: "Speel als paar. Neem 1 oudere niet-meteor kaart terug uit de aflegstapel.",
    kind: "set",
    playable: false,
    design: {
      tone: "stego-snack",
      icon: "leaf",
      image: "assets/cards/illustrations/stego-snack-discard.png"
    }
  },
  brontoBuik: {
    name: "Bronto Buik",
    text: "Speel als paar. Bekijk bovenop; laat liggen of schuif onderop.",
    kind: "set",
    playable: false
  },
  triceraTuk: {
    name: "Tricera-Tuk",
    text: "Soortkaart. Speel 2 dezelfde als paar om te stelen.",
    kind: "set",
    playable: false
  },
  pteroPret: {
    name: "Ptero Pret",
    text: "Soortkaart. Speel 2 dezelfde als paar om te stelen.",
    kind: "set",
    playable: false
  }
};

const partyPackDistribution = {
  meteor: { total: 9, paw: 0 },
  shelter: { total: 10, paw: 3 },
  raptor: { total: 5, paw: 2 },
  targetedRaptor: { total: 5, paw: 2 },
  sprint: { total: 10, paw: 4 },
  trike: { total: 6, paw: 3 },
  oracle: { total: 6, paw: 2 },
  volcano: { total: 6, paw: 2 },
  dig: { total: 7, paw: 3 },
  fossil: { total: 6, paw: 2 },
  nope: { total: 9, paw: 4 },
  feral: { total: 6, paw: 2 },
  miniRaptor: { total: 7, paw: 3 },
  stegoSnack: { total: 7, paw: 3 },
  brontoBuik: { total: 7, paw: 3 },
  triceraTuk: { total: 7, paw: 3 },
  pteroPret: { total: 7, paw: 3 }
};

function makeCard(type, hasPaw = false) {
  return {
    id: crypto.randomUUID(),
    type,
    hasPaw,
    ...cardCatalog[type]
  };
}

function shuffle(cards) {
  const copy = [...cards];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function deckModeForPlayers(players) {
  if (players <= 3) return "paw";
  if (players <= 7) return "standard";
  return "full";
}

function buildCardPool(playerCount) {
  const mode = deckModeForPlayers(playerCount);
  const cards = [];

  Object.entries(partyPackDistribution).forEach(([type, counts]) => {
    if (type === "meteor" || type === "shelter") return;

    const copies = mode === "paw"
      ? counts.paw
      : mode === "standard"
        ? counts.total - counts.paw
        : counts.total;

    for (let index = 0; index < copies; index += 1) {
      cards.push(makeCard(type, mode === "paw"));
    }
  });

  return shuffle(cards);
}

globalThis.ExplodingDinosCards = {
  cardCatalog,
  partyPackDistribution,
  buildCardPool,
  deckModeForPlayers,
  makeCard,
  shuffle
};
