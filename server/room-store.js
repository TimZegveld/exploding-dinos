const ROOM_SCHEMA_VERSION = 1;

function roomTtl(room, now = Date.now()) {
  return Math.max(1, Number(room.expiresAt) - now);
}

function parseRoom(serialized) {
  if (!serialized) return null;
  const room = JSON.parse(serialized);
  if (room.schemaVersion !== ROOM_SCHEMA_VERSION) {
    throw Object.assign(new Error("Deze room gebruikt een onbekende opslagversie."), { statusCode: 503 });
  }
  return room;
}

class MemoryRoomStore {
  constructor({ now = () => Date.now() } = {}) {
    this.now = now;
    this.rooms = new Map();
  }

  removeExpired() {
    const timestamp = this.now();
    for (const [code, room] of this.rooms) {
      if (room.expiresAt <= timestamp) this.rooms.delete(code);
    }
  }

  async create(room) {
    this.removeExpired();
    if (this.rooms.has(room.code)) return false;
    this.rooms.set(room.code, room);
    return true;
  }

  async get(code) {
    this.removeExpired();
    return this.rooms.get(String(code ?? "").toUpperCase()) ?? null;
  }

  async transact(code, update) {
    this.removeExpired();
    const key = String(code ?? "").toUpperCase();
    const current = this.rooms.get(key);
    if (!current) return { found: false, value: null };
    const outcome = update(current);
    if (outcome.write === false) return { found: true, value: outcome.value };
    if (outcome.room) this.rooms.set(key, outcome.room);
    else this.rooms.delete(key);
    return { found: true, value: outcome.value };
  }
}

class RedisRoomStore {
  constructor(client, { prefix = "exploding-dinos:room:", now = () => Date.now(), retries = 4 } = {}) {
    this.client = client;
    this.prefix = prefix;
    this.now = now;
    this.retries = retries;
  }

  key(code) {
    return `${this.prefix}${String(code ?? "").toUpperCase()}`;
  }

  async create(room) {
    const result = await this.client.set(this.key(room.code), JSON.stringify(room), {
      NX: true,
      PX: roomTtl(room, this.now())
    });
    return result === "OK";
  }

  async get(code) {
    return parseRoom(await this.client.get(this.key(code)));
  }

  async transact(code, update) {
    const key = this.key(code);
    for (let attempt = 0; attempt < this.retries; attempt += 1) {
      const isolated = this.client.duplicate();
      isolated.on?.("error", () => { /* De hoofdclient logt verbindingsfouten centraal. */ });
      await isolated.connect();
      try {
        await isolated.watch(key);
        const current = parseRoom(await isolated.get(key));
        if (!current) {
          await isolated.unwatch();
          return { found: false, value: null };
        }
        const outcome = update(current);
        if (outcome.write === false) {
          await isolated.unwatch();
          return { found: true, value: outcome.value };
        }
        const transaction = isolated.multi();
        if (outcome.room) {
          transaction.set(key, JSON.stringify(outcome.room), { PX: roomTtl(outcome.room, this.now()) });
        } else {
          transaction.del(key);
        }
        const committed = await transaction.exec();
        if (committed !== null) return { found: true, value: outcome.value };
      } finally {
        isolated.destroy();
      }
    }
    throw Object.assign(new Error("De room veranderde tegelijk; probeer opnieuw."), { statusCode: 409 });
  }
}

async function createRoomStoreFromEnvironment(env = process.env, logger = console) {
  const mode = env.ROOM_STORE || (env.REDIS_URL ? "redis" : "memory");
  if (mode === "memory") {
    logger.info?.("Roomopslag: tijdelijk geheugen.");
    return new MemoryRoomStore();
  }
  if (mode !== "redis") throw new Error(`Onbekende ROOM_STORE: ${mode}`);
  if (!env.REDIS_URL) throw new Error("ROOM_STORE=redis vereist REDIS_URL; de server start niet met tijdelijke fallback.");
  const { createClient } = require("redis");
  const client = createClient({ url: env.REDIS_URL });
  client.on("error", (error) => logger.error?.("Redis-roomopslagfout:", error.message));
  await client.connect();
  logger.info?.("Roomopslag: Redis/Valkey met TTL.");
  return new RedisRoomStore(client);
}

module.exports = { createRoomStoreFromEnvironment, MemoryRoomStore, RedisRoomStore, ROOM_SCHEMA_VERSION, parseRoom, roomTtl };
