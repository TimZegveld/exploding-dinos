class ClassList {
  constructor() {
    this.values = new Set();
  }

  add(...items) {
    items.forEach((item) => this.values.add(item));
  }

  remove(...items) {
    items.forEach((item) => this.values.delete(item));
  }

  toggle(item, force) {
    if (force) this.values.add(item);
    else this.values.delete(item);
  }

  contains(item) {
    return this.values.has(item);
  }
}

class Element {
  constructor(tag = "div") {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.dataset = {};
    this.style = {
      setProperty: (name, value) => {
        this.style[name] = value;
      }
    };
    this.classList = new ClassList();
    this.attributes = {};
    this.textContent = "";
    this.value = "1";
    this.disabled = false;
    this.src = "";
    this.alt = "";
    this.loading = "";
  }

  append(...items) {
    items.forEach((item) => this.appendChild(item));
  }

  appendChild(item) {
    this.children.push(item);
    return item;
  }

  prepend(...items) {
    this.children.unshift(...items);
  }

  replaceChildren(...items) {
    this.children = [];
    this.append(...items);
  }

  removeChild(item) {
    this.children = this.children.filter((child) => child !== item);
    return item;
  }

  get firstElementChild() {
    return this.children[0] ?? null;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  addEventListener() {}
}

const selectors = new Map();

function getSelector(selector) {
  if (!selectors.has(selector)) selectors.set(selector, new Element(selector));
  return selectors.get(selector);
}

globalThis.document = {
  querySelector: getSelector,
  createElement: (tag) => new Element(tag)
};

globalThis.window = {
  setTimeout: () => 0
};

globalThis.crypto = {
  randomUUID: () => Math.random().toString(16).slice(2)
};

require("../../../../src/cards.js");
require("../../../../src/players.js");
require("../../../../game.js");

const result = {
  handCards: getSelector("#playerHand").children.length,
  opponents: getSelector("#opponents").children.length,
  status: getSelector("#turnStatus").textContent,
  action: getSelector("#actionText").textContent,
  deckCount: getSelector("#deckCount").textContent
};

console.log(JSON.stringify(result, null, 2));

if (result.handCards < 1) {
  throw new Error("Expected the player hand to render at least one card.");
}

if (result.opponents < 1) {
  throw new Error("Expected at least one opponent to render.");
}

if (result.status !== "Jouw beurt") {
  throw new Error(`Expected initial status "Jouw beurt", got "${result.status}".`);
}
