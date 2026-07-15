(() => {
function playerInitials(player) {
  return player.initials ?? player.name?.slice(0, 2).toUpperCase() ?? "?";
}

function normalizePlayer(player, options = {}) {
  const cardCount = options.cardCount ?? player.cardCount ?? 0;
  const eliminated = Boolean(options.eliminated);
  return {
    id: player.id,
    name: player.name,
    initials: playerInitials(player),
    portrait: player.portrait ?? null,
    color: player.color ?? options.color,
    subtitle: options.subtitle ?? "Online speler",
    cardCount,
    countLabel: eliminated ? "Uitgeschakeld" : `${cardCount} kaarten`,
    eliminated,
    isCurrent: Boolean(options.isCurrent)
  };
}

function createSingleplayerViewModel({ state, viewerId, colors, subtitle, canPlayCard, drawBlocked, handBlocked, viewerHand }) {
  const viewer = state.players.find((player) => player.id === viewerId);
  const current = state.players.find((player) => player.id === state.current);
  const hasGame = state.players.length > 0;
  const hand = viewerHand ?? state.hands[viewerId] ?? [];
  const nopeReaction = state.pendingNopeReaction;
  const isLocalReaction = nopeReaction?.reactor === viewerId;
  const reactionActor = state.players.find((player) => player.id === nopeReaction?.reactor);
  return {
    mode: "singleplayer",
    viewerId,
    currentPlayerId: state.current,
    currentColor: current?.color ?? viewer?.color ?? colors[0],
    turnText: state.gameOver ? "Spel afgelopen" : !hasGame ? "Kies tegenspelers" : isLocalReaction ? "Jij reageert" : nopeReaction ? `${reactionActor?.name ?? "Een speler"} reageert` : state.current === viewerId ? "Jouw beurt" : `${current?.name ?? "PC"} denkt na`,
    playerHint: state.eliminated[viewerId] ? "Uitgeschakeld" : !hasGame ? "Start een spel" : isLocalReaction ? "Speel Brul Terug of pas" : nopeReaction ? `Wacht op ${reactionActor?.name ?? "de reactor"}` : state.current === viewerId && !state.gameOver ? (state.pendingTurns[viewerId] > 1 ? `${state.pendingTurns[viewerId]} beurten resterend` : "Speel kaarten of trek om je beurt te beëindigen") : "Wacht op de pc",
    canDraw: hasGame && state.current === viewerId && !state.gameOver && !drawBlocked,
    deckCount: state.deck.length,
    discardTop: state.discard.at(-1) ?? null,
    discardCount: state.discard.length,
    hand: hand.map((card) => ({ card, playable: canPlayCard(card), disabled: state.gameOver || state.eliminated[viewerId] || handBlocked })),
    opponents: state.players.filter((player) => player.id !== viewerId).map((player) => normalizePlayer(player, {
      cardCount: state.hands[player.id]?.length ?? 0,
      eliminated: state.eliminated[player.id],
      isCurrent: state.current === player.id && !state.gameOver,
      subtitle: subtitle(player),
      color: player.color
    })),
    log: null,
    interaction: null
  };
}

function createMultiplayerViewModel(room, colors) {
  const game = room.game;
  const viewer = game.players.find((player) => player.id === room.viewerId);
  const current = game.players.find((player) => player.id === game.currentPlayerId);
  const isTurn = game.currentPlayerId === room.viewerId;
  const forcedDrawCount = isTurn ? game.forcedDrawsRemaining : 0;
  const pending = game.pending;
  const isLocalReaction = pending?.type === "ACTION_REACTION";
  const waitingForReaction = pending?.type === "WAITING" && pending.pendingType === "ACTION_REACTION";
  const turnText = game.winnerId
    ? game.winnerId === room.viewerId ? "Jij hebt gewonnen!" : `${game.players.find((player) => player.id === game.winnerId)?.name} heeft gewonnen`
    : isLocalReaction ? "Jij reageert"
    : waitingForReaction ? `${pending.playerName} reageert`
    : isTurn
      ? forcedDrawCount > 0 ? `${forcedDrawCount} ${forcedDrawCount === 1 ? "beurt" : "beurten"} resterend` : "Jouw beurt"
      : `${current?.name ?? "Een speler"} is aan de beurt`;
  const playable = new Set(game.playableCardIds ?? []);
  return {
    mode: "multiplayer",
    viewerId: room.viewerId,
    currentPlayerId: game.currentPlayerId,
    currentColor: colors[game.players.findIndex((player) => player.id === game.currentPlayerId) % colors.length] ?? colors[0],
    turnText,
    playerHint: game.eliminated[room.viewerId] ? "Uitgeschakeld" : isLocalReaction ? (pending.nopeCardIds?.length ? "Speel Brul Terug of pas" : "Je hebt geen Brul Terug; pas") : waitingForReaction ? `Wacht op ${pending.playerName}` : forcedDrawCount > 0 ? `${forcedDrawCount} ${forcedDrawCount === 1 ? "beurt" : "beurten"} resterend` : isTurn ? "Speel kaarten of trek om je beurt te beëindigen" : `Wacht op ${current?.name ?? "de actieve speler"}`,
    forcedDrawCount,
    canDraw: isTurn && !game.winnerId && !game.eliminated[room.viewerId] && !game.pending,
    deckCount: game.deckCount,
    discardTop: game.discardTop,
    discardCount: game.discardCount,
    hand: game.hand.map((card) => ({ card, playable: isTurn && !game.pending && playable.has(card.id) && !game.winnerId, disabled: Boolean(game.winnerId || game.eliminated[room.viewerId] || game.pending) })),
    opponents: game.players.filter((player) => player.id !== room.viewerId).map((player) => {
      const index = game.players.findIndex((item) => item.id === player.id);
      return normalizePlayer(player, {
        cardCount: player.cardCount,
        eliminated: game.eliminated[player.id],
        isCurrent: player.id === game.currentPlayerId && !game.winnerId,
        subtitle: "Online speler",
        color: colors[index % colors.length]
      });
    }),
    log: game.log,
    interaction: game.pending,
    viewer
  };
}

globalThis.ExplodingDinosViewModel = { createMultiplayerViewModel, createSingleplayerViewModel, normalizePlayer };
if (typeof module !== "undefined" && module.exports) module.exports = globalThis.ExplodingDinosViewModel;
})();
