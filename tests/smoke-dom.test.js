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

test("page opens with the opponent selection modal", () => {
  const { getSelector } = loadGame();

  assert.equal(getSelector("#startModal").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#opponentRoster").children.length, 9);
  assert.match(getSelector("#actionText").textContent, /Kies je tegenspelers/);
  assert.equal(getSelector("#drawButton").disabled, true);
});

test("npc colors are unique and stable in games", () => {
  const { sandbox } = loadGame();
  const { opponentPersonas, createPlayers } = sandbox.ExplodingDinosPlayers;
  const colors = opponentPersonas.map((persona) => persona.color);

  assert.equal(new Set(colors).size, opponentPersonas.length);

  const selectedIds = ["tara", "rex", "mira", "otto"];
  const players = createPlayers(selectedIds).filter((player) => !player.isHuman);

  players.forEach((player) => {
    const persona = opponentPersonas.find((item) => item.personaId === player.personaId);
    assert.equal(player.color, persona.color);
  });
});

test("starting from the modal renders the initial table", () => {
  const { getSelector } = loadGame();

  getSelector("#startGameButton").click();

  assert.equal(getSelector("#startModal").classList.contains("is-hidden"), true);
  assert.equal(getSelector("#turnStatus").textContent, "Jouw beurt");
  assert.equal(getSelector("#playerHand").children.length, 8);
  assert.equal(getSelector("#opponents").children.length, 1);
  assert.equal(getSelector("#discardTop").textContent, "Nog leeg");
  assert.match(getSelector("#actionText").textContent, /Speel actiekaarten/);
  assert.ok(Number(getSelector("#deckCount").textContent) > 0);
});

test("draw button opens a pending draw reveal", () => {
  const { getSelector } = loadGame();

  getSelector("#startGameButton").click();
  getSelector("#drawButton").click();

  assert.equal(getSelector("#drawReveal").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#revealEyebrow").textContent, "Jij trekt");
  assert.match(getSelector("#revealText").textContent, /kaart|Meteorietinslag|Schuilgrot/i);
});

test("catalog tab renders all unique cards", () => {
  const { getSelector, sandbox } = loadGame();
  const expectedCount = Object.keys(sandbox.ExplodingDinosCards.cardCatalog).length;

  getSelector("#showCatalogPage").click();

  assert.equal(getSelector("#catalogPage").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#catalogGrid").children.length, expectedCount);
  assert.equal(getSelector("#catalogCount").textContent, `${expectedCount} unieke kaarten`);
});
