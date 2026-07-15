const test = require("node:test");
const assert = require("node:assert/strict");

const { createMultiplayerViewModel } = require("../src/ui/view-model.js");

function room(viewerId, forcedDrawsRemaining) {
  return {
    viewerId,
    game: {
      currentPlayerId: "player-a",
      forcedDrawsRemaining,
      winnerId: null,
      players: [
        { id: "player-a", name: "Alpha", cardCount: 4 },
        { id: "player-b", name: "Beta", cardCount: 5 }
      ],
      eliminated: { "player-a": false, "player-b": false },
      playableCardIds: [],
      deckCount: 20,
      discardTop: null,
      discardCount: 3,
      hand: [],
      pending: null,
      log: []
    }
  };
}

test("multiplayer benadrukt meerdere verplichte trekkingen voor de actieve speler", () => {
  const model = createMultiplayerViewModel(room("player-a", 2), ["#111", "#222"]);

  assert.equal(model.forcedDrawCount, 2);
  assert.equal(model.turnText, "Let op: trek nog 2 kaarten");
  assert.equal(model.playerHint, "2 verplichte trekkingen over");
  assert.equal(model.discardCount, 3);
});

test("multiplayer toont de verplichte trekteller niet als een andere speler trekt", () => {
  const model = createMultiplayerViewModel(room("player-b", 2), ["#111", "#222"]);

  assert.equal(model.forcedDrawCount, 0);
  assert.equal(model.turnText, "Alpha is aan de beurt");
});
