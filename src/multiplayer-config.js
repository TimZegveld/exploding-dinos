globalThis.ExplodingDinosMultiplayerConfig ??= {
  // Vervang dit na het deployen van server/server.js, bijvoorbeeld:
  // apiBase: "https://exploding-dinos-api.onrender.com"
  apiBase: globalThis.location?.hostname === "localhost" || globalThis.location?.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : ""
};
