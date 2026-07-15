const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { createBrowserHarness } = require("./browser-harness");

function loadGame() {
  const harness = createBrowserHarness();
  harness.runBrowserScript("src/runtime.js");
  harness.runBrowserScript("src/state.js");
  harness.runBrowserScript("src/cards.js");
  harness.runBrowserScript("src/players.js");
  harness.runBrowserScript("src/rules.js");
  harness.runBrowserScript("src/protocol.js");
  harness.runBrowserScript("src/ui/view-model.js");
  harness.runBrowserScript("src/ui/game-view.js");
  harness.runBrowserScript("src/ui/reveal-view.js");
  harness.runBrowserScript("src/ui/choice-view.js");
  harness.runBrowserScript("game.js");
  let randomCalls = 0;
  harness.sandbox.ExplodingDinosRuntime.configure({
    random: () => randomCalls++ === 0 ? 0 : Math.random()
  });
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

test("npc personas have unique implemented play styles", () => {
  const { sandbox } = loadGame();
  const { opponentPersonas } = sandbox.ExplodingDinosPlayers;
  const styles = opponentPersonas.map((persona) => persona.playStyle);

  assert.equal(new Set(styles).size, opponentPersonas.length);
  styles.forEach((style) => {
    assert.equal(sandbox.hasPcStyleProfile(style), true);
  });
});

test("opponent selection hints at hidden npc play styles", () => {
  const html = fs.readFileSync(path.resolve(__dirname, "..", "index.html"), "utf8");

  assert.match(html, /Iedere NPC speelt merkbaar anders/);
  assert.match(html, /stijl ontdek je pas tijdens het potje/);
});

test("starting from the modal renders the initial table", () => {
  const { getSelector } = loadGame();

  getSelector("#startGameButton").click();

  assert.equal(getSelector("#startModal").classList.contains("is-hidden"), true);
  assert.equal(getSelector("#turnStatus").textContent, "Jouw beurt");
  assert.equal(getSelector("#playerHand").children.length, 8);
  assert.equal(getSelector("#opponents").children.length, 1);
  assert.equal(getSelector("#opponents").children[0].children[0].children[0].children[1].children[1].dataset.mobileText, "8 kaarten");
  assert.equal(getSelector("#opponents").children[0].children[1].children.length, 5);
  assert.equal(getSelector("#opponents").children[0].children[1].children.at(-1).textContent, "8");
  assert.equal(getSelector("#discardTop").textContent, "");
  assert.equal(getSelector("#discardTop").className, "discard__empty");
  assert.equal(getSelector("#discardTop").attributes["aria-label"], "Aflegstapel is leeg");
  assert.match(getSelector("#actionText").textContent, /Speel actiekaarten/);
  assert.ok(Number(getSelector("#deckCount").textContent) > 0);
});

test("singleplayer kan met een willekeurige tegenstander beginnen", () => {
  const { getSelector, sandbox } = loadGame();
  const scheduledTurns = [];
  sandbox.ExplodingDinosRuntime.configure({
    random: () => 0.999,
    schedule: (callback, delay) => scheduledTurns.push({ callback, delay })
  });

  getSelector("#startGameButton").click();

  assert.notEqual(getSelector("#turnStatus").textContent, "Jouw beurt");
  assert.ok(getSelector("#gameLog").children.some((item) => /begint/.test(item.textContent)));
  assert.equal(scheduledTurns.length, 1);
  assert.equal(scheduledTurns[0].callback, sandbox.pcTurn);
  assert.equal(scheduledTurns[0].delay, 650);
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

test("all card kinds render a type icon in the card header", () => {
  const { getSelector, sandbox } = loadGame();
  const actionCardHost = getSelector("#actionCardHost");
  const setCardHost = getSelector("#setCardHost");
  const dangerCardHost = getSelector("#revealCard");
  const defuseCardHost = getSelector("#discardTop");

  sandbox.renderCardFace(actionCardHost, sandbox.ExplodingDinosCards.makeCard("raptor", true));
  sandbox.renderCardFace(setCardHost, sandbox.ExplodingDinosCards.makeCard("miniRaptor", true));
  sandbox.renderCardFace(dangerCardHost, sandbox.ExplodingDinosCards.makeCard("meteor", false));
  sandbox.renderCardFace(defuseCardHost, sandbox.ExplodingDinosCards.makeCard("shelter", false));

  const expected = [
    [actionCardHost, "card-face__icon card-face__icon--action", "assets/cards/icons/action.svg"],
    [setCardHost, "card-face__icon card-face__icon--set-pair", "assets/cards/icons/set-pair.svg"],
    [dangerCardHost, "card-face__icon card-face__icon--danger", "assets/cards/icons/danger.svg"],
    [defuseCardHost, "card-face__icon card-face__icon--defuse", "assets/cards/icons/defuse.svg"]
  ];

  expected.forEach(([host, className, src]) => {
    const header = host.children[0];
    const icon = header.children[1];

    assert.equal(header.children.length, 2);
    assert.equal(header.classList.contains("card-face__header--no-icon"), false);
    assert.equal(icon.className, className);
    assert.equal(icon.children[0].src, src);
  });
});

test("mobile menu opens logbook and navigates to the catalog", () => {
  const { getSelector, sandbox } = loadGame();
  const expectedCount = Object.keys(sandbox.ExplodingDinosCards.cardCatalog).length;

  getSelector("#startGameButton").click();
  Array.from({ length: 7 }, (_, index) => sandbox.log(`Extra logactie ${index + 1}`));
  getSelector("#mobileMenuButton").click();

  assert.equal(getSelector("#mobileMenu").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#mobileMenuButton").attributes["aria-expanded"], "true");

  getSelector("#mobileLogButton").click();

  assert.equal(getSelector("#mobileLogPanel").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#mobileGameLog").children.length, 5);
  assert.equal(getSelector("#mobileGameLog").children.at(-1).textContent, "Extra logactie 7");
  assert.equal(getSelector("#mobileLogExpandButton").textContent, "Toon volledig logboek");

  getSelector("#mobileLogExpandButton").click();

  assert.equal(getSelector("#mobileGameLog").children.length, getSelector("#gameLog").children.length);
  assert.equal(getSelector("#mobileLogExpandButton").textContent, "Toon laatste 5 acties");

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

test("raptor attack ends the played card owner's turn", () => {
  const { getSelector, sandbox } = loadGame();
  const { makeCard } = sandbox.ExplodingDinosCards;

  getSelector("#startGameButton").click();
  sandbox.window.setTimeout = () => 0;

  const raptor = makeCard("raptor", true);
  const playerHand = sandbox.getHand("player");
  playerHand.splice(0, playerHand.length, raptor);
  sandbox.getHand("pc1").splice(0);

  sandbox.playCard("player", raptor.id);
  getSelector("#revealButton").click();

  assert.equal(getSelector("#turnStatus").textContent, "Rex de Archeoloog denkt na");
  assert.equal(getSelector("#drawButton").disabled, true);
});

test("normal raptor attacks the next player without offering unrelated Brul Terug", () => {
  const { getSelector, sandbox } = loadGame();
  const { makeCard } = sandbox.ExplodingDinosCards;

  getSelector("#opponentRoster").children[1].click();
  getSelector("#startGameButton").click();
  sandbox.window.setTimeout = () => 0;

  sandbox.getHand("player").splice(0, sandbox.getHand("player").length, makeCard("nope", true));
  sandbox.consumeTurn("player");
  sandbox.render();

  const raptor = makeCard("raptor", true);
  sandbox.getHand("pc1").splice(0, sandbox.getHand("pc1").length, raptor);
  sandbox.getHand("pc2").splice(0);

  sandbox.playCard("pc1", raptor.id);

  assert.match(getSelector("#revealText").textContent, /volgende speler: Nova de Vulkaanwachter/);

  getSelector("#revealButton").click();

  assert.equal(getSelector("#turnStatus").textContent, "Nova de Vulkaanwachter denkt na");
  assert.equal(getSelector("#drawReveal").classList.contains("is-hidden"), true);
  assert.notEqual(getSelector("#revealEyebrow").textContent, "Brul Terug?");
});

test("card artwork receives responsive crop metadata", () => {
  const { getSelector, sandbox } = loadGame();
  const host = getSelector("#revealCard");
  const card = sandbox.ExplodingDinosCards.makeCard("raptor", false);

  sandbox.renderCardFace(host, card, { large: true });

  const image = host.children[1].children[0];
  assert.equal(host.classList.contains("card-face--large"), true);
  assert.equal(image.style["--card-art-position"], "52% 56%");
  assert.equal(image.style["--card-art-position-mini"], "52% 56%");
  assert.equal(image.style["--card-art-position-large"], "52% 50%");
});

test("opponent hands cap visible card backs and keep the total in a badge", () => {
  const { sandbox } = loadGame();
  const player = (cardCount) => ({
    id: `pc-${cardCount}`,
    name: "Nova",
    initials: "NO",
    color: "#d45d32",
    subtitle: `${cardCount} kaarten`,
    countLabel: `${cardCount} kaarten`,
    cardCount,
    eliminated: false,
    isCurrent: false
  });

  const emptyHand = sandbox.ExplodingDinosGameView.createOpponentSeat(player(0));
  const smallHand = sandbox.ExplodingDinosGameView.createOpponentSeat(player(3));
  const largeHand = sandbox.ExplodingDinosGameView.createOpponentSeat(player(12));

  assert.equal(emptyHand.children[1].children.length, 1);
  assert.equal(emptyHand.children[1].children[0].textContent, "0");
  assert.equal(smallHand.children[1].children.length, 4);
  assert.equal(smallHand.children[1].children.at(-1).textContent, "3");
  assert.equal(largeHand.children[1].children.length, 5);
  assert.equal(largeHand.children[1].children.at(-1).textContent, "12");
  assert.equal(largeHand.attributes["aria-label"], "Nova, 12 kaarten");
  assert.equal(largeHand.children[1].attributes["aria-hidden"], "true");
});

test("Triceratops Blik lists cards without separate danger or shelter warnings", () => {
  const { sandbox } = loadGame();
  const text = sandbox.describeTrikePeek([
    { name: "Meteorietinslag", type: "meteor" },
    { name: "Schuilgrot", type: "shelter" },
    { name: "Dino Sprint", type: "sprint" }
  ]);

  assert.equal(text, "Bovenop liggen: 1. Meteorietinslag | 2. Schuilgrot | 3. Dino Sprint.");
  assert.doesNotMatch(text, /waarschuwing|in beeld/i);
});

test("draw button opens a pending draw reveal", () => {
  const { getSelector } = loadGame();

  getSelector("#startGameButton").click();
  getSelector("#drawButton").click();

  assert.equal(getSelector("#drawReveal").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#revealEyebrow").textContent, "Jij trekt");
  assert.match(getSelector("#revealText").textContent, /kaart|Meteorietinslag|Schuilgrot/i);
});

test("interactive tutorial explains explosion, shelter and replacement without changing the game", () => {
  const { getSelector, sandbox } = loadGame();
  getSelector("#startGameButton").click();
  const before = JSON.stringify(sandbox.state);

  getSelector("#explainButton").click();
  assert.equal(getSelector("#tutorial").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#tutorialProgress").textContent, "Stap 1 van 6");

  getSelector("#tutorialNextButton").click();
  assert.match(getSelector("#tutorialText").textContent, /Actiekaarten/i);
  getSelector("#tutorialNextButton").click();
  assert.match(getSelector("#tutorialText").textContent, /Trekken beëindigt je beurt|beurt is voorbij/i);
  getSelector("#tutorialNextButton").click();
  assert.match(getSelector("#tutorialText").textContent, /geen Schuilgrot/i);
  getSelector("#tutorialNextButton").click();
  assert.match(getSelector("#tutorialText").textContent, /automatisch gebruikt/i);
  getSelector("#tutorialNextButton").click();
  assert.equal(getSelector("#tutorialProgress").textContent, "Stap 6 van 6");
  assert.equal(getSelector("#tutorialPlacement").classList.contains("is-hidden"), false);
  getSelector("#tutorialNextButton").click();

  assert.equal(getSelector("#tutorial").classList.contains("is-hidden"), true);
  assert.equal(JSON.stringify(sandbox.state), before);
});

test("catalog tab renders all unique cards", () => {
  const { getSelector, sandbox } = loadGame();
  const expectedCount = Object.keys(sandbox.ExplodingDinosCards.cardCatalog).length;

  getSelector("#showCatalogPage").click();

  assert.equal(getSelector("#catalogPage").classList.contains("is-hidden"), false);
  assert.equal(getSelector("#catalogGrid").children.length, expectedCount);
  assert.equal(getSelector("#catalogCount").textContent, `${expectedCount} unieke kaarten`);
});

test("pc play styles change card choices", () => {
  const { getSelector, sandbox } = loadGame();
  const { makeCard } = sandbox.ExplodingDinosCards;
  const originalRandom = sandbox.Math.random;
  getSelector("#startGameButton").click();

  const pc = sandbox.getPlayer("pc1");
  const pcHand = sandbox.getHand("pc1");
  pcHand.splice(0, pcHand.length, makeCard("raptor"), makeCard("oracle"));

  pc.playStyle = "aggressive";
  sandbox.Math.random = () => 0.7;
  assert.equal(sandbox.choosePcCard("pc1").type, "raptor");

  pc.playStyle = "careful";
  sandbox.Math.random = () => 0.7;
  assert.equal(sandbox.choosePcCard("pc1").type, "oracle");

  sandbox.Math.random = originalRandom;
});
