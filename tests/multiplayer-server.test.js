const assert = require("node:assert/strict");
const test = require("node:test");
const { createRoomService } = require("../server/rooms");

test("host maakt een room en een tweede speler joint", () => {
  const service = createRoomService();
  const host = service.createRoom("Tim");
  const guest = service.joinRoom(host.room.code, "Nova");

  assert.equal(host.room.isHost, true);
  assert.equal(guest.room.players.length, 2);
  assert.equal(service.viewRoom(host.room.code, host.token).players[1].name, "Nova");
  assert.equal(service.viewRoom(host.room.code, guest.token).isHost, false);
});

test("room weigert dubbele namen en een zesde speler", () => {
  const service = createRoomService();
  const host = service.createRoom("Tim");
  assert.throws(() => service.joinRoom(host.room.code, "tim"), /naam wordt al gebruikt/);

  ["A", "B", "C", "D"].forEach((name) => service.joinRoom(host.room.code, name));
  assert.throws(() => service.joinRoom(host.room.code, "E"), /room zit vol/);
});

test("alleen een geldig spelerstoken kan een room bekijken", () => {
  const service = createRoomService();
  const host = service.createRoom("Tim");

  assert.throws(() => service.viewRoom(host.room.code, "fout-token"), /sessie is niet geldig/);
  assert.equal(service.viewRoom(host.room.code, host.token).viewerId, host.room.viewerId);
});

test("hostrol verhuist wanneer de host vertrekt", () => {
  const service = createRoomService();
  const host = service.createRoom("Tim");
  const guest = service.joinRoom(host.room.code, "Nova");

  service.leaveRoom(host.room.code, host.token);
  const room = service.viewRoom(host.room.code, guest.token);
  assert.equal(room.isHost, true);
  assert.deepEqual(room.players.map((player) => player.name), ["Nova"]);
});

test("verlopen rooms worden automatisch opgeruimd", () => {
  let timestamp = 1000;
  const service = createRoomService({ now: () => timestamp, roomLifetimeMs: 100 });
  const host = service.createRoom("Tim");
  timestamp = 1101;

  assert.equal(service.getRoom(host.room.code), null);
});

test("alleen de host start en iedere speler krijgt zijn eigen hand", () => {
  const service = createRoomService();
  const host = service.createRoom("Tim");
  const guest = service.joinRoom(host.room.code, "Nova");

  assert.throws(() => service.startRoom(host.room.code, guest.token), /Alleen de host/);
  const hostRoom = service.startRoom(host.room.code, host.token);
  const guestRoom = service.viewRoom(host.room.code, guest.token);

  assert.equal(hostRoom.status, "playing");
  assert.equal(hostRoom.game.hand.length, 8);
  assert.equal(guestRoom.game.hand.length, 8);
  assert.notDeepEqual(hostRoom.game.hand.map((card) => card.id), guestRoom.game.hand.map((card) => card.id));
});

test("spelacties vereisen de actuele roomversie", () => {
  const service = createRoomService();
  const host = service.createRoom("Tim");
  const guest = service.joinRoom(host.room.code, "Nova");
  const started = service.startRoom(host.room.code, host.token);
  const actorToken = started.game.currentPlayerId === started.viewerId ? host.token : guest.token;
  const nextPlayerId = started.game.players.find((player) => player.id !== started.game.currentPlayerId).id;

  assert.throws(
    () => service.performAction(host.room.code, actorToken, { type: "DRAW_CARD" }, started.version - 1),
    /intussen veranderd/
  );
  const changed = service.performAction(host.room.code, actorToken, { type: "DRAW_CARD" }, started.version);
  assert.equal(changed.game.pending.type, "DRAW_REVEAL");
  const confirmed = service.performAction(host.room.code, actorToken, { type: "CONFIRM_DRAW" }, changed.version);
  assert.equal(confirmed.game.currentPlayerId, nextPlayerId);
});

test("een afgelopen potje kan niet in dezelfde room worden herstart", () => {
  const service = createRoomService();
  const host = service.createRoom("Tim");
  service.joinRoom(host.room.code, "Nova");
  service.startRoom(host.room.code, host.token);
  const internal = service.getRoom(host.room.code);
  internal.status = "finished";
  internal.game.winnerId = internal.players[0].id;

  assert.throws(
    () => service.startRoom(host.room.code, host.token),
    /nieuwe room/
  );
});

test("alleen de host kan een lopend spel voor iedereen stoppen", () => {
  const service = createRoomService();
  const host = service.createRoom("Tim");
  const guest = service.joinRoom(host.room.code, "Nova");
  service.startRoom(host.room.code, host.token);

  assert.throws(() => service.stopRoom(host.room.code, guest.token), /Alleen de host/);
  const lobby = service.stopRoom(host.room.code, host.token);
  const guestLobby = service.viewRoom(host.room.code, guest.token);

  assert.equal(lobby.status, "lobby");
  assert.equal(lobby.game, null);
  assert.equal(guestLobby.status, "lobby");
  assert.equal(guestLobby.players.length, 2);
});
