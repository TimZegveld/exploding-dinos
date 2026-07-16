const { test, expect } = require("playwright/test");
const { card, openRoomPage, poll, startTestRoom } = require("./multiplayer-test-helpers");

test("meerdere Brul Terug-kaarten laten een even keten eenmaal doorgaan", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "De echte multi-browserflow draait eenmaal op desktop.");
  test.setTimeout(60_000);
  const testRoom = await startTestRoom(["Ayla", "Bram", "Cleo"]);
  const browserErrors = [];
  const opened = [];

  try {
    const [ayla, bram, cleo] = testRoom.sessions;
    const game = testRoom.room.game;
    game.currentPlayerId = ayla.playerId;
    game.pending = null;
    game.discard = [];
    game.deck = [card("safe-bottom", "sprint", "Dino Sprint"), card("safe-top", "volcano", "Vulkaan Shuffle")];
    game.hands[ayla.playerId] = [card("peek-a", "trike", "Triceratops Blik")];
    game.hands[bram.playerId] = [card("nope-b", "nope", "Brul Terug")];
    game.hands[cleo.playerId] = [card("nope-c", "nope", "Brul Terug")];

    const aylaBrowser = await openRoomPage(browser, testRoom, ayla, browserErrors);
    const bramBrowser = await openRoomPage(browser, testRoom, bram, browserErrors);
    const cleoBrowser = await openRoomPage(browser, testRoom, cleo, browserErrors);
    opened.push(aylaBrowser, bramBrowser, cleoBrowser);

    await aylaBrowser.page.locator("#playerHand .card-button", { hasText: "Triceratops Blik" }).click();
    await aylaBrowser.page.locator("#revealSecondaryButton", { hasText: "Spelen" }).click();
    await aylaBrowser.page.locator("#revealButton", { hasText: "Kaart uitvoeren" }).click();

    await poll(bramBrowser.page);
    await expect(bramBrowser.page.locator("#revealEyebrow")).toHaveText("Brul Terug?");
    await bramBrowser.page.locator("#revealCard .draw-reveal__mini-card", { hasText: "Brul Terug" }).click();

    await poll(cleoBrowser.page);
    await expect(cleoBrowser.page.locator("#revealText")).toContainText("1 Brul Terug");
    await cleoBrowser.page.locator("#revealCard .draw-reveal__mini-card", { hasText: "Brul Terug" }).click();

    await poll(aylaBrowser.page);
    await aylaBrowser.page.locator("#revealButton", { hasText: "Passen" }).click();
    await poll(bramBrowser.page);
    await bramBrowser.page.locator("#revealButton", { hasText: "Passen" }).click();

    await poll(aylaBrowser.page);
    await expect(aylaBrowser.page.locator("#revealEyebrow")).toHaveText("Triceratops Blik");
    expect(game.pending?.type).toBe("PEEK");
    expect(game.log.filter((entry) => entry.includes("gaat door na 2 Brul Terug"))).toHaveLength(1);
    expect(game.discard.map((item) => item.id)).toEqual(["peek-a", "nope-b", "nope-c"]);
    expect(browserErrors.flat()).toEqual([]);
  } finally {
    await testRoom.close();
  }
});

test("een doorgeschoven raptoraanval stapelt volledige beurten en verbruikt er een", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "De echte multi-browserflow draait eenmaal op desktop.");
  test.setTimeout(60_000);
  const testRoom = await startTestRoom(["Ayla", "Bram", "Cleo"]);
  const browserErrors = [];

  try {
    const [ayla, bram, cleo] = testRoom.sessions;
    const game = testRoom.room.game;
    game.currentPlayerId = ayla.playerId;
    game.pending = {
      type: "ATTACK_REACTION",
      playerId: bram.playerId,
      attackerId: ayla.playerId,
      targetId: bram.playerId,
      attackLoad: 2
    };
    game.forcedDrawsRemaining = 0;
    game.discard = [];
    game.deck = [
      card("safe-1", "trike", "Triceratops Blik"),
      card("safe-2", "volcano", "Vulkaan Shuffle")
    ];
    game.hands[ayla.playerId] = [];
    game.hands[bram.playerId] = [card("raptor-b", "raptor", "Raptor Aanval")];
    game.hands[cleo.playerId] = [];

    const bramBrowser = await openRoomPage(browser, testRoom, bram, browserErrors);
    const cleoBrowser = await openRoomPage(browser, testRoom, cleo, browserErrors);

    await expect(bramBrowser.page.locator("#revealEyebrow")).toHaveText("Reageer op aanval");
    await expect(bramBrowser.page.locator("#revealText")).toContainText("2 volledige beurten");
    await bramBrowser.page.locator("#revealCard .draw-reveal__mini-card", { hasText: "Raptor Aanval" }).click();

    await poll(cleoBrowser.page);
    await expect(cleoBrowser.page.locator("#revealEyebrow")).toHaveText("Reageer op aanval");
    await expect(cleoBrowser.page.locator("#revealText")).toContainText("4 volledige beurten");
    await cleoBrowser.page.locator("#revealButton", { hasText: "Niets doen" }).click();

    await poll(cleoBrowser.page);
    await expect(cleoBrowser.page.locator("#turnStatus")).toContainText("Aanval: nog 4 beurten");
    await expect(cleoBrowser.page.locator("#playerHint")).toContainText("nog 4 beurten");
    await expect(cleoBrowser.page.locator("#drawButton")).toHaveAttribute("aria-label", /Nog 4 beurten/);
    expect(game.currentPlayerId).toBe(cleo.playerId);
    expect(game.forcedDrawsRemaining).toBe(4);

    await cleoBrowser.page.locator("#drawButton").click();
    await cleoBrowser.page.locator("#revealButton", { hasText: "daarna nog 3" }).click();
    await expect(cleoBrowser.page.locator("#turnStatus")).toContainText("Aanval: nog 3 beurten");
    expect(game.forcedDrawsRemaining).toBe(3);
    expect(game.discard.map((item) => item.id)).toContain("raptor-b");
    expect(browserErrors.flat()).toEqual([]);
  } finally {
    await testRoom.close();
  }
});

test("meteoriet en Schuilgrot zijn openbaar maar de terugplaatsing blijft geheim", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Deze echte multi-browserflow bewaakt tegelijk de mobiele presentatie.");
  test.setTimeout(60_000);
  const testRoom = await startTestRoom(["Ayla", "Bram"]);
  const browserErrors = [];

  try {
    const [ayla, bram] = testRoom.sessions;
    const game = testRoom.room.game;
    game.currentPlayerId = ayla.playerId;
    game.pending = null;
    game.forcedDrawsRemaining = 0;
    game.discard = [];
    game.deck = [
      card("safe-bottom", "trike", "Triceratops Blik"),
      card("safe-top", "sprint", "Dino Sprint"),
      card("meteor-1", "meteor", "Meteorietinslag", "danger")
    ];
    game.hands[ayla.playerId] = [card("shelter-1", "shelter", "Schuilgrot", "defuse")];
    game.hands[bram.playerId] = [];

    const mobileViewport = { width: 393, height: 851 };
    const aylaBrowser = await openRoomPage(browser, testRoom, ayla, browserErrors, mobileViewport);
    const bramBrowser = await openRoomPage(browser, testRoom, bram, browserErrors, mobileViewport);

    await aylaBrowser.page.locator("#drawButton").click();
    await poll(bramBrowser.page);
    await expect(aylaBrowser.page.locator("#revealEyebrow")).toHaveText("Meteorietinslag");
    await expect(bramBrowser.page.locator("#revealEyebrow")).toHaveText("Meteorietinslag");
    await expect(bramBrowser.page.locator("#revealCard")).toContainText("Meteorietinslag");
    await expect(bramBrowser.page.locator("#revealText")).toContainText("heeft een Schuilgrot");

    await aylaBrowser.page.locator("#revealButton", { hasText: "Gebruik Schuilgrot" }).click();
    await poll(bramBrowser.page);
    await expect(aylaBrowser.page.locator("#revealEyebrow")).toHaveText("Schuilgrot ingezet");
    await expect(bramBrowser.page.locator("#revealEyebrow")).toHaveText("Schuilgrot ingezet");
    await expect(bramBrowser.page.locator("#revealCard")).toContainText("Schuilgrot");
    await expect(bramBrowser.page.locator("#revealText")).toContainText("blijft geheim");

    await aylaBrowser.page.locator("#revealButton", { hasText: "Meteoriet geheim terugleggen" }).click();
    await poll(bramBrowser.page);
    await expect(aylaBrowser.page.locator("#revealEyebrow")).toHaveText("Geheime terugplaatsing");
    await expect(aylaBrowser.page.locator("#placementControls")).toBeVisible();
    await expect(bramBrowser.page.locator("#placementControls")).toBeHidden();
    await expect(bramBrowser.page.locator("#revealText")).not.toContainText("Positie");

    await aylaBrowser.page.locator("#placementSelect").selectOption("2");
    await aylaBrowser.page.locator("#revealButton", { hasText: "Stop geheim terug" }).click();
    await poll(bramBrowser.page);

    expect(game.pending).toBeNull();
    expect(game.deck.map((item) => item.id)).toEqual(["safe-bottom", "meteor-1", "safe-top"]);
    expect(game.discard.map((item) => item.id)).toEqual(["shelter-1"]);
    await expect(bramBrowser.page.locator("body")).not.toContainText("Positie 2");
    expect(browserErrors.flat()).toEqual([]);
  } finally {
    await testRoom.close();
  }
});
