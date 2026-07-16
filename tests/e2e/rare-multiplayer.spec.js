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
