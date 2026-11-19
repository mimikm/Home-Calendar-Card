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
  for (const separator of [
    " und ", " and ", " i ", " y ", " e ", " en ", " és ", " и ", " et ",
    " & ", " + ", ", ", ", and ", ", und ", ", и ",
  ]) {
    const result = titlePersons(`Alex${separator}Ben at the park`, names);
    assert.deepEqual(result.persons, ["alex", "ben"]);
    assert.equal(result.title, "at the park");
  }
  assert.deepEqual(titlePersons(" mia, Ben und Alex: Swimming", names),
    { persons: ["mia", "ben", "alex"], title: "Swimming" });
});

test("joining words require another configured complete name", () => {
  for (const word of ["und", "and", "i", "y", "e", "en", "és", "и", "et"]) {
    const title = `Alex ${word} Benjamin at the park`;
    assert.deepEqual(titlePersons(title, names), {
      persons: ["alex"], title: `${word} Benjamin at the park`,
    });
  }
});

const schemaSource = source.slice(source.indexOf("const calSchema ="), source.indexOf("/* ============================================================ layout designer"));
const schema = new Function(`${schemaSource}; return calSchema;`)();

test("assignment dropdown includes disabled, configured, fallback and saved values", () => {
  const options = (configured, current) => schema(k => k, [], configured, current)
    .find(field => field.name === "title_person").selector.select.options;
  assert.deepEqual(options(["Alex", " Ben ", "Alex", ""], "").map(o => o.value),
    ["", "Alex", "Ben", "unmatched"]);
  assert.deepEqual(options(["Alex"], "Mia").map(o => o.value),
    ["", "Alex", "Mia", "unmatched"]);
  assert.deepEqual(options(undefined, "unmatched").map(o => o.value), ["", "unmatched"]);
  assert.equal(keep.call({ _config: {} }, { summary: "Anything" },
    { title_person: "", _incl: [], _excl: [], _matchIn: ["title"] }), true);
});

test("all ten languages translate the assignment fields and dropdown labels", () => {
  const translations = new Function(`${source.slice(source.indexOf("const I18N ="), source.indexOf("const LANGS ="))}; return I18N;`)();
  for (const language of ["en", "de", "pl", "es", "it", "nl", "hu", "pt", "sr", "sr-Latn"]) {
    for (const key of ["l_title_persons", "l_title_person", "o_title_person_none",
      "o_title_person_unmatched", "l_planner_hide_person_prefix"]) {
      assert.ok(translations[language][key], `${language}: ${key}`);
    }
  }
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
