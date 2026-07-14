(() => {
function closedCards(count, { selected = new Set(), onSelect }) {
  return Array.from({ length: count }, (_, index) => {
    const button = document.createElement("button");
    button.className = "draw-reveal__mini-card is-back fossil-choice";
    button.type = "button";
    button.dataset.selected = String(selected.has(index));
    button.textContent = `Kaart ${index + 1}`;
    button.addEventListener("click", () => onSelect(index));
    return button;
  });
}

function cardChoices(cards, { className = "", selectedId = null, onSelect, renderCardFace }) {
  return cards.map((card) => {
    const button = document.createElement("button");
    button.className = `draw-reveal__mini-card ${className}`.trim();
    button.type = "button";
    button.classList.add(`is-${card.kind}`);
    button.dataset.selected = String(card.id === selectedId);
    renderCardFace(button, card, { mini: true });
    button.addEventListener("click", () => onSelect(card));
    return button;
  });
}

function targetChoices(targets, { selectedId = null, onSelect, createPortrait, small = false, className = "steal-target" }) {
  return targets.map((target) => {
    const button = document.createElement("button");
    button.className = `draw-reveal__mini-card ${className}`;
    button.type = "button";
    button.style.setProperty("--player-color", target.color);
    button.dataset.selected = String(target.id === selectedId);
    const name = document.createElement("strong");
    name.textContent = target.label ?? target.name;
    button.append(createPortrait(target, { small }), name);
    if (target.cardCount !== undefined) {
      const count = document.createElement("span");
      count.textContent = `${target.cardCount} kaart${target.cardCount === 1 ? "" : "en"}`;
      button.append(count);
    }
    button.addEventListener("click", () => onSelect(target));
    return button;
  });
}

function reactionCard(card, { playable, onSelect, renderCardFace }) {
  const button = document.createElement("button");
  button.className = "draw-reveal__mini-card";
  button.type = "button";
  button.classList.add(`is-${card.kind}`);
  button.disabled = !playable;
  button.setAttribute("aria-disabled", String(!playable));
  renderCardFace(button, card, { mini: true });
  button.addEventListener("click", () => onSelect(card));
  return button;
}

globalThis.ExplodingDinosChoiceView = { cardChoices, closedCards, reactionCard, targetChoices };
if (typeof module !== "undefined" && module.exports) module.exports = globalThis.ExplodingDinosChoiceView;
})();
