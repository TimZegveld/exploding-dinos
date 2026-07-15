(() => {
const STARTING_RANDOM_CARD_COUNT = 4;

function calculateSetupCounts(playerCount, distribution, deckModeForPlayers) {
  const mode = deckModeForPlayers(playerCount);
  const shelterCount = mode === "compact"
    ? distribution.shelter.compact
    : mode === "standard"
      ? distribution.shelter.total - distribution.shelter.compact
      : distribution.shelter.total;

  return {
    mode,
    shelterCount,
    extraDefuses: Math.max(0, shelterCount - playerCount),
    meteors: Math.max(1, playerCount)
  };
}

function chooseStartingPlayerId(players, randomValue = Math.random()) {
  if (!players.length) return null;
  const index = Math.min(players.length - 1, Math.floor(Math.max(0, randomValue) * players.length));
  return players[index].id;
}

function resolveMeteorDraw(hand, discard, meteorCard) {
  const shelterIndex = hand.findIndex((card) => card.type === "shelter");

  if (shelterIndex === -1) {
    discard.push(meteorCard);
    return { survived: false, shelter: null };
  }

  const [shelter] = hand.splice(shelterIndex, 1);
  discard.push(shelter);
  return { survived: true, shelter };
}

function insertMeteorBack(deck, meteorCard, insertAt) {
  const safeIndex = Math.max(0, Math.min(Number(insertAt), deck.length));
  deck.splice(safeIndex, 0, meteorCard);
  return safeIndex;
}

function resolveIncomingAttackLoad({ owner, pendingTurns, attackReturn }, baseLoad) {
  if (attackReturn?.target !== owner) {
    return {
      attackLoad: baseLoad,
      returnTo: owner,
      pendingTurns,
      attackReturn
    };
  }

  return {
    attackLoad: (pendingTurns[owner] ?? 1) + baseLoad,
    returnTo: attackReturn.returnTo,
    pendingTurns: { ...pendingTurns, [owner]: 1 },
    attackReturn: null
  };
}

function applyRaptorAttack(pendingTurns, target, attackLoad) {
  return {
    ...pendingTurns,
    [target]: Math.max(1, attackLoad)
  };
}

function determineSetPairRewardType(pair, selectedCard) {
  if (selectedCard.type !== "feral") return selectedCard.type;
  return pair.find((item) => item.type !== "feral")?.type ?? "feral";
}

const SPECIES_TYPES = Object.freeze(["miniRaptor", "stegoSnack", "brontoBuik", "triceraTuk", "pteroPret"]);

function selectFiveSpeciesCombo(hand) {
  const selected = SPECIES_TYPES.map((type) => hand.find((card) => card.type === type));
  const missingIndexes = selected.map((card, index) => card ? -1 : index).filter((index) => index >= 0);
  if (missingIndexes.length === 0) return selected;
  if (missingIndexes.length === 1) {
    const feral = hand.find((card) => card.type === "feral");
    if (feral) {
      selected[missingIndexes[0]] = feral;
      return selected;
    }
  }
  return [];
}

function isNopeChainBlocked(nopeCount) {
  return (nopeCount ?? 0) % 2 === 1;
}

const NOPE_REACTABLE_TYPES = Object.freeze([
  "raptor",
  "targetedRaptor",
  "sprint",
  "trike",
  "oracle",
  "volcano",
  "dig",
  "fossil"
]);

function canReactWithNope(cardOrType) {
  const type = typeof cardOrType === "string" ? cardOrType : cardOrType?.type;
  return NOPE_REACTABLE_TYPES.includes(type);
}

function getCardTurnEffect(card) {
  if (card?.turnEffect) return card.turnEffect;
  if (card?.playable) return "continue";
  return "none";
}

function getPteroEdgeCards(deck) {
  if (deck.length < 2) return deck.slice();
  return [deck.at(-1), deck[0]];
}

function arrangePteroEdges(deck, selectedTopId) {
  const cards = getPteroEdgeCards(deck);
  const topCard = cards.find((card) => card.id === selectedTopId) ?? cards[0];
  const bottomCard = cards.find((card) => card.id !== topCard?.id);
  const movedIds = new Set(cards.map((card) => card.id));
  const middle = deck.filter((card) => !movedIds.has(card.id));
  return [...(bottomCard ? [bottomCard] : []), ...middle, ...(topCard ? [topCard] : [])];
}

const ExplodingDinosRules = {
  STARTING_RANDOM_CARD_COUNT,
  SPECIES_TYPES,
  NOPE_REACTABLE_TYPES,
  applyRaptorAttack,
  arrangePteroEdges,
  canReactWithNope,
  calculateSetupCounts,
  chooseStartingPlayerId,
  determineSetPairRewardType,
  getCardTurnEffect,
  getPteroEdgeCards,
  insertMeteorBack,
  isNopeChainBlocked,
  resolveIncomingAttackLoad,
  resolveMeteorDraw,
  selectFiveSpeciesCombo
};
globalThis.ExplodingDinosRules = ExplodingDinosRules;
if (typeof module !== "undefined" && module.exports) module.exports = ExplodingDinosRules;
})();
