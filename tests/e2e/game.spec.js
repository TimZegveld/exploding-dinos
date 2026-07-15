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

test("multiplayer opent via een losse knop zonder singleplayer te starten", async ({ page }) => {
  await expect(page.locator("#startModal")).toBeVisible();
  await expect(page.locator(".multiplayer-development-note")).toContainText("In ontwikkeling");
  await page.locator("#openMultiplayerButton").click();
  await expect(page.locator("#multiplayerModal")).toBeVisible();
  await expect(page.locator("#multiplayerJoinView")).toBeVisible();
  await expect(page.locator("#multiplayerGame")).toHaveCount(0);
  await expect(page.locator("#multiplayerModal")).not.toContainText("Aflegstapel");
  await expect(page.locator("#multiplayerModal")).not.toContainText("Jouw hand");
  await expect(page.locator("#multiplayerName")).not.toHaveValue("");
  await page.locator("#multiplayerName").fill("Zelfgekozen Rex");
  await expect(page.locator("#multiplayerName")).toHaveValue("Zelfgekozen Rex");
  await expect(page.locator("#multiplayerRoomCodeField")).toBeHidden();
  await expect(page.locator("#createRoomButton")).toBeVisible();
  await expect(page.locator("#joinRoomButton")).toBeHidden();
  await expect(page.locator("#playerHand .card-button")).toHaveCount(0);
  await page.locator("#closeMultiplayerButton").click();
  await expect(page.locator("#multiplayerModal")).toBeHidden();
  await expect(page.locator("#startModal")).toBeVisible();

  await page.evaluate(() => history.replaceState({}, "", "?room=KNET42"));
  await page.locator("#openMultiplayerButton").click();
  await expect(page.locator("#multiplayerRoomCode")).toHaveValue("KNET42");
  await expect(page.locator("#multiplayerRoomCode")).toHaveAttribute("readonly", "");
  await expect(page.locator("#createRoomButton")).toBeHidden();
  await expect(page.locator("#joinRoomButton")).toHaveText("Deelnemen");
  await expect(page.locator("#joinRoomButton")).toBeVisible();
  const joinButtonBox = await page.locator("#joinRoomButton").boundingBox();
  const joinActionsBox = await page.locator("#multiplayerJoinView .multiplayer-actions").boundingBox();
  expect(joinButtonBox?.width).toBeCloseTo(joinActionsBox?.width ?? 0, 0);
});

test("room maken toont uitleg en blokkeert dubbele acties tijdens een cold start", async ({ page }) => {
  let createRequests = 0;
  await page.route("https://api.test/api/rooms", async (route) => {
    createRequests += 1;
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        token: "host-token",
        room: {
          code: "WACHT1",
          viewerId: "player-host",
          isHost: true,
          players: [{ id: "player-host", name: "Tim" }],
          game: null
        }
      })
    });
  });
  await page.evaluate(() => { window.ExplodingDinosMultiplayerConfig.apiBase = "https://api.test"; });

  await page.locator("#openMultiplayerButton").click();
  await page.locator("#multiplayerName").fill("Tim");
  await page.locator("#createRoomButton").click();

  await expect(page.locator("#multiplayerStatus")).toHaveClass(/is-loading/);
  await expect(page.locator("#multiplayerStatus")).toContainText("eerste verbinding");
  await expect(page.locator("#multiplayerJoinView")).toHaveAttribute("aria-busy", "true");
  await expect(page.locator("#createRoomButton")).toBeDisabled();
  await expect(page.locator("#multiplayerName")).toBeDisabled();
  await page.locator("#createRoomButton").evaluate((button) => button.click());

  await expect(page.locator("#activeRoomCode")).toHaveText("WACHT1");
  expect(createRequests).toBe(1);
});

test("roomverbinding geeft na een timeout een begrijpelijke herkansing", async ({ page }) => {
  await page.addInitScript(() => {
    window.ExplodingDinosMultiplayerConfig = { apiBase: "https://api.test", requestTimeoutMs: 30 };
    window.fetch = (_url, options = {}) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener("abort", () => reject(new DOMException("Afgebroken", "AbortError")));
    });
  });
  await page.reload();

  await page.locator("#openMultiplayerButton").click();
  await page.locator("#createRoomButton").click();

  await expect(page.locator("#multiplayerStatus")).toContainText("deed er te lang over");
  await expect(page.locator("#multiplayerStatus")).toContainText("Probeer het opnieuw");
  await expect(page.locator("#multiplayerStatus")).not.toHaveClass(/is-loading/);
  await expect(page.locator("#createRoomButton")).toBeEnabled();
});

test("spelersnaam blijft vergrendeld in een room en komt vrij na verlaten", async ({ page }) => {
  const room = {
    code: "NAAM01",
    viewerId: "player-host",
    isHost: true,
    players: [{ id: "player-host", name: "Vaste Rex" }],
    game: null
  };
  await page.route("https://api.test/**", async (route) => {
    await route.fulfill({
      status: route.request().method() === "POST" ? 201 : 200,
      contentType: "application/json",
      body: JSON.stringify({ room, token: "host-token" })
    });
  });
  await page.evaluate(() => { window.ExplodingDinosMultiplayerConfig.apiBase = "https://api.test"; });

  await page.locator("#openMultiplayerButton").click();
  await page.locator("#multiplayerName").fill("Vaste Rex");
  await page.locator("#createRoomButton").click();

  await expect(page.locator("#multiplayerName")).toBeDisabled();
  await expect(page.locator("#multiplayerName")).toHaveAttribute("aria-readonly", "true");
  await expect(page.locator("#randomizeDinoNameButton")).toBeDisabled();

  await page.locator("#leaveRoomButton").click();
  await expect(page.locator("#multiplayerJoinView")).toBeVisible();
  await expect(page.locator("#multiplayerName")).toBeEnabled();
  await expect(page.locator("#multiplayerName")).toHaveAttribute("aria-readonly", "false");
  await expect(page.locator("#randomizeDinoNameButton")).toBeEnabled();
});

test("host start een online potje en ziet alleen de eigen hand", async ({ page }) => {
  const roomBase = {
    code: "KNET42",
    status: "lobby",
    version: 2,
    viewerId: "player-host",
    isHost: true,
    players: [
      { id: "player-host", name: "Tim", joinedAt: 1 },
      { id: "player-guest", name: "Nova", joinedAt: 2 }
    ],
    game: null
  };
  const gameRoom = {
    ...roomBase,
    status: "playing",
    version: 3,
    game: {
      currentPlayerId: "player-host",
      winnerId: null,
      deckCount: 18,
      discardTop: null,
      eliminated: { "player-host": false, "player-guest": false },
      pending: null,
      playableTypes: ["sprint"],
      playableCardIds: [],
      players: [
        { id: "player-host", name: "Tim", cardCount: 8 },
        { id: "player-guest", name: "Nova", cardCount: 8 }
      ],
      hand: [{ id: "sprint-1", type: "sprint", name: "Dino Sprint", text: "Sla je beurt over.", kind: "action" }],
      log: ["Online potje gestart met 2 spelers."]
    }
  };
  const choiceRoom = {
    ...gameRoom,
    version: 4,
    game: {
      ...gameRoom.game,
      pending: {
        type: "PEEK",
        title: "Triceratops Blik",
        cards: [{ id: "peek-1", type: "volcano", name: "Vulkaan Shuffle", text: "Schud de stapel.", kind: "action" }]
      }
    }
  };
  const oracleRoom = {
    ...gameRoom,
    version: 11,
    game: {
      ...gameRoom.game,
      pending: {
        type: "ORACLE_ORDER",
        cards: [
          { id: "oracle-top", type: "sprint", name: "Bovenste kaart", text: "Eerst.", kind: "action" },
          { id: "oracle-middle", type: "volcano", name: "Middelste kaart", text: "Tweede.", kind: "action" },
          { id: "oracle-bottom", type: "trike", name: "Onderste kaart", text: "Derde.", kind: "action" }
        ]
      }
    }
  };
  const drawRoom = {
    ...gameRoom,
    version: 4,
    game: {
      ...gameRoom.game,
      currentPlayerId: "player-host",
      deckCount: 17,
      pending: {
        type: "DRAW_REVEAL",
        cards: [{ id: "drawn-1", type: "trike", name: "Triceratops Blik", text: "Bekijk de stapel.", kind: "action" }]
      },
      hand: [
        ...gameRoom.game.hand,
        { id: "drawn-1", type: "trike", name: "Triceratops Blik", text: "Bekijk de stapel.", kind: "action" }
      ],
      players: [
        { id: "player-host", name: "Tim", cardCount: 9 },
        { id: "player-guest", name: "Nova", cardCount: 8 }
      ]
    }
  };
  const drawConfirmedRoom = {
    ...drawRoom,
    version: 5,
    game: { ...drawRoom.game, currentPlayerId: "player-guest", pending: null }
  };
  const attackRoom = {
    ...gameRoom,
    version: 5,
    game: {
      ...gameRoom.game,
      pending: {
        type: "ATTACK_REACTION",
        attackerName: "Nova",
        attackLoad: 2,
        nopeCardIds: ["nope-1"],
        attackCardIds: []
      },
      hand: [{ id: "nope-1", type: "nope", name: "Brul Terug", text: "Blokkeer de aanval.", kind: "action" }]
    }
  };
  const forcedDrawRoom = {
    ...gameRoom,
    version: 5,
    game: { ...gameRoom.game, forcedDrawsRemaining: 2, pending: null }
  };
  const forcedDrawRevealRoom = {
    ...forcedDrawRoom,
    version: 6,
    game: {
      ...forcedDrawRoom.game,
      pending: {
        type: "DRAW_REVEAL",
        cards: [{ id: "forced-draw-1", type: "trike", name: "Triceratops Blik", text: "Bekijk de stapel.", kind: "action" }]
      }
    }
  };
  const stealRevealRoom = {
    ...gameRoom,
    version: 5,
    game: {
      ...gameRoom.game,
      pending: {
        type: "STEAL_REVEAL",
        source: "Fossielgraaier",
        cards: [{ id: "stolen-1", type: "sprint", name: "Dino Sprint", text: "Sla je beurt over.", kind: "action" }]
      }
    }
  };
  const opponentDrawRoom = {
    ...drawConfirmedRoom,
    version: 6,
    game: {
      ...drawConfirmedRoom.game,
      pending: { type: "WAITING", pendingType: "DRAW_REVEAL", playerId: "player-guest", playerName: "Nova" }
    }
  };
  const ownPlayRevealRoom = {
    ...gameRoom,
    version: 7,
    game: {
      ...gameRoom.game,
      pending: { type: "PLAY_REVEAL", playerId: "player-host", playerName: "Tim", isActor: true, cards: [gameRoom.game.hand[0]] }
    }
  };
  const opponentPlayRevealRoom = {
    ...gameRoom,
    version: 8,
    game: {
      ...gameRoom.game,
      pending: { type: "PLAY_REVEAL", playerId: "player-guest", playerName: "Nova", isActor: false, cards: [{ id: "trike-played", type: "trike", name: "Triceratops Blik", text: "Bekijk de stapel.", kind: "action" }] }
    }
  };
  const opponentMeteorRoom = {
    ...gameRoom,
    version: 9,
    game: {
      ...gameRoom.game,
      pending: { type: "METEOR_REVEAL", playerId: "player-guest", playerName: "Nova", isActor: false, phase: "meteor", survived: true, cards: [{ id: "meteor-1", type: "meteor", name: "Meteorietinslag", text: "Ontplof zonder Schuilgrot.", kind: "danger" }] }
    }
  };
  const opponentShelterRoom = {
    ...opponentMeteorRoom,
    version: 10,
    game: {
      ...opponentMeteorRoom.game,
      pending: { type: "METEOR_REVEAL", playerId: "player-guest", playerName: "Nova", isActor: false, phase: "shelter", survived: true, cards: [{ id: "shelter-1", type: "shelter", name: "Schuilgrot", text: "Redt je.", kind: "defuse" }] }
    }
  };
  const winnerRoom = {
    ...gameRoom,
    status: "finished",
    version: 6,
    game: { ...gameRoom.game, winnerId: "player-host", currentPlayerId: null }
  };
  const loserRoom = {
    ...winnerRoom,
    version: 7,
    game: { ...winnerRoom.game, winnerId: "player-guest" }
  };
  const freshRoom = {
    ...roomBase,
    code: "BRUL99",
    version: 1,
    players: [{ id: "player-fresh", name: "Tim", joinedAt: 3 }]
  };
  let currentRoom = roomBase;
  let createRequests = 0;

  await page.route("https://api.test/**", async (route) => {
    const url = new URL(route.request().url());
    const isStart = url.pathname.endsWith("/start");
    const isStop = url.pathname.endsWith("/stop");
    const isAction = url.pathname.endsWith("/actions");
    if (isAction) {
      const body = route.request().postDataJSON();
      currentRoom = body.action?.type === "DRAW_CARD" ? drawRoom : body.action?.type === "CONFIRM_DRAW" ? drawConfirmedRoom : attackRoom;
    }
    if (isStart) currentRoom = gameRoom;
    if (isStop) currentRoom = roomBase;
    const isCreate = route.request().method() === "POST" && url.pathname === "/api/rooms";
    if (isCreate) createRequests += 1;
    const createdRoom = createRequests === 1 ? roomBase : freshRoom;
    await route.fulfill({
      status: isCreate ? 201 : 200,
      contentType: "application/json",
      body: JSON.stringify(isCreate ? { room: createdRoom, token: createRequests === 1 ? "host-token" : "fresh-token" } : { room: isStart ? gameRoom : currentRoom })
    });
  });
  await page.evaluate(() => { window.ExplodingDinosMultiplayerConfig.apiBase = "https://api.test"; });

  await page.locator("#openMultiplayerButton").click();
  await page.locator("#multiplayerName").fill("Tim");
  await page.locator("#createRoomButton").click();
  await expect(page.locator("#activeRoomCode")).toHaveText("KNET42");
  await expect(page).toHaveURL(/\?room=KNET42$/);
  await page.addInitScript(() => { window.ExplodingDinosMultiplayerConfig = { apiBase: "https://api.test" }; });
  await page.reload();
  await expect(page.locator("#activeRoomCode")).toHaveText("KNET42");
  await expect(page.locator("#multiplayerStartButton")).toBeEnabled();
  await page.locator("#multiplayerStartButton").click();

  await expect(page.locator("#multiplayerModal")).toBeHidden();
  await expect(page.locator("#turnStatus")).toHaveText("Jouw beurt");
  await expect(page.locator("#opponents .opponent-seat")).toHaveCount(1);
  await expect(page.locator("#opponents")).toContainText("Nova");
  await expect(page.locator("#playerHand .card-button")).toHaveCount(1);
  await expect(page.locator("#deckCount")).toHaveText("18");
  await expect(page.locator("#playerHand")).not.toContainText("Nova");
  if (await page.locator("#handToggle").isVisible()) await page.locator("#handToggle").click();
  await page.locator("#playerHand .card-button").click();
  await expect(page.locator("#drawReveal")).toBeVisible();
  await expect(page.locator("#revealEyebrow")).toHaveText("Kaart bekijken");
  await expect(page.locator("#revealSecondaryButton")).toHaveText("Spelen");
  await expect(page.locator("#revealSecondaryButton")).toBeDisabled();
  await page.locator("#revealButton").click();
  await expect(page.locator("#drawReveal")).toBeHidden();

  currentRoom = ownPlayRevealRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  await expect(page.locator("#revealEyebrow")).toHaveText("Je speelt");
  await expect(page.locator("#revealText")).toContainText("Iedereen ziet deze kaart");
  await expect(page.locator("#revealButton")).toHaveText("Kaart uitvoeren");
  await expect(page.locator("#revealButton")).toBeEnabled();

  currentRoom = opponentPlayRevealRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  await expect(page.locator("#revealEyebrow")).toHaveText("Nova speelt");
  await expect(page.locator("#revealCard")).toContainText("Triceratops Blik");
  await expect(page.locator("#revealText")).toContainText("geheime vervolgstap");
  await expect(page.locator("#revealButton")).toHaveText("Wachten op Nova");
  await expect(page.locator("#revealButton")).toBeDisabled();

  currentRoom = opponentMeteorRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  await expect(page.locator("#revealEyebrow")).toHaveText("Meteorietinslag");
  await expect(page.locator("#revealCard")).toContainText("Meteorietinslag");
  await expect(page.locator("#revealText")).toContainText("Nova trekt");
  await expect(page.locator("#revealButton")).toBeDisabled();

  currentRoom = opponentShelterRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  await expect(page.locator("#revealEyebrow")).toHaveText("Schuilgrot ingezet");
  await expect(page.locator("#revealCard")).toContainText("Schuilgrot");
  await expect(page.locator("#revealText")).toContainText("terugkomt blijft geheim");
  await expect(page.locator("#revealButton")).toBeDisabled();

  currentRoom = gameRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());

  currentRoom = oracleRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  const orderedCards = page.locator(".multiplayer-choice__ordered-card");
  await expect(orderedCards).toHaveCount(3);
  await orderedCards.nth(0).locator("button").last().click();
  await expect(orderedCards.nth(0)).toContainText("Middelste kaart");
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  await expect(orderedCards.nth(0)).toContainText("Middelste kaart");

  currentRoom = forcedDrawRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  await expect(page.locator("#turnStatus")).toHaveText("Let op: trek nog 2 kaarten");
  await expect(page.locator("#turnStatus")).toHaveClass(/is-multiple-forced-draws/);
  await expect(page.locator("#playerHint")).toHaveText("2 verplichte trekkingen over");
  await expect(page.locator("#drawButton")).toHaveAttribute("data-forced-draws", "2 verplichte kaarten");
  await expect(page.locator("#drawButton")).toHaveAttribute("aria-label", "Trek kaart. Nog 2 verplicht.");

  currentRoom = forcedDrawRevealRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  await expect(page.locator("#revealEyebrow")).toHaveText("Verplichte trekking — nog 2");
  await expect(page.locator("#revealText")).toContainText("Hierna moet je nog 1 kaart trekken");
  await expect(page.locator("#revealButton")).toHaveText("Neem kaart — daarna nog 1");

  currentRoom = gameRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());

  if (await page.locator("#newGameButton").isVisible()) {
    await page.locator("#newGameButton").click();
  } else {
    await page.locator("#mobileMenuButton").click();
    await page.locator("#mobileNewGameButton").click();
  }
  await expect(page.locator("#multiplayerModal")).toBeVisible();
  await expect(page.locator("#stopMultiplayerGameButton")).toBeVisible();
  await expect(page.locator("#leaveRoomButton")).toHaveText("Terug naar spel");
  await page.locator("#leaveRoomButton").click();
  await expect(page.locator("#multiplayerModal")).toBeHidden();

  await page.locator("#drawButton").click();
  await expect(page.locator("#drawReveal")).toBeVisible();
  await expect(page.locator("#revealEyebrow")).toHaveText("Je trekt");
  await expect(page.locator("#revealCard")).toContainText("Triceratops Blik");
  await page.locator("#revealButton").click();
  await expect(page.locator("#drawReveal")).toBeHidden();
  await expect(page.locator("#turnStatus")).toContainText("Nova");
  await expect(page.locator("#deckCount")).toHaveText("17");

  currentRoom = opponentDrawRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  await expect(page.locator("#revealEyebrow")).toHaveText("Nova trekt");
  await expect(page.locator("#revealCard")).toHaveClass(/is-back/);
  await expect(page.locator("#revealText")).toContainText("gesloten kaart");
  await expect(page.locator("#revealButton")).toBeVisible();
  await expect(page.locator("#revealButton")).toHaveText("Wachten op Nova");
  await expect(page.locator("#revealButton")).toBeDisabled();
  await expect(page.locator("#revealSecondaryButton")).toBeHidden();

  currentRoom = stealRevealRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  await expect(page.locator("#revealEyebrow")).toHaveText("Deze kaart heb je gestolen");
  await expect(page.locator("#revealCard")).toContainText("Dino Sprint");
  await expect(page.locator("#revealButton")).toHaveText("Verder spelen");

  currentRoom = choiceRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  await expect(page.locator("#multiplayerModal")).toBeHidden();
  await expect(page.locator("#drawReveal")).toBeVisible();
  await expect(page.locator("#revealEyebrow")).toHaveText("Triceratops Blik");
  await expect(page.locator("#revealCard")).toContainText("Vulkaan Shuffle");
  const choiceColors = await page.locator("#drawReveal").evaluate((reveal) => {
    return {
      title: getComputedStyle(reveal.querySelector("#revealEyebrow")).color,
      text: getComputedStyle(reveal.querySelector("#revealText")).color,
      hostBackground: getComputedStyle(reveal.querySelector(".draw-reveal__panel")).backgroundColor
    };
  });
  expect(choiceColors.title).toBe("rgb(142, 224, 170)");
  expect(choiceColors.text).toBe("rgb(185, 170, 151)");
  expect(choiceColors.hostBackground).toBe("rgb(26, 36, 31)");
  await page.locator("#revealButton").click();
  await expect(page.locator("#drawReveal")).toBeVisible();
  await expect(page.locator("#revealEyebrow")).toHaveText("Reageer op aanval");
  await expect(page.locator("#revealText")).toContainText("Nova valt je aan");
  await expect(page.locator("#revealCard")).toContainText("Brul Terug");
  await expect(page.locator("#revealButton")).toHaveText("Niets doen");

  currentRoom = loserRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  await expect(page.locator("#revealEyebrow")).toHaveText("Verloren");
  await expect(page.locator("#revealCard")).toContainText("Nova wint");
  await expect(page.locator("#revealCard img")).toHaveAttribute("src", "assets/endings/defeat-dino.png");

  currentRoom = winnerRoom;
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
  await expect(page.locator("#revealEyebrow")).toHaveText("Overwinning");
  await expect(page.locator("#revealCard")).toContainText("Gefeliciteerd!");
  await expect(page.locator("#revealCard img")).toHaveAttribute("src", "assets/endings/victory-dino.png");
  await expect(page.locator("#revealButton")).toHaveText("Nieuwe room maken");
  if (await page.locator("#newGameButton").isVisible()) {
    await expect(page.locator("#newGameButton")).toHaveText("Nieuw online spel");
    await page.locator("#newGameButton").click();
  } else {
    await page.locator("#mobileMenuButton").click();
    await expect(page.locator("#mobileNewGameButton")).toHaveText("Nieuw online spel");
    await page.locator("#mobileNewGameButton").click();
  }
  await expect(page.locator("#multiplayerLobby")).toBeVisible();
  await expect(page.locator("#activeRoomCode")).toHaveText("BRUL99");
  await expect(page).toHaveURL(/\?room=BRUL99$/);
  await expect(page.locator("#multiplayerPlayers li")).toHaveCount(1);
  await expect(page.locator("#multiplayerStartButton")).toBeDisabled();
  await expect(page.locator("#startModal")).toBeVisible();
  await expect(page.locator("#opponents .opponent-seat")).toHaveCount(0);
  await expect(page.locator("#playerHand .card-button")).toHaveCount(0);
  await expect(page.locator("#deckCount")).toHaveText("0");
  await expect(page.locator("#discardTop")).toHaveText("Nog leeg");
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
