(() => {
const config = globalThis.ExplodingDinosMultiplayerConfig ?? {};
const { createMultiplayerViewModel } = globalThis.ExplodingDinosViewModel;
const SharedGameView = globalThis.ExplodingDinosGameView;
const SharedRevealView = globalThis.ExplodingDinosRevealView;
const SharedChoiceView = globalThis.ExplodingDinosChoiceView;
const { randomDinoName } = globalThis.ExplodingDinosNames;
const multiplayerColors = globalThis.ExplodingDinosPlayers?.playerColors ?? ["#55b87a", "#d79632", "#d35d32", "#548fc7", "#9a6ac9"];
const $ = (selector) => document.querySelector(selector);
const elements = {
  modal: $("#multiplayerModal"),
  open: $("#openMultiplayerButton"),
  close: $("#closeMultiplayerButton"),
  joinView: $("#multiplayerJoinView"),
  lobby: $("#multiplayerLobby"),
  name: $("#multiplayerName"),
  randomizeName: $("#randomizeDinoNameButton"),
  code: $("#multiplayerRoomCode"),
  codeField: $("#multiplayerRoomCodeField"),
  status: $("#multiplayerStatus"),
  create: $("#createRoomButton"),
  join: $("#joinRoomButton"),
  activeCode: $("#activeRoomCode"),
  copy: $("#copyRoomLinkButton"),
  lobbyStatus: $("#lobbyStatus"),
  players: $("#multiplayerPlayers"),
  leave: $("#leaveRoomButton"),
  stopGame: $("#stopMultiplayerGameButton"),
  start: $("#multiplayerStartButton"),
  startNote: $("#multiplayerStartNote"),
  choice: $("#onlineChoice"),
  choiceTitle: $("#onlineChoiceTitle"),
  choiceText: $("#onlineChoiceText"),
  choiceCards: $("#onlineChoiceCards"),
  choiceControls: $("#onlineChoiceControls"),
  mainOpponents: $("#opponents"),
  mainHand: $("#playerHand"),
  mainPlayerZone: $(".player-zone"),
  mainHandToggle: $("#handToggle"),
  mainDraw: $("#drawButton"),
  mainDeckCount: $("#deckCount"),
  mainDiscard: $("#discardTop"),
  mainDiscardPile: $(".discard"),
  mainTurn: $("#turnStatus"),
  mainHint: $("#playerHint"),
  mainAction: $("#actionText"),
  mainLog: $("#gameLog"),
  startModal: $("#startModal"),
  gameTable: $("#gameTable"),
  newGame: $("#newGameButton"),
  mobileNewGame: $("#mobileNewGameButton"),
  mobileMenu: $("#mobileMenu"),
  mobileMenuButton: $("#mobileMenuButton"),
  reveal: $("#drawReveal"),
  revealEyebrow: $("#revealEyebrow"),
  revealCard: $("#revealCard"),
  revealText: $("#revealText"),
  revealPrimary: $("#revealButton"),
  revealSecondary: $("#revealSecondaryButton"),
  placement: $("#placementControls"),
  placementSelect: $("#placementSelect"),
  placementHint: $("#placementHint")
};

if (!elements.modal || !elements.open) return;

let session = readSession();
let pollTimer = null;
let activeRoom = null;
let showingRoomInfo = false;
let inspectedOnlineCard = null;
let onlineHandOpen = false;
let onlineRevealActions = null;
let onlineOracleDraft = null;
let roomConnectionBusy = false;
let roomNameLocked = Boolean(session?.code && session?.token);
let nameWasGenerated = false;

const ROOM_REQUEST_TIMEOUT_MS = Number(config.requestTimeoutMs) || 90000;

function setRandomDinoName(focus = true, excludedNames = []) {
  elements.name.value = randomDinoName(Math.random, excludedNames);
  nameWasGenerated = true;
  if (focus) {
    elements.name.focus?.();
    elements.name.select?.();
  }
}

function storage() {
  try { return globalThis.sessionStorage; } catch { return null; }
}

function readSession() {
  try { return JSON.parse(storage()?.getItem("explodingDinosMultiplayer") ?? "null"); }
  catch { return null; }
}

function saveSession(value) {
  session = value;
  if (value) storage()?.setItem("explodingDinosMultiplayer", JSON.stringify(value));
  else storage()?.removeItem("explodingDinosMultiplayer");
}

function roomFromUrl() {
  try { return new URL(globalThis.location.href).searchParams.get("room")?.toUpperCase() ?? ""; }
  catch { return ""; }
}

function invitationUrl(code) {
  const url = new URL(globalThis.location.href);
  url.searchParams.set("room", code);
  return url.toString();
}

function syncRoomUrl(code) {
  try {
    const url = new URL(globalThis.location.href);
    if (code) url.searchParams.set("room", code);
    else url.searchParams.delete("room");
    globalThis.history?.replaceState?.({}, "", url.toString());
  } catch { /* De room blijft ook zonder History API bruikbaar. */ }
}

function syncNameControls() {
  const disabled = roomConnectionBusy || roomNameLocked;
  elements.name.disabled = disabled;
  elements.randomizeName.disabled = disabled;
  elements.name.setAttribute("aria-readonly", String(roomNameLocked));
  elements.name.title = roomNameLocked ? "Je naam staat vast zolang je in deze room zit." : "";
  elements.randomizeName.title = roomNameLocked ? "Verlaat de room om een andere naam te kiezen." : "Nieuwe dinonaam";
}

function setNameLocked(locked) {
  roomNameLocked = locked;
  syncNameControls();
}

function setBusy(busy, message = "") {
  roomConnectionBusy = busy;
  elements.create.disabled = busy;
  elements.join.disabled = busy;
  syncNameControls();
  elements.joinView.setAttribute("aria-busy", String(busy));
  elements.status.classList.toggle("is-loading", busy);
  if (message) elements.status.textContent = message;
}

async function request(path, options = {}) {
  if (!config.apiBase) throw new Error("De multiplayer-server is nog niet geconfigureerd.");
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId = controller
    ? globalThis.setTimeout?.(() => controller.abort(), ROOM_REQUEST_TIMEOUT_MS)
    : null;
  let response;
  try {
    response = await fetch(`${config.apiBase.replace(/\/$/, "")}${path}`, {
      ...options,
      signal: options.signal ?? controller?.signal,
      headers: {
        "Content-Type": "application/json",
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...options.headers
      }
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("De dinoserver deed er te lang over. Probeer het opnieuw; na rust kan de eerste verbinding langer duren.");
    }
    throw new Error("De dinoserver is niet bereikbaar. Controleer je verbinding en probeer het opnieuw.");
  } finally {
    if (timeoutId !== null) globalThis.clearTimeout?.(timeoutId);
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "De roomserver reageert niet goed.");
  return result;
}

function openModal() {
  elements.modal.classList.remove("is-hidden");
  const linkedRoom = roomFromUrl();
  if (linkedRoom) elements.code.value = linkedRoom;
  elements.codeField.classList.toggle("is-hidden", !linkedRoom);
  elements.create.classList.toggle("is-hidden", Boolean(linkedRoom));
  elements.join.classList.toggle("is-hidden", !linkedRoom);
  elements.status.textContent = linkedRoom
    ? `Je bent uitgenodigd voor room ${linkedRoom}. Kies je naam en neem deel.`
    : "Maak een nieuwe room en deel daarna de uitnodigingslink.";
  if (!elements.name.value) setRandomDinoName(false);
  if (linkedRoom && session?.code && linkedRoom !== session.code) saveSession(null);
  if (session?.code && session?.token) {
    showLobby({ code: session.code, players: [], viewerId: null, isHost: false });
    pollRoom();
  } else {
    elements.name.focus?.();
  }
}

function closeModal() {
  if (activeRoom?.game?.pending) return;
  showingRoomInfo = false;
  elements.modal.classList.add("is-hidden");
  if (!activeRoom?.game) stopPolling();
}

function renderPlayers(room) {
  elements.players.replaceChildren(...room.players.map((player) => {
    const item = document.createElement("li");
    const name = document.createElement("strong");
    const role = document.createElement("span");
    name.textContent = player.name;
    role.textContent = player.id === room.viewerId ? "Jij" : "Verbonden";
    item.append(name, role);
    return item;
  }));
}

function cardFace(card) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "online-choice-card card-button";
  if (typeof globalThis.renderCardFace === "function") globalThis.renderCardFace(button, card);
  else button.textContent = card.name;
  return button;
}

function actionButton(label, action, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  if (className) button.className = className;
  button.addEventListener("click", () => performGameAction(action));
  return button;
}

function closeOnlineCardDetail() {
  inspectedOnlineCard = null;
  onlineRevealActions = null;
  SharedRevealView.hide({ reveal: elements.reveal });
}

function renderStandardOnlineReveal({ title, text, cards = [], nodes = [], cardClass = "", faceDown = false, primary, secondary }) {
  elements.choice?.classList.add("is-hidden");
  SharedRevealView.reset({ reveal: elements.reveal, card: elements.revealCard, primary: elements.revealPrimary, secondary: elements.revealSecondary });
  elements.revealEyebrow.textContent = title;
  elements.revealText.textContent = text;
  elements.placement.classList.add("is-hidden");
  if (faceDown) SharedRevealView.closedCard(elements.revealCard);
  else if (nodes.length) {
    elements.revealCard.classList.add("is-multi");
    if (cardClass) elements.revealCard.classList.add(cardClass);
    elements.revealCard.append(...nodes);
  } else if (cards.length === 1) SharedRevealView.openCard(elements.revealCard, cards[0], globalThis.renderCardFace);
  else if (cards.length > 1) SharedRevealView.cards(elements.revealCard, cards, globalThis.renderCardFace);
  else elements.revealCard.classList.add("is-multi");
  onlineRevealActions = { primary: primary?.action ?? null, secondary: secondary?.action ?? null };
  if (primary) {
    elements.revealPrimary.textContent = primary.label;
    elements.revealPrimary.disabled = Boolean(primary.disabled);
  }
  else elements.revealPrimary.classList.add("is-hidden");
  if (secondary) {
    elements.revealSecondary.textContent = secondary.label;
    elements.revealSecondary.disabled = Boolean(secondary.disabled);
    elements.revealSecondary.classList.remove("is-hidden");
  }
}

function runOnlineRevealAction(action) {
  if (typeof action === "function") action();
  else performGameAction(action);
}

function renderOnlineOracle(pending) {
  const pendingCardIds = pending.cards.map((card) => card.id);
  const keepsExistingDraft = onlineOracleDraft
    && onlineOracleDraft.length === pendingCardIds.length
    && onlineOracleDraft.every((card) => pendingCardIds.includes(card.id));
  const order = keepsExistingDraft ? onlineOracleDraft : [...pending.cards];
  onlineOracleDraft = order;
  const renderOrder = () => {
    const nodes = order.map((card, index) => {
      const wrap = document.createElement("div");
      wrap.className = "multiplayer-choice__ordered-card";
      const position = document.createElement("strong");
      position.textContent = `${index + 1}.`;
      const face = cardFace(card);
      const controls = document.createElement("div");
      const up = document.createElement("button");
      const down = document.createElement("button");
      up.type = down.type = "button";
      up.textContent = "↑";
      down.textContent = "↓";
      up.disabled = index === 0;
      down.disabled = index === order.length - 1;
      up.addEventListener("click", () => {
        [order[index - 1], order[index]] = [order[index], order[index - 1]];
        onlineOracleDraft = order;
        renderOrder();
      });
      down.addEventListener("click", () => {
        [order[index], order[index + 1]] = [order[index + 1], order[index]];
        onlineOracleDraft = order;
        renderOrder();
      });
      controls.append(up, down);
      wrap.append(position, face, controls);
      return wrap;
    });
    renderStandardOnlineReveal({
      title: "Tijdlijn Kneden",
      text: "Zet de kaarten van boven naar onder in de gewenste volgorde.",
      nodes,
      primary: { label: "Tijdlijn vastleggen", action: () => performGameAction({ type: "ORDER_ORACLE", cardIds: order.map((card) => card.id) }) }
    });
  };
  renderOrder();
}

function openOnlineRoomInfo() {
  if (!activeRoom) return;
  showingRoomInfo = true;
  renderPlayers(activeRoom);
  elements.activeCode.textContent = activeRoom.code;
  elements.modal.classList.remove("is-hidden");
  elements.lobby.classList.remove("is-hidden");
}

function renderOnlineEndState(room) {
  const won = room.game.winnerId === room.viewerId;
  const winner = room.game.players.find((player) => player.id === room.game.winnerId);
  const result = document.createElement("strong");
  result.textContent = won ? "Gefeliciteerd!" : `${winner?.name ?? "De andere speler"} wint`;
  const scene = document.createElement("div");
  scene.className = "end-card__scene";
  const image = document.createElement("img");
  image.src = won ? "assets/endings/victory-dino.webp" : "assets/endings/defeat-dino.webp";
  image.alt = won ? "Vrolijke dino viert de overwinning" : "Dino kijkt verslagen na een komische meteorietinslag";
  scene.append(image);
  renderStandardOnlineReveal({
    title: won ? "Overwinning" : "Verloren",
    text: won ? "Jij bent de laatste dino die nog overeind staat." : "Je bent uitgeschakeld in dit online potje.",
    nodes: [result, scene],
    primary: room.isHost
      ? { label: "Nieuwe room maken", action: startNewRoom }
      : { label: "Roominfo", action: openOnlineRoomInfo }
  });
  elements.revealCard.classList.add("end-card", won ? "is-win" : "is-loss");
}

function showOnlineCardDetail(card, playable) {
  inspectedOnlineCard = { card, playable };
  elements.choice?.classList.add("is-hidden");
  document.querySelector(".reveal-actor")?.remove?.();
  document.querySelector(".reveal-attack-flow")?.remove?.();
  SharedRevealView.reset({
    reveal: elements.reveal,
    card: elements.revealCard,
    primary: elements.revealPrimary,
    secondary: elements.revealSecondary
  });
  elements.revealEyebrow.textContent = "Kaart bekijken";
  SharedRevealView.openCard(elements.revealCard, card, globalThis.renderCardFace);
  elements.revealText.textContent = playable ? `${card.name} kan nu gespeeld worden.` : `${card.name} kan nu niet gespeeld worden.`;
  elements.revealPrimary.textContent = "Terug";
  elements.revealSecondary.textContent = "Spelen";
  elements.revealSecondary.disabled = !playable;
  elements.revealSecondary.classList.remove("is-hidden");
}

function renderChoice(pending, game) {
  if (pending?.type !== "ORACLE_ORDER") onlineOracleDraft = null;
  if (!pending) {
    onlineRevealActions = null;
    elements.choice?.classList.add("is-hidden");
    if (!inspectedOnlineCard) elements.reveal.classList.add("is-hidden");
    return;
  }
  inspectedOnlineCard = null;
  onlineRevealActions = null;

  if (pending.type === "PLAY_REVEAL") {
    const card = pending.cards[0];
    renderStandardOnlineReveal({
      title: pending.isActor ? "Je speelt" : `${pending.playerName} speelt`,
      text: pending.isActor
        ? `Je speelt ${card.name}. Iedereen ziet deze kaart; alleen jouw eventuele vervolgstap blijft geheim.`
        : `${pending.playerName} speelt ${card.name}. Je ziet de gespeelde kaart, maar niet de eventuele geheime vervolgstap.`,
      cards: pending.cards,
      primary: pending.isActor
        ? { label: "Kaart uitvoeren", action: { type: "CONFIRM_PLAY" } }
        : { label: `Wachten op ${pending.playerName}`, action: null, disabled: true }
    });
    return;
  }

  if (pending.type === "PEEK") {
    renderStandardOnlineReveal({ title: pending.title || "Kaarten bekijken", text: "Alleen jij kunt deze kaarten zien.", cards: pending.cards, primary: { label: "Sluiten", action: { type: "CONFIRM_PEEK" } } });
    return;
  }
  if (pending.type === "DRAW_REVEAL") {
    const remainingAfterThis = Math.max(0, Number(game.forcedDrawsRemaining) - 1);
    renderStandardOnlineReveal({
      title: game.forcedDrawsRemaining > 0 ? `Aanvalbeurt — nog ${game.forcedDrawsRemaining}` : "Je trekt",
      text: remainingAfterThis > 0
        ? `Deze trek sluit één volledige beurt af. Hierna heb je nog ${remainingAfterThis} ${remainingAfterThis === 1 ? "beurt" : "beurten"}. Je mag tussendoor actiekaarten spelen.`
        : "Lees de kaart rustig. Voeg hem daarna aan je hand toe.",
      cards: pending.cards,
      primary: { label: remainingAfterThis > 0 ? `Neem kaart — daarna nog ${remainingAfterThis}` : "Neem kaart in hand", action: { type: "CONFIRM_DRAW" } }
    });
    return;
  }
  if (pending.type === "METEOR_REVEAL") {
    const shelterPhase = pending.phase === "shelter";
    const actor = pending.playerName || "Een speler";
    const text = shelterPhase
      ? (pending.isActor
        ? "Je zet een Schuilgrot in en overleeft de inslag. Hierna leg je de meteoriet geheim terug."
        : `${actor} zet een Schuilgrot in en overleeft de inslag. Waar de meteoriet terugkomt blijft geheim.`)
      : (pending.isActor
        ? (pending.survived ? "Je trekt een Meteorietinslag. Gelukkig heb je een Schuilgrot." : "Je trekt een Meteorietinslag zonder Schuilgrot en wordt uitgeschakeld.")
        : (pending.survived ? `${actor} trekt een Meteorietinslag en heeft een Schuilgrot.` : `${actor} trekt een Meteorietinslag zonder Schuilgrot en wordt uitgeschakeld.`));
    renderStandardOnlineReveal({
      title: shelterPhase ? "Schuilgrot ingezet" : "Meteorietinslag",
      text,
      cards: pending.cards,
      primary: pending.isActor
        ? { label: shelterPhase ? "Meteoriet geheim terugleggen" : pending.survived ? "Gebruik Schuilgrot" : "Laat ontploffen", action: { type: "CONFIRM_METEOR" } }
        : { label: `Wachten op ${actor}`, action: null, disabled: true }
    });
    return;
  }
  if (pending.type === "STEAL_REVEAL") {
    renderStandardOnlineReveal({ title: "Deze kaart heb je gestolen", text: `${pending.source} voegde deze kaart aan je hand toe.`, cards: pending.cards, primary: { label: "Verder spelen", action: { type: "CONFIRM_STEAL" } } });
    return;
  }
  if (pending.type === "DIG_CHOICE") {
    renderStandardOnlineReveal({
      title: "Diep Graven",
      text: "Je ziet de onderste kaart. Neem hem of trek blind van boven.",
      cards: pending.cards,
      primary: { label: "Neem onderste kaart", action: { type: "DIG_CHOICE", choice: "bottom" } },
      secondary: { label: "Trek van boven", action: { type: "DIG_CHOICE", choice: "top" } }
    });
    return;
  }
  if (pending.type === "BRONTO_CHOICE") {
    renderStandardOnlineReveal({
      title: "Bronto Buik",
      text: "Je ziet de bovenste kaart. Laat hem liggen of schuif hem onderop.",
      cards: pending.cards,
      primary: { label: "Laat bovenop", action: { type: "BRONTO_CHOICE", choice: "top" } },
      secondary: { label: "Schuif onderop", action: { type: "BRONTO_CHOICE", choice: "bottom" } }
    });
    return;
  }
  if (pending.type === "WAITING") {
    const isDraw = pending.pendingType === "DRAW_REVEAL";
    renderStandardOnlineReveal({
      title: isDraw ? `${pending.playerName} trekt` : "Even wachten",
      text: isDraw ? `${pending.playerName} trekt een gesloten kaart en houdt hem geheim.` : `${pending.playerName} rondt een geheime keuze af.`,
      faceDown: isDraw,
      primary: { label: `Wachten op ${pending.playerName}`, action: null, disabled: true }
    });
    return;
  }
  if (pending.type === "TARGET_CHOICE" || pending.type === "FOSSIL_TARGET" || pending.type === "MINI_TARGET") {
    const actionType = pending.type === "TARGET_CHOICE" ? "CHOOSE_TARGET" : pending.type === "FOSSIL_TARGET" ? "CHOOSE_FOSSIL_TARGET" : "CHOOSE_MINI_TARGET";
    const title = pending.type === "TARGET_CHOICE" ? "Kies een doelwit" : pending.type === "FOSSIL_TARGET" ? "Fossielgraaier" : "Mini-Raptor";
    const targets = pending.targets.map((target, index) => ({ ...target, initials: target.name.slice(0, 2).toUpperCase(), color: multiplayerColors[index % multiplayerColors.length], label: target.name }));
    const nodes = SharedChoiceView.targetChoices(targets, { createPortrait: SharedGameView.createPlayerPortrait, onSelect: (target) => performGameAction({ type: actionType, targetId: target.id }) });
    renderStandardOnlineReveal({ title, text: pending.type === "TARGET_CHOICE" ? `Deze aanval veroorzaakt ${pending.attackLoad} volledige beurten.` : "Kies van wie je een gesloten kaart wilt stelen.", nodes, cardClass: "is-steal-target" });
    return;
  }
  if (pending.type === "FOSSIL_CARD") {
    const nodes = SharedChoiceView.closedCards(pending.cardCount, { onSelect: (cardIndex) => performGameAction({ type: "CHOOSE_FOSSIL_CARD", cardIndex }) });
    renderStandardOnlineReveal({ title: `Steel van ${pending.targetName}`, text: "Kies één gesloten kaart. Alleen de server weet welke kaart erachter zit.", nodes, cardClass: "is-fossil-choice" });
    return;
  }
  if (pending.type === "DISCARD_PICK" || pending.type === "PTERO_CHOICE") {
    const isDiscard = pending.type === "DISCARD_PICK";
    const nodes = SharedChoiceView.cardChoices(pending.cards, {
      className: isDiscard ? "" : "ptero-choice",
      renderCardFace: globalThis.renderCardFace,
      onSelect: (card) => performGameAction(isDiscard ? { type: "CHOOSE_DISCARD", cardId: card.id } : { type: "PTERO_CHOICE", topCardId: card.id })
    });
    renderStandardOnlineReveal({ title: isDiscard ? pending.source ?? "Stego Snack" : "Ptero Pret", text: isDiscard ? (pending.source === "Vijf soorten" ? "Kies open één niet-meteor kaart. Schuilgrotten staan bovenaan." : "Kies een oudere kaart uit de aflegstapel om terug te nemen.") : "Dit zijn de bovenste en onderste kaart. Kies welke bovenop blijft; de andere gaat onderop.", nodes, cardClass: isDiscard ? "is-discard-choice" : "is-ptero-choice" });
    return;
  }
  if (pending.type === "PUBLIC_PICK_REVEAL") {
    renderStandardOnlineReveal({
      title: "Vijf soorten",
      text: `${pending.playerName} neemt open ${pending.cards[0]?.name ?? "een kaart"} terug.`,
      cards: pending.cards,
      primary: pending.isActor ? { label: "Verder", action: { type: "CONFIRM_PUBLIC_PICK" } } : { label: `Wachten op ${pending.playerName}`, action: null, disabled: true }
    });
    return;
  }
  if (pending.type === "ACTION_REACTION") {
    const byId = Object.fromEntries(game.hand.map((card) => [card.id, card]));
    const nodes = pending.nopeCardIds.map((id) => SharedChoiceView.reactionCard(byId[id], {
      playable: true,
      renderCardFace: globalThis.renderCardFace,
      onSelect: (card) => performGameAction({ type: "REACTION_NOPE", cardId: card.id })
    }));
    if (!nodes.length) {
      const empty = document.createElement("p");
      empty.className = "reaction-empty-message";
      empty.textContent = "Je hebt geen Brul Terug. Je kunt direct passen.";
      nodes.push(empty);
    }
    renderStandardOnlineReveal({
      title: "Brul Terug?",
      text: `${pending.actorName} speelt ${pending.cards[0]?.name ?? "een actiekaart"}. ${pending.nopeCount} Brul Terug-kaart(en) in de keten.`,
      nodes,
      cardClass: "is-attack-reaction",
      primary: { label: "Passen", action: { type: "REACTION_PASS" } }
    });
    return;
  }
  if (pending.type === "ATTACK_REACTION" || pending.type === "NOPE_RESPONSE") {
    const byId = Object.fromEntries(game.hand.map((card) => [card.id, card]));
    const reactions = pending.type === "ATTACK_REACTION"
      ? [...pending.nopeCardIds.map((id) => ({ id, action: "ATTACK_NOPE" })), ...pending.attackCardIds.map((id) => ({ id, action: "ATTACK_REFLECT" }))]
      : pending.nopeCardIds.map((id) => ({ id, action: "NOPE_PLAY" }));
    const nodes = reactions.map(({ id, action }) => SharedChoiceView.reactionCard(byId[id], { playable: true, renderCardFace: globalThis.renderCardFace, onSelect: (card) => performGameAction({ type: action, cardId: card.id }) }));
    if (!nodes.length) {
      const empty = document.createElement("p");
      empty.className = "reaction-empty-message";
      empty.textContent = "Je hebt geen kaart die hierop kan reageren.";
      nodes.push(empty);
    }
    renderStandardOnlineReveal({
      title: pending.type === "ATTACK_REACTION" ? "Reageer op aanval" : "Brul Terug?",
      text: pending.type === "ATTACK_REACTION" ? `${pending.attackerName} valt je aan. Kies een reactie of doe niets.` : "Speel nog een Brul Terug of laat de keten oplossen.",
      nodes,
      cardClass: "is-attack-reaction",
      primary: { label: pending.type === "ATTACK_REACTION" ? "Niets doen" : "Laat doorgaan", action: { type: pending.type === "ATTACK_REACTION" ? "ATTACK_PASS" : "NOPE_PASS" } }
    });
    return;
  }
  if (pending.type === "METEOR_PLACEMENT") {
    renderStandardOnlineReveal({
      title: "Geheime terugplaatsing",
      text: "Kies waar de Meteorietinslag teruggaat. Onderin is veiliger; bovenop is gemeen voor de volgende trek.",
      cards: pending.cards,
      primary: { label: "Stop geheim terug", action: () => performGameAction({ type: "PLACE_METEOR", positionFromTop: Number(elements.placementSelect.value) }) }
    });
    elements.placementSelect.replaceChildren();
    for (let position = 1; position <= pending.deckSize + 1; position += 1) {
      const option = document.createElement("option");
      option.value = String(position);
      option.textContent = position === 1 ? "Bovenop (1)" : position === pending.deckSize + 1 ? `Onderop (${position})` : `Positie ${position} van boven`;
      elements.placementSelect.append(option);
    }
    elements.placementHint.textContent = "Alleen jij ziet waar de meteoriet wordt teruggelegd.";
    elements.placement.classList.remove("is-hidden");
    return;
  }
  if (pending.type === "ORACLE_ORDER") {
    renderOnlineOracle(pending);
    return;
  }
  renderStandardOnlineReveal({ title: "Online spelmoment", text: "De andere spelstatus wordt bijgewerkt." });
  return;
  elements.reveal.classList.remove("is-hidden");
  elements.revealEyebrow.textContent = "Online spelmoment";
  elements.revealText.textContent = "De keuze wordt direct met alle spelers gesynchroniseerd.";
  elements.revealPrimary.classList.add("is-hidden");
  elements.revealSecondary.classList.add("is-hidden");
  elements.revealCard.className = "draw-reveal__card is-multi multiplayer-reveal-host";
  if (elements.choice.parentElement !== elements.revealCard) {
    elements.revealCard.replaceChildren(elements.choice);
  }
  elements.choice.classList.remove("is-hidden");
  elements.choiceCards.replaceChildren();
  elements.choiceControls.replaceChildren();

  if (pending.type === "WAITING") {
    elements.choiceTitle.textContent = "Geheime keuze";
    elements.choiceText.textContent = `${pending.playerName} rondt een geheime keuze af.`;
    return;
  }

  if (pending.type === "TARGET_CHOICE") {
    elements.choiceTitle.textContent = "Kies een doelwit";
    elements.choiceText.textContent = `Deze aanval veroorzaakt ${pending.attackLoad} volledige beurten.`;
    elements.choiceControls.append(...pending.targets.map((target) => actionButton(
      target.name,
      { type: "CHOOSE_TARGET", targetId: target.id }
    )));
    return;
  }

  if (pending.type === "FOSSIL_TARGET" || pending.type === "MINI_TARGET") {
    const isFossil = pending.type === "FOSSIL_TARGET";
    elements.choiceTitle.textContent = isFossil ? "Fossielgraaier" : "Mini-Raptor";
    elements.choiceText.textContent = isFossil ? "Kies van wie je een gesloten kaart wilt stelen." : "Kies van wie Mini-Raptor een willekeurige kaart steelt.";
    elements.choiceControls.append(...pending.targets.map((target) => actionButton(
      `${target.name} (${target.cardCount} kaarten)`,
      { type: isFossil ? "CHOOSE_FOSSIL_TARGET" : "CHOOSE_MINI_TARGET", targetId: target.id }
    )));
    return;
  }

  if (pending.type === "FOSSIL_CARD") {
    elements.choiceTitle.textContent = `Steel van ${pending.targetName}`;
    elements.choiceText.textContent = "Kies één gesloten kaart. Alleen de server weet welke kaart erachter zit.";
    const cards = Array.from({ length: pending.cardCount }, (_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "card-back multiplayer-choice__closed-card";
      button.setAttribute("aria-label", `Gesloten kaart ${index + 1} stelen`);
      button.addEventListener("click", () => performGameAction({ type: "CHOOSE_FOSSIL_CARD", cardIndex: index }));
      return button;
    });
    elements.choiceCards.replaceChildren(...cards);
    return;
  }

  if (pending.type === "ACTION_REACTION") {
    elements.choiceTitle.textContent = "Brul Terug?";
    elements.choiceText.textContent = `${pending.actorName} speelt ${pending.cards[0]?.name ?? "een actiekaart"}. De reactie sluit automatisch na 30 seconden.`;
    const byId = Object.fromEntries(game.hand.map((card) => [card.id, card]));
    pending.nopeCardIds.forEach((cardId) => {
      elements.choiceControls.append(actionButton(`Speel ${byId[cardId]?.name ?? "Brul Terug"}`, { type: "REACTION_NOPE", cardId }, "secondary-action"));
    });
    elements.choiceControls.append(actionButton("Passen", { type: "REACTION_PASS" }));
    return;
  }

  if (pending.type === "ATTACK_REACTION") {
    elements.choiceTitle.textContent = `${pending.attackerName} valt je aan`;
    elements.choiceText.textContent = `Je moet ${pending.attackLoad} volledige beurten uitvoeren. Schuif de last door of accepteer.`;
    const byId = Object.fromEntries(game.hand.map((card) => [card.id, card]));
    pending.attackCardIds.forEach((cardId) => {
      elements.choiceControls.append(actionButton(`Schuif door met ${byId[cardId]?.name ?? "Raptoraanval"}`, { type: "ATTACK_REFLECT", cardId }, "secondary-action"));
    });
    elements.choiceControls.append(actionButton(`Accepteer ${pending.attackLoad} beurten`, { type: "ATTACK_PASS" }));
    return;
  }

  if (pending.type === "NOPE_RESPONSE") {
    elements.choiceTitle.textContent = "Brul Terug-keten";
    elements.choiceText.textContent = `${pending.nopeCount} Brul Terug-kaart(en) gespeeld. Speel er nog één of laat de keten oplossen.`;
    const byId = Object.fromEntries(game.hand.map((card) => [card.id, card]));
    pending.nopeCardIds.forEach((cardId) => {
      elements.choiceControls.append(actionButton(`Speel ${byId[cardId]?.name ?? "Brul Terug"}`, { type: "NOPE_PLAY", cardId }, "secondary-action"));
    });
    elements.choiceControls.append(actionButton("Laat oplossen", { type: "NOPE_PASS" }));
    return;
  }

  if (pending.type === "METEOR_PLACEMENT") {
    elements.choiceTitle.textContent = "Meteorietinslag terugleggen";
    elements.choiceText.textContent = "Kies geheim hoe diep de meteoriet in de trekstapel komt.";
    if (pending.cards?.length) elements.choiceCards.replaceChildren(...pending.cards.map(cardFace));
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Positie vanaf de bovenkant");
    for (let position = 1; position <= pending.deckSize + 1; position += 1) {
      const option = document.createElement("option");
      option.value = String(position);
      option.textContent = position === 1 ? "Bovenop" : position === pending.deckSize + 1 ? "Onderop" : `${position}e kaart vanaf boven`;
      select.append(option);
    }
    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.textContent = "Geheim terugleggen";
    confirm.addEventListener("click", () => performGameAction({ type: "PLACE_METEOR", positionFromTop: Number(select.value) }));
    elements.choiceControls.append(select, confirm);
    return;
  }

  if (pending.type === "DISCARD_PICK") {
    elements.choiceTitle.textContent = "Stego Snack";
    elements.choiceText.textContent = "Kies een oudere kaart uit de aflegstapel om terug te nemen.";
    elements.choiceCards.replaceChildren(...pending.cards.map((card) => {
      const face = cardFace(card);
      face.classList.add("is-choice");
      face.disabled = false;
      face.title = `${card.name} terugnemen`;
      face.addEventListener("click", () => performGameAction({ type: "CHOOSE_DISCARD", cardId: card.id }));
      return face;
    }));
    return;
  }


  if (pending.type === "ORACLE_ORDER") {
    elements.choiceTitle.textContent = "Tijdlijn Kneden";
    elements.choiceText.textContent = "Zet de kaarten van boven naar onder in de gewenste volgorde.";
    const order = [...pending.cards];
    const renderOrder = () => {
      elements.choiceCards.replaceChildren(...order.map((card, index) => {
        const wrap = document.createElement("div");
        wrap.className = "multiplayer-choice__ordered-card";
        const position = document.createElement("strong");
        position.textContent = `${index + 1}.`;
        const face = cardFace(card);
        const controls = document.createElement("div");
        const up = document.createElement("button");
        const down = document.createElement("button");
        up.type = down.type = "button";
        up.textContent = "↑";
        down.textContent = "↓";
        up.disabled = index === 0;
        down.disabled = index === order.length - 1;
        up.addEventListener("click", () => { [order[index - 1], order[index]] = [order[index], order[index - 1]]; renderOrder(); });
        down.addEventListener("click", () => { [order[index], order[index + 1]] = [order[index + 1], order[index]]; renderOrder(); });
        controls.append(up, down);
        wrap.append(position, face, controls);
        return wrap;
      }));
    };
    renderOrder();
    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.textContent = "Volgorde bevestigen";
    confirm.addEventListener("click", () => performGameAction({ type: "ORDER_ORACLE", cardIds: order.map((card) => card.id) }));
    elements.choiceControls.append(confirm);
    return;
  }

  if (pending.type === "PTERO_CHOICE") {
    elements.choiceTitle.textContent = "Ptero Pret";
    elements.choiceText.textContent = "Dit zijn de bovenste en onderste kaart. Kies welke bovenop blijft; de andere gaat onderop.";
    elements.choiceCards.replaceChildren(...pending.cards.map((card) => {
      const face = cardFace(card);
      face.classList.add("is-choice");
      face.disabled = false;
      face.title = `${card.name} bovenop leggen`;
      face.addEventListener("click", () => performGameAction({ type: "PTERO_CHOICE", topCardId: card.id }));
      return face;
    }));
  }
}

function renderOnlineGame(room) {
  const game = room.game;
  const viewModel = createMultiplayerViewModel(room, multiplayerColors);
  activeRoom = room;
  elements.joinView.classList.add("is-hidden");
  elements.lobby.classList.toggle("is-hidden", !showingRoomInfo);
  elements.modal.classList.toggle("is-hidden", !showingRoomInfo);
  elements.startModal.classList.add("is-hidden");
  elements.gameTable.classList.remove("is-hidden");
  const isTurn = game.currentPlayerId === room.viewerId;
  elements.mainAction.textContent = game.winnerId
    ? viewModel.turnText
    : game.pending ? "Rond de openstaande online keuze af."
      : viewModel.forcedDrawCount > 0 ? `Trek nog ${viewModel.forcedDrawCount} verplichte ${viewModel.forcedDrawCount === 1 ? "kaart" : "kaarten"}. Je beurt eindigt pas daarna.`
        : isTurn ? "Speel een groen gemarkeerde kaart of trek om je beurt te eindigen." : "Wacht op de andere speler.";
  const newGameLabel = game.winnerId && room.isHost ? "Nieuw online spel" : "Roominfo";
  elements.newGame.textContent = newGameLabel;
  if (elements.mobileNewGame) elements.mobileNewGame.textContent = newGameLabel;
  elements.leave.textContent = "Terug naar spel";
  elements.stopGame.classList.toggle("is-hidden", !room.isHost);
  elements.stopGame.disabled = false;
  elements.start.textContent = "Potje gestart";
  elements.start.disabled = true;

  SharedGameView.renderTable({
    turnStatus: elements.mainTurn,
    deckCount: elements.mainDeckCount,
    discard: elements.mainDiscardPile,
    discardTop: elements.mainDiscard,
    playerHint: elements.mainHint,
    drawButton: elements.mainDraw,
    opponents: elements.mainOpponents,
    playerHand: elements.mainHand,
    gameLog: elements.mainLog
  }, viewModel, {
    renderCardFace: globalThis.renderCardFace,
    onCard: (card) => showOnlineCardDetail(card, viewModel.hand.find((item) => item.card.id === card.id)?.playable)
  });
  globalThis.ExplodingDinosMenu?.render?.();
  elements.mainPlayerZone.classList.toggle("is-current", isTurn && !game.winnerId);
  elements.mainPlayerZone.classList.toggle("is-hand-collapsed", !onlineHandOpen);
  elements.mainHandToggle.textContent = onlineHandOpen ? `Sluit hand (${game.hand.length})` : `Open hand (${game.hand.length})`;
  elements.mainHandToggle.setAttribute("aria-expanded", String(onlineHandOpen));
  elements.mainHandToggle.disabled = Boolean(game.eliminated[room.viewerId]);

  if (game.winnerId) renderOnlineEndState(room);
  else renderChoice(game.pending, game);
  startPolling();
}

function resetOnlineTable() {
  elements.reveal.classList.add("is-hidden");
  elements.choice?.classList.add("is-hidden");
  elements.mainOpponents.replaceChildren();
  elements.mainHand.replaceChildren();
  elements.mainDeckCount.textContent = "0";
  elements.mainDiscard.replaceChildren();
  elements.mainDiscard.className = "discard__empty";
  elements.mainDiscard.textContent = "Nog leeg";
  elements.mainTurn.textContent = "Nog niet gestart";
  elements.mainHint.textContent = "Start een nieuw spel";
  elements.mainAction.textContent = "Kies singleplayer of start een nieuw multiplayerpotje.";
  elements.mainLog.replaceChildren();
  elements.mainDraw.disabled = true;
  elements.newGame.textContent = "Nieuw spel";
  if (elements.mobileNewGame) elements.mobileNewGame.textContent = "Nieuw spel";
  elements.startModal.classList.remove("is-hidden");
}

function showLobby(room) {
  const stoppedOnlineGame = Boolean(activeRoom?.game) && !room.game;
  activeRoom = room;
  setNameLocked(true);
  if (stoppedOnlineGame) resetOnlineTable();
  showingRoomInfo = false;
  elements.modal.classList.remove("is-hidden");
  elements.joinView.classList.add("is-hidden");
  elements.lobby.classList.remove("is-hidden");
  elements.activeCode.textContent = room.code;
  elements.lobbyStatus.textContent = room.players.length
    ? `${room.players.length} van maximaal 5 spelers verbonden.`
    : "Room opnieuw verbinden…";
  elements.start.disabled = !room.isHost || room.players.length < 2;
  elements.stopGame.classList.add("is-hidden");
  elements.leave.textContent = "Room verlaten";
  elements.start.textContent = "Start multiplayer";
  elements.startNote.textContent = room.isHost
    ? room.players.length < 2 ? "Nodig minimaal één vriend uit om te starten." : "Iedereen is klaar. Jij kunt het online potje starten."
    : "Wacht tot de host het multiplayerpotje start.";
  renderPlayers(room);
  startPolling();
}

function showJoin() {
  setNameLocked(false);
  elements.joinView.classList.remove("is-hidden");
  elements.lobby.classList.add("is-hidden");
  const linkedRoom = roomFromUrl();
  elements.code.value = linkedRoom;
  elements.codeField.classList.toggle("is-hidden", !linkedRoom);
  elements.create.classList.toggle("is-hidden", Boolean(linkedRoom));
  elements.join.classList.toggle("is-hidden", !linkedRoom);
  elements.status.textContent = linkedRoom
    ? `Je bent uitgenodigd voor room ${linkedRoom}.`
    : "Maak een nieuwe room en deel daarna de uitnodigingslink.";
}

async function createRoom() {
  if (roomConnectionBusy) return;
  setBusy(true, "De dinoserver wordt wakker. De eerste verbinding kan ongeveer een minuut duren...");
  try {
    const result = await request("/api/rooms", { method: "POST", body: JSON.stringify({ name: elements.name.value }) });
    saveSession({ code: result.room.code, token: result.token });
    syncRoomUrl(result.room.code);
    showLobby(result.room);
  } catch (error) {
    elements.status.textContent = error.message;
  } finally { setBusy(false); }
}

function isDuplicateNameError(error) {
  return /naam wordt al gebruikt/i.test(error?.message ?? "");
}

async function joinWithGeneratedNameRetry(code) {
  const attemptedNames = new Set();
  const retryLimit = 8;

  for (let attempt = 0; attempt <= retryLimit; attempt += 1) {
    attemptedNames.add(elements.name.value);
    try {
      return await request(`/api/rooms/${encodeURIComponent(code)}/join`, {
        method: "POST",
        body: JSON.stringify({ name: elements.name.value })
      });
    } catch (error) {
      if (!nameWasGenerated || !isDuplicateNameError(error) || attempt === retryLimit) throw error;
      setRandomDinoName(false, attemptedNames);
      elements.status.textContent = "Die dinonaam was al bezet. We proberen automatisch een andere...";
    }
  }
}

async function joinRoom() {
  if (roomConnectionBusy) return;
  setBusy(true, "We maken verbinding met de room. Na rust kan de dinoserver ongeveer een minuut nodig hebben...");
  try {
    const code = elements.code.value.trim().toUpperCase();
    const result = await joinWithGeneratedNameRetry(code);
    saveSession({ code: result.room.code, token: result.token });
    syncRoomUrl(result.room.code);
    showLobby(result.room);
  } catch (error) {
    elements.status.textContent = error.message;
  } finally { setBusy(false); }
}

async function pollRoom() {
  if (!session) return;
  try {
    const result = await request(`/api/rooms/${encodeURIComponent(session.code)}`);
    if (result.room.game) renderOnlineGame(result.room);
    else showLobby(result.room);
  } catch (error) {
    elements.lobbyStatus.textContent = error.message;
    if (/bestaat niet|sessie/.test(error.message)) {
      saveSession(null);
      syncRoomUrl(null);
      stopPolling();
      showJoin();
    }
  }
}

async function startOnlineGame() {
  elements.start.disabled = true;
  try {
    const result = await request(`/api/rooms/${encodeURIComponent(session.code)}/start`, { method: "POST", body: "{}" });
    renderOnlineGame(result.room);
  } catch (error) {
    elements.lobbyStatus.textContent = error.message;
    elements.start.disabled = false;
  }
}

async function stopOnlineGame() {
  elements.stopGame.disabled = true;
  try {
    const result = await request(`/api/rooms/${encodeURIComponent(session.code)}/stop`, { method: "POST", body: "{}" });
    showLobby(result.room);
  } catch (error) {
    elements.lobbyStatus.textContent = error.message;
    elements.stopGame.disabled = false;
  }
}

async function performGameAction(action) {
  elements.mainDraw.disabled = true;
  try {
    const current = await request(`/api/rooms/${encodeURIComponent(session.code)}`);
    const result = await request(`/api/rooms/${encodeURIComponent(session.code)}/actions`, {
      method: "POST",
      body: JSON.stringify({ expectedVersion: current.room.version, action })
    });
    renderOnlineGame(result.room);
  } catch (error) {
    elements.mainAction.textContent = error.message;
    await pollRoom();
  }
}

function startPolling() {
  stopPolling();
  pollTimer = globalThis.setInterval?.(pollRoom, 2000) ?? null;
}

function stopPolling() {
  if (pollTimer !== null) globalThis.clearInterval?.(pollTimer);
  pollTimer = null;
}

async function leaveRoom() {
  try { await request(`/api/rooms/${encodeURIComponent(session.code)}`, { method: "DELETE" }); }
  catch { /* Lokaal verlaten blijft mogelijk als de server offline is. */ }
  saveSession(null);
  syncRoomUrl(null);
  activeRoom = null;
  stopPolling();
  showJoin();
}

async function startNewRoom() {
  const oldSession = session;
  if (!oldSession) return;
  elements.newGame.disabled = true;
  if (elements.mobileNewGame) elements.mobileNewGame.disabled = true;
  stopPolling();
  try {
    await request(`/api/rooms/${encodeURIComponent(oldSession.code)}`, { method: "DELETE" });
  } catch { /* Een nieuwe room maken blijft mogelijk als de oude niet bereikbaar is. */ }
  saveSession(null);
  syncRoomUrl(null);
  activeRoom = null;
  resetOnlineTable();
  try {
    await createRoom();
  } finally {
    elements.newGame.disabled = false;
    if (elements.mobileNewGame) elements.mobileNewGame.disabled = false;
  }
}

async function copyRoomLink() {
  const link = invitationUrl(session.code);
  try {
    await globalThis.navigator.clipboard.writeText(link);
    elements.lobbyStatus.textContent = "Uitnodigingslink gekopieerd.";
  } catch {
    elements.lobbyStatus.textContent = link;
  }
}

elements.open.addEventListener("click", openModal);
elements.close.addEventListener("click", closeModal);
elements.create.addEventListener("click", createRoom);
elements.join.addEventListener("click", joinRoom);
elements.leave.addEventListener("click", leaveRoom);
elements.copy.addEventListener("click", copyRoomLink);
elements.stopGame.addEventListener("click", stopOnlineGame);
elements.randomizeName.addEventListener("click", setRandomDinoName);
elements.name.addEventListener("input", () => { nameWasGenerated = false; });
elements.start.addEventListener("click", startOnlineGame);
elements.mainDraw.addEventListener("click", (event) => {
  if (!activeRoom?.game) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  performGameAction({ type: "DRAW_CARD" });
}, true);
elements.mainHandToggle.addEventListener("click", (event) => {
  if (!activeRoom?.game) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  onlineHandOpen = !onlineHandOpen;
  elements.mainPlayerZone.classList.toggle("is-hand-collapsed", !onlineHandOpen);
  elements.mainHandToggle.textContent = onlineHandOpen ? `Sluit hand (${activeRoom.game.hand.length})` : `Open hand (${activeRoom.game.hand.length})`;
  elements.mainHandToggle.setAttribute("aria-expanded", String(onlineHandOpen));
}, true);
elements.revealPrimary.addEventListener("click", (event) => {
  if (!inspectedOnlineCard && !onlineRevealActions?.primary) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (inspectedOnlineCard) closeOnlineCardDetail();
  else {
    const action = onlineRevealActions.primary;
    onlineRevealActions = null;
    runOnlineRevealAction(action);
  }
}, true);
elements.revealSecondary.addEventListener("click", (event) => {
  if (!inspectedOnlineCard && !onlineRevealActions?.secondary) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (inspectedOnlineCard) {
    const card = inspectedOnlineCard.card;
    inspectedOnlineCard = null;
    performGameAction({ type: "PLAY_CARD", cardId: card.id });
  } else {
    const action = onlineRevealActions.secondary;
    onlineRevealActions = null;
    runOnlineRevealAction(action);
  }
}, true);
[elements.newGame, elements.mobileNewGame].filter(Boolean).forEach((button) => {
  button.addEventListener("click", (event) => {
    if (!activeRoom?.game) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (button === elements.mobileNewGame) {
      elements.mobileMenu.classList.add("is-hidden");
      elements.mobileMenuButton.setAttribute("aria-expanded", "false");
    }
    if (activeRoom.game.winnerId && activeRoom.isHost) {
      startNewRoom();
      return;
    }
    openOnlineRoomInfo();
  }, true);
});
elements.leave.addEventListener("click", (event) => {
  if (!activeRoom?.game) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  closeModal();
}, true);
elements.modal.addEventListener("click", (event) => { if (event.target === elements.modal) closeModal(); });
document.addEventListener?.("keydown", (event) => {
  if (event.key === "Escape" && !elements.modal.classList.contains("is-hidden")) closeModal();
});

if (roomFromUrl()) openModal();

globalThis.ExplodingDinosMultiplayer = { invitationUrl, isActive: () => Boolean(activeRoom?.game), openModal, pollRoom };
})();
