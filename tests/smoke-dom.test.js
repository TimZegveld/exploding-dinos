const assert = require("node:assert/strict");
const test = require("node:test");
const { createBrowserHarness } = require("./browser-harness");

function loadGame() {
  const harness = createBrowserHarness();
  harness.runBrowserScript("src/cards.js");
  harness.runBrowserScript("src/players.js");
  harness.runBrowserScript("game.js");
  return harness;
}

test("game starts and renders the initial table", () => {
  const { getSelector } = loadGame();

  assert.equal(getSelector("#turnStatus").textContent, "Jouw beurt");
  assert.equal(getSelector("#playerHand").children.length, 8);
  assert.equal(getSelector("#opponents").children.length, 1);
  assert.equal(getSelector("#discardTop").textContent, "Nog leeg");
  assert.match(getSelector("#actionText").textContent, /Speel actiekaarten/);
  assert.ok(Number(getSelector("#deckCount").textContent) > 0);
});

test("draw button opens a pending draw reveal", () => {
  const { getSelector } = loadGame();

  getSelector("#drawButton").click();

  assert.equal(getSelector("#drawReveal").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#revealEyebrow").textContent, "Jij trekt");
  assert.match(getSelector("#revealText").textContent, /aan je hand toe te voegen/i);
});

test("catalog tab renders all unique cards", () => {
  const { getSelector, sandbox } = loadGame();
  const expectedCount = Object.keys(sandbox.ExplodingDinosCards.cardCatalog).length;

  getSelector("#showCatalogPage").click();

  assert.equal(getSelector("#catalogPage").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#catalogGrid").children.length, expectedCount);
  assert.equal(getSelector("#catalogCount").textContent, `${expectedCount} unieke kaarten`);
});
