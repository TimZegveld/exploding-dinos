const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { test, expect } = require("playwright/test");

const gameUrl = pathToFileURL(path.resolve(__dirname, "../..", "index.html")).href;

test.beforeEach(async ({ page }) => {
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.browserErrors = browserErrors;
  await page.goto(gameUrl);
});

test.afterEach(async ({ page }) => {
  expect(page.browserErrors, "browserconsole moet foutvrij blijven").toEqual([]);
});

async function startGame(page) {
  await expect(page.locator("#startModal")).toBeVisible();
  await expect(page.locator("#opponentSelectionSummary")).toHaveText("1 gekozen");
  await page.locator("#startGameButton").click();
  await expect(page.locator("#startModal")).toBeHidden();
  await expect(page.locator("#playerHand .card-button")).toHaveCount(8);
  await expect(page.locator("#opponents .opponent-seat")).toHaveCount(1);
}

test("startscherm start een speelbaar spel en kaartdetail sluit weer", async ({ page }) => {
  await startGame(page);
  if (await page.locator("#handToggle").isVisible()) {
    await page.locator("#handToggle").click();
  }
  await page.locator("#playerHand .card-button:not(:disabled)").first().click();
  await expect(page.locator("#drawReveal")).toBeVisible();
  await expect(page.locator("#revealEyebrow")).toHaveText("Kaart bekijken");
  await page.locator("#revealButton").click();
  await expect(page.locator("#drawReveal")).toBeHidden();
});

test("een trek opent de reveal-overlay", async ({ page }) => {
  await startGame(page);
  await page.locator("#drawButton").click();
  await expect(page.locator("#drawReveal")).toBeVisible();
  await expect(page.locator("#revealCard")).not.toBeEmpty();
  await expect(page.locator("#revealButton")).toBeEnabled();
});

test("uitleg doorloopt ontploffen, ontmantelen en terugplaatsen", async ({ page }) => {
  await page.locator("#startExplainButton").click();
  await expect(page.locator("#tutorial")).toBeVisible();
  await expect(page.locator("#tutorialProgress")).toHaveText("Stap 1 van 6");
  const tutorialCard = await page.locator(".tutorial__card").first().boundingBox();
  expect(Math.abs((tutorialCard.width / tutorialCard.height) - (5 / 7))).toBeLessThan(0.02);

  await page.locator("#tutorialNextButton").click();
  await expect(page.locator("#tutorialText")).toContainText("Actiekaarten");
  await page.locator("#tutorialNextButton").click();
  await expect(page.locator("#tutorialText")).toContainText("beurt is voorbij");
  await page.locator("#tutorialNextButton").click();
  await expect(page.locator("#tutorialText")).toContainText("geen Schuilgrot");
  await page.locator("#tutorialNextButton").click();
  await expect(page.locator("#tutorialText")).toContainText("automatisch gebruikt");
  await page.locator("#tutorialNextButton").click();
  await expect(page.locator("#tutorialPlacement")).toBeVisible();
  await page.locator("#tutorialPlacementSelect").selectOption("bottom");
  await expect(page.locator("#tutorialPlacementHint")).toContainText("gevaar blijft");
  await page.locator("#tutorialNextButton").click();

  await expect(page.locator("#tutorial")).toBeHidden();
  await expect(page.locator("#startModal")).toBeVisible();
});

test("catalogus toont alle kaarten en opent kaartdetails", async ({ page }) => {
  await startGame(page);
  if (await page.locator("#mobileMenuButton").isVisible()) {
    await page.locator("#mobileMenuButton").click();
    await page.locator("#mobileCatalogPageButton").click();
  } else {
    await page.locator("#showCatalogPage").click();
  }
  await expect(page.locator("#catalogPage")).toBeVisible();
  await expect(page.locator("#catalogGrid .catalog-card")).toHaveCount(17);
  await page.locator("#catalogGrid .catalog-card").first().click();
  await expect(page.locator("#catalogDetail")).toBeVisible();
  await expect(page.locator("#catalogDetailTitle")).not.toBeEmpty();
  await page.locator("#closeCatalogDetail").click();
  await expect(page.locator("#catalogDetail")).toBeHidden();
});

test("eindscherm biedt direct een nieuw spel aan", async ({ page }) => {
  await startGame(page);
  await page.evaluate(() => {
    eval(`activeReveal = { title: "Overwinning!", text: "Je bent de laatste overlevende.", buttonText: "Nieuw spel", endGame: true, owner: "player" }; state.gameOver = true; render();`);
  });
  await expect(page.locator("#drawReveal")).toBeVisible();
  await expect(page.locator("#revealEyebrow")).toHaveText("Overwinning!");
  await expect(page.locator("#revealButton")).toHaveText("Nieuw spel");
});

test("mobiele bediening blijft binnen het scherm", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "alleen relevant voor mobiel");
  await startGame(page);
  await expect(page.locator("#mobileMenuButton")).toBeVisible();
  const drawButton = await page.locator("#drawButton").boundingBox();
  const viewport = page.viewportSize();
  expect(drawButton.y).toBeGreaterThanOrEqual(0);
  expect(drawButton.y + drawButton.height).toBeLessThanOrEqual(viewport.height);
  await page.locator("#mobileMenuButton").click();
  await expect(page.locator("#mobileMenu")).toBeVisible();
  await page.locator("#mobileCatalogPageButton").click();
  await expect(page.locator("#catalogPage")).toBeVisible();
  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth
  }));
  expect(overflow.content).toBeLessThanOrEqual(overflow.viewport + 1);
});

test("mobiele tafel blijft compact met vier tegenstanders", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "alleen relevant voor mobiel");
  await page.locator("#opponentRoster .roster-card").nth(1).click();
  await page.locator("#opponentRoster .roster-card").nth(2).click();
  await page.locator("#opponentRoster .roster-card").nth(3).click();
  await expect(page.locator("#opponentSelectionSummary")).toHaveText("4 gekozen");
  await page.locator("#startGameButton").click();
  await expect(page.locator("#opponents .opponent-seat")).toHaveCount(4);

  const opponentRail = await page.locator("#opponents").evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    display: getComputedStyle(element).display
  }));
  expect(opponentRail.display).toBe("flex");
  if (page.viewportSize().width < 500) {
    expect(opponentRail.scrollWidth).toBeGreaterThan(opponentRail.clientWidth);
  }

  await page.locator("#handToggle").click();
  const handRail = await page.locator("#playerHand").evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    flexWrap: getComputedStyle(element).flexWrap
  }));
  expect(handRail.flexWrap).toBe("nowrap");
  if (page.viewportSize().width < 500) {
    expect(handRail.scrollWidth).toBeGreaterThan(handRail.clientWidth);
  }
});

test("mobiele dialogen krijgen focus en sluiten met Escape", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "alleen relevant voor mobiel");
  await startGame(page);
  await page.locator("#mobileMenuButton").click();
  await expect(page.locator("#closeMobileMenu")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobileMenu")).toBeHidden();
  await expect(page.locator("#mobileMenuButton")).toBeFocused();

  await page.locator("#mobileMenuButton").click();
  await page.locator("#mobileExplainButton").click();
  await expect(page.locator("#closeTutorialButton")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#tutorial")).toBeHidden();
});
