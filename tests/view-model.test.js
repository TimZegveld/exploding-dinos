const test = require("node:test");
const assert = require("node:assert/strict");

const { createMultiplayerViewModel, createSingleplayerViewModel } = require("../src/ui/view-model.js");

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

test("multiplayer toont volledige resterende aanvalbeurten voor de actieve speler", () => {
  const model = createMultiplayerViewModel(room("player-a", 2), ["#111", "#222"]);

  assert.equal(model.forcedDrawCount, 2);
  assert.equal(model.playerHint, "Trek 1 kaart per beurt — nog 2 beurten");
  assert.equal(model.turnText, "Aanval: nog 2 beurten");
  assert.equal(model.discardCount, 3);
});

test("singleplayer toont de aanvalslast prominent in status en trekhint", () => {
  const state = {
    players: [{ id: "player", name: "Jij", color: "#111" }, { id: "pc", name: "Nova", color: "#222" }], current: "player",
    pendingTurns: { player: 2, pc: 1 }, pendingNopeReaction: null, gameOver: false,
    eliminated: { player: false, pc: false }, hands: { player: [], pc: [] }, deck: [], discard: []
  };
  const model = createSingleplayerViewModel({ state, viewerId: "player", colors: ["#111"], subtitle: () => "PC", canPlayCard: () => false, drawBlocked: false, handBlocked: false });
  assert.equal(model.forcedDrawCount, 2);
  assert.equal(model.turnText, "Aanval: nog 2 beurten");
  assert.equal(model.playerHint, "Trek 1 kaart per beurt — nog 2 beurten");
});

test("multiplayer toont de verplichte trekteller niet als een andere speler trekt", () => {
  const model = createMultiplayerViewModel(room("player-b", 2), ["#111", "#222"]);

  assert.equal(model.forcedDrawCount, 0);
  assert.equal(model.turnText, "Alpha is aan de beurt");
});

test("multiplayerstatus onderscheidt reageren en wachten", () => {
  const reacting = room("player-a", 0);
  reacting.game.pending = { type: "ACTION_REACTION", nopeCardIds: ["nope"] };
  let model = createMultiplayerViewModel(reacting, ["#111", "#222"]);
  assert.equal(model.turnText, "Jij reageert");
  assert.equal(model.playerHint, "Speel Brul Terug of pas");

  const waiting = room("player-a", 0);
  waiting.game.pending = { type: "WAITING", pendingType: "ACTION_REACTION", playerName: "Nova" };
  model = createMultiplayerViewModel(waiting, ["#111", "#222"]);
  assert.equal(model.turnText, "Nova reageert");
  assert.equal(model.playerHint, "Wacht op Nova");
});
