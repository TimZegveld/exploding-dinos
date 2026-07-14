const assert = require("node:assert/strict");
const test = require("node:test");
const { createBrowserHarness } = require("./browser-harness");

function loadStateModule() {
  const harness = createBrowserHarness();
  harness.runBrowserScript("src/state.js");
  return harness.sandbox.ExplodingDinosState;
}

test("initial state starts without an active interaction", () => {
  const stateApi = loadStateModule();
  const state = stateApi.createInitialState();

  assert.deepEqual(Array.from(stateApi.getActiveInteractions(state)), []);
  assert.equal(stateApi.assertValidInteractionState(state), true);
});

test("interaction invariant rejects simultaneous workflows", () => {
  const stateApi = loadStateModule();
  const state = stateApi.createInitialState();
  state.pendingDraw = { owner: "player" };
  state.pendingOracle = { owner: "player" };

  assert.throws(() => stateApi.assertValidInteractionState(state), /pendingDraw, pendingOracle/);
});

test("clearing interactions leaves unrelated game state intact", () => {
  const stateApi = loadStateModule();
  const state = stateApi.createInitialState();
  state.deck.push({ id: "card-1" });
  state.pendingNopeReaction = { actor: "pc1" };

  stateApi.clearInteractions(state);

  assert.equal(stateApi.getActiveInteraction(state), null);
  assert.equal(state.deck.length, 1);
});
