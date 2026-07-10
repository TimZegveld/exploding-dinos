const MIN_OPPONENTS = 1;
const MAX_OPPONENTS = 4;
const DEFAULT_OPPONENTS = 1;
const playerColors = ["#2f7d4f", "#d45d32", "#2d6f9f", "#b36a22", "#7a56a6"];
const opponentNames = ["Rex", "Nova", "Kiki", "Bram"];
const RAPTOR_TURN_LOAD = 2;

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
    text: "Eindig je beurt. De ander neemt straks 2 beurten.",
    kind: "action",
    playable: true
  },
  targetedRaptor: {
    name: "Gerichte Raptorjacht",
    text: "Kies je doelwit. Die speler neemt straks 2 beurten.",
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
    text: "Soortkaart. Speel 2 dezelfde als paar om te stelen.",
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

const initialState = {
  players: [],
  hands: {},
  deck: [],
  discard: [],
  current: "player",
  pendingTurns: {},
  eliminated: {},
  activity: null,
  pendingDraw: null,
  pendingMeteorPlacement: null,
  pendingOracle: null,
  pendingDigChoice: null,
  pendingFossilChoice: null,
  pendingDiscardChoice: null,
  pendingStealTarget: null,
  pendingNopeReaction: null,
  pendingAttackReaction: null,
  pendingRaptorTarget: null,
  pendingCardDetail: null,
  gameOver: false
};

let state = structuredClone(initialState);
let activeReveal = null;

const els = {
  turnStatus: document.querySelector("#turnStatus"),
  opponents: document.querySelector("#opponents"),
  deckCount: document.querySelector("#deckCount"),
  discardTop: document.querySelector("#discardTop"),
  playerHint: document.querySelector("#playerHint"),
  playerHand: document.querySelector("#playerHand"),
  drawButton: document.querySelector("#drawButton"),
  newGameButton: document.querySelector("#newGameButton"),
  opponentCount: document.querySelector("#opponentCount"),
  actionText: document.querySelector("#actionText"),
  gameLog: document.querySelector("#gameLog"),
  drawReveal: document.querySelector("#drawReveal"),
  revealEyebrow: document.querySelector("#revealEyebrow"),
  revealCard: document.querySelector("#revealCard"),
  revealText: document.querySelector("#revealText"),
  revealButton: document.querySelector("#revealButton"),
  revealSecondaryButton: document.querySelector("#revealSecondaryButton"),
  placementControls: document.querySelector("#placementControls"),
  placementSelect: document.querySelector("#placementSelect"),
  placementHint: document.querySelector("#placementHint")
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
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildCardPool(playerCount) {
  const mode = deckModeForPlayers(playerCount);
  const cards = [];

  Object.entries(partyPackDistribution).forEach(([type, counts]) => {
    if (type === "meteor" || type === "shelter") return;

    const amount = mode === "paw"
      ? counts.paw
      : mode === "standard"
        ? counts.total - counts.paw
        : counts.total;

    for (let i = 0; i < amount; i += 1) {
      cards.push(makeCard(type, mode === "paw"));
    }
  });

  return shuffle(cards);
}

function deckModeForPlayers(players) {
  if (players <= 3) return "paw";
  if (players <= 7) return "standard";
  return "full";
}

function getOpponentCount() {
  const selected = Number(els.opponentCount?.value ?? DEFAULT_OPPONENTS);
  return Math.max(MIN_OPPONENTS, Math.min(MAX_OPPONENTS, selected));
}

function createPlayers(opponentCount) {
  return [
    { id: "player", name: "Jij", color: playerColors[0], isHuman: true },
    ...Array.from({ length: opponentCount }, (_, index) => ({
      id: `pc${index + 1}`,
      name: opponentNames[index] ?? `Dino ${index + 1}`,
      color: playerColors[index + 1],
      isHuman: false,
      profile: {
        playStyle: "balanced"
      }
    }))
  ];
}

function startGame() {
  const opponentCount = getOpponentCount();
  const players = createPlayers(opponentCount);
  const playerCount = players.length;

  state = structuredClone(initialState);
  state.players = players;
  state.hands = Object.fromEntries(players.map((player) => [player.id, [makeCard("shelter", true)]]));
  state.pendingTurns = Object.fromEntries(players.map((player) => [player.id, 1]));
  state.eliminated = Object.fromEntries(players.map((player) => [player.id, false]));
  state.current = "player";
  activeReveal = null;
  els.gameLog.replaceChildren();

  const pool = buildCardPool(playerCount);

  for (let i = 0; i < 7; i += 1) {
    players.forEach((player) => {
      const card = pool.pop();
      if (card) state.hands[player.id].push(card);
    });
  }

  const mode = deckModeForPlayers(playerCount);
  const shelterCount = mode === "paw"
    ? partyPackDistribution.shelter.paw
    : mode === "standard"
      ? partyPackDistribution.shelter.total - partyPackDistribution.shelter.paw
      : partyPackDistribution.shelter.total;
  const extraDefuses = Math.max(0, shelterCount - playerCount);
  const meteors = Math.max(1, playerCount - 1);
  const drawPile = [
    ...pool,
    ...Array.from({ length: extraDefuses }, () => makeCard("shelter", mode === "paw")),
    ...Array.from({ length: meteors }, () => makeCard("meteor", false))
  ];

  state.deck = shuffle(drawPile);

  log(`Nieuw Party Pack spel gestart met ${playerCount} spelers.`);
  log(`Stapel bevat ${meteors} Meteorietinslag en ${extraDefuses} extra Schuilgrot.`);
  setAction("Speel actiekaarten, maak paren met soortkaarten, of trek om je beurt te eindigen.");
  render();
}

function log(message) {
  const li = document.createElement("li");
  li.textContent = message;
  els.gameLog.append(li);
  while (els.gameLog.children.length > 22) {
    els.gameLog.removeChild(els.gameLog.firstElementChild);
  }
}

function setAction(message) {
  els.actionText.textContent = message;
}

function render() {
  const currentPlayer = getPlayer(state.current);
  const playerZone = document.querySelector(".player-zone");
  const playerColor = getPlayer("player")?.color ?? playerColors[0];

  els.turnStatus.textContent = state.gameOver
    ? "Spel afgelopen"
    : state.current === "player"
      ? "Jouw beurt"
      : `${currentPlayer?.name ?? "PC"} denkt na`;
  els.turnStatus.style.setProperty("--player-color", currentPlayer?.color ?? playerColor);

  els.deckCount.textContent = state.deck.length;
  els.discardTop.textContent = state.discard.at(-1)?.name ?? "Nog leeg";
  els.playerHint.textContent = state.eliminated.player
    ? "Uitgeschakeld"
    : state.current === "player" && !state.gameOver
      ? `${state.pendingTurns.player} beurt(en) open`
      : "Wacht op de pc";
  els.drawButton.disabled = state.current !== "player" || state.gameOver || isInteractionBlocked();
  playerZone.style.setProperty("--player-color", playerColor);
  playerZone.classList.toggle("is-current", state.current === "player" && !state.gameOver);
  playerZone.classList.toggle("is-acting", state.activity?.owner === "player");

  renderOpponents();
  renderPlayerHand();
  renderReveal();
}

function renderOpponents() {
  els.opponents.replaceChildren();
  state.players.filter((player) => !player.isHuman).forEach((player) => {
    const seat = document.createElement("section");
    seat.className = "opponent-seat";
    seat.style.setProperty("--player-color", player.color);
    seat.classList.toggle("is-current", state.current === player.id && !state.gameOver);
    seat.classList.toggle("is-acting", state.activity?.owner === player.id);
    seat.classList.toggle("is-eliminated", state.eliminated[player.id]);

    const labelWrap = document.createElement("div");
    labelWrap.className = "player-label";

    const name = document.createElement("span");
    name.textContent = player.name;

    const count = document.createElement("strong");
    count.textContent = state.eliminated[player.id]
      ? "Uitgeschakeld"
      : `${getHand(player.id).length} kaarten`;

    const hand = document.createElement("div");
    hand.className = "pc-hand";
    getHand(player.id).forEach(() => {
      const card = document.createElement("div");
      card.className = "card-back";
      card.setAttribute("aria-label", `Gesloten kaart van ${player.name}`);
      hand.append(card);
    });

    labelWrap.append(name, count);
    seat.append(labelWrap, hand);
    els.opponents.append(seat);
  });
}

function renderPlayerHand() {
  els.playerHand.replaceChildren();
  getHand("player").forEach((card) => {
    const button = document.createElement("button");
    button.className = "card-button";
    button.type = "button";
    button.dataset.kind = card.kind;
    const canPlay = canPlayCard("player", card);
    button.setAttribute("aria-disabled", String(!canPlay));
    button.disabled = state.gameOver || state.eliminated.player || isHandClickBlocked();
    renderCardFace(button, card);
    button.addEventListener("click", () => inspectPlayerCard(card.id));
    els.playerHand.append(button);
  });
}

function renderReveal() {
  const pendingCardDetail = state.pendingCardDetail;
  const pendingPlacement = state.pendingMeteorPlacement;
  const pendingOracle = state.pendingOracle;
  const pendingDigChoice = state.pendingDigChoice;
  const pendingFossilChoice = state.pendingFossilChoice;
  const pendingDiscardChoice = state.pendingDiscardChoice;
  const pendingStealTarget = state.pendingStealTarget;
  const pendingNopeReaction = state.pendingNopeReaction;
  const pendingAttackReaction = state.pendingAttackReaction;
  const pendingRaptorTarget = state.pendingRaptorTarget;
  const pendingDraw = state.pendingDraw;
  const revealOwner = pendingDraw?.owner ?? pendingAttackReaction?.actor ?? pendingNopeReaction?.actor ?? pendingRaptorTarget?.owner ?? pendingStealTarget?.owner ?? pendingDiscardChoice?.owner ?? pendingDigChoice?.owner ?? pendingPlacement?.owner ?? pendingCardDetail?.owner ?? activeReveal?.owner;
  els.drawReveal.style.setProperty("--player-color", getPlayer(revealOwner)?.color ?? playerColors[0]);

  if (!pendingCardDetail && !pendingPlacement && !pendingOracle && !pendingDigChoice && !pendingFossilChoice && !pendingDiscardChoice && !pendingStealTarget && !pendingNopeReaction && !pendingAttackReaction && !pendingRaptorTarget && !pendingDraw && !activeReveal) {
    els.drawReveal.classList.add("is-hidden");
    els.placementControls.classList.add("is-hidden");
    els.revealSecondaryButton.classList.add("is-hidden");
    els.revealButton.disabled = false;
    return;
  }

  els.drawReveal.classList.remove("is-hidden");
  els.revealCard.className = "draw-reveal__card";
  els.revealCard.replaceChildren();
  els.placementControls.classList.add("is-hidden");
  els.revealSecondaryButton.classList.add("is-hidden");
  els.revealButton.disabled = false;
  els.revealSecondaryButton.disabled = false;

  if (pendingCardDetail) {
    const playable = canPlayInspectedCard(pendingCardDetail.owner, pendingCardDetail.card);
    els.revealEyebrow.textContent = playable ? "Kaart bekijken" : "Kaart bekijken";
    renderOpenRevealCard(pendingCardDetail.card);
    els.revealText.textContent = playable
      ? `${pendingCardDetail.card.name} kan nu gespeeld worden.`
      : `${pendingCardDetail.card.name} kan nu niet gespeeld worden.`;
    els.revealButton.textContent = "Terug";
    els.revealSecondaryButton.textContent = "Spelen";
    els.revealSecondaryButton.disabled = !playable;
    els.revealSecondaryButton.classList.remove("is-hidden");
    return;
  }

  if (activeReveal) {
    els.revealEyebrow.textContent = activeReveal.title;
    if (activeReveal.cards.length === 1 && !activeReveal.faceDown) {
      renderOpenRevealCard(activeReveal.cards[0], activeReveal.shaking);
    } else {
      renderRevealCards(activeReveal.cards, {
        faceDown: activeReveal.faceDown,
        shaking: activeReveal.shaking
      });
    }
    els.revealText.textContent = activeReveal.text;
    els.revealButton.textContent = activeReveal.buttonText ?? "Verder";
    if (activeReveal.secondaryButtonText) {
      els.revealSecondaryButton.textContent = activeReveal.secondaryButtonText;
      els.revealSecondaryButton.disabled = Boolean(activeReveal.secondaryDisabled);
      els.revealSecondaryButton.classList.remove("is-hidden");
    }
    return;
  }

  if (pendingOracle) {
    els.revealEyebrow.textContent = "Tijdlijn Kneden";
    renderOracleCards(pendingOracle);
    els.revealText.textContent = pendingOracle.cards.length
      ? "Leg links de kaart die bovenop moet liggen. Bevestig daarna de nieuwe tijdlijn."
      : "De trekstapel is leeg, dus er valt niets te kneden.";
    els.revealButton.textContent = "Tijdlijn vastleggen";
    return;
  }

  if (pendingDigChoice) {
    els.revealEyebrow.textContent = "Diep Graven";
    renderOpenRevealCard(pendingDigChoice.bottomCard);
    els.revealText.textContent = "Je ziet de onderste kaart. Neem hem om je beurt te eindigen, of laat hem liggen en trek blind van boven.";
    els.revealButton.textContent = "Neem onderste kaart";
    els.revealSecondaryButton.textContent = "Trek van boven";
    els.revealSecondaryButton.classList.remove("is-hidden");
    return;
  }

  if (pendingFossilChoice) {
    els.revealEyebrow.textContent = pendingFossilChoice.title ?? "Fossielgraaier";
    renderFossilChoices(pendingFossilChoice);
    els.revealText.textContent = pendingFossilChoice.cards.length
      ? `Kies een gesloten kaart uit de hand van ${objectLabel(pendingFossilChoice.target)}.`
      : `${label(pendingFossilChoice.target)} heeft geen kaarten om te stelen.`;
    els.revealButton.textContent = pendingFossilChoice.cards.length ? "Kies kaart" : "Verder";
    els.revealButton.disabled = pendingFossilChoice.cards.length > 0;
    return;
  }

  if (pendingDiscardChoice) {
    els.revealEyebrow.textContent = "Stego Snack";
    renderDiscardChoices(pendingDiscardChoice);
    els.revealText.textContent = pendingDiscardChoice.cards.length
      ? "Kies welke oudere kaart de Stego uit de aflegstapel terug snackt."
      : "Er ligt geen oudere niet-meteor kaart klaar voor Stego Snack.";
    els.revealButton.textContent = pendingDiscardChoice.cards.length ? "Kies kaart" : "Verder";
    els.revealButton.disabled = pendingDiscardChoice.cards.length > 0;
    return;
  }

  if (pendingStealTarget) {
    els.revealEyebrow.textContent = pendingStealTarget.title;
    renderTargetChoices(pendingStealTarget);
    els.revealText.textContent = pendingStealTarget.targets.length
      ? "Kies van wie je een gesloten kaart wilt pakken."
      : "Er is niemand met kaarten om van te stelen.";
    els.revealButton.textContent = pendingStealTarget.targets.length ? "Bevestig doelwit" : "Verder";
    els.revealButton.disabled = pendingStealTarget.targets.length > 0 && !pendingStealTarget.selectedTarget;
    return;
  }

  if (pendingAttackReaction) {
    els.revealEyebrow.textContent = "Reageer op aanval";
    renderAttackReactionChoices(pendingAttackReaction);
    els.revealText.textContent = `${label(pendingAttackReaction.actor)} valt ${objectLabel(pendingAttackReaction.target)} aan. Kies een reactie uit je hand, of doe niets.`;
    els.revealButton.textContent = "Niets doen";
    return;
  }

  if (pendingNopeReaction) {
    els.revealEyebrow.textContent = "Brul Terug?";
    renderOpenRevealCard(pendingNopeReaction.card);
    els.revealText.textContent = `${label(pendingNopeReaction.actor)} speelt ${pendingNopeReaction.card.name}. Wil je Brul Terug inzetten om het effect te stoppen?`;
    els.revealButton.textContent = "OK";
    els.revealSecondaryButton.textContent = "Speel Brul Terug";
    els.revealSecondaryButton.classList.remove("is-hidden");
    return;
  }

  if (pendingRaptorTarget) {
    els.revealEyebrow.textContent = "Gerichte Raptorjacht";
    renderRaptorTargetChoices(pendingRaptorTarget);
    els.revealText.textContent = "Kies wie de raptor opjaagt.";
    els.revealButton.textContent = "Bevestig jacht";
    return;
  }

  if (pendingPlacement) {
    const card = pendingPlacement.meteorCard;
    renderOpenRevealCard(card, true);
    els.revealEyebrow.textContent = "Geheime terugplaatsing";
    els.revealText.textContent = "Kies waar de Meteorietinslag teruggaat. Onderin is veiliger voor nu; bovenop is gemeen voor de volgende trek.";
    renderPlacementOptions();
    els.placementControls.classList.remove("is-hidden");
    els.revealButton.textContent = "Stop geheim terug";
    return;
  }

  const { owner, card } = pendingDraw;
  const isMeteor = card.type === "meteor";
  const isVisible = owner === "player" || isMeteor;
  els.revealEyebrow.textContent = `${label(owner)} trekt`;

  if (isVisible) {
    renderOpenRevealCard(card, isMeteor);
  } else {
    els.revealCard.classList.add("is-back");
    els.revealCard.setAttribute("aria-label", "Gesloten dino kaart");
  }

  if (isMeteor) {
    const hasShelter = getHand(owner).some((item) => item.type === "shelter");
    els.revealText.textContent = hasShelter
      ? `${label(owner)} trekt een Meteorietinslag. Schuilgrot kan hem redden.`
      : `${label(owner)} trekt een Meteorietinslag zonder Schuilgrot.`;
    els.revealButton.textContent = owner === "player"
      ? hasShelter ? "Gebruik Schuilgrot" : "Laat ontploffen"
      : "OK";
  } else {
    els.revealText.textContent = owner === "player"
      ? "Lees de kaart rustig. Klik daarna om hem aan je hand toe te voegen."
      : `${label(owner)} trekt een gesloten kaart. De beurt gaat zo verder.`;
    els.revealButton.textContent = owner === "player" ? "Neem kaart in hand" : "OK";
  }

  els.revealButton.disabled = false;
}

function renderOpenRevealCard(card, isShaking = false) {
  els.revealCard.classList.add(`is-${card.kind}`);
  if (isShaking) {
    els.revealCard.classList.add("is-shaking");
  }

  renderCardFace(els.revealCard, card, { large: true });
}

function renderRevealCards(cards, options = {}) {
  els.revealCard.classList.add("is-multi");
  cards.forEach((card) => {
    const item = document.createElement("div");
    item.className = "draw-reveal__mini-card";

    if (options.faceDown) {
      item.classList.add("is-back");
      item.setAttribute("aria-label", "Gesloten dino kaart");
    } else {
      item.classList.add(`is-${card.kind}`);
      if (options.shaking) {
        item.classList.add("is-shaking");
      }

      renderCardFace(item, card, { mini: true });
    }

    els.revealCard.append(item);
  });
}

function renderCardFace(element, card, options = {}) {
  element.dataset.kind = card.kind;
  element.replaceChildren();

  if (!card.design) {
    const title = document.createElement("strong");
    title.textContent = card.name;
    const text = document.createElement("span");
    text.textContent = card.text;
    if (card.hasPaw && !options.hidePaw) {
      text.append(createPawMarker());
    }
    element.append(title, text);
    return;
  }

  element.dataset.tone = card.design.tone;
  element.classList.add("card-face");
  if (options.mini) element.classList.add("card-face--mini");
  if (options.large) element.classList.add("card-face--large");

  const header = document.createElement("div");
  header.className = "card-face__header";

  const title = document.createElement("strong");
  title.className = "card-face__title";
  title.textContent = card.name;

  const icon = document.createElement("span");
  icon.className = "card-face__icon";
  icon.setAttribute("aria-hidden", "true");
  renderCardTypeIcon(icon, card.design.icon);

  header.append(title, icon);

  const art = document.createElement("div");
  art.className = "card-face__art";

  const image = document.createElement("img");
  image.src = card.design.image;
  image.alt = "";
  image.loading = "lazy";
  art.append(image);

  const text = document.createElement("span");
  text.className = "card-face__text";
  text.textContent = card.text;
  if (card.hasPaw && !options.hidePaw) {
    text.append(createPawMarker());
  }

  element.append(header, art, text);
}

function createPawMarker() {
  const marker = document.createElement("span");
  marker.className = "card-paw-marker";
  marker.setAttribute("aria-label", "Dino-poot");
  marker.setAttribute("title", "Dino-poot");

  for (let i = 0; i < 4; i += 1) {
    const toe = document.createElement("span");
    toe.setAttribute("aria-hidden", "true");
    marker.append(toe);
  }

  return marker;
}

function renderCardTypeIcon(icon, type) {
  const supportedIcons = ["claw", "speed", "timeline", "fossil", "roar", "volcano", "dig", "leaf"];
  if (!supportedIcons.includes(type)) {
    icon.textContent = type;
    return;
  }

  icon.classList.add(`card-face__icon--${type}`);
  const parts = type === "claw" ? 3 : type === "speed" ? 4 : type === "leaf" ? 2 : 1;
  for (let i = 0; i < parts; i += 1) {
    icon.append(document.createElement("span"));
  }
}

function renderOracleCards(pendingOracle) {
  els.revealCard.classList.add("is-multi", "is-oracle");
  pendingOracle.cards.forEach((card, index) => {
    const item = document.createElement("div");
    item.className = "draw-reveal__mini-card";
    item.classList.add(`is-${card.kind}`);

    const position = document.createElement("small");
    position.textContent = index === 0 ? "Bovenop" : `Plek ${index + 1}`;

    item.append(position);
    renderCardFace(item, card, { mini: true, hidePaw: true });
    item.prepend(position);

    if (pendingOracle.owner === "player" && pendingOracle.cards.length > 1) {
      const controls = document.createElement("div");
      controls.className = "oracle-controls";

      const leftButton = document.createElement("button");
      leftButton.type = "button";
      leftButton.textContent = "Links";
      leftButton.disabled = index === 0;
      leftButton.addEventListener("click", () => moveOracleCard(index, -1));

      const rightButton = document.createElement("button");
      rightButton.type = "button";
      rightButton.textContent = "Rechts";
      rightButton.disabled = index === pendingOracle.cards.length - 1;
      rightButton.addEventListener("click", () => moveOracleCard(index, 1));

      controls.append(leftButton, rightButton);
      item.append(controls);
    }

    els.revealCard.append(item);
  });
}

function renderFossilChoices(pendingFossilChoice) {
  els.revealCard.classList.add("is-multi", "is-fossil-choice");

  pendingFossilChoice.cards.forEach((card, index) => {
    const button = document.createElement("button");
    button.className = "draw-reveal__mini-card is-back fossil-choice";
    button.type = "button";
    button.textContent = `Kaart ${index + 1}`;
    button.addEventListener("click", () => confirmFossilChoice(index));
    els.revealCard.append(button);
  });
}

function renderDiscardChoices(pendingDiscardChoice) {
  els.revealCard.classList.add("is-multi", "is-discard-choice");

  pendingDiscardChoice.cards.forEach((card, index) => {
    const button = document.createElement("button");
    button.className = "draw-reveal__mini-card";
    button.type = "button";
    button.classList.add(`is-${card.kind}`);
    renderCardFace(button, card, { mini: true });
    button.addEventListener("click", () => confirmDiscardChoice(index));
    els.revealCard.append(button);
  });
}

function renderTargetChoices(pendingStealTarget) {
  els.revealCard.classList.add("is-multi", "is-raptor-target");

  pendingStealTarget.targets.forEach((target) => {
    const button = document.createElement("button");
    button.className = "draw-reveal__mini-card raptor-target";
    button.type = "button";
    button.style.setProperty("--player-color", getPlayer(target)?.color ?? playerColors[0]);
    button.dataset.selected = String(target === pendingStealTarget.selectedTarget);
    button.textContent = `${label(target)} (${getHand(target).length})`;
    button.addEventListener("click", () => selectStealTarget(target));
    els.revealCard.append(button);
  });
}

function renderAttackReactionChoices(pendingAttackReaction) {
  els.revealCard.classList.add("is-multi", "is-attack-reaction");

  getHand("player").forEach((card) => {
    const button = document.createElement("button");
    button.className = "draw-reveal__mini-card";
    button.type = "button";
    button.classList.add(`is-${card.kind}`);
    const playable = canPlayAttackReactionCard(card);
    button.disabled = !playable;
    button.setAttribute("aria-disabled", String(!playable));
    renderCardFace(button, card, { mini: true });
    button.addEventListener("click", () => resolveAttackReactionWithCard(card.id));
    els.revealCard.append(button);
  });
}

function renderRaptorTargetChoices(pendingRaptorTarget) {
  els.revealCard.classList.add("is-multi", "is-raptor-target");

  pendingRaptorTarget.targets.forEach((target) => {
    const button = document.createElement("button");
    button.className = "draw-reveal__mini-card raptor-target";
    button.type = "button";
    button.style.setProperty("--player-color", getPlayer(target)?.color ?? playerColors[0]);
    button.dataset.selected = String(target === pendingRaptorTarget.selectedTarget);
    button.textContent = label(target);
    button.addEventListener("click", () => selectRaptorTarget(target));
    els.revealCard.append(button);
  });
}

function renderPlacementOptions() {
  els.placementSelect.replaceChildren();
  const positions = state.deck.length + 1;

  for (let index = 0; index < positions; index += 1) {
    const option = document.createElement("option");
    option.value = String(index);
    const fromTop = state.deck.length - index + 1;
    if (index === 0) {
      option.textContent = `Onderop (${positions})`;
    } else if (index === state.deck.length) {
      option.textContent = "Bovenop (1)";
    } else {
      option.textContent = `Positie ${fromTop} van boven`;
    }
    els.placementSelect.append(option);
  }

  els.placementSelect.value = String(state.deck.length);
  updatePlacementHint();
}

function updatePlacementHint() {
  const insertAt = Number(els.placementSelect.value);
  const fromTop = state.deck.length - insertAt + 1;
  els.placementHint.textContent = insertAt === state.deck.length
    ? "De volgende speler trekt deze kaart als eerste."
    : insertAt === 0
      ? "De meteoriet gaat helemaal onderop."
      : `De meteoriet komt op plek ${fromTop} van boven.`;
}

function showCardMoment({
  title,
  cards,
  text,
  buttonText = "Verder",
  secondaryButtonText = null,
  secondaryDisabled = false,
  faceDown = false,
  shaking = false,
  owner = null,
  onClose = null,
  onSecondary = null
}) {
  activeReveal = {
    title,
    cards: Array.isArray(cards) ? cards : [cards],
    text,
    buttonText,
    secondaryButtonText,
    secondaryDisabled,
    faceDown,
    shaking,
    owner,
    onClose,
    onSecondary
  };
  render();
}

function closeActiveReveal(useSecondary = false) {
  if (!activeReveal) return;

  const reveal = activeReveal;
  activeReveal = null;
  let callbackResult;
  if (useSecondary && reveal.onSecondary) {
    callbackResult = reveal.onSecondary();
  } else {
    callbackResult = reveal.onClose?.();
  }
  if (callbackResult === false) {
    return;
  }
  render();
  continueAfterPause();
}

function inspectPlayerCard(cardId) {
  if (state.gameOver || state.eliminated.player || isHandClickBlocked()) return;

  const card = getHand("player").find((item) => item.id === cardId);
  if (!card) return;

  state.pendingCardDetail = { owner: "player", card };
  render();
}

function closeCardDetail(playAfterClose = false) {
  const detail = state.pendingCardDetail;
  if (!detail) return;

  state.pendingCardDetail = null;
  if (playAfterClose) {
    playCard(detail.owner, detail.card.id);
    return;
  }

  render();
}

function canPlayInspectedCard(owner, card) {
  return owner === state.current
    && owner === "player"
    && !state.gameOver
    && !state.eliminated[owner]
    && !isGameplayBlockedForPlay()
    && canPlayCard(owner, card);
}

function canPlayCard(owner, card) {
  if (card.playable) return true;
  if (isSetCard(card)) return findPairForCard(getHand(owner), card).length === 2;
  return false;
}

function playCard(owner, cardId) {
  if (state.gameOver || owner !== state.current || isInteractionBlocked()) return;

  const hand = getHand(owner);
  const index = hand.findIndex((card) => card.id === cardId);
  if (index === -1) return;

  const card = hand[index];
  if (!canPlayCard(owner, card)) return;
  if (isSetCard(card)) {
    playSetPair(owner, card);
    return;
  }

  hand.splice(index, 1);
  state.discard.push(card);
  state.activity = { owner, type: "play" };
  log(`${label(owner)} speelt ${card.name}.`);
  const preview = getActionPreview(owner, card);
  const playerCanReactToAttack = owner !== "player" && isAttackCard(card) && preview.target === "player";
  showCardMoment({
    title: `${label(owner)} speelt`,
    cards: card,
    text: preview.text,
    buttonText: "OK",
    owner,
    onClose: () => {
      if (playerCanReactToAttack) {
        startAttackReaction(owner, card, preview.target);
        return false;
      }
      offerNopeReaction(owner, card, { target: preview.target });
    }
  });
}

function getActionPreview(owner, card) {
  const target = chooseDefaultTarget(owner);

  if (card.type === "fossil" && target) {
    return {
      target,
      text: `${label(owner)} speelt ${card.name} op ${objectLabel(target)} en wil een gesloten kaart stelen.`
    };
  }

  if (card.type === "raptor" && target) {
    return {
      target,
      text: `${label(owner)} speelt ${card.name} op ${objectLabel(target)}.`
    };
  }

  if (card.type === "targetedRaptor" && target) {
    return {
      target,
      text: `${label(owner)} speelt ${card.name} op ${objectLabel(target)}.`
    };
  }

  return {
    target: null,
    text: "Klik verder om het effect van deze kaart uit te voeren."
  };
}

function playSetPair(owner, card) {
  const hand = getHand(owner);
  const pair = findPairForCard(hand, card);
  if (pair.length !== 2) return;
  const rewardType = getSetPairRewardType(pair, card);
  const target = chooseStealTarget(owner);
  const pairIds = pair.map((pairCard) => pairCard.id);

  pair.forEach((pairCard) => {
    const index = hand.findIndex((item) => item.id === pairCard.id);
    if (index !== -1) state.discard.push(hand.splice(index, 1)[0]);
  });

  log(`${label(owner)} speelt een paar ${pair.map((item) => item.name).join(" + ")}.`);
  state.activity = { owner, type: "play" };
  showCardMoment({
    title: `${label(owner)} speelt een paar`,
    cards: pair,
    text: getSetPairPreviewText(owner, rewardType, target),
    buttonText: "OK",
    owner,
    onClose: () => startSetPairReward(owner, rewardType, target, pairIds)
  });
}

function getSetPairRewardType(pair, selectedCard) {
  if (selectedCard.type !== "feral") return selectedCard.type;
  return pair.find((item) => item.type !== "feral")?.type ?? "feral";
}

function getSetPairPreviewText(owner, rewardType, target) {
  if (rewardType === "miniRaptor") {
    return target
      ? `${label(owner)} kiest een doelwit en graait daar razendsnel 1 willekeurige kaart.`
      : "Mini-Raptor steelt snel 1 willekeurige kaart, als iemand kaarten heeft.";
  }

  if (rewardType === "stegoSnack") {
    return "Stego Snack neemt 1 oudere niet-meteor kaart terug uit de aflegstapel.";
  }

  return target
    ? `${label(owner)} mag een gesloten kaart van ${objectLabel(target)} pakken.`
    : "Dit paar mag een gesloten kaart van een ander stelen.";
}

function startSetPairReward(owner, rewardType, initialTarget = null, playedPairIds = []) {
  if (rewardType === "miniRaptor") {
    startMiniRaptorSteal(owner, initialTarget);
    return;
  }

  if (rewardType === "stegoSnack") {
    startStegoSnack(owner, playedPairIds);
    return;
  }

  startPairSteal(owner, initialTarget);
}

function findPairForCard(hand, card) {
  if (!isSetCard(card)) return [];

  if (card.type === "feral") {
    const otherSet = hand.find((item) => item.id !== card.id && isSetCard(item));
    return otherSet ? [card, otherSet] : [];
  }

  const same = hand.find((item) => item.id !== card.id && item.type === card.type);
  if (same) return [card, same];

  const feral = hand.find((item) => item.type === "feral");
  return feral ? [card, feral] : [];
}

function resolveCard(owner, card, context = {}) {
  const target = context.target ?? chooseDefaultTarget(owner);

  if (card.type === "sprint") {
    resolveSprint(owner);
    return;
  }

  if (card.type === "raptor") {
    if (!target) return;
    resolveRaptorAttack(owner, target, context.attackLoad ?? RAPTOR_TURN_LOAD);
    return;
  }

  if (card.type === "targetedRaptor") {
    if (context.target) {
      resolveRaptorTarget(owner, context.target, context.attackLoad ?? RAPTOR_TURN_LOAD);
      return;
    }
    chooseRaptorTarget(owner, context.attackLoad ?? RAPTOR_TURN_LOAD);
    return;
  }

  if (card.type === "trike") {
    const peek = state.deck.slice(-3).reverse();
    const text = peek.length
      ? `Bovenop liggen: ${peek.map((item) => item.name).join(", ")}.`
      : "De trekstapel is leeg.";
    showCardMoment({
      title: "Triceratops Blik",
      cards: peek,
      text: owner === "player" ? text : `${label(owner)} bekijkt de bovenste 3 kaarten.`,
      buttonText: "OK",
      faceDown: owner !== "player",
      owner
    });
    return;
  }

  if (card.type === "oracle") {
    alterFuture(owner);
    return;
  }

  if (card.type === "volcano") {
    eruptVolcano(owner);
    return;
  }

  if (card.type === "dig") {
    startDigChoice(owner);
    return;
  }

  if (card.type === "fossil") {
    if (!target) return;
    stealFossilCard(owner, target);
    return;
  }
}

function offerNopeReaction(actor, card, context = {}) {
  const reactor = chooseNopeReactor(actor, { skipPlayer: context.skipPlayer });
  if (!reactor) {
    resolveCard(actor, card, context);
    return;
  }
  const nopeCard = getHand(reactor).find((item) => item.type === "nope");

  if (!canReactWithNope(card) || !nopeCard) {
    resolveCard(actor, card, context);
    return;
  }

  if (reactor !== "player") {
    state.pendingNopeReaction = { actor, reactor, card, nopeCardId: nopeCard.id, context };
    const shouldBlock = choosePcNopeReaction(card);
    if (shouldBlock) {
      resolveNopeReaction(true);
      return;
    }

    log(`${label(reactor)} houdt Brul Terug vast.`);
    resolveNopeReaction(false);
    return;
  }

  state.pendingNopeReaction = { actor, reactor, card, nopeCardId: nopeCard.id, context };
  setAction(`${label(actor)} speelt ${card.name}. Je kunt reageren met Brul Terug.`);
  render();
}

function startAttackReaction(actor, card, target) {
  const currentLoad = Math.max(RAPTOR_TURN_LOAD, state.pendingTurns[target] ?? 1);
  state.pendingAttackReaction = {
    actor,
    card,
    target,
    attackLoad: currentLoad,
    context: { target, attackLoad: currentLoad }
  };
  setAction(`${label(actor)} valt je aan. Kies een reactie uit je hand of doe niets.`);
  render();
}

function resolveAttackReactionWithCard(cardId) {
  const pending = state.pendingAttackReaction;
  if (!pending) return;

  const hand = getHand("player");
  const index = hand.findIndex((card) => card.id === cardId);
  if (index === -1) return;

  const card = hand[index];
  if (!canPlayAttackReactionCard(card)) return;

  const [reactionCard] = hand.splice(index, 1);
  state.discard.push(reactionCard);
  state.activity = { owner: "player", type: "play" };
  state.pendingAttackReaction = null;

  if (reactionCard.type === "nope") {
    log(`Jij blokkeert ${pending.card.name} met Brul Terug.`);
    setAction(`${pending.card.name} is weggebruld voordat het effect begon.`);
    render();
    continueAfterPause();
    return;
  }

  const shiftedLoad = pending.attackLoad + RAPTOR_TURN_LOAD;
  log(`Jij schuift de aanval terug met ${reactionCard.name}.`);
  showCardMoment({
    title: "Tegenaanval",
    cards: reactionCard,
    text: `De aanval schuift naar ${objectLabel(pending.actor)}. Die moet straks ${shiftedLoad} beurten overleven.`,
    buttonText: "OK",
    owner: "player",
    onClose: () => resolveRaptorAttack(pending.actor, pending.actor, shiftedLoad)
  });
}

function resolveAttackReactionWithoutCard() {
  const pending = state.pendingAttackReaction;
  if (!pending) return;

  state.pendingAttackReaction = null;
  offerNopeReaction(pending.actor, pending.card, { ...pending.context, skipPlayer: true });
  render();
}

function canReactWithNope(card) {
  return card.playable && card.type !== "nope";
}

function isAttackCard(card) {
  return card.type === "raptor" || card.type === "targetedRaptor";
}

function canPlayAttackReactionCard(card) {
  return card.type === "nope" || isAttackCard(card);
}

function choosePcNopeReaction(card) {
  if (card.type === "trike" || card.type === "volcano") return Math.random() < 0.28;
  if (card.type === "sprint") return Math.random() < 0.42;
  return Math.random() < 0.68;
}

function resolvePlayerNopeReaction(actor, card, nopeCardId) {
  if (!nopeCardId) {
    offerNopeReaction(actor, card, { skipPlayer: true });
    return;
  }

  state.pendingNopeReaction = { actor, reactor: "player", card, nopeCardId };
  resolveNopeReaction(true);
  return false;
}

function resolveNopeReaction(useNope) {
  const pending = state.pendingNopeReaction;
  if (!pending) return;

  state.pendingNopeReaction = null;

  if (!useNope) {
    resolveCard(pending.actor, pending.card, pending.context);
    render();
    continueAfterPause();
    return;
  }

  const hand = getHand(pending.reactor);
  const index = hand.findIndex((card) => card.id === pending.nopeCardId);
  if (index === -1) {
    resolveCard(pending.actor, pending.card, pending.context);
    render();
    continueAfterPause();
    return;
  }

  const [nopeCard] = hand.splice(index, 1);
  state.discard.push(nopeCard);
  log(`${label(pending.reactor)} blokkeert ${pending.card.name} met Brul Terug.`);
  setAction(`${pending.card.name} is weggebruld voordat het effect begon.`);
  render();
  continueAfterPause();
}

function chooseRaptorTarget(owner, attackLoad = RAPTOR_TURN_LOAD) {
  const targets = activeOpponentsOf(owner);
  if (targets.length === 0) return;

  if (owner !== "player") {
    resolveRaptorTarget(owner, choosePcTarget(owner, targets), attackLoad);
    return;
  }

  state.pendingRaptorTarget = {
    owner,
    targets,
    selectedTarget: targets[0],
    attackLoad
  };
  setAction("Gerichte Raptorjacht laat je eerst bewust een doelwit aanwijzen.");
  render();
}

function selectRaptorTarget(target) {
  const pendingRaptorTarget = state.pendingRaptorTarget;
  if (!pendingRaptorTarget || !pendingRaptorTarget.targets.includes(target)) return;

  pendingRaptorTarget.selectedTarget = target;
  render();
}

function confirmRaptorTarget() {
  const pendingRaptorTarget = state.pendingRaptorTarget;
  if (!pendingRaptorTarget) return;

  state.pendingRaptorTarget = null;
  resolveRaptorTarget(pendingRaptorTarget.owner, pendingRaptorTarget.selectedTarget, pendingRaptorTarget.attackLoad);
  render();
  continueAfterPause();
}

function resolveRaptorTarget(owner, target, attackLoad = RAPTOR_TURN_LOAD) {
  if (!target || state.eliminated[target]) return;
  resolveRaptorAttack(owner, target, attackLoad);
  log(`${label(owner)} stuurt de raptor op ${objectLabel(target)} af.`);
}

function resolveRaptorAttack(owner, target, attackLoad = RAPTOR_TURN_LOAD) {
  if (!target || state.eliminated[target]) return;
  const turnsAfterOwnerConsumes = target === owner ? attackLoad + 1 : attackLoad;
  state.pendingTurns[target] = Math.max(state.pendingTurns[target] ?? 1, turnsAfterOwnerConsumes);
  consumeTurn(owner);
  setAction(`${label(target)} is het doelwit en moet straks ${attackLoad} beurten overleven.`);
}

function resolveSprint(owner) {
  const turnsBeforeSprint = state.pendingTurns[owner] ?? 1;

  if (turnsBeforeSprint > 1) {
    state.pendingTurns[owner] = Math.max(0, turnsBeforeSprint - 2);
    if (state.pendingTurns[owner] <= 0) {
      state.pendingTurns[owner] = 1;
      state.current = nextActivePlayer(owner);
      setAction(`${label(owner)} sprint door de raptorstress heen en hoeft niet te trekken.`);
      return;
    }

    setAction(`${label(owner)} sprint weg zonder te trekken. Nog ${state.pendingTurns[owner]} beurt te gaan.`);
    return;
  }

  consumeTurn(owner);
  setAction(`${label(owner)} sprint weg en trekt niet.`);
}

function alterFuture(owner) {
  const topCards = state.deck.splice(Math.max(0, state.deck.length - 3)).reverse();

  if (owner !== "player") {
    const saferOrder = [...topCards].sort((a, b) => Number(a.type === "meteor") - Number(b.type === "meteor"));
    state.deck.push(...saferOrder.slice().reverse());
    setAction(`${label(owner)} rommelt met de prehistorische tijdlijn.`);
    return;
  }

  state.pendingOracle = { owner, cards: topCards };
  setAction("Je pakt de bovenste 3 kaarten uit de tijdlijn en kiest de nieuwe volgorde.");
  render();
}

function moveOracleCard(index, direction) {
  const pendingOracle = state.pendingOracle;
  if (!pendingOracle || pendingOracle.owner !== "player") return;

  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= pendingOracle.cards.length) return;

  [pendingOracle.cards[index], pendingOracle.cards[targetIndex]] = [pendingOracle.cards[targetIndex], pendingOracle.cards[index]];
  render();
}

function confirmOracleOrder() {
  const pendingOracle = state.pendingOracle;
  if (!pendingOracle) return;

  state.deck.push(...pendingOracle.cards.slice().reverse());
  state.pendingOracle = null;

  const visible = pendingOracle.cards.map((item) => item.name).join(", ");
  log(`${label(pendingOracle.owner)} legt de tijdlijn opnieuw neer.`);
  setAction(visible ? `Nieuwe bovenkant: ${visible}.` : "De tijdlijn blijft leeg.");
  render();

  continueAfterPause();
}

function eruptVolcano(owner) {
  state.deck = shuffle(state.deck);
  const topCards = state.deck.slice(-3).reverse();
  const topCard = state.deck.at(-1);

  showCardMoment({
    title: "Vulkaan Shuffle",
    cards: topCards,
    text: topCards.length
      ? "De vulkaan schudt de trekstapel door elkaar. De nieuwe bovenkant gloeit even op."
      : "De vulkaan rommelt, maar de trekstapel is leeg.",
    buttonText: topCards.length ? "Kijk naar de gloed" : "OK",
    faceDown: true,
    shaking: true,
    owner,
    onClose: () => {
      if (!topCard) {
        setAction("De trekstapel blijft leeg na de vulkaan.");
        return;
      }

      showCardMoment({
        title: "Lavagloed",
        cards: topCard,
        text: owner === "player"
          ? `Je ziet na de shuffle bovenop: ${topCard.name}.`
          : `${label(owner)} ziet na de shuffle kort de bovenste kaart.`,
        buttonText: "OK",
        faceDown: owner !== "player",
        owner,
        onClose: () => {
          setAction(`${label(owner)} schudt de trekstapel en vangt een glimp van de nieuwe bovenkant.`);
        }
      });
      return false;
    }
  });
}

function startDigChoice(owner) {
  const bottomCard = state.deck.at(0);
  if (!bottomCard) {
    drawCard(owner, "bottom");
    return;
  }

  if (owner !== "player") {
    const hasShelter = getHand(owner).some((card) => card.type === "shelter");
    const from = bottomCard.type === "meteor" && !hasShelter ? "top" : "bottom";
    setAction(`${label(owner)} graaft diep en kiest ${from === "bottom" ? "de onderste kaart" : "een blinde trek van boven"}.`);
    drawCard(owner, from);
    return;
  }

  state.pendingDigChoice = { owner, bottomCard };
  setAction("Diep Graven laat je eerst onder de stapel kijken.");
  render();
}

function confirmDigChoice(takeBottom) {
  const pendingDigChoice = state.pendingDigChoice;
  if (!pendingDigChoice) return;

  state.pendingDigChoice = null;
  const from = takeBottom ? "bottom" : "top";
  log(`${label(pendingDigChoice.owner)} laat Diep Graven ${takeBottom ? "onderop toeslaan" : "toch van boven eindigen"}.`);
  drawCard(pendingDigChoice.owner, from);
}

function stealFossilCard(owner, target) {
  const targetHand = getHand(target);
  if (targetHand.length === 0) {
    setAction(`${label(target)} heeft geen kaarten om te stelen.`);
    return;
  }

  if (owner !== "player") {
    const index = Math.floor(Math.random() * targetHand.length);
    stealCardAt(owner, target, index);
    return;
  }

  state.pendingFossilChoice = {
    owner,
    target,
    cards: [...targetHand]
  };
  setAction(`Fossielgraaier laat je bewust een gesloten kaart van ${objectLabel(target)} kiezen.`);
  render();
}

function confirmFossilChoice(index) {
  const pendingFossilChoice = state.pendingFossilChoice;
  if (!pendingFossilChoice) return;

  state.pendingFossilChoice = null;
  stealCardAt(pendingFossilChoice.owner, pendingFossilChoice.target, index);
  render();
  continueAfterPause();
}

function chooseStealTarget(owner) {
  const targets = activeOpponentsOf(owner).filter((target) => getHand(target).length > 0);
  if (targets.length === 0) return null;
  return owner === "player" ? targets[0] : choosePcTarget(owner, targets);
}

function startPairSteal(owner, initialTarget = null) {
  const targets = activeOpponentsOf(owner).filter((target) => getHand(target).length > 0);
  if (targets.length === 0) {
    setAction("Niemand heeft kaarten om te stelen.");
    return;
  }

  if (owner !== "player") {
    const target = initialTarget && targets.includes(initialTarget) ? initialTarget : choosePcTarget(owner, targets);
    stealRandomCard(owner, target);
    return;
  }

  state.pendingStealTarget = {
    owner,
    title: "Paar stelen",
    targets,
    selectedTarget: initialTarget && targets.includes(initialTarget) ? initialTarget : targets[0]
  };
  setAction("Kies eerst van wie je een gesloten kaart wilt pakken.");
  render();
}

function startMiniRaptorSteal(owner, initialTarget = null) {
  const targets = activeOpponentsOf(owner).filter((target) => getHand(target).length > 0);
  if (targets.length === 0) {
    setAction("Niemand heeft kaarten voor de Mini-Raptor om te graaien.");
    return;
  }

  if (owner !== "player") {
    const target = initialTarget && targets.includes(initialTarget) ? initialTarget : choosePcTarget(owner, targets);
    stealRandomCard(owner, target);
    return;
  }

  state.pendingStealTarget = {
    owner,
    title: "Mini-Raptor graait",
    targets,
    selectedTarget: initialTarget && targets.includes(initialTarget) ? initialTarget : targets[0],
    reward: "randomSteal"
  };
  setAction("Kies wie de Mini-Raptor snel 1 willekeurige kaart laat graaien.");
  render();
}

function startStegoSnack(owner, playedPairIds = []) {
  const cards = getStegoSnackOptions(playedPairIds);
  if (cards.length === 0) {
    setAction("Stego Snack snuffelt rond, maar vindt geen oudere niet-meteor kaart in de aflegstapel.");
    return;
  }

  if (owner !== "player") {
    const card = choosePcDiscardSnack(cards);
    reclaimDiscardCard(owner, card.id);
    return;
  }

  state.pendingDiscardChoice = {
    owner,
    cards
  };
  setAction("Stego Snack laat je 1 oudere niet-meteor kaart uit de aflegstapel terugnemen.");
  render();
}

function getStegoSnackOptions(excludedIds = []) {
  const excluded = new Set(excludedIds);
  return state.discard
    .filter((card) => card.type !== "meteor" && !excluded.has(card.id))
    .slice()
    .reverse();
}

function choosePcDiscardSnack(cards) {
  const priority = ["shelter", "nope", "sprint", "dig", "volcano", "oracle", "fossil", "targetedRaptor", "raptor"];
  for (const type of priority) {
    const card = cards.find((item) => item.type === type);
    if (card) return card;
  }

  return cards[0];
}

function confirmDiscardChoice(index) {
  const pendingDiscardChoice = state.pendingDiscardChoice;
  if (!pendingDiscardChoice) return;

  const card = pendingDiscardChoice.cards[index];
  state.pendingDiscardChoice = null;
  if (card) {
    reclaimDiscardCard(pendingDiscardChoice.owner, card.id);
  }
  render();
  continueAfterPause();
}

function reclaimDiscardCard(owner, cardId) {
  const index = state.discard.findIndex((card) => card.id === cardId);
  if (index === -1) {
    setAction("Die kaart ligt niet meer in de aflegstapel.");
    return;
  }

  const [card] = state.discard.splice(index, 1);
  getHand(owner).push(card);
  setAction(`${label(owner)} snackt ${card.name} terug uit de aflegstapel.`);
  showCardMoment({
    title: "Stego Snack",
    cards: card,
    text: `${label(owner)} neemt ${card.name} terug in de hand.`,
    buttonText: owner === "player" ? "Leg in hand" : "OK",
    owner
  });
}

function selectStealTarget(target) {
  const pendingStealTarget = state.pendingStealTarget;
  if (!pendingStealTarget || !pendingStealTarget.targets.includes(target)) return;

  pendingStealTarget.selectedTarget = target;
  render();
}

function confirmStealTarget() {
  const pendingStealTarget = state.pendingStealTarget;
  if (!pendingStealTarget) return;

  const target = pendingStealTarget.selectedTarget;
  state.pendingStealTarget = null;
  if (!target) {
    render();
    continueAfterPause();
    return;
  }

  if (pendingStealTarget.reward === "randomSteal") {
    stealRandomCard(pendingStealTarget.owner, target);
    render();
    continueAfterPause();
    return;
  }

  state.pendingFossilChoice = {
    owner: pendingStealTarget.owner,
    target,
    cards: [...getHand(target)],
    title: "Paar stelen"
  };
  setAction(`Kies een gesloten kaart van ${objectLabel(target)}.`);
  render();
}

function drawCard(owner, from = "top") {
  if (state.gameOver || owner !== state.current) return;
  if (state.eliminated[owner]) return;
  if (isInteractionBlocked()) return;

  if (state.deck.length === 0) {
    endGame(null, "De trekstapel is leeg. Het eindigt in een dino-patstelling.");
    return;
  }

  const card = from === "bottom" ? state.deck.shift() : state.deck.pop();
  state.activity = { owner, type: "draw" };
  log(`${label(owner)} trekt ${from === "bottom" ? "de onderste" : "een"} kaart.`);
  state.pendingDraw = { owner, card, from };
  setAction(`${label(owner)} heeft een kaart getrokken. Klik verder om de beurt te laten doorgaan.`);
  render();

  if (owner !== "player" && card.type !== "meteor") {
    window.setTimeout(confirmPendingDraw, card.type === "meteor" ? 1350 : 900);
  }
}

function confirmPendingDraw() {
  if (!state.pendingDraw || state.gameOver) return;

  const { owner, card } = state.pendingDraw;
  state.pendingDraw = null;

  if (card.type === "meteor") {
    handleMeteor(owner, card);
    return;
  }

  getHand(owner).push(card);
  consumeTurn(owner);
  setAction(`${label(owner)} neemt ${card.name} in de hand.`);
  render();

  continueAfterPause();
}

function handleMeteor(owner, meteorCard) {
  const hand = getHand(owner);
  const shelterIndex = hand.findIndex((card) => card.type === "shelter");

  if (shelterIndex === -1) {
    state.discard.push(meteorCard);
    eliminatePlayer(owner, `${label(owner)} wordt geraakt door een Meteorietinslag.`);
    return;
  }

  const [shelter] = hand.splice(shelterIndex, 1);
  state.discard.push(shelter);
  log(`${label(owner)} gebruikt Schuilgrot en stopt de meteoriet terug.`);

  if (owner === "player") {
    state.pendingMeteorPlacement = { owner, meteorCard };
    setAction("Je Schuilgrot ligt af. Kies nu geheim waar de Meteorietinslag teruggaat.");
    render();
    return;
  }

  showCardMoment({
    title: `${label(owner)} gebruikt Schuilgrot`,
    cards: [meteorCard, shelter],
    text: `${label(owner)} overleeft de meteoriet en legt hem zelf ergens terug in de trekstapel.`,
    buttonText: "OK",
    owner,
    onClose: () => {
      const insertAt = Math.floor(Math.random() * (state.deck.length + 1));
      state.deck.splice(insertAt, 0, meteorCard);
      consumeTurn(owner);
      setAction(`${label(owner)} overleeft de Meteorietinslag en stopt hem geheim terug.`);
    }
  });
}

function confirmMeteorPlacement() {
  if (!state.pendingMeteorPlacement) return;

  const { owner, meteorCard } = state.pendingMeteorPlacement;
  const insertAt = Number(els.placementSelect.value);
  state.deck.splice(insertAt, 0, meteorCard);
  state.pendingMeteorPlacement = null;
  consumeTurn(owner);
  log("De Meteorietinslag is geheim teruggestopt in de trekstapel.");
  setAction("Je overleeft de meteoriet. Niemand weet precies waar hij nu ligt.");
  render();

  if (!state.gameOver && state.current !== "player") {
    window.setTimeout(pcTurn, 650);
  }
}

function consumeTurn(owner) {
  state.pendingTurns[owner] -= 1;
  if (state.pendingTurns[owner] <= 0) {
    state.pendingTurns[owner] = 1;
    state.current = nextActivePlayer(owner);
  }
}

function stealRandomCard(owner, target) {
  const targetHand = getHand(target);
  if (targetHand.length === 0) {
    setAction(`${label(target)} heeft geen kaarten om te stelen.`);
    return;
  }

  const index = Math.floor(Math.random() * targetHand.length);
  stealCardAt(owner, target, index);
}

function stealCardAt(owner, target, index) {
  const targetHand = getHand(target);
  if (targetHand.length === 0) {
    setAction(`${label(target)} heeft geen kaarten om te stelen.`);
    return;
  }

  const boundedIndex = Math.max(0, Math.min(index, targetHand.length - 1));
  const [stolen] = targetHand.splice(boundedIndex, 1);
  getHand(owner).push(stolen);
  setAction(`${label(owner)} steelt een kaart van ${objectLabel(target)}.`);
  showCardMoment({
    title: "Kaart gestolen",
    cards: stolen,
    text: `${label(owner)} pakt ${stolen.name} van ${objectLabel(target)}.`,
    buttonText: owner === "player" ? "Leg in hand" : "OK",
    owner
  });
}

function pcTurn() {
  if (state.gameOver || state.current === "player") return;
  if (state.eliminated[state.current]) {
    state.current = nextActivePlayer(state.current);
    render();
    continueAfterPause();
    return;
  }
  if (isInteractionBlocked()) return;

  const cardToPlay = choosePcCard(state.current);
  if (cardToPlay) {
    playCard(state.current, cardToPlay.id);
    return;
  }

  drawCard(state.current);
}

function choosePcCard(owner) {
  const hand = getHand(owner);
  const sprint = hand.find((card) => card.type === "sprint");
  if ((state.pendingTurns[owner] ?? 1) > 1 && sprint && Math.random() < 0.86) {
    return sprint;
  }

  const playablePair = hand.find((card) => isSetCard(card) && findPairForCard(hand, card).length === 2);
  if (playablePair && Math.random() < 0.34) return playablePair;

  const volcano = hand.find((card) => card.type === "volcano");
  if (volcano && state.deck.length <= 6 && Math.random() < 0.78) {
    return volcano;
  }

  const playable = hand.filter((card) => card.playable);
  if (playable.length === 0) return null;

  const usefulOrder = ["trike", "oracle", "fossil", "targetedRaptor", "raptor", "volcano", "dig", "sprint", "nope"];
  for (const type of usefulOrder) {
    const candidate = playable.find((card) => card.type === type);
    if (candidate && Math.random() < 0.68) {
      return candidate;
    }
  }

  return Math.random() < 0.22 ? playable[0] : null;
}

function endGame(winner, reason) {
  state.gameOver = true;
  log(reason);
  if (winner === "player") {
    setAction(`${reason} Jij wint deze prehistorische chaos.`);
  } else if (winner) {
    setAction(`${reason} ${label(winner)} wint.`);
  } else {
    setAction(reason);
  }
  render();
}

function eliminatePlayer(owner, reason) {
  state.eliminated[owner] = true;
  state.pendingTurns[owner] = 0;
  log(reason);

  if (owner === "player") {
    endGame(null, `${reason} Jij bent uitgeschakeld.`);
    return;
  }

  const remaining = activePlayers();
  if (remaining.length === 1) {
    endGame(remaining[0], `${reason} ${label(remaining[0])} blijft als laatste over.`);
    return;
  }

  setAction(`${reason} ${label(owner)} is uitgeschakeld.`);
  if (state.current === owner) {
    state.current = nextActivePlayer(owner);
  }
  render();
  continueAfterPause();
}

function isSetCard(card) {
  return card.kind === "set";
}

function isInteractionBlocked() {
  return Boolean(state.pendingDraw || state.pendingMeteorPlacement || state.pendingOracle || state.pendingDigChoice || state.pendingFossilChoice || state.pendingDiscardChoice || state.pendingStealTarget || state.pendingNopeReaction || state.pendingAttackReaction || state.pendingRaptorTarget || state.pendingCardDetail || activeReveal);
}

function isGameplayBlockedForPlay() {
  return Boolean(state.pendingDraw || state.pendingMeteorPlacement || state.pendingOracle || state.pendingDigChoice || state.pendingFossilChoice || state.pendingDiscardChoice || state.pendingStealTarget || state.pendingNopeReaction || state.pendingAttackReaction || state.pendingRaptorTarget || activeReveal);
}

function isHandClickBlocked() {
  return Boolean(state.pendingDraw || state.pendingMeteorPlacement || state.pendingOracle || state.pendingDigChoice || state.pendingFossilChoice || state.pendingDiscardChoice || state.pendingStealTarget || state.pendingNopeReaction || state.pendingAttackReaction || state.pendingRaptorTarget || state.pendingCardDetail || activeReveal);
}

function continueAfterPause() {
  if (!state.gameOver && !isInteractionBlocked() && state.current !== "player") {
    window.setTimeout(pcTurn, 650);
  }
}

function getHand(owner) {
  return state.hands[owner] ?? [];
}

function getPlayer(owner) {
  return state.players.find((player) => player.id === owner);
}

function label(owner) {
  return getPlayer(owner)?.name ?? owner;
}

function objectLabel(owner) {
  return owner === "player" ? "jou" : label(owner);
}

function activePlayers() {
  return state.players.map((player) => player.id).filter((id) => !state.eliminated[id]);
}

function activeOpponentsOf(owner) {
  return activePlayers().filter((id) => id !== owner);
}

function chooseDefaultTarget(owner) {
  const targets = activeOpponentsOf(owner);
  if (targets.length === 0) return null;
  return owner === "player" ? targets[0] : choosePcTarget(owner, targets);
}

function choosePcTarget(owner, targets = activeOpponentsOf(owner)) {
  if (targets.includes("player") && Math.random() < 0.72) return "player";
  return targets[Math.floor(Math.random() * targets.length)];
}

function chooseNopeReactor(actor, options = {}) {
  const candidates = activeOpponentsOf(actor).filter((id) => {
    if (options.skipPlayer && id === "player") return false;
    return getHand(id).some((card) => card.type === "nope");
  });
  if (candidates.length === 0) return null;
  if (candidates.includes("player")) return "player";
  return candidates[0];
}

function nextActivePlayer(owner) {
  const active = activePlayers();
  if (active.length === 0) return owner;

  const order = state.players.map((player) => player.id);
  let index = order.indexOf(owner);
  for (let step = 0; step < order.length; step += 1) {
    index = (index + 1) % order.length;
    if (active.includes(order[index])) return order[index];
  }

  return active[0];
}

els.drawButton.addEventListener("click", () => drawCard("player"));
els.newGameButton.addEventListener("click", startGame);
els.placementSelect.addEventListener("change", updatePlacementHint);
els.revealButton.addEventListener("click", () => {
  if (state.pendingCardDetail) {
    closeCardDetail(false);
    return;
  }

  if (activeReveal) {
    closeActiveReveal();
    return;
  }

  if (state.pendingMeteorPlacement) {
    confirmMeteorPlacement();
    return;
  }

  if (state.pendingOracle) {
    confirmOracleOrder();
    return;
  }

  if (state.pendingDigChoice) {
    confirmDigChoice(true);
    return;
  }

  if (state.pendingFossilChoice) {
    state.pendingFossilChoice = null;
    render();
    continueAfterPause();
    return;
  }

  if (state.pendingDiscardChoice) {
    state.pendingDiscardChoice = null;
    render();
    continueAfterPause();
    return;
  }

  if (state.pendingStealTarget) {
    confirmStealTarget();
    return;
  }

  if (state.pendingAttackReaction) {
    resolveAttackReactionWithoutCard();
    return;
  }

  if (state.pendingNopeReaction) {
    resolveNopeReaction(false);
    return;
  }

  if (state.pendingRaptorTarget) {
    confirmRaptorTarget();
    return;
  }

  confirmPendingDraw();
});
els.revealSecondaryButton.addEventListener("click", () => {
  if (state.pendingCardDetail) {
    closeCardDetail(true);
    return;
  }

  if (activeReveal) {
    closeActiveReveal(true);
    return;
  }

  if (state.pendingNopeReaction) {
    resolveNopeReaction(true);
    return;
  }

  if (state.pendingDigChoice) {
    confirmDigChoice(false);
  }
});

startGame();
