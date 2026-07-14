const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadCardsModule() {
  const sandbox = {
    Math,
    crypto: {
      randomUUID: () => Math.random().toString(16).slice(2)
    }
  };
  sandbox.globalThis = sandbox;

  const source = fs.readFileSync(path.resolve(__dirname, "..", "src", "cards.js"), "utf8");
  vm.runInNewContext(source, sandbox, { filename: "src/cards.js" });
  return sandbox.ExplodingDinosCards;
}

test("deck mode follows player-count ranges", () => {
  const { deckModeForPlayers } = loadCardsModule();

  assert.equal(deckModeForPlayers(2), "compact");
  assert.equal(deckModeForPlayers(3), "compact");
  assert.equal(deckModeForPlayers(4), "standard");
  assert.equal(deckModeForPlayers(7), "standard");
  assert.equal(deckModeForPlayers(8), "full");
});

test("buildCardPool uses compact counts for two or three players", () => {
  const { buildCardPool, partyPackDistribution } = loadCardsModule();
  const pool = buildCardPool(2);
  const expected = Object.entries(partyPackDistribution)
    .filter(([type]) => type !== "meteor" && type !== "shelter")
    .reduce((sum, [, counts]) => sum + counts.compact, 0);

  assert.equal(pool.length, expected);
  assert.equal(pool.every((card) => card.isCompact), true);
  assert.equal(pool.some((card) => card.type === "meteor"), false);
  assert.equal(pool.some((card) => card.type === "shelter"), false);
});

test("buildCardPool uses standard counts for four to seven players", () => {
  const { buildCardPool, partyPackDistribution } = loadCardsModule();
  const pool = buildCardPool(4);
  const expected = Object.entries(partyPackDistribution)
    .filter(([type]) => type !== "meteor" && type !== "shelter")
    .reduce((sum, [, counts]) => sum + counts.total - counts.compact, 0);

  assert.equal(pool.length, expected);
  assert.equal(pool.every((card) => !card.isCompact), true);
});

test("makeCard resolves catalog data and illustration variants", () => {
  const { makeCard } = loadCardsModule();
  const firstVariant = makeCard("miniRaptor", true, 0);
  const secondVariant = makeCard("miniRaptor", true, 1);

  assert.equal(firstVariant.name, "Mini-Raptor");
  assert.equal(firstVariant.kind, "set");
  assert.equal(firstVariant.isCompact, true);
  assert.notEqual(firstVariant.id, secondVariant.id);
  assert.notEqual(firstVariant.design.image, secondVariant.design.image);
});

test("every catalog card declares its turn effect", () => {
  const { cardCatalog } = loadCardsModule();
  const allowedEffects = new Set(["none", "continue", "skipTurn", "endTurn"]);

  Object.entries(cardCatalog).forEach(([type, card]) => {
    assert.ok(allowedEffects.has(card.turnEffect), `${type} has a valid turnEffect`);
  });
});
