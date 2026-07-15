(() => {
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
    meteors: Math.max(1, playerCount + 1)
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

const ExplodingDinosRules = {
  NOPE_REACTABLE_TYPES,
  applyRaptorAttack,
  canReactWithNope,
  calculateSetupCounts,
  chooseStartingPlayerId,
  determineSetPairRewardType,
  getCardTurnEffect,
  insertMeteorBack,
  isNopeChainBlocked,
  resolveIncomingAttackLoad,
  resolveMeteorDraw
};
globalThis.ExplodingDinosRules = ExplodingDinosRules;
if (typeof module !== "undefined" && module.exports) module.exports = ExplodingDinosRules;
})();
