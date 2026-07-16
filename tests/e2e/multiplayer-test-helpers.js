const http = require("node:http");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { createRequestHandler } = require("../../server/server");
const { createRoomService } = require("../../server/rooms");

const gameUrl = pathToFileURL(path.resolve(__dirname, "../..", "index.html")).href;

function card(id, type, name, kind = "action") {
  return { id, type, name, text: `${name} testkaart.`, kind };
}

async function startTestRoom(names) {
  const service = createRoomService();
  const created = service.createRoom(names[0]);
  const sessions = [{ name: names[0], token: created.token, playerId: created.room.viewerId }];
  for (const name of names.slice(1)) {
    const joined = service.joinRoom(created.room.code, name);
    sessions.push({ name, token: joined.token, playerId: joined.room.viewerId });
  }
  service.startRoom(created.room.code, created.token);

  const server = http.createServer(createRequestHandler(service));
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    apiBase: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => {
      server.closeAllConnections?.();
      server.close((error) => error ? reject(error) : resolve());
    }),
    code: created.room.code,
    room: service.getRoom(created.room.code),
    service,
    sessions
  };
}

async function openRoomPage(browser, testRoom, session, browserErrors, viewport = { width: 1280, height: 820 }) {
  const context = await browser.newContext({ locale: "nl-NL", viewport });
  const page = await context.newPage();
  const errors = [];
  browserErrors.push(errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.addInitScript(({ apiBase, code, token }) => {
    globalThis.ExplodingDinosMultiplayerConfig = { apiBase };
    sessionStorage.setItem("explodingDinosMultiplayer", JSON.stringify({ code, token }));
  }, { apiBase: testRoom.apiBase, code: testRoom.code, token: session.token });
  await page.goto(`${gameUrl}?room=${testRoom.code}`);
  await page.waitForFunction(() => globalThis.ExplodingDinosMultiplayer?.isActive());
  const startAnnouncement = page.locator("#revealEyebrow", { hasText: "De dino-race is beslist!" });
  if (await startAnnouncement.isVisible().catch(() => false)) await page.locator("#revealButton").click();
  return { context, page };
}

async function poll(page) {
  await page.evaluate(() => globalThis.ExplodingDinosMultiplayer.pollRoom());
}

module.exports = { card, openRoomPage, poll, startTestRoom };
