/*
 * Home Calendar Card for Home Assistant
 * Shows Google, Apple (iCloud via CalDAV) or any other HA calendar entities
 * in Agenda / Week / Month views with daily weather forecasts, and lets you
 * add (and delete) events on any calendar that supports it. Supports per-person
 * calendars with avatars, birthday and holiday calendars, and countdowns.
 *
 * https://github.com/mimikm/Home-Calendar-Card
 */
const CARD_VERSION = "1.11.0";

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
  auto:     { birthday: "#D63AF9", anniversary: "#E91E63", holiday: "#0288D1", nameday: "#F4B400", event: "#607D8B", custom: ["#FB8C00", "#00897B", "#5E35B1", "#C0CA33"] },
  nordic:   { birthday: "#C026D3", anniversary: "#E11D48", holiday: "#0284C7", nameday: "#CA8A04", event: "#64748B", custom: ["#EA580C", "#0D9488", "#4F46E5", "#65A30D"] },
  sunset:   { birthday: "#B5367A", anniversary: "#D7263D", holiday: "#2A9D8F", nameday: "#C9A227", event: "#8C6E63", custom: ["#E07A5F", "#457B9D", "#6D597A", "#7C9A3D"] },
  forest:   { birthday: "#A2557A", anniversary: "#B23A48", holiday: "#2E7DAF", nameday: "#C8961E", event: "#5F7366", custom: ["#D07A3C", "#5B8E3E", "#6F5CA8", "#3E8E8E"] },
  midnight: { birthday: "#E879F9", anniversary: "#FB7185", holiday: "#38BDF8", nameday: "#FACC15", event: "#94A3B8", custom: ["#FB923C", "#34D399", "#A78BFA", "#A3E635"] },
  graphite: { birthday: "#DA8FFF", anniversary: "#FF6482", holiday: "#64D2FF", nameday: "#FFD60A", event: "#98989F", custom: ["#FF9F0A", "#30D158", "#5E9EFF", "#AC8E68"] },
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
  // Polish name days (imieniny). Offered in the dropdown when the card is in Polish.
  { id: "nameday", name: "Name day", icon: "mdi:flower-tulip", style: "nameday", all_day: true, repeat: "yearly",
    countdown: true, countdown_limit: 2, countdown_calendars: true, langs: ["pl"] },
  { id: "dhs", name: "DHS", icon: "mdi:tag-outline" },
];
const REPEATS = [
  ["", "rep_none"], ["FREQ=DAILY", "rep_daily"], ["FREQ=WEEKLY", "rep_weekly"],
  ["FREQ=WEEKLY;INTERVAL=2", "rep_2weeks"], ["FREQ=MONTHLY", "rep_monthly"], ["FREQ=YEARLY", "rep_yearly"],
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
const DONE_BY_RE = /^\s*Done by:\s*(.+?)(?:\s*\((\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?\))?\s*$/mi;
const DONE_BY_LINE_RE = /\n?^\s*Done by:.*$/gmi;
const TAG_RE = /(^|\s)#([a-z0-9_-]+)(?=\s|$)/gi;

// ------------------------------------------------------------------ translations
// The UI language follows Home Assistant (or `language:` in the card config).
const I18N = {
  en: {
    agenda: "Agenda", week: "Week", month: "Month", today: "Today", tomorrow: "Tomorrow", yesterday: "Yesterday",
    prev: "Previous", next: "Next", event_btn: "Event", back_fs: "Back to full screen",
    all_day: "All day", all_day_n: "All day · {n}/{t}", until: "Until {t}", from: "From {t}", now: "Now",
    nothing: "Nothing planned", no_events: "No events in this period", repeating: "Repeating event",
    birthday: "Birthday", anniversary: "Anniversary", nameday: "Name day",
    close: "Close", delete: "Delete", edit: "Edit", cancel: "Cancel", save: "Save", saving: "Saving…", back: "Back",
    add_event: "Add event", new_event: "New event", edit_event: "Edit event", add_title: "Add title",
    type: "Type", repeat: "Repeat", calendar: "Calendar", starts: "Starts", ends: "Ends",
    location: "Location", description: "Description", forecast: "Forecast: {f}", rain: "{p}% chance of rain",
    rep_none: "Does not repeat", rep_daily: "Every day", rep_weekly: "Every week", rep_2weeks: "Every 2 weeks",
    rep_monthly: "Every month", rep_yearly: "Every year", rep_custom: "Custom (keep as is)",
    rec_note: "Repeating event – you'll choose which events to change when you save.",
    err_title: "Please add a title.", err_start: "Please choose a start date.", err_end_date: "End date is before the start date.",
    err_times: "Please choose start and end times.", err_order: "End must be after start.",
    err_create: "Could not create the event.", err_save: "Could not save the changes.", err_delete: "Could not delete the event.",
    added: "Added “{t}”", saved: "Saved “{t}”", moved: "Moved “{t}” to {c}", deleted: "Deleted “{t}”",
    deleted_all: "Deleted all “{t}” events", deleted_from: "Deleted “{t}” from {d} on",
    del_rec_q: "Delete repeating event", del_q: "Delete “{t}”? This can't be undone.",
    this_event: "This event", this_following: "This and following", all_events: "All events",
    save_rec_q: "Save changes to a repeating event",
    ro_event: "This event can't be changed from here.", ro_cal: "This calendar is read-only in Home Assistant.",
    no_edit: "This calendar can't edit events from Home Assistant.", no_delete: "This calendar can't delete events from Home Assistant.",
    countdown: "Countdown",
    todo: "To-do", todo_toggle: "Show / hide the to-do list", add_task: "Add a task…", due: "Due date", add_task_btn: "Add task",
    everyone: "Everyone", mark_done: "Mark as done", all_done: "All done – nothing on the list",
    done: "Done: {t}", undo: "Undo", err_task_add: "Could not add the task.", err_task_upd: "Could not update the task.", err_undo: "Could not undo.",
    fs_browser: "Browser full screen", fs_exit: "Exit browser full screen", fs_off: "Show Home Assistant (until reload)",
    type_standard: "Standard", type_holiday: "Holiday", type_birthday: "Birthday", type_anniversary: "Anniversary",
    type_work: "Work event", type_dhs: "DHS", type_nameday: "Name day",
    "wx_clear-night": "clear", wx_cloudy: "cloudy", wx_exceptional: "exceptional", wx_fog: "fog", wx_hail: "hail",
    wx_lightning: "lightning", "wx_lightning-rainy": "thunderstorms", wx_partlycloudy: "partly cloudy", wx_pouring: "pouring",
    wx_rainy: "rainy", wx_snowy: "snowy", "wx_snowy-rainy": "sleet", wx_sunny: "sunny", wx_windy: "windy", "wx_windy-variant": "windy",
    // editor
    ed_theme: "Theme", ed_theme_sub: "Colour scheme for the card. “Home Assistant” follows your dashboard theme.",
    ed_cals: "Calendars", ed_cals_sub: "Pick each calendar, give it a name and colour, and optionally link it to a person.",
    ed_add_cal: "Add calendar", ed_display: "Display", ed_note: "Countdowns and custom event types are set in the code editor – see the README.",
    ed_colour: "Colour", ed_up: "Move up", ed_down: "Move down", ed_remove: "Remove", ed_leave_empty: "Leave empty to use “{n}”",
    l_title: "Title", l_weather_entity: "Weather entity", l_language: "Language", l_layout: "Layout", l_keep_awake: "Keep screen awake",
    l_todo_entity: "To-do list (optional)", l_todo_title: "To-do heading", l_todo_position: "To-do position",
    l_todo_autohide: "To-do auto-hide after (0 = off)", l_default_view: "Default view", l_days_to_show: "Days in agenda",
    l_first_day_of_week: "First day of week", l_time_format: "Time format", l_show_header: "Show date & weather header",
    l_allow_add: "Allow adding events", l_allow_edit: "Allow editing events", l_allow_delete: "Allow deleting events",
    l_show_empty_days: "Show days without events", l_max_height: "Max height (e.g. 600px)",
    l_entity: "Calendar", l_name: "Display name", l_person: "Person (shows their photo)", l_type: "Calendar type",
    o_auto: "Automatic", o_top: "Top", o_bottom: "Bottom", o_left: "Left", o_right: "Right",
    o_monday: "Monday", o_sunday: "Sunday", o_saturday: "Saturday",
    o_tf_auto: "From HA profile", o_24h: "24 hour", o_12h: "12 hour",
    o_card: "Card (normal)", o_fill: "Fill page (panel view)", o_fullscreen: "Full screen (wall display)",
    o_events: "Events", o_birthdays: "Birthdays", o_anniversaries: "Anniversaries", o_namedays: "Name days", o_holidays: "Holidays (day banner)",
    o_lang_auto: "From Home Assistant",
    up_next: "Next", nothing_today: "Nothing else today", nothing_tomorrow: "Nothing planned tomorrow", tap_wake: "Tap to wake",
    ed_night: "Night mode", ed_saver: "Screensaver", l_night_mode: "Night mode", l_screensaver: "Screensaver",
    l_enabled: "Enabled", l_start: "From", l_end: "Until", l_style: "Style", l_brightness: "Brightness",
    l_when_entity: "Or turn on with an entity (optional)", l_wake_entity: "Wake with a motion sensor (optional)", l_wake_seconds: "Stay awake for (seconds)",
    l_after: "Start after (minutes)", l_media: "Photo folder (media source)", l_interval: "Seconds per photo", l_show_info: "Show clock & next event", l_shuffle: "Shuffle photos",
    ed_new_cal: "New calendar – pick one", ed_expand: "Show settings", ed_collapse: "Hide settings", ed_expand_all: "Expand all", ed_collapse_all: "Collapse all", tg_overdue: "Overdue", tg_nodate: "Anytime", tg_upcoming: "Upcoming", done_section: "Done", upcoming_hint: "Coming up – can be ticked off when it's due", undo_done: "Mark as not done", l_todo_group_by: "Group tasks by", o_group_person: "Person", o_group_due: "Due date (Overdue / Today / …)", l_todo_days_ahead: "Show tasks due in the next … days (0 = all)", l_todo_calendar: "Calendar with upcoming repeats (optional)", l_todo_show_completed: "Show completed tasks", l_todo_completed_days: "Completed in the last … days", grp_each: "Show or hide each calendar", l_group: "Group (optional)", ed_group_help: "Calendars with the same group name share one button that shows/hides them all, e.g. Kids", o_clock: "Clock only", o_dim: "Dim the calendar", ed_media_help: "e.g. media-source://media_source/local/photos – leave empty for a clock-only screensaver",
  },
  pl: {
    agenda: "Agenda", week: "Tydzień", month: "Miesiąc", today: "Dzisiaj", tomorrow: "Jutro", yesterday: "Wczoraj",
    prev: "Poprzedni", next: "Następny", event_btn: "Wydarzenie", back_fs: "Wróć do pełnego ekranu",
    all_day: "Cały dzień", all_day_n: "Cały dzień · {n}/{t}", until: "Do {t}", from: "Od {t}", now: "Teraz",
    nothing: "Nic zaplanowanego", no_events: "Brak wydarzeń w tym okresie", repeating: "Wydarzenie cykliczne",
    birthday: "Urodziny", anniversary: "Rocznica", nameday: "Imieniny",
    close: "Zamknij", delete: "Usuń", edit: "Edytuj", cancel: "Anuluj", save: "Zapisz", saving: "Zapisywanie…", back: "Wstecz",
    add_event: "Dodaj wydarzenie", new_event: "Nowe wydarzenie", edit_event: "Edytuj wydarzenie", add_title: "Dodaj tytuł",
    type: "Typ", repeat: "Powtarzanie", calendar: "Kalendarz", starts: "Początek", ends: "Koniec",
    location: "Miejsce", description: "Opis", forecast: "Prognoza: {f}", rain: "{p}% szans na deszcz",
    rep_none: "Nie powtarza się", rep_daily: "Codziennie", rep_weekly: "Co tydzień", rep_2weeks: "Co 2 tygodnie",
    rep_monthly: "Co miesiąc", rep_yearly: "Co roku", rep_custom: "Niestandardowe (bez zmian)",
    rec_note: "Wydarzenie cykliczne – przy zapisie wybierzesz, które wystąpienia zmienić.",
    err_title: "Dodaj tytuł.", err_start: "Wybierz datę rozpoczęcia.", err_end_date: "Data zakończenia jest przed datą rozpoczęcia.",
    err_times: "Wybierz godzinę rozpoczęcia i zakończenia.", err_order: "Koniec musi być po początku.",
    err_create: "Nie udało się utworzyć wydarzenia.", err_save: "Nie udało się zapisać zmian.", err_delete: "Nie udało się usunąć wydarzenia.",
    added: "Dodano „{t}”", saved: "Zapisano „{t}”", moved: "Przeniesiono „{t}” do: {c}", deleted: "Usunięto „{t}”",
    deleted_all: "Usunięto wszystkie wystąpienia „{t}”", deleted_from: "Usunięto „{t}” od {d}",
    del_rec_q: "Usuń wydarzenie cykliczne", del_q: "Usunąć „{t}”? Tego nie można cofnąć.",
    this_event: "To wydarzenie", this_following: "To i następne", all_events: "Wszystkie",
    save_rec_q: "Zapisz zmiany w wydarzeniu cyklicznym",
    ro_event: "Tego wydarzenia nie można tu zmienić.", ro_cal: "Ten kalendarz jest tylko do odczytu w Home Assistant.",
    no_edit: "Ten kalendarz nie pozwala edytować wydarzeń z Home Assistant.", no_delete: "Ten kalendarz nie pozwala usuwać wydarzeń z Home Assistant.",
    countdown: "Odliczanie",
    todo: "Do zrobienia", todo_toggle: "Pokaż / ukryj listę zadań", add_task: "Dodaj zadanie…", due: "Termin", add_task_btn: "Dodaj zadanie",
    everyone: "Wszyscy", mark_done: "Oznacz jako zrobione", all_done: "Wszystko zrobione – lista jest pusta",
    done: "Zrobione: {t}", undo: "Cofnij", err_task_add: "Nie udało się dodać zadania.", err_task_upd: "Nie udało się zaktualizować zadania.", err_undo: "Nie udało się cofnąć.",
    fs_browser: "Pełny ekran przeglądarki", fs_exit: "Wyjdź z pełnego ekranu", fs_off: "Pokaż Home Assistant (do odświeżenia)",
    type_standard: "Zwykłe", type_holiday: "Wakacje", type_birthday: "Urodziny", type_anniversary: "Rocznica",
    type_work: "Praca", type_dhs: "DHS", type_nameday: "Imieniny",
    "wx_clear-night": "bezchmurnie", wx_cloudy: "pochmurno", wx_exceptional: "wyjątkowe warunki", wx_fog: "mgła", wx_hail: "grad",
    wx_lightning: "burza", "wx_lightning-rainy": "burza z deszczem", wx_partlycloudy: "częściowe zachmurzenie", wx_pouring: "ulewa",
    wx_rainy: "deszczowo", wx_snowy: "śnieg", "wx_snowy-rainy": "deszcz ze śniegiem", wx_sunny: "słonecznie", wx_windy: "wietrznie", "wx_windy-variant": "wietrznie",
    ed_theme: "Motyw", ed_theme_sub: "Kolorystyka karty. „Home Assistant” korzysta z motywu Twojego dashboardu.",
    ed_cals: "Kalendarze", ed_cals_sub: "Wybierz kalendarz, nadaj mu nazwę i kolor, a opcjonalnie przypisz osobę.",
    ed_add_cal: "Dodaj kalendarz", ed_display: "Wyświetlanie", ed_note: "Odliczania i własne typy wydarzeń ustawia się w edytorze kodu – szczegóły w README.",
    ed_colour: "Kolor", ed_up: "Przesuń w górę", ed_down: "Przesuń w dół", ed_remove: "Usuń", ed_leave_empty: "Zostaw puste, aby użyć „{n}”",
    l_title: "Tytuł", l_weather_entity: "Encja pogody", l_language: "Język", l_layout: "Układ", l_keep_awake: "Nie wygaszaj ekranu",
    l_todo_entity: "Lista zadań (opcjonalnie)", l_todo_title: "Nagłówek listy zadań", l_todo_position: "Położenie listy zadań",
    l_todo_autohide: "Autoukrywanie listy po (0 = wył.)", l_default_view: "Widok domyślny", l_days_to_show: "Dni w agendzie",
    l_first_day_of_week: "Pierwszy dzień tygodnia", l_time_format: "Format czasu", l_show_header: "Pokaż nagłówek z datą i pogodą",
    l_allow_add: "Zezwalaj na dodawanie wydarzeń", l_allow_edit: "Zezwalaj na edycję wydarzeń", l_allow_delete: "Zezwalaj na usuwanie wydarzeń",
    l_show_empty_days: "Pokaż dni bez wydarzeń", l_max_height: "Maks. wysokość (np. 600px)",
    l_entity: "Kalendarz", l_name: "Wyświetlana nazwa", l_person: "Osoba (pokazuje jej zdjęcie)", l_type: "Typ kalendarza",
    o_auto: "Automatycznie", o_top: "Góra", o_bottom: "Dół", o_left: "Lewo", o_right: "Prawo",
    o_monday: "Poniedziałek", o_sunday: "Niedziela", o_saturday: "Sobota",
    o_tf_auto: "Z profilu HA", o_24h: "24-godzinny", o_12h: "12-godzinny",
    o_card: "Karta (zwykła)", o_fill: "Wypełnij stronę (widok panelu)", o_fullscreen: "Pełny ekran (ekran ścienny)",
    o_events: "Wydarzenia", o_birthdays: "Urodziny", o_anniversaries: "Rocznice", o_namedays: "Imieniny", o_holidays: "Święta i wakacje (baner dnia)",
    o_lang_auto: "Z Home Assistant",
    up_next: "Następne", nothing_today: "Na dziś nic więcej", nothing_tomorrow: "Jutro nic zaplanowanego", tap_wake: "Dotknij, aby wybudzić",
    ed_night: "Tryb nocny", ed_saver: "Wygaszacz ekranu", l_night_mode: "Tryb nocny", l_screensaver: "Wygaszacz ekranu",
    l_enabled: "Włączony", l_start: "Od", l_end: "Do", l_style: "Styl", l_brightness: "Jasność",
    l_when_entity: "Lub włączaj encją (opcjonalnie)", l_wake_entity: "Wybudzaj czujnikiem ruchu (opcjonalnie)", l_wake_seconds: "Wybudź na (sekundy)",
    l_after: "Włącz po (minutach)", l_media: "Folder ze zdjęciami (media source)", l_interval: "Sekundy na zdjęcie", l_show_info: "Pokaż zegar i następne wydarzenie", l_shuffle: "Losowa kolejność zdjęć",
    ed_new_cal: "Nowy kalendarz – wybierz", ed_expand: "Pokaż ustawienia", ed_collapse: "Ukryj ustawienia", ed_expand_all: "Rozwiń wszystkie", ed_collapse_all: "Zwiń wszystkie", tg_overdue: "Zaległe", tg_nodate: "Bez terminu", tg_upcoming: "Nadchodzące", done_section: "Zrobione", upcoming_hint: "Nadchodzące – odhaczysz, gdy przyjdzie termin", undo_done: "Oznacz jako niezrobione", l_todo_group_by: "Grupuj zadania według", o_group_person: "Osoby", o_group_due: "Terminu (Zaległe / Dzisiaj / …)", l_todo_days_ahead: "Pokaż zadania na najbliższe … dni (0 = wszystkie)", l_todo_calendar: "Kalendarz z kolejnymi powtórzeniami (opcjonalnie)", l_todo_show_completed: "Pokaż zrobione zadania", l_todo_completed_days: "Zrobione w ostatnich … dniach", grp_each: "Pokaż lub ukryj kalendarze osobno", l_group: "Grupa (opcjonalnie)", ed_group_help: "Kalendarze z tą samą nazwą grupy mają jeden przycisk, który pokazuje/ukrywa je wszystkie, np. Dzieci", o_clock: "Tylko zegar", o_dim: "Przyciemnij kalendarz", ed_media_help: "np. media-source://media_source/local/photos – zostaw puste, aby wygaszacz pokazywał tylko zegar",
  },
  es: {
    agenda: "Agenda", week: "Semana", month: "Mes", today: "Hoy", tomorrow: "Mañana", yesterday: "Ayer",
    prev: "Anterior", next: "Siguiente", event_btn: "Evento", back_fs: "Volver a pantalla completa",
    all_day: "Todo el día", all_day_n: "Todo el día · {n}/{t}", until: "Hasta {t}", from: "Desde {t}", now: "Ahora",
    nothing: "Nada planeado", no_events: "No hay eventos en este periodo", repeating: "Evento recurrente",
    birthday: "Cumpleaños", anniversary: "Aniversario", nameday: "Onomástica",
    close: "Cerrar", delete: "Eliminar", edit: "Editar", cancel: "Cancelar", save: "Guardar", saving: "Guardando…", back: "Atrás",
    add_event: "Añadir evento", new_event: "Nuevo evento", edit_event: "Editar evento", add_title: "Añadir título",
    type: "Tipo", repeat: "Repetir", calendar: "Calendario", starts: "Inicio", ends: "Fin",
    location: "Ubicación", description: "Descripción", forecast: "Previsión: {f}", rain: "{p}% de probabilidad de lluvia",
    rep_none: "No se repite", rep_daily: "Cada día", rep_weekly: "Cada semana", rep_2weeks: "Cada 2 semanas",
    rep_monthly: "Cada mes", rep_yearly: "Cada año", rep_custom: "Personalizado (sin cambios)",
    rec_note: "Evento recurrente: al guardar elegirás qué eventos cambiar.",
    err_title: "Añade un título.", err_start: "Elige una fecha de inicio.", err_end_date: "La fecha de fin es anterior a la de inicio.",
    err_times: "Elige la hora de inicio y de fin.", err_order: "El fin debe ser posterior al inicio.",
    err_create: "No se pudo crear el evento.", err_save: "No se pudieron guardar los cambios.", err_delete: "No se pudo eliminar el evento.",
    added: "Añadido «{t}»", saved: "Guardado «{t}»", moved: "«{t}» movido a {c}", deleted: "Eliminado «{t}»",
    deleted_all: "Eliminados todos los eventos «{t}»", deleted_from: "Eliminado «{t}» desde el {d}",
    del_rec_q: "Eliminar evento recurrente", del_q: "¿Eliminar «{t}»? No se puede deshacer.",
    this_event: "Este evento", this_following: "Este y los siguientes", all_events: "Todos los eventos",
    save_rec_q: "Guardar cambios en un evento recurrente",
    ro_event: "Este evento no se puede cambiar desde aquí.", ro_cal: "Este calendario es de solo lectura en Home Assistant.",
    no_edit: "Este calendario no permite editar eventos desde Home Assistant.", no_delete: "Este calendario no permite eliminar eventos desde Home Assistant.",
    countdown: "Cuenta atrás",
    todo: "Tareas", todo_toggle: "Mostrar / ocultar la lista de tareas", add_task: "Añadir una tarea…", due: "Fecha límite", add_task_btn: "Añadir tarea",
    everyone: "Todos", mark_done: "Marcar como hecha", all_done: "Todo hecho: la lista está vacía",
    done: "Hecho: {t}", undo: "Deshacer", err_task_add: "No se pudo añadir la tarea.", err_task_upd: "No se pudo actualizar la tarea.", err_undo: "No se pudo deshacer.",
    fs_browser: "Pantalla completa del navegador", fs_exit: "Salir de pantalla completa", fs_off: "Mostrar Home Assistant (hasta recargar)",
    type_standard: "Estándar", type_holiday: "Vacaciones", type_birthday: "Cumpleaños", type_anniversary: "Aniversario",
    type_work: "Trabajo", type_dhs: "DHS", type_nameday: "Onomástica",
    "wx_clear-night": "despejado", wx_cloudy: "nublado", wx_exceptional: "excepcional", wx_fog: "niebla", wx_hail: "granizo",
    wx_lightning: "tormenta eléctrica", "wx_lightning-rainy": "tormenta con lluvia", wx_partlycloudy: "parcialmente nublado", wx_pouring: "lluvia intensa",
    wx_rainy: "lluvioso", wx_snowy: "nieve", "wx_snowy-rainy": "aguanieve", wx_sunny: "soleado", wx_windy: "ventoso", "wx_windy-variant": "ventoso",
    ed_theme: "Tema", ed_theme_sub: "Combinación de colores de la tarjeta. «Home Assistant» sigue el tema de tu panel.",
    ed_cals: "Calendarios", ed_cals_sub: "Elige cada calendario, dale un nombre y un color y, si quieres, vincúlalo a una persona.",
    ed_add_cal: "Añadir calendario", ed_display: "Visualización", ed_note: "Las cuentas atrás y los tipos de evento personalizados se configuran en el editor de código; consulta el README.",
    ed_colour: "Color", ed_up: "Subir", ed_down: "Bajar", ed_remove: "Quitar", ed_leave_empty: "Déjalo vacío para usar «{n}»",
    l_title: "Título", l_weather_entity: "Entidad del tiempo", l_language: "Idioma", l_layout: "Diseño", l_keep_awake: "Mantener la pantalla encendida",
    l_todo_entity: "Lista de tareas (opcional)", l_todo_title: "Título de la lista de tareas", l_todo_position: "Posición de la lista de tareas",
    l_todo_autohide: "Ocultar la lista tras (0 = no)", l_default_view: "Vista predeterminada", l_days_to_show: "Días en la agenda",
    l_first_day_of_week: "Primer día de la semana", l_time_format: "Formato de hora", l_show_header: "Mostrar encabezado con fecha y tiempo",
    l_allow_add: "Permitir añadir eventos", l_allow_edit: "Permitir editar eventos", l_allow_delete: "Permitir eliminar eventos",
    l_show_empty_days: "Mostrar días sin eventos", l_max_height: "Altura máx. (p. ej. 600px)",
    l_entity: "Calendario", l_name: "Nombre visible", l_person: "Persona (muestra su foto)", l_type: "Tipo de calendario",
    o_auto: "Automático", o_top: "Arriba", o_bottom: "Abajo", o_left: "Izquierda", o_right: "Derecha",
    o_monday: "Lunes", o_sunday: "Domingo", o_saturday: "Sábado",
    o_tf_auto: "Del perfil de HA", o_24h: "24 horas", o_12h: "12 horas",
    o_card: "Tarjeta (normal)", o_fill: "Llenar la página (vista de panel)", o_fullscreen: "Pantalla completa (pantalla de pared)",
    o_events: "Eventos", o_birthdays: "Cumpleaños", o_anniversaries: "Aniversarios", o_namedays: "Onomásticas", o_holidays: "Festivos (banner del día)",
    o_lang_auto: "De Home Assistant",
    up_next: "A continuación", nothing_today: "Nada más por hoy", nothing_tomorrow: "Mañana no hay nada planeado", tap_wake: "Toca para activar",
    ed_night: "Modo nocturno", ed_saver: "Salvapantallas", l_night_mode: "Modo nocturno", l_screensaver: "Salvapantallas",
    l_enabled: "Activado", l_start: "Desde", l_end: "Hasta", l_style: "Estilo", l_brightness: "Brillo",
    l_when_entity: "O activar con una entidad (opcional)", l_wake_entity: "Activar con un sensor de movimiento (opcional)", l_wake_seconds: "Permanecer activo (segundos)",
    l_after: "Iniciar tras (minutos)", l_media: "Carpeta de fotos (media source)", l_interval: "Segundos por foto", l_show_info: "Mostrar reloj y próximo evento", l_shuffle: "Fotos en orden aleatorio",
    ed_new_cal: "Nuevo calendario – elige uno", ed_expand: "Mostrar ajustes", ed_collapse: "Ocultar ajustes", ed_expand_all: "Expandir todo", ed_collapse_all: "Contraer todo", tg_overdue: "Atrasadas", tg_nodate: "Sin fecha", tg_upcoming: "Próximas", done_section: "Hechas", upcoming_hint: "Próxima: podrás marcarla cuando toque", undo_done: "Marcar como pendiente", l_todo_group_by: "Agrupar tareas por", o_group_person: "Persona", o_group_due: "Fecha (Atrasadas / Hoy / …)", l_todo_days_ahead: "Mostrar tareas de los próximos … días (0 = todas)", l_todo_calendar: "Calendario con próximas repeticiones (opcional)", l_todo_show_completed: "Mostrar tareas hechas", l_todo_completed_days: "Hechas en los últimos … días", grp_each: "Mostrar u ocultar cada calendario", l_group: "Grupo (opcional)", ed_group_help: "Los calendarios con el mismo nombre de grupo comparten un botón que los muestra u oculta todos, p. ej. Niños", o_clock: "Solo reloj", o_dim: "Atenuar el calendario", ed_media_help: "p. ej. media-source://media_source/local/photos – déjalo vacío para un salvapantallas solo con reloj",
  },
};
const LANGS = { en: "English", pl: "Polski", es: "Español" };

// "pl-PL" -> "pl"; unknown languages fall back to English
const uiLang = (code) => {
  const c = String(code || "en").toLowerCase().split(/[-_]/)[0];
  return I18N[c] ? c : "en";
};

const tr = (lang, key, vars) => {
  let s = I18N[lang]?.[key] ?? I18N.en[key] ?? key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.split(`{${k}}`).join(v); });
  return s;
};

// Polish: 1 rok, 2–4 lata (not 12–14), 5+ lat
const plYears = (n) => (n === 1 ? "rok" : n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14) ? "lata" : "lat");

const NUM = {
  en: { days: (n) => (n === 1 ? "day" : "days"), turns: (n) => `turns ${n}`, ord: (n) => ordinal(n), anniv: (n) => `${ordinal(n)} anniversary` },
  pl: { days: (n) => (n === 1 ? "dzień" : "dni"), turns: (n) => `kończy ${n} ${plYears(n)}`, ord: (n) => `${n}. rocznica`, anniv: (n) => `${n}. rocznica` },
  es: { days: (n) => (n === 1 ? "día" : "días"), turns: (n) => `cumple ${n}`, ord: (n) => `${n}.º`, anniv: (n) => `${n}.º aniversario` },
};

// Tags people may type themselves in Google/Apple (e.g. "#imieniny") map to the built-in types
const TYPE_ALIASES = {
  imieniny: "nameday", urodziny: "birthday", rocznica: "anniversary", wakacje: "holiday", urlop: "holiday", praca: "work",
  onomastica: "nameday", santo: "nameday", cumpleanos: "birthday", aniversario: "anniversary", vacaciones: "holiday", trabajo: "work",
};


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
        o.type = t.startsWith("birthday") ? "birthday" : t.startsWith("holiday") ? "holiday" : t.startsWith("anniversar") ? "anniversary"
          : (t.startsWith("nameday") || t.startsWith("imieniny")) ? "nameday" : "events";
        return o;
      })
      .filter((c) => c.entity);
    const defs = Object.fromEntries(DEFAULT_TYPES.map((t) => [t.id, t]));
    this._configTypes = Array.isArray(config.event_types) && config.event_types.length > 0;
    this._types = Array.isArray(config.event_types) && config.event_types.length
      ? config.event_types.map((t) => {
        const o = typeof t === "string" ? { id: t } : { ...t };
        o.id = String(o.id || o.name || "").toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
        return { ...(defs[o.id] || { name: o.id, icon: "mdi:tag-outline" }), ...o, customName: o.name };
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
    if (this._built) setTimeout(() => this._ambientTick(), 0);
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
    const tc = this._config.todo_calendar;
    if (tc && old.states[tc] !== hass.states[tc]) this._fetchTodoCal();
    const { night } = this._ambientCfg();
    if (night?.wake_entity && hass.states[night.wake_entity]?.state === "on" && old.states[night.wake_entity]?.state !== "on") this._wake();
    if (night?.when_entity && old.states[night.when_entity] !== hass.states[night.when_entity]) this._ambientTick();
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
    this._ambientStart();
    this._tick = setInterval(() => {
      const k = dayKey(new Date());
      if (k !== this._today) {
        // Day rolled over: keep the view following "today" if it was on today.
        if (dayKey(this._anchor) === this._today) this._anchor = startOfDay(new Date());
        this._today = k;
        this._fetchEvents();
        this._fetchCountdowns();
        this._renderTodoList();
        this._fetchTodoCal();
      }
      this._render();
    }, 60 * 1000);
    const mins = Math.max(1, Number(this._config?.refresh_interval) || 5);
    this._refresh = setInterval(() => { this._fetchEvents(); this._fetchCountdowns(); this._fetchTodoCal(); }, mins * 60 * 1000);
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
    this._ambientStop();
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
    // "Done by: Dom (2026-10-12 14:30)" is written by this card when a task is ticked
    const db = String(it.description || "").match(DONE_BY_RE);
    let completedAt = it.completed ? new Date(it.completed) : null;
    if (!completedAt && db?.[2]) completedAt = new Date(`${db[2]}T${db[3] || "12:00"}`);
    if (completedAt && isNaN(completedAt)) completedAt = null;
    return { raw: it, uid: it.uid, summary, who, cal, due, timed, done: it.status === "completed", doneBy: db ? db[1] : null, completedAt };
  }

  _todoOpts() {
    const c = this._config;
    const days = Number(c.todo_days_ahead);
    const cdays = Number(c.todo_completed_days);
    return {
      groupBy: c.todo_group_by === "due" ? "due" : "person",
      daysAhead: days > 0 ? days : (c.todo_calendar ? 7 : 0), // 0 = no limit
      calendar: c.todo_calendar || "",
      showCompleted: c.todo_show_completed === true,
      completedDays: cdays > 0 ? cdays : 7,
      recordDoneBy: c.todo_record_done_by !== false,
    };
  }

  // Future repeats of recurring chores, read from a calendar (e.g. Chore Calendar). Shown read-only.
  async _fetchTodoCal() {
    const { calendar, daysAhead } = this._todoOpts();
    if (!calendar || !this._hass?.states[calendar]) { this._todoCal = []; return; }
    const start = startOfDay(new Date());
    const end = addDays(start, (daysAhead || 7) + 1);
    try {
      const res = await this._hass.callApi("GET",
        `calendars/${calendar}?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`);
      this._todoCal = (res || []).map((e) => {
        const allDay = !!(e.start && e.start.date);
        const st = allDay ? parseDate(e.start.date) : new Date(e.start?.dateTime || e.start);
        return { uid: `cal:${e.uid || ""}:${st.getTime()}`, summary: e.summary || "", due: st, timed: !allDay, upcoming: true, description: e.description || "" };
      }).filter((e) => e.summary && !isNaN(e.due));
    } catch (e) {
      console.warn("home-calendar-card: could not read todo_calendar", calendar, e);
      this._todoCal = [];
    }
    this._renderTodoList();
  }

  _buildTodo() {
    const box = this._todoBox;
    const ent = this._config.todo_entity;
    if (!box) return;
    if (!ent) { box.hidden = true; box.innerHTML = ""; this._todoKey = null; return; }
    const people = this._todoPeople();
    const feats = this._features(ent);
    const o = this._todoOpts();
    const key = JSON.stringify([ent, feats, this._config.todo_title, this._config.todo_autohide, o, people.map((c) => [c.entity, this._calName(c), c.color])]);
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
      <div class="todo-head" ${this._todoAutohide() ? `data-action="todo-toggle" role="button" title="${esc(this._t("todo_toggle"))}"` : ""}>
        <ha-icon icon="mdi:checkbox-marked-circle-outline"></ha-icon>
        <span class="todo-title">${esc(this._config.todo_title || this._t("todo"))}</span>
        <span class="todo-count"></span>
        ${this._todoAutohide() ? `<ha-icon class="todo-chev" icon="mdi:chevron-down"></ha-icon>` : ""}
      </div>
      <div class="todo-err"></div>
      <div class="todo-list"></div>
      ${canAdd ? `<form class="todo-add" autocomplete="off">
        <div class="todo-row">
          <input class="inp" id="t-text" placeholder="${esc(this._t("add_task"))}" enterkeyhint="done">
          ${canDue ? `<input class="inp" type="date" id="t-due" title="${esc(this._t("due"))}">` : ""}
          <button class="t-addbtn" type="submit" title="${esc(this._t("add_task_btn"))}"><ha-icon icon="mdi:plus"></ha-icon></button>
        </div>
        <div class="t-who">
          ${people.map((c) => chip(c.entity, this._calName(c), c.color, this._avatar(c, "sm"))).join("")}
          ${chip("", this._t("everyone"), "var(--hcc-accent)", `<ha-icon class="t-all" icon="mdi:account-group"></ha-icon>`)}
        </div>
      </form>` : ""}`;
    const form = box.querySelector(".todo-add");
    if (form) {
      form.addEventListener("submit", (e) => { e.preventDefault(); this._addTodo(); });
      form.addEventListener("keydown", (e) => e.stopPropagation()); // don't trigger HA shortcuts while typing
    }
    this._applyTodoState();
    this._renderTodoList();
    this._fetchTodoCal();
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

  _dueChip(t, upcoming = false) {
    if (!t.due) return "";
    const n = Math.round((startOfDay(t.due) - startOfDay(new Date())) / 864e5);
    const date = this._fmt({ weekday: "short", day: "numeric", month: "short" }).format(t.due);
    let label = n === 0 ? this._t("today") : n === 1 ? this._t("tomorrow") : n === -1 ? this._t("yesterday") : date;
    if (t.timed) label += ` ${this._time(t.due)}`;
    const cls = !upcoming && (n < 0 || (t.timed && t.due < new Date())) ? "overdue" : n === 0 ? "due-today" : "";
    return `<span class="due ${cls}" title="${esc(date)}"><ha-icon icon="${cls === "overdue" ? "mdi:alert-circle-outline" : "mdi:calendar-blank-outline"}"></ha-icon>${esc(label)}</span>`;
  }

  _todoRow(t, showWho, dateInHeading = false) {
    // when the group heading already says the day, only show a time (if any)
    const chip = (up) => (!dateInHeading ? this._dueChip(t, up)
      : t.timed ? `<span class="due ${!up && t.due < new Date() ? "overdue" : ""}"><ha-icon icon="mdi:clock-outline"></ha-icon>${esc(this._time(t.due))}</span>` : "");
    const who = showWho && (t.cal || t.who)
      ? `<span class="ti-who" style="--c:${esc(t.cal?.color || "var(--hcc-accent)")}">${t.cal ? this._avatar(t.cal, "sm") : ""}${esc(t.cal ? this._calName(t.cal) : t.who)}</span>` : "";
    if (t.upcoming) {
      return `<div class="ti upcoming" title="${esc(this._t("upcoming_hint"))}">
        <span class="tick ghost"><ha-icon icon="mdi:calendar-clock"></ha-icon></span>
        <span class="ti-text">${esc(t.summary)}</span>${who}${chip(true)}
      </div>`;
    }
    return `<div class="ti" data-uid="${esc(t.uid)}">
      <button class="tick" data-action="todo-done" data-uid="${esc(t.uid)}" title="${esc(this._t("mark_done"))}"><ha-icon icon="mdi:check"></ha-icon></button>
      <span class="ti-text">${esc(t.summary)}</span>${who}${chip(false)}
    </div>`;
  }

  _renderTodoList() {
    const box = this._todoBox;
    const list = box?.querySelector(".todo-list");
    if (!list) return;
    box.querySelector(".todo-err").textContent = this._todoError || "";
    this._pendingDone = this._pendingDone || new Set();
    const o = this._todoOpts();
    const today = startOfDay(new Date());
    const horizon = o.daysAhead ? addDays(today, o.daysAhead + 1) : null;
    const all = (this._todos || []).map((i) => this._parseTodo(i));
    const inWindow = (t) => !horizon || !t.due || t.due < horizon;
    const items = all.filter((t) => !t.done && !this._pendingDone.has(t.uid) && inWindow(t));
    const norm = (x) => String(x || "").trim().toLowerCase();
    // future repeats from the linked calendar – skip the ones already present as a real task on that day
    const upcoming = (this._todoCal || [])
      .map((e) => ({ ...e, ...this._parseTodo({ summary: e.summary, description: e.description, due: null }), due: e.due, timed: e.timed, upcoming: true, uid: e.uid }))
      .filter((e) => e.due >= today && inWindow(e)
        && !all.some((t) => norm(t.summary) === norm(e.summary) && t.due && sameDay(t.due, e.due)
          && (!t.done || (t.completedAt && sameDay(t.completedAt, new Date())))));
    const sort = (a, b) => ((a.due ? a.due.getTime() : Infinity) - (b.due ? b.due.getTime() : Infinity)) || (a.upcoming - b.upcoming) || a.summary.localeCompare(b.summary);
    let groups = [];
    if (o.groupBy === "due") {
      const by = new Map();
      const put = (k, g, t) => { if (!by.has(k)) by.set(k, { ...g, items: [] }); by.get(k).items.push(t); };
      [...items, ...upcoming].forEach((t) => {
        if (!t.due) return put("z", { name: this._t("tg_nodate"), icon: "mdi:calendar-blank-outline", order: 9e15 }, t);
        const n = Math.round((startOfDay(t.due) - today) / 864e5);
        if (n < 0 || (t.timed && t.due < new Date() && !t.upcoming)) return put("o", { name: this._t("tg_overdue"), icon: "mdi:alert-circle-outline", cls: "overdue", order: -1 }, t);
        if (n === 0) return put("t", { name: this._t("today"), icon: "mdi:calendar-today", cls: "today", order: 0 }, t);
        if (n === 1) return put("m", { name: this._t("tomorrow"), icon: "mdi:calendar-arrow-right", order: 1 }, t);
        put(`d${n}`, { name: this._fmt({ weekday: "long", day: "numeric", month: "short" }).format(t.due), icon: "mdi:calendar", order: n }, t);
      });
      groups = [...by.values()].sort((a, b) => a.order - b.order);
    } else {
      groups = this._todoPeople().map((c) => ({ name: this._calName(c), cal: c, items: items.filter((t) => t.cal === c) }));
      const loose = {};
      const EVERY = "\u0000everyone";
      items.filter((t) => !t.cal).forEach((t) => { const k = t.who || EVERY; (loose[k] = loose[k] || []).push(t); });
      Object.entries(loose).sort(([a], [b]) => (a === EVERY) - (b === EVERY) || a.localeCompare(b))
        .forEach(([name, its]) => groups.push({ name: name === EVERY ? this._t("everyone") : name, every: name === EVERY, cal: null, items: its }));
      if (upcoming.length) groups.push({ name: this._t("tg_upcoming"), icon: "mdi:calendar-clock", upcomingGroup: true, items: upcoming });
    }
    box.querySelector(".todo-count").textContent = items.length ? String(items.length) : "";
    const shown = groups.filter((g) => g.items.length);
    const due = o.groupBy === "due";
    let html = shown.length ? shown.map((g) => {
      const color = g.cal?.color || (g.cls === "overdue" ? "var(--error-color, #db4437)" : "var(--hcc-accent)");
      const av = g.cal ? this._avatar(g.cal, "sm") : "";
      const head = av || (g.every ? `<ha-icon class="t-all" icon="mdi:account-group"></ha-icon>` : g.icon ? `<ha-icon class="t-all" icon="${g.icon}"></ha-icon>` : `<span class="dot"></span>`);
      return `<div class="tg ${g.cls || ""} ${g.upcomingGroup ? "upcoming-group" : ""}" style="--c:${esc(color)}">
        <div class="tg-head">${head}<span class="tg-name">${esc(g.name)}</span><span class="tg-n">${g.items.length}</span></div>
        ${g.items.sort(sort).map((t) => this._todoRow(t, due || g.upcomingGroup, due && g.cls !== "overdue")).join("")}
      </div>`;
    }).join("") : `<div class="todo-empty"><ha-icon icon="mdi:party-popper"></ha-icon>${esc(this._t("all_done"))}</div>`;

    // recently completed
    if (o.showCompleted) {
      const since = addDays(today, -(o.completedDays - 1));
      const doneAll = all.filter((t) => t.done);
      const dated = doneAll.filter((t) => t.completedAt && t.completedAt >= since).sort((a, b) => b.completedAt - a.completedAt);
      const undated = doneAll.filter((t) => !t.completedAt).slice(-10).reverse(); // no timestamp: show the last few
      const done = [...dated, ...undated];
      if (done.length) {
        const open = !!this._doneOpen;
        html += `<div class="tg done-group ${open ? "open" : ""}" style="--c:var(--hcc-muted)">
          <button class="tg-head done-head" data-action="todo-done-toggle"><ha-icon class="t-all" icon="mdi:check-all"></ha-icon>
            <span class="tg-name">${esc(this._t("done_section"))}</span><span class="tg-n">${done.length}</span><ha-icon class="done-chev" icon="mdi:chevron-down"></ha-icon></button>
          ${open ? done.map((t) => {
            const when = t.completedAt ? (sameDay(t.completedAt, new Date()) ? this._t("today") : sameDay(t.completedAt, addDays(new Date(), -1)) ? this._t("yesterday")
              : this._fmt({ weekday: "short", day: "numeric", month: "short" }).format(t.completedAt)) : "";
            const meta = [when, t.doneBy].filter(Boolean).join(" · ");
            const who = t.cal || t.who ? `<span class="ti-who" style="--c:${esc(t.cal?.color || "var(--hcc-accent)")}">${t.cal ? this._avatar(t.cal, "sm") : ""}${esc(t.cal ? this._calName(t.cal) : t.who)}</span>` : "";
            return `<div class="ti is-done" data-uid="${esc(t.uid)}">
              <button class="tick on" data-action="todo-undone" data-uid="${esc(t.uid)}" title="${esc(this._t("undo_done"))}"><ha-icon icon="mdi:check"></ha-icon></button>
              <span class="ti-text">${esc(t.summary)}</span>${who}${meta ? `<span class="done-meta">${esc(meta)}</span>` : ""}
            </div>`;
          }).join("") : ""}
        </div>`;
      }
    }
    list.innerHTML = html;
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
      box.querySelector(".todo-err").textContent = e?.message || this._t("err_task_add");
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
      else {
        const data = { item: uid, status: "completed" };
        const user = this._hass.user?.name;
        if (user && this._todoOpts().recordDoneBy && (this._features(ent) & 64)) {
          const n = new Date();
          const base = String(raw.description || "").replace(DONE_BY_LINE_RE, "").trim();
          data.description = `${base ? `${base}\n` : ""}Done by: ${user} (${dayKey(n)} ${timeKey(n)})`;
        }
        await this._hass.callService("todo", "update_item", data, { entity_id: ent });
      }
      this._notify(this._t("done", { t: t.summary }), { text: this._t("undo"), action: () => this._todoUndo(uid, raw, remove) });
      if (!this._todoLive) this._loadTodos();
    } catch (e) {
      this._pendingDone.delete(uid);
      this._renderTodoList();
      this._toast(e?.message || this._t("err_task_upd"));
    }
  }

  // Un-tick a task from the Done section
  async _todoUndone(uid) {
    const ent = this._config.todo_entity;
    const raw = (this._todos || []).find((i) => i.uid === uid);
    if (!raw) return;
    this._pendingDone?.delete(uid);
    const data = { item: uid, status: "needs_action" };
    if ((this._features(ent) & 64) && raw.description) data.description = String(raw.description).replace(DONE_BY_LINE_RE, "").trim();
    try {
      await this._hass.callService("todo", "update_item", data, { entity_id: ent });
      if (!this._todoLive) this._loadTodos();
    } catch (e) { this._toast(e?.message || this._t("err_task_upd")); }
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
        const data = { item: uid, status: "needs_action" };
        if ((this._features(ent) & 64) && raw.description != null) data.description = String(raw.description).replace(DONE_BY_LINE_RE, "").trim();
        await this._hass.callService("todo", "update_item", data, { entity_id: ent });
      }
    } catch (e) { this._toast(e?.message || this._t("err_undo")); }
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
    const typeId = tagged || (["birthday", "holiday", "anniversary", "nameday"].includes(cal.type) ? cal.type : "standard");
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
    let k = String(id || "").toLowerCase();
    if (TYPE_ALIASES[k] && !this._types?.some((t) => t.id === k)) k = TYPE_ALIASES[k];
    return this._types?.find((t) => t.id === k) || DEFAULT_TYPES.find((t) => t.id === k)
      || (strict ? null : DEFAULT_TYPES[0]);
  }

  _ty(ev) { return this._typeById(ev.type); }

  _isBanner(ev) { return this._ty(ev).style === "banner"; }

  // Birthdays and anniversaries: all-day, yearly, with an age/years count.
  _isBday(ev) { return ["birthday", "anniversary", "nameday"].includes(this._ty(ev).style); }

  _yearlyLabel(ev, short = false) {
    const anniv = this._ty(ev).style === "anniversary";
    const style = this._ty(ev).style;
    const name = this._t(style === "nameday" ? "nameday" : anniv ? "anniversary" : "birthday");
    if (short || !ev.age || style === "nameday") return name;
    return anniv ? this._n().anniv(ev.age) : `${name} · ${this._n().turns(ev.age)}`;
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
        return { name: cd.name || this._t("countdown"), start: d, end: d, icon: cd.icon, color, fixed, kind: cd.type || "custom" };
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
    if (ty.style === "nameday") return "nameday";
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
      const num = n > 0 ? n : ongoing && n < 0 ? this._t("now") : this._t("today");
      const unit = n > 0 ? this._n().days(n) : "";
      const color = this._cdColor(cd, !cd.fixed && (cd.kind === "custom" || !cd.ev) ? customIdx++ : 0);
      return `<div class="cd ${n <= 0 ? "due" : ""}" style="--c:${esc(color)}" ${cd.ev ? `data-action="open-cd" data-start="${cd.start.getTime()}" data-name="${esc(cd.ev.summary)}"` : ""}>
        <div class="cd-top"><span class="cd-icon"><ha-icon icon="${esc(cd.icon || "mdi:timer-sand")}"></ha-icon></span>
        <span class="cd-num">${num}${unit ? `<span>${unit}</span>` : ""}</span></div>
        <div class="cd-name">${esc(cd.name)}</div>
        <div class="cd-date">${esc(f.format(cd.start))}${cd.kind === "nameday" ? ` · ${esc(this._t("nameday"))}` : ""}${cd.ev?.age && this._isBday(cd.ev) ? ` · ${esc(this._ty(cd.ev).style === "anniversary" ? this._n().ord(cd.ev.age) : this._n().turns(cd.ev.age))}` : ""}</div>
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
    if (cal.type === "nameday") return `<span class="av ${cls}" ${style}><ha-icon icon="mdi:flower-tulip"></ha-icon></span>`;
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

  _lang() {
    const l = this._config?.language;
    return (l && l !== "auto" ? l : null) || this._hass?.locale?.language || this._hass?.language || navigator.language || "en";
  }

  _ui() { return uiLang(this._lang()); }

  _t(key, vars) { return tr(this._ui(), key, vars); }

  _n() { return NUM[this._ui()]; }

  _wx(c) { const k = `wx_${c}`; const v = this._t(k); return v === k ? wxName(c) : v; }

  _typeName(ty) {
    if (!ty) return "";
    if (ty.customName) return ty.customName;
    const k = `type_${ty.id}`;
    const v = this._t(k);
    return v === k ? (ty.name || ty.id) : v;
  }

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
        return this._t("all_day_n", { n, t: total });
      }
      return this._t("all_day");
    }
    if (!day) return `${this._time(ev.start)} – ${this._time(ev.end)}`;
    const ds = startOfDay(day);
    const de = addDays(ds, 1);
    const startsBefore = ev.start < ds;
    const endsAfter = ev.end > de;
    if (startsBefore && endsAfter) return this._t("all_day");
    if (startsBefore) return this._t("until", { t: this._time(ev.end) });
    if (endsAfter) return this._t("from", { t: this._time(ev.start) });
    if (ev.start.getTime() === ev.end.getTime()) return this._time(ev.start);
    return `${this._time(ev.start)} – ${this._time(ev.end)}`;
  }

  _shortLabel(ev, day) {
    if (ev.allDay) return this._t("all_day");
    const ds = startOfDay(day);
    if (ev.start < ds) return ev.end > addDays(ds, 1) ? this._t("all_day") : `→ ${this._time(ev.end)}`;
    return this._time(ev.start);
  }

  _whenText(ev) {
    const longDay = this._fmt({ weekday: "long", day: "numeric", month: "long" });
    const shortDay = this._fmt({ weekday: "short", day: "numeric", month: "short" });
    if (ev.allDay) {
      const lastDay = addDays(ev.end, -1);
      if (sameDay(ev.start, lastDay) || ev.end <= ev.start) return `${longDay.format(ev.start)} · ${this._t("all_day")}`;
      return `${shortDay.format(ev.start)} – ${shortDay.format(lastDay)} · ${this._t("all_day")}`;
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
    this.shadowRoot.innerHTML = `<style>${STYLES}</style><ha-card><div class="inner"><div class="wrap"></div><div class="todo" hidden></div></div><div class="amb night"></div><div class="amb saver"></div><div class="fs-ctl"></div><div class="hcc-toast"></div></ha-card><dialog></dialog>`;
    this._main = this.shadowRoot.querySelector(".wrap");
    this._todoBox = this.shadowRoot.querySelector(".todo");
    ["pointerdown", "keydown", "input", "focusin"].forEach((ev) => this._todoBox.addEventListener(ev, () => this._todoActivity()));
    this._inner = this.shadowRoot.querySelector(".inner");
    this._nightEl = this.shadowRoot.querySelector(".amb.night");
    this._saverEl = this.shadowRoot.querySelector(".amb.saver");
    // Taps on the night/screensaver overlays only wake the screen – they never reach the calendar underneath.
    [this._nightEl, this._saverEl].forEach((el) => {
      el.addEventListener("pointerdown", (e) => e.stopPropagation());
      el.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
    });
    this._nightEl.addEventListener("click", (e) => { e.stopPropagation(); e.preventDefault(); this._wake(); });
    const dismissSaver = () => { this._lastActivity = Date.now(); this._setSaver(null); };
    this._saverEl.addEventListener("click", (e) => { e.stopPropagation(); e.preventDefault(); dismissSaver(); });
    let moved = 0;
    this._saverEl.addEventListener("pointermove", (e) => {
      e.stopPropagation();
      if (e.pointerType !== "mouse") return;
      moved += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
      if (moved > 40) { moved = 0; dismissSaver(); }
    });
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

  /* --------------------------------------------------------------- ambient */
  // Night mode and screensaver for always-on screens. Both are overlays inside the card,
  // so in `layout: fullscreen` they cover the whole screen. Never active while editing.

  _ambientCfg() {
    const on = (v) => v === true || (v && typeof v === "object" && v.enabled !== false);
    const n = this._config?.night_mode;
    const s = this._config?.screensaver;
    const night = on(n) ? { start: "22:00", end: "06:30", style: "clock", brightness: 30, wake_seconds: 60, ...(typeof n === "object" ? n : {}) } : null;
    const saver = on(s) ? { after: 5, interval: 20, show_info: true, shuffle: true, ...(typeof s === "object" ? s : {}) } : null;
    return { night, saver };
  }

  _isNight(cfg) {
    if (!cfg) return false;
    if (cfg.when_entity) {
      const st = this._hass?.states[cfg.when_entity]?.state;
      return st === "on" || st === "true";
    }
    const mins = (t) => { const m = String(t || "").match(/^(\d{1,2}):(\d{2})/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
    const s = mins(cfg.start);
    const e = mins(cfg.end);
    if (s == null || e == null || s === e) return false;
    const d = new Date();
    const m = d.getHours() * 60 + d.getMinutes();
    return s < e ? m >= s && m < e : m >= s || m < e; // start > end = overnight (e.g. 22:00–06:30)
  }

  _ambientStart() {
    this._lastActivity = Date.now();
    this._onActivity = () => {
      const now = Date.now();
      this._lastActivity = now;
      const { night } = this._ambientCfg();
      if (this._wakeUntil && now < this._wakeUntil && night) this._wakeUntil = now + (Number(night.wake_seconds) || 60) * 1000;
    };
    this._activityEvents = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"];
    this._activityEvents.forEach((ev) => window.addEventListener(ev, this._onActivity, { passive: true }));
    clearInterval(this._ambTimer);
    this._ambTimer = setInterval(() => this._ambientTick(), 5000);
    setTimeout(() => this._ambientTick(), 0);
  }

  _ambientStop() {
    (this._activityEvents || []).forEach((ev) => window.removeEventListener(ev, this._onActivity));
    clearInterval(this._ambTimer);
    clearInterval(this._slideTimer);
    this._saverOn = false;
    this._nightOn = false;
  }

  _ambientTick() {
    if (!this._built || !this._config || !this._nightEl) return;
    const { night, saver } = this._ambientCfg();
    const editing = this._inEditor();
    const now = Date.now();
    const awake = this._wakeUntil && now < this._wakeUntil;
    const nightOn = !!(!editing && night && this._isNight(night) && !awake);
    const active = this.shadowRoot.activeElement;
    const busy = this._dlg?.open || (active && this._todoBox?.contains(active));
    const idle = saver ? now - this._lastActivity >= Math.max(0.05, Number(saver.after) || 5) * 60000 : false;
    const saverOn = !!(!editing && !nightOn && saver && !busy && (this._saverOn || idle));
    if ((nightOn && !this._nightOn) || (saverOn && !this._saverOn)) this._ambientEnter();
    this._setNight(nightOn ? night : null);
    this._setSaver(saverOn ? saver : null);
    if (nightOn || saverOn) {
      if (!this._ambFetched || now - this._ambFetched > 10 * 60000) this._fetchAmbient();
      this._updateAmbient();
    }
  }

  // Going dark or into the screensaver: show today again in the default view.
  _ambientEnter() {
    const def = ["agenda", "week", "month"].includes(this._config.default_view) ? this._config.default_view : "agenda";
    if (!sameDay(this._anchor, new Date()) || this._view !== def) {
      this._anchor = startOfDay(new Date());
      this._view = def;
      this._fetchEvents();
    }
    this._fetchAmbient();
  }

  _wake(seconds) {
    const { night } = this._ambientCfg();
    this._wakeUntil = Date.now() + (seconds || Number(night?.wake_seconds) || 60) * 1000;
    this._lastActivity = Date.now();
    this._ambientTick();
  }

  // Today + the next two days from every visible calendar, independent of the calendar view.
  async _fetchAmbient() {
    if (!this._hass) return;
    this._ambFetched = Date.now();
    const start = startOfDay(new Date());
    const end = addDays(start, 3);
    const lists = await Promise.all(this._calendars.filter((c) => this._hass.states[c.entity] && !this._hidden.has(c.entity)).map(async (cal) => {
      try {
        const res = await this._hass.callApi("GET",
          `calendars/${cal.entity}?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`);
        return (res || []).map((e) => this._normalize(e, cal));
      } catch (e) { return []; }
    }));
    this._ambEvents = lists.flat().filter((ev) => !this._isBanner(ev)).sort((a, b) => a.start - b.start);
    this._updateAmbient();
  }

  _ambLine(ev, dayLabel) {
    const running = !ev.allDay && ev.start <= new Date() && ev.end > new Date();
    const when = ev.allDay ? (this._isBday(ev) ? this._yearlyLabel(ev, true) : this._t("all_day")) : running ? this._t("now") : this._time(ev.start);
    const icon = this._typeIcon(ev);
    return `<div class="amb-ev" style="--c:${esc(ev.cal.color)}"><span class="amb-ev-day">${esc(dayLabel)}</span>
      <span class="amb-ev-when">${esc(when)}</span>${icon ? `<ha-icon icon="${esc(icon)}"></ha-icon>` : `<span class="amb-dot"></span>`}
      <span class="amb-ev-title">${esc(ev.summary)}</span></div>`;
  }

  _ambWeather(day, withLow = true) {
    const f = this._forecast[dayKey(day)];
    const st = this._config.weather_entity && this._hass?.states[this._config.weather_entity];
    if (sameDay(day, new Date()) && st) {
      return `<span class="amb-wx"><ha-icon icon="${wxIcon(st.state)}" style="color:${wxColor(st.state)}"></ha-icon>${round(st.attributes.temperature)}°${f && withLow ? `<i>${round(f.temperature)}° / ${round(f.templow)}°</i>` : ""}</span>`;
    }
    if (!f) return "";
    return `<span class="amb-wx"><ha-icon icon="${wxIcon(f.condition)}" style="color:${wxColor(f.condition)}"></ha-icon>${round(f.temperature)}°${withLow && f.templow != null ? `<i>/ ${round(f.templow)}°</i>` : ""}</span>`;
  }

  _updateAmbient() {
    const now = new Date();
    const evs = this._ambEvents || [];
    const tomorrow = addDays(startOfDay(now), 1);
    const dateTxt = this._fmt({ weekday: "long", day: "numeric", month: "long" }).format(now);
    // small drift every minute so nothing stays burnt into the screen
    const minute = Math.floor(now.getTime() / 60000);
    if (minute !== this._driftMin) {
      this._driftMin = minute;
      this._drift = [Math.round((Math.random() - 0.5) * 80), Math.round((Math.random() - 0.5) * 60)];
    }
    const [dx, dy] = this._drift || [0, 0];

    if (this._nightOn && this._nightStyle === "clock") {
      const tmr = evs.filter((e) => sameDay(e.start, tomorrow) || (e.allDay && e.start <= tomorrow && e.end > tomorrow)).slice(0, 2);
      const box = this._nightEl.querySelector(".amb-box");
      box.style.setProperty("--sx", `${dx}px`);
      box.style.setProperty("--sy", `${dy}px`);
      box.querySelector(".amb-time").textContent = this._time(now);
      box.querySelector(".amb-date").textContent = dateTxt;
      box.querySelector(".amb-next").innerHTML = (tmr.length ? tmr.map((e) => this._ambLine(e, this._t("tomorrow"))).join("") : `<div class="amb-ev muted">${esc(this._t("nothing_tomorrow"))}</div>`)
        + (this._forecast[dayKey(tomorrow)] ? `<div class="amb-tw">${esc(this._t("tomorrow"))} ${this._ambWeather(tomorrow)}</div>` : "");
    }

    if (this._saverOn) {
      const info = this._saverEl.querySelector(".saver-info");
      info.hidden = this._saverCfg?.show_info === false;
      info.style.setProperty("--sx", `${dx / 2}px`);
      info.style.setProperty("--sy", `${dy / 3}px`);
      info.querySelector(".amb-time").textContent = this._time(now);
      info.querySelector(".amb-date").innerHTML = `${esc(dateTxt)} ${this._ambWeather(now)}`;
      const nowMs = now.getTime();
      const todayLeft = evs.filter((e) => sameDay(e.start, now) && !e.allDay && e.end.getTime() > nowMs);
      const allDayToday = evs.filter((e) => e.allDay && e.start <= now && e.end > now && this._isBday(e));
      const tomorrowEvs = evs.filter((e) => sameDay(e.start, tomorrow));
      let lines = [...allDayToday.slice(0, 1).map((e) => this._ambLine(e, this._t("today"))), ...todayLeft.slice(0, 2).map((e) => this._ambLine(e, this._t("today")))];
      if (!todayLeft.length) {
        lines.push(`<div class="amb-ev muted">${esc(this._t("nothing_today"))}</div>`);
        if (tomorrowEvs[0]) lines.push(this._ambLine(tomorrowEvs[0], this._t("tomorrow")));
      }
      const cd = (this._countdowns || []).find((c) => startOfDay(c.start) > startOfDay(now));
      if (cd) {
        const n = Math.round((startOfDay(cd.start) - startOfDay(now)) / 864e5);
        lines.push(`<div class="amb-cd"><ha-icon icon="${esc(cd.icon || "mdi:timer-sand")}"></ha-icon><b>${n}</b> ${esc(this._n().days(n))} · ${esc(cd.name)}</div>`);
      }
      info.querySelector(".amb-next").innerHTML = lines.join("");
    }
  }

  _setNight(cfg) {
    const el = this._nightEl;
    if (!cfg) {
      if (this._nightOn) { el.classList.remove("on"); this._nightOn = false; }
      return;
    }
    const style = cfg.style === "dim" ? "dim" : "clock";
    const b = Math.max(5, Math.min(100, Number(cfg.brightness) || 30)) / 100;
    el.style.setProperty("--nb", String(b));
    if (!this._nightOn || this._nightStyle !== style) {
      this._nightStyle = style;
      el.className = `amb night style-${style} on`;
      el.innerHTML = style === "clock"
        ? `<div class="amb-box"><div class="amb-time"></div><div class="amb-date"></div><div class="amb-next"></div></div><div class="amb-hint">${esc(this._t("tap_wake"))}</div>`
        : `<div class="amb-hint">${esc(this._t("tap_wake"))}</div>`;
      this._nightOn = true;
      this._updateAmbient();
    }
  }

  _setSaver(cfg) {
    const el = this._saverEl;
    if (!cfg) {
      if (this._saverOn) {
        this._saverOn = false;
        el.classList.remove("on");
        clearInterval(this._slideTimer);
      }
      return;
    }
    this._saverCfg = cfg;
    if (this._saverOn) return;
    this._saverOn = true;
    el.className = "amb saver on nophotos";
    el.innerHTML = `<div class="ph"><div class="ph-bg"></div><div class="ph-img"></div></div><div class="ph"><div class="ph-bg"></div><div class="ph-img"></div></div>
      <div class="saver-shade"></div>
      <div class="saver-info"><div class="saver-left"><div class="amb-time"></div><div class="amb-date"></div></div><div class="amb-next"></div></div>`;
    this._phFront = 0;
    this._updateAmbient();
    this._loadPhotos(cfg).then(() => {
      if (!this._saverOn) return;
      if (this._photos?.length) {
        this._nextPhoto();
        clearInterval(this._slideTimer);
        this._slideTimer = setInterval(() => this._nextPhoto(), Math.max(5, Number(cfg.interval) || 20) * 1000);
      }
    });
  }

  // Photos: `media:` is a Home Assistant media source folder (e.g. media-source://media_source/local/photos),
  // `images:` a list of plain URLs (e.g. /local/photos/beach.jpg). Both can be combined.
  async _loadPhotos(cfg) {
    const key = JSON.stringify([cfg.media || cfg.folder || "", cfg.images || [], cfg.shuffle]);
    if (this._photos && this._photosKey === key && Date.now() - this._photosAt < 3600e3) return;
    const list = [];
    [].concat(cfg.images || []).forEach((u) => u && list.push({ url: String(u) }));
    const walk = async (id, depth) => {
      const r = await this._hass.callWS({ type: "media_source/browse_media", media_content_id: id });
      for (const c of r?.children || []) {
        if (list.length >= 500) break;
        if (c.media_class === "image" || String(c.media_content_type || "").startsWith("image")) list.push({ id: c.media_content_id });
        else if (c.can_expand && depth < 2) await walk(c.media_content_id, depth + 1);
      }
    };
    const src = cfg.media || cfg.folder;
    if (src && this._hass) {
      try { await walk(src, 0); } catch (e) { console.warn("home-calendar-card: could not read screensaver photos from", src, e); }
    }
    if (cfg.shuffle !== false) {
      for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    }
    this._photos = list;
    this._photosKey = key;
    this._photosAt = Date.now();
    this._photoIdx = 0;
  }

  async _photoUrl(p) {
    if (p.url) return p.url;
    const r = await this._hass.callWS({ type: "media_source/resolve_media", media_content_id: p.id, expires: 3600 });
    return this._hass.hassUrl ? this._hass.hassUrl(r.url) : r.url;
  }

  async _nextPhoto(tries = 0) {
    if (!this._saverOn || !this._photos?.length || tries > 3) return;
    const p = this._photos[this._photoIdx++ % this._photos.length];
    let url;
    try { url = await this._photoUrl(p); } catch (e) { this._nextPhoto(tries + 1); return; }
    const img = new Image();
    img.onload = () => {
      if (!this._saverOn) return;
      const layers = this._saverEl.querySelectorAll(".ph");
      const next = layers[this._phFront ? 0 : 1];
      const prev = layers[this._phFront ? 1 : 0];
      const css = `url("${String(url).replace(/"/g, "%22")}")`;
      next.querySelector(".ph-bg").style.backgroundImage = css;
      const im = next.querySelector(".ph-img");
      im.style.backgroundImage = css;
      im.style.animation = "none";
      void im.offsetWidth; // restart the slow zoom
      im.style.animation = "";
      next.classList.add("show");
      prev.classList.remove("show");
      this._phFront = this._phFront ? 0 : 1;
      this._saverEl.classList.remove("nophotos");
    };
    img.onerror = () => this._nextPhoto(tries + 1);
    img.src = url;
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
      ${document.fullscreenEnabled ? `<button class="icon" data-action="browser-fs" title="${esc(this._t(isFs ? "fs_exit" : "fs_browser"))}"><ha-icon icon="${isFs ? "mdi:fullscreen-exit" : "mdi:fullscreen"}"></ha-icon></button>` : ""}
      <button class="icon" data-action="fs-off" title="${esc(this._t("fs_off"))}"><ha-icon icon="mdi:dock-window"></ha-icon></button>`;
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
    const cond = this._hass.formatEntityState ? this._hass.formatEntityState(st) : this._wx(st.state);
    const hiLo = today ? ` · ${round(today.temperature)}°${today.templow != null ? ` / ${round(today.templow)}°` : ""}` : "";
    return `<button class="now-wx" data-action="more-info" data-entity="${esc(id)}" title="${esc(cond)}">
      <ha-icon icon="${wxIcon(st.state)}" style="color:${wxColor(st.state)}"></ha-icon>
      <div><div class="temp">${round(st.attributes.temperature)}<span>${esc(unit)}</span></div>
      <div class="cond">${esc(cond)}${hiLo}</div></div>
    </button>`;
  }

  _renderToolbar() {
    const views = [["agenda", this._t("agenda")], ["week", this._t("week")], ["month", this._t("month")]];
    const canAdd = this._config.allow_add !== false && this._writable().length > 0;
    return `<div class="toolbar">
      <div class="seg">${views.map(([v, l]) => `<button class="${this._view === v ? "on" : ""}" data-action="view" data-view="${v}">${l}</button>`).join("")}</div>
      <div class="nav">
        <button class="icon" data-action="prev" title="${esc(this._t("prev"))}"><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <button class="today" data-action="today">${esc(this._t("today"))}</button>
        <button class="icon" data-action="next" title="${esc(this._t("next"))}"><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        <span class="range">${esc(this._rangeLabel())}</span>
      </div>
      ${this._config.layout === "fullscreen" && this._mode === "fill" && !this._inEditor() ? `<button class="icon" data-action="fs-on" title="${esc(this._t("back_fs"))}"><ha-icon icon="mdi:fullscreen"></ha-icon></button>` : ""}
      ${canAdd ? `<button class="add" data-action="add"><ha-icon icon="mdi:plus"></ha-icon><span>${esc(this._t("event_btn"))}</span></button>` : ""}
    </div>`;
  }

  _calChip(c) {
    return `<button class="chip ${this._hidden.has(c.entity) ? "off" : ""}" style="--c:${esc(c.color)}" data-action="toggle-cal" data-entity="${esc(c.entity)}">
        ${this._avatar(c, "sm") || `<span class="dot"></span>`}${esc(this._calName(c))}
      </button>`;
  }

  // Calendars with the same `group:` share one chip that shows/hides them all; the arrow opens the members.
  _renderChips() {
    this._openGroups = this._openGroups || new Set();
    const done = new Set();
    const out = [];
    this._calendars.forEach((c) => {
      const g = String(c.group || "").trim();
      if (!g) { out.push(this._calChip(c)); return; }
      if (done.has(g)) return;
      done.add(g);
      const members = this._calendars.filter((x) => String(x.group || "").trim() === g);
      const visible = members.filter((x) => !this._hidden.has(x.entity)).length;
      const state = visible === 0 ? "off" : visible < members.length ? "part" : "";
      const open = this._openGroups.has(g);
      const stack = members.slice(0, 4).map((m) => this._avatar(m, "sm") || `<span class="dot" style="--c:${esc(m.color)}"></span>`).join("");
      out.push(`<span class="cgroup ${open ? "open" : ""}">
        <button class="chip grp ${state}" style="--c:${esc(members[0].color)}" data-action="toggle-group" data-group="${esc(g)}">
          <span class="gstack">${stack}</span>${esc(g)}<span class="gcount">${state === "part" ? `${visible}/${members.length}` : members.length}</span>
        </button><button class="chip gexp" style="--c:${esc(members[0].color)}" data-action="expand-group" data-group="${esc(g)}" title="${esc(this._t("grp_each"))}"><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        ${open ? `<span class="gmembers">${members.map((m) => this._calChip(m)).join("")}</span>` : ""}
      </span>`);
    });
    return `<div class="chips">${out.join("")}</div>`;
  }

  _wxBadge(d, compact = false) {
    const f = this._forecast[dayKey(d)];
    if (!f) return "";
    const rain = Number(f.precipitation_probability);
    return `<span class="wx ${compact ? "compact" : ""}" title="${esc(this._wx(f.condition))}">
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
        <div class="ev-time">${live ? `<span class="pulse"></span>${esc(this._t("now"))} · ` : ""}${esc(label)}</div>
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
          ${evs.length ? evs.map((ev) => this._eventRow(ev, d)).join("") : hols ? "" : `<div class="empty-day">${esc(this._t("nothing"))}</div>`}
        </div>
      </div>`;
    }
    return out || `<div class="empty"><ha-icon icon="mdi:calendar-check-outline"></ha-icon><div>${esc(this._t("no_events"))}</div></div>`;
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
    if (missing.length && !ev.uid) delNote = this._t("ro_event");
    else if (missing.length === 2) delNote = this._t("ro_cal");
    else if (missing.length === 1) delNote = this._t(missing[0] === "edit" ? "no_edit" : "no_delete");
    const f = this._forecast[dayKey(ev.start)];
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location)}`;
    this._openDialog(`
      <div class="dlg-head" style="--c:${esc(ev.cal.color)}">
        <span class="dlg-dot"></span><div class="dlg-title">${esc(ev.summary)}</div>
        <button class="icon" data-action="close" title="${esc(this._t("close"))}"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
      <div class="dlg-body">
        <div class="row"><ha-icon icon="mdi:clock-outline"></ha-icon><div>${esc(this._whenText(ev))}${ev.age ? `<div class="muted">${this._ty(ev).style === "anniversary" ? `${esc(this._n().anniv(ev.age))} 💍` : `${esc(this._n().turns(ev.age))} 🎂`}</div>` : ""}${ev.rrule || ev.recurrence_id ? `<div class="muted">${esc(this._t("repeating"))}</div>` : ""}</div></div>
        ${ev.type !== "standard" ? `<div class="row"><ha-icon icon="${esc(this._typeIcon(ev) || "mdi:tag-outline")}" style="color:${esc(ev.cal.color)}"></ha-icon><div>${esc(this._typeName(this._ty(ev)))}</div></div>` : ""}
        ${ev.location ? `<div class="row"><ha-icon icon="mdi:map-marker-outline"></ha-icon><a href="${mapUrl}" target="_blank" rel="noopener">${esc(ev.location)}</a></div>` : ""}
        <div class="row"><ha-icon icon="mdi:calendar-blank-outline"></ha-icon><div class="cal-line">${this._avatar(ev.cal, "sm") || `<span class="cal-dot" style="--c:${esc(ev.cal.color)}"></span>`}${esc(this._calName(ev.cal))}</div></div>
        ${f ? `<div class="row"><ha-icon icon="${wxIcon(f.condition)}" style="color:${wxColor(f.condition)}"></ha-icon><div>${this._forecastText(f)}</div></div>` : ""}
        ${ev.description ? `<div class="row"><ha-icon icon="mdi:text"></ha-icon><div class="desc">${esc(ev.description)}</div></div>` : ""}
        <div class="f-err"></div>
      </div>
      <div class="dlg-foot">
        ${canDel ? `<button class="btn danger" data-action="delete"><ha-icon icon="mdi:delete-outline"></ha-icon><span>${esc(this._t("delete"))}</span></button>` : ""}
        ${canEdit ? `<button class="btn edit" data-action="edit"><ha-icon icon="mdi:pencil-outline"></ha-icon><span>${esc(this._t("edit"))}</span></button>` : ""}
        ${delNote ? `<span class="del-note"><ha-icon icon="mdi:lock-outline"></ha-icon>${esc(delNote)}</span>` : ""}
        <span class="sp"></span>
        <button class="btn" data-action="close">${esc(this._t("close"))}</button>
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
      <div class="del-q"><ha-icon icon="mdi:delete-alert-outline"></ha-icon>${esc(this._t("del_rec_q"))}</div>
      <div class="del-opts">
        <button class="btn danger-fill" data-action="delete-do" data-scope="one">${esc(this._t("this_event"))}</button>
        <button class="btn danger-line" data-action="delete-do" data-scope="future">${esc(this._t("this_following"))}</button>
        <button class="btn danger-line" data-action="delete-do" data-scope="all">${esc(this._t("all_events"))}</button>
        <span class="sp"></span>
        <button class="btn" data-action="delete-cancel">${esc(this._t("cancel"))}</button>
      </div>` : `
      <div class="del-q"><ha-icon icon="mdi:delete-alert-outline"></ha-icon>${esc(this._t("del_q", { t: ev.summary }))}</div>
      <div class="del-opts">
        <span class="sp"></span>
        <button class="btn" data-action="delete-cancel">${esc(this._t("cancel"))}</button>
        <button class="btn danger-fill" data-action="delete-do" data-scope="one">${esc(this._t("delete"))}</button>
      </div>`;
  }

  _forecastText(f) {
    const unit = this._hass?.states[this._config.weather_entity]?.attributes?.temperature_unit || "°";
    const parts = [`${round(f.temperature)}${unit}`];
    if (f.templow != null) parts[0] += ` / ${round(f.templow)}${unit}`;
    if (Number(f.precipitation_probability) > 0) parts.push(this._t("rain", { p: Math.round(f.precipitation_probability) }));
    const cond = f.condition ? this._wx(f.condition) : "";
    const Cond = cond ? cond.charAt(0).toLocaleUpperCase(this._lang()) + cond.slice(1) : ""; // sentence case in every language
    return `${esc(Cond)}${cond ? " · " : ""}${esc(parts.join(" · "))}`;
  }

  _openDay(date) {
    const evs = this._eventsOn(date);
    const canAdd = this._config.allow_add !== false && this._writable().length > 0;
    this._openDialog(`
      <div class="dlg-head">
        <div class="dlg-title">${esc(this._relDay(date))}${sameDay(date, new Date()) || Math.abs(startOfDay(date) - startOfDay(new Date())) <= 864e5 ? `<div class="sub">${esc(this._fmt({ weekday: "long", day: "numeric", month: "long" }).format(date))}</div>` : ""}</div>
        ${this._wxBadge(date)}
        <button class="icon" data-action="close" title="${esc(this._t("close"))}"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
      <div class="dlg-body day-list">
        ${this._holidayTags(date) ? `<div class="hols">${this._holidayTags(date)}</div>` : ""}
        ${evs.length ? evs.map((ev) => this._eventRow(ev, date)).join("") : `<div class="empty-day">${esc(this._t("nothing"))}</div>`}
      </div>
      <div class="dlg-foot">
        <span class="sp"></span>
        ${canAdd ? `<button class="btn primary" data-action="add" data-date="${dayKey(date)}"><ha-icon icon="mdi:plus"></ha-icon><span>${esc(this._t("add_event"))}</span></button>` : `<button class="btn" data-action="close">${esc(this._t("close"))}</button>`}
      </div>`);
  }

  _formTypes(current) {
    const ui = this._ui();
    return this._types.filter((t) => !t.langs || this._configTypes || t.langs.includes(ui) || t.id === current?.id);
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
    const repeats = rr && !REPEATS.some(([v]) => v === rr) ? [...REPEATS, [rr, "rep_custom"]] : REPEATS;
    this._openDialog(`
      <div class="dlg-head">
        <div class="dlg-title">${esc(this._t(ev ? "edit_event" : "new_event"))}</div>
        <button class="icon" data-action="close" title="${esc(this._t("close"))}"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
      <div class="dlg-body form" style="--c:${esc(selColor)}">
        <input id="f-title" class="inp" placeholder="${esc(this._t("add_title"))}" autocomplete="off" value="${ev ? esc(ev.title || ev.summary) : ""}">
        <div class="sel-row">
          <label class="selbox"><span class="lbl">${esc(this._t("type"))}</span>
            <span class="sel-wrap"><ha-icon id="f-type-icon" icon="${esc(defType.icon || "mdi:calendar-blank-outline")}"></ha-icon>
            <select id="f-type" class="inp">${this._formTypes(defType).map((t) => `<option value="${esc(t.id)}" ${t.id === defType.id ? "selected" : ""}>${esc(this._typeName(t))}</option>`).join("")}</select></span>
          </label>
          <label class="selbox"><span class="lbl">${esc(this._t("repeat"))}</span>
            <span class="sel-wrap"><ha-icon icon="mdi:repeat"></ha-icon>
            <select id="f-rep" class="inp">${repeats.map(([v, l]) => `<option value="${esc(v)}">${esc(this._t(l))}</option>`).join("")}</select></span>
          </label>
        </div>
        <div>
          <div class="lbl">${esc(this._t("calendar"))}</div>
          <div class="cal-pick">${cals.map((c) => `
            <button type="button" class="chip ${c.entity === this._addCal ? "sel" : ""}" style="--c:${esc(c.color)}" data-action="pick-cal" data-entity="${esc(c.entity)}">
              ${this._avatar(c, "sm") || `<span class="dot"></span>`}${esc(this._calName(c))}
            </button>`).join("")}</div>
        </div>
        <label class="switch"><input type="checkbox" id="f-allday"><span class="track"></span>${esc(this._t("all_day"))}</label>
        <div class="dt"><span class="lbl">${esc(this._t("starts"))}</span><input class="inp" type="date" id="f-sd" value="${dayKey(s)}"><input class="inp" type="time" id="f-st" value="${timeKey(s)}"></div>
        <div class="dt"><span class="lbl">${esc(this._t("ends"))}</span><input class="inp" type="date" id="f-ed" value="${dayKey(e)}"><input class="inp" type="time" id="f-et" value="${timeKey(e)}"></div>
        <div id="f-wx" class="f-wx"></div>
        <input id="f-loc" class="inp" placeholder="${esc(this._t("location"))}" autocomplete="off" value="${ev ? esc(ev.location) : ""}">
        <textarea id="f-desc" class="inp" rows="3" placeholder="${esc(this._t("description"))}">${ev ? esc(ev.description) : ""}</textarea>
        ${ev && this._isRecurring(ev) ? `<div class="form-note"><ha-icon icon="mdi:repeat"></ha-icon>${esc(this._t("rec_note"))}</div>` : ""}
        <div class="f-err"></div>
      </div>
      <div class="dlg-foot">
        <span class="sp"></span>
        <button class="btn" data-action="${ev ? "edit-cancel" : "close"}">${esc(this._t("cancel"))}</button>
        <button class="btn primary" data-action="save">${esc(this._t("save"))}</button>
      </div>`);
    this._formFoot = this._q(".dlg-foot").innerHTML;
    // "Starts"/"Ends" labels differ in length per language – size both rows to the longer one
    const lw = Math.max(58, ...[...this._dlg.querySelectorAll(".dt .lbl")].map((l) => Math.ceil(l.scrollWidth)));
    this._q(".form").style.setProperty("--lblw", `${lw}px`);
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
      ? `<ha-icon icon="${wxIcon(f.condition)}" style="color:${wxColor(f.condition)}"></ha-icon><span>${this._t("forecast", { f: this._forecastText(f) })}</span>`
      : "";
  }

  _setFormError(msg) {
    const el = this._q(".f-err");
    if (el) el.textContent = msg;
  }

  async _saveEvent(scope) {
    const editing = this._editEv;
    const title = this._q("#f-title")?.value.trim();
    if (!title) { this._setFormError(this._t("err_title")); this._q("#f-title").focus(); return; }
    const allDay = this._q("#f-allday").checked;
    const sd = this._q("#f-sd").value;
    const ed = this._q("#f-ed").value || sd;
    const data = { summary: title };
    if (!sd) { this._setFormError(this._t("err_start")); return; }
    if (allDay) {
      if (ed < sd) { this._setFormError(this._t("err_end_date")); return; }
      data.start_date = sd;
      data.end_date = dayKey(addDays(parseDate(ed), 1)); // HA end_date is exclusive
    } else {
      const st = this._q("#f-st").value;
      const et = this._q("#f-et").value;
      if (!st || !et) { this._setFormError(this._t("err_times")); return; }
      if (new Date(`${ed}T${et}`) <= new Date(`${sd}T${st}`)) { this._setFormError(this._t("err_order")); return; }
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
    btn.textContent = this._t("saving");
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
      this._toast(this._t("added", { t: title }));
      // Some integrations (e.g. CalDAV) take a moment before the new event is listed.
      this._fetchEvents();
      this._fetchCountdowns();
      setTimeout(() => { this._fetchEvents(); this._fetchCountdowns(); }, 4000);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = this._t("save");
      this._setFormError(err?.message || this._t("err_create"));
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
      <div class="del-q"><ha-icon icon="mdi:repeat"></ha-icon>${esc(this._t("save_rec_q"))}</div>
      <div class="del-opts">
        <button class="btn primary" data-action="save-scope" data-scope="one">${esc(this._t("this_event"))}</button>
        <button class="btn line" data-action="save-scope" data-scope="future">${esc(this._t("this_following"))}</button>
        <span class="sp"></span>
        <button class="btn" data-action="save-back">${esc(this._t("back"))}</button>
      </div>`;
  }

  async _updateEvent(ev, scope, f) {
    const rec = this._isRecurring(ev);
    if (rec && !scope) { this._askEditScope(); return; }
    const moving = this._addCal !== ev.cal.entity;
    const busy = (on) => this._dlg.querySelectorAll('[data-action^="save"]').forEach((b) => { b.disabled = on; });
    busy(true);
    const sb = this._q('[data-action="save"]');
    if (sb) sb.textContent = this._t("saving");
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
      this._toast(moving ? this._t("moved", { t: f.title, c: this._calName(cal) }) : this._t("saved", { t: f.title }));
      this._fetchEvents();
      this._fetchCountdowns();
      setTimeout(() => { this._fetchEvents(); this._fetchCountdowns(); }, 4000);
    } catch (err) {
      if (this._q(".edit-confirm")) this._restoreFormFoot();
      busy(false);
      const b = this._q('[data-action="save"]');
      if (b) b.textContent = this._t("save");
      this._setFormError(err?.message || this._t("err_save"));
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
      this._toast(scope === "all" ? this._t("deleted_all", { t: ev.summary })
        : scope === "future" ? this._t("deleted_from", { t: ev.summary, d: this._fmt({ day: "numeric", month: "short" }).format(ev.start) })
          : this._t("deleted", { t: ev.summary }));
      this._fetchEvents();
      this._fetchCountdowns();
    } catch (err) {
      this._dlg.querySelectorAll('[data-action^="delete"]').forEach((b) => { b.disabled = false; });
      this._setFormError(err?.message || this._t("err_delete"));
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
      case "toggle-group": {
        const g = el.dataset.group;
        const members = this._calendars.filter((x) => String(x.group || "").trim() === g);
        const anyVisible = members.some((m) => !this._hidden.has(m.entity));
        members.forEach((m) => { if (anyVisible) this._hidden.add(m.entity); else this._hidden.delete(m.entity); });
        this._saveHidden();
        this._render();
        break;
      }
      case "expand-group": {
        this._openGroups = this._openGroups || new Set();
        const g = el.dataset.group;
        if (this._openGroups.has(g)) this._openGroups.delete(g); else this._openGroups.add(g);
        this._render();
        break;
      }
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
      case "todo-undone":
        this._todoUndone(el.dataset.uid);
        break;
      case "todo-done-toggle":
        this._doneOpen = !this._doneOpen;
        this._renderTodoList();
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
.cgroup { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px; border-radius: 999px; }
.cgroup.open { background: var(--hcc-soft); border-radius: 18px; padding: 3px; box-shadow: inset 0 0 0 1px var(--hcc-line); }
.chip.grp { border-radius: 16px 5px 5px 16px; padding-right: 9px; font-weight: 600; margin-right: -4px; }
.chip.gexp { border-radius: 5px 16px 16px 5px; padding: 4px 7px 4px 5px; align-self: stretch; }
.chip.grp.off + .chip.gexp { opacity: .5; background: none; border-color: var(--hcc-line); }
.chip.gexp ha-icon { --mdc-icon-size: 16px; transition: transform .2s; }
.cgroup.open .chip.gexp ha-icon { transform: rotate(180deg); }
.gstack { display: inline-flex; align-items: center; }
.gstack > * { margin-left: -5px; box-shadow: 0 0 0 2px var(--hcc-bg); }
.gstack > *:first-child { margin-left: 0; }
.gstack .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--c); }
.gcount { font-size: .7rem; font-weight: 700; color: var(--hcc-muted); margin-left: 2px; }
.chip.grp.part { border-style: dashed; }
.chip.grp.off .gstack > * { filter: grayscale(1); opacity: .6; }
.gmembers { display: inline-flex; flex-wrap: wrap; gap: 6px; }

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
.form { --lblw: 58px; }
.dt { display: grid; grid-template-columns: var(--lblw) minmax(0, 1fr) 136px; gap: 8px 10px; align-items: center; }
.form.allday .dt { grid-template-columns: var(--lblw) minmax(0, 1fr); }
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

/* ---------- night mode & screensaver ---------- */
.amb { position: absolute; inset: 0; z-index: 6; display: none; overflow: hidden; border-radius: inherit; user-select: none; -webkit-user-select: none; }
.amb.on { display: block; animation: ambIn .8s ease; }
@keyframes ambIn { from { opacity: 0; } }
.amb-hint { position: absolute; left: 50%; top: 18px; transform: translateX(-50%); font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; opacity: .35; zoom: var(--hcc-zoom, 1); white-space: nowrap; }
.night.style-dim { background: rgba(0, 0, 0, calc(1 - var(--nb, .3))); color: #fff; }
.night.style-dim .amb-hint { opacity: .5; }
.night.style-clock { background: #000; color: #fff; }
.night.style-clock .amb-box, .night.style-clock .amb-hint { opacity: max(.28, var(--nb, .3)); }
.amb-box { position: absolute; left: 50%; top: 50%; transform: translate(calc(-50% + var(--sx, 0px)), calc(-50% + var(--sy, 0px)));
  text-align: center; transition: transform 3s ease; zoom: var(--hcc-zoom, 1); width: max-content; max-width: 90%; }
.amb-time { font-size: clamp(64px, 15cqw, 220px); font-weight: 200; line-height: 1; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.amb-date { font-size: clamp(16px, 2.2cqw, 30px); font-weight: 400; opacity: .8; margin-top: 10px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.amb-box .amb-date { justify-content: center; }
.amb-next { display: flex; flex-direction: column; gap: 8px; margin-top: 26px; font-size: clamp(14px, 1.7cqw, 22px); }
.amb-box .amb-next { align-items: center; }
.amb-ev { display: flex; align-items: center; gap: 10px; min-width: 0; }
.amb-ev.muted { opacity: .65; }
.amb-ev-day { opacity: .6; text-transform: uppercase; font-size: .72em; letter-spacing: .08em; font-weight: 600; }
.amb-ev-when { font-weight: 600; font-variant-numeric: tabular-nums; }
.amb-ev ha-icon { --mdc-icon-size: 1.1em; color: var(--c); }
.amb-dot { width: .55em; height: .55em; border-radius: 50%; background: var(--c); flex: none; }
.amb-ev-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 32ch; }
.amb-tw { opacity: .7; font-size: .85em; display: flex; align-items: center; gap: 8px; justify-content: center; }
.amb-wx { display: inline-flex; align-items: center; gap: 6px; font-weight: 500; }
.amb-wx ha-icon { --mdc-icon-size: 1.3em; }
.amb-wx i { font-style: normal; opacity: .7; font-weight: 400; }
.amb-cd { display: flex; align-items: center; gap: 8px; margin-top: 6px; opacity: .9; }
.amb-cd ha-icon { --mdc-icon-size: 1.1em; }
.amb-cd b { font-weight: 700; }
/* screensaver */
.saver { background: #000; color: #fff; cursor: default; }
.saver.nophotos { background: radial-gradient(120% 120% at 20% 10%, color-mix(in srgb, var(--hcc-accent) 55%, #000) 0%, #05070d 60%) , #05070d;
  background-size: 200% 200%; animation: ambIn .8s ease, drift 40s ease-in-out infinite alternate; }
@keyframes drift { from { background-position: 0% 0%; } to { background-position: 100% 100%; } }
.ph { position: absolute; inset: 0; opacity: 0; transition: opacity 1.8s ease; }
.ph.show { opacity: 1; }
.ph-bg { position: absolute; inset: -60px; background-size: cover; background-position: center; filter: blur(40px) brightness(.5) saturate(1.2); }
.ph-img { position: absolute; inset: 0; background-size: contain; background-repeat: no-repeat; background-position: center; transform-origin: 50% 40%; }
.ph.show .ph-img { animation: kenburns 30s ease-out forwards; }
@keyframes kenburns { from { transform: scale(1); } to { transform: scale(1.07); } }
@media (prefers-reduced-motion: reduce) { .ph.show .ph-img, .saver.nophotos { animation: none; } }
.saver-shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.65) 0%, rgba(0,0,0,.15) 35%, transparent 55%); pointer-events: none; }
.saver.nophotos .saver-shade { display: none; }
.saver-info { position: absolute; left: 4%; right: 4%; bottom: 5%; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap;
  text-shadow: 0 2px 14px rgba(0,0,0,.55); transform: translate(var(--sx, 0px), var(--sy, 0px)); transition: transform 3s ease; zoom: var(--hcc-zoom, 1); }
.saver-info[hidden] { display: none; }
.saver .amb-time { font-size: clamp(56px, 10cqw, 170px); font-weight: 300; }
.saver .amb-next { margin: 0; align-items: flex-end; text-align: right; padding: 14px 18px; border-radius: 18px; background: rgba(0,0,0,.28);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); max-width: 48%; }
.saver.nophotos .amb-next { background: rgba(255,255,255,.06); }
@container hcc (max-width: 700px) {
  .saver-info { flex-direction: column; align-items: flex-start; }
  .saver .amb-next { align-items: flex-start; text-align: left; max-width: 100%; }
}

/* to-do: upcoming repeats, who, done section */
.ti-who { display: inline-flex; align-items: center; gap: 4px; font-size: .7rem; font-weight: 600; color: var(--hcc-muted); white-space: nowrap; flex: none; max-width: 40%; overflow: hidden; }
.ti-who .av.sm { width: 16px; height: 16px; border-width: 1px; }
.ti.upcoming { opacity: .62; }
.tick.ghost { border-style: dashed; border-color: var(--hcc-muted); color: var(--hcc-muted); cursor: default; }
.tick.ghost ha-icon { --mdc-icon-size: 14px; }
.tg.overdue .tg-name { color: var(--error-color, #db4437); }
.tg.today .tg-name { color: var(--hcc-accent); }
.done-group { grid-column: 1 / -1; background: var(--hcc-soft); border-color: var(--hcc-line); }
.done-head { width: 100%; text-align: left; }
.done-chev { --mdc-icon-size: 18px; color: var(--hcc-muted); transition: transform .2s; }
.done-group.open .done-chev { transform: rotate(180deg); }
.ti.is-done .ti-text { text-decoration: line-through; color: var(--hcc-muted); }
.tick.on { background: var(--hcc-muted); border-color: var(--hcc-muted); color: #fff; }
.tick.on:hover { background: var(--hcc-accent); border-color: var(--hcc-accent); color: #fff; }
.done-meta { font-size: .7rem; color: var(--hcc-muted); white-space: nowrap; flex: none; }
`;


/* ===================================================================== editor */

// Editor forms are built per language. `t(key)` translates, `o(value, key)` makes a dropdown option.
const NIGHT_DEFAULTS = { enabled: false, style: "clock", start: "22:00", end: "06:30", brightness: 30, wake_seconds: 60 };
const SAVER_DEFAULTS = { enabled: false, after: 5, interval: 20, shuffle: true, show_info: true };
const GENERAL_KEYS = ["title", "language", "weather_entity", "todo_entity", "todo_title", "todo_position", "todo_autohide",
  "todo_group_by", "todo_days_ahead", "todo_calendar", "todo_show_completed", "todo_completed_days",
  "default_view", "days_to_show", "first_day_of_week", "time_format", "layout", "keep_awake", "show_header", "allow_add",
  "allow_edit", "allow_delete", "show_empty_days", "max_height"];
const generalSchema = (t) => {
  const o = (value, key) => ({ value, label: t(key) });
  return [
    { type: "grid", name: "", schema: [
      { name: "title", selector: { text: {} } },
      { name: "language", selector: { select: { mode: "dropdown", options: [o("auto", "o_lang_auto"),
        ...Object.entries(LANGS).map(([value, label]) => ({ value, label }))] } } },
    ] },
    { name: "weather_entity", selector: { entity: { domain: "weather" } } },
    { type: "grid", name: "", schema: [
      { name: "todo_entity", selector: { entity: { domain: "todo" } } },
      { name: "todo_title", selector: { text: {} } },
      { name: "todo_position", selector: { select: { mode: "dropdown", options: [
        o("auto", "o_auto"), o("top", "o_top"), o("bottom", "o_bottom"), o("left", "o_left"), o("right", "o_right")] } } },
        { name: "todo_autohide", selector: { number: { min: 0, max: 600, step: 5, mode: "box", unit_of_measurement: "s" } } },
      { name: "todo_group_by", selector: { select: { mode: "dropdown", options: [o("person", "o_group_person"), o("due", "o_group_due")] } } },
      { name: "todo_days_ahead", selector: { number: { min: 0, max: 60, step: 1, mode: "box" } } },
      { name: "todo_calendar", selector: { entity: { domain: "calendar" } } },
      { name: "todo_show_completed", selector: { boolean: {} } },
      { name: "todo_completed_days", selector: { number: { min: 1, max: 60, step: 1, mode: "box" } } },
    ] },
    { type: "grid", name: "", schema: [
      { name: "default_view", selector: { select: { mode: "dropdown", options: [o("agenda", "agenda"), o("week", "week"), o("month", "month")] } } },
      { name: "days_to_show", selector: { number: { min: 1, max: 31, mode: "box" } } },
      { name: "first_day_of_week", selector: { select: { mode: "dropdown", options: [o("monday", "o_monday"), o("sunday", "o_sunday"), o("saturday", "o_saturday")] } } },
      { name: "time_format", selector: { select: { mode: "dropdown", options: [o("auto", "o_tf_auto"), o("24h", "o_24h"), o("12h", "o_12h")] } } },
    ] },
    { type: "grid", name: "", schema: [
      { name: "layout", selector: { select: { mode: "dropdown", options: [o("card", "o_card"), o("fill", "o_fill"), o("fullscreen", "o_fullscreen")] } } },
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
    { type: "expandable", name: "night_mode", title: t("ed_night"), icon: "mdi:weather-night", schema: [
      { type: "grid", name: "", schema: [
        { name: "enabled", selector: { boolean: {} } },
        { name: "style", selector: { select: { mode: "dropdown", options: [o("clock", "o_clock"), o("dim", "o_dim")] } } },
        { name: "start", selector: { time: {} } },
        { name: "end", selector: { time: {} } },
      ] },
      { name: "brightness", selector: { number: { min: 5, max: 100, step: 5, mode: "slider", unit_of_measurement: "%" } } },
      { type: "grid", name: "", schema: [
        { name: "wake_entity", selector: { entity: { domain: "binary_sensor" } } },
        { name: "wake_seconds", selector: { number: { min: 10, max: 1800, step: 10, mode: "box", unit_of_measurement: "s" } } },
      ] },
      { name: "when_entity", selector: { entity: { domain: ["input_boolean", "binary_sensor", "switch", "schedule"] } } },
    ] },
    { type: "expandable", name: "screensaver", title: t("ed_saver"), icon: "mdi:image-multiple", schema: [
      { type: "grid", name: "", schema: [
        { name: "enabled", selector: { boolean: {} } },
        { name: "after", selector: { number: { min: 1, max: 120, step: 1, mode: "box", unit_of_measurement: "min" } } },
        { name: "interval", selector: { number: { min: 5, max: 600, step: 5, mode: "box", unit_of_measurement: "s" } } },
        { name: "shuffle", selector: { boolean: {} } },
      ] },
      { name: "media", selector: { text: {} } },
      { name: "show_info", selector: { boolean: {} } },
    ] },
  ];
};
const calSchema = (t) => {
  const o = (value, key) => ({ value, label: t(key) });
  return [
    { type: "grid", name: "", schema: [
      { name: "entity", required: true, selector: { entity: { domain: "calendar" } } },
      { name: "name", selector: { text: {} } },
    ] },
    { type: "grid", name: "", schema: [
      { name: "person", selector: { entity: { domain: "person" } } },
      { name: "group", selector: { text: {} } },
      { name: "type", selector: { select: { mode: "dropdown", options: [o("events", "o_events"), o("birthday", "o_birthdays"),
        o("anniversary", "o_anniversaries"), o("nameday", "o_namedays"), o("holiday", "o_holidays")] } } },
    ] },
  ];
};

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
.cal { border: 1px solid var(--divider-color); border-radius: 12px; margin-bottom: 8px; overflow: hidden; transition: box-shadow .15s; }
.cal.open { box-shadow: 0 2px 10px rgba(0,0,0,.08); }
.cal-head { display: flex; align-items: center; gap: 10px; padding: 6px 6px 6px 10px; cursor: pointer; user-select: none; }
.cal-head:hover { background: rgba(127,127,127,.06); }
.cal.open .cal-head { border-bottom: 1px solid var(--divider-color); }
.sw { width: 28px; height: 28px; border-radius: 50%; position: relative; overflow: hidden; cursor: pointer; flex: none;
  box-shadow: inset 0 0 0 2px rgba(0,0,0,.12); display: block; }
.sw input { position: absolute; inset: -4px; width: calc(100% + 8px); height: calc(100% + 8px); opacity: 0; cursor: pointer; border: 0; padding: 0; }
.ch-av { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; flex: none; }
.ch-txt { flex: 1; min-width: 0; }
.ch-name { font-weight: 600; font-size: .95rem; display: flex; align-items: center; gap: 6px; min-width: 0; }
.ch-n { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ch-name.missing { color: var(--secondary-text-color); font-style: italic; font-weight: 500; }
.ch-sub { font-size: .78rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ch-warn { color: var(--error-color, #db4437); }
.ch-grp { font-weight: 600; color: var(--primary-color); }
.btns { display: flex; flex: none; }
.chev { color: var(--secondary-text-color); transition: transform .2s; --mdc-icon-size: 22px; flex: none; padding: 0 2px; }
.cal.open .chev, .sec-head.open .chev { transform: rotate(180deg); }
.cal-body { padding: 10px 10px 4px 12px; }
.sec-head { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; border-radius: 10px; padding: 4px 6px; margin: 0 -6px 4px; }
.sec-head:hover { background: rgba(127,127,127,.06); }
.sec-head .h { margin: 0; flex: 1; }
.sec-head .cur { font-size: .85rem; color: var(--secondary-text-color); display: flex; align-items: center; gap: 6px; }
.sec-head .cur .dots { display: flex; gap: 2px; }
.sec-head .cur .dots span { width: 9px; height: 9px; border-radius: 50%; }
.h .count { font-weight: 500; color: var(--secondary-text-color); font-size: .85rem; margin-left: 4px; }
.cal-tools { display: flex; justify-content: flex-end; gap: 4px; margin: -2px 0 6px; }
.linkbtn { background: none; border: none; color: var(--primary-color); font: inherit; font-size: .8rem; cursor: pointer; padding: 2px 6px; border-radius: 6px; }
.linkbtn:hover { background: rgba(127,127,127,.1); }
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
    this._openCals = new Set();   // calendars expanded in the editor
    this._themeOpen = false;
    // one delegated click handler: the innermost [data-act] wins (so row buttons don't also toggle the row)
    this.shadowRoot.addEventListener("click", (e) => {
      const el = e.composedPath().find((n) => n instanceof HTMLElement && n.dataset && n.dataset.act);
      if (el && this.shadowRoot.contains(el)) this._action(el);
    });
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    this._forms.forEach((f) => { f.hass = hass; });
    if (first && this._config) this._refreshHeads(); // names/photos need hass
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

  _objCfg(v) { return v === true ? { enabled: true } : v && typeof v === "object" ? v : {}; }

  _t(key, vars) {
    const l = this._config?.language;
    return tr(uiLang(l && l !== "auto" ? l : this._hass?.locale?.language || this._hass?.language || navigator.language), key, vars);
  }

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
    [...this._openCals].forEach((k) => { if (k >= cals.length) this._openCals.delete(k); }); // config edited elsewhere
    this._forms = [];
    this.shadowRoot.innerHTML = `<style>${EDITOR_STYLES}</style>
      <div class="sec">
        <div class="sec-head ${this._themeOpen ? "open" : ""}" data-act="toggle-theme">
          <div class="h">${esc(this._t("ed_theme"))}</div>
          <span class="cur"><span class="dots">${themePalette(this._config.theme).slice(0, 4).map((c) => `<span style="background:${c}"></span>`).join("")}</span>${esc((THEMES[this._config.theme] || THEMES.auto).name)}</span>
          <ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
        </div>
        ${this._themeOpen ? `<div class="sub">${esc(this._t("ed_theme_sub"))}</div>
        <div class="themes">${Object.keys(THEMES).map((k) => this._themeTile(k)).join("")}</div>` : ""}
      </div>
      <div class="sec">
        <div class="h">${esc(this._t("ed_cals"))}<span class="count">${cals.length ? `(${cals.length})` : ""}</span></div>
        <div class="sub">${esc(this._t("ed_cals_sub"))}</div>
        ${cals.length > 1 ? `<div class="cal-tools">
          <button class="linkbtn" data-act="expand-all">${esc(this._t("ed_expand_all"))}</button>
          <button class="linkbtn" data-act="collapse-all">${esc(this._t("ed_collapse_all"))}</button>
        </div>` : ""}
        <div class="cals">${cals.map((c, i) => {
          const col = /^#[0-9a-f]{6}$/i.test(c.color || "") ? c.color : pal[i % pal.length];
          const open = this._openCals.has(i);
          return `<div class="cal ${open ? "open" : ""}" data-i="${i}">
            <div class="cal-head" data-act="toggle" data-i="${i}" title="${esc(this._t(open ? "ed_collapse" : "ed_expand"))}">
              <label class="sw" data-act="swatch" title="${esc(this._t("ed_colour"))}" style="background:${esc(c.color || col)}"><input type="color" data-i="${i}" value="${col}"></label>
              <div class="ch-txt">${this._headHtml(c)}</div>
              <div class="btns">
                <button class="ib" data-act="up" data-i="${i}" title="${esc(this._t("ed_up"))}" ${i === 0 ? "disabled" : ""}><ha-icon icon="mdi:arrow-up"></ha-icon></button>
                <button class="ib" data-act="down" data-i="${i}" title="${esc(this._t("ed_down"))}" ${i === cals.length - 1 ? "disabled" : ""}><ha-icon icon="mdi:arrow-down"></ha-icon></button>
                <button class="ib" data-act="del" data-i="${i}" title="${esc(this._t("ed_remove"))}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>
              </div>
              <ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
            </div>
            ${open ? `<div class="cal-body"><div class="slot" data-i="${i}"></div></div>` : ""}
          </div>`;
        }).join("")}</div>
        <button class="addcal" data-act="add"><ha-icon icon="mdi:plus"></ha-icon>${esc(this._t("ed_add_cal"))}</button>
      </div>
      <div class="sec">
        <div class="h">${esc(this._t("ed_display"))}</div>
        <div class="slot-general"></div>
        <div class="note">${esc(this._t("ed_note"))}</div>
      </div>`;

    this.shadowRoot.querySelectorAll(".slot").forEach((slot) => {
      const i = Number(slot.dataset.i);
      const c = cals[i];
      const f = this._makeForm(calSchema((k) => this._t(k)), { entity: c.entity || "", name: c.name || "", person: c.person || "", group: c.group || "", type: c.type || "events" },
        (s) => this._t(`l_${s.name === "type" ? "type" : s.name}`),
        (s) => {
          if (s.name === "group") return this._t("ed_group_help");
          if (s.name !== "name") return undefined;
          const ent = this._cals()[i]?.entity;
          const fn = ent && this._hass?.states[ent]?.attributes?.friendly_name;
          return fn ? this._t("ed_leave_empty", { n: fn }) : undefined;
        });
      f.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        f.data = ev.detail.value; // keep the form in sync, since we don't rebuild it
        const list = this._cals();
        list[i] = { ...list[i], ...ev.detail.value };
        this._emit({ ...this._config, calendars: list });
        const head = this.shadowRoot.querySelector(`.cal[data-i="${i}"] .ch-txt`);
        if (head) head.innerHTML = this._headHtml(list[i]);
      });
      slot.appendChild(f);
    });

    const gen = this._makeForm(generalSchema((k) => this._t(k)), {
      language: "auto", ...this._config,
      night_mode: { ...NIGHT_DEFAULTS, ...this._objCfg(this._config.night_mode) },
      screensaver: { ...SAVER_DEFAULTS, ...this._objCfg(this._config.screensaver) },
    }, (s) => this._t(`l_${s.name}`), (s) => (s.name === "media" ? this._t("ed_media_help") : undefined));
    gen.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      gen.data = ev.detail.value;
      const next = { ...this._config, ...ev.detail.value };
      GENERAL_KEYS.forEach((k) => { if (next[k] === "" || next[k] == null) delete next[k]; });
      ["night_mode", "screensaver"].forEach((k) => {
        const v = next[k];
        if (!v || typeof v !== "object") return;
        const clean = Object.fromEntries(Object.entries(v).filter(([, x]) => x !== "" && x != null));
        const untouched = JSON.stringify(clean) === JSON.stringify(k === "night_mode" ? NIGHT_DEFAULTS : SAVER_DEFAULTS);
        if (untouched && !this._config[k]) delete next[k]; else next[k] = clean;
      });
      if (next.language === "auto") delete next.language;
      if (next.language !== this._config.language) { this._emit(next, true); return; } // re-draw in the new language
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
  }

  // Collapsed calendar row: name (with photo), entity and type at a glance
  _headHtml(c) {
    const st = c.entity && this._hass?.states[c.entity];
    const ps = c.person && this._hass?.states[c.person];
    const name = c.name || ps?.attributes?.friendly_name || st?.attributes?.friendly_name || (c.entity ? c.entity.replace(/^calendar\./, "") : "");
    const typeKey = { events: "o_events", birthday: "o_birthdays", anniversary: "o_anniversaries", nameday: "o_namedays", holiday: "o_holidays" }[c.type || "events"] || "o_events";
    const typeTxt = this._t(typeKey).replace(/\s*\(.*\)\s*$/, "");
    const pic = ps?.attributes?.entity_picture;
    const missing = c.entity && this._hass && !st;
    return `<div class="ch-name ${name ? "" : "missing"}">${pic ? `<img class="ch-av" src="${esc(pic)}" alt="">` : ""}<span class="ch-n">${esc(name || this._t("ed_new_cal"))}</span></div>
      <div class="ch-sub">${c.entity ? `<span class="${missing ? "ch-warn" : ""}">${esc(c.entity)}</span> · ` : ""}${esc(typeTxt)}${c.group ? ` · <span class="ch-grp">${esc(c.group)}</span>` : ""}</div>`;
  }

  _refreshHeads() {
    const cals = this._cals();
    this.shadowRoot.querySelectorAll(".cal[data-i]").forEach((row) => {
      const c = cals[Number(row.dataset.i)];
      const h = row.querySelector(".ch-txt");
      if (c && h) h.innerHTML = this._headHtml(c);
    });
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
    const open = this._openCals;
    const swap = (a, c) => {
      const ha = open.has(a); const hc = open.has(c);
      open.delete(a); open.delete(c);
      if (ha) open.add(c);
      if (hc) open.add(a);
    };
    switch (b.dataset.act) {
      case "swatch": return; // colour picker – don't toggle the row
      case "toggle":
        if (open.has(i)) open.delete(i); else open.add(i);
        this._render();
        return;
      case "expand-all": list.forEach((_, k) => open.add(k)); this._render(); return;
      case "collapse-all": open.clear(); this._render(); return;
      case "toggle-theme": this._themeOpen = !this._themeOpen; this._render(); return;
      case "theme": {
        const next = { ...this._config };
        if (b.dataset.theme === "auto") delete next.theme; else next.theme = b.dataset.theme;
        this._emit(next, true);
        return;
      }
      case "add": list.push({ entity: "" }); open.add(list.length - 1); break; // new calendar opens straight away
      case "del": {
        list.splice(i, 1);
        const kept = [...open].filter((k) => k !== i).map((k) => (k > i ? k - 1 : k));
        open.clear(); kept.forEach((k) => open.add(k));
        break;
      }
      case "up": if (i > 0) { [list[i - 1], list[i]] = [list[i], list[i - 1]]; swap(i - 1, i); } break;
      case "down": if (i < list.length - 1) { [list[i + 1], list[i]] = [list[i], list[i + 1]]; swap(i, i + 1); } break;
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
