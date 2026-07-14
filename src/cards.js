(() => {
const cardCatalog = {
  meteor: {
    name: "Meteorietinslag",
    text: "Trek je deze zonder Schuilgrot, dan ben je uitgeschakeld.",
    kind: "danger",
    playable: false,
    turnEffect: "none",
    design: {
      tone: "meteor",
      icon: "impact",
      image: "assets/cards/illustrations/meteor-impact.png"
    }
  },
  shelter: {
    name: "Schuilgrot",
    text: "Redt je automatisch van een Meteorietinslag.",
    kind: "defuse",
    playable: false,
    turnEffect: "none",
    design: {
      tone: "shelter",
      icon: "cave",
      image: "assets/cards/illustrations/schuilgrot-shelter.png"
    }
  },
  raptor: {
    name: "Raptor Aanval",
    text: "De volgende speler moet nu 2 kaarten trekken.",
    kind: "action",
    playable: true,
    turnEffect: "endTurn",
    design: {
      tone: "raptor",
      icon: "claw",
      image: "assets/cards/illustrations/raptor-aanval.png"
    }
  },
  targetedRaptor: {
    name: "Gerichte Raptorjacht",
    text: "Kies wie nu 2 kaarten moet trekken.",
    kind: "action",
    playable: true,
    turnEffect: "endTurn",
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
    turnEffect: "skipTurn",
    design: {
      tone: "sprint",
      icon: "speed",
      image: "assets/cards/illustrations/dino-sprint.jpg"
    }
  },
  trike: {
    name: "Triceratops Blik",
    text: "Bekijk de bovenste 3. Meteorietinslag en Schuilgrot worden gemeld.",
    kind: "action",
    playable: true,
    turnEffect: "continue",
    design: {
      tone: "trike",
      icon: "timeline",
      image: "assets/cards/illustrations/triceratops-blik-peek.png"
    }
  },
  oracle: {
    name: "Tijdlijn Kneden",
    text: "Bekijk de bovenste 3 kaarten en leg ze terug in jouw volgorde.",
    kind: "action",
    playable: true,
    turnEffect: "continue",
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
    turnEffect: "continue",
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
    turnEffect: "continue",
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
    turnEffect: "continue",
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
    turnEffect: "none",
    design: {
      tone: "nope",
      icon: "roar",
      image: "assets/cards/illustrations/brul-terug-roar.jpg"
    }
  },
  feral: {
    name: "Wilde Dino",
    text: "Joker voor een soortpaar. Activeert de volledige beloning van de andere soortkaart.",
    kind: "set",
    playable: false,
    turnEffect: "continue",
    design: {
      tone: "feral",
      icon: "claw",
      image: "assets/cards/illustrations/wilde-dino-joker.png",
      images: [
        "assets/cards/illustrations/wilde-dino-joker.png",
        "assets/cards/illustrations/wilde-dino-chameleon-chaos.png",
        "assets/cards/illustrations/wilde-dino-feather-storm.png"
      ]
    }
  },
  miniRaptor: {
    name: "Mini-Raptor",
    text: "Speel als paar. Kies een doelwit en steel snel 1 willekeurige kaart.",
    kind: "set",
    playable: false,
    turnEffect: "continue",
    design: {
      tone: "mini-raptor",
      icon: "claw",
      image: "assets/cards/illustrations/mini-raptor-quick-steal.png",
      images: [
        "assets/cards/illustrations/mini-raptor-quick-steal.png",
        "assets/cards/illustrations/mini-raptor-mossy-getaway.png",
        "assets/cards/illustrations/mini-raptor-feather-flash.png",
        "assets/cards/illustrations/mini-raptor-bone-snatch.png"
      ]
    }
  },
  stegoSnack: {
    name: "Stego Snack",
    text: "Speel als paar. Neem 1 oudere niet-meteor kaart terug uit de aflegstapel.",
    kind: "set",
    playable: false,
    turnEffect: "continue",
    design: {
      tone: "stego-snack",
      icon: "leaf",
      image: "assets/cards/illustrations/stego-snack-discard.png",
      images: [
        "assets/cards/illustrations/stego-snack-discard.png",
        "assets/cards/illustrations/stego-snack-fern-salad.png",
        "assets/cards/illustrations/stego-snack-moonlit-munch.png"
      ]
    }
  },
  brontoBuik: {
    name: "Bronto Buik",
    text: "Speel als paar. Bekijk bovenop; laat liggen of schuif onderop.",
    kind: "set",
    playable: false,
    turnEffect: "continue",
    design: {
      tone: "bronto-buik",
      icon: "leaf",
      image: "assets/cards/illustrations/bronto-buik-belly-card.png",
      images: [
        "assets/cards/illustrations/bronto-buik-belly-card.png",
        "assets/cards/illustrations/bronto-buik-belly-bridge.png",
        "assets/cards/illustrations/bronto-buik-cloud-gazer.png"
      ]
    }
  },
  triceraTuk: {
    name: "Tricera-Tuk",
    text: "Speel als paar. Tuk 1 open beurt weg zonder te trekken.",
    kind: "set",
    playable: false,
    turnEffect: "skipTurn",
    design: {
      tone: "tricera-tuk",
      icon: "leaf",
      image: "assets/cards/illustrations/tricera-tuk-sleep.png",
      images: [
        "assets/cards/illustrations/tricera-tuk-sleep.png",
        "assets/cards/illustrations/tricera-tuk-hammock-horns.png",
        "assets/cards/illustrations/tricera-tuk-mud-nap.png"
      ]
    }
  },
  pteroPret: {
    name: "Ptero Pret",
    text: "Speel als paar. Leg van de bovenste 2 één bovenop en één onderop. Einde beurt.",
    kind: "set",
    playable: false,
    turnEffect: "endTurn",
    design: {
      tone: "ptero-pret",
      icon: "speed",
      image: "assets/cards/illustrations/ptero-pret-sky-sort.png",
      images: [
        "assets/cards/illustrations/ptero-pret-sky-sort.png",
        "assets/cards/illustrations/ptero-pret-cliff-dive.png",
        "assets/cards/illustrations/ptero-pret-gust-loop.png"
      ]
    }
  }
};

const partyPackDistribution = {
  meteor: { total: 9, compact: 0 },
  shelter: { total: 10, compact: 3 },
  raptor: { total: 5, compact: 2 },
  targetedRaptor: { total: 5, compact: 2 },
  sprint: { total: 10, compact: 4 },
  trike: { total: 6, compact: 3 },
  oracle: { total: 6, compact: 2 },
  volcano: { total: 6, compact: 2 },
  dig: { total: 7, compact: 3 },
  fossil: { total: 6, compact: 2 },
  nope: { total: 9, compact: 4 },
  feral: { total: 6, compact: 2 },
  miniRaptor: { total: 7, compact: 3 },
  stegoSnack: { total: 7, compact: 3 },
  brontoBuik: { total: 7, compact: 3 },
  triceraTuk: { total: 7, compact: 3 },
  pteroPret: { total: 7, compact: 3 }
};

const CARD_VARIANT_REPEAT_LIMIT = 1;

function getDesignImages(type) {
  const design = cardCatalog[type]?.design;
  if (!design) return [];

  if (Array.isArray(design.images) && design.images.length > 0) {
    return design.images;
  }

  return design.image ? [design.image] : [];
}

function resolveDesign(type, variantIndex = 0) {
  const design = cardCatalog[type]?.design;
  if (!design) return undefined;

  const images = getDesignImages(type);
  const image = images.length > 0
    ? images[Math.abs(variantIndex) % images.length]
    : design.image;

  return {
    ...design,
    image,
    images
  };
}

function createCardVariantTracker() {
  const nextVariantByType = {};

  return {
    next(type) {
      const images = getDesignImages(type);
      if (images.length <= 1) {
        return 0;
      }

      const next = nextVariantByType[type] ?? 0;
      nextVariantByType[type] = next + 1;

      return Math.floor(next / CARD_VARIANT_REPEAT_LIMIT) % images.length;
    }
  };
}

function makeCard(type, isCompact = false, variantIndex = 0) {
  const catalogCard = cardCatalog[type];

  return {
    id: crypto.randomUUID(),
    type,
    isCompact,
    ...catalogCard,
    design: resolveDesign(type, variantIndex)
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
  if (players <= 3) return "compact";
  if (players <= 7) return "standard";
  return "full";
}

function buildCardPool(playerCount) {
  const mode = deckModeForPlayers(playerCount);
  const cards = [];
  const variants = createCardVariantTracker();

  Object.entries(partyPackDistribution).forEach(([type, counts]) => {
    if (type === "meteor" || type === "shelter") return;

    const copies = mode === "compact"
      ? counts.compact
      : mode === "standard"
        ? counts.total - counts.compact
        : counts.total;

    for (let index = 0; index < copies; index += 1) {
      cards.push(makeCard(type, mode === "compact", variants.next(type)));
    }
  });

  return shuffle(cards);
}

const ExplodingDinosCards = {
  cardCatalog,
  partyPackDistribution,
  buildCardPool,
  deckModeForPlayers,
  makeCard,
  resolveDesign,
  shuffle
};
globalThis.ExplodingDinosCards = ExplodingDinosCards;
if (typeof module !== "undefined" && module.exports) module.exports = ExplodingDinosCards;
})();
