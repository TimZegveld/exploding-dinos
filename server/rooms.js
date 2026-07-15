const { randomBytes } = require("node:crypto");
const { advanceExpiredReaction, applyAction, publicGame, startGame } = require("./game-engine");

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

function createRoomService({ now = () => Date.now(), roomLifetimeMs = 12 * 60 * 60 * 1000 } = {}) {
  const rooms = new Map();

  function removeExpired() {
    const timestamp = now();
    for (const [code, room] of rooms) {
      if (room.expiresAt <= timestamp) rooms.delete(code);
    }
  }

  function getRoom(code) {
    removeExpired();
    return rooms.get(String(code ?? "").toUpperCase()) ?? null;
  }

  function addPlayer(room, name) {
    const player = {
      id: `player-${randomToken().slice(0, 8)}`,
      name,
      token: randomToken(),
      joinedAt: now()
    };
    room.players.push(player);
    room.version += 1;
    room.expiresAt = now() + roomLifetimeMs;
    return player;
  }

  function createRoom(name) {
    const playerName = cleanName(name);
    if (!playerName) throw Object.assign(new Error("Vul een spelersnaam in."), { statusCode: 400 });

    removeExpired();
    let code;
    do code = randomCode(); while (rooms.has(code));

    const room = {
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
    rooms.set(code, room);
    return { room: publicRoom(room, host.token), token: host.token };
  }

  function joinRoom(code, name) {
    const room = getRoom(code);
    if (!room) throw Object.assign(new Error("Deze room bestaat niet of is verlopen."), { statusCode: 404 });
    if (room.status !== "lobby") throw Object.assign(new Error("Dit potje is al gestart."), { statusCode: 409 });
    if (room.players.length >= 5) throw Object.assign(new Error("Deze room zit vol."), { statusCode: 409 });
    const playerName = cleanName(name);
    if (!playerName) throw Object.assign(new Error("Vul een spelersnaam in."), { statusCode: 400 });
    if (room.players.some((player) => player.name.toLowerCase() === playerName.toLowerCase())) {
      throw Object.assign(new Error("Deze naam wordt al gebruikt in de room."), { statusCode: 409 });
    }
    const player = addPlayer(room, playerName);
    return { room: publicRoom(room, player.token), token: player.token };
  }

  function viewRoom(code, token) {
    const room = getRoom(code);
    if (!room) throw Object.assign(new Error("Deze room bestaat niet of is verlopen."), { statusCode: 404 });
    if (!room.players.some((player) => player.token === token)) {
      throw Object.assign(new Error("Je spelerssessie is niet geldig."), { statusCode: 401 });
    }
    if (room.game && advanceExpiredReaction(room.game, now())) room.version += 1;
    return publicRoom(room, token);
  }

  function leaveRoom(code, token) {
    const room = getRoom(code);
    if (!room) return null;
    const playerIndex = room.players.findIndex((player) => player.token === token);
    if (playerIndex === -1) throw Object.assign(new Error("Je spelerssessie is niet geldig."), { statusCode: 401 });
    if (room.status === "playing") {
      throw Object.assign(new Error("Een gestart potje kun je nog niet verlaten; sluit de lobby en verbind later opnieuw."), { statusCode: 409 });
    }
    const [player] = room.players.splice(playerIndex, 1);
    if (room.players.length === 0) {
      rooms.delete(room.code);
      return null;
    }
    if (room.hostId === player.id) room.hostId = room.players[0].id;
    room.version += 1;
    return publicRoom(room, token);
  }

  function startRoom(code, token) {
    const room = getRoom(code);
    if (!room) throw Object.assign(new Error("Deze room bestaat niet of is verlopen."), { statusCode: 404 });
    const viewer = room.players.find((player) => player.token === token);
    if (!viewer) throw Object.assign(new Error("Je spelerssessie is niet geldig."), { statusCode: 401 });
    if (viewer.id !== room.hostId) throw Object.assign(new Error("Alleen de host kan het potje starten."), { statusCode: 403 });
    if (room.status === "playing") throw Object.assign(new Error("Dit potje is al gestart."), { statusCode: 409 });
    if (room.status === "finished") throw Object.assign(new Error("Maak voor een nieuw potje een nieuwe room."), { statusCode: 409 });
    if (room.players.length < 2) throw Object.assign(new Error("Er zijn minimaal twee spelers nodig."), { statusCode: 409 });
    room.game = startGame(room.players);
    room.status = "playing";
    room.version += 1;
    return publicRoom(room, token);
  }

  function stopRoom(code, token) {
    const room = getRoom(code);
    if (!room) throw Object.assign(new Error("Deze room bestaat niet of is verlopen."), { statusCode: 404 });
    const viewer = room.players.find((player) => player.token === token);
    if (!viewer) throw Object.assign(new Error("Je spelerssessie is niet geldig."), { statusCode: 401 });
    if (viewer.id !== room.hostId) throw Object.assign(new Error("Alleen de host kan het potje stoppen."), { statusCode: 403 });
    if (room.status !== "playing" && room.status !== "finished") {
      throw Object.assign(new Error("Er is geen gestart potje om te stoppen."), { statusCode: 409 });
    }
    room.game = null;
    room.status = "lobby";
    room.version += 1;
    room.expiresAt = now() + roomLifetimeMs;
    return publicRoom(room, token);
  }

  function performAction(code, token, action, expectedVersion) {
    const room = getRoom(code);
    if (!room) throw Object.assign(new Error("Deze room bestaat niet of is verlopen."), { statusCode: 404 });
    const viewer = room.players.find((player) => player.token === token);
    if (!viewer) throw Object.assign(new Error("Je spelerssessie is niet geldig."), { statusCode: 401 });
    if (room.status !== "playing" || !room.game) throw Object.assign(new Error("Dit potje is nog niet gestart."), { statusCode: 409 });
    if (advanceExpiredReaction(room.game, now())) room.version += 1;
    if (Number(expectedVersion) !== room.version) {
      throw Object.assign(new Error("Het spel is intussen veranderd; probeer opnieuw."), { statusCode: 409 });
    }
    applyAction(room.game, viewer.id, action, now());
    room.version += 1;
    if (room.game.winnerId) room.status = "finished";
    room.expiresAt = now() + roomLifetimeMs;
    return publicRoom(room, token);
  }

  return { createRoom, getRoom, joinRoom, leaveRoom, performAction, removeExpired, startRoom, stopRoom, viewRoom };
}

module.exports = { createRoomService };
