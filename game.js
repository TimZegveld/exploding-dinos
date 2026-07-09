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
  sprint: {
    name: "T-Rex Sprint",
    text: "Sla je huidige beurt over.",
    kind: "action",
    playable: true
  },
  raptor: {
    name: "Raptor Aanval",
    text: "De ander krijgt een extra beurt.",
    kind: "action",
    playable: true
  },
  trike: {
    name: "Triceratops Blik",
    text: "Bekijk de bovenste drie kaarten van de stapel.",
    kind: "action",
    playable: true
  },
  volcano: {
    name: "Vulkaan Shuffle",
    text: "Schud de trekstapel.",
    kind: "action",
    playable: true
  },
  fossil: {
    name: "Fossielgraaier",
    text: "Steel een willekeurige kaart van de ander.",
    kind: "action",
    playable: true
  },
  dinoSnack: {
    name: "Dino Snack",
    text: "Nog geen effect. Bewaar voor latere set-combo's.",
    kind: "action",
    playable: false
  }
};

const initialState = {
  deck: [],
  discard: [],
  playerHand: [],
  pcHand: [],
  current: "player",
  pendingTurns: { player: 1, pc: 1 },
  gameOver: false,
  peek: []
};

let state = structuredClone(initialState);

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
  gameLog: document.querySelector("#gameLog")
};

function makeCard(type) {
  return {
    id: crypto.randomUUID(),
    type,
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

function buildDeck() {
  const cards = [
    ...Array.from({ length: 1 }, () => makeCard("meteor")),
    ...Array.from({ length: 4 }, () => makeCard("sprint")),
    ...Array.from({ length: 3 }, () => makeCard("raptor")),
    ...Array.from({ length: 3 }, () => makeCard("trike")),
    ...Array.from({ length: 3 }, () => makeCard("volcano")),
    ...Array.from({ length: 3 }, () => makeCard("fossil")),
    ...Array.from({ length: 6 }, () => makeCard("dinoSnack"))
  ];
  return shuffle(cards);
}

function startGame() {
  state = structuredClone(initialState);
  els.gameLog.replaceChildren();
  state.deck = buildDeck();
  state.playerHand = [makeCard("shelter")];
  state.pcHand = [makeCard("shelter")];

  for (let i = 0; i < 5; i += 1) {
    state.playerHand.push(state.deck.pop());
    state.pcHand.push(state.deck.pop());
  }

  log("Nieuw spel gestart. Jij begint.");
  setAction("Speel actiekaarten of trek een kaart om je beurt te eindigen.");
  render();
}

function log(message) {
  const li = document.createElement("li");
  li.textContent = message;
  els.gameLog.append(li);
  while (els.gameLog.children.length > 18) {
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
  els.drawButton.disabled = state.current !== "player" || state.gameOver;

  renderPcHand();
  renderPlayerHand();
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
    button.disabled = !card.playable || state.current !== "player" || state.gameOver;
    button.innerHTML = `<strong>${card.name}</strong><span>${card.text}</span>`;
    button.addEventListener("click", () => playCard("player", card.id));
    els.playerHand.append(button);
  });
}

function playCard(owner, cardId) {
  if (state.gameOver || owner !== state.current) return;

  const hand = getHand(owner);
  const index = hand.findIndex((card) => card.id === cardId);
  if (index === -1) return;

  const [card] = hand.splice(index, 1);
  state.discard.push(card);
  log(`${label(owner)} speelt ${card.name}.`);
  resolveCard(owner, card);
  render();

  if (!state.gameOver && state.current === "pc") {
    window.setTimeout(pcTurn, 650);
  }
}

function resolveCard(owner, card) {
  const target = other(owner);

  if (card.type === "sprint") {
    consumeTurn(owner);
    setAction(`${label(owner)} slaat een beurt over.`);
    return;
  }

  if (card.type === "raptor") {
    state.pendingTurns[target] += 1;
    consumeTurn(owner);
    setAction(`${label(target)} moet straks een extra beurt nemen.`);
    return;
  }

  if (card.type === "trike") {
    const peek = state.deck.slice(-3).reverse().map((item) => item.name);
    const text = peek.length ? peek.join(", ") : "de stapel is leeg";
    if (owner === "player") {
      setAction(`Bovenop liggen: ${text}.`);
    } else {
      setAction("De pc tuurt in de prehistorische toekomst.");
    }
    return;
  }

  if (card.type === "volcano") {
    state.deck = shuffle(state.deck);
    setAction("De trekstapel is geschud.");
    return;
  }

  if (card.type === "fossil") {
    stealRandomCard(owner, target);
  }
}

function drawCard(owner) {
  if (state.gameOver || owner !== state.current) return;

  if (state.deck.length === 0) {
    endGame(null, "De trekstapel is leeg. Het eindigt in een dino-patstelling.");
    return;
  }

  const card = state.deck.pop();
  log(`${label(owner)} trekt een kaart.`);

  if (card.type === "meteor") {
    handleMeteor(owner, card);
    return;
  }

  getHand(owner).push(card);
  consumeTurn(owner);
  setAction(`${label(owner)} trekt veilig een kaart.`);
  render();

  if (!state.gameOver && state.current === "pc") {
    window.setTimeout(pcTurn, 650);
  }
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
  const insertAt = Math.floor(Math.random() * (state.deck.length + 1));
  state.deck.splice(insertAt, 0, meteorCard);
  consumeTurn(owner);
  log(`${label(owner)} gebruikt Schuilgrot en stopt de meteoriet terug.`);
  setAction(`${label(owner)} overleeft de Meteorietinslag.`);
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
}

function pcTurn() {
  if (state.gameOver || state.current !== "pc") return;

  const cardToPlay = choosePcCard();
  if (cardToPlay) {
    playCard("pc", cardToPlay.id);
    return;
  }

  drawCard("pc");
}

function choosePcCard() {
  const hand = state.pcHand;
  const playable = hand.filter((card) => card.playable);
  if (playable.length === 0) return null;

  const usefulOrder = ["trike", "fossil", "raptor", "volcano", "sprint"];
  for (const type of usefulOrder) {
    const candidate = playable.find((card) => card.type === type);
    if (candidate && Math.random() < 0.72) {
      return candidate;
    }
  }

  return Math.random() < 0.28 ? playable[0] : null;
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

startGame();
