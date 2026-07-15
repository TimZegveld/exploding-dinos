const { chromium } = require("playwright");

const FRONTEND_URL = "https://timzegveld.github.io/exploding-dinos/";
const API_URL = "https://exploding-dinos-api.onrender.com";

async function roomView(page) {
  return page.evaluate(async ({ apiUrl }) => {
    const session = JSON.parse(sessionStorage.getItem("explodingDinosMultiplayer"));
    const response = await fetch(`${apiUrl}/api/rooms/${session.code}`, {
      headers: { Authorization: `Bearer ${session.token}` }
    });
    if (!response.ok) throw new Error(`Room ophalen faalde: ${response.status}`);
    return (await response.json()).room;
  }, { apiUrl: API_URL });
}

async function act(page, action) {
  return page.evaluate(async ({ apiUrl, action }) => {
    const session = JSON.parse(sessionStorage.getItem("explodingDinosMultiplayer"));
    const headers = { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json" };
    const current = await fetch(`${apiUrl}/api/rooms/${session.code}`, { headers });
    const currentRoom = (await current.json()).room;
    const response = await fetch(`${apiUrl}/api/rooms/${session.code}/actions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ expectedVersion: currentRoom.version, action })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Actie faalde: ${response.status}`);
    return result.room;
  }, { apiUrl: API_URL, action });
}

async function poll(page) {
  await page.evaluate(() => window.ExplodingDinosMultiplayer.pollRoom());
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const hostContext = await browser.newContext({ locale: "nl-NL" });
  const guestContext = await browser.newContext({ locale: "nl-NL" });
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();
  const errors = [];
  for (const page of [host, guest]) {
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  }

  let roomCode = null;
  const report = { frontend: FRONTEND_URL, api: API_URL, playedCard: null, refreshed: false, meteorPublic: false, shelterPublic: false, placementSecret: false };
  try {
    const runId = String(Date.now()).slice(-6);
    const health = await host.request.get(`${API_URL}/api/health`, { headers: { Origin: "https://timzegveld.github.io" } });
    if (!health.ok()) throw new Error(`API-health faalde: ${health.status()}`);
    report.health = await health.json();
    report.cors = health.headers()["access-control-allow-origin"];
    if (report.cors !== "https://timzegveld.github.io") throw new Error(`Onverwachte CORS-origin: ${report.cors}`);

    await host.goto(FRONTEND_URL, { waitUntil: "domcontentloaded" });
    await host.locator("#openMultiplayerButton").click();
    await host.locator("#multiplayerName").fill(`RookHost${runId}`);
    await host.locator("#createRoomButton").click();
    await host.waitForFunction(() => /^[A-Z0-9]{6}$/.test(document.querySelector("#activeRoomCode")?.textContent?.trim() ?? ""), null, { timeout: 90000 });
    roomCode = (await host.locator("#activeRoomCode").textContent()).trim();
    report.roomCode = roomCode;

    await guest.goto(`${FRONTEND_URL}?room=${roomCode}`, { waitUntil: "domcontentloaded" });
    await guest.locator("#multiplayerName").fill(`RookGast${runId}`);
    await guest.locator("#joinRoomButton").click();
    await guest.locator("#multiplayerLobby").waitFor({ state: "visible", timeout: 90000 });
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await poll(host);
      if (await host.locator("#multiplayerStartButton").isEnabled()) break;
      await host.waitForTimeout(500);
    }
    if (!(await host.locator("#multiplayerStartButton").isEnabled())) {
      const debugRoom = await roomView(host);
      throw new Error(`Host zag de tweede speler niet op tijd. API-spelers=${debugRoom.players.length}; hoststatus=${await host.locator("#lobbyStatus").textContent()}; gaststatus=${await guest.locator("#multiplayerStatus").textContent()}`);
    }
    await host.locator("#multiplayerStartButton").click();
    await host.locator("#gameTable").waitFor({ state: "visible" });
    await poll(guest);
    await guest.locator("#gameTable").waitFor({ state: "visible" });

    await Promise.all([host.reload({ waitUntil: "domcontentloaded" }), guest.reload({ waitUntil: "domcontentloaded" })]);
    await Promise.all([host.locator("#gameTable").waitFor({ state: "visible", timeout: 15000 }), guest.locator("#gameTable").waitFor({ state: "visible", timeout: 15000 })]);
    report.refreshed = true;

    const pages = [host, guest];
    let views = await Promise.all(pages.map(roomView));
    const actorIndex = views.findIndex((room) => room.viewerId === room.game.currentPlayerId);
    const safeTypes = new Set(["sprint", "trike", "volcano"]);
    const safeCard = views[actorIndex].game.hand.find((card) => views[actorIndex].game.playableCardIds.includes(card.id) && safeTypes.has(card.type));
    if (safeCard) {
      report.playedCard = safeCard.name;
      await act(pages[actorIndex], { type: "PLAY_CARD", cardId: safeCard.id });
      let actorView = await roomView(pages[actorIndex]);
      if (actorView.game.pending?.type === "PLAY_REVEAL") await act(pages[actorIndex], { type: "CONFIRM_PLAY" });
      actorView = await roomView(pages[actorIndex]);
      if (actorView.game.pending?.type === "PEEK") await act(pages[actorIndex], { type: "CONFIRM_PEEK" });
    }

    for (let step = 0; step < 180 && !report.placementSecret; step += 1) {
      views = await Promise.all(pages.map(roomView));
      const currentIndex = views.findIndex((room) => room.viewerId === room.game.currentPlayerId);
      if (currentIndex < 0) throw new Error("Geen actieve speler gevonden.");
      const actor = pages[currentIndex];
      const observer = pages[1 - currentIndex];
      const pending = views[currentIndex].game.pending;

      if (!pending) {
        await act(actor, { type: "DRAW_CARD" });
        continue;
      }
      if (pending.type === "DRAW_REVEAL") {
        await act(actor, { type: "CONFIRM_DRAW" });
        continue;
      }
      if (pending.type === "METEOR_REVEAL" && pending.phase === "meteor") {
        await Promise.all([poll(actor), poll(observer)]);
        if (!(await actor.locator("#revealCard").textContent()).includes("Meteorietinslag")) throw new Error("Actor ziet de meteoriet niet.");
        if (!(await observer.locator("#revealCard").textContent()).includes("Meteorietinslag")) throw new Error("Tegenstander ziet de meteoriet niet.");
        report.meteorPublic = true;
        if (!pending.survived) throw new Error("Eerste publieke meteoriet had onverwacht geen Schuilgrot.");
        await act(actor, { type: "CONFIRM_METEOR" });
        continue;
      }
      if (pending.type === "METEOR_REVEAL" && pending.phase === "shelter") {
        await Promise.all([poll(actor), poll(observer)]);
        const observerText = await observer.locator("#revealText").textContent();
        if (!(await observer.locator("#revealCard").textContent()).includes("Schuilgrot")) throw new Error("Tegenstander ziet de Schuilgrot niet.");
        if (!observerText.includes("geheim")) throw new Error("Tegenstander krijgt geen uitleg over de geheime terugplaatsing.");
        report.shelterPublic = true;
        await act(actor, { type: "CONFIRM_METEOR" });
        await Promise.all([poll(actor), poll(observer)]);
        const actorPlacementVisible = await actor.locator("#placementControls").isVisible();
        const observerPlacementVisible = await observer.locator("#placementControls").isVisible();
        report.placementSecret = actorPlacementVisible && !observerPlacementVisible;
        await act(actor, { type: "PLACE_METEOR", positionFromTop: 1 });
        break;
      }
      throw new Error(`Onverwachte publieke pending status: ${pending.type}`);
    }

    if (!report.meteorPublic || !report.shelterPublic || !report.placementSecret) throw new Error("Meteorietrooktest is niet volledig afgerond.");
    if (errors.length) throw new Error(`Browserconsole bevat fouten: ${errors.join(" | ")}`);
    console.log(JSON.stringify(report, null, 2));
  } finally {
    if (roomCode) {
      await host.evaluate(async ({ apiUrl, code }) => {
        const session = JSON.parse(sessionStorage.getItem("explodingDinosMultiplayer"));
        if (session?.token) await fetch(`${apiUrl}/api/rooms/${code}`, { method: "DELETE", headers: { Authorization: `Bearer ${session.token}` } }).catch(() => {});
      }, { apiUrl: API_URL, code: roomCode }).catch(() => {});
    }
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
