const http = require("node:http");
const { URL } = require("node:url");
const { createRoomService } = require("./rooms");

const rooms = createRoomService();

function json(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 16_384) reject(Object.assign(new Error("Request is te groot."), { statusCode: 413 }));
    });
    request.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(Object.assign(new Error("Ongeldige JSON."), { statusCode: 400 })); }
    });
    request.on("error", reject);
  });
}

function tokenFrom(request) {
  const value = request.headers.authorization ?? "";
  return value.startsWith("Bearer ") ? value.slice(7) : "";
}

function createRequestHandler(roomService = rooms) {
  return async (request, response) => {
    if (request.method === "OPTIONS") return json(response, 204, {});
    const url = new URL(request.url, "http://localhost");

    try {
      if (request.method === "GET" && url.pathname === "/api/health") {
        return json(response, 200, { ok: true });
      }
      if (request.method === "POST" && url.pathname === "/api/rooms") {
        const body = await readBody(request);
        return json(response, 201, roomService.createRoom(body.name));
      }

      const match = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)(?:\/(join|start|stop|actions))?$/i);
      if (match && request.method === "POST" && match[2] === "join") {
        const body = await readBody(request);
        return json(response, 200, roomService.joinRoom(match[1], body.name));
      }
      if (match && request.method === "GET" && !match[2]) {
        return json(response, 200, { room: roomService.viewRoom(match[1], tokenFrom(request)) });
      }
      if (match && request.method === "POST" && match[2] === "start") {
        return json(response, 200, { room: roomService.startRoom(match[1], tokenFrom(request)) });
      }
      if (match && request.method === "POST" && match[2] === "stop") {
        return json(response, 200, { room: roomService.stopRoom(match[1], tokenFrom(request)) });
      }
      if (match && request.method === "POST" && match[2] === "actions") {
        const body = await readBody(request);
        return json(response, 200, {
          room: roomService.performAction(match[1], tokenFrom(request), body.action, body.expectedVersion)
        });
      }
      if (match && request.method === "DELETE" && !match[2]) {
        return json(response, 200, { room: roomService.leaveRoom(match[1], tokenFrom(request)) });
      }
      return json(response, 404, { error: "Endpoint niet gevonden." });
    } catch (error) {
      return json(response, error.statusCode || 500, { error: error.statusCode ? error.message : "Interne serverfout." });
    }
  };
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  http.createServer(createRequestHandler()).listen(port, "0.0.0.0", () => {
    console.log(`Exploding Dinos roomserver luistert op poort ${port}`);
  });
}

module.exports = { createRequestHandler };
