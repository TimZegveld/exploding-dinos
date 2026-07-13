const assert = require("node:assert/strict");
const test = require("node:test");
const { createBrowserHarness } = require("./browser-harness");

function loadGame() {
  const harness = createBrowserHarness();
  harness.runBrowserScript("src/cards.js");
  harness.runBrowserScript("src/players.js");
  harness.runBrowserScript("game.js");
  return harness;
}

test("page opens with the opponent selection modal", () => {
  const { getSelector } = loadGame();

  assert.equal(getSelector("#startModal").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#opponentRoster").children.length, 9);
  assert.match(getSelector("#actionText").textContent, /Kies je tegenspelers/);
  assert.equal(getSelector("#drawButton").disabled, true);
});

test("npc colors are unique and stable in games", () => {
  const { sandbox } = loadGame();
  const { opponentPersonas, createPlayers } = sandbox.ExplodingDinosPlayers;
  const colors = opponentPersonas.map((persona) => persona.color);

  assert.equal(new Set(colors).size, opponentPersonas.length);

  const selectedIds = ["tara", "rex", "mira", "otto"];
  const players = createPlayers(selectedIds).filter((player) => !player.isHuman);

  players.forEach((player) => {
    const persona = opponentPersonas.find((item) => item.personaId === player.personaId);
    assert.equal(player.color, persona.color);
  });
});

test("starting from the modal renders the initial table", () => {
  const { getSelector } = loadGame();

  getSelector("#startGameButton").click();

  assert.equal(getSelector("#startModal").classList.contains("is-hidden"), true);
  assert.equal(getSelector("#turnStatus").textContent, "Jouw beurt");
  assert.equal(getSelector("#playerHand").children.length, 8);
  assert.equal(getSelector("#opponents").children.length, 1);
  assert.equal(getSelector("#opponents").children[0].children[0].children[0].children[1].children[1].dataset.mobileText, "8 kaarten");
  assert.equal(getSelector("#discardTop").textContent, "");
  assert.equal(getSelector("#discardTop").className, "discard__empty");
  assert.equal(getSelector("#discardTop").attributes["aria-label"], "Aflegstapel is leeg");
  assert.match(getSelector("#actionText").textContent, /Speel actiekaarten/);
  assert.ok(Number(getSelector("#deckCount").textContent) > 0);
});

test("mobile hand toggle collapses and opens the player hand", () => {
  const { getSelector } = loadGame();

  getSelector("#startGameButton").click();

  assert.equal(getSelector(".player-zone").classList.contains("is-hand-collapsed"), true);
  assert.match(getSelector("#handToggle").textContent, /Open hand \(8\)/);
  assert.equal(getSelector("#handToggle").attributes["aria-expanded"], "false");

  getSelector("#handToggle").click();

  assert.equal(getSelector(".player-zone").classList.contains("is-hand-collapsed"), false);
  assert.match(getSelector("#handToggle").textContent, /Sluit hand \(8\)/);
  assert.equal(getSelector("#handToggle").attributes["aria-expanded"], "true");
});

test("player hand sorts by card type with stable random order inside a type", () => {
  const { getSelector, sandbox } = loadGame();

  getSelector("#startGameButton").click();

  const hand = sandbox.getHand("player");
  const lateRaptor = sandbox.ExplodingDinosCards.makeCard("raptor", true);
  const earlyRaptor = sandbox.ExplodingDinosCards.makeCard("raptor", true);
  const shelter = sandbox.ExplodingDinosCards.makeCard("shelter", true);
  lateRaptor.handSortKey = 0.9;
  earlyRaptor.handSortKey = 0.1;
  shelter.handSortKey = 0.5;

  hand.splice(0, hand.length, lateRaptor, shelter, earlyRaptor);

  const sortedIds = sandbox.getSortedHand("player").map((card) => card.id);
  assert.equal(sortedIds[0], shelter.id);
  assert.equal(sortedIds[1], earlyRaptor.id);
  assert.equal(sortedIds[2], lateRaptor.id);
});

test("only set cards render the pair icon in the card header", () => {
  const { getSelector, sandbox } = loadGame();
  const actionCardHost = getSelector("#actionCardHost");
  const setCardHost = getSelector("#setCardHost");

  sandbox.renderCardFace(actionCardHost, sandbox.ExplodingDinosCards.makeCard("raptor", true));
  sandbox.renderCardFace(setCardHost, sandbox.ExplodingDinosCards.makeCard("miniRaptor", true));

  const actionHeader = actionCardHost.children[0];
  const setHeader = setCardHost.children[0];
  const setIcon = setHeader.children[1];

  assert.equal(actionHeader.children.length, 1);
  assert.equal(actionHeader.classList.contains("card-face__header--no-icon"), true);
  assert.equal(setHeader.children.length, 2);
  assert.equal(setIcon.className, "card-face__icon card-face__icon--set-pair");
  assert.equal(setIcon.children[0].src, "assets/cards/icons/set-pair.svg");
});

test("mobile menu opens logbook and navigates to the catalog", () => {
  const { getSelector, sandbox } = loadGame();
  const expectedCount = Object.keys(sandbox.ExplodingDinosCards.cardCatalog).length;

  getSelector("#startGameButton").click();
  getSelector("#mobileMenuButton").click();

  assert.equal(getSelector("#mobileMenu").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#mobileMenuButton").attributes["aria-expanded"], "true");

  getSelector("#mobileLogButton").click();

  assert.equal(getSelector("#mobileLogPanel").classList.contains("is-hidden"), false);
  assert.ok(getSelector("#mobileGameLog").children.length > 0);

  getSelector("#mobileCatalogPageButton").click();

  assert.equal(getSelector("#mobileMenu").classList.contains("is-hidden"), true);
  assert.equal(getSelector("#catalogPage").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#catalogGrid").children.length, expectedCount);
});

test("attack reaction choices put playable cards above disabled cards", () => {
  const { getSelector, sandbox } = loadGame();

  getSelector("#startGameButton").click();

  const hand = sandbox.getHand("player");
  hand.splice(
    0,
    hand.length,
    sandbox.ExplodingDinosCards.makeCard("shelter", true),
    sandbox.ExplodingDinosCards.makeCard("nope", true)
  );

  const revealCard = getSelector("#revealCard");
  revealCard.replaceChildren();
  sandbox.renderAttackReactionChoices({});

  assert.equal(revealCard.children.length, 3);
  assert.equal(revealCard.children[0].disabled, false);
  assert.equal(revealCard.children[1].className, "reaction-divider");
  assert.equal(revealCard.children[1].textContent, "Niet speelbaar");
  assert.equal(revealCard.children[2].disabled, true);
});

test("nope reactions expose the original target for reveal context", () => {
  const { sandbox } = loadGame();

  const firstNopeContext = sandbox.getNopeRevealContext({
    actor: "pc1",
    reactor: "player",
    card: sandbox.ExplodingDinosCards.makeCard("raptor", true),
    context: { target: "player" },
    nopeCount: 0
  });
  assert.equal(firstNopeContext.owner, "pc1");
  assert.equal(firstNopeContext.target, "player");

  const chainContext = sandbox.getNopeRevealContext({
    actor: "pc1",
    reactor: "player",
    lastReactor: "pc1",
    nopeCount: 1
  });
  assert.equal(chainContext.owner, "pc1");
  assert.equal(chainContext.target, "player");
});

test("draw button opens a pending draw reveal", () => {
  const { getSelector } = loadGame();

  getSelector("#startGameButton").click();
  getSelector("#drawButton").click();

  assert.equal(getSelector("#drawReveal").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#revealEyebrow").textContent, "Jij trekt");
  assert.match(getSelector("#revealText").textContent, /kaart|Meteorietinslag|Schuilgrot/i);
});

test("catalog tab renders all unique cards", () => {
  const { getSelector, sandbox } = loadGame();
  const expectedCount = Object.keys(sandbox.ExplodingDinosCards.cardCatalog).length;

  getSelector("#showCatalogPage").click();

  assert.equal(getSelector("#catalogPage").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#catalogGrid").children.length, expectedCount);
  assert.equal(getSelector("#catalogCount").textContent, `${expectedCount} unieke kaarten`);
});
