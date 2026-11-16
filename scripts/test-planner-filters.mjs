import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../dist/home-calendar-card.js", import.meta.url), "utf8");
const titleMethod = source.slice(source.indexOf("  _plannerTitle(ev) {"), source.indexOf("  _renderPlanner() {"));
const plannerTitle = new Function(`return ({${titleMethod}})._plannerTitle;`)();
const configMethod = source.slice(source.indexOf("  setConfig(config) {"), source.indexOf("  set hass(hass) {"));
const setConfig = new Function("todoLists", "fixCalEntry", "themePalette", "DEFAULT_TYPES", "VIEWS", "startOfDay", "localStorage",
  `return ({${configMethod}}).setConfig;`)(
  () => [], c => c, () => ["blue"], [], ["planner"], d => d,
  { getItem: () => null },
);
const method = source.slice(source.indexOf("  _renderPlanner() {"), source.indexOf("  _renderMonth() {"));
const render = new Function("dayKey", "addDays", "esc",
  `return ({${method}})._renderPlanner;`)(
  () => "2026-11-16",
  (date, days) => new Date(+date + days * 86400000),
  (value) => String(value),
);

test("planner keeps filtered entries of one entity in their own columns and side area", () => {
  const calendars = ["Philipp", "Noah", "Lea", "Shared"].map(name => ({
    entity: "calendar.familie", name, color: "blue",
  }));
  const events = calendars.map((cal, i) => ({
    cal, id: String(i), summary: `${cal.name} appointment`, end: new Date(2099, 0, 1),
  }));
  const columns = calendars.slice(0, 3).map(cal => ({ members: [cal], cal }));
  const board = {
    _range: () => ({ start: new Date(2026, 10, 16), days: 1 }),
    _plannerCols: () => columns,
    _config: { allow_add: false },
    _writable: () => [],
    _fmt: () => ({ format: () => "" }),
    _multiBars: () => true,
    _barSegs: (_start, _days, filter) => {
      // Multi-day selection must use the same per-entry identity.
      const selected = events.filter(filter);
      assert.equal(selected.length, 1);
      return [];
    },
    _barLanes: () => ({ bars: [], lanes: 0 }),
    _avatar: () => "",
    _calName: cal => cal.name,
    _eventsOn: () => events,
    _holidaysOn: () => [],
    _wxBadge: () => "",
    _holidayTags: () => "",
    _isBday: () => false,
    _shortLabel: () => "",
    _typeIcon: () => "",
    _plannerTitle: plannerTitle,
  };
  const html = render.call(board);
  for (const name of ["Philipp", "Noah", "Lea", "Shared"]) {
    assert.equal(html.split(`<div class="s">${name} appointment</div>`).length - 1, 1);
  }
  const cells = html.split('class="pcell ').slice(1);
  ["Philipp", "Noah", "Lea"].forEach((name, i) => {
    assert.ok(cells[i].includes(`${name} appointment`));
    calendars.filter(c => c.name !== name).forEach(c => {
      assert.ok(!cells[i].includes(`${c.name} appointment`));
    });
  });
});

test("setConfig rebinds loaded events before rendering, including reorder/removal/filter changes", () => {
  const lea = { entity: "calendar.family", name: "Lea", include: "Lea" };
  const noah = { entity: "calendar.family", name: "Noah", include: "Noah" };
  const board = { _render() {}, _unsubscribeWeather() {} };
  const update = calendars => setConfig.call(board, { default_view: "planner", calendars });
  update([lea, noah]);
  board._events = board._calendars.map(cal => ({ cal, summary: cal.name }));
  board._render = () => {
    for (const ev of board._events) {
      assert.ok(board._calendars.includes(ev.cal), "event must belong to a current column at render time");
      assert.equal(ev.summary, ev.cal.name, "must not move to another person");
    }
  };
  update([lea, noah]);
  assert.equal(board._events.length, 2);
  update([noah, { ...lea, planner_title_prefix: "Lea", color: "pink" }]);
  assert.equal(board._events.length, 2);
  assert.equal(board._events[0].cal.color, "pink");
  update([lea]);
  assert.deepEqual(board._events.map(ev => ev.summary), ["Lea"]);
  update([{ ...lea, include: "Piano" }]);
  assert.equal(board._events.length, 0, "changed filters must not retain stale events");
});

test("planner strips only a complete leading prefix without mutating source events", () => {
  for (const [summary, expected] of [
    ["Lea Klavier", "Klavier"],
    [" lea: Klavier", "Klavier"],
    ["Lea – Klavier", "Klavier"],
    ["Leander Klavier", "Leander Klavier"],
    ["Klavier mit Lea", "Klavier mit Lea"],
    ["Lea", "Lea"],
  ]) {
    const ev = { summary, cal: { planner_title_prefix: "Lea" } };
    assert.equal(plannerTitle(ev), expected);
    assert.equal(ev.summary, summary);
  }
  assert.equal(plannerTitle({ summary: "Lea Klavier", cal: {} }), "Lea Klavier");
});
