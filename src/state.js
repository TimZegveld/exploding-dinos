(() => {
const INTERACTION_KEYS = [
  "pendingDraw",
  "pendingMeteorPlacement",
  "pendingOracle",
  "pendingDigChoice",
  "pendingFossilChoice",
  "pendingDiscardChoice",
  "pendingBrontoChoice",
  "pendingPteroChoice",
  "pendingStealTarget",
  "pendingNopeReaction",
  "pendingAttackReaction",
  "pendingRaptorTarget",
  "pendingCardDetail"
];

function createInitialState() {
  return {
    players: [],
    hands: {},
    deck: [],
    discard: [],
    current: "player",
    pendingTurns: {},
    eliminated: {},
    activity: null,
    ...Object.fromEntries(INTERACTION_KEYS.map((key) => [key, null])),
    attackReturn: null,
    gameOver: false
  };
}

function getActiveInteractions(state) {
  return INTERACTION_KEYS.filter((key) => Boolean(state[key]));
}

function getActiveInteraction(state) {
  const active = getActiveInteractions(state);
  return active.length === 1 ? { key: active[0], value: state[active[0]] } : null;
}

function clearInteractions(state) {
  INTERACTION_KEYS.forEach((key) => {
    state[key] = null;
  });
}

function assertValidInteractionState(state) {
  const active = getActiveInteractions(state);
  if (active.length > 1) {
    throw new Error(`Conflicterende interacties: ${active.join(", ")}`);
  }
  return true;
}

globalThis.ExplodingDinosState = {
  INTERACTION_KEYS,
  assertValidInteractionState,
  clearInteractions,
  createInitialState,
  getActiveInteraction,
  getActiveInteractions
};
})();
