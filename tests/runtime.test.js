const assert = require("node:assert/strict");
const test = require("node:test");
const { createBrowserHarness } = require("./browser-harness");

test("runtime dependencies can be replaced deterministically", () => {
  const harness = createBrowserHarness();
  harness.runBrowserScript("src/runtime.js");
  const runtime = harness.sandbox.ExplodingDinosRuntime;
  const scheduled = [];

  runtime.configure({
    random: () => 0.25,
    schedule: (callback, delay) => scheduled.push({ callback, delay })
  });

  assert.equal(runtime.random(), 0.25);
  runtime.schedule(() => {}, 650);
  assert.equal(scheduled[0].delay, 650);
});
