const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const projectRoot = path.resolve(__dirname, "..");
const harnessPath = path.join(
  projectRoot,
  ".codex",
  "skills",
  "exploding-dinos-card-designer",
  "scripts",
  "smoke_dom.js"
);

function localScriptsFromIndex() {
  const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  return [...html.matchAll(/<script\s+src=["']([^"']+)["'][^>]*><\/script>/g)]
    .map((match) => match[1].split("?")[0])
    .filter((src) => !/^(?:https?:)?\/\//.test(src));
}

test("skill smoke harness follows index script order and starts a game", () => {
  const run = spawnSync(process.execPath, [harnessPath], {
    cwd: projectRoot,
    encoding: "utf8"
  });

  assert.equal(run.status, 0, run.stderr);
  const result = JSON.parse(run.stdout);
  assert.deepEqual(result.loadedScripts, localScriptsFromIndex());
  assert.equal(result.handCards, 8);
  assert.equal(result.opponents, 1);
  assert.equal(result.status, "Jouw beurt");
});
