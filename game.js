const MIN_OPPONENTS = 1;
const MAX_OPPONENTS = 4;
const DEFAULT_OPPONENTS = 1;
const playerColors = ["#2f7d4f", "#d45d32", "#2d6f9f", "#b36a22", "#7a56a6"];

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
      icon: "R",
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
      icon: "S",
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
      icon: "↻",
      image: "assets/cards/illustrations/oracle-timeline.jpg"
    }
  },
  volcano: {
    name: "Vulkaan Shuffle",
    text: "Schud de trekstapel.",
    kind: "action",
    playable: true
  },
  dig: {
    name: "Diep Graven",
    text: "Trek de onderste kaart om je beurt te eindigen.",
    kind: "action",
    playable: true
  },
  fossil: {
    name: "Fossielgraaier",
    text: "Kies een gesloten kaart van de ander en steel die.",
    kind: "action",
    playable: true,
    design: {
      tone: "fossil",
      icon: "F",
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
      icon: "!",
      image: "assets/cards/illustrations/brul-terug-roar.jpg"
    }
  },
  feral: {
    name: "Wilde Dino",
    text: "Joker voor dino-soortkaarten. Speel als paar om te stelen.",
    kind: "set",
    playable: false
  },
  miniRaptor: {
    name: "Mini-Raptor",
    text: "Soortkaart. Speel 2 dezelfde als paar om te stelen.",
    kind: "set",
    playable: false
  },
  stegoSnack: {
    name: "Stego Snack",
    text: "Soortkaart. Speel 2 dezelfde als paar om te stelen.",
    kind: "set",
    playable: false
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
  pendingFossilChoice: null,
  pendingNopeReaction: null,
  pendingRaptorTarget: null,
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
  placementSlider: document.querySelector("#placementSlider")
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
      name: `PC ${index + 1}`,
      color: playerColors[index + 1],
      isHuman: false
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
    button.disabled = !canPlayCard("player", card) || state.current !== "player" || state.gameOver || isInteractionBlocked();
    renderCardFace(button, card);
    button.addEventListener("click", () => playCard("player", card.id));
    els.playerHand.append(button);
  });
}

function renderReveal() {
  const pendingPlacement = state.pendingMeteorPlacement;
  const pendingOracle = state.pendingOracle;
  const pendingFossilChoice = state.pendingFossilChoice;
  const pendingNopeReaction = state.pendingNopeReaction;
  const pendingRaptorTarget = state.pendingRaptorTarget;
  const pendingDraw = state.pendingDraw;
  const revealOwner = pendingDraw?.owner ?? pendingNopeReaction?.actor ?? pendingRaptorTarget?.owner ?? pendingPlacement?.owner ?? activeReveal?.owner;
  els.drawReveal.style.setProperty("--player-color", getPlayer(revealOwner)?.color ?? playerColors[0]);

  if (!pendingPlacement && !pendingOracle && !pendingFossilChoice && !pendingNopeReaction && !pendingRaptorTarget && !pendingDraw && !activeReveal) {
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

  if (pendingFossilChoice) {
    els.revealEyebrow.textContent = "Fossielgraaier";
    renderFossilChoices(pendingFossilChoice);
    els.revealText.textContent = pendingFossilChoice.cards.length
      ? `Kies een gesloten kaart uit de hand van ${label(pendingFossilChoice.target)}.`
      : `${label(pendingFossilChoice.target)} heeft geen kaarten om te stelen.`;
    els.revealButton.textContent = pendingFossilChoice.cards.length ? "Kies kaart" : "Verder";
    els.revealButton.disabled = pendingFossilChoice.cards.length > 0;
    return;
  }

  if (pendingNopeReaction) {
    els.revealEyebrow.textContent = "Brul Terug?";
    renderOpenRevealCard(pendingNopeReaction.card);
    els.revealText.textContent = `${label(pendingNopeReaction.actor)} speelt ${pendingNopeReaction.card.name}. Wil je Brul Terug inzetten om het effect te stoppen?`;
    els.revealButton.textContent = "Brul terug";
    els.revealSecondaryButton.textContent = "Laat doorgaan";
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
    els.placementSlider.min = "0";
    els.placementSlider.max = String(state.deck.length);
    els.placementSlider.value = String(state.deck.length);
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
    els.revealButton.textContent = hasShelter ? "Gebruik Schuilgrot" : "Laat ontploffen";
  } else {
    els.revealText.textContent = owner === "player"
      ? "Lees de kaart rustig. Klik daarna om hem aan je hand toe te voegen."
      : `${label(owner)} trekt een gesloten kaart. De beurt gaat zo verder.`;
    els.revealButton.textContent = owner === "player" ? "Neem kaart in hand" : `${label(owner)} neemt kaart`;
  }

  els.revealButton.disabled = owner !== "player";
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
    text.textContent = `${card.text}${card.hasPaw && !options.hidePaw ? " | dino-poot" : ""}`;
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
  icon.textContent = card.design.icon;
  icon.setAttribute("aria-hidden", "true");

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
  text.textContent = `${card.text}${card.hasPaw && !options.hidePaw ? " | dino-poot" : ""}`;

  element.append(header, art, text);
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

function showCardMoment({ title, cards, text, buttonText = "Verder", faceDown = false, shaking = false, owner = null, onClose = null }) {
  activeReveal = {
    title,
    cards: Array.isArray(cards) ? cards : [cards],
    text,
    buttonText,
    faceDown,
    shaking,
    owner,
    onClose
  };
  render();
}

function closeActiveReveal() {
  if (!activeReveal) return;

  const reveal = activeReveal;
  activeReveal = null;
  reveal.onClose?.();
  render();
  continueAfterPause();
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
  if (isSetCard(card)) {
    playSetPair(owner, card);
    return;
  }

  hand.splice(index, 1);
  state.discard.push(card);
  state.activity = { owner, type: "play" };
  log(`${label(owner)} speelt ${card.name}.`);
  showCardMoment({
    title: `${label(owner)} speelt`,
    cards: card,
    text: "Klik verder om het effect van deze kaart uit te voeren.",
    buttonText: "Speel kaart",
    owner,
    onClose: () => {
      offerNopeReaction(owner, card);
    }
  });
}

function playSetPair(owner, card) {
  const hand = getHand(owner);
  const pair = findPairForCard(hand, card);
  if (pair.length !== 2) return;

  pair.forEach((pairCard) => {
    const index = hand.findIndex((item) => item.id === pairCard.id);
    if (index !== -1) state.discard.push(hand.splice(index, 1)[0]);
  });

  log(`${label(owner)} speelt een paar ${pair.map((item) => item.name).join(" + ")}.`);
  state.activity = { owner, type: "play" };
  showCardMoment({
    title: `${label(owner)} speelt een paar`,
    cards: pair,
    text: "Dit paar mag een willekeurige kaart van de ander stelen.",
    buttonText: "Pak kaart",
    owner,
    onClose: () => stealRandomCard(owner, chooseDefaultTarget(owner))
  });
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

function resolveCard(owner, card) {
  const target = chooseDefaultTarget(owner);

  if (card.type === "sprint") {
    resolveSprint(owner);
    return;
  }

  if (card.type === "raptor") {
    if (!target) return;
    state.pendingTurns[target] += 1;
    consumeTurn(owner);
    setAction(`De raptor valt meteen aan. ${label(target)} moet straks 2 beurten overleven.`);
    return;
  }

  if (card.type === "targetedRaptor") {
    chooseRaptorTarget(owner);
    return;
  }

  if (card.type === "trike") {
    const peek = state.deck.slice(-3).reverse().map((item) => item.name);
    const text = peek.length ? peek.join(", ") : "de stapel is leeg";
    setAction(owner === "player" ? `Bovenop liggen: ${text}.` : `${label(owner)} bekijkt de bovenste 3 kaarten.`);
    return;
  }

  if (card.type === "oracle") {
    alterFuture(owner);
    return;
  }

  if (card.type === "volcano") {
    state.deck = shuffle(state.deck);
    setAction("De trekstapel is geschud door de vulkaan.");
    return;
  }

  if (card.type === "dig") {
    drawCard(owner, "bottom");
    return;
  }

  if (card.type === "fossil") {
    if (!target) return;
    stealFossilCard(owner, target);
    return;
  }
}

function offerNopeReaction(actor, card) {
  const reactor = chooseNopeReactor(actor);
  if (!reactor) {
    resolveCard(actor, card);
    return;
  }
  const nopeCard = getHand(reactor).find((item) => item.type === "nope");

  if (!canReactWithNope(card) || !nopeCard) {
    resolveCard(actor, card);
    return;
  }

  if (reactor !== "player") {
    state.pendingNopeReaction = { actor, reactor, card, nopeCardId: nopeCard.id };
    const shouldBlock = choosePcNopeReaction(card);
    if (shouldBlock) {
      resolveNopeReaction(true);
      return;
    }

    log(`${label(reactor)} houdt Brul Terug vast.`);
    resolveNopeReaction(false);
    return;
  }

  state.pendingNopeReaction = { actor, reactor, card, nopeCardId: nopeCard.id };
  setAction(`${label(actor)} speelt ${card.name}. Je kunt reageren met Brul Terug.`);
  render();
}

function canReactWithNope(card) {
  return card.playable && card.type !== "nope";
}

function choosePcNopeReaction(card) {
  if (card.type === "trike" || card.type === "volcano") return Math.random() < 0.28;
  if (card.type === "sprint") return Math.random() < 0.42;
  return Math.random() < 0.68;
}

function resolveNopeReaction(useNope) {
  const pending = state.pendingNopeReaction;
  if (!pending) return;

  state.pendingNopeReaction = null;

  if (!useNope) {
    resolveCard(pending.actor, pending.card);
    render();
    continueAfterPause();
    return;
  }

  const hand = getHand(pending.reactor);
  const index = hand.findIndex((card) => card.id === pending.nopeCardId);
  if (index === -1) {
    resolveCard(pending.actor, pending.card);
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

function chooseRaptorTarget(owner) {
  const targets = activeOpponentsOf(owner);
  if (targets.length === 0) return;

  if (owner !== "player") {
    resolveRaptorTarget(owner, choosePcTarget(owner, targets));
    return;
  }

  state.pendingRaptorTarget = {
    owner,
    targets,
    selectedTarget: targets[0]
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
  resolveRaptorTarget(pendingRaptorTarget.owner, pendingRaptorTarget.selectedTarget);
  render();
  continueAfterPause();
}

function resolveRaptorTarget(owner, target) {
  if (!target || state.eliminated[target]) return;
  state.pendingTurns[target] += 1;
  consumeTurn(owner);
  log(`${label(owner)} stuurt de raptor op ${label(target)} af.`);
  setAction(`${label(target)} is het doelwit en moet straks 2 beurten overleven.`);
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
  setAction(`Fossielgraaier laat je bewust een gesloten kaart van ${label(target)} kiezen.`);
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

  if (owner !== "player") {
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

  const insertAt = Math.floor(Math.random() * (state.deck.length + 1));
  state.deck.splice(insertAt, 0, meteorCard);
  consumeTurn(owner);
  setAction(`${label(owner)} overleeft de Meteorietinslag en stopt hem geheim terug.`);
  render();

  continueAfterPause();
}

function confirmMeteorPlacement() {
  if (!state.pendingMeteorPlacement) return;

  const { owner, meteorCard } = state.pendingMeteorPlacement;
  const insertAt = Number(els.placementSlider.value);
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
  setAction(`${label(owner)} steelt een kaart van ${label(target)}.`);
  showCardMoment({
    title: "Kaart gestolen",
    cards: stolen,
    text: `${label(owner)} pakt ${stolen.name} van ${label(target)}.`,
    buttonText: "Leg in hand",
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
  return Boolean(state.pendingDraw || state.pendingMeteorPlacement || state.pendingOracle || state.pendingFossilChoice || state.pendingNopeReaction || state.pendingRaptorTarget || activeReveal);
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

function chooseNopeReactor(actor) {
  const candidates = activeOpponentsOf(actor).filter((id) => getHand(id).some((card) => card.type === "nope"));
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
els.revealButton.addEventListener("click", () => {
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

  if (state.pendingFossilChoice) {
    state.pendingFossilChoice = null;
    render();
    continueAfterPause();
    return;
  }

  if (state.pendingNopeReaction) {
    resolveNopeReaction(true);
    return;
  }

  if (state.pendingRaptorTarget) {
    confirmRaptorTarget();
    return;
  }

  confirmPendingDraw();
});
els.revealSecondaryButton.addEventListener("click", () => {
  if (state.pendingNopeReaction) {
    resolveNopeReaction(false);
  }
});

startGame();
