const RAPTOR_TURN_LOAD = 2;
const { random: runtimeRandom, schedule } = globalThis.ExplodingDinosRuntime;
const {
  assertValidInteractionState,
  clearInteractions,
  createInitialState,
  getActiveInteractions
} = globalThis.ExplodingDinosState;
const {
  MIN_OPPONENTS,
  MAX_OPPONENTS,
  DEFAULT_OPPONENTS,
  playerColors,
  opponentPersonas,
  createPlayers
} = globalThis.ExplodingDinosPlayers;
const {
  cardCatalog,
  partyPackDistribution,
  buildCardPool,
  deckModeForPlayers,
  makeCard,
  resolveDesign,
  shuffle
} = globalThis.ExplodingDinosCards;
const {
  applyRaptorAttack,
  calculateSetupCounts,
  chooseStartingPlayerId,
  determineSetPairRewardType,
  getCardTurnEffect,
  insertMeteorBack,
  isNopeChainBlocked,
  resolveIncomingAttackLoad,
  resolveMeteorDraw
} = globalThis.ExplodingDinosRules;
const { createSingleplayerViewModel } = globalThis.ExplodingDinosViewModel;
const SharedGameView = globalThis.ExplodingDinosGameView;
const SharedRevealView = globalThis.ExplodingDinosRevealView;
const SharedChoiceView = globalThis.ExplodingDinosChoiceView;

const HAND_TYPE_ORDER = Object.keys(cardCatalog);

const pcStyleProfiles = {
  archaeologist: {
    name: "Archeoloog",
    sprintEscape: 0.82,
    napEscape: 0.64,
    pteroPair: 0.44,
    pairPlay: 0.3,
    volcanoLowDeck: 0.58,
    trikeRiskCheck: 0.78,
    fallbackPlay: 0.2,
    playerTarget: 0.64,
    brontoRaptorMove: 0.34,
    nope: { default: 0.6, nope: 0.48, info: 0.34, sprint: 0.36 },
    cardBias: { fossil: 1.45, dig: 1.35, trike: 1.2, oracle: 1.08, targetedRaptor: 0.9, raptor: 0.82 },
    discardPriority: ["shelter", "dig", "fossil", "trike", "oracle", "nope", "sprint", "volcano", "targetedRaptor", "raptor"]
  },
  volcanic: {
    name: "Vulkaanwachter",
    sprintEscape: 0.74,
    napEscape: 0.5,
    pteroPair: 0.5,
    pairPlay: 0.28,
    volcanoLowDeck: 0.94,
    trikeRiskCheck: 0.54,
    fallbackPlay: 0.28,
    playerTarget: 0.72,
    brontoRaptorMove: 0.5,
    nope: { default: 0.6, nope: 0.44, info: 0.2, sprint: 0.34 },
    cardBias: { volcano: 1.75, raptor: 1.16, targetedRaptor: 1.12, sprint: 1.08, trike: 0.82, oracle: 0.72 },
    discardPriority: ["shelter", "volcano", "sprint", "nope", "targetedRaptor", "raptor", "dig", "oracle", "fossil"]
  },
  sneaky: {
    name: "Bottenfluisteraar",
    sprintEscape: 0.78,
    napEscape: 0.58,
    pteroPair: 0.48,
    pairPlay: 0.42,
    volcanoLowDeck: 0.46,
    trikeRiskCheck: 0.62,
    fallbackPlay: 0.24,
    playerTarget: 0.7,
    brontoRaptorMove: 0.36,
    targetRichHand: true,
    nope: { default: 0.72, nope: 0.56, info: 0.3, sprint: 0.42 },
    cardBias: { fossil: 1.85, miniRaptor: 1.7, targetedRaptor: 1.25, nope: 1.18, raptor: 0.92 },
    pairBias: { miniRaptor: 1.8, feral: 1.25 },
    discardPriority: ["shelter", "fossil", "nope", "sprint", "dig", "oracle", "targetedRaptor", "raptor", "volcano"]
  },
  aggressive: {
    name: "Brulbaard",
    sprintEscape: 0.62,
    napEscape: 0.42,
    pteroPair: 0.36,
    pairPlay: 0.24,
    volcanoLowDeck: 0.5,
    trikeRiskCheck: 0.48,
    fallbackPlay: 0.34,
    playerTarget: 0.86,
    brontoRaptorMove: 0.62,
    nope: { default: 0.78, nope: 0.64, info: 0.18, sprint: 0.48 },
    cardBias: { targetedRaptor: 1.85, raptor: 1.75, nope: 1.25, sprint: 1.16, fossil: 1.05, trike: 0.58, oracle: 0.52 },
    discardPriority: ["shelter", "targetedRaptor", "raptor", "nope", "sprint", "fossil", "volcano", "dig", "oracle"]
  },
  careful: {
    name: "Tijdlijnkundige",
    sprintEscape: 0.9,
    napEscape: 0.82,
    pteroPair: 0.68,
    pairPlay: 0.2,
    volcanoLowDeck: 0.52,
    trikeRiskCheck: 0.94,
    fallbackPlay: 0.12,
    playerTarget: 0.48,
    brontoRaptorMove: 0.72,
    nope: { default: 0.64, nope: 0.5, info: 0.46, sprint: 0.36 },
    cardBias: { oracle: 1.85, trike: 1.75, pteroPret: 1.45, brontoBuik: 1.42, dig: 1.22, raptor: 0.5, targetedRaptor: 0.58 },
    discardPriority: ["shelter", "oracle", "trike", "pteroPret", "brontoBuik", "nope", "sprint", "dig", "fossil"]
  },
  captain: {
    name: "Kaartkapitein",
    sprintEscape: 0.84,
    napEscape: 0.66,
    pteroPair: 0.82,
    pairPlay: 0.36,
    volcanoLowDeck: 0.62,
    trikeRiskCheck: 0.68,
    fallbackPlay: 0.22,
    playerTarget: 0.66,
    brontoRaptorMove: 0.44,
    nope: { default: 0.62, nope: 0.54, info: 0.34, sprint: 0.38 },
    cardBias: { pteroPret: 1.85, sprint: 1.42, oracle: 1.2, trike: 1.12, volcano: 1.08, raptor: 0.85 },
    pairBias: { pteroPret: 1.9, feral: 1.22 },
    discardPriority: ["shelter", "pteroPret", "sprint", "oracle", "trike", "nope", "volcano", "fossil", "raptor"]
  },
  defensive: {
    name: "Mosridder",
    sprintEscape: 0.94,
    napEscape: 0.86,
    pteroPair: 0.46,
    pairPlay: 0.22,
    volcanoLowDeck: 0.58,
    trikeRiskCheck: 0.84,
    fallbackPlay: 0.14,
    playerTarget: 0.42,
    brontoRaptorMove: 0.82,
    nope: { default: 0.82, nope: 0.7, info: 0.38, sprint: 0.58 },
    cardBias: { nope: 1.72, sprint: 1.48, trike: 1.35, brontoBuik: 1.3, stegoSnack: 1.24, raptor: 0.46, targetedRaptor: 0.5 },
    discardPriority: ["shelter", "nope", "sprint", "brontoBuik", "trike", "stegoSnack", "dig", "oracle", "fossil"]
  },
  chaotic: {
    name: "Platenmaker",
    sprintEscape: 0.72,
    napEscape: 0.5,
    pteroPair: 0.72,
    pairPlay: 0.62,
    volcanoLowDeck: 0.82,
    trikeRiskCheck: 0.48,
    fallbackPlay: 0.46,
    playerTarget: 0.62,
    brontoRaptorMove: 0.5,
    nope: { default: 0.5, nope: 0.5, info: 0.24, sprint: 0.42 },
    cardBias: { volcano: 1.45, pteroPret: 1.36, feral: 1.34, sprint: 1.18, raptor: 1.08, oracle: 0.72 },
    pairBias: { feral: 1.65 },
    discardPriority: ["shelter", "volcano", "pteroPret", "feral", "sprint", "nope", "targetedRaptor", "dig", "oracle"]
  },
  tricky: {
    name: "Trucjager",
    sprintEscape: 0.8,
    napEscape: 0.6,
    pteroPair: 0.56,
    pairPlay: 0.48,
    volcanoLowDeck: 0.66,
    trikeRiskCheck: 0.7,
    fallbackPlay: 0.3,
    playerTarget: 0.74,
    brontoRaptorMove: 0.58,
    targetRichHand: true,
    nope: { default: 0.74, nope: 0.62, info: 0.36, sprint: 0.5 },
    cardBias: { nope: 1.52, targetedRaptor: 1.45, fossil: 1.42, oracle: 1.24, miniRaptor: 1.3, raptor: 1.1 },
    pairBias: { miniRaptor: 1.45, pteroPret: 1.22, feral: 1.18 },
    discardPriority: ["shelter", "nope", "fossil", "targetedRaptor", "miniRaptor", "oracle", "sprint", "raptor", "volcano"]
  }
};

const defaultPcStyleProfile = pcStyleProfiles.archaeologist;

function hasPcStyleProfile(style) {
  return Boolean(pcStyleProfiles[style]);
}

const initialState = createInitialState();

let state = structuredClone(initialState);
let activeReveal = null;
let currentPage = "game";
let selectedCatalogType = null;
let isPlayerHandOpen = false;
let isMobileMenuOpen = false;
let isMobileLogOpen = false;
let isFullLogOpen = false;
let motion = { kind: null, tone: null, id: 0 };
let motionTimer = null;
let tutorialStep = 0;
let selectedOpponentIds = opponentPersonas.slice(0, DEFAULT_OPPONENTS).map((persona) => persona.personaId);
let activeDialog = null;
let dialogReturnFocus = null;

const els = {
  gameTable: document.querySelector("#gameTable"),
  sidePanel: document.querySelector(".side-panel"),
  catalogPage: document.querySelector("#catalogPage"),
  catalogGrid: document.querySelector("#catalogGrid"),
  catalogCount: document.querySelector("#catalogCount"),
  catalogDetail: document.querySelector("#catalogDetail"),
  catalogDetailKind: document.querySelector("#catalogDetailKind"),
  catalogDetailCard: document.querySelector("#catalogDetailCard"),
  catalogDetailTitle: document.querySelector("#catalogDetailTitle"),
  catalogDetailText: document.querySelector("#catalogDetailText"),
  showGamePage: document.querySelector("#showGamePage"),
  showCatalogPage: document.querySelector("#showCatalogPage"),
  closeCatalogDetail: document.querySelector("#closeCatalogDetail"),
  mobileMenuButton: document.querySelector("#mobileMenuButton"),
  mobileMenu: document.querySelector("#mobileMenu"),
  closeMobileMenu: document.querySelector("#closeMobileMenu"),
  mobileGamePageButton: document.querySelector("#mobileGamePageButton"),
  mobileCatalogPageButton: document.querySelector("#mobileCatalogPageButton"),
  mobileExplainButton: document.querySelector("#mobileExplainButton"),
  mobileNewGameButton: document.querySelector("#mobileNewGameButton"),
  mobileLogButton: document.querySelector("#mobileLogButton"),
  mobileLogPanel: document.querySelector("#mobileLogPanel"),
  mobileGameLog: document.querySelector("#mobileGameLog"),
  mobileLogExpandButton: document.querySelector("#mobileLogExpandButton"),
  turnStatus: document.querySelector("#turnStatus"),
  opponents: document.querySelector("#opponents"),
  deckCount: document.querySelector("#deckCount"),
  discard: document.querySelector(".discard"),
  discardTop: document.querySelector("#discardTop"),
  playerHint: document.querySelector("#playerHint"),
  playerHand: document.querySelector("#playerHand"),
  handToggle: document.querySelector("#handToggle"),
  drawButton: document.querySelector("#drawButton"),
  newGameButton: document.querySelector("#newGameButton"),
  explainButton: document.querySelector("#explainButton"),
  startModal: document.querySelector("#startModal"),
  startExplainButton: document.querySelector("#startExplainButton"),
  startGameButton: document.querySelector("#startGameButton"),
  opponentRoster: document.querySelector("#opponentRoster"),
  opponentSelectionSummary: document.querySelector("#opponentSelectionSummary"),
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
  placementHint: document.querySelector("#placementHint"),
  tutorial: document.querySelector("#tutorial"),
  tutorialScene: document.querySelector("#tutorialScene"),
  tutorialText: document.querySelector("#tutorialText"),
  tutorialProgress: document.querySelector("#tutorialProgress"),
  tutorialProgressBar: document.querySelector("#tutorialProgressBar"),
  tutorialPlacement: document.querySelector("#tutorialPlacement"),
  tutorialPlacementSelect: document.querySelector("#tutorialPlacementSelect"),
  tutorialPlacementHint: document.querySelector("#tutorialPlacementHint"),
  tutorialBackButton: document.querySelector("#tutorialBackButton"),
  tutorialNextButton: document.querySelector("#tutorialNextButton"),
  tutorialSkipButton: document.querySelector("#tutorialSkipButton"),
  closeTutorialButton: document.querySelector("#closeTutorialButton")
};

const tutorialSteps = [
  {
    title: "Blijf als laatste dino over",
    text: "Om de beurt speel je kaarten en trek je één kaart. Wie als laatste niet is ontploft, wint.",
    button: "Bekijk de andere kaarten",
    cards: ["meteor", "shelter"],
    tone: "goal"
  },
  {
    title: "Kaarten helpen je overleven en dwarsbomen",
    text: "Actiekaarten laten je aanvallen, vooruitkijken of de stapel veranderen. Twee gelijke soortkaarten speel je samen voor een extra effect.",
    button: "Zo eindigt je beurt",
    cards: ["raptor", "trike", "miniRaptor"],
    tone: "cards"
  },
  {
    title: "Trekken beëindigt je beurt",
    text: "Speel eerst zoveel kaarten als je wilt. Klik daarna op de trekstapel: je trekt één kaart en je beurt is voorbij.",
    button: "Laat een tegenstander trekken",
    cards: ["volcano"],
    tone: "turn"
  },
  {
    title: "Zonder Schuilgrot ontplof je",
    text: "De tegenstander trekt een Meteorietinslag en heeft geen Schuilgrot. Die dino is uitgeschakeld.",
    button: "Trek hem nu zelf",
    cards: ["meteor"],
    tone: "explosion"
  },
  {
    title: "Schuilgrot ontmantelt de inslag",
    text: "Jouw Schuilgrot wordt automatisch gebruikt en afgelegd. Je overleeft, maar de Meteorietinslag moet terug in de stapel.",
    button: "Plaats de meteoriet terug",
    cards: ["meteor", "shelter"],
    tone: "defuse"
  },
  {
    title: "Maak de volgende trek gevaarlijk",
    text: "Je kiest een geheime plek. Je wijst dus niet rechtstreeks iemand aan: die speler moet de Meteorietinslag later trekken.",
    button: "Begrepen — terug naar het spel",
    cards: ["meteor"],
    tone: "placement"
  }
];

function openTutorial() {
  tutorialStep = 0;
  closeMobileMenu();
  els.tutorial.classList.remove("is-hidden");
  renderTutorial();
  syncDialogAccessibility();
}

function closeTutorial() {
  els.tutorial.classList.add("is-hidden");
  syncDialogAccessibility();
}

function renderTutorial() {
  const step = tutorialSteps[tutorialStep];
  els.tutorialProgress.textContent = `Stap ${tutorialStep + 1} van ${tutorialSteps.length}`;
  els.tutorialProgressBar.style.width = `${((tutorialStep + 1) / tutorialSteps.length) * 100}%`;
  els.tutorialScene.className = `tutorial__scene is-${step.tone}`;
  els.tutorialScene.replaceChildren();

  const title = document.createElement("h3");
  title.textContent = step.title;
  const cards = document.createElement("div");
  cards.className = "tutorial__cards";
  step.cards.forEach((type) => {
    const card = document.createElement("div");
    card.className = "tutorial__card card-face";
    renderCardFace(card, makeCard(type, true), { mini: true });
    cards.append(card);
  });
  els.tutorialScene.append(title, cards);
  els.tutorialText.textContent = step.text;
  els.tutorialBackButton.disabled = tutorialStep === 0;
  els.tutorialNextButton.textContent = step.button;
  els.tutorialPlacement.classList.toggle("is-hidden", step.tone !== "placement");
  updateTutorialPlacementHint();
}

function advanceTutorial() {
  if (tutorialStep >= tutorialSteps.length - 1) {
    closeTutorial();
    return;
  }
  tutorialStep += 1;
  renderTutorial();
}

function retreatTutorial() {
  if (tutorialStep === 0) return;
  tutorialStep -= 1;
  renderTutorial();
}

function updateTutorialPlacementHint() {
  const hints = {
    top: "De volgende speler trekt hem als eerste: riskant en gemeen.",
    middle: "De inslag blijft nog even verborgen en duikt later weer op.",
    bottom: "Nu veilig, maar het gevaar blijft in het spel."
  };
  els.tutorialPlacementHint.textContent = hints[els.tutorialPlacementSelect.value];
}

function getOpponentCount() {
  return Math.max(MIN_OPPONENTS, Math.min(MAX_OPPONENTS, selectedOpponentIds.length));
}

function getSelectedOpponentIds() {
  if (selectedOpponentIds.length < MIN_OPPONENTS) {
    selectedOpponentIds = opponentPersonas.slice(0, DEFAULT_OPPONENTS).map((persona) => persona.personaId);
  }

  return selectedOpponentIds.slice(0, MAX_OPPONENTS);
}

function startGame() {
  closeStartModal();
  const selectedOpponents = getSelectedOpponentIds();
  const players = createPlayers(selectedOpponents);
  const playerCount = players.length;

  state = structuredClone(initialState);
  state.players = players;
  state.current = chooseStartingPlayerId(players, runtimeRandom());
  state.hands = Object.fromEntries(players.map((player) => [player.id, []]));
  players.forEach((player) => addCardToHand(player.id, makeCard("shelter", true)));
  state.pendingTurns = Object.fromEntries(players.map((player) => [player.id, 1]));
  state.eliminated = Object.fromEntries(players.map((player) => [player.id, false]));
  activeReveal = null;
  isPlayerHandOpen = false;
  els.gameLog.replaceChildren();

  const pool = buildCardPool(playerCount);

  for (let i = 0; i < 7; i += 1) {
    players.forEach((player) => {
      const card = pool.pop();
      if (card) addCardToHand(player.id, card);
    });
  }

  const { mode, extraDefuses, meteors } = calculateSetupCounts(playerCount, partyPackDistribution, deckModeForPlayers);
  const drawPile = [
    ...pool,
    ...Array.from({ length: extraDefuses }, () => makeCard("shelter", mode === "compact")),
    ...Array.from({ length: meteors }, () => makeCard("meteor", false))
  ];

  state.deck = shuffle(drawPile);

  log(`Nieuw Party Pack spel gestart met ${playerCount} spelers.`);
  log(`${label(state.current)} begint.`);
  log(`Tegenstanders: ${players.filter((player) => !player.isHuman).map((player) => player.name).join(", ")}.`);
  log(`Stapel bevat ${meteors} Meteorietinslag en ${extraDefuses} extra Schuilgrot.`);
  setAction("Speel actiekaarten, maak paren met soortkaarten, of trek om je beurt te eindigen.");
  render();
}

function openStartModal() {
  activeReveal = null;
  clearPendingInteractions();
  if (state.players.length > 0) {
    state.gameOver = true;
  }
  els.startModal.classList.remove("is-hidden");
  setAction("Kies je tegenspelers om een nieuw spel te starten.");
  renderOpponentRoster();
  render();
}

function closeStartModal() {
  els.startModal.classList.add("is-hidden");
}

function clearPendingInteractions() {
  clearInteractions(state);
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
  assertValidInteractionState(state);
  const currentPlayer = getPlayer(state.current);
  const playerZone = document.querySelector(".player-zone");
  const playerColor = getPlayer("player")?.color ?? playerColors[0];
  const hasGame = state.players.length > 0;
  const handCount = getHand("player").length;
  const viewModel = createSingleplayerViewModel({
    state,
    viewerId: "player",
    colors: playerColors,
    subtitle: playerSubtitle,
    canPlayCard: (card) => canPlayCard("player", card),
    drawBlocked: isInteractionBlocked(),
    handBlocked: isHandClickBlocked(),
    viewerHand: getSortedHand("player")
  });

  renderPageChrome();
  SharedGameView.renderTable({
    turnStatus: els.turnStatus,
    deckCount: els.deckCount,
    discard: els.discard,
    discardTop: els.discardTop,
    playerHint: els.playerHint,
    drawButton: els.drawButton,
    opponents: els.opponents,
    playerHand: els.playerHand
  }, viewModel, {
    renderCardFace,
    onCard: (card) => inspectPlayerCard(card.id)
  });
  els.drawButton.classList.toggle("is-drawing", motion.kind === "draw");
  els.discard.classList.toggle("is-receiving", motion.kind === "discard");
  playerZone.style.setProperty("--player-color", playerColor);
  playerZone.classList.toggle("is-current", state.current === "player" && !state.gameOver);
  playerZone.classList.toggle("is-hand-collapsed", !isPlayerHandOpen);
  if (els.handToggle) {
    els.handToggle.textContent = isPlayerHandOpen ? `Sluit hand (${handCount})` : `Open hand (${handCount})`;
    els.handToggle.setAttribute("aria-expanded", String(isPlayerHandOpen));
    els.handToggle.disabled = !hasGame || state.eliminated.player;
  }

  renderOpponentRoster();
  renderMobileMenu();
  renderReveal();
  renderCatalogDetail();
  syncDialogAccessibility();
}

function getVisibleDialog() {
  return [els.mobileMenu, els.tutorial, els.startModal, els.catalogDetail, els.drawReveal]
    .find((dialog) => dialog && !dialog.classList.contains("is-hidden")) ?? null;
}

function getDialogFocusables(dialog) {
  if (!dialog?.querySelectorAll) return [];
  return [...dialog.querySelectorAll("button:not(:disabled), select:not(:disabled), [href], [tabindex]:not([tabindex=\"-1\"])")]
    .filter((element) => !element.closest(".is-hidden"));
}

function syncDialogAccessibility() {
  const nextDialog = getVisibleDialog();
  document.body?.classList?.toggle("has-open-dialog", Boolean(nextDialog));
  if (nextDialog === activeDialog) return;

  if (nextDialog) {
    if (!activeDialog) dialogReturnFocus = document.activeElement ?? null;
    activeDialog = nextDialog;
    Promise.resolve().then(() => getDialogFocusables(activeDialog)[0]?.focus?.());
    return;
  }

  activeDialog = null;
  const returnTarget = dialogReturnFocus;
  dialogReturnFocus = null;
  Promise.resolve().then(() => returnTarget?.focus?.());
}

function renderDiscardPile() {
  SharedGameView.renderDiscard(els.discard, els.discardTop, state.discard.at(-1) ?? null, renderCardFace);
  els.discard.classList.toggle("is-receiving", motion.kind === "discard");
}

function renderPageChrome() {
  const isCatalog = currentPage === "catalog";
  els.gameTable.classList.toggle("is-hidden", isCatalog);
  els.sidePanel.classList.toggle("is-hidden", isCatalog);
  els.catalogPage.classList.toggle("is-hidden", !isCatalog);
  els.showGamePage.classList.toggle("is-active", !isCatalog);
  els.showCatalogPage.classList.toggle("is-active", isCatalog);
  els.showGamePage.setAttribute("aria-current", isCatalog ? "false" : "page");
  els.showCatalogPage.setAttribute("aria-current", isCatalog ? "page" : "false");
}

function getNopeRevealContext(pendingNopeReaction) {
  if (!pendingNopeReaction) return {};

  if ((pendingNopeReaction.nopeCount ?? 0) > 0) {
    return {
      owner: pendingNopeReaction.lastReactor,
      target: pendingNopeReaction.reactor
    };
  }

  return {
    owner: pendingNopeReaction.actor,
    target: pendingNopeReaction.context?.target ?? null
  };
}

function renderMobileMenu() {
  if (!els.mobileMenu) return;

  els.mobileMenu.classList.toggle("is-hidden", !isMobileMenuOpen);
  els.mobileLogPanel?.classList.toggle("is-hidden", !isMobileLogOpen);
  els.mobileMenuButton?.setAttribute("aria-expanded", String(isMobileMenuOpen));
  els.mobileLogButton?.setAttribute("aria-expanded", String(isMobileLogOpen));

  if (!els.mobileGameLog) return;

  const entries = [...els.gameLog.children];
  const visibleEntries = isFullLogOpen ? entries : entries.slice(-5);
  els.mobileGameLog.replaceChildren();
  visibleEntries.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry.textContent;
    els.mobileGameLog.append(item);
  });
  const canExpand = entries.length > 5;
  els.mobileLogExpandButton?.classList.toggle("is-hidden", !canExpand);
  if (els.mobileLogExpandButton) {
    els.mobileLogExpandButton.textContent = isFullLogOpen ? "Toon laatste 5 acties" : "Toon volledig logboek";
    els.mobileLogExpandButton.setAttribute("aria-expanded", String(isFullLogOpen));
  }
}

function renderOpponentRoster() {
  if (!els.opponentRoster) return;

  els.opponentRoster.replaceChildren();
  const selected = new Set(selectedOpponentIds);
  const countText = `${selectedOpponentIds.length} gekozen`;
  els.opponentSelectionSummary.textContent = countText;

  opponentPersonas.forEach((persona, index) => {
    const button = document.createElement("button");
    const isSelected = selected.has(persona.personaId);
    button.className = "roster-card";
    button.type = "button";
    button.dataset.selected = String(isSelected);
    button.style.setProperty("--player-color", persona.color ?? playerColors[(index % (playerColors.length - 1)) + 1]);
    button.setAttribute("aria-pressed", String(isSelected));
    button.setAttribute("aria-label", `${persona.name} ${isSelected ? "niet meer kiezen" : "kiezen"}`);

    const portrait = createPlayerPortrait(persona);

    const text = document.createElement("span");
    text.className = "roster-card__text";

    const name = document.createElement("strong");
    name.textContent = persona.name;

    const role = document.createElement("small");
    role.textContent = playerSubtitle(persona);

    text.append(name, role);
    button.append(portrait, text);
    button.addEventListener("click", () => toggleOpponentSelection(persona.personaId));
    els.opponentRoster.append(button);
  });
}

function toggleOpponentSelection(personaId) {
  const isSelected = selectedOpponentIds.includes(personaId);

  if (isSelected) {
    if (selectedOpponentIds.length <= MIN_OPPONENTS) return;
    selectedOpponentIds = selectedOpponentIds.filter((id) => id !== personaId);
  } else if (selectedOpponentIds.length < MAX_OPPONENTS) {
    selectedOpponentIds = [...selectedOpponentIds, personaId];
  } else {
    selectedOpponentIds = [...selectedOpponentIds.slice(1), personaId];
  }

  renderOpponentRoster();
}

function confirmStartSelection() {
  closeStartModal();
  startGame();
}

function togglePlayerHand() {
  isPlayerHandOpen = !isPlayerHandOpen;
  render();
}

function openMobileMenu() {
  isMobileMenuOpen = true;
  render();
}

function closeMobileMenu() {
  isMobileMenuOpen = false;
  isMobileLogOpen = false;
  isFullLogOpen = false;
  render();
}

function toggleMobileLog() {
  isMobileLogOpen = !isMobileLogOpen;
  isFullLogOpen = false;
  render();
}

function toggleFullLog() {
  isFullLogOpen = !isFullLogOpen;
  render();
}

function showPageFromMobileMenu(page) {
  isMobileMenuOpen = false;
  isMobileLogOpen = false;
  showPage(page);
}

function startNewGameFromMobileMenu() {
  closeMobileMenu();
  openStartModal();
}

function showPage(page) {
  currentPage = page;
  if (page === "catalog") {
    renderCatalogGrid();
  }
  render();
}

function renderOpponents() {
  const model = createSingleplayerViewModel({ state, viewerId: "player", colors: playerColors, subtitle: playerSubtitle, canPlayCard: (card) => canPlayCard("player", card), drawBlocked: isInteractionBlocked(), handBlocked: isHandClickBlocked(), viewerHand: getSortedHand("player") });
  SharedGameView.renderOpponents(els.opponents, model.opponents);
}

function createPlayerPortrait(player, options = {}) {
  return SharedGameView.createPlayerPortrait({ ...player, color: player.color ?? playerColors[1], initials: player.initials ?? player.name.slice(0, 2) }, options);
}

function renderPlayerHand() {
  const model = createSingleplayerViewModel({ state, viewerId: "player", colors: playerColors, subtitle: playerSubtitle, canPlayCard: (card) => canPlayCard("player", card), drawBlocked: isInteractionBlocked(), handBlocked: isHandClickBlocked(), viewerHand: getSortedHand("player") });
  SharedGameView.renderHand(els.playerHand, model.hand, { renderCardFace, onCard: (card) => inspectPlayerCard(card.id) });
}

function renderReveal() {
  const pendingCardDetail = state.pendingCardDetail;
  const pendingPlacement = state.pendingMeteorPlacement;
  const pendingOracle = state.pendingOracle;
  const pendingDigChoice = state.pendingDigChoice;
  const pendingFossilChoice = state.pendingFossilChoice;
  const pendingDiscardChoice = state.pendingDiscardChoice;
  const pendingBrontoChoice = state.pendingBrontoChoice;
  const pendingPteroChoice = state.pendingPteroChoice;
  const pendingStealTarget = state.pendingStealTarget;
  const pendingNopeReaction = state.pendingNopeReaction;
  const pendingAttackReaction = state.pendingAttackReaction;
  const pendingRaptorTarget = state.pendingRaptorTarget;
  const pendingDraw = state.pendingDraw;
  const nopeContext = getNopeRevealContext(pendingNopeReaction);
  const revealOwner = pendingDraw?.owner ?? pendingAttackReaction?.actor ?? nopeContext.owner ?? pendingNopeReaction?.actor ?? pendingRaptorTarget?.owner ?? pendingStealTarget?.owner ?? pendingPteroChoice?.owner ?? pendingBrontoChoice?.owner ?? pendingDiscardChoice?.owner ?? pendingDigChoice?.owner ?? pendingOracle?.owner ?? pendingPlacement?.owner ?? pendingCardDetail?.owner ?? activeReveal?.owner;
  const revealTarget = pendingAttackReaction?.target ?? nopeContext.target ?? activeReveal?.target ?? null;
  els.drawReveal.style.setProperty("--player-color", getPlayer(revealOwner)?.color ?? playerColors[0]);

  if (!pendingCardDetail && !pendingPlacement && !pendingOracle && !pendingDigChoice && !pendingFossilChoice && !pendingDiscardChoice && !pendingBrontoChoice && !pendingPteroChoice && !pendingStealTarget && !pendingNopeReaction && !pendingAttackReaction && !pendingRaptorTarget && !pendingDraw && !activeReveal) {
    els.drawReveal.classList.add("is-hidden");
    removeRevealContext();
    els.placementControls.classList.add("is-hidden");
    els.revealSecondaryButton.classList.add("is-hidden");
    els.revealButton.disabled = false;
    return;
  }

  els.drawReveal.classList.remove("is-hidden");
  els.revealCard.className = "draw-reveal__card";
  els.revealCard.replaceChildren();
  renderRevealContext(revealOwner, revealTarget);
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
    if (activeReveal.endGame) {
      renderEndGameReveal(activeReveal);
    } else if (activeReveal.cards.length === 1 && activeReveal.faceDown) {
      renderClosedRevealCard();
    } else if (activeReveal.cards.length === 1) {
      renderOpenRevealCard(activeReveal.cards[0], activeReveal.shaking);
      if (activeReveal.motionTone) {
        els.revealCard.classList.add(`is-${activeReveal.motionTone}-moment`);
      }
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
    renderStealCardChoices(pendingFossilChoice);
    els.revealText.textContent = pendingFossilChoice.cards.length
      ? `Kies ${pendingFossilChoice.maxSelect > 1 ? `maximaal ${pendingFossilChoice.maxSelect} gesloten kaarten` : "een gesloten kaart"} uit de hand van ${objectLabel(pendingFossilChoice.target)}.`
      : `${label(pendingFossilChoice.target)} heeft geen kaarten om te stelen.`;
    els.revealButton.textContent = pendingFossilChoice.cards.length ? "Steel kaart" : "Verder";
    els.revealButton.disabled = pendingFossilChoice.cards.length > 0 && (pendingFossilChoice.selectedIndexes ?? []).length === 0;
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

  if (pendingBrontoChoice) {
    els.revealEyebrow.textContent = "Bronto Buik";
    renderOpenRevealCard(pendingBrontoChoice.topCard);
    els.revealText.textContent = "Je ziet de bovenste kaart van de trekstapel. Laat hem liggen, of schuif hem onderop in de Bronto-buik.";
    els.revealButton.textContent = "Laat bovenop";
    els.revealSecondaryButton.textContent = "Schuif onderop";
    els.revealSecondaryButton.classList.remove("is-hidden");
    return;
  }

  if (pendingPteroChoice) {
    els.revealEyebrow.textContent = "Ptero Pret";
    renderPteroChoices(pendingPteroChoice);
    els.revealText.textContent = pendingPteroChoice.cards.length > 1
      ? "Kies welke kaart bovenop blijft. De andere vliegt naar de bodem van de trekstapel."
      : "Er is maar 1 kaart om te bekijken, dus die blijft bovenop.";
    els.revealButton.textContent = "Vlucht vastleggen";
    els.revealButton.disabled = pendingPteroChoice.cards.length > 1 && !pendingPteroChoice.selectedTopId;
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
    renderOpenRevealCard(pendingNopeReaction.nopeCount > 0 ? pendingNopeReaction.lastNopeCard : pendingNopeReaction.card);
    els.revealText.textContent = pendingNopeReaction.nopeCount > 0
      ? `${label(pendingNopeReaction.lastReactor)} speelde Brul Terug. Wil je daar zelf Brul Terug overheen spelen?`
      : `${label(pendingNopeReaction.actor)} speelt ${pendingNopeReaction.card.name}. Wil je Brul Terug inzetten om het effect te stoppen?`;
    els.revealButton.textContent = "Laat doorgaan";
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
  els.revealCard.classList.add("is-draw-arriving");

  if (isVisible) {
    renderOpenRevealCard(card, isMeteor);
  } else {
    els.revealCard.classList.add("is-back");
    els.revealCard.setAttribute("aria-label", "Gesloten dino kaart");
  }

  if (isMeteor) {
    const hasShelter = getHand(owner).some((item) => item.type === "shelter");
    els.revealCard.classList.add(hasShelter ? "is-shelter-save-moment" : "is-meteor-moment");
    els.revealText.textContent = hasShelter
      ? `${label(owner)} trekt een Meteorietinslag. Schuilgrot kan hem redden.`
      : `${label(owner)} trekt een Meteorietinslag zonder Schuilgrot.`;
    els.revealButton.textContent = owner === "player"
      ? hasShelter ? "Gebruik Schuilgrot" : "Laat ontploffen"
      : "OK";
  } else {
    els.revealText.textContent = owner === "player"
      ? "Lees de kaart rustig. Klik daarna om hem aan je hand toe te voegen."
      : `${label(owner)} trekt een gesloten kaart. ${subjectPronoun(owner, true)} houdt hem geheim.`;
    els.revealButton.textContent = owner === "player" ? "Neem kaart in hand" : "OK";
  }

  els.revealButton.disabled = false;
}

function renderRevealContext(owner, target = null) {
  removeRevealContext();
  renderRevealActor(owner);
  if (!owner || !target || owner === target) return;
  renderRevealAttackFlow(owner, target);
}

function renderRevealActor(owner) {
  removeRevealActor();
  const player = getPlayer(owner);
  if (!player) return;

  const actor = document.createElement("div");
  actor.className = "reveal-actor";
  actor.style.setProperty("--player-color", player.color ?? playerColors[0]);

  const portrait = createPlayerPortrait(player);
  const text = document.createElement("span");
  text.className = "reveal-actor__text";

  const name = document.createElement("strong");
  name.textContent = player.name;

  const role = document.createElement("small");
  role.textContent = player.isHuman ? "Speler" : playerSubtitle(player);

  text.append(name, role);
  actor.append(portrait, text);
  els.revealEyebrow.insertAdjacentElement("afterend", actor);
}

function renderRevealAttackFlow(owner, target) {
  const attacker = getPlayer(owner);
  const defender = getPlayer(target);
  if (!attacker || !defender) return;

  const flow = document.createElement("div");
  flow.className = "reveal-attack-flow";
  flow.setAttribute("aria-label", `${attacker.name} valt ${target === "player" ? "jou" : defender.name} aan`);

  const from = createRevealFlowPlayer(attacker);
  const arrow = document.createElement("span");
  arrow.className = "reveal-attack-flow__arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "->";
  const to = createRevealFlowPlayer(defender);

  flow.append(from, arrow, to);
  const actor = document.querySelector(".reveal-actor");
  actor?.insertAdjacentElement("afterend", flow);
}

function createRevealFlowPlayer(player) {
  const item = document.createElement("span");
  item.className = "reveal-attack-flow__player";
  item.style.setProperty("--player-color", player.color ?? playerColors[0]);

  const portrait = createPlayerPortrait(player, { small: true });
  const name = document.createElement("strong");
  name.textContent = player.isHuman ? "Jij" : player.name;

  item.append(portrait, name);
  return item;
}

function removeRevealContext() {
  removeRevealActor();
  const flow = document.querySelector(".reveal-attack-flow");
  if (!flow) return;
  if (typeof flow.remove === "function") {
    flow.remove();
  } else if (flow.parentNode && typeof flow.parentNode.removeChild === "function") {
    flow.parentNode.removeChild(flow);
  }
}

function removeRevealActor() {
  const actor = document.querySelector(".reveal-actor");
  if (!actor) return;
  if (typeof actor.remove === "function") {
    actor.remove();
  } else if (actor.parentNode && typeof actor.parentNode.removeChild === "function") {
    actor.parentNode.removeChild(actor);
  }
}

function renderOpenRevealCard(card, isShaking = false) {
  SharedRevealView.openCard(els.revealCard, card, renderCardFace, { shaking: isShaking });
}

function renderClosedRevealCard() {
  SharedRevealView.closedCard(els.revealCard);
}

function renderRevealCards(cards, options = {}) {
  SharedRevealView.cards(els.revealCard, cards, renderCardFace, options);
}

const cardKindIcons = {
  action: {
    src: "assets/cards/icons/action.svg",
    className: "action",
    label: "Actie"
  },
  danger: {
    src: "assets/cards/icons/danger.svg",
    className: "danger",
    label: "Gevaar"
  },
  defuse: {
    src: "assets/cards/icons/defuse.svg",
    className: "defuse",
    label: "Redding"
  },
  set: {
    src: "assets/cards/icons/set-pair.svg",
    className: "set-pair",
    label: "Spaarkaart"
  }
};

function renderCardFace(element, card, options = {}) {
  element.dataset.kind = card.kind;
  delete element.dataset.tone;
  element.classList.remove("card-face", "card-face--mini", "card-face--large");
  element.replaceChildren();

  if (!card.design) {
    const title = document.createElement("strong");
    title.textContent = card.name;
    const text = document.createElement("span");
    text.textContent = card.text;
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

  header.append(title);
  const kindIcon = cardKindIcons[card.kind];
  if (kindIcon) {
    const icon = document.createElement("span");
    icon.className = `card-face__icon card-face__icon--${kindIcon.className}`;
    icon.setAttribute("aria-label", kindIcon.label);
    icon.setAttribute("title", kindIcon.label);

    const image = document.createElement("img");
    image.src = kindIcon.src;
    image.alt = "";
    icon.append(image);
    header.append(icon);
  } else {
    header.classList.add("card-face__header--no-icon");
  }

  const art = document.createElement("div");
  art.className = "card-face__art";

  const image = document.createElement("img");
  image.src = card.design.image;
  image.alt = "";
  image.loading = "lazy";
  const crop = card.design.crop ?? {};
  image.style.setProperty("--card-art-position", crop.default ?? "50% 50%");
  image.style.setProperty("--card-art-position-mini", crop.mini ?? crop.default ?? "50% 50%");
  image.style.setProperty("--card-art-position-large", crop.large ?? crop.default ?? "50% 50%");
  art.append(image);

  const text = document.createElement("span");
  text.className = "card-face__text";
  text.textContent = card.text;

  element.append(header, art, text);
}

function renderCatalogGrid() {
  const entries = Object.entries(cardCatalog);
  els.catalogGrid.replaceChildren();
  els.catalogCount.textContent = `${entries.length} unieke kaarten`;

  entries.forEach(([type]) => {
    const card = createCatalogCard(type);
    const button = document.createElement("button");
    button.className = "catalog-card";
    button.type = "button";
    button.dataset.kind = card.kind;
    button.setAttribute("aria-label", `${card.name} openen`);
    renderCardFace(button, card);

    const meta = document.createElement("span");
    meta.className = "catalog-card__meta";
    meta.textContent = getCatalogMeta(type, card);
    button.append(meta);

    button.addEventListener("click", () => openCatalogCard(type));
    els.catalogGrid.append(button);
  });
}

function createCatalogCard(type) {
  const catalogCard = cardCatalog[type];

  return {
    id: `catalog-${type}`,
    type,
    isCompact: false,
    ...catalogCard,
    design: resolveDesign(type)
  };
}

function getCatalogMeta(type, card) {
  const count = partyPackDistribution[type]?.total;
  const kindLabels = {
    danger: "gevaar",
    defuse: "redding",
    action: "actie",
    set: "soort"
  };
  const labelText = kindLabels[card.kind] ?? card.kind;
  return count ? `${labelText} - ${count} in Party Pack` : labelText;
}

function openCatalogCard(type) {
  selectedCatalogType = type;
  renderCatalogDetail();
}

function closeCatalogCard() {
  selectedCatalogType = null;
  renderCatalogDetail();
}

function renderCatalogDetail() {
  els.catalogDetail.classList.toggle("is-hidden", !selectedCatalogType);
  if (!selectedCatalogType) {
    syncDialogAccessibility();
    return;
  }

  const card = createCatalogCard(selectedCatalogType);
  els.catalogDetailKind.textContent = getCatalogMeta(selectedCatalogType, card);
  els.catalogDetailTitle.textContent = card.name;
  els.catalogDetailText.textContent = card.text;
  els.catalogDetailCard.className = "catalog-detail__card";
  renderCardFace(els.catalogDetailCard, card, { large: true });
  syncDialogAccessibility();
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
    renderCardFace(item, card, { mini: true });
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

function renderStealCardChoices(pendingFossilChoice) {
  els.revealCard.classList.add("is-multi", "is-fossil-choice");
  const selected = new Set(pendingFossilChoice.selectedIndexes ?? []);
  els.revealCard.append(...SharedChoiceView.closedCards(pendingFossilChoice.cards.length, { selected, onSelect: selectStealCard }));
}

function renderDiscardChoices(pendingDiscardChoice) {
  els.revealCard.classList.add("is-multi", "is-discard-choice");

  els.revealCard.append(...SharedChoiceView.cardChoices(pendingDiscardChoice.cards, { renderCardFace, onSelect: (card) => confirmDiscardChoice(pendingDiscardChoice.cards.findIndex((item) => item.id === card.id)) }));
}

function renderTargetChoices(pendingStealTarget) {
  els.revealCard.classList.add("is-multi", "is-steal-target");

  const targets = pendingStealTarget.targets.map((id) => ({ ...getPlayer(id), label: label(id), cardCount: getHand(id).length }));
  els.revealCard.append(...SharedChoiceView.targetChoices(targets, { selectedId: pendingStealTarget.selectedTarget, onSelect: (target) => selectStealTarget(target.id), createPortrait: createPlayerPortrait }));
}

function renderPteroChoices(pendingPteroChoice) {
  els.revealCard.classList.add("is-multi", "is-ptero-choice");

  els.revealCard.append(...SharedChoiceView.cardChoices(pendingPteroChoice.cards, { className: "ptero-choice", selectedId: pendingPteroChoice.selectedTopId, renderCardFace, onSelect: (card) => selectPteroTop(card.id) }));
}

function renderAttackReactionChoices(pendingAttackReaction) {
  els.revealCard.classList.add("is-multi", "is-attack-reaction");
  const groupedCards = getSortedHand("player").reduce((groups, card) => {
    const playable = canPlayAttackReactionCard(card);
    groups[playable ? "playable" : "disabled"].push({ card, playable });
    return groups;
  }, { playable: [], disabled: [] });

  if (groupedCards.playable.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "reaction-empty-message";
    emptyMessage.textContent = "Je hebt geen kaart die deze aanval kan beantwoorden.";
    els.revealCard.append(emptyMessage);
  } else {
    groupedCards.playable.forEach(({ card, playable }) => {
      els.revealCard.append(createAttackReactionCardButton(card, playable));
    });
  }

  if (groupedCards.disabled.length > 0) {
    const divider = document.createElement("div");
    divider.className = "reaction-divider";
    divider.textContent = "Niet speelbaar";
    els.revealCard.append(divider);
  }

  groupedCards.disabled.forEach(({ card, playable }) => {
    els.revealCard.append(createAttackReactionCardButton(card, playable));
  });
}

function createAttackReactionCardButton(card, playable) {
    return SharedChoiceView.reactionCard(card, { playable, renderCardFace, onSelect: (selected) => resolveAttackReactionWithCard(selected.id) });
}

function renderRaptorTargetChoices(pendingRaptorTarget) {
  els.revealCard.classList.add("is-multi", "is-raptor-target");

  pendingRaptorTarget.targets.forEach((target) => {
    const player = getPlayer(target);
    const button = document.createElement("button");
    button.className = "draw-reveal__mini-card raptor-target";
    button.type = "button";
    button.style.setProperty("--player-color", getPlayer(target)?.color ?? playerColors[0]);
    button.dataset.selected = String(target === pendingRaptorTarget.selectedTarget);
    button.append(createPlayerPortrait(player, { small: true }), document.createTextNode(label(target)));
    button.addEventListener("click", () => selectRaptorTarget(target));
    els.revealCard.append(button);
  });
}

function renderEndGameReveal(reveal) {
  els.revealCard.classList.add("end-card", reveal.winner === "player" ? "is-win" : "is-loss");
  els.revealCard.replaceChildren();

  const title = document.createElement("strong");
  title.textContent = reveal.winner === "player" ? "Gefeliciteerd" : reveal.winner ? "Jammer" : "Einde";

  const scene = document.createElement("div");
  scene.className = "end-card__scene";

  const image = document.createElement("img");
  image.src = reveal.winner === "player"
    ? "assets/endings/victory-dino.png"
    : "assets/endings/defeat-dino.png";
  image.alt = reveal.winner === "player"
    ? "Vrolijke dino viert de overwinning"
    : "Dino kijkt verslagen na een komische meteorietinslag";
  image.loading = "lazy";
  scene.append(image);

  const setup = document.createElement("p");
  setup.className = "end-card__setup";

  const setupText = document.createElement("span");
  setupText.textContent = `${selectedOpponentIds.length} tegenstander${selectedOpponentIds.length === 1 ? "" : "s"} geselecteerd in het roster.`;

  setup.append(setupText);
  els.revealCard.append(title, scene, setup);
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
  target = null,
  onClose = null,
  onSecondary = null,
  endGame = false,
  winner = null,
  motionTone = null
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
    target,
    onClose,
    onSecondary,
    endGame,
    winner,
    motionTone: motionTone ?? (shaking ? "meteor" : null)
  };
  render();
}

function markMotion(kind, tone = null) {
  const id = motion.id + 1;
  motion = { kind, tone, id };
  window.clearTimeout?.(motionTimer);
  motionTimer = schedule(() => {
    if (motion.id !== id) return;
    motion = { kind: null, tone: null, id };
    els.drawButton.classList.remove("is-drawing");
    els.discard.classList.remove("is-receiving");
  }, 420);
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

function playCard(owner, cardId, options = {}) {
  if (state.gameOver || owner !== state.current || isInteractionBlocked()) return;

  const hand = getHand(owner);
  const index = hand.findIndex((card) => card.id === cardId);
  if (index === -1) return;

  const card = hand[index];
  if (!canPlayCard(owner, card)) return;
  if (isSetCard(card)) {
    playSetPair(owner, card, options);
    return;
  }

  hand.splice(index, 1);
  state.discard.push(card);
  state.activity = { owner, type: "play" };
  markMotion("discard", card.type);
  log(`${label(owner)} speelt ${card.name}.`);
  const preview = getActionPreview(owner, card);
  const playerCanReactToAttack = owner !== "player" && isAttackCard(card) && preview.target === "player";
  const resolvePlayedCard = () => {
    if (playerCanReactToAttack) {
      startAttackReaction(owner, card, preview.target);
      return false;
    }

    offerNopeReaction(owner, card, { target: preview.target });
    return true;
  };

  showCardMoment({
    title: `${label(owner)} speelt`,
    cards: card,
    text: preview.text,
    buttonText: "OK",
    owner,
    target: getCardMomentTarget(owner, card, preview),
    onClose: resolvePlayedCard
  });
}

function getCardMomentTarget(owner, card, preview) {
  if (!isAttackCard(card)) return null;
  if (card.type === "targetedRaptor" && owner === "player") return null;
  return preview.target;
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
    const nextTarget = nextActivePlayer(owner);
    return {
      target: nextTarget,
      text: `${label(owner)} speelt ${card.name}. De raptor jaagt op de volgende speler: ${objectLabel(nextTarget)}.`
    };
  }

  if (card.type === "targetedRaptor" && target) {
    if (owner === "player") {
      return {
        target: null,
        text: `${label(owner)} speelt ${card.name} en kiest zo wie de raptor opjaagt.`
      };
    }

    return {
      target,
      text: `${label(owner)} speelt ${card.name} op ${objectLabel(target)}.`
    };
  }

  return {
    target: null,
    text: "Klik verder om het effect van deze kaart af te handelen."
  };
}

function playSetPair(owner, card, options = {}) {
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
  markMotion("discard", rewardType);

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
  return determineSetPairRewardType(pair, selectedCard);
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

  if (rewardType === "brontoBuik") {
    return "Bronto Buik bekijkt de bovenste kaart en mag die onderop schuiven.";
  }

  if (rewardType === "triceraTuk") {
    return "Tricera-Tuk dut door 1 open beurt heen zonder een kaart te trekken.";
  }

  if (rewardType === "pteroPret") {
    return "Ptero Pret bekijkt de bovenste 2 kaarten en laat er 1 bovenop, 1 onderop.";
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

  if (rewardType === "brontoBuik") {
    startBrontoBelly(owner);
    return;
  }

  if (rewardType === "triceraTuk") {
    resolveTriceraTuk(owner);
    return;
  }

  if (rewardType === "pteroPret") {
    startPteroPret(owner);
    return;
  }

  startPairSteal(owner, initialTarget);
}

function findPairForCard(hand, card) {
  if (!isSetCard(card)) return [];

  if (card.type === "feral") {
    const otherSet = hand.find((item) => item.id !== card.id && isSetRewardCard(item));
    return otherSet ? [card, otherSet] : [];
  }

  const same = hand.find((item) => item.id !== card.id && item.type === card.type);
  if (same) return [card, same];

  const feral = hand.find((item) => item.type === "feral");
  return feral ? [card, feral] : [];
}

function resolveCard(owner, card, context = {}) {
  const target = context.target ?? chooseDefaultTarget(owner);
  const turnEffect = getCardTurnEffect(card);

  if (turnEffect === "skipTurn") {
    resolveSprint(owner);
    return;
  }

  if (card.type === "raptor") {
    const raptorTarget = context.target ?? nextActivePlayer(owner);
    if (!raptorTarget || raptorTarget === owner) return;
    const returnTo = getAttackReturn(owner, context.returnTo);
    const attackLoad = getAttackLoad(owner, context.attackLoad);
    endTurnForPlayedCard(owner, card);
    resolveRaptorAttack(owner, raptorTarget, attackLoad, returnTo);
    return;
  }

  if (card.type === "targetedRaptor") {
    const returnTo = getAttackReturn(owner, context.returnTo);
    const attackLoad = getAttackLoad(owner, context.attackLoad);
    if (context.target) {
      endTurnForPlayedCard(owner, card);
      resolveRaptorTarget(owner, context.target, attackLoad, returnTo);
      return;
    }
    endTurnForPlayedCard(owner, card);
    chooseRaptorTarget(owner, attackLoad, returnTo);
    return;
  }

  if (card.type === "trike") {
    startTrikePeek(owner);
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
  if (!canReactWithNope(card)) {
    resolveCard(actor, card, context);
    return;
  }

  continueNopeChain({
    actor,
    card,
    context,
    lastReactor: actor,
    lastNopeCard: null,
    nopeCount: 0,
    skipPlayer: Boolean(context.skipPlayer)
  });
}

function startAttackReaction(actor, card, target) {
  const currentLoad = Math.max(RAPTOR_TURN_LOAD, state.pendingTurns[target] ?? 1);
  state.pendingAttackReaction = {
    actor,
    card,
    target,
    attackLoad: currentLoad,
    context: { target, attackLoad: currentLoad, returnTo: actor }
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
  markMotion("discard", reactionCard.type);
  state.pendingAttackReaction = null;

  if (reactionCard.type === "nope") {
    log(`Jij blokkeert ${pending.card.name} met Brul Terug.`);
    startNopeChainWithPlayedCard({
      actor: pending.actor,
      card: pending.card,
      context: pending.context,
      reactor: "player",
      nopeCard: reactionCard,
      nopeCount: 0
    });
    return;
  }

  const shiftedLoad = pending.attackLoad + RAPTOR_TURN_LOAD;
  const returnTo = pending.context?.returnTo ?? pending.actor;
  log(`Jij schuift de aanval terug met ${reactionCard.name}.`);

  if (reactionCard.type === "targetedRaptor") {
    state.pendingRaptorTarget = {
      owner: "player",
      targets: activeOpponentsOf("player"),
      selectedTarget: activeOpponentsOf("player").includes(pending.actor) ? pending.actor : activeOpponentsOf("player")[0],
      attackLoad: shiftedLoad,
      returnTo,
      isReaction: true
    };
    setAction("Gerichte Raptorjacht kaatst de aanval door. Kies wie de hele stapel beurten krijgt.");
    render();
    return;
  }

  showCardMoment({
    title: "Tegenaanval",
    cards: reactionCard,
    text: `De aanval schuift naar ${objectLabel(pending.actor)}. Die moet nu ${shiftedLoad} kaarten trekken, tenzij die zich verdedigt.`,
    buttonText: "OK",
    owner: "player",
    target: pending.actor,
    onClose: () => resolveRaptorAttack("player", pending.actor, shiftedLoad, returnTo)
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

function clampChance(value) {
  return Math.max(0, Math.min(1, value));
}

function getPcStyleProfile(owner) {
  const style = getPlayer(owner)?.playStyle;
  return pcStyleProfiles[style] ?? defaultPcStyleProfile;
}

function pcStyleChance(owner, key, fallback) {
  const profile = getPcStyleProfile(owner);
  return clampChance(profile[key] ?? fallback);
}

function pcCardBias(owner, type) {
  return getPcStyleProfile(owner).cardBias?.[type] ?? 1;
}

function pcPairBias(owner, type) {
  return getPcStyleProfile(owner).pairBias?.[type] ?? pcCardBias(owner, type);
}

function choosePcNopeReaction(owner, card) {
  const nope = getPcStyleProfile(owner).nope ?? defaultPcStyleProfile.nope;
  const chance = card.type === "nope"
    ? nope.nope
    : card.type === "trike" || card.type === "volcano"
      ? nope.info
      : card.type === "sprint"
        ? nope.sprint
        : nope.default;
  return runtimeRandom() < clampChance(chance);
}

function resolvePlayerNopeReaction(actor, card, nopeCardId) {
  if (!nopeCardId) {
    offerNopeReaction(actor, card, { skipPlayer: true });
    return;
  }

  state.pendingNopeReaction = {
    actor,
    reactor: "player",
    card,
    nopeCardId,
    context: {},
    lastReactor: actor,
    lastNopeCard: null,
    nopeCount: 0,
    skipPlayer: false
  };
  resolveNopeReaction(true);
  return false;
}

function resolveNopeReaction(useNope) {
  const pending = state.pendingNopeReaction;
  if (!pending) return;

  state.pendingNopeReaction = null;

  if (!useNope) {
    finishNopeChain(pending);
    return;
  }

  const hand = getHand(pending.reactor);
  const index = hand.findIndex((card) => card.id === pending.nopeCardId);
  if (index === -1) {
    finishNopeChain(pending);
    return;
  }

  const [nopeCard] = hand.splice(index, 1);
  state.discard.push(nopeCard);
  markMotion("discard", nopeCard.type);
  startNopeChainWithPlayedCard({
    ...pending,
    reactor: pending.reactor,
    nopeCard
  });
}

function startNopeChainWithPlayedCard(chain) {
  const nextChain = {
    actor: chain.actor,
    card: chain.card,
    context: chain.context ?? {},
    lastReactor: chain.reactor,
    lastNopeCard: chain.nopeCard,
    nopeCount: (chain.nopeCount ?? 0) + 1,
    skipPlayer: false
  };
  const firstNope = nextChain.nopeCount === 1;
  log(firstNope
    ? `${label(chain.reactor)} blokkeert ${chain.card.name} met Brul Terug.`
    : `${label(chain.reactor)} brult de vorige Brul Terug terug.`);
  setAction(firstNope
    ? `${label(chain.reactor)} speelt Brul Terug op ${chain.card.name}.`
    : `${label(chain.reactor)} speelt Brul Terug op Brul Terug.`);
  showCardMoment({
    title: `${label(chain.reactor)} speelt`,
    cards: chain.nopeCard,
    text: firstNope
      ? `${chain.card.name} wordt teruggebruld, tenzij iemand opnieuw Brul Terug speelt.`
      : "De Brul Terug-keten draait opnieuw om.",
    buttonText: "OK",
    owner: chain.reactor,
    target: firstNope ? chain.actor : chain.lastReactor,
    onClose: () => {
      continueNopeChain(nextChain);
      return false;
    }
  });
  render();
}

function continueNopeChain(chain) {
  const reactor = chooseNopeChainReactor(chain);
  if (!reactor) {
    finishNopeChain(chain);
    return;
  }

  const nopeCard = getHand(reactor).find((item) => item.type === "nope");
  if (!nopeCard) {
    finishNopeChain(chain);
    return;
  }

  if (reactor !== "player") {
    const shouldBlock = choosePcNopeReaction(reactor, chain.nopeCount > 0 ? chain.lastNopeCard : chain.card);
    if (shouldBlock) {
      state.pendingNopeReaction = { ...chain, reactor, nopeCardId: nopeCard.id, skipPlayer: false };
      resolveNopeReaction(true);
      return;
    }

    log(`${label(reactor)} houdt Brul Terug vast.`);
    finishNopeChain(chain);
    return;
  }

  state.pendingNopeReaction = { ...chain, reactor, nopeCardId: nopeCard.id, skipPlayer: false };
  setAction(chain.nopeCount > 0
    ? `${label(chain.lastReactor)} speelde Brul Terug. Jij kunt die Brul Terug ongedaan maken.`
    : `${label(chain.actor)} speelt ${chain.card.name}. Je kunt reageren met Brul Terug.`);
  render();
}

function finishNopeChain(chain) {
  if (isNopeChainBlocked(chain.nopeCount)) {
    log(`${chain.card.name} blijft geblokkeerd na ${chain.nopeCount} Brul Terug-kaart${chain.nopeCount === 1 ? "" : "en"}.`);
    setAction(`${chain.card.name} is weggebruld voordat het effect begon.`);
    render();
    continueAfterPause();
    return;
  }

  if ((chain.nopeCount ?? 0) > 0) {
    log(`${chain.card.name} gaat toch door na de Brul Terug-keten.`);
    setAction(`${chain.card.name} gaat toch door na de Brul Terug-keten.`);
  }
  resolveCard(chain.actor, chain.card, chain.context);
  render();
  continueAfterPause();
}

function chooseNopeChainReactor(chain) {
  const candidates = getNopeChainCandidates(chain).filter((id) => getHand(id).some((card) => card.type === "nope"));
  if (candidates.length === 0) return null;
  if (candidates.includes("player")) return "player";
  return candidates[0];
}

function getNopeChainCandidates(chain) {
  if ((chain.nopeCount ?? 0) > 0) {
    return activeOpponentsOf(chain.lastReactor);
  }

  if (chain.skipPlayer) {
    return [];
  }

  const target = chain.context?.target;
  if (!target || target === chain.actor || state.eliminated[target]) {
    return [];
  }

  return [target];
}

function chooseRaptorTarget(owner, attackLoad = RAPTOR_TURN_LOAD, returnTo = owner) {
  const targets = activeOpponentsOf(owner);
  if (targets.length === 0) return;

  if (owner !== "player") {
    resolveRaptorTarget(owner, choosePcTarget(owner, targets), attackLoad, returnTo);
    return;
  }

  state.pendingRaptorTarget = {
    owner,
    targets,
    selectedTarget: targets[0],
    attackLoad,
    returnTo
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
  resolveRaptorTarget(pendingRaptorTarget.owner, pendingRaptorTarget.selectedTarget, pendingRaptorTarget.attackLoad, pendingRaptorTarget.returnTo);
  render();
  continueAfterPause();
}

function resolveRaptorTarget(owner, target, attackLoad = RAPTOR_TURN_LOAD, returnTo = owner) {
  if (!target || state.eliminated[target]) return;
  resolveRaptorAttack(owner, target, attackLoad, returnTo);
  log(`${label(owner)} stuurt de raptor op ${objectLabel(target)} af.`);
}

function resolveRaptorAttack(owner, target, attackLoad = RAPTOR_TURN_LOAD, returnTo = owner) {
  if (!target || state.eliminated[target]) return;
  state.attackReturn = null;
  state.pendingTurns = applyRaptorAttack(state.pendingTurns, target, attackLoad);
  state.current = target;
  setAction(`${label(target)} is het doelwit en moet nu ${attackLoad} kaart(en) trekken.`);
  render();
  continueAfterPause();
}

function resolveSprint(owner) {
  const turnsBeforeSprint = state.pendingTurns[owner] ?? 1;

  if (turnsBeforeSprint > 1) {
    state.pendingTurns[owner] = Math.max(0, turnsBeforeSprint - 2);
    if (state.pendingTurns[owner] <= 0) {
      state.pendingTurns[owner] = 1;
      finishOwnerTurns(owner);
      setAction(`${label(owner)} sprint door de raptorstress heen en hoeft niet te trekken.`);
      return;
    }

    setAction(`${label(owner)} sprint weg zonder te trekken. Nog ${state.pendingTurns[owner]} beurt te gaan.`);
    return;
  }

  consumeTurn(owner);
  setAction(`${label(owner)} sprint weg en trekt niet.`);
}

function resolveTriceraTuk(owner) {
  const turnsBeforeTuk = state.pendingTurns[owner] ?? 1;
  consumeTurn(owner);

  if (turnsBeforeTuk > 1 && state.current === owner) {
    setAction(`${label(owner)} tukt 1 raptorbeurt weg. Nog ${state.pendingTurns[owner]} beurt te gaan.`);
    return;
  }

  setAction(`${label(owner)} tukt veilig door de beurt heen en trekt niet.`);
}

function startTrikePeek(owner) {
  const peek = state.deck.slice(-3).reverse();
  const visibleText = describeTrikePeek(peek);

  showCardMoment({
    title: "Triceratops Blik",
    cards: peek,
    text: owner === "player" ? visibleText : `${label(owner)} tuurt naar de bovenste 3 kaarten van de trekstapel.`,
    buttonText: "OK",
    faceDown: owner !== "player",
    owner
  });
}

function describeTrikePeek(cards) {
  if (cards.length === 0) return "De trekstapel is leeg.";

  const list = cards.map((item, index) => `${index + 1}. ${item.name}`).join(" | ");
  return `Bovenop liggen: ${list}.`;
}

function alterFuture(owner) {
  const topCards = state.deck.splice(Math.max(0, state.deck.length - 3)).reverse();

  if (owner !== "player") {
    const saferOrder = [...topCards].sort((a, b) => Number(a.type === "meteor") - Number(b.type === "meteor"));
    state.deck.push(...saferOrder.slice().reverse());
    setAction(`${label(owner)} rommelt met de prehistorische tijdlijn.`);
    showCardMoment({
      title: "Tijdlijn Kneden",
      cards: topCards,
      text: `${label(owner)} heeft de bovenste kaarten opnieuw geordend.`,
      buttonText: "OK",
      faceDown: true,
      owner
    });
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
    const index = Math.floor(runtimeRandom() * targetHand.length);
    stealCardAt(owner, target, index);
    return;
  }

  state.pendingFossilChoice = {
    owner,
    target,
    cards: [...targetHand],
    selectedIndexes: [],
    maxSelect: 1
  };
  setAction(`Fossielgraaier laat je bewust een gesloten kaart van ${objectLabel(target)} kiezen.`);
  render();
}

function selectStealCard(index) {
  const pendingFossilChoice = state.pendingFossilChoice;
  if (!pendingFossilChoice) return;
  const selected = new Set(pendingFossilChoice.selectedIndexes ?? []);
  const maxSelect = pendingFossilChoice.maxSelect ?? 1;

  if (selected.has(index)) {
    selected.delete(index);
  } else {
    if (maxSelect === 1) selected.clear();
    if (selected.size < maxSelect) selected.add(index);
  }

  pendingFossilChoice.selectedIndexes = [...selected].sort((a, b) => a - b);
  render();
}

function confirmFossilChoice(index = null) {
  const pendingFossilChoice = state.pendingFossilChoice;
  if (!pendingFossilChoice) return;
  const selectedIndexes = index === null
    ? pendingFossilChoice.selectedIndexes ?? []
    : [index];

  state.pendingFossilChoice = null;
  if (selectedIndexes.length === 0) {
    render();
    continueAfterPause();
    return;
  }

  stealCardsAt(pendingFossilChoice.owner, pendingFossilChoice.target, selectedIndexes);
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
    selectedTarget: initialTarget && targets.includes(initialTarget) ? initialTarget : targets[0],
    maxSelect: 1
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
    reward: "miniRaptorSteal",
    maxSelect: 1
  };
  setAction("Kies bij wie de Mini-Raptor snel 1 kaart mag graaien.");
  render();
}

function startStegoSnack(owner, playedPairIds = []) {
  const cards = getStegoSnackOptions(playedPairIds);
  if (cards.length === 0) {
    setAction("Stego Snack snuffelt rond, maar vindt geen oudere niet-meteor kaart in de aflegstapel.");
    return;
  }

  if (owner !== "player") {
    const card = choosePcDiscardSnack(owner, cards);
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

function choosePcDiscardSnack(owner, cards) {
  const priority = getPcStyleProfile(owner).discardPriority
    ?? ["shelter", "nope", "sprint", "dig", "volcano", "oracle", "fossil", "targetedRaptor", "raptor"];
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

function startBrontoBelly(owner) {
  const topCard = state.deck.at(-1);
  if (!topCard) {
    setAction("Bronto Buik rommelt tevreden, maar de trekstapel is leeg.");
    return;
  }

  if (owner !== "player") {
    const shouldMove = topCard.type === "meteor" || (topCard.type === "raptor" && runtimeRandom() < pcStyleChance(owner, "brontoRaptorMove", 0.42));
    if (shouldMove) {
      state.deck.unshift(state.deck.pop());
    }
    setAction(`${label(owner)} laat Bronto Buik de bovenste kaart ${shouldMove ? "onderop schuiven" : "bewaren waar hij ligt"}.`);
    showCardMoment({
      title: "Bronto Buik",
      cards: topCard,
      text: `${label(owner)} ${shouldMove ? "schuift de bekeken kaart onderop" : "laat de bekeken kaart bovenop liggen"}.`,
      buttonText: "OK",
      faceDown: true,
      owner
    });
    return;
  }

  state.pendingBrontoChoice = { owner, topCard };
  setAction("Bronto Buik laat je de bovenste kaart bekijken voordat je trekt.");
  render();
}

function confirmBrontoChoice(moveToBottom) {
  const pendingBrontoChoice = state.pendingBrontoChoice;
  if (!pendingBrontoChoice) return;

  const currentTopCard = state.deck.at(-1);
  if (moveToBottom && currentTopCard?.id === pendingBrontoChoice.topCard.id) {
    state.deck.unshift(state.deck.pop());
  }

  state.pendingBrontoChoice = null;
  log(`${label(pendingBrontoChoice.owner)} laat Bronto Buik ${moveToBottom ? `${pendingBrontoChoice.topCard.name} onderop schuiven` : `${pendingBrontoChoice.topCard.name} bovenop laten liggen`}.`);
  setAction(moveToBottom
    ? `${pendingBrontoChoice.topCard.name} verdwijnt onderin de Bronto-buik.`
    : `${pendingBrontoChoice.topCard.name} blijft bovenop de trekstapel liggen.`);
  render();
  continueAfterPause();
}

function startPteroPret(owner) {
  const cards = state.deck.splice(Math.max(0, state.deck.length - 2)).reverse();
  if (cards.length === 0) {
    setAction("Ptero Pret fladdert rond, maar de trekstapel is leeg.");
    endTurnForPlayedCard(owner, cardCatalog.pteroPret);
    return;
  }

  if (owner !== "player") {
    resolvePteroCards(owner, cards, choosePcPteroTop(owner, cards)?.id);
    endTurnForPlayedCard(owner, cardCatalog.pteroPret);
    showCardMoment({
      title: "Ptero Pret",
      cards,
      text: `${label(owner)} bekijkt 2 kaarten en herschikt de boven- en onderkant van de trekstapel.`,
      buttonText: "OK",
      faceDown: true,
      owner
    });
    return;
  }

  state.pendingPteroChoice = {
    owner,
    cards,
    selectedTopId: cards[0]?.id ?? null
  };
  setAction("Ptero Pret laat je de bovenste 2 kaarten bekijken en 1 kaart veilig bovenop houden.");
  render();
}

function choosePcPteroTop(owner, cards) {
  const scoreCard = (card) => {
    if (card.type === "meteor") return -100;
    if (card.type === "shelter") return 80 * pcCardBias(owner, card.type);
    if (card.type === "sprint") return 48 * pcCardBias(owner, card.type);
    if (card.type === "nope") return 42 * pcCardBias(owner, card.type);
    if (card.playable) return 34 * pcCardBias(owner, card.type);
    if (isSetCard(card)) return 22 * pcPairBias(owner, card.type);
    return 10;
  };

  return [...cards].sort((a, b) => scoreCard(b) - scoreCard(a))[0] ?? cards[0];
}

function selectPteroTop(cardId) {
  const pendingPteroChoice = state.pendingPteroChoice;
  if (!pendingPteroChoice || !pendingPteroChoice.cards.some((card) => card.id === cardId)) return;

  pendingPteroChoice.selectedTopId = cardId;
  render();
}

function confirmPteroChoice() {
  const pendingPteroChoice = state.pendingPteroChoice;
  if (!pendingPteroChoice) return;

  state.pendingPteroChoice = null;
  resolvePteroCards(pendingPteroChoice.owner, pendingPteroChoice.cards, pendingPteroChoice.selectedTopId);
  endTurnForPlayedCard(pendingPteroChoice.owner, cardCatalog.pteroPret);
  render();
  continueAfterPause();
}

function resolvePteroCards(owner, cards, selectedTopId) {
  const topCard = cards.find((card) => card.id === selectedTopId) ?? cards[0];
  const bottomCard = cards.find((card) => card.id !== topCard?.id);

  if (bottomCard) state.deck.unshift(bottomCard);
  if (topCard) state.deck.push(topCard);

  const topText = topCard ? `${topCard.name} blijft bovenop` : "De trekstapel blijft leeg";
  const bottomText = bottomCard ? ` en ${bottomCard.name} vliegt onderop` : "";
  log(`${label(owner)} laat Ptero Pret de bovenkant herschikken.`);
  setAction(`${topText}${bottomText}.`);
}

function reclaimDiscardCard(owner, cardId) {
  const index = state.discard.findIndex((card) => card.id === cardId);
  if (index === -1) {
    setAction("Die kaart ligt niet meer in de aflegstapel.");
    return;
  }

  const [card] = state.discard.splice(index, 1);
  addCardToHand(owner, card);
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

  state.pendingFossilChoice = {
    owner: pendingStealTarget.owner,
    target,
    cards: [...getHand(target)],
    title: pendingStealTarget.reward === "miniRaptorSteal" ? "Mini-Raptor graait" : "Paar stelen",
    selectedIndexes: [],
    maxSelect: pendingStealTarget.maxSelect ?? 1
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
  markMotion("draw", card.type);
  log(`${label(owner)} trekt ${from === "bottom" ? "de onderste" : "een"} kaart.`);
  state.pendingDraw = { owner, card, from };
  setAction(`${label(owner)} heeft een kaart getrokken. Klik verder om de beurt te laten doorgaan.`);
  render();

  // NPC draws still wait for the shared OK button so every hidden card moment is user-paced.
}

function confirmPendingDraw() {
  if (!state.pendingDraw || state.gameOver) return;

  const { owner, card } = state.pendingDraw;
  state.pendingDraw = null;

  if (card.type === "meteor") {
    handleMeteor(owner, card);
    return;
  }

  addCardToHand(owner, card);
  consumeTurn(owner);
  setAction(`${label(owner)} neemt ${card.name} in de hand.`);
  render();

  continueAfterPause();
}

function handleMeteor(owner, meteorCard) {
  const hand = getHand(owner);
  const result = resolveMeteorDraw(hand, state.discard, meteorCard);

  if (!result.survived) {
    markMotion("discard", "meteor");
    eliminatePlayer(owner, `${label(owner)} wordt geraakt door een Meteorietinslag.`);
    return;
  }

  const { shelter } = result;
  markMotion("discard", "shelter");
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
    motionTone: "shelter-save",
    onClose: () => {
      const insertAt = Math.floor(runtimeRandom() * (state.deck.length + 1));
      insertMeteorBack(state.deck, meteorCard, insertAt);
      consumeTurn(owner);
      setAction(`${label(owner)} overleeft de Meteorietinslag en stopt hem geheim terug.`);
    }
  });
}

function confirmMeteorPlacement() {
  if (!state.pendingMeteorPlacement) return;

  const { owner, meteorCard } = state.pendingMeteorPlacement;
  const insertAt = Number(els.placementSelect.value);
  insertMeteorBack(state.deck, meteorCard, insertAt);
  state.pendingMeteorPlacement = null;
  consumeTurn(owner);
  log("De Meteorietinslag is geheim teruggestopt in de trekstapel.");
  setAction("Je overleeft de meteoriet. Niemand weet precies waar hij nu ligt.");
  render();

  if (!state.gameOver && state.current !== "player") {
    schedule(pcTurn, 650);
  }
}

function consumeTurn(owner) {
  state.pendingTurns[owner] -= 1;
  if (state.pendingTurns[owner] <= 0) {
    state.pendingTurns[owner] = 1;
    finishOwnerTurns(owner);
  }
}

function endTurnForPlayedCard(owner, card) {
  if (getCardTurnEffect(card) !== "endTurn") return;

  state.pendingTurns[owner] = 1;
  if (state.current === owner) {
    finishOwnerTurns(owner);
  }
}

function finishOwnerTurns(owner) {
  if (state.attackReturn?.target === owner) {
    const returnTo = state.attackReturn.returnTo;
    state.attackReturn = null;
    state.current = !state.eliminated[returnTo] ? returnTo : nextActivePlayer(owner);
    return;
  }

  state.current = nextActivePlayer(owner);
}

function getAttackLoad(owner, baseLoad = RAPTOR_TURN_LOAD) {
  const result = resolveIncomingAttackLoad({
    owner,
    pendingTurns: state.pendingTurns,
    attackReturn: state.attackReturn
  }, baseLoad);
  state.pendingTurns = result.pendingTurns;
  state.attackReturn = result.attackReturn;
  return result.attackLoad;
}

function getAttackReturn(owner, fallback = owner) {
  return state.attackReturn?.target === owner
    ? state.attackReturn.returnTo
    : fallback;
}

function stealRandomCard(owner, target) {
  const targetHand = getHand(target);
  if (targetHand.length === 0) {
    setAction(`${label(target)} heeft geen kaarten om te stelen.`);
    return;
  }

  const index = Math.floor(runtimeRandom() * targetHand.length);
  stealCardAt(owner, target, index);
}

function stealCardsAt(owner, target, indexes) {
  const targetHand = getHand(target);
  const uniqueIndexes = [...new Set(indexes)]
    .map((index) => Math.max(0, Math.min(index, targetHand.length - 1)))
    .filter((index) => Number.isInteger(index))
    .sort((a, b) => b - a);

  if (targetHand.length === 0 || uniqueIndexes.length === 0) {
    setAction(`${label(target)} heeft geen kaarten om te stelen.`);
    return;
  }

  const stolenCards = [];
  uniqueIndexes.forEach((index) => {
    if (index >= targetHand.length) return;
    const [stolen] = targetHand.splice(index, 1);
    if (stolen) {
      addCardToHand(owner, stolen);
      stolenCards.unshift(stolen);
    }
  });

  if (stolenCards.length === 0) {
    setAction(`${label(target)} heeft geen kaarten om te stelen.`);
    return;
  }

  const isPrivatePcSteal = owner !== "player" && target !== "player";
  const cardNames = stolenCards.map((card) => card.name).join(", ");
  setAction(`${label(owner)} steelt ${stolenCards.length === 1 ? "een kaart" : `${stolenCards.length} kaarten`} van ${objectLabel(target)}.`);
  showCardMoment({
    title: stolenCards.length === 1 ? "Kaart gestolen" : "Kaarten gestolen",
    cards: stolenCards,
    text: isPrivatePcSteal
      ? `${label(owner)} pakt ${stolenCards.length === 1 ? "een gesloten kaart" : `${stolenCards.length} gesloten kaarten`} van ${objectLabel(target)}. ${subjectPronoun(owner, true)} houdt geheim welke kaart het was.`
      : `${label(owner)} pakt ${cardNames} van ${objectLabel(target)}.`,
    buttonText: owner === "player" ? "Leg in hand" : "OK",
    faceDown: isPrivatePcSteal,
    owner
  });
}

function stealCardAt(owner, target, index) {
  stealCardsAt(owner, target, [index]);
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
  if ((state.pendingTurns[owner] ?? 1) > 1 && sprint && runtimeRandom() < pcStyleChance(owner, "sprintEscape", 0.86)) {
    return sprint;
  }

  const triceraTuk = hand.find((card) => card.type === "triceraTuk" && findPairForCard(hand, card).length === 2);
  if ((state.pendingTurns[owner] ?? 1) > 1 && triceraTuk && runtimeRandom() < pcStyleChance(owner, "napEscape", 0.72)) {
    return triceraTuk;
  }

  const pteroPret = hand.find((card) => card.type === "pteroPret" && findPairForCard(hand, card).length === 2);
  if (pteroPret && state.deck.length >= 2 && runtimeRandom() < pcStyleChance(owner, "pteroPair", 0.58)) {
    return pteroPret;
  }

  const playablePair = choosePcSetPair(owner, hand);
  if (playablePair && runtimeRandom() < pcStyleChance(owner, "pairPlay", 0.34)) return playablePair;

  const volcano = hand.find((card) => card.type === "volcano");
  if (volcano && state.deck.length <= 6 && runtimeRandom() < pcStyleChance(owner, "volcanoLowDeck", 0.78)) {
    return volcano;
  }

  const trike = hand.find((card) => card.type === "trike");
  if (trike && ((state.pendingTurns[owner] ?? 1) > 1 || state.deck.length <= 8) && runtimeRandom() < pcStyleChance(owner, "trikeRiskCheck", 0.74)) {
    return trike;
  }

  const playable = hand.filter((card) => card.playable);
  if (playable.length === 0) return null;

  for (const type of getPcUsefulOrder(owner)) {
    const candidate = playable.find((card) => card.type === type);
    if (candidate && runtimeRandom() < clampChance(0.68 * pcCardBias(owner, type))) {
      return candidate;
    }
  }

  return runtimeRandom() < pcStyleChance(owner, "fallbackPlay", 0.22) ? playable[0] : null;
}

function choosePcSetPair(owner, hand) {
  return hand
    .filter((card) => isSetCard(card) && findPairForCard(hand, card).length === 2)
    .sort((a, b) => pcPairBias(owner, b.type) - pcPairBias(owner, a.type))[0] ?? null;
}

function getPcUsefulOrder(owner) {
  const usefulOrder = ["trike", "oracle", "fossil", "targetedRaptor", "raptor", "volcano", "dig", "sprint", "nope"];
  return usefulOrder
    .map((type, index) => ({ type, index, score: pcCardBias(owner, type) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.type);
}

function endGame(winner, reason) {
  state.gameOver = true;
  log(reason);
  const title = winner === "player" ? "Gefeliciteerd!" : winner ? "Jammer!" : "Dino-patstelling";
  const text = winner === "player"
    ? `${reason} Jij wint deze prehistorische chaos.`
    : winner
      ? `${reason} ${label(winner)} wint.`
      : reason;
  if (winner === "player") {
    setAction(text);
  } else if (winner) {
    setAction(text);
  } else {
    setAction(text);
  }
  showCardMoment({
    title,
    cards: [],
    text,
    buttonText: "Nieuw potje",
    endGame: true,
    winner,
    owner: winner ?? "player",
    onClose: openStartModal
  });
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

function isSetRewardCard(card) {
  return isSetCard(card) && card.type !== "feral";
}

function isInteractionBlocked() {
  return getActiveInteractions(state).length > 0 || Boolean(activeReveal);
}

function isGameplayBlockedForPlay() {
  return getActiveInteractions(state).some((key) => key !== "pendingCardDetail") || Boolean(activeReveal);
}

function isHandClickBlocked() {
  return getActiveInteractions(state).length > 0 || Boolean(activeReveal);
}

function continueAfterPause() {
  if (!state.gameOver && !isInteractionBlocked() && state.current !== "player") {
    schedule(pcTurn, 650);
  }
}

function getHand(owner) {
  return state.hands[owner] ?? [];
}

function addCardToHand(owner, card) {
  assignHandSortKey(card);
  getHand(owner).push(card);
}

function assignHandSortKey(card) {
  card.handSortKey = runtimeRandom();
  return card;
}

function getSortedHand(owner) {
  return [...getHand(owner)].sort(compareCardsForHand);
}

function compareCardsForHand(a, b) {
  const typeCompare = handTypeRank(a.type) - handTypeRank(b.type);
  if (typeCompare !== 0) return typeCompare;

  const keyCompare = (a.handSortKey ?? 0) - (b.handSortKey ?? 0);
  if (keyCompare !== 0) return keyCompare;

  return String(a.id).localeCompare(String(b.id));
}

function handTypeRank(type) {
  const index = HAND_TYPE_ORDER.indexOf(type);
  return index === -1 ? HAND_TYPE_ORDER.length : index;
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

function subjectPronoun(owner, capitalize = false) {
  const player = getPlayer(owner);
  const pronoun = player?.gender === "female" ? "zij" : player?.gender === "male" ? "hij" : "die";
  return capitalize ? `${pronoun.charAt(0).toUpperCase()}${pronoun.slice(1)}` : pronoun;
}

function playerSubtitle(player) {
  if (!player) return "Dino";
  if (player.isHuman) return "Speler";
  return [player.role, player.speciesShort ?? player.species].filter(Boolean).join(" - ");
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
  if (targets.includes("player") && runtimeRandom() < pcStyleChance(owner, "playerTarget", 0.72)) return "player";
  if (getPcStyleProfile(owner).targetRichHand) {
    return [...targets].sort((a, b) => getHand(b).length - getHand(a).length)[0] ?? targets[0];
  }
  return targets[Math.floor(runtimeRandom() * targets.length)];
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

els.drawButton.addEventListener("click", () => {
  if (globalThis.ExplodingDinosMultiplayer?.isActive?.()) return;
  drawCard("player");
});
els.handToggle?.addEventListener("click", togglePlayerHand);
els.mobileMenuButton?.addEventListener("click", openMobileMenu);
els.closeMobileMenu?.addEventListener("click", closeMobileMenu);
els.mobileGamePageButton?.addEventListener("click", () => showPageFromMobileMenu("game"));
els.mobileCatalogPageButton?.addEventListener("click", () => showPageFromMobileMenu("catalog"));
els.mobileExplainButton?.addEventListener("click", openTutorial);
els.mobileNewGameButton?.addEventListener("click", startNewGameFromMobileMenu);
els.mobileLogButton?.addEventListener("click", toggleMobileLog);
els.mobileLogExpandButton?.addEventListener("click", toggleFullLog);
els.mobileMenu?.addEventListener("click", (event) => {
  if (event.target === els.mobileMenu) {
    closeMobileMenu();
  }
});
els.newGameButton.addEventListener("click", openStartModal);
els.explainButton?.addEventListener("click", openTutorial);
els.startExplainButton?.addEventListener("click", openTutorial);
els.startGameButton.addEventListener("click", confirmStartSelection);
els.closeTutorialButton?.addEventListener("click", closeTutorial);
els.tutorialSkipButton?.addEventListener("click", closeTutorial);
els.tutorialBackButton?.addEventListener("click", retreatTutorial);
els.tutorialNextButton?.addEventListener("click", advanceTutorial);
els.tutorialPlacementSelect?.addEventListener("change", updateTutorialPlacementHint);
els.tutorial?.addEventListener("click", (event) => {
  if (event.target === els.tutorial) closeTutorial();
});
document.addEventListener?.("keydown", (event) => {
  if (event.key === "Escape") {
    if (!els.mobileMenu.classList.contains("is-hidden")) closeMobileMenu();
    else if (!els.tutorial.classList.contains("is-hidden")) closeTutorial();
    else if (!els.catalogDetail.classList.contains("is-hidden")) closeCatalogCard();
    return;
  }

  if (event.key !== "Tab" || !activeDialog) return;
  const focusables = getDialogFocusables(activeDialog);
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
els.showGamePage.addEventListener("click", () => showPage("game"));
els.showCatalogPage.addEventListener("click", () => showPage("catalog"));
els.closeCatalogDetail.addEventListener("click", closeCatalogCard);
els.catalogDetail.addEventListener("click", (event) => {
  if (event.target === els.catalogDetail) {
    closeCatalogCard();
  }
});
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
    confirmFossilChoice();
    return;
  }

  if (state.pendingDiscardChoice) {
    state.pendingDiscardChoice = null;
    render();
    continueAfterPause();
    return;
  }

  if (state.pendingBrontoChoice) {
    confirmBrontoChoice(false);
    return;
  }

  if (state.pendingPteroChoice) {
    confirmPteroChoice();
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
    return;
  }

  if (state.pendingBrontoChoice) {
    confirmBrontoChoice(true);
  }
});

globalThis.ExplodingDinosMenu = { render: renderMobileMenu };

render();
openStartModal();
