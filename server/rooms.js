const { randomBytes } = require("node:crypto");
const { advanceExpiredReaction, applyAction, publicGame, startGame } = require("./game-engine");
const { MemoryRoomStore, ROOM_SCHEMA_VERSION } = require("./room-store");

const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 6) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => ROOM_ALPHABET[byte % ROOM_ALPHABET.length]).join("");
}

function randomToken() {
  return randomBytes(24).toString("base64url");
}

function cleanName(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 24);
}

function fail(message, statusCode) {
  throw Object.assign(new Error(message), { statusCode });
}

function publicRoom(room, viewerToken) {
  const viewer = room.players.find((player) => player.token === viewerToken);
  return {
    code: room.code,
    status: room.status,
    version: room.version,
    createdAt: room.createdAt,
    expiresAt: room.expiresAt,
    viewerId: viewer?.id ?? null,
    isHost: viewer?.id === room.hostId,
    players: room.players.map(({ id, name, joinedAt }) => ({ id, name, joinedAt })),
    game: room.game && viewer ? publicGame(room.game, viewer.id) : null
  };
}

function createRoomService({ now = () => Date.now(), roomLifetimeMs = 12 * 60 * 60 * 1000, store } = {}) {
  const roomStore = store ?? new MemoryRoomStore({ now });

  function addPlayer(room, name) {
    const player = { id: `player-${randomToken().slice(0, 8)}`, name, token: randomToken(), joinedAt: now() };
    room.players.push(player);
    room.version += 1;
    room.expiresAt = now() + roomLifetimeMs;
    return player;
  }

  async function requireRoom(code) {
    const room = await roomStore.get(code);
    if (!room) fail("Deze room bestaat niet of is verlopen.", 404);
    return room;
  }

  async function changeRoom(code, update) {
    const outcome = await roomStore.transact(code, update);
    if (!outcome.found) fail("Deze room bestaat niet of is verlopen.", 404);
    return outcome.value;
  }

  async function createRoom(name) {
    const playerName = cleanName(name);
    if (!playerName) fail("Vul een spelersnaam in.", 400);
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const code = randomCode();
      const room = {
        schemaVersion: ROOM_SCHEMA_VERSION,
        code,
        status: "lobby",
        version: 0,
        hostId: null,
        players: [],
        game: null,
        createdAt: now(),
        expiresAt: now() + roomLifetimeMs
      };
      const host = addPlayer(room, playerName);
      room.hostId = host.id;
      if (await roomStore.create(room)) return { room: publicRoom(room, host.token), token: host.token };
    }
    fail("Er kon geen unieke roomcode worden gemaakt.", 503);
  }

  async function joinRoom(code, name) {
    const playerName = cleanName(name);
    if (!playerName) fail("Vul een spelersnaam in.", 400);
    return changeRoom(code, (room) => {
      if (room.status !== "lobby") fail("Dit potje is al gestart.", 409);
      if (room.players.length >= 5) fail("Deze room zit vol.", 409);
      if (room.players.some((player) => player.name.toLowerCase() === playerName.toLowerCase())) fail("Deze naam wordt al gebruikt in de room.", 409);
      const player = addPlayer(room, playerName);
      return { room, value: { room: publicRoom(room, player.token), token: player.token } };
    });
  }

  async function viewRoom(code, token) {
    return changeRoom(code, (room) => {
      if (!room.players.some((player) => player.token === token)) fail("Je spelerssessie is niet geldig.", 401);
      if (room.game && advanceExpiredReaction(room.game, now())) room.version += 1;
      return { room, value: publicRoom(room, token) };
    });
  }

  async function leaveRoom(code, token) {
    const existing = await roomStore.get(code);
    if (!existing) return null;
    return changeRoom(code, (room) => {
      const playerIndex = room.players.findIndex((player) => player.token === token);
      if (playerIndex === -1) fail("Je spelerssessie is niet geldig.", 401);
      if (room.status === "playing") fail("Een gestart potje kun je nog niet verlaten; sluit de lobby en verbind later opnieuw.", 409);
      const [player] = room.players.splice(playerIndex, 1);
      if (room.players.length === 0) return { room: null, value: null };
      if (room.hostId === player.id) room.hostId = room.players[0].id;
      room.version += 1;
      return { room, value: publicRoom(room, token) };
    });
  }

  async function startRoom(code, token) {
    return changeRoom(code, (room) => {
      const viewer = room.players.find((player) => player.token === token);
      if (!viewer) fail("Je spelerssessie is niet geldig.", 401);
      if (viewer.id !== room.hostId) fail("Alleen de host kan het potje starten.", 403);
      if (room.status === "playing") fail("Dit potje is al gestart.", 409);
      if (room.status === "finished") fail("Maak voor een nieuw potje een nieuwe room.", 409);
      if (room.players.length < 2) fail("Er zijn minimaal twee spelers nodig.", 409);
      room.game = startGame(room.players);
      room.status = "playing";
      room.version += 1;
      return { room, value: publicRoom(room, token) };
    });
  }

  async function stopRoom(code, token) {
    return changeRoom(code, (room) => {
      const viewer = room.players.find((player) => player.token === token);
      if (!viewer) fail("Je spelerssessie is niet geldig.", 401);
      if (viewer.id !== room.hostId) fail("Alleen de host kan het potje stoppen.", 403);
      if (room.status !== "playing" && room.status !== "finished") fail("Er is geen gestart potje om te stoppen.", 409);
      room.game = null;
      room.status = "lobby";
      room.version += 1;
      room.expiresAt = now() + roomLifetimeMs;
      return { room, value: publicRoom(room, token) };
    });
  }

  async function performAction(code, token, action, expectedVersion) {
    return changeRoom(code, (room) => {
      const viewer = room.players.find((player) => player.token === token);
      if (!viewer) fail("Je spelerssessie is niet geldig.", 401);
      if (room.status !== "playing" || !room.game) fail("Dit potje is nog niet gestart.", 409);
      if (advanceExpiredReaction(room.game, now())) room.version += 1;
      if (Number(expectedVersion) !== room.version) fail("Het spel is intussen veranderd; probeer opnieuw.", 409);
      applyAction(room.game, viewer.id, action, now());
      room.version += 1;
      if (room.game.winnerId) room.status = "finished";
      room.expiresAt = now() + roomLifetimeMs;
      return { room, value: publicRoom(room, token) };
    });
  }

  async function updateRoom(code, update) {
    return changeRoom(code, (room) => {
      update(room);
      return { room, value: room };
    });
  }

  return { createRoom, getRoom: (code) => roomStore.get(code), joinRoom, leaveRoom, performAction, startRoom, stopRoom, updateRoom, viewRoom };
}

module.exports = { createRoomService, publicRoom };
