/*
 * Home Calendar Card for Home Assistant
 * Shows Google, Apple (iCloud via CalDAV) or any other HA calendar entities
 * in Agenda / Week / Month views with daily weather forecasts, and lets you
 * add (and delete) events on any calendar that supports it. Supports per-person
 * calendars with avatars, birthday and holiday calendars, and countdowns.
 *
 * https://github.com/mimikm/Home-Calendar-Card
 */
const CARD_VERSION = "1.7.0";

const DEFAULT_COLORS = ["#4285F4", "#EA4335", "#34A853", "#F9AB00", "#A142F4", "#24C1E0", "#F06292", "#FF7043"];

const WX_ICON = {
  "clear-night": "mdi:weather-night", cloudy: "mdi:weather-cloudy", exceptional: "mdi:alert-circle-outline",
  fog: "mdi:weather-fog", hail: "mdi:weather-hail", lightning: "mdi:weather-lightning",
  "lightning-rainy": "mdi:weather-lightning-rainy", partlycloudy: "mdi:weather-partly-cloudy",
  pouring: "mdi:weather-pouring", rainy: "mdi:weather-rainy", snowy: "mdi:weather-snowy",
  "snowy-rainy": "mdi:weather-snowy-rainy", sunny: "mdi:weather-sunny", windy: "mdi:weather-windy",
  "windy-variant": "mdi:weather-windy-variant",
};
const WX_COLOR = {
  sunny: "#F9A825", "clear-night": "#7E57C2", partlycloudy: "#FFB300", cloudy: "#90A4AE", fog: "#90A4AE",
  rainy: "#42A5F5", pouring: "#1E88E5", "lightning-rainy": "#7E57C2", lightning: "#FBC02D",
  snowy: "#90CAF9", "snowy-rainy": "#64B5F6", hail: "#81D4FA", windy: "#4DB6AC", "windy-variant": "#4DB6AC",
  exceptional: "#EF5350",
};

// Colour themes. "auto" follows the Home Assistant theme.
const THEMES = {
  auto: { name: "Home Assistant" },
  nordic: {
    name: "Nordic", dark: false,
    vars: { bg: "#F8FAFC", text: "#1E293B", muted: "#64748B", line: "rgba(100,116,139,.18)", soft: "rgba(100,116,139,.08)", accent: "#3B82F6", onAccent: "#FFFFFF" },
    palette: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#06B6D4", "#EC4899", "#F97316"],
  },
  sunset: {
    name: "Sunset", dark: false,
    vars: { bg: "#FFF8F1", text: "#3D2C29", muted: "#8C6E63", line: "rgba(140,110,99,.2)", soft: "rgba(232,121,77,.08)", accent: "#E8794D", onAccent: "#FFFFFF" },
    palette: ["#E8794D", "#D9485F", "#E0A030", "#6F9A73", "#8E6C8A", "#4F8A8B", "#C0587E", "#B5651D"],
  },
  forest: {
    name: "Forest", dark: false,
    vars: { bg: "#F3F6F1", text: "#1F2D24", muted: "#5F7366", line: "rgba(95,115,102,.2)", soft: "rgba(61,122,79,.08)", accent: "#3D7A4F", onAccent: "#FFFFFF" },
    palette: ["#3D7A4F", "#B5523B", "#C99A2E", "#4A7FA7", "#7B5EA7", "#2E8B8B", "#B4637A", "#8A6D3B"],
  },
  midnight: {
    name: "Midnight", dark: true,
    vars: { bg: "#0F172A", text: "#E2E8F0", muted: "#94A3B8", line: "rgba(148,163,184,.18)", soft: "rgba(148,163,184,.08)", accent: "#38BDF8", onAccent: "#0F172A" },
    palette: ["#38BDF8", "#F472B6", "#34D399", "#FBBF24", "#A78BFA", "#FB7185", "#2DD4BF", "#FB923C"],
  },
  graphite: {
    name: "Graphite", dark: true,
    vars: { bg: "#1C1C1E", text: "#F2F2F7", muted: "#98989F", line: "rgba(255,255,255,.12)", soft: "rgba(255,255,255,.06)", accent: "#FF9F0A", onAccent: "#1C1C1E" },
    palette: ["#FF9F0A", "#0A84FF", "#30D158", "#FF453A", "#BF5AF2", "#64D2FF", "#FF375F", "#FFD60A"],
  },
};
const THEME_VARS = { bg: "--hcc-bg", text: "--hcc-text", muted: "--hcc-muted", line: "--hcc-line", soft: "--hcc-soft", accent: "--hcc-accent", onAccent: "--hcc-on-accent" };
const themePalette = (t) => THEMES[t]?.palette || DEFAULT_COLORS;

// Countdown colours per theme – one colour per kind of countdown, separate from the
// calendar colours so countdowns are easy to tell apart. `custom` rotates for your own dates.
const COUNTDOWN_COLORS = {
  auto:     { birthday: "#D63AF9", anniversary: "#E91E63", holiday: "#0288D1", event: "#607D8B", custom: ["#FB8C00", "#00897B", "#5E35B1", "#C0CA33"] },
  nordic:   { birthday: "#C026D3", anniversary: "#E11D48", holiday: "#0284C7", event: "#64748B", custom: ["#D97706", "#0D9488", "#4F46E5", "#65A30D"] },
  sunset:   { birthday: "#B5367A", anniversary: "#D7263D", holiday: "#2A9D8F", event: "#8C6E63", custom: ["#E9A23B", "#457B9D", "#6D597A", "#7C9A3D"] },
  forest:   { birthday: "#A2557A", anniversary: "#B23A48", holiday: "#2E7DAF", event: "#5F7366", custom: ["#C8961E", "#5B8E3E", "#6F5CA8", "#D07A3C"] },
  midnight: { birthday: "#E879F9", anniversary: "#FB7185", holiday: "#38BDF8", event: "#94A3B8", custom: ["#FBBF24", "#34D399", "#A78BFA", "#FB923C"] },
  graphite: { birthday: "#DA8FFF", anniversary: "#FF6482", holiday: "#64D2FF", event: "#98989F", custom: ["#FFD60A", "#30D158", "#FF9F0A", "#5E9EFF"] },
};

// Built-in event types. Override or extend with `event_types` in the card config.
// The type is stored on the event as a tag (e.g. "#work") in its description.
const DEFAULT_TYPES = [
  { id: "standard", name: "Standard", icon: "" },
  { id: "holiday", name: "Holiday", icon: "mdi:beach", style: "banner", all_day: true, countdown: true },
  { id: "birthday", name: "Birthday", icon: "mdi:cake-variant", style: "birthday", all_day: true, repeat: "yearly",
    countdown: true, countdown_limit: 2, countdown_calendars: true },
  { id: "anniversary", name: "Anniversary", icon: "mdi:heart", style: "anniversary", all_day: true, repeat: "yearly",
    countdown: true, countdown_calendars: true },
  { id: "work", name: "Work event", icon: "mdi:briefcase-outline" },
  { id: "dhs", name: "DHS", icon: "mdi:tag-outline" },
];
const REPEATS = [
  ["", "Does not repeat"], ["FREQ=DAILY", "Every day"], ["FREQ=WEEKLY", "Every week"],
  ["FREQ=WEEKLY;INTERVAL=2", "Every 2 weeks"], ["FREQ=MONTHLY", "Every month"], ["FREQ=YEARLY", "Every year"],
];
const toRrule = (r) => {
  if (!r) return "";
  const v = String(r).toLowerCase();
  return { daily: "FREQ=DAILY", weekly: "FREQ=WEEKLY", fortnightly: "FREQ=WEEKLY;INTERVAL=2", monthly: "FREQ=MONTHLY", yearly: "FREQ=YEARLY" }[v] || String(r);
};
const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
const TAG_RE = /(^|\s)#([a-z0-9_-]+)(?=\s|$)/gi;

// Calendar entity feature flags (homeassistant.components.calendar.CalendarEntityFeature)
const FEATURE_CREATE = 1;
const FEATURE_DELETE = 2;
const FEATURE_UPDATE = 4;

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = (n) => String(n).padStart(2, "0");
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const timeKey = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const isoLocal = (d) => {
  const o = -d.getTimezoneOffset();
  const a = Math.abs(o);
  return `${dayKey(d)}T${timeKey(d)}:00${o >= 0 ? "+" : "-"}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
};
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const parseDate = (s) => { const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
const sameDay = (a, b) => dayKey(a) === dayKey(b);
const round = (n) => (n == null || isNaN(n) ? "–" : Math.round(Number(n)));
const wxIcon = (c) => WX_ICON[c] || "mdi:weather-partly-cloudy";
const wxColor = (c) => WX_COLOR[c] || "var(--hcc-muted)";
const wxName = (c) => ({ partlycloudy: "partly cloudy", "clear-night": "clear", "lightning-rainy": "thunderstorms",
  "snowy-rainy": "sleet", "windy-variant": "windy" }[c] || String(c || "").replace(/-/g, " "));

let EV_SEQ = 0;

class HomeCalendarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._events = [];
    this._forecast = {};
    this._hidden = new Set();
    this._fetchId = 0;
    this._loading = false;
    this._error = null;
    this._built = false;
    this._fmts = {};
  }

  /* ---------------------------------------------------------------- config */

  static getStubConfig(hass) {
    const ids = Object.keys(hass?.states || {});
    const cfg = { calendars: ids.filter((i) => i.startsWith("calendar.")).slice(0, 3), default_view: "agenda" };
    const w = ids.find((i) => i.startsWith("weather."));
    if (w) cfg.weather_entity = w;
    return cfg;
  }

  static getConfigElement() { return document.createElement("home-calendar-card-editor"); }

  setConfig(config) {
    if (!config || !Array.isArray(config.calendars) || !config.calendars.length) {
      throw new Error("Add at least one calendar entity under 'calendars'");
    }
    const oldWeather = this._config?.weather_entity;
    const oldTodo = this._config?.todo_entity;
    this._config = {
      default_view: "agenda", days_to_show: 7, first_day_of_week: "monday", time_format: "auto",
      show_empty_days: false, show_header: true, show_calendar_chips: true, allow_add: true,
      refresh_interval: 5,
      ...config,
    };
    this._calendars = config.calendars
      .map((c, i) => {
        const o = typeof c === "string" ? { entity: c } : { ...c };
        const pal = themePalette(config.theme);
        o.color = o.color || pal[i % pal.length];
        const t = String(o.type || "events").toLowerCase();
        o.type = t.startsWith("birthday") ? "birthday" : t.startsWith("holiday") ? "holiday" : t.startsWith("anniversar") ? "anniversary" : "events";
        return o;
      })
      .filter((c) => c.entity);
    const defs = Object.fromEntries(DEFAULT_TYPES.map((t) => [t.id, t]));
    this._types = Array.isArray(config.event_types) && config.event_types.length
      ? config.event_types.map((t) => {
        const o = typeof t === "string" ? { id: t } : { ...t };
        o.id = String(o.id || o.name || "").toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
        return { ...(defs[o.id] || { name: o.id, icon: "mdi:tag-outline" }), ...o };
      }).filter((t) => t.id)
      : DEFAULT_TYPES.map((t) => ({ ...t }));
    this._storeKey = "home-calendar-card:" + this._calendars.map((c) => c.entity).join(",");
    try {
      const saved = JSON.parse(localStorage.getItem(this._storeKey) || "{}");
      this._hidden = new Set(saved.hidden || []);
    } catch (e) { this._hidden = new Set(); }
    if (!["agenda", "week", "month"].includes(this._view) || !this._configured) {
      this._view = ["agenda", "week", "month"].includes(this._config.default_view) ? this._config.default_view : "agenda";
    }
    this._configured = true;
    if (!this._anchor) this._anchor = startOfDay(new Date());

    if (oldWeather !== this._config.weather_entity) this._unsubscribeWeather();
    if (oldTodo !== this._config.todo_entity) { this._unsubscribeTodo(); this._todos = []; }
    this._todoKey = null; // rebuild the to-do form for the new config
    if (this._hass) {
      this._subscribeWeather();
      this._subscribeTodo();
      this._fetchEvents();
      this._fetchCountdowns();
    }
    this._render();
  }

  set hass(hass) {
    const old = this._hass;
    this._hass = hass;
    if (!this._config) return;
    if (!old) {
      this._subscribeWeather();
      this._subscribeTodo();
      this._fetchEvents();
      this._fetchCountdowns();
      this._render();
      return;
    }
    const t = this._config.todo_entity;
    if (t && old.states[t] !== hass.states[t] && !this._todoLive) this._loadTodos();
    let rerender = old.locale !== hass.locale;
    const w = this._config.weather_entity;
    if (w && old.states[w] !== hass.states[w]) rerender = true;
    if (this._calendars.some((c) => old.states[c.entity] !== hass.states[c.entity])) {
      this._scheduleRefetch();
      rerender = true;
    }
    if (rerender) this._render();
  }

  get hass() { return this._hass; }

  getCardSize() { return this._view === "month" ? 10 : 7; }

  getGridOptions() { return { columns: 12, min_columns: 6, min_rows: 4 }; }

  connectedCallback() {
    this._today = dayKey(new Date());
    this._onResize = () => { cancelAnimationFrame(this._raf); this._raf = requestAnimationFrame(() => this._applyLayout(true)); };
    this._onVis = () => this._keepAwake();
    window.addEventListener("resize", this._onResize);
    document.addEventListener("visibilitychange", this._onVis);
    this._keepAwake();
    this._tick = setInterval(() => {
      const k = dayKey(new Date());
      if (k !== this._today) {
        // Day rolled over: keep the view following "today" if it was on today.
        if (dayKey(this._anchor) === this._today) this._anchor = startOfDay(new Date());
        this._today = k;
        this._fetchEvents();
        this._fetchCountdowns();
        this._renderTodoList();
      }
      this._render();
    }, 60 * 1000);
    const mins = Math.max(1, Number(this._config?.refresh_interval) || 5);
    this._refresh = setInterval(() => { this._fetchEvents(); this._fetchCountdowns(); }, mins * 60 * 1000);
    if (this._hass && this._config) {
      this._subscribeWeather();
      this._subscribeTodo();
      this._fetchEvents();
      this._fetchCountdowns();
    }
  }

  disconnectedCallback() {
    clearInterval(this._tick);
    clearInterval(this._refresh);
    window.removeEventListener("resize", this._onResize);
    document.removeEventListener("visibilitychange", this._onVis);
    if (this._wakeLock) { this._wakeLock.release().catch(() => {}); this._wakeLock = null; }
    clearTimeout(this._refetchTimer);
    this._unsubscribeWeather();
    this._unsubscribeTodo();
  }

  /* ----------------------------------------------------------------- to-do */
  // Uses a Home Assistant to-do entity (e.g. Local To-do). The person is stored as
  // "For: <name>" in the item's description (or a "[Name] " title prefix when the
  // list doesn't support descriptions), using the calendar's display name.

  _subscribeTodo() {
    const ent = this._config?.todo_entity;
    if (!ent || !this._hass || this._todoSub || !this.isConnected) return;
    this._todoSub = this._hass.connection.subscribeMessage((msg) => {
      this._todoLive = true;
      this._todos = msg.items || [];
      this._todoError = null;
      this._renderTodoList();
    }, { type: "todo/item/subscribe", entity_id: ent }).catch((err) => {
      console.warn("home-calendar-card: live to-do updates unavailable, polling instead", err);
      this._todoSub = null;
      this._todoLive = false;
      this._loadTodos();
    });
  }

  _unsubscribeTodo() {
    if (this._todoSub) {
      this._todoSub.then((u) => u && u()).catch(() => {});
      this._todoSub = null;
    }
    this._todoLive = false;
  }

  async _loadTodos() {
    const ent = this._config?.todo_entity;
    if (!ent || !this._hass) return;
    try {
      const r = await this._hass.callWS({ type: "todo/item/list", entity_id: ent });
      this._todos = r.items || [];
      this._todoError = null;
    } catch (e) {
      this._todoError = `${ent}: ${e?.message || "could not load the to-do list"}`;
    }
    this._renderTodoList();
  }

  _todoPeople() { return this._calendars.filter((c) => c.type === "events"); }

  _parseTodo(it) {
    let summary = it.summary || "";
    let who = null;
    const pre = summary.match(/^\[([^\]]+)\]\s*/);
    if (pre) { who = pre[1].trim(); summary = summary.slice(pre[0].length); }
    const d = String(it.description || "").match(/^\s*For:\s*(.+?)\s*$/mi);
    if (d) who = d[1];
    const cal = who ? this._todoPeople().find((c) => this._calName(c).toLowerCase() === who.toLowerCase()) : null;
    const timed = !!(it.due && String(it.due).length > 10);
    const due = it.due ? (timed ? new Date(it.due) : parseDate(it.due)) : null;
    return { raw: it, uid: it.uid, summary, who, cal, due, timed, done: it.status === "completed" };
  }

  _buildTodo() {
    const box = this._todoBox;
    const ent = this._config.todo_entity;
    if (!box) return;
    if (!ent) { box.hidden = true; box.innerHTML = ""; this._todoKey = null; return; }
    const people = this._todoPeople();
    const feats = this._features(ent);
    const key = JSON.stringify([ent, feats, this._config.todo_title, this._config.todo_autohide, people.map((c) => [c.entity, this._calName(c), c.color])]);
    if (key === this._todoKey) return;
    this._todoKey = key;
    box.hidden = false;
    if (this._todoWho === undefined || (this._todoWho && !people.some((c) => c.entity === this._todoWho))) {
      this._todoWho = people[0]?.entity || "";
    }
    const canDue = !this._hass || !this._hass.states[ent] || (feats & (16 | 32));
    const canAdd = !this._hass || !this._hass.states[ent] || (feats & 1);
    const chip = (entity, label, color, av) => `<button type="button" class="chip ${this._todoWho === entity ? "sel" : ""}" style="--c:${esc(color)}" data-action="todo-who" data-entity="${esc(entity)}">${av || `<span class="dot"></span>`}${esc(label)}</button>`;
    box.innerHTML = `
      <div class="todo-head" ${this._todoAutohide() ? `data-action="todo-toggle" role="button" title="Show / hide the to-do list"` : ""}>
        <ha-icon icon="mdi:checkbox-marked-circle-outline"></ha-icon>
        <span class="todo-title">${esc(this._config.todo_title || "To-do")}</span>
        <span class="todo-count"></span>
        ${this._todoAutohide() ? `<ha-icon class="todo-chev" icon="mdi:chevron-down"></ha-icon>` : ""}
      </div>
      <div class="todo-err"></div>
      <div class="todo-list"></div>
      ${canAdd ? `<form class="todo-add" autocomplete="off">
        <div class="todo-row">
          <input class="inp" id="t-text" placeholder="Add a task…" enterkeyhint="done">
          ${canDue ? `<input class="inp" type="date" id="t-due" title="Due date">` : ""}
          <button class="t-addbtn" type="submit" title="Add task"><ha-icon icon="mdi:plus"></ha-icon></button>
        </div>
        <div class="t-who">
          ${people.map((c) => chip(c.entity, this._calName(c), c.color, this._avatar(c, "sm"))).join("")}
          ${chip("", "Everyone", "var(--hcc-accent)", `<ha-icon class="t-all" icon="mdi:account-group"></ha-icon>`)}
        </div>
      </form>` : ""}`;
    const form = box.querySelector(".todo-add");
    if (form) {
      form.addEventListener("submit", (e) => { e.preventDefault(); this._addTodo(); });
      form.addEventListener("keydown", (e) => e.stopPropagation()); // don't trigger HA shortcuts while typing
    }
    this._applyTodoState();
    this._renderTodoList();
  }

  // Auto-hide: seconds of inactivity before the list folds away (0 = off).
  _todoAutohide() {
    const a = this._config?.todo_autohide;
    if (a === true) return 30;
    const n = Number(a);
    return n > 0 ? n : 0;
  }

  _applyTodoState() {
    const box = this._todoBox;
    if (!box) return;
    const auto = this._todoAutohide();
    if (!auto) this._todoOpen = true;
    else if (!this._todoAutoPrev) this._todoOpen = false; // auto-hide just switched on: start folded
    this._todoAutoPrev = auto;
    box.classList.toggle("autohide", !!auto);
    box.classList.toggle("collapsed", !!auto && !this._todoOpen);
  }

  _todoActivity() {
    const auto = this._todoAutohide();
    clearTimeout(this._todoHideTimer);
    if (!auto || !this._todoOpen) return;
    this._todoHideTimer = setTimeout(() => {
      const t = this._todoBox?.querySelector("#t-text");
      // don't fold away while someone is typing a task
      if (t && (t.value || this.shadowRoot.activeElement === t)) { this._todoActivity(); return; }
      this._todoOpen = false;
      this._applyTodoState();
    }, auto * 1000);
  }

  _dueChip(t) {
    if (!t.due) return "";
    const n = Math.round((startOfDay(t.due) - startOfDay(new Date())) / 864e5);
    const date = this._fmt({ weekday: "short", day: "numeric", month: "short" }).format(t.due);
    let label = n === 0 ? "Today" : n === 1 ? "Tomorrow" : n === -1 ? "Yesterday" : date;
    if (t.timed) label += ` ${this._time(t.due)}`;
    const cls = n < 0 || (t.timed && t.due < new Date()) ? "overdue" : n === 0 ? "due-today" : "";
    return `<span class="due ${cls}" title="${esc(date)}"><ha-icon icon="${cls === "overdue" ? "mdi:alert-circle-outline" : "mdi:calendar-blank-outline"}"></ha-icon>${esc(label)}</span>`;
  }

  _renderTodoList() {
    const box = this._todoBox;
    const list = box?.querySelector(".todo-list");
    if (!list) return;
    box.querySelector(".todo-err").textContent = this._todoError || "";
    this._pendingDone = this._pendingDone || new Set();
    const items = (this._todos || []).map((i) => this._parseTodo(i)).filter((t) => !t.done && !this._pendingDone.has(t.uid));
    const sort = (a, b) => ((a.due ? a.due.getTime() : Infinity) - (b.due ? b.due.getTime() : Infinity)) || a.summary.localeCompare(b.summary);
    const groups = this._todoPeople().map((c) => ({ name: this._calName(c), cal: c, items: items.filter((t) => t.cal === c) }));
    const loose = {};
    items.filter((t) => !t.cal).forEach((t) => { const k = t.who || "Everyone"; (loose[k] = loose[k] || []).push(t); });
    Object.entries(loose).sort(([a], [b]) => (a === "Everyone") - (b === "Everyone") || a.localeCompare(b))
      .forEach(([name, its]) => groups.push({ name, cal: null, items: its }));
    box.querySelector(".todo-count").textContent = items.length ? String(items.length) : "";
    const shown = groups.filter((g) => g.items.length);
    list.innerHTML = shown.length ? shown.map((g) => {
      const color = g.cal?.color || "var(--hcc-accent)";
      const av = g.cal ? this._avatar(g.cal, "sm") : "";
      return `<div class="tg" style="--c:${esc(color)}">
        <div class="tg-head">${av || (g.name === "Everyone" ? `<ha-icon class="t-all" icon="mdi:account-group"></ha-icon>` : `<span class="dot"></span>`)}
          <span class="tg-name">${esc(g.name)}</span><span class="tg-n">${g.items.length}</span></div>
        ${g.items.sort(sort).map((t) => `<div class="ti" data-uid="${esc(t.uid)}">
          <button class="tick" data-action="todo-done" data-uid="${esc(t.uid)}" title="Mark as done"><ha-icon icon="mdi:check"></ha-icon></button>
          <span class="ti-text">${esc(t.summary)}</span>${this._dueChip(t)}
        </div>`).join("")}
      </div>`;
    }).join("") : `<div class="todo-empty"><ha-icon icon="mdi:party-popper"></ha-icon>All done – nothing on the list</div>`;
  }

  async _addTodo() {
    const ent = this._config.todo_entity;
    const box = this._todoBox;
    const input = box.querySelector("#t-text");
    const dueInp = box.querySelector("#t-due");
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    const cal = this._todoPeople().find((c) => c.entity === this._todoWho);
    const name = cal ? this._calName(cal) : "";
    const feats = this._features(ent);
    const data = { item: text };
    if (name) {
      if (feats & 64) data.description = `For: ${name}`;
      else data.item = `[${name}] ${text}`;
    }
    if (dueInp?.value) data.due_date = dueInp.value;
    const btn = box.querySelector(".t-addbtn");
    btn.disabled = true;
    try {
      await this._hass.callService("todo", "add_item", data, { entity_id: ent });
      input.value = "";
      if (dueInp) dueInp.value = "";
      input.focus();
      if (!this._todoLive) this._loadTodos();
    } catch (e) {
      box.querySelector(".todo-err").textContent = e?.message || "Could not add the task.";
    }
    btn.disabled = false;
  }

  async _todoDone(uid) {
    const ent = this._config.todo_entity;
    const raw = (this._todos || []).find((i) => i.uid === uid);
    if (!raw) return;
    const t = this._parseTodo(raw);
    const row = [...this._todoBox.querySelectorAll(".ti")].find((r) => r.dataset.uid === uid);
    row?.classList.add("done");
    this._pendingDone = this._pendingDone || new Set();
    this._pendingDone.add(uid);
    setTimeout(() => this._renderTodoList(), 550);
    const remove = this._config.todo_on_done === "remove";
    try {
      if (remove) await this._hass.callService("todo", "remove_item", { item: [uid] }, { entity_id: ent });
      else await this._hass.callService("todo", "update_item", { item: uid, status: "completed" }, { entity_id: ent });
      this._notify(`Done: ${t.summary}`, { text: "Undo", action: () => this._todoUndo(uid, raw, remove) });
      if (!this._todoLive) this._loadTodos();
    } catch (e) {
      this._pendingDone.delete(uid);
      this._renderTodoList();
      this._toast(e?.message || "Could not update the task.");
    }
  }

  async _todoUndo(uid, raw, removed) {
    const ent = this._config.todo_entity;
    try {
      if (removed) {
        const data = { item: raw.summary };
        if (raw.description) data.description = raw.description;
        if (raw.due) data[String(raw.due).length > 10 ? "due_datetime" : "due_date"] = raw.due;
        await this._hass.callService("todo", "add_item", data, { entity_id: ent });
      } else {
        await this._hass.callService("todo", "update_item", { item: uid, status: "needs_action" }, { entity_id: ent });
      }
    } catch (e) { this._toast(e?.message || "Could not undo."); }
    this._pendingDone.delete(uid);
    if (!this._todoLive) this._loadTodos(); else this._renderTodoList();
  }

  /* ------------------------------------------------------------------ data */

  _scheduleRefetch() {
    clearTimeout(this._refetchTimer);
    this._refetchTimer = setTimeout(() => this._fetchEvents(), 1500);
  }

  _startOfWeek(d) {
    const fd = { sunday: 0, monday: 1, saturday: 6 }[String(this._config.first_day_of_week).toLowerCase()] ?? 1;
    const x = startOfDay(d);
    return addDays(x, -((x.getDay() - fd + 7) % 7));
  }

  _range() {
    const a = this._anchor;
    if (this._view === "month") {
      const first = new Date(a.getFullYear(), a.getMonth(), 1);
      const start = this._startOfWeek(first);
      const daysInMonth = new Date(a.getFullYear(), a.getMonth() + 1, 0).getDate();
      const lead = Math.round((first - start) / 864e5);
      const days = Math.ceil((lead + daysInMonth) / 7) * 7;
      return { start, end: addDays(start, days), days };
    }
    if (this._view === "week") {
      const start = this._startOfWeek(a);
      return { start, end: addDays(start, 7), days: 7 };
    }
    const n = Math.max(1, Number(this._config.days_to_show) || 7);
    return { start: a, end: addDays(a, n), days: n };
  }

  async _fetchEvents() {
    if (!this._hass || !this._config) return;
    const id = ++this._fetchId;
    const { start, end } = this._range();
    this._loading = true;
    this._render();
    const errors = [];
    const lists = await Promise.all(this._calendars.map(async (cal) => {
      if (!this._hass.states[cal.entity]) { errors.push(`${cal.entity} not found`); return []; }
      try {
        const res = await this._hass.callApi("GET",
          `calendars/${cal.entity}?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`);
        return (res || []).map((e) => this._normalize(e, cal));
      } catch (e) {
        errors.push(`${cal.entity}: ${e?.body?.message || e?.message || "could not load events"}`);
        return [];
      }
    }));
    if (id !== this._fetchId) return; // a newer fetch superseded this one
    this._events = lists.flat().sort((a, b) => (b.allDay - a.allDay) || (a.start - b.start) || a.summary.localeCompare(b.summary));
    this._error = errors.length ? errors.join(" · ") : null;
    this._loading = false;
    this._render();
  }

  _normalize(e, cal) {
    const allDay = !!(e.start && e.start.date);
    const start = allDay ? parseDate(e.start.date) : new Date(e.start?.dateTime || e.start);
    let end = e.end ? (allDay ? parseDate(e.end.date) : new Date(e.end.dateTime || e.end)) : null;
    if (!end || isNaN(end)) end = allDay ? addDays(start, 1) : start;
    // Event type: a "#tag" in the title/description wins, otherwise the calendar's type.
    let tagged = null;
    const strip = (txt) => String(txt || "").replace(TAG_RE, (m, sp, t) => {
      const ty = this._typeById(t, true);
      if (!ty) return m;
      tagged = tagged || ty.id;
      return sp;
    }).trim();
    let summary = strip(e.summary);
    const title = summary;
    const description = strip(e.description);
    const typeId = tagged || (["birthday", "holiday", "anniversary"].includes(cal.type) ? cal.type : "standard");
    let age = null;
    if (["birthday", "anniversary"].includes(this._typeById(typeId).style)) {
      const m = `${summary} ${description}`.match(/\b(19\d{2}|20\d{2})\b/);
      const a = m ? start.getFullYear() - Number(m[1]) : 0;
      if (a > 0 && a < 130) age = a;
      summary = summary.replace(/\s*[([]?\b(19|20)\d{2}\b[)\]]?/, "").trim() || summary;
    }
    return {
      age, type: typeId, tagged: !!tagged, title,
      id: `e${++EV_SEQ}`, summary: summary || "(No title)", description,
      location: e.location || "", uid: e.uid, recurrence_id: e.recurrence_id, rrule: e.rrule,
      allDay, start, end, cal,
    };
  }

  _onDay(day) {
    const s = startOfDay(day);
    const e = addDays(s, 1);
    return this._events.filter((ev) => !this._hidden.has(ev.cal.entity)
      && ev.start < e
      && (ev.end > s || (ev.end.getTime() === ev.start.getTime() && ev.start >= s)));
  }

  _typeById(id, strict = false) {
    const k = String(id || "").toLowerCase();
    return this._types?.find((t) => t.id === k) || DEFAULT_TYPES.find((t) => t.id === k)
      || (strict ? null : DEFAULT_TYPES[0]);
  }

  _ty(ev) { return this._typeById(ev.type); }

  _isBanner(ev) { return this._ty(ev).style === "banner"; }

  // Birthdays and anniversaries: all-day, yearly, with an age/years count.
  _isBday(ev) { return ["birthday", "anniversary"].includes(this._ty(ev).style); }

  _yearlyLabel(ev, short = false) {
    const anniv = this._ty(ev).style === "anniversary";
    const name = anniv ? "Anniversary" : "Birthday";
    if (short || !ev.age) return name;
    return anniv ? `${ordinal(ev.age)} anniversary` : `Birthday · turns ${ev.age}`;
  }

  _typeIcon(ev) { return this._ty(ev).icon || ""; }

  _eventsOn(day) { return this._onDay(day).filter((ev) => !this._isBanner(ev)); }

  _holidaysOn(day) { return this._onDay(day).filter((ev) => this._isBanner(ev)); }

  _holidayTags(day) {
    return this._holidaysOn(day).map((ev) => `<span class="hol" style="--c:${esc(ev.cal.color)}" data-action="open-event" data-id="${ev.id}">
      <ha-icon icon="${esc((ev.tagged ? this._typeIcon(ev) : ev.cal.icon) || "mdi:party-popper")}"></ha-icon>${esc(ev.summary)}</span>`).join("");
  }

  /* ------------------------------------------------------------ countdowns */

  async _fetchCountdowns() {
    const list = (this._config?.countdowns || []).map((c) => (typeof c === "string" ? { calendar: c } : { ...c }));
    const cdTypes = (this._types || []).filter((t) => t.countdown).map((t) => t.id);
    if ((!list.length && !cdTypes.length) || !this._hass) { this._countdowns = []; return; }
    const id = (this._cdId = (this._cdId || 0) + 1);
    const now = new Date();
    const today = startOfDay(now);
    const end = addDays(today, Math.max(7, Number(this._config.countdown_days) || 365));
    const cache = {};
    const look = (ent) => {
      if (!cache[ent]) {
        cache[ent] = this._hass.callApi("GET",
          `calendars/${ent}?start=${encodeURIComponent(today.toISOString())}&end=${encodeURIComponent(end.toISOString())}`);
      }
      return cache[ent];
    };
    const out = await Promise.all(list.map(async (cd) => {
      const cal = this._calendars.find((c) => c.entity === cd.calendar);
      const color = cd.color || cal?.color || "var(--hcc-accent)";
      const fixed = cd.color || null;
      if (cd.date) {
        const timed = /[T ]\d/.test(String(cd.date));
        const d = timed ? new Date(cd.date) : parseDate(cd.date);
        if (isNaN(d)) return null;
        if (cd.repeat === "yearly") while (startOfDay(d) < today) d.setFullYear(d.getFullYear() + 1);
        if ((timed ? d : addDays(d, 1)) <= now) return null;
        return { name: cd.name || "Countdown", start: d, end: d, icon: cd.icon, color, fixed, kind: cd.type || "custom" };
      }
      if (!cd.calendar || !this._hass.states[cd.calendar]) return null;
      try {
        const evs = (await look(cd.calendar)).map((e) => this._normalize(e, cal || { entity: cd.calendar, color }));
        let re = null;
        if (cd.match) {
          try { re = new RegExp(cd.match, "i"); } catch (e) { re = { test: (t) => t.toLowerCase().includes(String(cd.match).toLowerCase()) }; }
        }
        const hit = evs.filter((ev) => ev.end > now && (!re || re.test(ev.summary))).sort((a, b) => a.start - b.start)[0];
        if (!hit) return null;
        return { name: cd.name || hit.summary, start: hit.start, end: hit.end, icon: cd.icon, color, fixed, ev: hit, kind: cd.type || this._cdKind(hit) };
      } catch (e) {
        console.warn("home-calendar-card: countdown failed", cd, e);
        return null;
      }
    }));
    // Events whose type has `countdown: true` get a countdown automatically.
    //  - countdown_limit: only the next N events of that type (birthdays: next 2)
    //  - countdown_days: only events within N days (per type; default = card's countdown_days)
    //  - countdown_calendars: also count events from calendars of that type, not just tagged events
    if (cdTypes.length) {
      const seen = new Set(out.filter(Boolean).map((c) => c.ev && `${c.ev.uid}|${c.start.getTime()}`));
      const auto = await Promise.all(this._calendars.filter((c) => this._hass.states[c.entity] && !this._hidden.has(c.entity)).map(async (cal) => {
        try {
          return (await look(cal.entity)).map((e) => this._normalize(e, cal)).filter((ev) => {
            if (!cdTypes.includes(ev.type) || ev.end <= now) return false;
            const ty = this._ty(ev);
            if (!ev.tagged && !ty.countdown_calendars) return false;
            const days = Number(ty.countdown_days);
            return !(days > 0 && startOfDay(ev.start) > addDays(today, days));
          });
        } catch (e) { return []; }
      }));
      const perType = {};
      auto.flat().sort((a, b) => a.start - b.start).forEach((ev) => {
        const k = `${ev.uid}|${ev.start.getTime()}`;
        if (seen.has(k)) return;
        const limit = Number(this._ty(ev).countdown_limit);
        perType[ev.type] = perType[ev.type] || out.filter((c) => c?.ev?.type === ev.type).length;
        if (limit > 0 && perType[ev.type] >= limit) return;
        perType[ev.type] += 1;
        seen.add(k);
        out.push({ name: ev.summary, start: ev.start, end: ev.end, icon: this._typeIcon(ev), color: ev.cal.color, ev, kind: this._cdKind(ev) });
      });
    }
    if (id !== this._cdId) return;
    this._countdowns = out.filter(Boolean).sort((a, b) => a.start - b.start).slice(0, Number(this._config.max_countdowns) || 8);
    this._render();
  }

  _cdKind(ev) {
    const ty = this._ty(ev);
    if (ty.style === "birthday") return "birthday";
    if (ty.style === "anniversary") return "anniversary";
    if (ty.style === "banner") return "holiday";
    return ty.id === "standard" ? "event" : ty.id;
  }

  // countdown_colors: "calendar" = use calendar colours (old behaviour), or a map overriding theme colours
  _cdColor(cd, customIdx) {
    if (cd.fixed) return cd.fixed;
    const opt = this._config.countdown_colors;
    if (opt === "calendar") return cd.color;
    const base = COUNTDOWN_COLORS[THEMES[this._config.theme] ? this._config.theme : "auto"] || COUNTDOWN_COLORS.auto;
    const map = { ...base, ...(opt && typeof opt === "object" ? opt : {}) };
    const custom = [].concat(map.custom || base.custom);
    if (map[cd.kind] && cd.kind !== "custom") return map[cd.kind];
    if (cd.kind === "custom" || !cd.ev) return custom[customIdx % custom.length];
    return this._ty(cd.ev).color || map.event;
  }

  _renderCountdowns() {
    if (!this._countdowns?.length) return "";
    let customIdx = 0;
    const now = new Date();
    const today = startOfDay(now);
    const f = this._fmt({ weekday: "short", day: "numeric", month: "short" });
    return `<div class="cds">${this._countdowns.map((cd) => {
      const n = Math.round((startOfDay(cd.start) - today) / 864e5);
      const ongoing = cd.start <= now && cd.end > now;
      const num = n > 0 ? n : ongoing && n < 0 ? "Now" : "Today";
      const unit = n > 1 ? "days" : n === 1 ? "day" : "";
      const color = this._cdColor(cd, !cd.fixed && (cd.kind === "custom" || !cd.ev) ? customIdx++ : 0);
      return `<div class="cd ${n <= 0 ? "due" : ""}" style="--c:${esc(color)}" ${cd.ev ? `data-action="open-cd" data-start="${cd.start.getTime()}" data-name="${esc(cd.ev.summary)}"` : ""}>
        <div class="cd-top"><span class="cd-icon"><ha-icon icon="${esc(cd.icon || "mdi:timer-sand")}"></ha-icon></span>
        <span class="cd-num">${num}${unit ? `<span>${unit}</span>` : ""}</span></div>
        <div class="cd-name">${esc(cd.name)}</div>
        <div class="cd-date">${esc(f.format(cd.start))}${cd.ev?.age && this._isBday(cd.ev) ? ` · ${esc(this._ty(cd.ev).style === "anniversary" ? ordinal(cd.ev.age) : `turns ${cd.ev.age}`)}` : ""}</div>
      </div>`;
    }).join("")}</div>`;
  }

  /* --------------------------------------------------------------- people */

  _avatar(cal, cls = "") {
    const p = cal.person && this._hass?.states[cal.person];
    const pic = cal.picture || p?.attributes?.entity_picture;
    const style = `style="--c:${esc(cal.color)}"`;
    if (pic) return `<img class="av ${cls}" src="${esc(pic)}" alt="" ${style}>`;
    if (cal.icon) return `<span class="av ${cls}" ${style}><ha-icon icon="${esc(cal.icon)}"></ha-icon></span>`;
    if (cal.person) {
      const ini = this._calName(cal).split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
      return `<span class="av ${cls}" ${style}>${esc(ini)}</span>`;
    }
    if (cal.type === "birthday") return `<span class="av ${cls}" ${style}><ha-icon icon="mdi:cake-variant"></ha-icon></span>`;
    if (cal.type === "anniversary") return `<span class="av ${cls}" ${style}><ha-icon icon="mdi:heart"></ha-icon></span>`;
    return "";
  }

  _subscribeWeather() {
    const ent = this._config?.weather_entity;
    if (!ent || !this._hass || this._wxSub || !this.isConnected) return;
    this._wxSub = this._hass.connection.subscribeMessage((msg) => {
      const map = {};
      (msg.forecast || []).forEach((f) => {
        if (!f.datetime) return;
        const k = String(f.datetime).slice(0, 10);
        if (!map[k]) map[k] = f;
      });
      this._forecast = map;
      this._render();
    }, { type: "weather/subscribe_forecast", entity_id: ent, forecast_type: "daily" })
      .catch((err) => {
        console.warn("home-calendar-card: daily forecast unavailable for", ent, err);
        this._wxSub = null;
      });
  }

  _unsubscribeWeather() {
    if (this._wxSub) {
      this._wxSub.then((unsub) => unsub && unsub()).catch(() => {});
      this._wxSub = null;
    }
    this._forecast = {};
  }

  _features(entity) { return Number(this._hass?.states[entity]?.attributes?.supported_features) || 0; }

  _writable() { return this._calendars.filter((c) => this._features(c.entity) & FEATURE_CREATE); }

  _calName(c) {
    return c.name || (c.person && this._hass?.states[c.person]?.attributes?.friendly_name)
      || this._hass?.states[c.entity]?.attributes?.friendly_name || c.entity.replace("calendar.", "");
  }

  _saveHidden() {
    try { localStorage.setItem(this._storeKey, JSON.stringify({ hidden: [...this._hidden] })); } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------ formatting */

  _lang() { return this._hass?.locale?.language || this._hass?.language || navigator.language || "en"; }

  _fmt(opts) {
    const key = this._lang() + JSON.stringify(opts);
    if (!this._fmts[key]) {
      try { this._fmts[key] = new Intl.DateTimeFormat(this._lang(), opts); } catch (e) { this._fmts[key] = new Intl.DateTimeFormat("en", opts); }
    }
    return this._fmts[key];
  }

  _time(d) {
    const tf = this._config.time_format;
    const prof = this._hass?.locale?.time_format;
    const o = { hour: "numeric", minute: "2-digit" };
    if (tf === "12h" || (tf === "auto" && prof === "12")) o.hour12 = true;
    else if (tf === "24h" || (tf === "auto" && prof === "24")) { o.hour12 = false; o.hour = "2-digit"; }
    return this._fmt(o).format(d);
  }

  _relDay(d) {
    const diff = Math.round((startOfDay(d) - startOfDay(new Date())) / 864e5);
    if (diff >= -1 && diff <= 1) {
      try {
        const s = new Intl.RelativeTimeFormat(this._lang(), { numeric: "auto" }).format(diff, "day");
        return s.charAt(0).toUpperCase() + s.slice(1);
      } catch (e) { /* fall through */ }
    }
    return this._fmt({ weekday: "long", day: "numeric", month: "long" }).format(d);
  }

  _timeLabel(ev, day) {
    if (ev.allDay) {
      const total = Math.round((ev.end - ev.start) / 864e5);
      if (total > 1 && day) {
        const n = Math.round((startOfDay(day) - ev.start) / 864e5) + 1;
        return `All day · ${n}/${total}`;
      }
      return "All day";
    }
    if (!day) return `${this._time(ev.start)} – ${this._time(ev.end)}`;
    const ds = startOfDay(day);
    const de = addDays(ds, 1);
    const startsBefore = ev.start < ds;
    const endsAfter = ev.end > de;
    if (startsBefore && endsAfter) return "All day";
    if (startsBefore) return `Until ${this._time(ev.end)}`;
    if (endsAfter) return `From ${this._time(ev.start)}`;
    if (ev.start.getTime() === ev.end.getTime()) return this._time(ev.start);
    return `${this._time(ev.start)} – ${this._time(ev.end)}`;
  }

  _shortLabel(ev, day) {
    if (ev.allDay) return "All day";
    const ds = startOfDay(day);
    if (ev.start < ds) return ev.end > addDays(ds, 1) ? "All day" : `→ ${this._time(ev.end)}`;
    return this._time(ev.start);
  }

  _whenText(ev) {
    const longDay = this._fmt({ weekday: "long", day: "numeric", month: "long" });
    const shortDay = this._fmt({ weekday: "short", day: "numeric", month: "short" });
    if (ev.allDay) {
      const lastDay = addDays(ev.end, -1);
      if (sameDay(ev.start, lastDay) || ev.end <= ev.start) return `${longDay.format(ev.start)} · All day`;
      return `${shortDay.format(ev.start)} – ${shortDay.format(lastDay)} · All day`;
    }
    if (sameDay(ev.start, ev.end)) return `${longDay.format(ev.start)} · ${this._time(ev.start)} – ${this._time(ev.end)}`;
    return `${shortDay.format(ev.start)} ${this._time(ev.start)} – ${shortDay.format(ev.end)} ${this._time(ev.end)}`;
  }

  _rangeLabel() {
    if (this._view === "month") return this._fmt({ month: "long", year: "numeric" }).format(this._anchor);
    const { start, end } = this._range();
    const last = addDays(end, -1);
    const f = this._fmt({ day: "numeric", month: "short" });
    return sameDay(start, last) ? f.format(start) : `${f.format(start)} – ${f.format(last)}`;
  }

  /* ------------------------------------------------------------- rendering */

  _build() {
    this.shadowRoot.innerHTML = `<style>${STYLES}</style><ha-card><div class="inner"><div class="wrap"></div><div class="todo" hidden></div></div><div class="fs-ctl"></div><div class="hcc-toast"></div></ha-card><dialog></dialog>`;
    this._main = this.shadowRoot.querySelector(".wrap");
    this._todoBox = this.shadowRoot.querySelector(".todo");
    ["pointerdown", "keydown", "input", "focusin"].forEach((ev) => this._todoBox.addEventListener(ev, () => this._todoActivity()));
    this._inner = this.shadowRoot.querySelector(".inner");
    this._dlg = this.shadowRoot.querySelector("dialog");
    this.shadowRoot.addEventListener("click", (e) => this._onClick(e));
    // Full-screen controls stay hidden until someone moves the mouse or touches the screen.
    const reveal = () => {
      if (this._mode !== "fullscreen") return;
      const c = this.shadowRoot.querySelector(".fs-ctl");
      c.classList.add("show");
      clearTimeout(this._fsHide);
      this._fsHide = setTimeout(() => c.classList.remove("show"), 3000);
    };
    this.shadowRoot.addEventListener("pointermove", reveal);
    this.shadowRoot.addEventListener("pointerdown", reveal);
    this._dlg.addEventListener("change", (e) => this._onFormChange(e));
    this._dlg.addEventListener("keydown", (e) => {
      // Keep HA's global keyboard shortcuts from firing while typing in the form.
      e.stopPropagation();
      if (e.key === "Enter" && e.target.id === "f-title") { e.preventDefault(); this._saveEvent(); }
    });
    this._dlg.addEventListener("close", () => { this._dlg.innerHTML = ""; this._curEv = null; this._editEv = null; });
    this._built = true;
  }

  /* ---------------------------------------------------------------- layout */

  _inEditor() {
    if (this.preview || this.editMode) return true;
    try { if (new URLSearchParams(location.search).get("edit") === "1") return true; } catch (e) { /* ignore */ }
    let n = this;
    for (let i = 0; i < 40 && n; i++) {
      const tag = n.localName || "";
      if (tag === "hui-card-preview" || tag === "hui-dialog-edit-card" || tag === "hui-card-edit-mode" || tag === "hui-card-options") return true;
      n = n.parentNode || n.host;
    }
    return false;
  }

  _computeMode() {
    const want = String(this._config.layout || "card").toLowerCase();
    if (want !== "fill" && want !== "fullscreen") return "card";
    if (this._inEditor()) return "card"; // never cover the screen while editing the dashboard
    if (want === "fullscreen") {
      let off = false;
      try { off = sessionStorage.getItem("home-calendar-card:fs-off") === "1"; } catch (e) { /* ignore */ }
      return off ? "fill" : "fullscreen";
    }
    return "fill";
  }

  _zoom(mode) {
    const s = this._config.scale;
    if (s != null && s !== "auto" && s !== "") return Math.max(0.5, Math.min(3, Number(s) || 1));
    if (mode === "card") return 1;
    const z = Math.min(window.innerWidth / 1440, window.innerHeight / 860);
    return Math.round(Math.max(1, Math.min(2.5, z)) * 100) / 100;
  }

  _applyLayout(fromResize = false) {
    if (!this._inner) return;
    const mode = this._computeMode();
    const zoom = this._zoom(mode);
    const changed = mode !== this._mode || zoom !== this._zoomVal;
    this._mode = mode;
    this._zoomVal = zoom;
    if (changed) {
      this.setAttribute("layout", mode);
      this.style.setProperty("--hcc-zoom", String(zoom));
      this._keepAwake();
      this._renderFsControls();
      if (fromResize) this._render();
    }
    this._inner.classList.toggle("has-todo", !!this._config.todo_entity);
    let pos = String(this._config.todo_position || "auto").toLowerCase();
    if (pos === "side") pos = "right";
    if (!["top", "bottom", "left", "right"].includes(pos)) pos = mode === "card" ? "bottom" : "right";
    ["top", "bottom", "left", "right"].forEach((p) => this._inner.classList.toggle(`pos-${p}`, p === pos));
  }

  _renderFsControls() {
    const box = this.shadowRoot.querySelector(".fs-ctl");
    if (!box) return;
    if (this._mode !== "fullscreen") { box.innerHTML = ""; return; }
    const isFs = !!document.fullscreenElement;
    box.innerHTML = `
      ${document.fullscreenEnabled ? `<button class="icon" data-action="browser-fs" title="${isFs ? "Exit browser full screen" : "Browser full screen"}"><ha-icon icon="${isFs ? "mdi:fullscreen-exit" : "mdi:fullscreen"}"></ha-icon></button>` : ""}
      <button class="icon" data-action="fs-off" title="Show Home Assistant (until reload)"><ha-icon icon="mdi:dock-window"></ha-icon></button>`;
  }

  async _keepAwake() {
    const want = this._config?.keep_awake ?? (this._mode === "fullscreen" || this._mode === "fill");
    if (!want || !this.isConnected) {
      if (this._wakeLock) { this._wakeLock.release().catch(() => {}); this._wakeLock = null; }
      return;
    }
    if (this._wakeLock || !navigator.wakeLock || document.visibilityState !== "visible") return;
    try {
      this._wakeLock = await navigator.wakeLock.request("screen");
      this._wakeLock.addEventListener("release", () => { this._wakeLock = null; });
    } catch (e) { /* not allowed (needs HTTPS) – ignore */ }
  }

  async _browserFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch (e) { /* ignore */ }
    setTimeout(() => this._renderFsControls(), 300);
  }

  _applyTheme() {
    const key = THEMES[this._config.theme] ? this._config.theme : "auto";
    if (key === this._themeKey) return;
    this._themeKey = key;
    const t = THEMES[key];
    Object.entries(THEME_VARS).forEach(([k, cssVar]) => {
      if (t.vars) this.style.setProperty(cssVar, t.vars[k]); else this.style.removeProperty(cssVar);
    });
    if (t.vars) this.style.setProperty("color-scheme", t.dark ? "dark" : "light"); else this.style.removeProperty("color-scheme");
    this.setAttribute("data-theme", key);
  }

  _render() {
    if (!this._config) return;
    if (!this._built) this._build();
    this._applyTheme();
    this._applyLayout();
    if (this._todoKey === null || this._todoKey === undefined || this._hass) this._buildTodo();
    const c = this._config;
    const body = this._view === "month" ? this._renderMonth() : this._view === "week" ? this._renderWeek() : this._renderAgenda();
    const maxH = c.max_height ? ` style="max-height:${esc(c.max_height)};overflow:auto"` : "";
    this._main.innerHTML = `
      ${c.show_header !== false ? this._renderHeader() : ""}
      ${this._renderCountdowns()}
      ${this._renderToolbar()}
      ${c.show_calendar_chips !== false && this._calendars.length > 1 ? this._renderChips() : ""}
      <div class="progress ${this._loading ? "on" : ""}"></div>
      ${this._error ? `<div class="error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon>${esc(this._error)}</div>` : ""}
      <div class="body view-${this._view}"${maxH}>${body}</div>`;
  }

  _renderHeader() {
    const now = new Date();
    const c = this._config;
    const eyebrow = c.title || this._fmt({ weekday: "long" }).format(now);
    const big = c.title
      ? this._fmt({ weekday: "long", day: "numeric", month: "long" }).format(now)
      : this._fmt({ day: "numeric", month: "long" }).format(now);
    return `<div class="header">
      <div class="title-block"><div class="eyebrow">${esc(eyebrow)}</div><div class="big">${esc(big)}</div></div>
      ${this._renderNowWeather()}
    </div>`;
  }

  _renderNowWeather() {
    const id = this._config.weather_entity;
    const st = id && this._hass?.states[id];
    if (!st) return "";
    const unit = st.attributes.temperature_unit || "°";
    const today = this._forecast[dayKey(new Date())];
    const cond = this._hass.formatEntityState ? this._hass.formatEntityState(st) : wxName(st.state);
    const hiLo = today ? ` · ${round(today.temperature)}°${today.templow != null ? ` / ${round(today.templow)}°` : ""}` : "";
    return `<button class="now-wx" data-action="more-info" data-entity="${esc(id)}" title="${esc(cond)}">
      <ha-icon icon="${wxIcon(st.state)}" style="color:${wxColor(st.state)}"></ha-icon>
      <div><div class="temp">${round(st.attributes.temperature)}<span>${esc(unit)}</span></div>
      <div class="cond">${esc(cond)}${hiLo}</div></div>
    </button>`;
  }

  _renderToolbar() {
    const views = [["agenda", "Agenda"], ["week", "Week"], ["month", "Month"]];
    const canAdd = this._config.allow_add !== false && this._writable().length > 0;
    return `<div class="toolbar">
      <div class="seg">${views.map(([v, l]) => `<button class="${this._view === v ? "on" : ""}" data-action="view" data-view="${v}">${l}</button>`).join("")}</div>
      <div class="nav">
        <button class="icon" data-action="prev" title="Previous"><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <button class="today" data-action="today">Today</button>
        <button class="icon" data-action="next" title="Next"><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        <span class="range">${esc(this._rangeLabel())}</span>
      </div>
      ${this._config.layout === "fullscreen" && this._mode === "fill" && !this._inEditor() ? `<button class="icon" data-action="fs-on" title="Back to full screen"><ha-icon icon="mdi:fullscreen"></ha-icon></button>` : ""}
      ${canAdd ? `<button class="add" data-action="add"><ha-icon icon="mdi:plus"></ha-icon><span>Event</span></button>` : ""}
    </div>`;
  }

  _renderChips() {
    return `<div class="chips">${this._calendars.map((c) => `
      <button class="chip ${this._hidden.has(c.entity) ? "off" : ""}" style="--c:${esc(c.color)}" data-action="toggle-cal" data-entity="${esc(c.entity)}">
        ${this._avatar(c, "sm") || `<span class="dot"></span>`}${esc(this._calName(c))}
      </button>`).join("")}</div>`;
  }

  _wxBadge(d, compact = false) {
    const f = this._forecast[dayKey(d)];
    if (!f) return "";
    const rain = Number(f.precipitation_probability);
    return `<span class="wx ${compact ? "compact" : ""}" title="${esc(wxName(f.condition))}">
      <ha-icon icon="${wxIcon(f.condition)}" style="color:${wxColor(f.condition)}"></ha-icon>
      <b>${round(f.temperature)}°</b>${f.templow != null ? `<i>${round(f.templow)}°</i>` : ""}
      ${!compact && rain > 0 ? `<span class="rain"><ha-icon icon="mdi:umbrella-outline"></ha-icon>${Math.round(rain)}%</span>` : ""}
    </span>`;
  }

  _eventRow(ev, day) {
    const now = new Date();
    const live = !ev.allDay && ev.start <= now && ev.end > now;
    const past = ev.end <= now;
    const bday = this._isBday(ev);
    const icon = this._typeIcon(ev);
    const label = bday ? this._yearlyLabel(ev) : this._timeLabel(ev, day);
    return `<div class="ev ${live ? "live" : ""} ${past ? "past" : ""} ${bday ? "bday" : ""}" style="--c:${esc(ev.cal.color)}" data-action="open-event" data-id="${ev.id}">
      <div class="bar"></div>
      <div class="ev-body">
        <div class="ev-time">${live ? `<span class="pulse"></span>Now · ` : ""}${esc(label)}</div>
        <div class="ev-title">${icon ? `<ha-icon icon="${esc(icon)}"></ha-icon>` : ""}${esc(ev.summary)}</div>
        ${ev.location ? `<div class="ev-sub"><ha-icon icon="mdi:map-marker-outline"></ha-icon><span>${esc(ev.location)}</span></div>` : ""}
      </div>
      ${this._calendars.length > 1 ? `<div class="ev-cal">${this._avatar(ev.cal)}<span class="ev-cal-name">${esc(this._calName(ev.cal))}</span></div>` : ""}
    </div>`;
  }

  _renderAgenda() {
    const { start, days } = this._range();
    const today = dayKey(new Date());
    let out = "";
    for (let i = 0; i < days; i++) {
      const d = addDays(start, i);
      const evs = this._eventsOn(d);
      const hols = this._holidayTags(d);
      const isToday = dayKey(d) === today;
      if (!evs.length && !hols && !isToday && !this._config.show_empty_days) continue;
      out += `<div class="aday ${isToday ? "is-today" : ""}">
        <button class="aday-date" data-action="open-day" data-date="${dayKey(d)}">
          <div class="wd">${esc(this._fmt({ weekday: "short" }).format(d))}</div>
          <div class="dn">${d.getDate()}</div>
          <div class="mo">${esc(this._fmt({ month: "short" }).format(d))}</div>
        </button>
        <div class="aday-main">
          <div class="aday-head"><div class="head-l"><span class="rel">${esc(this._relDay(d))}</span>${hols}</div>${this._wxBadge(d)}</div>
          ${evs.length ? evs.map((ev) => this._eventRow(ev, d)).join("") : hols ? "" : `<div class="empty-day">Nothing planned</div>`}
        </div>
      </div>`;
    }
    return out || `<div class="empty"><ha-icon icon="mdi:calendar-check-outline"></ha-icon><div>No events in this period</div></div>`;
  }

  _renderWeek() {
    const { start } = this._range();
    const today = dayKey(new Date());
    let out = `<div class="week">`;
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      const evs = this._eventsOn(d);
      out += `<div class="wcol ${dayKey(d) === today ? "is-today" : ""}">
        <button class="whead" data-action="open-day" data-date="${dayKey(d)}">
          <div class="wd">${esc(this._fmt({ weekday: "short" }).format(d))}</div>
          <div class="dn">${d.getDate()}</div>
          ${this._wxBadge(d, true)}
        </button>
        <div class="wevs">${this._holidaysOn(d).map((ev) => `<div class="whol" style="--c:${esc(ev.cal.color)}" data-action="open-event" data-id="${ev.id}">${esc(ev.summary)}</div>`).join("")}${evs.map((ev) => `
          <div class="wev ${ev.allDay ? "allday" : ""} ${this._isBday(ev) ? "bday" : ""} ${ev.end <= new Date() ? "past" : ""}" style="--c:${esc(ev.cal.color)}" data-action="open-event" data-id="${ev.id}">
            <div class="t"><span class="short">${esc(this._isBday(ev) ? this._yearlyLabel(ev, true) : this._shortLabel(ev, d))}</span><span class="full">${esc(this._isBday(ev) ? this._yearlyLabel(ev) : this._timeLabel(ev, d))}</span></div><div class="s">${this._typeIcon(ev) ? `<ha-icon icon="${esc(this._typeIcon(ev))}"></ha-icon>` : ""}${esc(ev.summary)}</div>
          </div>`).join("")}</div>
      </div>`;
    }
    return out + `</div>`;
  }

  _renderMonth() {
    const { start, days } = this._range();
    const month = this._anchor.getMonth();
    const today = dayKey(new Date());
    const max = Math.max(1, Number(this._config.max_events_per_day) || (this._mode === "card" ? 3 : 6));
    const wdFmt = this._fmt({ weekday: "short" });
    let out = `<div class="month"><div class="mhead">`;
    for (let i = 0; i < 7; i++) out += `<div>${esc(wdFmt.format(addDays(start, i)))}</div>`;
    out += `</div><div class="mgrid">`;
    for (let i = 0; i < days; i++) {
      const d = addDays(start, i);
      const evs = this._eventsOn(d);
      const f = this._forecast[dayKey(d)];
      const hol = this._holidaysOn(d)[0];
      const more = evs.length - max;
      out += `<div class="mcell ${d.getMonth() !== month ? "other" : ""} ${dayKey(d) === today ? "is-today" : ""} ${hol ? "has-hol" : ""}" ${hol ? `style="--hol:${esc(hol.cal.color)}"` : ""} data-action="open-day" data-date="${dayKey(d)}">
        <div class="mtop"><span class="mdn">${d.getDate()}</span>${f ? `<span class="mwx"><ha-icon icon="${wxIcon(f.condition)}" style="color:${wxColor(f.condition)}"></ha-icon><b>${round(f.temperature)}°</b></span>` : ""}</div>
        ${hol ? `<div class="mhol" style="--c:${esc(hol.cal.color)}" title="${esc(hol.summary)}">${esc(hol.summary)}</div>` : ""}
        <div class="mevs">${evs.slice(0, max).map((ev) => `
          <div class="mev ${ev.allDay && !this._isBday(ev) ? "allday" : ""}" style="--c:${esc(ev.cal.color)}" data-action="open-event" data-id="${ev.id}" title="${esc(ev.summary)}">
            ${this._typeIcon(ev) ? `<ha-icon class="mcake" icon="${esc(this._typeIcon(ev))}"></ha-icon>` : `<span class="mdot"></span>`}<span class="mtxt">${esc(ev.summary)}</span>
          </div>`).join("")}
          ${more > 0 ? `<div class="more">+${more}</div>` : ""}</div>
      </div>`;
    }
    return out + `</div></div>`;
  }

  /* --------------------------------------------------------------- dialogs */

  _openDialog(html) {
    this._dlg.innerHTML = html;
    if (!this._dlg.open) {
      try { this._dlg.showModal(); } catch (e) { this._dlg.setAttribute("open", ""); }
    }
  }

  _closeDialog() {
    if (this._dlg.open) this._dlg.close();
  }

  _openEvent(ev) {
    this._curEv = ev;
    const allowDel = this._config.allow_delete !== false;
    const allowEdit = this._config.allow_edit !== false;
    const feats = this._features(ev.cal.entity);
    const canDel = allowDel && ev.uid && (feats & FEATURE_DELETE);
    const canEdit = allowEdit && ev.uid && (feats & FEATURE_UPDATE);
    const missing = [allowEdit && !canEdit && "edit", allowDel && !canDel && "delete"].filter(Boolean);
    let delNote = "";
    if (missing.length && !ev.uid) delNote = "This event can't be changed from here.";
    else if (missing.length === 2) delNote = "This calendar is read-only in Home Assistant.";
    else if (missing.length === 1) delNote = `This calendar can't ${missing[0]} events from Home Assistant.`;
    const f = this._forecast[dayKey(ev.start)];
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location)}`;
    this._openDialog(`
      <div class="dlg-head" style="--c:${esc(ev.cal.color)}">
        <span class="dlg-dot"></span><div class="dlg-title">${esc(ev.summary)}</div>
        <button class="icon" data-action="close" title="Close"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
      <div class="dlg-body">
        <div class="row"><ha-icon icon="mdi:clock-outline"></ha-icon><div>${esc(this._whenText(ev))}${ev.age ? `<div class="muted">${this._ty(ev).style === "anniversary" ? `${ordinal(ev.age)} anniversary 💍` : `Turns ${ev.age} 🎂`}</div>` : ""}${ev.rrule || ev.recurrence_id ? `<div class="muted">Repeating event</div>` : ""}</div></div>
        ${ev.type !== "standard" ? `<div class="row"><ha-icon icon="${esc(this._typeIcon(ev) || "mdi:tag-outline")}" style="color:${esc(ev.cal.color)}"></ha-icon><div>${esc(this._ty(ev).name || ev.type)}</div></div>` : ""}
        ${ev.location ? `<div class="row"><ha-icon icon="mdi:map-marker-outline"></ha-icon><a href="${mapUrl}" target="_blank" rel="noopener">${esc(ev.location)}</a></div>` : ""}
        <div class="row"><ha-icon icon="mdi:calendar-blank-outline"></ha-icon><div class="cal-line">${this._avatar(ev.cal, "sm") || `<span class="cal-dot" style="--c:${esc(ev.cal.color)}"></span>`}${esc(this._calName(ev.cal))}</div></div>
        ${f ? `<div class="row"><ha-icon icon="${wxIcon(f.condition)}" style="color:${wxColor(f.condition)}"></ha-icon><div>${this._forecastText(f)}</div></div>` : ""}
        ${ev.description ? `<div class="row"><ha-icon icon="mdi:text"></ha-icon><div class="desc">${esc(ev.description)}</div></div>` : ""}
        <div class="f-err"></div>
      </div>
      <div class="dlg-foot">
        ${canDel ? `<button class="btn danger" data-action="delete"><ha-icon icon="mdi:delete-outline"></ha-icon><span>Delete</span></button>` : ""}
        ${canEdit ? `<button class="btn edit" data-action="edit"><ha-icon icon="mdi:pencil-outline"></ha-icon><span>Edit</span></button>` : ""}
        ${delNote ? `<span class="del-note"><ha-icon icon="mdi:lock-outline"></ha-icon>${esc(delNote)}</span>` : ""}
        <span class="sp"></span>
        <button class="btn" data-action="close">Close</button>
      </div>`);
  }

  _isRecurring(ev) { return !!(ev.recurrence_id || ev.rrule); }

  _askDelete() {
    const ev = this._curEv;
    if (!ev) return;
    const foot = this._q(".dlg-foot");
    const rec = this._isRecurring(ev);
    foot.classList.add("confirm");
    foot.innerHTML = rec ? `
      <div class="del-q"><ha-icon icon="mdi:delete-alert-outline"></ha-icon>Delete repeating event</div>
      <div class="del-opts">
        <button class="btn danger-fill" data-action="delete-do" data-scope="one">This event</button>
        <button class="btn danger-line" data-action="delete-do" data-scope="future">This and following</button>
        <button class="btn danger-line" data-action="delete-do" data-scope="all">All events</button>
        <span class="sp"></span>
        <button class="btn" data-action="delete-cancel">Cancel</button>
      </div>` : `
      <div class="del-q"><ha-icon icon="mdi:delete-alert-outline"></ha-icon>Delete “${esc(ev.summary)}”? This can't be undone.</div>
      <div class="del-opts">
        <span class="sp"></span>
        <button class="btn" data-action="delete-cancel">Cancel</button>
        <button class="btn danger-fill" data-action="delete-do" data-scope="one">Delete</button>
      </div>`;
  }

  _forecastText(f) {
    const unit = this._hass?.states[this._config.weather_entity]?.attributes?.temperature_unit || "°";
    const parts = [`${round(f.temperature)}${unit}`];
    if (f.templow != null) parts[0] += ` / ${round(f.templow)}${unit}`;
    if (Number(f.precipitation_probability) > 0) parts.push(`${Math.round(f.precipitation_probability)}% chance of rain`);
    const cond = f.condition ? wxName(f.condition) : "";
    return `<span class="cap">${esc(cond)}</span>${cond ? " · " : ""}${esc(parts.join(" · "))}`;
  }

  _openDay(date) {
    const evs = this._eventsOn(date);
    const canAdd = this._config.allow_add !== false && this._writable().length > 0;
    this._openDialog(`
      <div class="dlg-head">
        <div class="dlg-title">${esc(this._relDay(date))}${sameDay(date, new Date()) || Math.abs(startOfDay(date) - startOfDay(new Date())) <= 864e5 ? `<div class="sub">${esc(this._fmt({ weekday: "long", day: "numeric", month: "long" }).format(date))}</div>` : ""}</div>
        ${this._wxBadge(date)}
        <button class="icon" data-action="close" title="Close"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
      <div class="dlg-body day-list">
        ${this._holidayTags(date) ? `<div class="hols">${this._holidayTags(date)}</div>` : ""}
        ${evs.length ? evs.map((ev) => this._eventRow(ev, date)).join("") : `<div class="empty-day">Nothing planned</div>`}
      </div>
      <div class="dlg-foot">
        <span class="sp"></span>
        ${canAdd ? `<button class="btn primary" data-action="add" data-date="${dayKey(date)}"><ha-icon icon="mdi:plus"></ha-icon><span>Add event</span></button>` : `<button class="btn" data-action="close">Close</button>`}
      </div>`);
  }

  _openAdd(date) { this._openForm(date, null); }

  _openEdit(ev) { this._openForm(null, ev); }

  _openForm(date, ev) {
    this._editEv = ev || null;
    let cals = this._writable();
    if (ev) {
      // Repeating events can only be changed in place; one-off events can also move to another calendar
      // (create in the new one + delete from the old one), which needs delete support on the old calendar.
      const canMove = !this._isRecurring(ev) && (this._features(ev.cal.entity) & FEATURE_DELETE);
      cals = canMove ? cals : [];
      if (!cals.some((c) => c.entity === ev.cal.entity)) cals = [ev.cal, ...cals];
    }
    if (!cals.length) return;
    const now = new Date();
    let s;
    if (ev) {
      s = new Date(ev.start);
    } else if (date && !sameDay(date, now)) {
      s = new Date(date);
      s.setHours(9, 0, 0, 0);
    } else {
      s = new Date(now);
      s.setMinutes(0, 0, 0);
      s.setHours(s.getHours() + 1);
    }
    let e = new Date(s.getTime() + 3600e3);
    this._addDur = 3600e3;
    if (ev) {
      // all-day end dates are exclusive in HA – the form shows the last day
      e = ev.allDay ? addDays(ev.end, -1) : new Date(ev.end);
      if (ev.allDay && e < s) e = new Date(s);
      if (!ev.allDay && ev.end > ev.start) this._addDur = ev.end - ev.start;
    }
    this._addCal = ev ? ev.cal.entity : (cals.find((c) => !this._hidden.has(c.entity)) || cals[0]).entity;
    const selColor = cals.find((c) => c.entity === this._addCal).color;
    const defType = (ev && this._types.find((t) => t.id === ev.type))
      || this._types.find((t) => t.id === (this._config.default_event_type || "standard")) || this._types[0];
    const rr = ev?.rrule || "";
    const repeats = rr && !REPEATS.some(([v]) => v === rr) ? [...REPEATS, [rr, "Custom (keep as is)"]] : REPEATS;
    this._openDialog(`
      <div class="dlg-head">
        <div class="dlg-title">${ev ? "Edit event" : "New event"}</div>
        <button class="icon" data-action="close" title="Close"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
      <div class="dlg-body form" style="--c:${esc(selColor)}">
        <input id="f-title" class="inp" placeholder="Add title" autocomplete="off" value="${ev ? esc(ev.title || ev.summary) : ""}">
        <div class="sel-row">
          <label class="selbox"><span class="lbl">Type</span>
            <span class="sel-wrap"><ha-icon id="f-type-icon" icon="${esc(defType.icon || "mdi:calendar-blank-outline")}"></ha-icon>
            <select id="f-type" class="inp">${this._types.map((t) => `<option value="${esc(t.id)}" ${t.id === defType.id ? "selected" : ""}>${esc(t.name || t.id)}</option>`).join("")}</select></span>
          </label>
          <label class="selbox"><span class="lbl">Repeat</span>
            <span class="sel-wrap"><ha-icon icon="mdi:repeat"></ha-icon>
            <select id="f-rep" class="inp">${repeats.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("")}</select></span>
          </label>
        </div>
        <div>
          <div class="lbl">Calendar</div>
          <div class="cal-pick">${cals.map((c) => `
            <button type="button" class="chip ${c.entity === this._addCal ? "sel" : ""}" style="--c:${esc(c.color)}" data-action="pick-cal" data-entity="${esc(c.entity)}">
              ${this._avatar(c, "sm") || `<span class="dot"></span>`}${esc(this._calName(c))}
            </button>`).join("")}</div>
        </div>
        <label class="switch"><input type="checkbox" id="f-allday"><span class="track"></span>All day</label>
        <div class="dt"><span class="lbl">Starts</span><input class="inp" type="date" id="f-sd" value="${dayKey(s)}"><input class="inp" type="time" id="f-st" value="${timeKey(s)}"></div>
        <div class="dt"><span class="lbl">Ends</span><input class="inp" type="date" id="f-ed" value="${dayKey(e)}"><input class="inp" type="time" id="f-et" value="${timeKey(e)}"></div>
        <div id="f-wx" class="f-wx"></div>
        <input id="f-loc" class="inp" placeholder="Location" autocomplete="off" value="${ev ? esc(ev.location) : ""}">
        <textarea id="f-desc" class="inp" rows="3" placeholder="Description">${ev ? esc(ev.description) : ""}</textarea>
        ${ev && this._isRecurring(ev) ? `<div class="form-note"><ha-icon icon="mdi:repeat"></ha-icon>Repeating event – you'll choose which events to change when you save.</div>` : ""}
        <div class="f-err"></div>
      </div>
      <div class="dlg-foot">
        <span class="sp"></span>
        <button class="btn" data-action="${ev ? "edit-cancel" : "close"}">Cancel</button>
        <button class="btn primary" data-action="save">Save</button>
      </div>`);
    this._formFoot = this._q(".dlg-foot").innerHTML;
    if (ev) {
      // keep the event's own settings rather than the type's defaults
      this._q("#f-type-icon").setAttribute("icon", defType.icon || "mdi:calendar-blank-outline");
      const ad = this._q("#f-allday");
      ad.checked = ev.allDay;
      this._q(".form").classList.toggle("allday", ev.allDay);
      this._q("#f-rep").value = rr;
    } else {
      this._applyType(defType);
    }
    this._updateAddWeather();
    setTimeout(() => this._dlg.querySelector("#f-title")?.focus(), 50);
  }

  _q(sel) { return this._dlg.querySelector(sel); }

  _formStart() {
    const sd = this._q("#f-sd")?.value;
    if (!sd) return null;
    const d = new Date(`${sd}T${this._q("#f-allday").checked ? "00:00" : (this._q("#f-st").value || "00:00")}`);
    return isNaN(d) ? null : d;
  }

  _formEnd() {
    const ed = this._q("#f-ed")?.value;
    if (!ed) return null;
    const d = new Date(`${ed}T${this._q("#f-allday").checked ? "00:00" : (this._q("#f-et").value || "00:00")}`);
    return isNaN(d) ? null : d;
  }

  _applyType(ty) {
    if (!ty || !this._q(".form")) return;
    const ad = this._q("#f-allday");
    ad.checked = !!ty.all_day;
    this._q(".form").classList.toggle("allday", ad.checked);
    if (ad.checked) {
      const s = this._formStart();
      const en = this._formEnd();
      if (s && en && en < s) this._q("#f-ed").value = dayKey(s);
    }
    this._q("#f-rep").value = REPEATS.some(([v]) => v === toRrule(ty.repeat)) ? toRrule(ty.repeat) : "";
    this._q("#f-type-icon").setAttribute("icon", ty.icon || "mdi:calendar-blank-outline");
    this._q(".form").classList.toggle("typed", !!ty.icon);
  }

  _onFormChange(e) {
    const id = e.target.id;
    if (!id || !this._q(".form")) return;
    if (id === "f-type") this._applyType(this._typeById(e.target.value));
    if (id === "f-allday") {
      this._q(".form").classList.toggle("allday", e.target.checked);
      const s = this._formStart();
      const en = this._formEnd();
      if (e.target.checked && s && en && en < s) this._q("#f-ed").value = dayKey(s);
    }
    if (id === "f-sd" || id === "f-st") {
      const s = this._formStart();
      if (s) {
        if (this._q("#f-allday").checked) {
          const en = this._formEnd();
          if (!en || en < s) this._q("#f-ed").value = dayKey(s);
        } else {
          const en = new Date(s.getTime() + (this._addDur || 3600e3));
          this._q("#f-ed").value = dayKey(en);
          this._q("#f-et").value = timeKey(en);
        }
      }
      this._updateAddWeather();
    }
    if (id === "f-ed" || id === "f-et") {
      const s = this._formStart();
      const en = this._formEnd();
      if (s && en && en > s && !this._q("#f-allday").checked) this._addDur = en - s;
    }
    this._setFormError("");
  }

  _updateAddWeather() {
    const box = this._q("#f-wx");
    if (!box) return;
    const s = this._formStart();
    const f = s && this._forecast[dayKey(s)];
    box.innerHTML = f
      ? `<ha-icon icon="${wxIcon(f.condition)}" style="color:${wxColor(f.condition)}"></ha-icon><span>Forecast: ${this._forecastText(f)}</span>`
      : "";
  }

  _setFormError(msg) {
    const el = this._q(".f-err");
    if (el) el.textContent = msg;
  }

  async _saveEvent(scope) {
    const editing = this._editEv;
    const title = this._q("#f-title")?.value.trim();
    if (!title) { this._setFormError("Please add a title."); this._q("#f-title").focus(); return; }
    const allDay = this._q("#f-allday").checked;
    const sd = this._q("#f-sd").value;
    const ed = this._q("#f-ed").value || sd;
    const data = { summary: title };
    if (!sd) { this._setFormError("Please choose a start date."); return; }
    if (allDay) {
      if (ed < sd) { this._setFormError("End date is before the start date."); return; }
      data.start_date = sd;
      data.end_date = dayKey(addDays(parseDate(ed), 1)); // HA end_date is exclusive
    } else {
      const st = this._q("#f-st").value;
      const et = this._q("#f-et").value;
      if (!st || !et) { this._setFormError("Please choose start and end times."); return; }
      if (new Date(`${ed}T${et}`) <= new Date(`${sd}T${st}`)) { this._setFormError("End must be after start."); return; }
      data.start_date_time = `${sd} ${st}:00`;
      data.end_date_time = `${ed} ${et}:00`;
    }
    const loc = this._q("#f-loc").value.trim();
    const ty = this._typeById(this._q("#f-type")?.value);
    const tag = ty && ty.id !== "standard" ? `#${ty.id}` : "";
    const desc = [this._q("#f-desc").value.trim(), tag].filter(Boolean).join("\n\n");
    const rrule = this._q("#f-rep")?.value || "";
    if (loc) data.location = loc;
    if (desc) data.description = desc;

    if (editing) return this._updateEvent(editing, scope, { title, allDay, sd, ed, data, rrule });

    const btn = this._q('[data-action="save"]');
    btn.disabled = true;
    btn.textContent = "Saving…";
    try {
      if (rrule) {
        // Repeating events go through the websocket API, which supports RRULE.
        const event = { summary: data.summary, rrule };
        if (allDay) { event.dtstart = data.start_date; event.dtend = data.end_date; }
        else {
          event.dtstart = isoLocal(new Date(`${sd}T${this._q("#f-st").value}`));
          event.dtend = isoLocal(new Date(`${ed}T${this._q("#f-et").value}`));
        }
        if (data.location) event.location = data.location;
        if (data.description) event.description = data.description;
        await this._hass.callWS({ type: "calendar/event/create", entity_id: this._addCal, event });
      } else {
        await this._hass.callService("calendar", "create_event", data, { entity_id: this._addCal });
      }
      this._closeDialog();
      this._toast(`Added “${title}”`);
      // Some integrations (e.g. CalDAV) take a moment before the new event is listed.
      this._fetchEvents();
      this._fetchCountdowns();
      setTimeout(() => { this._fetchEvents(); this._fetchCountdowns(); }, 4000);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = "Save";
      this._setFormError(err?.message || "Could not create the event.");
    }
  }

  _eventPayload({ allDay, sd, ed, data }, rrule) {
    const event = { summary: data.summary };
    if (allDay) { event.dtstart = data.start_date; event.dtend = data.end_date; }
    else {
      event.dtstart = isoLocal(new Date(`${sd}T${this._q("#f-st").value}`));
      event.dtend = isoLocal(new Date(`${ed}T${this._q("#f-et").value}`));
    }
    if (data.location) event.location = data.location;
    if (data.description) event.description = data.description;
    if (rrule) event.rrule = rrule;
    return event;
  }

  _askEditScope() {
    const foot = this._q(".dlg-foot");
    foot.classList.add("confirm", "edit-confirm");
    foot.innerHTML = `
      <div class="del-q"><ha-icon icon="mdi:repeat"></ha-icon>Save changes to a repeating event</div>
      <div class="del-opts">
        <button class="btn primary" data-action="save-scope" data-scope="one">This event</button>
        <button class="btn line" data-action="save-scope" data-scope="future">This and following</button>
        <span class="sp"></span>
        <button class="btn" data-action="save-back">Back</button>
      </div>`;
  }

  async _updateEvent(ev, scope, f) {
    const rec = this._isRecurring(ev);
    if (rec && !scope) { this._askEditScope(); return; }
    const moving = this._addCal !== ev.cal.entity;
    const busy = (on) => this._dlg.querySelectorAll('[data-action^="save"]').forEach((b) => { b.disabled = on; });
    busy(true);
    const sb = this._q('[data-action="save"]');
    if (sb) sb.textContent = "Saving…";
    try {
      if (moving) {
        // Move = create in the new calendar, then remove from the old one
        await this._hass.callWS({ type: "calendar/event/create", entity_id: this._addCal, event: this._eventPayload(f, f.rrule) });
        await this._hass.callWS({ type: "calendar/event/delete", entity_id: ev.cal.entity, uid: ev.uid });
      } else {
        // a single occurrence can't carry its own repeat rule
        const event = this._eventPayload(f, rec && scope === "one" ? "" : f.rrule);
        const msg = { type: "calendar/event/update", entity_id: ev.cal.entity, uid: ev.uid, event };
        if (rec && ev.recurrence_id) {
          msg.recurrence_id = ev.recurrence_id;
          if (scope === "future") msg.recurrence_range = "THISANDFUTURE";
        }
        await this._hass.callWS(msg);
      }
      this._editEv = null;
      this._closeDialog();
      const cal = this._calendars.find((c) => c.entity === this._addCal);
      this._toast(moving ? `Moved “${f.title}” to ${this._calName(cal)}` : `Saved “${f.title}”`);
      this._fetchEvents();
      this._fetchCountdowns();
      setTimeout(() => { this._fetchEvents(); this._fetchCountdowns(); }, 4000);
    } catch (err) {
      if (this._q(".edit-confirm")) this._restoreFormFoot();
      busy(false);
      const b = this._q('[data-action="save"]');
      if (b) b.textContent = "Save";
      this._setFormError(err?.message || "Could not save the changes.");
    }
  }

  _restoreFormFoot() {
    const foot = this._q(".dlg-foot");
    if (!foot || !this._formFoot) return;
    foot.classList.remove("confirm", "edit-confirm");
    foot.innerHTML = this._formFoot;
  }

  async _deleteEvent(scope = "one") {
    const ev = this._curEv;
    if (!ev) return;
    this._dlg.querySelectorAll('[data-action^="delete"]').forEach((b) => { b.disabled = true; });
    try {
      const msg = { type: "calendar/event/delete", entity_id: ev.cal.entity, uid: ev.uid };
      if (this._isRecurring(ev) && scope !== "all" && ev.recurrence_id) {
        msg.recurrence_id = ev.recurrence_id;
        if (scope === "future") msg.recurrence_range = "THISANDFUTURE";
      }
      await this._hass.callWS(msg);
      this._closeDialog();
      this._toast(scope === "all" ? `Deleted all “${ev.summary}” events`
        : scope === "future" ? `Deleted “${ev.summary}” from ${this._fmt({ day: "numeric", month: "short" }).format(ev.start)} on`
          : `Deleted “${ev.summary}”`);
      this._fetchEvents();
      this._fetchCountdowns();
    } catch (err) {
      this._dlg.querySelectorAll('[data-action^="delete"]').forEach((b) => { b.disabled = false; });
      this._setFormError(err?.message || "Could not delete the event.");
    }
  }

  _toast(message) { this._notify(message); }

  _notify(message, action) {
    if (this._mode !== "fullscreen") {
      const detail = action ? { message, action } : { message };
      this.dispatchEvent(new CustomEvent("hass-notification", { detail, bubbles: true, composed: true }));
      return;
    }
    // HA's own toast would be hidden under the full-screen card, so show our own.
    const el = this.shadowRoot.querySelector(".hcc-toast");
    clearTimeout(this._toastTimer);
    el.innerHTML = `<span>${esc(message)}</span>${action ? `<button class="toast-btn">${esc(action.text)}</button>` : ""}`;
    el.classList.add("on");
    if (action) el.querySelector(".toast-btn").onclick = () => { el.classList.remove("on"); action.action(); };
    this._toastTimer = setTimeout(() => el.classList.remove("on"), action ? 6000 : 3500);
  }

  /* ---------------------------------------------------------------- events */

  _onClick(e) {
    if (e.target === this._dlg) { this._closeDialog(); return; } // backdrop
    if (this._mode === "fullscreen" && this._config.browser_fullscreen && !document.fullscreenElement && document.fullscreenEnabled
      && !e.composedPath().some((n) => n.dataset?.action === "browser-fs")) {
      document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
    }
    const el = e.composedPath().find((n) => n instanceof HTMLElement && n.dataset && n.dataset.action);
    if (!el) return;
    const { action } = el.dataset;
    switch (action) {
      case "view":
        if (this._view !== el.dataset.view) {
          this._view = el.dataset.view;
          this._fetchEvents();
        }
        break;
      case "prev":
      case "next": {
        const dir = action === "next" ? 1 : -1;
        if (this._view === "month") this._anchor = new Date(this._anchor.getFullYear(), this._anchor.getMonth() + dir, 1);
        else if (this._view === "week") this._anchor = addDays(this._anchor, 7 * dir);
        else this._anchor = addDays(this._anchor, (Math.max(1, Number(this._config.days_to_show) || 7)) * dir);
        this._fetchEvents();
        break;
      }
      case "today":
        this._anchor = startOfDay(new Date());
        this._fetchEvents();
        break;
      case "toggle-cal": {
        const ent = el.dataset.entity;
        if (this._hidden.has(ent)) this._hidden.delete(ent); else this._hidden.add(ent);
        this._saveHidden();
        this._render();
        break;
      }
      case "add":
        this._openAdd(el.dataset.date ? parseDate(el.dataset.date) : null);
        break;
      case "open-day":
        this._openDay(parseDate(el.dataset.date));
        break;
      case "open-event": {
        const ev = this._events.find((x) => x.id === el.dataset.id);
        if (ev) this._openEvent(ev);
        break;
      }
      case "open-cd": {
        const t = Number(el.dataset.start);
        const ev = this._events.find((x) => x.start.getTime() === t && x.summary === el.dataset.name);
        if (ev) this._openEvent(ev);
        else { this._view = "agenda"; this._anchor = startOfDay(new Date(t)); this._fetchEvents(); }
        break;
      }
      case "pick-cal": {
        this._addCal = el.dataset.entity;
        this._dlg.querySelectorAll(".cal-pick .chip").forEach((c) => c.classList.toggle("sel", c === el));
        const cal = this._calendars.find((c) => c.entity === this._addCal);
        if (cal) this._q(".form").style.setProperty("--c", cal.color);
        break;
      }
      case "save":
        this._saveEvent();
        break;
      case "save-scope":
        this._saveEvent(el.dataset.scope);
        break;
      case "save-back":
        this._restoreFormFoot();
        break;
      case "edit":
        if (this._curEv) this._openEdit(this._curEv);
        break;
      case "edit-cancel":
        this._editEv = null;
        if (this._curEv) this._openEvent(this._curEv); else this._closeDialog();
        break;
      case "delete":
        this._askDelete();
        break;
      case "delete-do":
        this._deleteEvent(el.dataset.scope);
        break;
      case "delete-cancel":
        if (this._curEv) this._openEvent(this._curEv);
        break;
      case "close":
        this._closeDialog();
        break;
      case "todo-toggle":
        this._todoOpen = !this._todoOpen;
        this._applyTodoState();
        this._todoActivity();
        break;
      case "todo-who":
        this._todoWho = el.dataset.entity;
        this._todoBox.querySelectorAll(".t-who .chip").forEach((c) => c.classList.toggle("sel", c === el));
        break;
      case "todo-done":
        this._todoDone(el.dataset.uid);
        break;
      case "browser-fs":
        this._browserFullscreen();
        break;
      case "fs-off":
        try { sessionStorage.setItem("home-calendar-card:fs-off", "1"); } catch (err) { /* ignore */ }
        this._render();
        break;
      case "fs-on":
        try { sessionStorage.removeItem("home-calendar-card:fs-off"); } catch (err) { /* ignore */ }
        this._render();
        break;
      case "more-info":
        this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: el.dataset.entity }, bubbles: true, composed: true }));
        break;
      default:
    }
  }
}

const STYLES = `
:host { display: block; --hcc-accent: var(--primary-color, #03a9f4); --hcc-muted: var(--secondary-text-color, #727272);
  --hcc-text: var(--primary-text-color, #212121);
  --hcc-line: var(--divider-color, rgba(127,127,127,.2)); --hcc-soft: rgba(127,127,127,.08);
  --hcc-bg: var(--ha-card-background, var(--card-background-color, #fff)); --hcc-on-accent: var(--text-primary-color, #fff); }
ha-card { padding: 16px; overflow: hidden; background: var(--hcc-bg); color: var(--hcc-text); position: relative; }
.wrap { container-type: inline-size; color: var(--hcc-text); }
button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; padding: 0; margin: 0; text-align: inherit; }
ha-icon { --mdc-icon-size: 18px; display: inline-flex; flex: none; }

/* header */
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
.title-block { min-width: 0; }
.eyebrow { font-size: .78rem; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: var(--hcc-accent); }
.big { font-size: 1.85rem; font-weight: 700; line-height: 1.12; letter-spacing: -.015em; margin-top: 2px; }
.now-wx { display: flex; align-items: center; gap: 10px; padding: 8px 16px 8px 10px; border-radius: 999px; background: var(--hcc-soft); flex: none; transition: background .15s; }
.now-wx:hover { background: rgba(127,127,127,.15); }
.now-wx ha-icon { --mdc-icon-size: 34px; }
.temp { font-size: 1.45rem; font-weight: 700; line-height: 1; }
.temp span { font-size: .85rem; font-weight: 500; color: var(--hcc-muted); margin-left: 1px; }
.cond { font-size: .78rem; color: var(--hcc-muted); white-space: nowrap; margin-top: 2px; }

/* toolbar */
.toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.seg { display: inline-flex; background: var(--hcc-soft); border-radius: 10px; padding: 3px; }
.seg button { padding: 6px 12px; border-radius: 8px; font-size: .85rem; font-weight: 600; color: var(--hcc-muted); transition: all .15s; }
.seg button.on { background: var(--hcc-bg); color: var(--hcc-text); box-shadow: 0 1px 3px rgba(0,0,0,.18); }
.nav { display: flex; align-items: center; gap: 2px; flex: 1; min-width: 0; }
.icon { width: 34px; height: 34px; border-radius: 50%; display: inline-grid; place-items: center; flex: none; transition: background .15s; }
.icon:hover { background: var(--hcc-soft); }
.icon ha-icon { --mdc-icon-size: 22px; }
.today { padding: 5px 12px; border: 1px solid var(--hcc-line); border-radius: 999px; font-size: .82rem; font-weight: 600; }
.today:hover { background: var(--hcc-soft); }
.range { margin-left: 8px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.add { display: inline-flex; align-items: center; gap: 4px; padding: 7px 14px 7px 10px; border-radius: 999px; background: var(--hcc-accent); color: var(--hcc-on-accent); font-weight: 700; font-size: .85rem; box-shadow: 0 2px 8px color-mix(in srgb, var(--hcc-accent) 40%, transparent); transition: transform .12s; }
.add:hover { transform: translateY(-1px); }
.add:active { transform: none; }

/* calendar chips */
.chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 11px 4px 9px; border-radius: 999px; font-size: .8rem; font-weight: 500;
  border: 1px solid color-mix(in srgb, var(--c) 45%, transparent); background: color-mix(in srgb, var(--c) 13%, transparent); transition: all .15s; }
.chip .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--c); flex: none; }
.chip.off { opacity: .5; background: none; border-color: var(--hcc-line); }
.chip.off .dot { background: none; box-shadow: inset 0 0 0 1.5px var(--c); }

/* avatars */
.av { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex: none; border: 2px solid var(--c);
  display: inline-grid; place-items: center; background: var(--c); color: #fff; font-size: .66rem; font-weight: 800; box-sizing: border-box; }
.av.sm { width: 20px; height: 20px; font-size: .56rem; border-width: 1.5px; }
.av ha-icon { --mdc-icon-size: 14px; }
.av.sm ha-icon { --mdc-icon-size: 12px; }
.chip .av.sm { margin-left: -3px; }
.chip.off .av { filter: grayscale(1); }
.cal-line { display: flex; align-items: center; gap: 8px; }

/* countdowns */
.cds { display: flex; gap: 8px; overflow-x: auto; margin: 0 -16px 12px; padding: 2px 16px 4px; scrollbar-width: none; scroll-snap-type: x proximity; }
.cds::-webkit-scrollbar { display: none; }
.cd { flex: 0 0 auto; min-width: 124px; max-width: 190px; scroll-snap-align: start; border-radius: 16px; padding: 10px 12px; cursor: default;
  background: linear-gradient(140deg, color-mix(in srgb, var(--c) 24%, transparent), color-mix(in srgb, var(--c) 6%, transparent));
  border: 1px solid color-mix(in srgb, var(--c) 30%, transparent); box-sizing: border-box; }
.cd[data-action] { cursor: pointer; }
.cd.due { background: var(--c); color: #fff; border-color: transparent; }
.cd.due .cd-num span, .cd.due .cd-date { color: rgba(255,255,255,.85); }
.cd-top { display: flex; align-items: center; gap: 8px; }
.cd-icon { width: 30px; height: 30px; border-radius: 10px; background: var(--c); color: #fff; display: grid; place-items: center; flex: none; }
.cd.due .cd-icon { background: rgba(255,255,255,.25); }
.cd-icon ha-icon { --mdc-icon-size: 18px; }
.cd-num { font-size: 1.55rem; font-weight: 800; line-height: 1; letter-spacing: -.02em; }
.cd-num span { font-size: .72rem; font-weight: 600; color: var(--hcc-muted); margin-left: 3px; letter-spacing: 0; }
.cd-name { font-weight: 700; font-size: .84rem; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cd-date { font-size: .72rem; color: var(--hcc-muted); margin-top: 1px; }

/* holidays & birthdays */
.head-l { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }
.hols { display: flex; flex-wrap: wrap; gap: 4px; }
.hol { display: inline-flex; align-items: center; gap: 4px; font-size: .72rem; font-weight: 700; padding: 2px 9px 2px 7px; border-radius: 999px; cursor: pointer;
  background: color-mix(in srgb, var(--c) 16%, transparent); color: color-mix(in srgb, var(--c) 70%, var(--hcc-text)); }
.hol ha-icon { --mdc-icon-size: 13px; }
.ev.bday { background: linear-gradient(90deg, color-mix(in srgb, var(--c) 20%, transparent), color-mix(in srgb, var(--c) 5%, transparent)); }
.ev-title ha-icon, .wev .s ha-icon { --mdc-icon-size: 16px; color: var(--c); margin-right: 5px; vertical-align: -3px; display: inline-block; }
.wev .s ha-icon { --mdc-icon-size: 13px; margin-right: 3px; }
.wev.allday .s ha-icon { color: #fff; }
.whol { font-size: .66rem; font-weight: 700; text-align: center; padding: 3px 4px; border-radius: 6px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  background: color-mix(in srgb, var(--c) 18%, transparent); color: color-mix(in srgb, var(--c) 70%, var(--hcc-text)); }
.mcell.has-hol { background: color-mix(in srgb, var(--hol) 12%, transparent); }
.mhol { font-size: .62rem; font-weight: 700; padding: 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: color-mix(in srgb, var(--c) 75%, var(--hcc-text)); }
.mcake { --mdc-icon-size: 11px; color: var(--c); }
.ev-cal { display: flex; align-items: center; gap: 6px; }

.progress { height: 2px; border-radius: 2px; margin-bottom: 8px; background: transparent; }
.progress.on { background: linear-gradient(90deg, transparent, var(--hcc-accent), transparent); background-size: 200% 100%; animation: load 1.1s linear infinite; }
@keyframes load { from { background-position: 200% 0; } to { background-position: -200% 0; } }
.error { display: flex; gap: 6px; align-items: center; font-size: .8rem; color: var(--error-color, #db4437); margin-bottom: 8px; }

/* agenda */
.aday { display: flex; gap: 14px; padding: 12px 0; border-top: 1px solid var(--hcc-line); }
.aday:first-child { border-top: none; padding-top: 2px; }
.aday-date { width: 46px; flex: none; text-align: center; align-self: flex-start; border-radius: 12px; padding: 2px 0; }
.aday-date:hover { background: var(--hcc-soft); }
.wd { font-size: .7rem; font-weight: 700; text-transform: uppercase; color: var(--hcc-muted); letter-spacing: .06em; }
.aday-date .dn { font-size: 1.4rem; font-weight: 700; width: 38px; height: 38px; display: grid; place-items: center; margin: 1px auto; border-radius: 50%; }
.is-today .aday-date .dn, .is-today .whead .dn, .is-today .mdn { background: var(--hcc-accent); color: var(--hcc-on-accent); }
.aday-date .mo { font-size: .68rem; color: var(--hcc-muted); }
.aday-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.aday-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; min-height: 24px; }
.rel { font-size: .85rem; font-weight: 700; color: var(--hcc-muted); }
.is-today .rel { color: var(--hcc-accent); }
.wx { display: inline-flex; align-items: center; gap: 4px; font-size: .8rem; white-space: nowrap; }
.wx ha-icon { --mdc-icon-size: 20px; }
.wx b { font-weight: 700; }
.wx i { font-style: normal; color: var(--hcc-muted); }
.wx .rain { display: inline-flex; align-items: center; gap: 1px; color: #42A5F5; margin-left: 4px; font-weight: 600; }
.wx .rain ha-icon { --mdc-icon-size: 14px; }
.ev { display: flex; gap: 10px; align-items: stretch; padding: 8px 12px 8px 0; border-radius: 12px; cursor: pointer;
  background: color-mix(in srgb, var(--c) 10%, transparent); transition: background .15s, transform .12s; }
.ev:hover { background: color-mix(in srgb, var(--c) 18%, transparent); }
.ev:active { transform: scale(.99); }
.ev .bar { width: 4px; border-radius: 0 4px 4px 0; background: var(--c); flex: none; }
.ev-body { min-width: 0; flex: 1; }
.ev-time { font-size: .76rem; color: var(--hcc-muted); font-weight: 600; font-variant-numeric: tabular-nums; display: flex; align-items: center; gap: 6px; }
.ev-title { font-weight: 600; font-size: .95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
.ev-sub { font-size: .78rem; color: var(--hcc-muted); display: flex; align-items: center; gap: 3px; margin-top: 2px; min-width: 0; }
.ev-sub span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ev-sub ha-icon { --mdc-icon-size: 14px; }
.ev-cal { font-size: .7rem; color: var(--hcc-muted); align-self: center; white-space: nowrap; max-width: 30%; overflow: hidden; text-overflow: ellipsis; }
.ev.past, .wev.past { opacity: .5; }
.ev.live { box-shadow: inset 0 0 0 1.5px var(--c); }
.ev.live .ev-time { color: var(--c); }
.pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--c); flex: none; animation: pulse 1.8s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--c) 60%, transparent); } 70% { box-shadow: 0 0 0 7px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }
.empty-day { font-size: .85rem; color: var(--hcc-muted); padding: 4px 0; }
.empty { text-align: center; padding: 28px 0; color: var(--hcc-muted); display: grid; justify-items: center; gap: 6px; }
.empty ha-icon { --mdc-icon-size: 36px; opacity: .6; }

/* week */
.week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
.wcol { background: var(--hcc-soft); border-radius: 14px; padding: 8px 6px; min-height: 170px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.wcol.is-today { background: color-mix(in srgb, var(--hcc-accent) 9%, transparent); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--hcc-accent) 45%, transparent); }
.whead { display: flex; flex-direction: column; align-items: center; gap: 2px; padding-bottom: 6px; border-bottom: 1px solid var(--hcc-line); text-align: center; border-radius: 10px 10px 0 0; }
.whead .dn { font-size: 1.15rem; font-weight: 700; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%; }
.wx.compact { font-size: .72rem; gap: 2px; }
.wx.compact ha-icon { --mdc-icon-size: 16px; }
.wevs { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.wev { border-left: 3px solid var(--c); background: color-mix(in srgb, var(--c) 15%, var(--hcc-bg)); border-radius: 4px 8px 8px 4px; padding: 4px 6px; cursor: pointer; font-size: .76rem; min-width: 0; }
.wev:hover { background: color-mix(in srgb, var(--c) 25%, var(--hcc-bg)); }
.wev.allday { background: var(--c); color: #fff; border-left-color: transparent; }
.wev .t { color: var(--hcc-muted); font-size: .68rem; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wev.allday .t { color: rgba(255,255,255,.85); }
.wev .t .full { display: none; }
.wev .s { font-weight: 600; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; word-break: break-word; }

/* month */
.mhead, .mgrid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.mhead div { text-align: center; font-size: .7rem; font-weight: 700; text-transform: uppercase; color: var(--hcc-muted); padding: 2px 0 6px; letter-spacing: .06em; }
.mgrid { gap: 3px; }
.mcell { min-height: 86px; padding: 4px; border-radius: 10px; background: var(--hcc-soft); cursor: pointer; display: flex; flex-direction: column; gap: 3px; min-width: 0; overflow: hidden; transition: background .15s; }
.mcell:hover { background: color-mix(in srgb, var(--hcc-accent) 10%, transparent); }
.mcell.other { opacity: .4; }
.mcell.is-today { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--hcc-accent) 50%, transparent); }
.mtop { display: flex; justify-content: space-between; align-items: center; gap: 2px; }
.mdn { font-size: .8rem; font-weight: 700; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; flex: none; }
.mwx { display: inline-flex; align-items: center; gap: 1px; font-size: .68rem; min-width: 0; }
.mwx ha-icon { --mdc-icon-size: 16px; }
.mevs { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.mev { display: flex; align-items: center; gap: 4px; font-size: .7rem; font-weight: 500; white-space: nowrap; overflow: hidden; border-radius: 4px; padding: 1px 4px; min-width: 0; }
.mev:hover { background: color-mix(in srgb, var(--c) 18%, transparent); }
.mtxt { overflow: hidden; text-overflow: ellipsis; }
.mdot { width: 6px; height: 6px; border-radius: 50%; background: var(--c); flex: none; }
.mev.allday { background: var(--c); color: #fff; }
.mev.allday .mdot { display: none; }
.more { font-size: .68rem; color: var(--hcc-muted); font-weight: 700; padding-left: 4px; }

/* responsive */
@container (max-width: 600px) {
  .week { grid-template-columns: 1fr; }
  .wcol { min-height: 0; flex-direction: row; align-items: stretch; padding: 8px; }
  .whead { width: 52px; flex: none; border-bottom: none; border-right: 1px solid var(--hcc-line); padding: 0 6px 0 0; border-radius: 0; justify-content: center; }
  .wevs { flex: 1; justify-content: center; }
  .wev .s { -webkit-line-clamp: 1; }
  .wev .t .short { display: none; }
  .wev .t .full { display: inline; }
  .wx.compact { flex-direction: column; gap: 0; }
  .wx.compact i { display: none; }
}
@container (max-width: 480px) {
  .big { font-size: 1.5rem; }
  .now-wx { padding: 6px 12px 6px 8px; }
  .now-wx ha-icon { --mdc-icon-size: 28px; }
  .cond { display: none; }
  .seg { flex: 1; }
  .seg button { flex: 1; text-align: center; padding: 6px 4px; }
  .nav { order: 3; flex-basis: 100%; }
  .add span { display: none; }
  .add { padding: 7px; }
  .ev-cal-name { display: none; }
  .mhol { display: none; }
  .cd { min-width: 112px; }
  .mcell { min-height: 56px; padding: 3px; }
  .mwx b { display: none; }
  .mevs { flex-direction: row; flex-wrap: wrap; gap: 3px; padding-left: 3px; }
  .mev, .mev.allday { padding: 0; background: none; }
  .mev.allday .mdot { display: block; }
  .mtxt { display: none; }
  .more { padding: 0; line-height: 6px; font-size: .6rem; }
}

/* dialog */
dialog { border: none; padding: 0; border-radius: 22px; width: min(460px, calc(100vw - 24px)); max-height: min(720px, calc(100vh - 32px));
  background: var(--hcc-bg); color: var(--hcc-text); box-shadow: 0 24px 70px rgba(0,0,0,.35); overflow: hidden; }
dialog[open] { display: flex; flex-direction: column; animation: pop .18s ease-out; }
@keyframes pop { from { transform: translateY(10px) scale(.98); opacity: 0; } }
dialog::backdrop { background: rgba(0,0,0,.45); backdrop-filter: blur(3px); }
.dlg-head { display: flex; align-items: center; gap: 10px; padding: 18px 12px 10px 20px; }
.dlg-dot { width: 14px; height: 14px; border-radius: 4px; background: var(--c); flex: none; }
.dlg-title { flex: 1; font-size: 1.2rem; font-weight: 700; line-height: 1.25; word-break: break-word; min-width: 0; }
.dlg-title .sub { font-size: .82rem; font-weight: 500; color: var(--hcc-muted); margin-top: 2px; }
.dlg-body { padding: 4px 20px 14px; overflow: auto; display: flex; flex-direction: column; gap: 12px; }
.day-list { gap: 6px; }
.row { display: flex; gap: 14px; align-items: flex-start; font-size: .92rem; line-height: 1.4; }
.row > ha-icon { color: var(--hcc-muted); --mdc-icon-size: 20px; margin-top: 1px; }
.row a { color: var(--hcc-accent); text-decoration: none; word-break: break-word; }
.muted { font-size: .8rem; color: var(--hcc-muted); }
.cap { text-transform: capitalize; }
.cal-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--c); margin-right: 6px; }
.desc { white-space: pre-wrap; word-break: break-word; color: var(--hcc-muted); }
.dlg-foot { display: flex; gap: 8px; padding: 12px 16px 16px; border-top: 1px solid var(--hcc-line); align-items: center; }
.sp { flex: 1; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 999px; font-weight: 700; font-size: .9rem; transition: background .15s; }
.btn:hover { background: var(--hcc-soft); }
.btn.primary { background: var(--c, var(--hcc-accent)); color: #fff; }
.btn.primary:hover { filter: brightness(1.08); }
.btn:disabled { opacity: .55; cursor: default; }
.btn.danger { color: var(--error-color, #db4437); padding-left: 12px; }
.btn.danger-fill { background: var(--error-color, #db4437); color: #fff; }
.btn.danger-fill:hover { filter: brightness(1.08); background: var(--error-color, #db4437); }
.btn.danger-line { color: var(--error-color, #db4437); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--error-color, #db4437) 50%, transparent); }
.dlg-foot.confirm { flex-direction: column; align-items: stretch; gap: 10px; background: color-mix(in srgb, var(--error-color, #db4437) 7%, transparent); }
.del-q { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: .92rem; }
.del-q ha-icon { color: var(--error-color, #db4437); --mdc-icon-size: 20px; }
.del-opts { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.btn.edit { color: var(--hcc-accent); padding-left: 12px; }
.btn.line { color: var(--hcc-accent); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--hcc-accent) 50%, transparent); }
.dlg-foot.edit-confirm { background: color-mix(in srgb, var(--hcc-accent) 7%, transparent); }
.dlg-foot.edit-confirm .del-q ha-icon { color: var(--hcc-accent); }
.form-note { display: flex; align-items: center; gap: 8px; font-size: .82rem; color: var(--hcc-muted); }
.form-note ha-icon { --mdc-icon-size: 16px; }
.del-note { display: inline-flex; align-items: center; gap: 6px; font-size: .78rem; color: var(--hcc-muted); }
.del-note ha-icon { --mdc-icon-size: 15px; }
.form { --c: var(--hcc-accent); }
.dlg-foot .btn.primary { background: var(--hcc-accent); }
.inp { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--hcc-line); background: var(--hcc-soft);
  color: var(--hcc-text); font: inherit; outline: none; transition: border-color .15s; min-width: 0; }
.inp:focus { border-color: var(--c); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 20%, transparent); }
textarea.inp { resize: vertical; }
#f-title { font-size: 1.15rem; font-weight: 600; border-left: 4px solid var(--c); }
.lbl { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--hcc-muted); }
.cal-pick { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.cal-pick .chip { opacity: .6; background: none; border-color: var(--hcc-line); padding: 6px 12px 6px 10px; }
.cal-pick .chip.sel { opacity: 1; background: color-mix(in srgb, var(--c) 18%, transparent); border-color: var(--c); font-weight: 700; }
.dt { display: grid; grid-template-columns: 58px minmax(0, 1fr) 136px; gap: 8px; align-items: center; }
.form.allday .dt { grid-template-columns: 58px minmax(0, 1fr); }
.form.allday .dt input[type=time] { display: none; }
.switch { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: .92rem; font-weight: 500; user-select: none; position: relative; width: fit-content; }
.switch input { position: absolute; opacity: 0; pointer-events: none; }
.track { width: 38px; height: 22px; border-radius: 999px; background: var(--hcc-line); position: relative; transition: background .15s; flex: none; }
.track::after { content: ""; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .15s; box-shadow: 0 1px 3px rgba(0,0,0,.3); }
.switch input:checked + .track { background: var(--c); }
.switch input:checked + .track::after { transform: translateX(16px); }
.sel-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.selbox { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.sel-wrap { position: relative; display: block; }
.sel-wrap ha-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); --mdc-icon-size: 18px; color: var(--c); pointer-events: none; }
.sel-wrap select { appearance: none; -webkit-appearance: none; padding-left: 36px; padding-right: 30px; cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, var(--hcc-muted) 50%), linear-gradient(135deg, var(--hcc-muted) 50%, transparent 50%);
  background-position: calc(100% - 17px) 55%, calc(100% - 12px) 55%; background-size: 5px 5px; background-repeat: no-repeat; }
.sel-wrap select option { background: var(--hcc-bg); color: var(--hcc-text); }
.mev.allday .mcake { color: #fff; }
.f-wx { display: flex; align-items: center; gap: 8px; font-size: .85rem; color: var(--hcc-muted); padding: 8px 12px; border-radius: 12px; background: var(--hcc-soft); }
.f-wx:empty { display: none; }
.f-wx ha-icon { --mdc-icon-size: 22px; }
.f-err { color: var(--error-color, #db4437); font-size: .85rem; font-weight: 600; }
.f-err:empty { display: none; }

/* to-do */
.todo { container-type: inline-size; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--hcc-line); }
.todo[hidden] { display: none; }
.todo-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.todo-head > ha-icon { color: var(--hcc-accent); --mdc-icon-size: 22px; }
.todo-title { font-size: 1.05rem; font-weight: 700; }
.todo-count { font-size: .75rem; font-weight: 700; min-width: 20px; height: 20px; padding: 0 6px; box-sizing: border-box; border-radius: 999px;
  background: var(--hcc-accent); color: var(--hcc-on-accent); display: inline-grid; place-items: center; }
.todo-count:empty { display: none; }
.todo-err { font-size: .8rem; color: var(--error-color, #db4437); margin-bottom: 6px; }
.todo-err:empty { display: none; }
.todo-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; margin-bottom: 12px; }
.tg { background: color-mix(in srgb, var(--c) 7%, transparent); border: 1px solid color-mix(in srgb, var(--c) 22%, transparent); border-radius: 14px; padding: 8px 10px 6px; min-width: 0; }
.tg-head { display: flex; align-items: center; gap: 8px; padding: 2px 2px 6px; font-weight: 700; font-size: .88rem; }
.tg-head .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--c); }
.tg-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tg-n { font-size: .72rem; color: var(--hcc-muted); font-weight: 700; }
.t-all { --mdc-icon-size: 18px; color: var(--c, var(--hcc-accent)); }
.ti { display: flex; align-items: center; gap: 10px; padding: 7px 2px; border-top: 1px solid var(--hcc-line); transition: opacity .4s, transform .4s; }
.tg-head + .ti { border-top: none; }
.ti.done { opacity: 0; transform: translateX(16px); }
.ti.done .ti-text { text-decoration: line-through; }
.tick { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--c); flex: none; display: grid; place-items: center; color: transparent; transition: background .15s, color .15s; }
.tick ha-icon { --mdc-icon-size: 16px; }
.tick:hover { background: color-mix(in srgb, var(--c) 18%, transparent); color: var(--c); }
.ti.done .tick { background: var(--c); color: #fff; }
.ti-text { flex: 1; min-width: 0; font-size: .92rem; font-weight: 500; word-break: break-word; }
.due { display: inline-flex; align-items: center; gap: 3px; font-size: .72rem; font-weight: 600; color: var(--hcc-muted); white-space: nowrap; flex: none; }
.due ha-icon { --mdc-icon-size: 13px; }
.due.due-today { color: var(--hcc-accent); }
.due.overdue { color: var(--error-color, #db4437); }
.todo-empty { grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--hcc-muted); font-size: .88rem; padding: 10px 0; }
.todo-empty ha-icon { --mdc-icon-size: 20px; }
.todo-add { display: flex; flex-direction: column; gap: 8px; }
.todo-row { display: flex; gap: 8px; }
.todo-row #t-text { flex: 1; }
.todo-row #t-due { width: 150px; flex: none; }
.t-addbtn { width: 42px; height: 42px; flex: none; border-radius: 12px; background: var(--hcc-accent); color: var(--hcc-on-accent); display: grid; place-items: center; }
.t-addbtn:disabled { opacity: .5; }
.t-addbtn ha-icon { --mdc-icon-size: 22px; }
.t-who { display: flex; flex-wrap: wrap; gap: 6px; }
.t-who .chip { opacity: .6; background: none; border-color: var(--hcc-line); }
.t-who .chip.sel { opacity: 1; background: color-mix(in srgb, var(--c) 18%, transparent); border-color: var(--c); font-weight: 700; }
.t-who .t-all { --mdc-icon-size: 16px; }
@container (max-width: 420px) {
  .todo-row { flex-wrap: wrap; }
  .todo-row #t-text { flex-basis: 100%; }
  .todo-row #t-due { flex: 1; width: auto; }
}

/* ---------- full page layouts (layout: fill / fullscreen) ---------- */
.inner { zoom: var(--hcc-zoom, 1); }
dialog { zoom: var(--hcc-zoom, 1); }
:host([layout="fill"]) ha-card {
  height: calc(100dvh - var(--header-height, 56px) - env(safe-area-inset-top, 0px)); border-radius: 0; }
:host([layout="fullscreen"]) ha-card {
  position: fixed; inset: 0; z-index: 7; width: 100vw; height: 100dvh; border-radius: 0; border: none; box-shadow: none; }
:host([layout="fill"]) ha-card, :host([layout="fullscreen"]) ha-card { box-sizing: border-box; padding: 0; overflow: hidden; }
:host([layout="fill"]) .inner, :host([layout="fullscreen"]) .inner {
  height: 100%; box-sizing: border-box; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
:host([layout="fill"]) .wrap, :host([layout="fullscreen"]) .wrap { flex: 1; min-height: 0; display: flex; flex-direction: column; }
:host([layout="fill"]) .wrap > .body, :host([layout="fullscreen"]) .wrap > .body { flex: 1; min-height: 0; overflow: auto; max-height: none !important; }
:host([layout="fill"]) .todo, :host([layout="fullscreen"]) .todo { flex: none; max-height: 40%; margin-top: 0; display: flex; flex-direction: column; min-height: 0; }
:host([layout="fill"]) .todo[hidden], :host([layout="fullscreen"]) .todo[hidden] { display: none; }
:host([layout="fill"]) .todo-list, :host([layout="fullscreen"]) .todo-list { flex: 1; min-height: 0; overflow: auto; align-content: start; }
/* month fills the height */
:host([layout="fill"]) .view-month, :host([layout="fullscreen"]) .view-month { overflow: hidden; }
:host([layout="fill"]) .month, :host([layout="fullscreen"]) .month { height: 100%; display: flex; flex-direction: column; }
:host([layout="fill"]) .mgrid, :host([layout="fullscreen"]) .mgrid { flex: 1; min-height: 0; grid-auto-rows: minmax(0, 1fr); }
:host([layout="fill"]) .mcell, :host([layout="fullscreen"]) .mcell { min-height: 0; }
/* week columns fill the height */
:host([layout="fill"]) .view-week, :host([layout="fullscreen"]) .view-week { overflow: hidden; }
:host([layout="fill"]) .week, :host([layout="fullscreen"]) .week { height: 100%; }
:host([layout="fill"]) .wcol, :host([layout="fullscreen"]) .wcol { min-height: 0; overflow: hidden; }
:host([layout="fill"]) .wevs, :host([layout="fullscreen"]) .wevs { flex: 1; min-height: 0; overflow: auto; }
/* agenda flows into columns on wide screens */
:host([layout="fill"]) .view-agenda, :host([layout="fullscreen"]) .view-agenda {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); column-gap: 28px; align-content: start; }
:host([layout="fill"]) .view-agenda .aday, :host([layout="fullscreen"]) .view-agenda .aday { border-top: 1px solid var(--hcc-line); padding-top: 12px; }
@container (max-width: 600px) {
  .view-week { overflow: auto !important; }
  .week { height: auto !important; }
}
/* to-do position: top / bottom / left / right */
ha-card { container: hcc / inline-size; }
.inner.pos-top .todo { order: -1; margin: 0 0 16px; padding: 0 0 14px; border-top: none; border-bottom: 1px solid var(--hcc-line); }
:host([layout="fill"]) .inner.pos-top .todo, :host([layout="fullscreen"]) .inner.pos-top .todo { margin: 0; }
@container hcc (min-width: 900px) {
  .inner.has-todo.pos-left, .inner.has-todo.pos-right { display: flex; flex-direction: row; align-items: stretch; gap: 24px; }
  .inner.has-todo.pos-left > .wrap, .inner.has-todo.pos-right > .wrap { flex: 1; min-width: 0; }
  .inner.pos-left > .todo, .inner.pos-right > .todo { width: 350px; flex: none; margin: 0; border-top: none; max-height: none; transition: width .25s; }
  .inner.pos-right > .todo { border-left: 1px solid var(--hcc-line); padding: 0 0 0 24px; }
  .inner.pos-left > .todo { order: -1; border-right: 1px solid var(--hcc-line); padding: 0 24px 0 0; }
  /* collapsed side panel = slim vertical tab */
  .inner.pos-left > .todo.collapsed, .inner.pos-right > .todo.collapsed { width: 44px; }
  .inner.pos-right > .todo.collapsed { padding-left: 12px; }
  .inner.pos-left > .todo.collapsed { padding-right: 12px; }
  .inner.pos-left > .todo.collapsed .todo-head, .inner.pos-right > .todo.collapsed .todo-head { flex-direction: column; gap: 10px; margin: 0; padding: 8px 0; height: 100%; justify-content: flex-start; }
  .inner.pos-left > .todo.collapsed .todo-title, .inner.pos-right > .todo.collapsed .todo-title { writing-mode: vertical-rl; transform: rotate(180deg); }
  .inner.pos-right > .todo .todo-chev { transform: rotate(-90deg); }
  .inner.pos-right > .todo.collapsed .todo-chev { transform: rotate(90deg); }
  .inner.pos-left > .todo .todo-chev { transform: rotate(90deg); }
  .inner.pos-left > .todo.collapsed .todo-chev { transform: rotate(-90deg); }
}
/* top / bottom in full-page layouts: one compact horizontal strip */
:host([layout="fill"]) .inner.pos-top > .todo, :host([layout="fill"]) .inner.pos-bottom > .todo,
:host([layout="fullscreen"]) .inner.pos-top > .todo, :host([layout="fullscreen"]) .inner.pos-bottom > .todo { max-height: 34%; }
:host([layout="fill"]) .inner.pos-top .todo-list, :host([layout="fill"]) .inner.pos-bottom .todo-list,
:host([layout="fullscreen"]) .inner.pos-top .todo-list, :host([layout="fullscreen"]) .inner.pos-bottom .todo-list {
  grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: minmax(250px, 320px); overflow-x: auto; overflow-y: auto; margin-bottom: 10px; }
:host([layout="fill"]) .inner.pos-top .todo-add, :host([layout="fill"]) .inner.pos-bottom .todo-add,
:host([layout="fullscreen"]) .inner.pos-top .todo-add, :host([layout="fullscreen"]) .inner.pos-bottom .todo-add { flex-direction: row; flex-wrap: wrap; align-items: center; }
:host([layout="fill"]) .inner.pos-top .todo-row, :host([layout="fill"]) .inner.pos-bottom .todo-row,
:host([layout="fullscreen"]) .inner.pos-top .todo-row, :host([layout="fullscreen"]) .inner.pos-bottom .todo-row { flex: 1 1 460px; }
/* auto-hide */
.todo.autohide .todo-head { cursor: pointer; user-select: none; border-radius: 12px; padding: 4px 6px; margin-left: -6px; margin-right: -6px; }
.todo.autohide .todo-head:hover { background: var(--hcc-soft); }
.todo-chev { margin-left: auto; color: var(--hcc-muted); transition: transform .25s; }
.todo.collapsed .todo-chev { transform: rotate(180deg); }
.inner.pos-top > .todo.collapsed .todo-chev { transform: none; }
.inner.pos-top > .todo:not(.collapsed) .todo-chev { transform: rotate(180deg); }
.todo.collapsed .todo-list, .todo.collapsed .todo-add, .todo.collapsed .todo-err { display: none !important; }
.todo.collapsed .todo-head { margin-bottom: 0; }
.inner.pos-top > .todo.collapsed { padding-bottom: 10px; }
.todo.collapsed .todo-count:empty { display: none; }
/* full-screen controls & toast */
.fs-ctl { position: absolute; right: 10px; top: 10px; display: flex; gap: 4px; padding: 4px; border-radius: 999px; background: var(--hcc-bg);
  box-shadow: 0 2px 10px rgba(0,0,0,.25); opacity: 0; pointer-events: none; transition: opacity .3s; z-index: 4; zoom: var(--hcc-zoom, 1); }
.fs-ctl.show, .fs-ctl:hover, .fs-ctl:focus-within { opacity: 1; pointer-events: auto; }
.fs-ctl:empty { display: none; }
.fs-ctl .icon { background: var(--hcc-soft); }
.hcc-toast { position: absolute; left: 50%; bottom: 24px; transform: translate(-50%, 20px); opacity: 0; pointer-events: none; z-index: 3; zoom: var(--hcc-zoom, 1);
  display: flex; align-items: center; gap: 14px; padding: 10px 12px 10px 18px; border-radius: 12px; background: #323232; color: #fff; font-size: .9rem;
  box-shadow: 0 8px 24px rgba(0,0,0,.3); transition: opacity .2s, transform .2s; }
.hcc-toast.on { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }
.toast-btn { color: var(--hcc-accent); font-weight: 700; text-transform: uppercase; font-size: .8rem; padding: 6px 8px; border-radius: 6px; }
.toast-btn:hover { background: rgba(255,255,255,.1); }
`;


/* ===================================================================== editor */

const GENERAL_SCHEMA = [
  { name: "title", selector: { text: {} } },
  { name: "weather_entity", selector: { entity: { domain: "weather" } } },
  { type: "grid", name: "", schema: [
    { name: "todo_entity", selector: { entity: { domain: "todo" } } },
    { name: "todo_title", selector: { text: {} } },
    { name: "todo_position", selector: { select: { mode: "dropdown", options: [
      { value: "auto", label: "Automatic" }, { value: "top", label: "Top" }, { value: "bottom", label: "Bottom" },
      { value: "left", label: "Left" }, { value: "right", label: "Right" }] } } },
    { name: "todo_autohide", selector: { number: { min: 0, max: 600, step: 5, mode: "box", unit_of_measurement: "s" } } },
  ] },
  {
    type: "grid", name: "", schema: [
      { name: "default_view", selector: { select: { mode: "dropdown", options: [
        { value: "agenda", label: "Agenda" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }] } } },
      { name: "days_to_show", selector: { number: { min: 1, max: 31, mode: "box" } } },
      { name: "first_day_of_week", selector: { select: { mode: "dropdown", options: [
        { value: "monday", label: "Monday" }, { value: "sunday", label: "Sunday" }, { value: "saturday", label: "Saturday" }] } } },
      { name: "time_format", selector: { select: { mode: "dropdown", options: [
        { value: "auto", label: "From HA profile" }, { value: "24h", label: "24 hour" }, { value: "12h", label: "12 hour" }] } } },
    ],
  },
  { type: "grid", name: "", schema: [
    { name: "layout", selector: { select: { mode: "dropdown", options: [
      { value: "card", label: "Card (normal)" }, { value: "fill", label: "Fill page (panel view)" }, { value: "fullscreen", label: "Full screen (wall display)" }] } } },
    { name: "keep_awake", selector: { boolean: {} } },
  ] },
  { type: "grid", name: "", schema: [
    { name: "show_header", selector: { boolean: {} } },
    { name: "allow_add", selector: { boolean: {} } },
    { name: "allow_edit", selector: { boolean: {} } },
    { name: "allow_delete", selector: { boolean: {} } },
    { name: "show_empty_days", selector: { boolean: {} } },
    { name: "max_height", selector: { text: {} } },
  ] },
];
const GENERAL_LABELS = {
  title: "Title", weather_entity: "Weather entity", layout: "Layout", keep_awake: "Keep screen awake", todo_entity: "To-do list (optional)", todo_title: "To-do heading", todo_position: "To-do position", todo_autohide: "To-do auto-hide after (0 = off)", default_view: "Default view", days_to_show: "Days in agenda",
  first_day_of_week: "First day of week", time_format: "Time format", show_header: "Show date & weather header",
  allow_add: "Allow adding events", allow_edit: "Allow editing events", allow_delete: "Allow deleting events", show_empty_days: "Show days without events", max_height: "Max height (e.g. 600px)",
};
const CAL_SCHEMA = [
  { type: "grid", name: "", schema: [
    { name: "entity", required: true, selector: { entity: { domain: "calendar" } } },
    { name: "name", selector: { text: {} } },
  ] },
  { type: "grid", name: "", schema: [
    { name: "person", selector: { entity: { domain: "person" } } },
    { name: "type", selector: { select: { mode: "dropdown", options: [
      { value: "events", label: "Events" }, { value: "birthday", label: "Birthdays" }, { value: "anniversary", label: "Anniversaries" }, { value: "holiday", label: "Holidays (day banner)" }] } } },
  ] },
];
const CAL_LABELS = { entity: "Calendar", name: "Display name", person: "Person (shows their photo)", type: "Calendar type" };

const EDITOR_STYLES = `
:host { display: block; }
.sec { margin-bottom: 22px; }
.h { font-weight: 600; font-size: 1rem; margin: 0 0 4px; }
.sub { font-size: .82rem; color: var(--secondary-text-color); margin: 0 0 10px; }
.themes { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; }
.th { position: relative; border-radius: 12px; padding: 10px; cursor: pointer; border: 2px solid var(--divider-color); background: var(--tbg); color: var(--ttx);
  text-align: left; font: inherit; transition: transform .12s, border-color .12s; }
.th:hover { transform: translateY(-1px); }
.th.sel { border-color: var(--primary-color); box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 30%, transparent); }
.th .bar { height: 7px; border-radius: 4px; background: var(--tac); width: 55%; margin-bottom: 7px; }
.th .dots { display: flex; gap: 3px; margin-bottom: 7px; }
.th .dots span { width: 11px; height: 11px; border-radius: 50%; }
.th .nm { font-size: .8rem; font-weight: 600; }
.th .tick { position: absolute; top: 6px; right: 6px; --mdc-icon-size: 18px; color: var(--primary-color); }
.cal { display: grid; grid-template-columns: 36px minmax(0, 1fr) auto; gap: 10px; align-items: start; padding: 12px 8px 4px 12px;
  border: 1px solid var(--divider-color); border-radius: 12px; margin-bottom: 10px; }
.sw { width: 32px; height: 32px; border-radius: 50%; position: relative; overflow: hidden; cursor: pointer; margin-top: 10px;
  box-shadow: inset 0 0 0 2px rgba(0,0,0,.12); display: block; }
.sw input { position: absolute; inset: -4px; width: calc(100% + 8px); height: calc(100% + 8px); opacity: 0; cursor: pointer; border: 0; padding: 0; }
.btns { display: flex; flex-direction: column; }
.ib { background: none; border: none; color: var(--secondary-text-color); cursor: pointer; padding: 6px; border-radius: 50%; display: grid; place-items: center; }
.ib:hover { background: rgba(127,127,127,.15); }
.ib:disabled { opacity: .3; cursor: default; background: none; }
.ib ha-icon { --mdc-icon-size: 20px; }
.addcal { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 999px; border: 1px solid var(--primary-color);
  background: none; color: var(--primary-color); font: inherit; font-weight: 600; cursor: pointer; }
.addcal:hover { background: color-mix(in srgb, var(--primary-color) 10%, transparent); }
.note { font-size: .8rem; color: var(--secondary-text-color); margin-top: 10px; }
`;

class HomeCalendarCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._forms = [];
  }

  set hass(hass) {
    this._hass = hass;
    this._forms.forEach((f) => { f.hass = hass; });
  }

  setConfig(config) {
    const json = JSON.stringify(config);
    this._config = { ...config };
    if (json === this._lastJson) return; // our own change coming back – keep focus, don't rebuild
    this._lastJson = json;
    this._ready().then(() => this._render());
  }

  async _ready() {
    if (customElements.get("ha-form")) return;
    try {
      const helpers = await window.loadCardHelpers?.();
      const c = await helpers?.createCardElement({ type: "entities", entities: [] });
      await c?.constructor?.getConfigElement?.();
    } catch (e) { /* ignore */ }
    await Promise.race([customElements.whenDefined("ha-form"), new Promise((r) => setTimeout(r, 3000))]);
  }

  _cals() { return (this._config.calendars || []).map((c) => (typeof c === "string" ? { entity: c } : { ...c })); }

  _emit(config, rerender = false) {
    const clean = { ...config };
    if (Array.isArray(clean.calendars)) {
      clean.calendars = clean.calendars.map((c) => {
        const o = {};
        Object.entries(c).forEach(([k, v]) => { if (v !== "" && v != null && !(k === "type" && v === "events")) o[k] = v; });
        if (!("entity" in o)) o.entity = "";
        return Object.keys(o).length === 1 && o.entity ? o.entity : o;
      });
    }
    this._config = clean;
    this._lastJson = JSON.stringify(clean);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: clean }, bubbles: true, composed: true }));
    if (rerender) this._render();
  }

  _themeTile(key) {
    const t = THEMES[key];
    const v = t.vars || { bg: "var(--card-background-color, #fff)", text: "var(--primary-text-color)", accent: "var(--primary-color)" };
    const sel = (this._config.theme || "auto") === key;
    return `<button class="th ${sel ? "sel" : ""}" data-act="theme" data-theme="${key}" style="--tbg:${v.bg};--ttx:${v.text};--tac:${v.accent}">
      ${sel ? `<ha-icon class="tick" icon="mdi:check-circle"></ha-icon>` : ""}
      <div class="bar"></div>
      <div class="dots">${themePalette(key).slice(0, 5).map((c) => `<span style="background:${c}"></span>`).join("")}</div>
      <div class="nm">${esc(t.name)}</div>
    </button>`;
  }

  _render() {
    if (!this._config) return;
    const cals = this._cals();
    const pal = themePalette(this._config.theme);
    this._forms = [];
    this.shadowRoot.innerHTML = `<style>${EDITOR_STYLES}</style>
      <div class="sec">
        <div class="h">Theme</div>
        <div class="sub">Colour scheme for the card. "Home Assistant" follows your dashboard theme.</div>
        <div class="themes">${Object.keys(THEMES).map((k) => this._themeTile(k)).join("")}</div>
      </div>
      <div class="sec">
        <div class="h">Calendars</div>
        <div class="sub">Pick each calendar, give it a name and colour, and optionally link it to a person.</div>
        <div class="cals">${cals.map((c, i) => {
          const col = /^#[0-9a-f]{6}$/i.test(c.color || "") ? c.color : pal[i % pal.length];
          return `<div class="cal">
            <label class="sw" title="Colour" style="background:${esc(c.color || col)}"><input type="color" data-i="${i}" value="${col}"></label>
            <div class="slot" data-i="${i}"></div>
            <div class="btns">
              <button class="ib" data-act="up" data-i="${i}" title="Move up" ${i === 0 ? "disabled" : ""}><ha-icon icon="mdi:arrow-up"></ha-icon></button>
              <button class="ib" data-act="down" data-i="${i}" title="Move down" ${i === cals.length - 1 ? "disabled" : ""}><ha-icon icon="mdi:arrow-down"></ha-icon></button>
              <button class="ib" data-act="del" data-i="${i}" title="Remove"><ha-icon icon="mdi:delete-outline"></ha-icon></button>
            </div>
          </div>`;
        }).join("")}</div>
        <button class="addcal" data-act="add"><ha-icon icon="mdi:plus"></ha-icon>Add calendar</button>
      </div>
      <div class="sec">
        <div class="h">Display</div>
        <div class="slot-general"></div>
        <div class="note">Countdowns and custom event types are set in the code editor – see the README.</div>
      </div>`;

    this.shadowRoot.querySelectorAll(".slot").forEach((slot) => {
      const i = Number(slot.dataset.i);
      const c = cals[i];
      const f = this._makeForm(CAL_SCHEMA, { entity: c.entity || "", name: c.name || "", person: c.person || "", type: c.type || "events" },
        (s) => CAL_LABELS[s.name] ?? s.name,
        (s) => {
          if (s.name !== "name") return undefined;
          const ent = this._cals()[i]?.entity;
          const fn = ent && this._hass?.states[ent]?.attributes?.friendly_name;
          return fn ? `Leave empty to use “${fn}”` : undefined;
        });
      f.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        f.data = ev.detail.value; // keep the form in sync, since we don't rebuild it
        const list = this._cals();
        list[i] = { ...list[i], ...ev.detail.value };
        this._emit({ ...this._config, calendars: list });
      });
      slot.appendChild(f);
    });

    const gen = this._makeForm(GENERAL_SCHEMA, this._config, (s) => GENERAL_LABELS[s.name] ?? s.name);
    gen.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      gen.data = ev.detail.value;
      const next = { ...this._config, ...ev.detail.value };
      Object.keys(GENERAL_LABELS).forEach((k) => { if (next[k] === "" || next[k] == null) delete next[k]; });
      this._emit(next);
    });
    this.shadowRoot.querySelector(".slot-general").appendChild(gen);

    this.shadowRoot.querySelectorAll('input[type="color"]').forEach((inp) => {
      inp.addEventListener("input", () => { inp.parentElement.style.background = inp.value; });
      inp.addEventListener("change", () => {
        const list = this._cals();
        list[Number(inp.dataset.i)].color = inp.value.toUpperCase();
        this._emit({ ...this._config, calendars: list });
      });
    });
    this.shadowRoot.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => this._action(b)));
  }

  _makeForm(schema, data, computeLabel, computeHelper) {
    const f = document.createElement("ha-form");
    f.hass = this._hass;
    f.schema = schema;
    f.data = data;
    f.computeLabel = computeLabel;
    if (computeHelper) f.computeHelper = computeHelper;
    this._forms.push(f);
    return f;
  }

  _action(b) {
    const list = this._cals();
    const i = Number(b.dataset.i);
    switch (b.dataset.act) {
      case "theme": {
        const next = { ...this._config };
        if (b.dataset.theme === "auto") delete next.theme; else next.theme = b.dataset.theme;
        this._emit(next, true);
        return;
      }
      case "add": list.push({ entity: "" }); break;
      case "del": list.splice(i, 1); break;
      case "up": if (i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]]; break;
      case "down": if (i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]]; break;
      default: return;
    }
    this._emit({ ...this._config, calendars: list }, true);
  }
}

if (!customElements.get("home-calendar-card-editor")) {
  customElements.define("home-calendar-card-editor", HomeCalendarCardEditor);
}

if (!customElements.get("home-calendar-card")) {
  customElements.define("home-calendar-card", HomeCalendarCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "home-calendar-card")) {
  window.customCards.push({
    type: "home-calendar-card",
    name: "Home Calendar Card",
    description: "Google / Apple / any HA calendars in Agenda, Week and Month views with weather and add-event support.",
    preview: true,
    documentationURL: "https://github.com/mimikm/Home-Calendar-Card",
  });
}
console.info(`%c HOME-CALENDAR-CARD %c v${CARD_VERSION} `,
  "color:#fff;background:#4285F4;font-weight:700;border-radius:4px 0 0 4px",
  "color:#4285F4;background:#e8f0fe;font-weight:700;border-radius:0 4px 4px 0");
