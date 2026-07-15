const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadRulesModule() {
  const sandbox = {};
  sandbox.globalThis = sandbox;

  const source = fs.readFileSync(path.resolve(__dirname, "..", "src", "rules.js"), "utf8");
  vm.runInNewContext(source, sandbox, { filename: "src/rules.js" });
  return sandbox.ExplodingDinosRules;
}

function card(type, id = type) {
  return { id, type };
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test("setup counts add the right meteors and extra shelters per deck mode", () => {
  const { calculateSetupCounts } = loadRulesModule();
  const distribution = {
    shelter: { total: 10, compact: 3 }
  };
  const deckModeForPlayers = (players) => players <= 3 ? "compact" : "standard";

  assert.deepEqual(plain(calculateSetupCounts(2, distribution, deckModeForPlayers)), {
    mode: "compact",
    shelterCount: 3,
    extraDefuses: 1,
    meteors: 2
  });
  assert.deepEqual(plain(calculateSetupCounts(5, distribution, deckModeForPlayers)), {
    mode: "standard",
    shelterCount: 7,
    extraDefuses: 2,
    meteors: 5
  });
  [2, 3, 4, 5].forEach((players) => {
    assert.equal(calculateSetupCounts(players, distribution, deckModeForPlayers).meteors, players);
  });
});

test("startspeler wordt uit alle spelers willekeurig gekozen", () => {
  const { chooseStartingPlayerId } = loadRulesModule();
  const players = [{ id: "first" }, { id: "middle" }, { id: "last" }];

  assert.equal(chooseStartingPlayerId(players, 0), "first");
  assert.equal(chooseStartingPlayerId(players, 0.5), "middle");
  assert.equal(chooseStartingPlayerId(players, 0.999), "last");
});

test("meteor without shelter discards the meteor and marks no survival", () => {
  const { resolveMeteorDraw } = loadRulesModule();
  const hand = [card("raptor")];
  const discard = [];
  const meteor = card("meteor");

  assert.deepEqual(plain(resolveMeteorDraw(hand, discard, meteor)), {
    survived: false,
    shelter: null
  });
  assert.deepEqual(hand, [card("raptor")]);
  assert.deepEqual(discard, [meteor]);
});

test("meteor with shelter discards only the shelter and returns the meteor for placement", () => {
  const { insertMeteorBack, resolveMeteorDraw } = loadRulesModule();
  const hand = [card("raptor"), card("shelter", "safe")];
  const discard = [];
  const deck = [card("dig"), card("oracle")];
  const meteor = card("meteor");

  assert.deepEqual(plain(resolveMeteorDraw(hand, discard, meteor)), {
    survived: true,
    shelter: card("shelter", "safe")
  });
  assert.deepEqual(hand, [card("raptor")]);
  assert.deepEqual(discard, [card("shelter", "safe")]);
  assert.equal(insertMeteorBack(deck, meteor, 1), 1);
  assert.deepEqual(deck, [card("dig"), meteor, card("oracle")]);
});

test("raptor attacks set pending turns and stack when reflected", () => {
  const { applyRaptorAttack, resolveIncomingAttackLoad } = loadRulesModule();
  const pendingTurns = { player: 1, pc1: 2 };
  const attackedTurns = applyRaptorAttack(pendingTurns, "player", 2);

  assert.deepEqual(plain(attackedTurns), { player: 2, pc1: 2 });

  const reflected = resolveIncomingAttackLoad({
    owner: "player",
    pendingTurns: attackedTurns,
    attackReturn: { target: "player", returnTo: "pc1" }
  }, 2);

  assert.equal(reflected.attackLoad, 4);
  assert.equal(reflected.returnTo, "pc1");
  assert.deepEqual(plain(reflected.pendingTurns), { player: 1, pc1: 2 });
  assert.equal(reflected.attackReturn, null);
});

test("set-pair reward type follows the selected species or the non-feral pair card", () => {
  const { determineSetPairRewardType } = loadRulesModule();
  const feral = card("feral");
  const rewardTypes = ["miniRaptor", "stegoSnack", "brontoBuik", "triceraTuk", "pteroPret"];

  rewardTypes.forEach((type) => {
    const selected = card(type);
    assert.equal(determineSetPairRewardType([selected, card(type, `${type}-2`)], selected), type);
  });
  assert.equal(determineSetPairRewardType([feral, card("pteroPret")], feral), "pteroPret");
  assert.equal(determineSetPairRewardType([feral, card("feral", "f2")], feral), "feral");
});

test("vijf soorten gebruikt vijf namen of maximaal één Wilde Dino", () => {
  const { selectFiveSpeciesCombo } = loadRulesModule();
  const exact = [card("miniRaptor"), card("stegoSnack"), card("brontoBuik"), card("triceraTuk"), card("pteroPret")];
  assert.equal(selectFiveSpeciesCombo(exact).length, 5);
  assert.equal(selectFiveSpeciesCombo([...exact.slice(0, 4), card("feral")]).length, 5);
  assert.equal(selectFiveSpeciesCombo([...exact.slice(0, 3), card("feral")]).length, 0);
});

test("Brul Terug chains block on odd counts and resolve on even counts", () => {
  const { isNopeChainBlocked } = loadRulesModule();

  assert.equal(isNopeChainBlocked(0), false);
  assert.equal(isNopeChainBlocked(1), true);
  assert.equal(isNopeChainBlocked(2), false);
  assert.equal(isNopeChainBlocked(3), true);
});

test("Brul Terug-reactietabel sluit gevaren, bescherming en soortcombinaties uit", () => {
  const { canReactWithNope, NOPE_REACTABLE_TYPES } = loadRulesModule();
  const expected = ["raptor", "targetedRaptor", "sprint", "trike", "oracle", "volcano", "dig", "fossil"];

  assert.deepEqual(Array.from(NOPE_REACTABLE_TYPES), expected);
  expected.forEach((type) => assert.equal(canReactWithNope(type), true, type));
  ["meteor", "shelter", "nope", "feral", "miniRaptor", "stegoSnack", "brontoBuik", "triceraTuk", "pteroPret"]
    .forEach((type) => assert.equal(canReactWithNope(type), false, type));
});
