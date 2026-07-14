const { buildCardPool, deckModeForPlayers, makeCard, partyPackDistribution, shuffle } = require("../src/cards");
const { calculateSetupCounts, resolveMeteorDraw } = require("../src/rules");
const { isChoiceAction } = require("../src/protocol");

const PAIR_REWARD_TYPES = new Set(["miniRaptor", "stegoSnack", "brontoBuik", "triceraTuk", "pteroPret"]);
const ONLINE_PLAYABLE_TYPES = new Set(["sprint", "trike", "volcano", "dig", "oracle", "fossil", ...PAIR_REWARD_TYPES, "raptor", "targetedRaptor"]);

function fail(message, statusCode = 409) {
  throw Object.assign(new Error(message), { statusCode });
}

function startGame(players) {
  if (players.length < 2) fail("Er zijn minimaal twee spelers nodig.");
  const playerCount = players.length;
  const hands = Object.fromEntries(players.map((player) => [player.id, [makeCard("shelter", true)]]));
  const pool = buildCardPool(playerCount);

  for (let index = 0; index < 7; index += 1) {
    players.forEach((player) => {
      const card = pool.pop();
      if (card) hands[player.id].push(card);
    });
  }

  const { mode, extraDefuses, meteors } = calculateSetupCounts(playerCount, partyPackDistribution, deckModeForPlayers);
  const deck = shuffle([
    ...pool,
    ...Array.from({ length: extraDefuses }, () => makeCard("shelter", mode === "compact")),
    ...Array.from({ length: meteors }, () => makeCard("meteor", false))
  ]);

  return {
    players: players.map(({ id, name }) => ({ id, name })),
    hands,
    deck,
    discard: [],
    currentPlayerId: players[0].id,
    forcedDrawsRemaining: 0,
    eliminated: Object.fromEntries(players.map((player) => [player.id, false])),
    pending: null,
    winnerId: null,
    log: [`Online potje gestart met ${playerCount} spelers.`, `${players[0].name} is aan de beurt.`]
  };
}

function activePlayers(game) {
  return game.players.filter((player) => !game.eliminated[player.id]);
}

function advanceTurn(game) {
  const active = activePlayers(game);
  if (active.length <= 1) {
    game.winnerId = active[0]?.id ?? null;
    game.currentPlayerId = null;
    if (active[0]) game.log.push(`${active[0].name} heeft gewonnen!`);
    return;
  }
  const order = game.players.map((player) => player.id);
  let index = order.indexOf(game.currentPlayerId);
  do index = (index + 1) % order.length; while (game.eliminated[order[index]]);
  game.currentPlayerId = order[index];
  game.log.push(`${game.players.find((player) => player.id === game.currentPlayerId).name} is aan de beurt.`);
}

function nextActivePlayerId(game, ownerId) {
  const order = game.players.map((player) => player.id);
  let index = order.indexOf(ownerId);
  do index = (index + 1) % order.length; while (game.eliminated[order[index]]);
  return order[index];
}

function finishDraw(game) {
  if (game.eliminated[game.currentPlayerId]) {
    game.forcedDrawsRemaining = 0;
    advanceTurn(game);
    return;
  }
  if (game.forcedDrawsRemaining > 1) {
    game.forcedDrawsRemaining -= 1;
    game.log.push(`${game.forcedDrawsRemaining} verplichte trekking(en) over.`);
    return;
  }
  game.forcedDrawsRemaining = 0;
  advanceTurn(game);
}

function requireTurn(game, playerId) {
  if (game.winnerId) fail("Dit potje is afgelopen.");
  if (game.currentPlayerId !== playerId) fail("Je bent niet aan de beurt.");
  if (game.eliminated[playerId]) fail("Je bent uitgeschakeld.");
  if (game.pending) fail("Rond eerst de openstaande keuze af.");
}

function resolveDrawnCard(game, playerId, card) {
  const player = game.players.find((item) => item.id === playerId);
  if (card.type === "meteor") {
    const result = resolveMeteorDraw(game.hands[playerId], game.discard, card);
    if (result.survived) {
      game.log.push(`${player.name} trok een Meteorietinslag en gebruikte een Schuilgrot.`);
      game.pending = { type: "METEOR_REVEAL", playerId, card, shelter: result.shelter, survived: true, phase: "meteor" };
      return;
    } else {
      game.eliminated[playerId] = true;
      game.log.push(`${player.name} trok een Meteorietinslag en is uitgeschakeld.`);
      game.pending = { type: "METEOR_REVEAL", playerId, card, survived: false, phase: "meteor" };
      return;
    }
  } else {
    game.hands[playerId].push(card);
    game.log.push(`${player.name} trok een kaart.`);
    game.pending = { type: "DRAW_REVEAL", playerId, card };
    return;
  }
}

function drawCard(game, playerId) {
  requireTurn(game, playerId);
  const card = game.deck.pop();
  if (!card) fail("De trekstapel is leeg.");
  resolveDrawnCard(game, playerId, card);
}

function playCard(game, playerId, cardId) {
  requireTurn(game, playerId);
  const hand = game.hands[playerId];
  const index = hand.findIndex((card) => card.id === cardId);
  if (index === -1) fail("Deze kaart zit niet in jouw hand.", 400);
  const card = hand[index];
  if (!ONLINE_PLAYABLE_TYPES.has(card.type)) {
    fail(`${card.name} is nog niet beschikbaar in de online testversie.`);
  }
  if ((card.type === "fossil" || card.type === "miniRaptor") && validStealTargets(game, playerId).length === 0) {
    fail("Er is geen tegenstander met een kaart om te stelen.");
  }
  const oldDiscardChoices = game.discard.filter((item) => item.type !== "meteor");
  let playedCards = [card];
  if (PAIR_REWARD_TYPES.has(card.type)) {
    if (card.type === "pteroPret" && game.deck.length < 2) fail("Er zijn te weinig kaarten over voor Ptero Pret.");
    const companion = hand.find((item, itemIndex) => itemIndex !== index && (item.type === card.type || item.type === "feral"));
    if (!companion) fail(`${card.name} heeft een tweede ${card.name} of Wilde Dino nodig.`);
    playedCards = [card, companion];
  }
  const playedIds = new Set(playedCards.map((item) => item.id));
  game.hands[playerId] = hand.filter((item) => !playedIds.has(item.id));
  game.discard.push(...playedCards);
  const player = game.players.find((item) => item.id === playerId);
  game.log.push(`${player.name} speelde ${card.name}.`);
  if (card.type === "sprint") {
    if (game.forcedDrawsRemaining > 1) game.forcedDrawsRemaining -= 1;
    else {
      game.forcedDrawsRemaining = 0;
      advanceTurn(game);
    }
  } else if (card.type === "trike") {
    game.pending = { type: "PEEK", playerId, title: "Triceratops Blik", cards: game.deck.slice(-3).reverse() };
  } else if (card.type === "volcano") {
    game.deck = shuffle(game.deck);
    game.pending = { type: "PEEK", playerId, title: "Nieuwe bovenste kaart", cards: game.deck.slice(-1) };
  } else if (card.type === "dig") {
    game.pending = { type: "DIG_CHOICE", playerId, cards: game.deck.slice(0, 1) };
  } else if (card.type === "oracle") {
    game.pending = { type: "ORACLE_ORDER", playerId, cards: game.deck.slice(-3).reverse() };
  } else if (card.type === "fossil") {
    game.pending = { type: "FOSSIL_TARGET", playerId };
  } else if (card.type === "pteroPret") {
    game.pending = { type: "PTERO_CHOICE", playerId, cards: game.deck.slice(-2).reverse() };
  } else if (card.type === "miniRaptor") {
    game.pending = { type: "MINI_TARGET", playerId };
  } else if (card.type === "stegoSnack") {
    if (oldDiscardChoices.length === 0) game.log.push("Er lag geen oudere kaart in de aflegstapel voor Stego Snack.");
    else game.pending = { type: "DISCARD_PICK", playerId, cards: oldDiscardChoices };
  } else if (card.type === "brontoBuik") {
    game.pending = { type: "BRONTO_CHOICE", playerId, cards: game.deck.slice(-1) };
  } else if (card.type === "triceraTuk") {
    if (game.forcedDrawsRemaining > 1) game.forcedDrawsRemaining -= 1;
    else {
      game.forcedDrawsRemaining = 0;
      advanceTurn(game);
    }
  } else if (card.type === "raptor") {
    const attackLoad = Math.max(0, game.forcedDrawsRemaining) + 2;
    game.forcedDrawsRemaining = 0;
    beginAttack(game, playerId, nextActivePlayerId(game, playerId), attackLoad);
  } else if (card.type === "targetedRaptor") {
    const attackLoad = Math.max(0, game.forcedDrawsRemaining) + 2;
    game.forcedDrawsRemaining = 0;
    game.pending = { type: "TARGET_CHOICE", playerId, attackerId: playerId, attackLoad };
  }
  game.pending = { type: "PLAY_REVEAL", playerId, card, nextPending: game.pending };
}

function beginAttack(game, attackerId, targetId, attackLoad) {
  if (attackerId === targetId || game.eliminated[targetId]) fail("Kies een geldige tegenstander.", 400);
  const attacker = game.players.find((player) => player.id === attackerId);
  const target = game.players.find((player) => player.id === targetId);
  game.pending = { type: "ATTACK_REACTION", playerId: targetId, attackerId, targetId, attackLoad };
  game.log.push(`${attacker.name} valt ${target.name} aan voor ${attackLoad} trekkingen.`);
}

function acceptAttack(game, pending) {
  game.pending = null;
  game.currentPlayerId = pending.targetId;
  game.forcedDrawsRemaining = pending.attackLoad;
  const target = game.players.find((player) => player.id === pending.targetId);
  game.log.push(`${target.name} moet ${pending.attackLoad} kaarten trekken.`);
}

function removeReactionCard(game, playerId, cardId, allowedTypes) {
  const hand = game.hands[playerId] ?? [];
  const index = hand.findIndex((card) => card.id === cardId);
  if (index === -1 || !allowedTypes.includes(hand[index].type)) fail("Deze reactiekaart is niet geldig.", 400);
  const [card] = hand.splice(index, 1);
  game.discard.push(card);
  return card;
}

function validStealTargets(game, playerId) {
  return activePlayers(game).filter((player) => player.id !== playerId && (game.hands[player.id]?.length ?? 0) > 0);
}

function transferCard(game, fromId, toId, index) {
  const hand = game.hands[fromId] ?? [];
  if (!Number.isInteger(index) || index < 0 || index >= hand.length) fail("Deze gesloten kaart bestaat niet meer.", 400);
  const [card] = hand.splice(index, 1);
  game.hands[toId].push(card);
  return card;
}

function requirePending(game, playerId, type) {
  if (!game.pending || game.pending.type !== type) fail("Deze keuze staat niet open.");
  if (game.pending.playerId !== playerId) fail("Deze geheime keuze is voor een andere speler.", 403);
  return game.pending;
}

function resolveChoice(game, playerId, action) {
  if (action.type === "CONFIRM_PLAY") {
    const pending = requirePending(game, playerId, "PLAY_REVEAL");
    game.pending = pending.nextPending;
    return;
  }
  if (action.type === "CONFIRM_DRAW") {
    requirePending(game, playerId, "DRAW_REVEAL");
    game.pending = null;
    finishDraw(game);
    return;
  }
  if (action.type === "CONFIRM_METEOR") {
    const pending = requirePending(game, playerId, "METEOR_REVEAL");
    if (pending.survived && pending.phase === "meteor") {
      game.pending = { ...pending, phase: "shelter" };
    } else if (pending.survived) {
      game.pending = { type: "METEOR_PLACEMENT", playerId, card: pending.card };
    }
    else {
      game.pending = null;
      finishDraw(game);
    }
    return;
  }
  if (action.type === "CONFIRM_PEEK") {
    requirePending(game, playerId, "PEEK");
    game.pending = null;
    return;
  }
  if (action.type === "PLACE_METEOR") {
    const pending = requirePending(game, playerId, "METEOR_PLACEMENT");
    const fromTop = Number(action.positionFromTop);
    if (!Number.isInteger(fromTop) || fromTop < 1 || fromTop > game.deck.length + 1) fail("Kies een geldige positie.", 400);
    const insertAt = game.deck.length - fromTop + 1;
    game.deck.splice(insertAt, 0, pending.card);
    game.pending = null;
    game.log.push("De Meteorietinslag is geheim teruggelegd.");
    finishDraw(game);
    return;
  }
  if (action.type === "DIG_CHOICE") {
    requirePending(game, playerId, "DIG_CHOICE");
    if (action.choice !== "bottom" && action.choice !== "top") fail("Kies bovenop of onderop.", 400);
    const card = action.choice === "bottom" ? game.deck.shift() : game.deck.pop();
    if (!card) fail("De trekstapel is leeg.");
    game.pending = null;
    resolveDrawnCard(game, playerId, card);
    return;
  }
  if (action.type === "ORDER_ORACLE") {
    const pending = requirePending(game, playerId, "ORACLE_ORDER");
    const order = Array.isArray(action.cardIds) ? action.cardIds : [];
    const expected = pending.cards.map((card) => card.id);
    if (order.length !== expected.length || new Set(order).size !== expected.length || expected.some((id) => !order.includes(id))) {
      fail("De gekozen kaartvolgorde is ongeldig.", 400);
    }
    const byId = Object.fromEntries(pending.cards.map((card) => [card.id, card]));
    game.deck.splice(Math.max(0, game.deck.length - pending.cards.length), pending.cards.length);
    game.deck.push(...order.map((id) => byId[id]).reverse());
    game.pending = null;
    game.log.push("De bovenste kaarten zijn in een geheime volgorde teruggelegd.");
    return;
  }
  if (action.type === "PTERO_CHOICE") {
    const pending = requirePending(game, playerId, "PTERO_CHOICE");
    if (!pending.cards.some((card) => card.id === action.topCardId)) fail("Kies één van de twee kaarten.", 400);
    const topCard = pending.cards.find((card) => card.id === action.topCardId);
    const bottomCard = pending.cards.find((card) => card.id !== action.topCardId);
    game.deck.splice(Math.max(0, game.deck.length - pending.cards.length), pending.cards.length);
    if (bottomCard) game.deck.unshift(bottomCard);
    if (topCard) game.deck.push(topCard);
    game.pending = null;
    game.log.push("Ptero Pret legde één kaart bovenop en één kaart onderop.");
    game.forcedDrawsRemaining = 0;
    advanceTurn(game);
    return;
  }
  if (action.type === "CHOOSE_TARGET") {
    const pending = requirePending(game, playerId, "TARGET_CHOICE");
    beginAttack(game, pending.attackerId, action.targetId, pending.attackLoad);
    return;
  }
  if (action.type === "ATTACK_PASS") {
    const pending = requirePending(game, playerId, "ATTACK_REACTION");
    acceptAttack(game, pending);
    return;
  }
  if (action.type === "ATTACK_NOPE") {
    const pending = requirePending(game, playerId, "ATTACK_REACTION");
    removeReactionCard(game, playerId, action.cardId, ["nope"]);
    const attack = { attackerId: pending.attackerId, targetId: pending.targetId, attackLoad: pending.attackLoad };
    game.pending = {
      type: "NOPE_RESPONSE",
      playerId: pending.attackerId,
      attack,
      nopeCount: 1,
      lastNopePlayerId: playerId
    };
    game.log.push(`${game.players.find((player) => player.id === playerId).name} speelde Brul Terug.`);
    return;
  }
  if (action.type === "ATTACK_REFLECT") {
    const pending = requirePending(game, playerId, "ATTACK_REACTION");
    const card = removeReactionCard(game, playerId, action.cardId, ["raptor", "targetedRaptor"]);
    const attackLoad = pending.attackLoad + 2;
    if (card.type === "targetedRaptor") {
      game.pending = { type: "TARGET_CHOICE", playerId, attackerId: playerId, attackLoad };
    } else {
      beginAttack(game, playerId, nextActivePlayerId(game, playerId), attackLoad);
    }
    game.log.push(`${game.players.find((player) => player.id === playerId).name} schoof de aanval door.`);
    return;
  }
  if (action.type === "NOPE_PLAY") {
    const pending = requirePending(game, playerId, "NOPE_RESPONSE");
    removeReactionCard(game, playerId, action.cardId, ["nope"]);
    game.pending = {
      ...pending,
      playerId: pending.lastNopePlayerId,
      lastNopePlayerId: playerId,
      nopeCount: pending.nopeCount + 1
    };
    game.log.push(`${game.players.find((player) => player.id === playerId).name} speelde Brul Terug.`);
    return;
  }
  if (action.type === "NOPE_PASS") {
    const pending = requirePending(game, playerId, "NOPE_RESPONSE");
    if (pending.nopeCount % 2 === 1) {
      game.pending = null;
      game.currentPlayerId = pending.attack.targetId;
      game.forcedDrawsRemaining = 0;
      game.log.push("De aanval is geblokkeerd door Brul Terug.");
    } else {
      acceptAttack(game, pending.attack);
    }
    return;
  }
  if (action.type === "CHOOSE_FOSSIL_TARGET") {
    requirePending(game, playerId, "FOSSIL_TARGET");
    if (!validStealTargets(game, playerId).some((target) => target.id === action.targetId)) fail("Kies een geldige speler met kaarten.", 400);
    game.pending = { type: "FOSSIL_CARD", playerId, targetId: action.targetId };
    return;
  }
  if (action.type === "CHOOSE_FOSSIL_CARD") {
    const pending = requirePending(game, playerId, "FOSSIL_CARD");
    const card = transferCard(game, pending.targetId, playerId, Number(action.cardIndex));
    game.pending = { type: "STEAL_REVEAL", playerId, card, source: "Fossielgraaier" };
    game.log.push(`${game.players.find((player) => player.id === playerId).name} stal met Fossielgraaier een kaart.`);
    return;
  }
  if (action.type === "CHOOSE_MINI_TARGET") {
    requirePending(game, playerId, "MINI_TARGET");
    const target = validStealTargets(game, playerId).find((item) => item.id === action.targetId);
    if (!target) fail("Kies een geldige speler met kaarten.", 400);
    const index = Math.floor(Math.random() * game.hands[target.id].length);
    const card = transferCard(game, target.id, playerId, index);
    game.pending = { type: "STEAL_REVEAL", playerId, card, source: "Mini-Raptor" };
    game.log.push(`${game.players.find((player) => player.id === playerId).name} stal met Mini-Raptor een willekeurige kaart.`);
    return;
  }
  if (action.type === "CONFIRM_STEAL") {
    requirePending(game, playerId, "STEAL_REVEAL");
    game.pending = null;
    return;
  }
  if (action.type === "CHOOSE_DISCARD") {
    const pending = requirePending(game, playerId, "DISCARD_PICK");
    if (!pending.cards.some((card) => card.id === action.cardId)) fail("Deze kaart kan niet worden teruggenomen.", 400);
    const index = game.discard.findIndex((card) => card.id === action.cardId);
    if (index === -1) fail("Deze kaart ligt niet meer in de aflegstapel.", 400);
    const [card] = game.discard.splice(index, 1);
    game.hands[playerId].push(card);
    game.pending = null;
    game.log.push(`${game.players.find((player) => player.id === playerId).name} nam een kaart terug met Stego Snack.`);
    return;
  }
  if (action.type === "BRONTO_CHOICE") {
    requirePending(game, playerId, "BRONTO_CHOICE");
    if (action.choice !== "top" && action.choice !== "bottom") fail("Kies bovenop of onderop.", 400);
    if (action.choice === "bottom" && game.deck.length > 0) game.deck.unshift(game.deck.pop());
    game.pending = null;
    game.log.push(action.choice === "bottom" ? "Bronto Buik schoof de bovenste kaart onderop." : "Bronto Buik liet de bovenste kaart liggen.");
    return;
  }
  fail("Onbekende geheime keuze.", 400);
}

function applyAction(game, playerId, action) {
  if (isChoiceAction(action?.type)) resolveChoice(game, playerId, action);
  else if (action?.type === "DRAW_CARD") drawCard(game, playerId);
  else if (action?.type === "PLAY_CARD") playCard(game, playerId, action.cardId);
  else fail("Onbekende spelactie.", 400);
  return game;
}

function publicPending(game, viewerId) {
  if (!game.pending) return null;
  const player = game.players.find((item) => item.id === game.pending.playerId);
  if (game.pending.type === "PLAY_REVEAL") {
    return {
      type: "PLAY_REVEAL",
      playerId: game.pending.playerId,
      playerName: player?.name ?? "Een speler",
      isActor: game.pending.playerId === viewerId,
      cards: [game.pending.card]
    };
  }
  if (game.pending.type === "METEOR_REVEAL") {
    return {
      type: "METEOR_REVEAL",
      playerId: game.pending.playerId,
      playerName: player?.name ?? "Een speler",
      isActor: game.pending.playerId === viewerId,
      phase: game.pending.phase,
      survived: game.pending.survived,
      cards: [game.pending.phase === "shelter" ? game.pending.shelter : game.pending.card].filter(Boolean)
    };
  }
  if (game.pending.playerId !== viewerId) {
    return { type: "WAITING", pendingType: game.pending.type, playerId: game.pending.playerId, playerName: player?.name ?? "Een speler" };
  }
  if (game.pending.type === "TARGET_CHOICE") {
    return {
      type: "TARGET_CHOICE",
      attackLoad: game.pending.attackLoad,
      targets: activePlayers(game).filter((target) => target.id !== game.pending.attackerId).map(({ id, name }) => ({ id, name }))
    };
  }
  if (game.pending.type === "FOSSIL_TARGET" || game.pending.type === "MINI_TARGET") {
    return {
      type: game.pending.type,
      targets: validStealTargets(game, viewerId).map(({ id, name }) => ({ id, name, cardCount: game.hands[id].length }))
    };
  }
  if (game.pending.type === "FOSSIL_CARD") {
    const target = game.players.find((item) => item.id === game.pending.targetId);
    return {
      type: "FOSSIL_CARD",
      targetName: target?.name ?? "Tegenstander",
      cardCount: game.hands[game.pending.targetId]?.length ?? 0
    };
  }
  if (game.pending.type === "STEAL_REVEAL") {
    return {
      type: "STEAL_REVEAL",
      source: game.pending.source,
      cards: [game.pending.card]
    };
  }
  if (game.pending.type === "DRAW_REVEAL") {
    return {
      type: game.pending.type,
      cards: [game.pending.card]
    };
  }
  if (game.pending.type === "ATTACK_REACTION") {
    const hand = game.hands[viewerId] ?? [];
    return {
      type: "ATTACK_REACTION",
      attackLoad: game.pending.attackLoad,
      attackerName: game.players.find((item) => item.id === game.pending.attackerId)?.name,
      nopeCardIds: hand.filter((card) => card.type === "nope").map((card) => card.id),
      attackCardIds: hand.filter((card) => card.type === "raptor" || card.type === "targetedRaptor").map((card) => card.id)
    };
  }
  if (game.pending.type === "NOPE_RESPONSE") {
    const hand = game.hands[viewerId] ?? [];
    return {
      type: "NOPE_RESPONSE",
      nopeCount: game.pending.nopeCount,
      nopeCardIds: hand.filter((card) => card.type === "nope").map((card) => card.id)
    };
  }
  return {
    type: game.pending.type,
    title: game.pending.title,
    cards: game.pending.cards ?? (game.pending.card ? [game.pending.card] : []),
    deckSize: game.deck.length
  };
}

function playableCardIds(game, viewerId) {
  if (game.currentPlayerId !== viewerId || game.pending || game.winnerId) return [];
  const hand = game.hands[viewerId] ?? [];
  return hand.filter((card, index) => {
    if (["sprint", "trike", "volcano", "dig", "oracle", "fossil", "raptor", "targetedRaptor"].includes(card.type)) return true;
    if (PAIR_REWARD_TYPES.has(card.type)) return hand.some((other, otherIndex) => otherIndex !== index && (other.type === card.type || other.type === "feral"));
    return false;
  }).map((card) => card.id);
}

function publicGame(game, viewerId) {
  return {
    currentPlayerId: game.currentPlayerId,
    forcedDrawsRemaining: game.forcedDrawsRemaining,
    winnerId: game.winnerId,
    deckCount: game.deck.length,
    discardTop: game.discard.at(-1) ?? null,
    hand: game.hands[viewerId] ?? [],
    eliminated: game.eliminated,
    pending: publicPending(game, viewerId),
    playableTypes: [...ONLINE_PLAYABLE_TYPES],
    playableCardIds: playableCardIds(game, viewerId),
    players: game.players.map((player) => ({
      ...player,
      cardCount: game.hands[player.id]?.length ?? 0
    })),
    log: game.log.slice(-16)
  };
}

module.exports = { ONLINE_PLAYABLE_TYPES, applyAction, publicGame, startGame };
