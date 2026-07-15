const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

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
    if (force === undefined) {
      if (this.values.has(item)) this.values.delete(item);
      else this.values.add(item);
      return this.values.has(item);
    }
    if (force) this.values.add(item);
    else this.values.delete(item);
    return Boolean(force);
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
    this.eventListeners = {};
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

  remove() {
    this.removed = true;
  }

  get firstElementChild() {
    return this.children[0] ?? null;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  addEventListener(type, listener) {
    this.eventListeners[type] ??= [];
    this.eventListeners[type].push(listener);
  }

  click() {
    const event = {
      target: this,
      preventDefault() {},
      stopImmediatePropagation() {}
    };
    (this.eventListeners.click ?? []).forEach((listener) => listener(event));
  }

  focus() {
    globalThis.document.activeElement = this;
  }

  querySelectorAll() {
    return [];
  }
}

const selectors = new Map();

function getSelector(selector) {
  if (!selectors.has(selector)) selectors.set(selector, new Element(selector));
  return selectors.get(selector);
}

globalThis.document = {
  querySelector: getSelector,
  createElement: (tag) => new Element(tag),
  addEventListener() {},
  activeElement: null,
  body: new Element("body")
};

globalThis.window = {
  setTimeout: (callback) => {
    if (typeof callback === "function") callback();
    return 0;
  }
};

globalThis.location = { href: "https://example.test/index.html", search: "" };
globalThis.history = { replaceState() {} };
globalThis.navigator = { clipboard: { writeText: async () => {} } };
globalThis.sessionStorage = {
  getItem: () => null,
  removeItem() {},
  setItem() {}
};

globalThis.crypto = {
  randomUUID: () => Math.random().toString(16).slice(2)
};

function runBrowserScript(relativePath) {
  const filePath = path.resolve(__dirname, "../../../../", relativePath);
  const source = fs.readFileSync(filePath, "utf8");
  vm.runInThisContext(source, { filename: relativePath });
}

function scriptsFromIndex() {
  const projectRoot = path.resolve(__dirname, "../../../../");
  const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  return [...html.matchAll(/<script\s+src=["']([^"']+)["'][^>]*><\/script>/g)]
    .map((match) => match[1].split("?")[0])
    .filter((src) => !/^(?:https?:)?\/\//.test(src));
}

const loadedScripts = scriptsFromIndex();
loadedScripts.forEach(runBrowserScript);

globalThis.ExplodingDinosRuntime.configure({ random: () => 0 });
getSelector("#startGameButton").click();

const result = {
  loadedScripts,
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

if (result.loadedScripts[0] !== "src/runtime.js" || !result.loadedScripts.includes("game.js")) {
  throw new Error(`Expected index.html script order, got: ${result.loadedScripts.join(", ")}`);
}
