const assert = require("node:assert/strict");
const test = require("node:test");
const { MemoryRoomStore, RedisRoomStore, ROOM_SCHEMA_VERSION, parseRoom } = require("../server/room-store");
const { createRoomService } = require("../server/rooms");

class FakeRedisClient {
  constructor(database = new Map(), clock = () => Date.now()) {
    this.database = database;
    this.clock = clock;
    this.watched = new Map();
  }

  duplicate() { return new FakeRedisClient(this.database, this.clock); }
  async connect() {}
  destroy() {}
  async watch(key) { this.watched.set(key, this.database.get(key)?.version ?? 0); }
  async unwatch() { this.watched.clear(); }
  async get(key) {
    const entry = this.database.get(key);
    if (entry?.expiresAt <= this.clock()) {
      this.database.delete(key);
      return null;
    }
    return entry?.value ?? null;
  }
  async set(key, value, options = {}) {
    if (options.NX && this.database.has(key)) return null;
    const version = (this.database.get(key)?.version ?? 0) + 1;
    this.database.set(key, { value, expiresAt: this.clock() + options.PX, version });
    return "OK";
  }
  multi() {
    let operation;
    return {
      set: (key, value, options) => { operation = { key, value, options }; return this; },
      del: (key) => { operation = { key, delete: true }; return this; },
      exec: async () => {
        for (const [key, version] of this.watched) {
          if ((this.database.get(key)?.version ?? 0) !== version) return null;
        }
        if (operation.delete) this.database.delete(operation.key);
        else await this.set(operation.key, operation.value, operation.options);
        return ["OK"];
      }
    };
  }
}

test("een room overleeft een nieuwe roomservice met dezelfde opslag", async () => {
  const store = new MemoryRoomStore();
  const firstServer = createRoomService({ store });
  const host = await firstServer.createRoom("Tim");
  const guest = await firstServer.joinRoom(host.room.code, "Nova");
  const started = await firstServer.startRoom(host.room.code, host.token);

  const restartedServer = createRoomService({ store });
  const restoredHost = await restartedServer.viewRoom(host.room.code, host.token);
  const restoredGuest = await restartedServer.viewRoom(host.room.code, guest.token);
  assert.equal(restoredHost.status, "playing");
  assert.equal(restoredHost.version, started.version);
  assert.equal(restoredHost.game.hand.length, 5);
  assert.equal(restoredGuest.game.hand.length, 5);
  assert.notDeepEqual(restoredHost.game.hand.map((card) => card.id), restoredGuest.game.hand.map((card) => card.id));
});

test("twee acties op dezelfde roomversie worden atomisch gescheiden", async () => {
  const service = createRoomService();
  const host = await service.createRoom("Tim");
  const guest = await service.joinRoom(host.room.code, "Nova");
  const started = await service.startRoom(host.room.code, host.token);
  await service.updateRoom(host.room.code, (room) => {
    room.game.deck = [
      { id: "safe-a", type: "trike", name: "Triceratops Blik" },
      { id: "safe-b", type: "sprint", name: "Dino Sprint" }
    ];
  });
  const actorToken = started.game.currentPlayerId === started.viewerId ? host.token : guest.token;
  const results = await Promise.allSettled([
    service.performAction(host.room.code, actorToken, { type: "DRAW_CARD" }, started.version),
    service.performAction(host.room.code, actorToken, { type: "DRAW_CARD" }, started.version)
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected" && result.reason.statusCode === 409).length, 1);
});

test("Redis-adapter bewaart schema, TTL en updates", async () => {
  let timestamp = 10_000;
  const client = new FakeRedisClient(new Map(), () => timestamp);
  const store = new RedisRoomStore(client, { now: () => timestamp });
  const room = { schemaVersion: ROOM_SCHEMA_VERSION, code: "ABC123", version: 1, expiresAt: timestamp + 5_000 };
  assert.equal(await store.create(room), true);
  assert.equal((await store.get(room.code)).version, 1);
  const changed = await store.transact(room.code, (current) => {
    current.version += 1;
    return { room: current, value: current.version };
  });
  assert.deepEqual(changed, { found: true, value: 2 });
  timestamp += 5_001;
  assert.equal(await store.get(room.code), null);
});

test("onbekende opgeslagen schemaversies worden beheerst geweigerd", () => {
  assert.throws(() => parseRoom(JSON.stringify({ schemaVersion: 99 })), /onbekende opslagversie/);
});
