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

test("Party Pack contains eleven meteors and 122 cards in total", () => {
  const { partyPackDistribution } = loadCardsModule();
  const totalCards = Object.values(partyPackDistribution)
    .reduce((sum, counts) => sum + counts.total, 0);

  assert.equal(partyPackDistribution.meteor.total, 11);
  assert.equal(totalCards, 122);
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
  assert.deepEqual(firstVariant.design.crop, secondVariant.design.crop);
  assert.match(firstVariant.design.crop.default, /^\d+% \d+%$/);
  assert.match(firstVariant.design.crop.large, /^\d+% \d+%$/);
});

test("every illustrated card resolves data-driven artwork focus", () => {
  const { cardCatalog, makeCard } = loadCardsModule();

  Object.keys(cardCatalog).forEach((type) => {
    const crop = makeCard(type).design.crop;
    assert.equal(typeof crop.default, "string", `${type} has a default crop`);
    assert.equal(typeof crop.large, "string", `${type} has a large crop`);
  });
});

test("every catalog card declares its turn effect", () => {
  const { cardCatalog } = loadCardsModule();
  const allowedEffects = new Set(["none", "continue", "skipTurn", "endTurn"]);

  Object.entries(cardCatalog).forEach(([type, card]) => {
    assert.ok(allowedEffects.has(card.turnEffect), `${type} has a valid turnEffect`);
  });
});

test("all 17 cards expose complete shared rule metadata", () => {
  const { cardCatalog } = loadCardsModule();
  assert.equal(Object.keys(cardCatalog).length, 17);
  Object.entries(cardCatalog).forEach(([type, card]) => {
    assert.deepEqual(Object.keys(card.rules).sort(), ["icons", "reactable", "target", "timing", "turn", "visibility"], type);
    assert.equal(card.rules.icons.includes("secret"), false, type);
    assert.equal(card.rules.icons.includes("public"), false, type);
    assert.ok(card.rules.visibility, type);
  });
});

test("Brul Terug is marked as reactable during an active chain", () => {
  const { cardCatalog } = loadCardsModule();
  assert.equal(cardCatalog.nope.rules.reactable, true);
  assert.equal(cardCatalog.nope.rules.icons.includes("reaction"), true);
  assert.match(cardCatalog.nope.rules.target, /Brul Terug/);
});

test("card turn effects match the audited turn rules", () => {
  const { cardCatalog } = loadCardsModule();
  const expected = {
    meteor: "none", shelter: "none", raptor: "endTurn", targetedRaptor: "endTurn",
    sprint: "skipTurn", trike: "continue", oracle: "continue", volcano: "continue",
    dig: "continue", fossil: "continue", nope: "none", feral: "continue",
    miniRaptor: "continue", stegoSnack: "continue", brontoBuik: "continue",
    triceraTuk: "skipTurn", pteroPret: "continue"
  };

  assert.deepEqual(
    Object.fromEntries(Object.entries(cardCatalog).map(([type, card]) => [type, card.turnEffect])),
    expected
  );
});
