const assert = require("node:assert/strict");
const test = require("node:test");
const { ACTIONS, INTERACTIONS, isChoiceAction } = require("../src/protocol");

test("browser en server delen hetzelfde actie- en interactieprotocol", () => {
  assert.equal(isChoiceAction(ACTIONS.CONFIRM_DRAW), true);
  assert.equal(isChoiceAction(ACTIONS.DRAW_CARD), false);
  assert.equal(isChoiceAction(ACTIONS.PLAY_CARD), false);
  assert.equal(INTERACTIONS.DRAW_REVEAL, "DRAW_REVEAL");
  assert.equal(INTERACTIONS.ATTACK_REACTION, "ATTACK_REACTION");
});
