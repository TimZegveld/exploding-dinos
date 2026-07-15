const assert = require("node:assert/strict");
const test = require("node:test");

const {
  DINO_NAME_STARTS,
  DINO_NAME_ENDS,
  MAX_DINO_NAME_LENGTH,
  buildDinoNames,
  randomDinoName
} = require("../src/names");

test("dinonaamgenerator bevat 24 begin- en 24 einddelen", () => {
  assert.equal(DINO_NAME_STARTS.length, 24);
  assert.equal(DINO_NAME_ENDS.length, 24);
  assert.equal(buildDinoNames().length, 576);
});

test("alle gegenereerde dinonamen zijn uniek en maximaal 24 tekens", () => {
  const names = buildDinoNames();

  assert.equal(new Set(names.map((name) => name.toLowerCase())).size, 576);
  assert.equal(names.every((name) => name.length <= MAX_DINO_NAME_LENGTH), true);
});

test("dinonaamgenerator kan eerder geprobeerde namen uitsluiten", () => {
  const first = randomDinoName(() => 0);
  const replacement = randomDinoName(() => 0, [first]);

  assert.notEqual(replacement, first);
  assert.equal(replacement, buildDinoNames()[1]);
});
