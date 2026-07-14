(() => {
function openCard(element, card, renderCardFace, options = {}) {
  element.classList.add(`is-${card.kind}`);
  if (options.shaking) element.classList.add("is-shaking");
  renderCardFace(element, card, { large: true });
}

function closedCard(element) {
  element.classList.add("is-back");
  element.setAttribute("aria-label", "Gesloten dino kaart");
}

function cards(element, items, renderCardFace, options = {}) {
  element.classList.add("is-multi");
  items.forEach((card) => {
    const item = document.createElement("div");
    item.className = "draw-reveal__mini-card";
    if (options.faceDown) {
      closedCard(item);
    } else {
      item.classList.add(`is-${card.kind}`);
      if (options.shaking) item.classList.add("is-shaking");
      renderCardFace(item, card, { mini: true });
    }
    element.append(item);
  });
}

function reset(elements) {
  elements.reveal.classList.remove("is-hidden");
  elements.card.className = "draw-reveal__card";
  elements.card.replaceChildren();
  elements.primary.classList.remove("is-hidden");
  elements.secondary.classList.add("is-hidden");
  elements.primary.disabled = false;
  elements.secondary.disabled = false;
}

function hide(elements) {
  elements.reveal.classList.add("is-hidden");
}

globalThis.ExplodingDinosRevealView = { cards, closedCard, hide, openCard, reset };
if (typeof module !== "undefined" && module.exports) module.exports = globalThis.ExplodingDinosRevealView;
})();
