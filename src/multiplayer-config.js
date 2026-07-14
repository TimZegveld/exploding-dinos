globalThis.ExplodingDinosMultiplayerConfig ??= {
  apiBase: globalThis.location?.hostname === "localhost" || globalThis.location?.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://exploding-dinos-api.onrender.com"
};
