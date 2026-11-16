import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../dist/home-calendar-card.js", import.meta.url), "utf8");
const parser = source.slice(source.indexOf("function titlePersons("), source.indexOf("\nconst DEFAULT_COLORS"));
const titlePersons = new Function(`${parser}; return titlePersons;`)();
const extract = (start, end, name) => new Function("titlePersons",
  `return ({${source.slice(source.indexOf(start), source.indexOf(end))}}).${name};`)(titlePersons);
const keep = extract("  _keep(e, cal) {", "  _normalize(e, cal) {", "_keep");
const display = extract("  _plannerTitle(ev) {", "  _renderPlanner() {", "_plannerTitle");
const names = ["Alex", "Ben", "Mia"];

test("recognizes complete leading names and supported separators", () => {
  for (const separator of [" und ", " and ", " & ", " + ", ", "]) {
    const result = titlePersons(`Alex${separator}Ben at the park`, names);
    assert.deepEqual(result.persons, ["alex", "ben"]);
    assert.equal(result.title, "at the park");
  }
  assert.deepEqual(titlePersons(" mia, Ben und Alex: Swimming", names),
    { persons: ["mia", "ben", "alex"], title: "Swimming" });
});

test("does not match substrings or names in activity text", () => {
  assert.deepEqual(titlePersons("Alex macadamia workshop", names).persons, ["alex"]);
  for (const title of ["Miriam birthday", "Visit Mia", "Family outing"]) {
    assert.deepEqual(titlePersons(title, names), { persons: [], title });
  }
  assert.deepEqual(titlePersons("Alex drives Ben", names).persons, ["alex"]);
  assert.equal(titlePersons("Mia", names).title, "Mia");
  assert.deepEqual(titlePersons("Anna Maria: Tennis", ["Anna", "Anna Maria"]).persons, ["anna maria"]);
});

test("shared entries partition events and compose with existing filters", () => {
  const board = { _config: { title_persons: names } };
  const entry = person => ({ title_person: person, _incl: [], _excl: [], _matchIn: ["title"] });
  const event = { summary: "Alex und Ben at the park" };
  assert.equal(keep.call(board, event, entry("Alex")), true);
  assert.equal(keep.call(board, event, entry("Ben")), true);
  assert.equal(keep.call(board, event, entry("Mia")), false);
  assert.equal(keep.call(board, event, entry("unmatched")), false);
  assert.equal(keep.call(board, { summary: "Familienausflug" }, entry("unmatched")), true);
  assert.equal(keep.call(board, event, { ...entry("Alex"), _incl: ["piano"] }), false);
});

test("Planner cleanup is opt-in and keeps source titles and private events", () => {
  const board = { _config: { title_persons: names } };
  const ev = { summary: "Alex und Ben: Swimming", cal: { planner_hide_person_prefix: true } };
  assert.equal(display.call(board, ev), "Swimming");
  assert.equal(ev.summary, "Alex und Ben: Swimming");
  assert.equal(display.call(board, { ...ev, cal: {} }), ev.summary);
  assert.equal(display.call(board, { ...ev, private: true }), ev.summary);
});
