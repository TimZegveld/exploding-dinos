(() => {
function createPlayerPortrait(player, options = {}) {
  const portrait = document.createElement("span");
  portrait.className = "player-portrait";
  if (options.small) portrait.classList.add("player-portrait--small");
  portrait.style.setProperty("--player-color", player.color);
  portrait.setAttribute("aria-label", `Portret van ${player.name}`);

  if (player.portrait) {
    const image = document.createElement("img");
    image.src = player.portrait;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.remove();
      portrait.classList.add("is-fallback");
      portrait.textContent = player.initials;
    }, { once: true });
    portrait.append(image);
  } else {
    portrait.classList.add("is-fallback");
    portrait.textContent = player.initials;
  }
  return portrait;
}

function createOpponentSeat(player) {
  const seat = document.createElement("section");
  seat.className = "opponent-seat";
  seat.style.setProperty("--player-color", player.color);
  seat.classList.toggle("is-current", player.isCurrent);
  seat.classList.toggle("is-eliminated", player.eliminated);

  const labelWrap = document.createElement("div");
  labelWrap.className = "player-label";
  const identity = document.createElement("div");
  identity.className = "player-identity";
  const portraitWrap = document.createElement("div");
  portraitWrap.className = "player-portrait-wrap";
  portraitWrap.append(createPlayerPortrait(player));
  const textWrap = document.createElement("div");
  textWrap.className = "player-name-block";
  const name = document.createElement("span");
  name.textContent = player.name;
  const role = document.createElement("small");
  role.textContent = player.subtitle;
  role.dataset.mobileText = player.countLabel;
  const count = document.createElement("strong");
  count.textContent = player.countLabel;
  const hand = document.createElement("div");
  hand.className = "pc-hand";

  for (let index = 0; index < player.cardCount; index += 1) {
    const back = document.createElement("div");
    back.className = "card-back";
    back.setAttribute("aria-label", `Gesloten kaart van ${player.name}`);
    hand.append(back);
  }

  textWrap.append(name, role);
  identity.append(portraitWrap, textWrap);
  labelWrap.append(identity, count);
  seat.append(labelWrap, hand);
  return seat;
}

function renderOpponents(container, players) {
  container.replaceChildren(...players.map(createOpponentSeat));
}

function renderHand(container, cards, { renderCardFace, onCard }) {
  container.replaceChildren(...cards.map((item) => {
    const button = document.createElement("button");
    button.className = "card-button";
    button.type = "button";
    button.dataset.kind = item.card.kind;
    button.dataset.canPlay = String(item.playable);
    button.disabled = item.disabled;
    button.setAttribute("aria-label", `${item.card.name}. ${item.playable ? "Speelbaar; tik voor details" : "Nu niet speelbaar; tik voor details"}`);
    renderCardFace(button, item.card);
    button.addEventListener("click", () => onCard(item.card));
    return button;
  }));
}

function renderDiscard(discard, discardTop, card, renderCardFace) {
  discardTop.className = "";
  discardTop.removeAttribute?.("aria-label");
  discard.classList.toggle("is-empty", !card);
  if (!card) {
    discardTop.className = "discard__empty";
    discardTop.setAttribute("aria-label", "Aflegstapel is leeg");
    discardTop.textContent = "";
    return;
  }
  discardTop.className = "discard__top-card";
  discardTop.setAttribute("aria-label", `Afgelegde kaart: ${card.name}`);
  renderCardFace(discardTop, card, { mini: true });
}

function renderLog(container, messages, maximum = 22) {
  container.replaceChildren(...messages.slice(-maximum).map((message) => {
    const item = document.createElement("li");
    item.textContent = message;
    return item;
  }));
}

function renderTable(elements, model, handlers) {
  elements.turnStatus.textContent = model.turnText;
  elements.turnStatus.style.setProperty("--player-color", model.currentColor);
  elements.deckCount.textContent = String(model.deckCount);
  elements.playerHint.textContent = model.playerHint;
  elements.drawButton.disabled = !model.canDraw;
  renderOpponents(elements.opponents, model.opponents);
  renderHand(elements.playerHand, model.hand, handlers);
  renderDiscard(elements.discard, elements.discardTop, model.discardTop, handlers.renderCardFace);
  if (elements.gameLog && model.log) renderLog(elements.gameLog, model.log);
}

globalThis.ExplodingDinosGameView = {
  createOpponentSeat,
  createPlayerPortrait,
  renderDiscard,
  renderHand,
  renderLog,
  renderOpponents,
  renderTable
};
if (typeof module !== "undefined" && module.exports) module.exports = globalThis.ExplodingDinosGameView;
})();
