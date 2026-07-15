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
    text: "De volgende speler moet 2 volledige beurten uitvoeren.",
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
    text: "Kies wie 2 volledige beurten moet uitvoeren.",
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
    text: "Beëindig 1 beurt zonder te trekken. Tijdens een aanval vervalt 1 openstaande beurt.",
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
    text: "Bekijk de bovenste 3 kaarten.",
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
    text: "Kies een tegenstander en steel 1 gekozen gesloten kaart.",
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
    text: "Speel als paar. Sla 1 trekbeurt over zonder te trekken.",
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
    text: "Speel als paar. Bekijk bovenste en onderste; kies welke bovenop blijft.",
    kind: "set",
    playable: false,
    turnEffect: "continue",
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
  meteor: { total: 11, compact: 0 },
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

const ruleMetadata = {
  meteor: { timing: "Bij trekken", target: "Jezelf", turn: "Eindigt de beurt", reactable: false, visibility: "Openbaar" },
  shelter: { timing: "Automatisch bij Meteoriet", target: "Jezelf", turn: "Door naar plaatsing", reactable: false, visibility: "Openbaar; positie geheim" },
  raptor: { timing: "Tijdens je beurt", target: "Volgende speler", turn: "Eindigt je beurt", reactable: true, visibility: "Openbaar" },
  targetedRaptor: { timing: "Tijdens je beurt", target: "Gekozen speler", turn: "Eindigt je beurt", reactable: true, visibility: "Openbaar" },
  sprint: { timing: "Tijdens je beurt", target: "Jezelf", turn: "Eindigt één beurt", reactable: true, visibility: "Openbaar" },
  trike: { timing: "Tijdens je beurt", target: "Trekstapel", turn: "Beurt gaat door", reactable: true, visibility: "Resultaat geheim" },
  oracle: { timing: "Tijdens je beurt", target: "Trekstapel", turn: "Beurt gaat door", reactable: true, visibility: "Resultaat geheim" },
  volcano: { timing: "Tijdens je beurt", target: "Trekstapel", turn: "Beurt gaat door", reactable: true, visibility: "Bovenkaart geheim" },
  dig: { timing: "Tijdens je beurt", target: "Trekstapel", turn: "Eindigt na trek", reactable: true, visibility: "Resultaat geheim" },
  fossil: { timing: "Tijdens je beurt", target: "Speler met kaarten", turn: "Beurt gaat door", reactable: true, visibility: "Overdracht geheim" },
  nope: { timing: "Tijdens reactievenster", target: "Zichtbare actie", turn: "Verandert beurt niet", reactable: false, visibility: "Openbaar" },
  feral: { timing: "Als deel van een paar", target: "Soortbeloning", turn: "Volgens soort", reactable: false, visibility: "Openbaar" },
  miniRaptor: { timing: "Speel als paar", target: "Speler met kaarten", turn: "Beurt gaat door", reactable: false, visibility: "Overdracht geheim" },
  stegoSnack: { timing: "Speel als paar", target: "Aflegstapel", turn: "Beurt gaat door", reactable: false, visibility: "Keuze openbaar" },
  brontoBuik: { timing: "Speel als paar", target: "Trekstapel", turn: "Beurt gaat door", reactable: false, visibility: "Bovenkaart geheim" },
  triceraTuk: { timing: "Speel als paar", target: "Jezelf", turn: "Eindigt één beurt", reactable: false, visibility: "Openbaar" },
  pteroPret: { timing: "Speel als paar", target: "Trekstapel", turn: "Beurt gaat door", reactable: false, visibility: "Keuze geheim" }
};

Object.entries(ruleMetadata).forEach(([type, rules]) => {
  const turnIcon = /Eindigt|eindigt/.test(rules.turn) ? "turn-end" : "turn-continue";
  const icons = [turnIcon, ...(type === "meteor" || type === "dig" ? ["draw"] : []), ...(rules.reactable ? ["reaction"] : [])];
  cardCatalog[type].rules = Object.freeze({ ...rules, icons: Object.freeze(icons) });
});

// Artwork focus is data-driven so every illustration can be tuned without
// adding view-specific selectors. A design may later override one image via
// `design.crops[imagePath]` while its other variants inherit this type crop.
const cardArtworkCrops = {
  meteor: { default: "53% 58%", large: "53% 54%" },
  shelter: { default: "50% 61%", large: "50% 56%" },
  raptor: { default: "52% 56%", large: "52% 50%" },
  targetedRaptor: { default: "45% 63%", large: "46% 55%" },
  sprint: { default: "57% 64%", large: "56% 58%" },
  trike: { default: "50% 48%", large: "50% 45%" },
  oracle: { default: "50% 52%", large: "50% 50%" },
  volcano: { default: "50% 42%", large: "50% 43%" },
  dig: { default: "50% 58%", large: "50% 56%" },
  fossil: { default: "54% 48%", large: "54% 46%" },
  nope: { default: "47% 46%", large: "48% 45%" },
  feral: { default: "50% 45%", large: "50% 43%" },
  miniRaptor: { default: "52% 66%", large: "52% 58%" },
  stegoSnack: { default: "49% 64%", large: "50% 54%" },
  brontoBuik: { default: "50% 57%", large: "50% 50%" },
  triceraTuk: { default: "50% 58%", large: "50% 54%" },
  pteroPret: { default: "50% 43%", large: "50% 45%" }
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
  const crop = design.crops?.[image] ?? design.crop ?? cardArtworkCrops[type];

  return {
    ...design,
    image,
    images,
    crop
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
  ruleMetadata,
  buildCardPool,
  deckModeForPlayers,
  makeCard,
  resolveDesign,
  shuffle
};
globalThis.ExplodingDinosCards = ExplodingDinosCards;
if (typeof module !== "undefined" && module.exports) module.exports = ExplodingDinosCards;
})();
