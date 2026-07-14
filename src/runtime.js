(() => {
let randomSource = () => Math.random();
let scheduler = (callback, delay) => window.setTimeout(callback, delay);

function random() {
  return randomSource();
}

function schedule(callback, delay) {
  return scheduler(callback, delay);
}

function configure(overrides = {}) {
  if (typeof overrides.random === "function") randomSource = overrides.random;
  if (typeof overrides.schedule === "function") scheduler = overrides.schedule;
}

function reset() {
  randomSource = () => Math.random();
  scheduler = (callback, delay) => window.setTimeout(callback, delay);
}

globalThis.ExplodingDinosRuntime = { configure, random, reset, schedule };
})();
