const assert = require("node:assert/strict");
const test = require("node:test");
const { createRoomService } = require("../server/rooms");

test("host maakt een room en een tweede speler joint", async () => {
  const service = createRoomService();
  const host = await service.createRoom("Tim");
  const guest = await service.joinRoom(host.room.code, "Nova");
  assert.equal(host.room.isHost, true);
  assert.equal(guest.room.players.length, 2);
  assert.equal((await service.viewRoom(host.room.code, host.token)).players[1].name, "Nova");
  assert.equal((await service.viewRoom(host.room.code, guest.token)).isHost, false);
});

test("room weigert dubbele namen en een zesde speler", async () => {
  const service = createRoomService();
  const host = await service.createRoom("Tim");
  await assert.rejects(service.joinRoom(host.room.code, "tim"), /naam wordt al gebruikt/);
  for (const name of ["A", "B", "C", "D"]) await service.joinRoom(host.room.code, name);
  await assert.rejects(service.joinRoom(host.room.code, "E"), /room zit vol/);
});

test("alleen een geldig spelerstoken kan een room bekijken", async () => {
  const service = createRoomService();
  const host = await service.createRoom("Tim");
  await assert.rejects(service.viewRoom(host.room.code, "fout-token"), /sessie is niet geldig/);
  assert.equal((await service.viewRoom(host.room.code, host.token)).viewerId, host.room.viewerId);
});

test("hostrol verhuist wanneer de host vertrekt", async () => {
  const service = createRoomService();
  const host = await service.createRoom("Tim");
  const guest = await service.joinRoom(host.room.code, "Nova");
  await service.leaveRoom(host.room.code, host.token);
  const room = await service.viewRoom(host.room.code, guest.token);
  assert.equal(room.isHost, true);
  assert.deepEqual(room.players.map((player) => player.name), ["Nova"]);
});

test("verlopen rooms worden automatisch opgeruimd", async () => {
  let timestamp = 1000;
  const service = createRoomService({ now: () => timestamp, roomLifetimeMs: 100 });
  const host = await service.createRoom("Tim");
  timestamp = 1101;
  assert.equal(await service.getRoom(host.room.code), null);
});

test("alleen de host start en iedere speler krijgt zijn eigen hand", async () => {
  const service = createRoomService();
  const host = await service.createRoom("Tim");
  const guest = await service.joinRoom(host.room.code, "Nova");
  await assert.rejects(service.startRoom(host.room.code, guest.token), /Alleen de host/);
  const hostRoom = await service.startRoom(host.room.code, host.token);
  const guestRoom = await service.viewRoom(host.room.code, guest.token);
  assert.equal(hostRoom.status, "playing");
  assert.equal(hostRoom.game.hand.length, 5);
  assert.equal(guestRoom.game.hand.length, 5);
  assert.notDeepEqual(hostRoom.game.hand.map((card) => card.id), guestRoom.game.hand.map((card) => card.id));
});

test("spelacties vereisen de actuele roomversie", async () => {
  const service = createRoomService();
  const host = await service.createRoom("Tim");
  const guest = await service.joinRoom(host.room.code, "Nova");
  const started = await service.startRoom(host.room.code, host.token);
  await service.updateRoom(host.room.code, (room) => { room.game.deck = [{ id: "safe-version-draw", type: "trike", name: "Triceratops Blik" }]; });
  const actorToken = started.game.currentPlayerId === started.viewerId ? host.token : guest.token;
  const nextPlayerId = started.game.players.find((player) => player.id !== started.game.currentPlayerId).id;
  await assert.rejects(service.performAction(host.room.code, actorToken, { type: "DRAW_CARD" }, started.version - 1), /intussen veranderd/);
  const changed = await service.performAction(host.room.code, actorToken, { type: "DRAW_CARD" }, started.version);
  assert.equal(changed.game.pending.type, "DRAW_REVEAL");
  const confirmed = await service.performAction(host.room.code, actorToken, { type: "CONFIRM_DRAW" }, changed.version);
  assert.equal(confirmed.game.currentPlayerId, nextPlayerId);
});

test("een afgelopen potje kan niet in dezelfde room worden herstart", async () => {
  const service = createRoomService();
  const host = await service.createRoom("Tim");
  await service.joinRoom(host.room.code, "Nova");
  await service.startRoom(host.room.code, host.token);
  await service.updateRoom(host.room.code, (room) => {
    room.status = "finished";
    room.game.winnerId = room.players[0].id;
  });
  await assert.rejects(service.startRoom(host.room.code, host.token), /nieuwe room/);
});

test("alleen de host kan een lopend spel voor iedereen stoppen", async () => {
  const service = createRoomService();
  const host = await service.createRoom("Tim");
  const guest = await service.joinRoom(host.room.code, "Nova");
  await service.startRoom(host.room.code, host.token);
  await assert.rejects(service.stopRoom(host.room.code, guest.token), /Alleen de host/);
  const lobby = await service.stopRoom(host.room.code, host.token);
  const guestLobby = await service.viewRoom(host.room.code, guest.token);
  assert.equal(lobby.status, "lobby");
  assert.equal(lobby.game, null);
  assert.equal(guestLobby.status, "lobby");
  assert.equal(guestLobby.players.length, 2);
});

test("polling laat een verlopen reactievenster servergestuurd passen en reconnect veilig hervatten", async () => {
  let timestamp = 1_000;
  const service = createRoomService({ now: () => timestamp });
  const created = await service.createRoom("A");
  await service.joinRoom(created.room.code, "B");
  await service.startRoom(created.room.code, created.token);
  let internal = await service.getRoom(created.room.code);
  const actorId = internal.game.currentPlayerId;
  const actor = internal.players.find((player) => player.id === actorId);
  const reactor = internal.players.find((player) => player.id !== actorId);
  await service.updateRoom(created.room.code, (room) => {
    room.game.hands[actorId] = [{ id: "trike-timeout", type: "trike", name: "Triceratops Blik" }];
    room.game.deck = [{ id: "secret-top", type: "sprint", name: "Geheim" }];
  });
  let view = await service.viewRoom(created.room.code, actor.token);
  await service.performAction(created.room.code, actor.token, { type: "PLAY_CARD", cardId: "trike-timeout" }, view.version);
  view = await service.viewRoom(created.room.code, actor.token);
  await service.performAction(created.room.code, actor.token, { type: "CONFIRM_PLAY" }, view.version);
  const beforeTimeout = await service.viewRoom(created.room.code, reactor.token);
  assert.equal(beforeTimeout.game.pending.type, "ACTION_REACTION");
  timestamp += 30_001;
  const reconnected = await service.viewRoom(created.room.code, actor.token);
  assert.equal(reconnected.game.pending.type, "PEEK");
  assert.equal(reconnected.version, beforeTimeout.version + 1);
  internal = await service.getRoom(created.room.code);
  assert.equal(internal.game.discard.filter((card) => card.id === "trike-timeout").length, 1);
});
