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

  insertAdjacentElement(_position, element) {
    this.appendChild(element);
    return element;
  }

  replaceChildren(...items) {
    this.children = [];
    this.append(...items);
  }

  remove() {
    this.removed = true;
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

  getAttribute(name) {
    return this.attributes[name];
  }

  addEventListener(type, listener) {
    this.eventListeners[type] ??= [];
    this.eventListeners[type].push(listener);
  }

  click() {
    const event = { target: this };
    (this.eventListeners.click ?? []).forEach((listener) => listener(event));
  }
}

function createBrowserHarness() {
  const selectors = new Map();

  function getSelector(selector) {
    if (!selectors.has(selector)) selectors.set(selector, new Element(selector));
    return selectors.get(selector);
  }

  const sandbox = {
    console,
    Math,
    structuredClone,
    crypto: {
      randomUUID: () => Math.random().toString(16).slice(2)
    },
    document: {
      querySelector: getSelector,
      createElement: (tag) => new Element(tag)
    },
    window: {
      setTimeout: (callback) => {
        if (typeof callback === "function") callback();
        return 0;
      }
    }
  };
  sandbox.globalThis = sandbox;
  sandbox.window.globalThis = sandbox;

  function runBrowserScript(relativePath) {
    const filePath = path.resolve(__dirname, "..", relativePath);
    const source = fs.readFileSync(filePath, "utf8");
    vm.runInNewContext(source, sandbox, { filename: relativePath });
  }

  return {
    Element,
    getSelector,
    runBrowserScript,
    sandbox,
    selectors
  };
}

module.exports = {
  ClassList,
  Element,
  createBrowserHarness
};
