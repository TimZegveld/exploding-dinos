const PLAYER_COUNT = 2;

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
    text: "Eindig je beurt. De volgende speler neemt 2 beurten.",
    kind: "action",
    playable: true
  },
  targetedRaptor: {
    name: "Gerichte Raptorjacht",
    text: "Kies een speler voor 2 beurten. In deze versie is dat de ander.",
    kind: "action",
    playable: true
  },
  sprint: {
    name: "Dino Sprint",
    text: "Sla je huidige beurt over zonder te trekken.",
    kind: "action",
    playable: true
  },
  trike: {
    name: "Triceratops Blik",
    text: "Bekijk de bovenste 3 kaarten van de trekstapel.",
    kind: "action",
    playable: true
  },
  oracle: {
    name: "Tijdlijn Kneden",
    text: "Bekijk de bovenste 3 kaarten en leg gevaar achteraan.",
    kind: "action",
    playable: true
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
    text: "Steel een willekeurige kaart van de ander.",
    kind: "action",
    playable: true
  },
  nope: {
    name: "Brul Terug",
    text: "Blokkeer de volgende actiekaart van de ander.",
    kind: "action",
    playable: true
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
  deck: [],
  discard: [],
  playerHand: [],
  pcHand: [],
  current: "player",
  pendingTurns: { player: 1, pc: 1 },
  nopeShield: { player: false, pc: false },
  pendingDraw: null,
  pendingMeteorPlacement: null,
  gameOver: false
};

let state = structuredClone(initialState);
let activeReveal = null;

const els = {
  turnStatus: document.querySelector("#turnStatus"),
  pcCardCount: document.querySelector("#pcCardCount"),
  pcHand: document.querySelector("#pcHand"),
  deckCount: document.querySelector("#deckCount"),
  discardTop: document.querySelector("#discardTop"),
  playerHint: document.querySelector("#playerHint"),
  playerHand: document.querySelector("#playerHand"),
  drawButton: document.querySelector("#drawButton"),
  newGameButton: document.querySelector("#newGameButton"),
  actionText: document.querySelector("#actionText"),
  gameLog: document.querySelector("#gameLog"),
  drawReveal: document.querySelector("#drawReveal"),
  revealEyebrow: document.querySelector("#revealEyebrow"),
  revealCard: document.querySelector("#revealCard"),
  revealText: document.querySelector("#revealText"),
  revealButton: document.querySelector("#revealButton"),
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

function buildCardPool() {
  const mode = deckModeForPlayers(PLAYER_COUNT);
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

function startGame() {
  state = structuredClone(initialState);
  activeReveal = null;
  els.gameLog.replaceChildren();

  const pool = buildCardPool();
  state.playerHand = [makeCard("shelter", true)];
  state.pcHand = [makeCard("shelter", true)];

  for (let i = 0; i < 7; i += 1) {
    state.playerHand.push(pool.pop());
    state.pcHand.push(pool.pop());
  }

  const extraDefuses = Math.max(0, partyPackDistribution.shelter.paw - PLAYER_COUNT);
  const meteors = Math.max(1, PLAYER_COUNT - 1);
  const drawPile = [
    ...pool,
    ...Array.from({ length: extraDefuses }, () => makeCard("shelter", true)),
    ...Array.from({ length: meteors }, () => makeCard("meteor", false))
  ];

  state.deck = shuffle(drawPile);

  log("Nieuw Party Pack spel gestart met de 2-speler dino-pootafdruk set.");
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
  els.turnStatus.textContent = state.gameOver
    ? "Spel afgelopen"
    : state.current === "player"
      ? "Jouw beurt"
      : "PC denkt na";

  els.deckCount.textContent = state.deck.length;
  els.pcCardCount.textContent = `${state.pcHand.length} kaarten`;
  els.discardTop.textContent = state.discard.at(-1)?.name ?? "Nog leeg";
  els.playerHint.textContent = state.current === "player" && !state.gameOver
    ? `${state.pendingTurns.player} beurt(en) open`
    : "Wacht op de pc";
  els.drawButton.disabled = state.current !== "player" || state.gameOver || isInteractionBlocked();

  renderPcHand();
  renderPlayerHand();
  renderReveal();
}

function renderPcHand() {
  els.pcHand.replaceChildren();
  state.pcHand.forEach(() => {
    const card = document.createElement("div");
    card.className = "card-back";
    card.textContent = "Dino";
    els.pcHand.append(card);
  });
}

function renderPlayerHand() {
  els.playerHand.replaceChildren();
  state.playerHand.forEach((card) => {
    const button = document.createElement("button");
    button.className = "card-button";
    button.type = "button";
    button.dataset.kind = card.kind;
    button.disabled = !canPlayCard("player", card) || state.current !== "player" || state.gameOver || isInteractionBlocked();
    button.innerHTML = `<strong>${card.name}</strong><span>${card.text}${card.hasPaw ? " | dino-poot" : ""}</span>`;
    button.addEventListener("click", () => playCard("player", card.id));
    els.playerHand.append(button);
  });
}

function renderReveal() {
  const pendingPlacement = state.pendingMeteorPlacement;
  const pendingDraw = state.pendingDraw;

  if (!pendingPlacement && !pendingDraw && !activeReveal) {
    els.drawReveal.classList.add("is-hidden");
    els.placementControls.classList.add("is-hidden");
    els.revealButton.disabled = false;
    return;
  }

  els.drawReveal.classList.remove("is-hidden");
  els.revealCard.className = "draw-reveal__card";
  els.revealCard.replaceChildren();
  els.placementControls.classList.add("is-hidden");
  els.revealButton.disabled = false;

  if (activeReveal) {
    els.revealEyebrow.textContent = activeReveal.title;
    renderRevealCards(activeReveal.cards, {
      faceDown: activeReveal.faceDown,
      shaking: activeReveal.shaking
    });
    els.revealText.textContent = activeReveal.text;
    els.revealButton.textContent = activeReveal.buttonText ?? "Verder";
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
  els.revealEyebrow.textContent = owner === "player" ? "Jij trekt" : "De pc trekt";

  if (isVisible) {
    renderOpenRevealCard(card, isMeteor);
  } else {
    els.revealCard.classList.add("is-back");
    els.revealCard.textContent = "Dino kaart";
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
      : "De pc trekt een gesloten kaart. De beurt gaat zo verder.";
    els.revealButton.textContent = owner === "player" ? "Neem kaart in hand" : "PC neemt kaart";
  }

  els.revealButton.disabled = owner === "pc";
}

function renderOpenRevealCard(card, isShaking = false) {
  els.revealCard.classList.add(`is-${card.kind}`);
  if (isShaking) {
    els.revealCard.classList.add("is-shaking");
  }

  const title = document.createElement("strong");
  title.textContent = card.name;
  const text = document.createElement("span");
  text.textContent = card.text;
  els.revealCard.append(title, text);
}

function renderRevealCards(cards, options = {}) {
  els.revealCard.classList.add("is-multi");
  cards.forEach((card) => {
    const item = document.createElement("div");
    item.className = "draw-reveal__mini-card";

    if (options.faceDown) {
      item.classList.add("is-back");
      item.textContent = "Dino kaart";
    } else {
      item.classList.add(`is-${card.kind}`);
      if (options.shaking) {
        item.classList.add("is-shaking");
      }

      const title = document.createElement("strong");
      title.textContent = card.name;
      const text = document.createElement("span");
      text.textContent = card.text;
      item.append(title, text);
    }

    els.revealCard.append(item);
  });
}

function showCardMoment({ title, cards, text, buttonText = "Verder", faceDown = false, shaking = false, onClose = null }) {
  activeReveal = {
    title,
    cards: Array.isArray(cards) ? cards : [cards],
    text,
    buttonText,
    faceDown,
    shaking,
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
  log(`${label(owner)} speelt ${card.name}.`);
  showCardMoment({
    title: `${label(owner)} speelt`,
    cards: card,
    text: "Klik verder om het effect van deze kaart uit te voeren.",
    buttonText: "Speel kaart",
    onClose: () => {
      if (!consumeNopeShield(owner, card)) {
        resolveCard(owner, card);
      }
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
  showCardMoment({
    title: `${label(owner)} speelt een paar`,
    cards: pair,
    text: "Dit paar mag een willekeurige kaart van de ander stelen.",
    buttonText: "Pak kaart",
    onClose: () => stealRandomCard(owner, other(owner))
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
  const target = other(owner);

  if (card.type === "sprint") {
    consumeTurn(owner);
    setAction(`${label(owner)} sprint weg en trekt niet.`);
    return;
  }

  if (card.type === "raptor" || card.type === "targetedRaptor") {
    state.pendingTurns[target] += 1;
    consumeTurn(owner);
    setAction(`${label(target)} moet straks 2 beurten overleven.`);
    return;
  }

  if (card.type === "trike") {
    const peek = state.deck.slice(-3).reverse().map((item) => item.name);
    const text = peek.length ? peek.join(", ") : "de stapel is leeg";
    setAction(owner === "player" ? `Bovenop liggen: ${text}.` : "De pc bekijkt de bovenste 3 kaarten.");
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
    stealRandomCard(owner, target);
    return;
  }

  if (card.type === "nope") {
    state.nopeShield[owner] = true;
    setAction(`${label(owner)} staat klaar om de volgende actie van ${label(target)} weg te brullen.`);
  }
}

function consumeNopeShield(owner, card) {
  const target = other(owner);
  if (!state.nopeShield[target] || !card.playable || card.type === "nope") return false;

  state.nopeShield[target] = false;
  log(`${label(target)} blokkeert ${card.name} met Brul Terug.`);
  setAction(`${card.name} is weggebruld voordat het effect begon.`);
  return true;
}

function alterFuture(owner) {
  const topCards = state.deck.splice(Math.max(0, state.deck.length - 3));
  const saferOrder = [...topCards].sort((a, b) => Number(b.type === "meteor") - Number(a.type === "meteor"));
  state.deck.push(...saferOrder);
  const visible = saferOrder.slice().reverse().map((item) => item.name).join(", ");
  setAction(owner === "player"
    ? `Je kneedt de tijdlijn. Nieuwe top: ${visible || "geen kaarten"}.`
    : "De pc rommelt met de prehistorische tijdlijn.");
}

function drawCard(owner, from = "top") {
  if (state.gameOver || owner !== state.current) return;
  if (isInteractionBlocked()) return;

  if (state.deck.length === 0) {
    endGame(null, "De trekstapel is leeg. Het eindigt in een dino-patstelling.");
    return;
  }

  const card = from === "bottom" ? state.deck.shift() : state.deck.pop();
  log(`${label(owner)} trekt ${from === "bottom" ? "de onderste" : "een"} kaart.`);
  state.pendingDraw = { owner, card, from };
  setAction(`${label(owner)} heeft een kaart getrokken. Klik verder om de beurt te laten doorgaan.`);
  render();

  if (owner === "pc") {
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
    endGame(other(owner), `${label(owner)} wordt geraakt door een Meteorietinslag.`);
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
  setAction("De pc overleeft de Meteorietinslag en stopt hem geheim terug.");
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

  if (!state.gameOver && state.current === "pc") {
    window.setTimeout(pcTurn, 650);
  }
}

function consumeTurn(owner) {
  state.pendingTurns[owner] -= 1;
  if (state.pendingTurns[owner] <= 0) {
    state.pendingTurns[owner] = 1;
    state.current = other(owner);
  }
}

function stealRandomCard(owner, target) {
  const targetHand = getHand(target);
  if (targetHand.length === 0) {
    setAction(`${label(target)} heeft geen kaarten om te stelen.`);
    return;
  }

  const index = Math.floor(Math.random() * targetHand.length);
  const [stolen] = targetHand.splice(index, 1);
  getHand(owner).push(stolen);
  setAction(`${label(owner)} steelt een kaart van ${label(target)}.`);
  showCardMoment({
    title: "Kaart gestolen",
    cards: stolen,
    text: `${label(owner)} pakt ${stolen.name} van ${label(target)}.`,
    buttonText: "Leg in hand"
  });
}

function pcTurn() {
  if (state.gameOver || state.current !== "pc") return;
  if (isInteractionBlocked()) return;

  const cardToPlay = choosePcCard();
  if (cardToPlay) {
    playCard("pc", cardToPlay.id);
    return;
  }

  drawCard("pc");
}

function choosePcCard() {
  const hand = state.pcHand;
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
  } else if (winner === "pc") {
    setAction(`${reason} De pc wint.`);
  } else {
    setAction(reason);
  }
  render();
}

function isSetCard(card) {
  return card.kind === "set";
}

function isInteractionBlocked() {
  return Boolean(state.pendingDraw || state.pendingMeteorPlacement || activeReveal);
}

function continueAfterPause() {
  if (!state.gameOver && !isInteractionBlocked() && state.current === "pc") {
    window.setTimeout(pcTurn, 650);
  }
}

function getHand(owner) {
  return owner === "player" ? state.playerHand : state.pcHand;
}

function other(owner) {
  return owner === "player" ? "pc" : "player";
}

function label(owner) {
  return owner === "player" ? "Jij" : "De pc";
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

  confirmPendingDraw();
});

startGame();
