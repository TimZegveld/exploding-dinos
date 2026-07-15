const assert = require("node:assert/strict");
const test = require("node:test");
const { applyAction, publicGame, startGame: startRandomGame } = require("../server/game-engine");

const players = [
  { id: "player-a", name: "A" },
  { id: "player-b", name: "B" }
];

function startGame(gamePlayers) {
  return startRandomGame(gamePlayers, 0);
}

function playCard(game, playerId, cardId) {
  applyAction(game, playerId, { type: "PLAY_CARD", cardId });
  assert.equal(game.pending.type, "PLAY_REVEAL");
  applyAction(game, playerId, { type: "CONFIRM_PLAY" });
  while (game.pending?.type === "ACTION_REACTION") {
    applyAction(game, game.pending.playerId, { type: "REACTION_PASS" });
  }
}

test("online spel deelt acht kaarten en houdt handen geheim", () => {
  const game = startGame(players);
  const viewA = publicGame(game, "player-a");
  const viewB = publicGame(game, "player-b");

  assert.equal(viewA.hand.length, 8);
  assert.equal(viewB.hand.length, 8);
  assert.equal(viewA.players[1].cardCount, 8);
  assert.equal("hands" in viewA, false);
  assert.notDeepEqual(viewA.hand.map((card) => card.id), viewB.hand.map((card) => card.id));
});

test("online spel kan met iedere aangesloten speler beginnen", () => {
  const game = startRandomGame(players, 0.999);

  assert.equal(game.currentPlayerId, "player-b");
  assert.match(game.log.at(-1), /B is aan de beurt/);
});

test("trekken voegt een kaart toe en geeft de beurt door", () => {
  const game = startGame(players);
  game.deck = [{ id: "safe", type: "trike", name: "Triceratops Blik", kind: "action" }];

  applyAction(game, "player-a", { type: "DRAW_CARD" });

  assert.equal(game.hands["player-a"].at(-1).id, "safe");
  assert.equal(publicGame(game, "player-a").pending.cards[0].id, "safe");
  assert.equal(publicGame(game, "player-b").pending.pendingType, "DRAW_REVEAL");
  assert.equal(game.currentPlayerId, "player-a");
  applyAction(game, "player-a", { type: "CONFIRM_DRAW" });
  assert.equal(game.currentPlayerId, "player-b");
});

test("een speler kan alleen aangesloten kaarten uit eigen hand spelen", () => {
  const game = startGame(players);
  game.hands["player-a"] = [
    { id: "sprint", type: "sprint", name: "Dino Sprint" },
    { id: "nope", type: "nope", name: "Brul Terug" }
  ];

  assert.throws(() => applyAction(game, "player-a", { type: "PLAY_CARD", cardId: "nope" }), /nog niet beschikbaar/);
  playCard(game, "player-a", "sprint");

  assert.equal(game.discard.at(-1).id, "sprint");
  assert.equal(game.currentPlayerId, "player-b");
});

test("de server weigert een actie buiten de beurt", () => {
  const game = startGame(players);
  assert.throws(() => applyAction(game, "player-b", { type: "DRAW_CARD" }), /niet aan de beurt/);
});

test("Meteorietinslag schakelt uit zonder Schuilgrot", () => {
  const game = startGame(players);
  game.hands["player-a"] = [];
  game.deck = [{ id: "meteor", type: "meteor", name: "Meteorietinslag" }];

  applyAction(game, "player-a", { type: "DRAW_CARD" });

  assert.equal(game.eliminated["player-a"], true);
  assert.equal(game.pending.type, "METEOR_REVEAL");
  assert.equal(publicGame(game, "player-b").pending.cards[0].type, "meteor");
  assert.equal(publicGame(game, "player-b").pending.isActor, false);
  applyAction(game, "player-a", { type: "CONFIRM_METEOR" });
  assert.equal(game.winnerId, "player-b");
});

test("Meteorietinslag met Schuilgrot wacht op een geheime terugplaatsing", () => {
  const game = startGame(players);
  game.hands["player-a"] = [{ id: "shelter", type: "shelter", name: "Schuilgrot" }];
  game.deck = [
    { id: "safe", type: "trike", name: "Triceratops Blik" },
    { id: "meteor", type: "meteor", name: "Meteorietinslag" }
  ];

  applyAction(game, "player-a", { type: "DRAW_CARD" });
  assert.equal(game.pending.type, "METEOR_REVEAL");
  assert.equal(publicGame(game, "player-b").pending.cards[0].type, "meteor");
  applyAction(game, "player-a", { type: "CONFIRM_METEOR" });
  assert.equal(game.pending.type, "METEOR_REVEAL");
  assert.equal(game.pending.phase, "shelter");
  assert.equal(publicGame(game, "player-b").pending.cards[0].type, "shelter");
  assert.equal(publicGame(game, "player-b").pending.isActor, false);
  applyAction(game, "player-a", { type: "CONFIRM_METEOR" });
  assert.equal(game.pending.type, "METEOR_PLACEMENT");
  assert.equal(publicGame(game, "player-b").pending.type, "WAITING");
  assert.equal(publicGame(game, "player-a").pending.deckSize, 1);

  applyAction(game, "player-a", { type: "PLACE_METEOR", positionFromTop: 1 });
  assert.equal(game.deck.at(-1).type, "meteor");
  assert.equal(game.currentPlayerId, "player-b");
});

test("Triceratops Blik toont de bovenste kaarten alleen aan de speler", () => {
  const game = startGame(players);
  game.hands["player-a"] = [{ id: "trike", type: "trike", name: "Triceratops Blik" }];
  game.deck = [
    { id: "one", type: "sprint", name: "Een" },
    { id: "two", type: "sprint", name: "Twee" },
    { id: "three", type: "sprint", name: "Drie" }
  ];

  applyAction(game, "player-a", { type: "PLAY_CARD", cardId: "trike" });
  assert.equal(publicGame(game, "player-b").pending.cards[0].id, "trike");
  assert.equal(publicGame(game, "player-b").pending.isActor, false);
  applyAction(game, "player-a", { type: "CONFIRM_PLAY" });

  assert.equal(game.pending.type, "ACTION_REACTION");
  assert.equal("cards" in publicGame(game, "player-a").pending, false);
  applyAction(game, "player-b", { type: "REACTION_PASS" });

  assert.deepEqual(publicGame(game, "player-a").pending.cards.map((card) => card.id), ["three", "two", "one"]);
  assert.equal(publicGame(game, "player-b").pending.cards, undefined);
  applyAction(game, "player-a", { type: "CONFIRM_PEEK" });
  assert.equal(game.pending, null);
  assert.equal(game.currentPlayerId, "player-a");
});

test("Diep Graven laat onderop kiezen en eindigt daarna de beurt", () => {
  const game = startGame(players);
  game.hands["player-a"] = [{ id: "dig", type: "dig", name: "Diep Graven" }];
  game.deck = [
    { id: "bottom", type: "sprint", name: "Onderste" },
    { id: "top", type: "sprint", name: "Bovenste" }
  ];

  playCard(game, "player-a", "dig");
  assert.equal(publicGame(game, "player-a").pending.cards[0].id, "bottom");
  applyAction(game, "player-a", { type: "DIG_CHOICE", choice: "bottom" });

  assert.equal(game.hands["player-a"].at(-1).id, "bottom");
  assert.equal(game.pending.type, "DRAW_REVEAL");
  applyAction(game, "player-a", { type: "CONFIRM_DRAW" });
  assert.equal(game.currentPlayerId, "player-b");
});

test("Tijdlijn Kneden bewaart de gekozen geheime volgorde", () => {
  const game = startGame(players);
  game.hands["player-a"] = [{ id: "oracle", type: "oracle", name: "Tijdlijn Kneden" }];
  game.deck = [
    { id: "one", type: "sprint", name: "Een" },
    { id: "two", type: "sprint", name: "Twee" },
    { id: "three", type: "sprint", name: "Drie" }
  ];

  playCard(game, "player-a", "oracle");
  applyAction(game, "player-a", { type: "ORDER_ORACLE", cardIds: ["one", "three", "two"] });

  assert.deepEqual(game.deck.slice(-3).reverse().map((card) => card.id), ["one", "three", "two"]);
  assert.equal(game.currentPlayerId, "player-a");
});

test("Ptero Pret-paar legt gekozen kaart bovenop en de andere onderop", () => {
  const game = startGame(players);
  game.hands["player-a"] = [
    { id: "ptero", type: "pteroPret", name: "Ptero Pret" },
    { id: "wild", type: "feral", name: "Wilde Dino" }
  ];
  game.deck = [
    { id: "old-bottom", type: "sprint", name: "Oud onder" },
    { id: "choice-bottom", type: "trike", name: "Keuze onder" },
    { id: "choice-top", type: "volcano", name: "Keuze boven" }
  ];

  assert.deepEqual(publicGame(game, "player-a").playableCardIds, ["ptero"]);
  playCard(game, "player-a", "ptero");
  assert.equal(game.pending.type, "PTERO_CHOICE");
  assert.equal(publicGame(game, "player-b").pending.type, "WAITING");

  applyAction(game, "player-a", { type: "PTERO_CHOICE", topCardId: "choice-bottom" });
  assert.equal(game.deck.at(-1).id, "choice-bottom");
  assert.equal(game.deck[0].id, "choice-top");
  assert.equal(game.hands["player-a"].length, 0);
  assert.equal(game.currentPlayerId, "player-b");
  assert.equal(game.forcedDrawsRemaining, 0);
});

test("Raptor Aanval geeft de volgende speler twee volledige beurten", () => {
  const game = startGame(players);
  game.hands["player-a"] = [{ id: "raptor", type: "raptor", name: "Raptor Aanval" }];
  game.deck = [
    { id: "draw-2", type: "sprint", name: "Twee" },
    { id: "draw-1", type: "trike", name: "Een" }
  ];

  playCard(game, "player-a", "raptor");
  assert.equal(game.pending.type, "ATTACK_REACTION");
  assert.equal(publicGame(game, "player-a").pending.type, "WAITING");
  applyAction(game, "player-b", { type: "ATTACK_PASS" });
  assert.equal(game.forcedDrawsRemaining, 2);

  applyAction(game, "player-b", { type: "DRAW_CARD" });
  applyAction(game, "player-b", { type: "CONFIRM_DRAW" });
  assert.equal(game.currentPlayerId, "player-b");
  assert.equal(game.forcedDrawsRemaining, 1);
  applyAction(game, "player-b", { type: "DRAW_CARD" });
  applyAction(game, "player-b", { type: "CONFIRM_DRAW" });
  assert.equal(game.currentPlayerId, "player-a");
});

test("aanvalslasten 2, 4 en 6 laten acties toe en verbruiken één last per afgesloten beurt", () => {
  for (const load of [2, 4, 6]) {
    const game = startGame(players);
    game.currentPlayerId = "player-b";
    game.forcedDrawsRemaining = load;
    game.hands["player-b"] = [{ id: `trike-${load}`, type: "trike", name: "Triceratops Blik" }];
    game.deck = [
      { id: `draw-${load}`, type: "sprint", name: "Veilige kaart" },
      { id: `peek-${load}`, type: "volcano", name: "Bovenste kaart" }
    ];

    playCard(game, "player-b", `trike-${load}`);
    assert.equal(game.pending.type, "PEEK");
    applyAction(game, "player-b", { type: "CONFIRM_PEEK" });
    assert.equal(game.forcedDrawsRemaining, load);
    applyAction(game, "player-b", { type: "DRAW_CARD" });
    applyAction(game, "player-b", { type: "CONFIRM_DRAW" });
    assert.equal(game.forcedDrawsRemaining, load - 1);
    assert.equal(game.currentPlayerId, "player-b");
  }
});

test("Dino Sprint handelt bij lasten 2, 4 en 6 exact één volledige beurt af", () => {
  for (const load of [2, 4, 6]) {
    const game = startGame(players);
    game.currentPlayerId = "player-b";
    game.forcedDrawsRemaining = load;
    game.hands["player-b"] = [
      { id: `sprint-${load}-1`, type: "sprint", name: "Dino Sprint" },
      { id: `sprint-${load}-2`, type: "sprint", name: "Dino Sprint" }
    ];

    playCard(game, "player-b", `sprint-${load}-1`);
    assert.equal(game.forcedDrawsRemaining, load - 1);
    assert.equal(game.currentPlayerId, "player-b");
    playCard(game, "player-b", `sprint-${load}-2`);
    assert.equal(game.forcedDrawsRemaining, load - 2);
    assert.equal(game.currentPlayerId, load === 2 ? "player-a" : "player-b");
  }
});

test("Gerichte Raptorjacht vraagt de aanvaller om een geldig doelwit", () => {
  const game = startGame(players);
  game.hands["player-a"] = [{ id: "targeted", type: "targetedRaptor", name: "Gerichte Raptorjacht" }];

  playCard(game, "player-a", "targeted");
  const pending = publicGame(game, "player-a").pending;
  assert.equal(pending.type, "TARGET_CHOICE");
  assert.deepEqual(pending.targets.map((target) => target.id), ["player-b"]);
  applyAction(game, "player-a", { type: "CHOOSE_TARGET", targetId: "player-b" });
  assert.equal(game.pending.type, "ATTACK_REACTION");
});

test("aangevallen speler schuift de volledige aanval door met extra belasting", () => {
  const game = startGame(players);
  game.hands["player-a"] = [{ id: "attack-a", type: "raptor", name: "Raptor Aanval" }];
  game.hands["player-b"] = [{ id: "attack-b", type: "raptor", name: "Raptor Aanval" }];

  playCard(game, "player-a", "attack-a");
  applyAction(game, "player-b", { type: "ATTACK_REFLECT", cardId: "attack-b" });

  assert.equal(game.pending.playerId, "player-a");
  assert.equal(game.pending.attackLoad, 4);
});

test("oneven Brul Terug-keten blokkeert en even keten laat de actie doorgaan", () => {
  const blocked = startGame(players);
  blocked.hands["player-a"] = [{ id: "attack", type: "raptor", name: "Raptor Aanval" }];
  blocked.hands["player-b"] = [{ id: "nope-b", type: "nope", name: "Brul Terug" }];
  applyAction(blocked, "player-a", { type: "PLAY_CARD", cardId: "attack" });
  applyAction(blocked, "player-a", { type: "CONFIRM_PLAY" });
  applyAction(blocked, "player-b", { type: "REACTION_NOPE", cardId: "nope-b" });
  applyAction(blocked, "player-a", { type: "REACTION_PASS" });
  assert.equal(blocked.pending, null);
  assert.equal(blocked.forcedDrawsRemaining, 0);

  const accepted = startGame(players);
  accepted.hands["player-a"] = [
    { id: "attack", type: "raptor", name: "Raptor Aanval" },
    { id: "nope-a", type: "nope", name: "Brul Terug" }
  ];
  accepted.hands["player-b"] = [{ id: "nope-b", type: "nope", name: "Brul Terug" }];
  applyAction(accepted, "player-a", { type: "PLAY_CARD", cardId: "attack" });
  applyAction(accepted, "player-a", { type: "CONFIRM_PLAY" });
  applyAction(accepted, "player-b", { type: "REACTION_NOPE", cardId: "nope-b" });
  applyAction(accepted, "player-a", { type: "REACTION_NOPE", cardId: "nope-a" });
  applyAction(accepted, "player-b", { type: "REACTION_PASS" });
  applyAction(accepted, "player-b", { type: "ATTACK_PASS" });
  assert.equal(accepted.forcedDrawsRemaining, 2);
  assert.equal(accepted.currentPlayerId, "player-b");
});

test("multiplayer handelt ketens van nul tot vier Brul Terug-kaarten exact eenmaal af", () => {
  for (let nopeCount = 0; nopeCount <= 4; nopeCount += 1) {
    const game = startGame(players);
    game.deck = [{ id: `top-${nopeCount}`, type: "sprint", name: "Bovenste" }];
    game.hands["player-a"] = [
      { id: `trike-${nopeCount}`, type: "trike", name: "Triceratops Blik" },
      ...Array.from({ length: 2 }, (_, index) => ({ id: `nope-a-${nopeCount}-${index}`, type: "nope", name: "Brul Terug" }))
    ];
    game.hands["player-b"] = Array.from({ length: 2 }, (_, index) => ({ id: `nope-b-${nopeCount}-${index}`, type: "nope", name: "Brul Terug" }));

    applyAction(game, "player-a", { type: "PLAY_CARD", cardId: `trike-${nopeCount}` });
    applyAction(game, "player-a", { type: "CONFIRM_PLAY" });
    for (let index = 0; index < nopeCount; index += 1) {
      const reactor = game.pending.playerId;
      const nope = game.hands[reactor].find((card) => card.type === "nope");
      applyAction(game, reactor, { type: "REACTION_NOPE", cardId: nope.id });
    }
    applyAction(game, game.pending.playerId, { type: "REACTION_PASS" });

    assert.equal(game.pending?.type ?? null, nopeCount % 2 === 0 ? "PEEK" : null, `keten ${nopeCount}`);
    assert.equal(game.discard.filter((card) => card.type === "trike").length, 1, `actie ${nopeCount}`);
  }
});

test("ontploffen tijdens verplichte trekkingen beëindigt de aanval veilig", () => {
  const game = startGame(players);
  game.currentPlayerId = "player-b";
  game.forcedDrawsRemaining = 3;
  game.hands["player-b"] = [];
  game.deck = [{ id: "meteor", type: "meteor", name: "Meteorietinslag" }];

  applyAction(game, "player-b", { type: "DRAW_CARD" });

  assert.equal(game.eliminated["player-b"], true);
  applyAction(game, "player-b", { type: "CONFIRM_METEOR" });
  assert.equal(game.forcedDrawsRemaining, 0);
  assert.equal(game.winnerId, "player-a");
});

test("Fossielgraaier laat een gesloten kaart bij een gekozen speler stelen", () => {
  const game = startGame(players);
  game.hands["player-a"] = [{ id: "fossil", type: "fossil", name: "Fossielgraaier" }];
  game.hands["player-b"] = [
    { id: "secret-1", type: "sprint", name: "Geheim een" },
    { id: "secret-2", type: "trike", name: "Geheim twee" }
  ];

  playCard(game, "player-a", "fossil");
  applyAction(game, "player-a", { type: "CHOOSE_FOSSIL_TARGET", targetId: "player-b" });
  const view = publicGame(game, "player-a").pending;
  assert.equal(view.cardCount, 2);
  assert.equal("cards" in view, false);
  applyAction(game, "player-a", { type: "CHOOSE_FOSSIL_CARD", cardIndex: 1 });

  assert.equal(game.hands["player-a"].at(-1).id, "secret-2");
  assert.deepEqual(game.hands["player-b"].map((card) => card.id), ["secret-1"]);
  assert.equal(publicGame(game, "player-a").pending.cards[0].id, "secret-2");
  assert.equal(publicGame(game, "player-b").pending.type, "WAITING");
  applyAction(game, "player-a", { type: "CONFIRM_STEAL" });
  assert.equal(game.pending, null);
});

test("Mini-Raptor gebruikt Wilde Dino als partner en steelt willekeurig", () => {
  const game = startGame(players);
  game.hands["player-a"] = [
    { id: "mini", type: "miniRaptor", name: "Mini-Raptor" },
    { id: "wild", type: "feral", name: "Wilde Dino" }
  ];
  game.hands["player-b"] = [{ id: "secret", type: "sprint", name: "Geheim" }];

  playCard(game, "player-a", "mini");
  applyAction(game, "player-a", { type: "CHOOSE_MINI_TARGET", targetId: "player-b" });

  assert.equal(game.hands["player-a"].at(-1).id, "secret");
  assert.equal(game.hands["player-b"].length, 0);
  assert.equal(game.discard.some((card) => card.id === "wild"), true);
  assert.equal(publicGame(game, "player-a").pending.cards[0].id, "secret");
  applyAction(game, "player-a", { type: "CONFIRM_STEAL" });
  assert.equal(game.pending, null);
});

test("Stego Snack neemt een oudere niet-meteor kaart terug", () => {
  const game = startGame(players);
  game.hands["player-a"] = [
    { id: "stego-1", type: "stegoSnack", name: "Stego Snack" },
    { id: "stego-2", type: "stegoSnack", name: "Stego Snack" }
  ];
  game.discard = [
    { id: "old", type: "sprint", name: "Dino Sprint" },
    { id: "meteor", type: "meteor", name: "Meteorietinslag" }
  ];

  playCard(game, "player-a", "stego-1");
  assert.deepEqual(publicGame(game, "player-a").pending.cards.map((card) => card.id), ["old"]);
  applyAction(game, "player-a", { type: "CHOOSE_DISCARD", cardId: "old" });
  assert.equal(game.hands["player-a"].at(-1).id, "old");
});

test("Bronto Buik kan de bovenste kaart onderop schuiven", () => {
  const game = startGame(players);
  game.hands["player-a"] = [
    { id: "bronto-1", type: "brontoBuik", name: "Bronto Buik" },
    { id: "bronto-2", type: "brontoBuik", name: "Bronto Buik" }
  ];
  game.deck = [
    { id: "bottom", type: "sprint", name: "Onder" },
    { id: "top", type: "trike", name: "Boven" }
  ];

  playCard(game, "player-a", "bronto-1");
  assert.equal(publicGame(game, "player-b").pending.type, "WAITING");
  applyAction(game, "player-a", { type: "BRONTO_CHOICE", choice: "bottom" });
  assert.equal(game.deck[0].id, "top");
});

test("Tricera-Tuk werkt een verplichte trekking weg", () => {
  const game = startGame(players);
  game.currentPlayerId = "player-a";
  game.forcedDrawsRemaining = 3;
  game.hands["player-a"] = [
    { id: "tuk-1", type: "triceraTuk", name: "Tricera-Tuk" },
    { id: "tuk-2", type: "triceraTuk", name: "Tricera-Tuk" }
  ];

  playCard(game, "player-a", "tuk-1");

  assert.equal(game.forcedDrawsRemaining, 2);
  assert.equal(game.currentPlayerId, "player-a");
});

test("een online potje kan door trekken volledig tot een winnaar worden uitgespeeld", () => {
  const game = startGame(players);
  let actions = 0;

  while (!game.winnerId && actions < 500) {
    if (game.pending?.type === "DRAW_REVEAL") {
      applyAction(game, game.pending.playerId, { type: "CONFIRM_DRAW" });
    } else if (game.pending?.type === "METEOR_REVEAL") {
      applyAction(game, game.pending.playerId, { type: "CONFIRM_METEOR" });
    } else if (game.pending?.type === "METEOR_PLACEMENT") {
      applyAction(game, game.pending.playerId, { type: "PLACE_METEOR", positionFromTop: game.deck.length + 1 });
    } else {
      applyAction(game, game.currentPlayerId, { type: "DRAW_CARD" });
    }
    actions += 1;
  }

  assert.ok(game.winnerId);
  assert.ok(actions < 500);
  assert.equal(Object.values(game.eliminated).filter(Boolean).length, 1);
});
