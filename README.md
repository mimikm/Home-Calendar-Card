# Home Calendar Card

[![Validate](https://github.com/mimikm/Home-Calendar-Card/actions/workflows/validate.yml/badge.svg)](https://github.com/mimikm/Home-Calendar-Card/actions/workflows/validate.yml) [![HACS Default](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://hacs.xyz) [![GitHub release](https://img.shields.io/github/v/release/mimikm/Home-Calendar-Card)](https://github.com/mimikm/Home-Calendar-Card/releases) [![Downloads](https://img.shields.io/github/downloads/mimikm/Home-Calendar-Card/total?label=downloads&color=2ea44f)](https://github.com/mimikm/Home-Calendar-Card/releases) [![Latest release downloads](https://img.shields.io/github/downloads/mimikm/Home-Calendar-Card/latest/total?label=latest%20release)](https://github.com/mimikm/Home-Calendar-Card/releases/latest) [![Stars](https://img.shields.io/github/stars/mimikm/Home-Calendar-Card?style=flat&color=f5c518)](https://github.com/mimikm/Home-Calendar-Card/stargazers)

A clean, modern calendar card for Home Assistant. Shows your **Google**, **Apple iCloud** (via CalDAV) or any other Home Assistant calendar in **Agenda**, **Week**, **Month** and **Planner** views, with the **daily weather forecast** on every day — and lets you **add events** straight from the dashboard, choosing which calendar they go into.

![Home Calendar Card](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/preview.png)

## Screenshots

| Wall display – Month (Midnight) | Wall display – Week (Sunset) |
|---|---|
| ![Month view on a wall display](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/wall-month.png) | ![Week view on a wall display](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/wall-week.png) |
| **Wall display – Agenda (Forest)** | **Adding an event** |
| ![Agenda view on a wall display](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/wall-agenda.png) | ![Add event dialog](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/add-event.png) |

**Planner view – a column for each person (Midnight)**

![Planner view with a column per person](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/planner.png)

**Five colour themes**

![Nordic, Sunset, Forest, Midnight and Graphite themes](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/themes.png)

**On a phone (Graphite)**

<img src="https://github.com/mimikm/Home-Calendar-Card/raw/main/images/mobile.png" alt="Phone view" width="320">

<sub>Screenshots use a fictional family – all names, places and events are made up.</sub>

## Features

- 📅 **Four views** – Agenda (grouped by day), Week (7 columns, stacks on phones), Month (grid, dots on phones) and Planner (a column per person, like a printed family planner)
- 🌦️ **Weather built in** – current conditions in the header, daily icon, high/low and rain chance on each day, forecast shown when you add an event
- ➕ **Add events** – title, **event type** dropdown, **repeat** dropdown, calendar picker (colour-coded chips), all-day toggle, start/end, location, description
- 🏷️ **Event types** – Standard, Holiday, Birthday, Anniversary, Work event and DHS out of the box (fully customisable), each with its own icon and behaviour
- ✏️ **Edit events** – tap an event → **Edit** to change the title, time, type, repeat, location or notes, or move it to another person's calendar
- 🗑️ **Delete events** – tap an event → **Delete**, with a confirmation; repeating events let you delete *this event*, *this and following* or *all events*
- 👨‍👩‍👧 **One calendar per person** – link a calendar to a `person` entity to show their profile photo (or initials) on chips and events, plus a shared family calendar
- 🎂 **Birthdays** – birthday calendars get a cake icon and "turns 36" when the birth year is in the event
- 🎉 **Holidays** – bank/school holiday calendars appear as a banner on the day instead of cluttering the event list
- ⏳ **Countdowns** – a strip of cards counting down to holidays, birthdays, trips or any date (one-off or yearly)
- 🎨 **Per-calendar colours** with toggle chips to show/hide calendars (remembered per browser)
- 🔴 **"Now" highlight** for events in progress, past events faded, multi-day events labelled *Day 2/3*
- 📱 **Responsive** – adapts to the card's width, works in Sections and Masonry dashboards
- 🌍 Dates and times follow your HA language and 12/24-hour profile setting
- ✅ **Shared to-do list** – tasks grouped by person (using your calendar names), optional due date, anyone can add, tick to complete (with Undo); updates live on every device
- 🖥️ **Wall display mode** – fills the whole screen, stretches Month/Week to the full height, to-do list as a sidebar, auto-scales text for distance viewing and keeps the screen awake
- 🎨 **5 colour themes** – Nordic, Sunset, Forest, Midnight and Graphite, or follow your HA theme (light and dark)
- 🛠️ **Visual editor** – theme picker, and a calendar list where you can rename each calendar, set its colour, link a person and choose its type
- 🌙 **Night mode & screensaver** for always-on screens – a dim night clock on a schedule (wake by touch or motion sensor) and a family-photo slideshow with clock, weather and next event when idle
- 🌍 **English, Polish and Spanish** – card and visual editor follow your Home Assistant language, with an extra **Imieniny** (name day) event type in Polish
- 🔍 **Appearance controls** – hide or shrink countdowns (compact one-line style, size slider) and enlarge day boxes and events with a slider
- Zero dependencies, one file

## Requirements

- Home Assistant **2024.x or newer**
- At least one calendar integration:
  - **Google Calendar** → [Google Calendar integration](https://www.home-assistant.io/integrations/google/)
  - **Apple iCloud** → [CalDAV integration](https://www.home-assistant.io/integrations/caldav/) with server `https://caldav.icloud.com` and an [app-specific password](https://support.apple.com/en-gb/102654)
  - Or Local Calendar, Microsoft 365, etc.
- Optional: a `weather.*` entity that provides a **daily** forecast (e.g. Met.no, the default "Forecast Home")

> **Adding events** only appears for calendars whose integration supports creating events. Google Calendar and Local Calendar do. Read-only calendars (holidays, shared feeds) are still displayed but are not offered in the calendar picker.

## Installation

### HACS (recommended)

Home Calendar Card is in the **HACS default store** – no custom repository needed.

[![Open your Home Assistant instance and open this repository in HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=mimikm&repository=Home-Calendar-Card&category=plugin)

1. Click the button above, or open **HACS** and search for **Home Calendar Card**
2. Click **Download**
3. Reload your browser

HACS will tell you when a new version is out.

> Added it as a custom repository before it was in the store? It keeps working. To tidy up, remove it under HACS → ⋮ → **Custom repositories** – the card stays installed.

### Manual

1. Download `home-calendar-card.js` from the [latest release](https://github.com/mimikm/Home-Calendar-Card/releases)
2. Copy it to `/config/www/home-calendar-card.js`
3. Settings → Dashboards → ⋮ → **Resources** → Add `/local/home-calendar-card.js` as a **JavaScript module**
4. Reload your browser

## Configuration

Add the card from the dashboard card picker (search for *Home Calendar*) and use the visual editor, or use YAML:

### Minimal

```yaml
type: custom:home-calendar-card
calendars:
  - calendar.family
  - calendar.work
weather_entity: weather.forecast_home
```

### Full family example

```yaml
type: custom:home-calendar-card
title: Family
calendars:
  # shared family calendar
  - entity: calendar.family
    name: Family
    color: "#4285F4"
  # one calendar per person – photo comes from the person entity
  - entity: calendar.oliver
    person: person.oliver
    color: "#EA4335"
  - entity: calendar.emma_icloud
    person: person.emma
    color: "#34A853"
  - entity: calendar.kids
    name: Kids
    icon: mdi:human-child
    color: "#F9AB00"
  # birthdays (e.g. Google "Birthdays" calendar)
  - entity: calendar.birthdays
    type: birthday
    color: "#F06292"
  # bank / school holidays (e.g. the Holiday integration)
  - entity: calendar.united_kingdom
    type: holiday
    color: "#A142F4"
countdowns:
  - name: Tenerife ✈️
    date: "2026-12-20"
    icon: mdi:airplane
  - calendar: calendar.family       # next family event matching "holiday"
    match: holiday|vacation
    icon: mdi:beach
  - calendar: calendar.birthdays    # next birthday
    icon: mdi:cake-variant
  - calendar: calendar.united_kingdom
    match: christmas
    icon: mdi:pine-tree
  - name: Anniversary
    date: "2019-06-14"
    repeat: yearly
    icon: mdi:heart
weather_entity: weather.forecast_home
default_view: agenda
days_to_show: 7
first_day_of_week: monday
time_format: 24h
show_empty_days: false
max_events_per_day: 3
max_height: 640px
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `calendars` | list | **required** | Calendar entity IDs, or objects – see *Calendar options* |
| `countdowns` | list | – | Countdown cards shown under the header – see *Countdowns* |
| `countdown_days` | number | `365` | How far ahead calendar-based countdowns look |
| `max_countdowns` | number | `8` | Maximum countdown cards shown |
| `show_countdowns` | boolean | `true` | Show the countdown strip – see *Appearance* |
| `countdown_style` | `cards` \| `compact` | `cards` | `compact` = one slim row of pills |
| `countdown_size` | number (%) | `100` | Countdown size, 50–150 |
| `event_size` | number (%) | `100` | Day & event size, 80–160 – bigger, taller day boxes |
| `countdown_colors` | map \| `calendar` | theme colours | Override countdown colours (see *Countdown colours*), or `calendar` to use each calendar's colour |
| `event_types` | list | built-in five | Types offered in the add-event dropdown – see *Event types* |
| `default_event_type` | string | `standard` | Type pre-selected when adding an event |
| `weather_entity` | string | – | Weather entity for current conditions and daily forecast |
| `todo_entity` | string | – | A `todo.*` entity to show the shared to-do list – see *To-do list* |
| `todo_title` | string | `To-do` | Heading above the to-do list |
| `todo_on_done` | `complete` \| `remove` | `complete` | What ticking a task does: mark it completed (kept in HA's history) or delete it |
| `todo_group_by` | `person` \| `due` | `person` | Group tasks by person, or by due date (Overdue / Today / Tomorrow / each day / Anytime) |
| `todo_days_ahead` | number | – (all) | Only show tasks due within this many days. Tasks without a date always show |
| `todo_calendar` | string | – | Calendar with future repeats of recurring chores (e.g. Chore Calendar) – shown read-only |
| `todo_show_completed` | boolean | `false` | Show a collapsible **Done** section with recently completed tasks |
| `todo_completed_days` | number | `7` | How many days back the Done section goes |
| `todo_record_done_by` | boolean | `true` | When a task is ticked in the card, note who did it ("Done by: Emma") in the task's notes |
| `night_mode` | `true` \| object | – | Night screen for always-on displays – see *Night mode & screensaver* |
| `screensaver` | `true` \| object | – | Photo slideshow / clock when nobody uses the screen – see *Night mode & screensaver* |
| `layout` | `card` \| `fill` \| `fullscreen` | `card` | `fill` fills a Panel view below HA's top bar; `fullscreen` covers the whole window – see *Wall display* |
| `scale` | `auto` \| number | `auto` | Text/UI size in `fill`/`fullscreen` (`auto` grows with the screen, e.g. `1.5` = 150%) |
| `keep_awake` | boolean | `true` in fill/fullscreen | Stop the screen from sleeping while the card is shown |
| `browser_fullscreen` | boolean | `false` | In `fullscreen`, the first tap also switches the browser to true full screen (hides the address bar) |
| `todo_position` | `auto` \| `top` \| `bottom` \| `left` \| `right` | `auto` | Where the to-do list sits. `auto` = bottom for a normal card, right in fill/fullscreen |
| `todo_autohide` | `false` \| `true` \| seconds | `false` | Fold the to-do list away into a slim bar/tab; tap to open; it folds again after this many seconds without use (`true` = 30) |
| `theme` | `auto` \| `nordic` \| `sunset` \| `forest` \| `midnight` \| `graphite` | `auto` | Colour scheme – see *Themes* |
| `language` | `auto` \| `en` \| `pl` \| `es` | `auto` | Card language – `auto` follows your Home Assistant profile |
| `title` | string | – | Shown above the date in the header |
| `default_view` | `agenda` \| `week` \| `month` \| `planner` | `agenda` | View shown when the dashboard loads |
| `days_to_show` | number | `7` | Number of days in Agenda view |
| `first_day_of_week` | `monday` \| `sunday` \| `saturday` | `monday` | Start of week in Week and Month views |
| `time_format` | `auto` \| `24h` \| `12h` | `auto` | `auto` follows your HA user profile |
| `show_empty_days` | boolean | `false` | Show days with no events in Agenda view (today is always shown) |
| `show_header` | boolean | `true` | Show the big date and current weather |
| `show_calendar_chips` | boolean | `true` | Show the calendar show/hide chips |
| `allow_add` | boolean | `true` | Show the **+ Event** button |
| `allow_edit` | boolean | `true` | Show the **Edit** button on events |
| `allow_delete` | boolean | `true` | Show the **Delete** button on events (turn off for a shared wall screen) |
| `max_events_per_day` | number | `3` | Events listed per day in Month view before "+N" |
| `max_height` | CSS size | – | Makes the event area scroll, e.g. `600px` |
| `refresh_interval` | minutes | `5` | How often events are re-fetched |

### Calendar options

| Option | Description |
|---|---|
| `entity` | Calendar entity ID (required) |
| `name` | Display name (defaults to the person's or calendar's name) |
| `color` | Colour for this calendar's events and chip |
| `person` | A `person.*` entity – shows their profile picture (or initials) on chips and events |
| `picture` | Image URL to use instead of a person's picture, e.g. `/local/kids.png` |
| `icon` | MDI icon shown as the badge when there's no picture, e.g. `mdi:human-child` |
| `type` | `events` (default), `birthday`, `anniversary`, `nameday` or `holiday` |
| `group` | Group name, e.g. `Kids`. Calendars with the same group share one button – see *Calendar groups* |
| `planner_column` | `true` (default) gives this calendar its own column in the Planner view. `false` shows its events next to the date instead – handy for a shared Family calendar |

#### Calendar groups

Lots of calendars? Give some of them the same `group` and they collapse into **one button** in the calendar bar:

```yaml
calendars:
  - entity: calendar.family
  - entity: calendar.emma
    person: person.emma
    group: Parents
  - entity: calendar.oliver
    person: person.oliver
    group: Parents
  - entity: calendar.birthdays
    type: birthday
    group: Extras
  - entity: calendar.school_holidays
    type: holiday
    group: Extras
```

- The group button shows the members' photos/colours, the group name and how many calendars it holds.
- **Tap it** to hide or show the whole group at once. If only some are visible it shows e.g. *1/2* with a dashed outline, and the next tap hides them all.
- **Tap the arrow** next to it to open the group and switch members on or off one by one.
- Your choice is remembered on each device, like the single calendar buttons.
- In the visual editor, each calendar has a **Group** field – type the same name for every calendar you want together.

Groups only tidy up the calendar bar – adding events still lists every calendar you can write to.

**`type: birthday`** – events show a 🎂 icon and "Birthday". If the event title or description contains a birth year (e.g. *Anna (1990)*), the card shows *turns 36* and hides the year from the title.

**`type: anniversary`** – events show a ❤️ icon and "Anniversary". With a year in the title (e.g. *Wedding (2014)*) the card shows *12th anniversary*.

**`type: nameday`** – Polish name days (*imieniny*): a 🌷 icon and "Imieniny", with countdowns for the next two.

**`type: holiday`** – events appear as a coloured banner next to the day (and tint the day in Month view) rather than as an event row.

### Countdowns

Each countdown is either a fixed date or the **next matching event** from a calendar:

| Option | Description |
|---|---|
| `name` | Label (defaults to the event title for calendar countdowns) |
| `date` | Fixed date (`"2026-12-20"`) or date-time (`"2026-12-20 07:30"`). Dates count down in your own time zone; a date saved by the dashboard editor as `2026-12-20T00:00:00.000Z` is read as that day too |
| `repeat` | `yearly` – for anniversaries and birthdays entered as a fixed date |
| `calendar` | Use the next upcoming event from this calendar instead of a fixed date |
| `match` | Only count down to events whose title matches (case-insensitive, `\|` for "or") |
| `icon` | MDI icon, e.g. `mdi:airplane` |
| `color` | Card colour (defaults to the calendar's colour) |

Countdowns are sorted soonest first and disappear once the date has passed (yearly ones roll over automatically). Tap a calendar countdown to open the event.

**Countdown colours** – every theme has its own countdown colours, separate from the calendar colours, so each kind of countdown is easy to spot:

| Countdown | Colour |
|---|---|
| 🎂 Birthday | pink-purple |
| ❤️ Anniversary | rose-red |
| 🏖 Holiday | blue |
| ✈️ Your own dates (`date:`) | rotating – orange, teal, indigo, green… so neighbouring cards differ |
| Other events | grey, or the event type's `color` |

The exact shades are tuned for each theme. A `color:` on a single countdown always wins. Override per kind, or go back to calendar colours:

```yaml
countdown_colors:
  birthday: "#FF4FA3"
  holiday: "#00A3E0"
  custom: ["#F59E0B", "#10B981"]
# or
countdown_colors: calendar
```

You can also give a fixed-date countdown a kind, e.g. `type: anniversary`, to use that colour.

**Automatic countdowns – no config needed:**

| Type | Automatic countdown |
|---|---|
| Birthday | The **next 2** upcoming birthdays, with the age (*turns 10*) – from birthday calendars and from events added with the Birthday type |
| Anniversary | Every upcoming anniversary, with the count (*12th*) |
| Holiday | Every upcoming event added with the Holiday type (bank-holiday calendars are not counted down) |

Change this per type with `event_types` – for example show the next 3 birthdays, only within the next 30 days, or turn birthday countdowns off:

```yaml
event_types:
  - standard
  - holiday
  - id: birthday
    countdown_limit: 3     # next 3 birthdays
    countdown_days: 30     # only within the next 30 days
  - anniversary
  - work
  - dhs
```

### Event types

When adding an event you pick a **Type** from a dropdown. The built-in types are:

| Type | Icon | What it does |
|---|---|---|
| Standard | – | A normal event |
| Holiday | 🏖 `mdi:beach` | All-day by default, shown as a banner on each day of the trip, gets an automatic countdown |
| Birthday | 🎂 `mdi:cake-variant` | All-day, repeats every year, shows *turns X* if you add the birth year to the title, e.g. `Mum (1962)` |
| Anniversary | ❤️ `mdi:heart` | All-day, repeats every year, gets an automatic countdown, shows *12th anniversary* if you add the year to the title, e.g. `Wedding (2014)` |
| Imieniny (Polish only) | 🌷 `mdi:flower-tulip` | Name day – all-day, repeats every year, countdowns for the next 2 name days. Shown in the Type dropdown when the card is in Polish |
| Work event | 💼 `mdi:briefcase-outline` | Briefcase icon on the event |
| DHS | 🏷 `mdi:tag-outline` | Tag icon on the event |

**How it's stored:** calendars in Home Assistant don't have a "type" field, so the card adds a tag such as `#work` to the end of the event's description. The card hides the tag and shows the icon instead. This also works the other way round – type `#holiday`, `#birthday`, `#work` or `#dhs` into the description (or title) of an event in Google or Apple Calendar and the card will pick it up.

**Customise the list** with `event_types`. Built-in types keep their defaults, so you only need to set what you want to change, and you can add your own:

```yaml
event_types:
  - standard
  - holiday
  - birthday
  - id: work
    name: Work
  - id: dhs
    name: DHS
    icon: mdi:home-heart        # pick any MDI icon
  - id: school
    name: School
    icon: mdi:school
  - id: appointment
    name: Appointment
    icon: mdi:stethoscope
    countdown: true
default_event_type: standard
```

| Type option | Description |
|---|---|
| `id` | Short name used for the tag, e.g. `school` → `#school` |
| `name` | Name shown in the dropdown |
| `icon` | MDI icon shown on events of this type |
| `style` | `banner` (shown like a holiday) or `birthday` (cake style, *turns X*) |
| `all_day` | `true` to switch on All day when this type is picked |
| `repeat` | Default repeat when picked: `daily`, `weekly`, `fortnightly`, `monthly`, `yearly` |
| `countdown` | `true` to show a countdown card for upcoming events of this type |
| `countdown_limit` | Only the next N events of this type get a card (birthdays default to `2`) |
| `countdown_days` | Only events within this many days get a card (default: the card's `countdown_days`, 365) |
| `countdown_calendars` | `true` to also count down events from calendars of this type, not just tagged events (on by default for birthdays and anniversaries) |

### Repeating events

The **Repeat** dropdown offers every day / week / 2 weeks / month / year. Repeating events are created through Home Assistant's calendar API with a recurrence rule. Local Calendar and Google Calendar support this; if a calendar's integration doesn't, the card shows the error and you can save it as a one-off instead.

### To-do list

A shared family to-do list below the calendar, grouped by person.

1. Create a list: **Settings → Devices & services → Add integration → Local To-do**, e.g. *Family*. (Any to-do integration works – Google Tasks, Todoist, etc.)
2. Set it on the card:

```yaml
todo_entity: todo.family
```

- **People come from your calendars** – every calendar of type *Events* is a person you can assign tasks to, using the display name you gave it (e.g. *Oliver*, *Emma*, *Family*). There's also an **Everyone** option.
- **Add a task** – type it, optionally pick a due date, tap the person and press **+** (or Enter). Anyone using the dashboard can add.
- **Tick to finish** – the task is marked done and disappears from the list. An **Undo** button appears for a few seconds.
- **Due dates** – shown as *Today*, *Tomorrow* or the date; overdue tasks turn red.
- **Live** – changes made on another phone or in HA's own To-do page show up instantly.

**Position** – `todo_position: top | bottom | left | right`. Left and right become a sidebar when the card is at least 900px wide (on narrower screens they fall back to the bottom). In full-screen layouts, top and bottom show the groups in one scrolling row so the calendar keeps most of the height.

**Auto-hide** – `todo_autohide: 30` folds the list into a slim bar (top/bottom) or a vertical tab (left/right) showing the task count. Tap it to open; it folds away again after 30 seconds without use (it waits while someone is typing a task). `todo_autohide: true` uses 30 seconds. Both options are also in the visual editor.

#### Recurring chores, upcoming and done tasks

Great with recurring-chore integrations such as **Chore Calendar**, which keep only the *next* occurrence of each chore as a to-do and the future ones in a calendar:

```yaml
todo_entity: todo.household_chores
todo_group_by: due                       # Overdue / Today / Tomorrow / each day / Anytime
todo_days_ahead: 7                       # only the coming week
todo_calendar: calendar.household_chores # future repeats, shown read-only
todo_show_completed: true                # "Done" section
todo_completed_days: 7
```

- **Grouped by due date** – Overdue (red), Today, Tomorrow, then one group per day, and *Anytime* for tasks without a date. Each task shows who it's for.
- **Upcoming repeats** – occurrences from `todo_calendar` appear in their day with a dashed calendar icon. They can't be ticked yet – the real task appears when it's due. Repeats that match an existing task on the same day (same name) are not shown twice.
- **Done section** – tap **Done** to open it: tasks completed in the last `todo_completed_days` days, newest first, with when and who. **Tap the tick to un-tick** a task (it goes back to the list).
- **Who did it** – Home Assistant doesn't record who completes a task, so when someone ticks a task *in this card* it adds `Done by: <HA user> (date time)` to the task's notes (lists that support notes, e.g. Local To-do). On a shared wall tablet that's the tablet's HA user. Turn off with `todo_record_done_by: false`.
- Tasks without a completion time (some integrations don't store one) still appear in Done – the most recent 10.
- With `todo_on_done: remove`, ticked tasks are deleted, so the Done section stays empty.

All of these are also in the visual editor under the to-do settings.

How it's stored: the person is saved in the task's description as `For: Emma`, so it's readable in HA's To-do page too. Lists that don't support descriptions get a `[Emma]` prefix in the task name instead. If you rename a calendar later, existing tasks stay under the old name until you edit them.

### Editing events

Tap any event and press **Edit**. The same form as adding opens, filled in with the event's details – change anything and press **Save**.

- **Move to another calendar** – tap a different calendar chip (e.g. from *Family* to *Emma*). The event is created in the new calendar and removed from the old one.
- **Repeating events** – when you save, choose **This event** (only this date) or **This and following** (this date onwards). Repeating events can't be moved to another calendar.
- **Event types and years are kept** – a birthday stays *Leo (2016)* and keeps its *Birthday* type when you edit it.

The Edit button only appears for calendars whose Home Assistant integration supports updating events (Local Calendar and Google Calendar do). Otherwise the pop-up says the calendar can't edit events. Turn editing off with `allow_edit: false` (also in the visual editor).

### Deleting events

Tap any event and press **Delete** in its pop-up. You'll be asked to confirm:

- **One-off events** – *Delete* or *Cancel*.
- **Repeating events** – choose **This event**, **This and following** (this date onwards) or **All events** (the whole series).

The Delete button only appears for calendars whose Home Assistant integration supports deleting (Local Calendar and Google Calendar do). For other calendars the pop-up says so. To stop events being deleted from a shared screen, set `allow_delete: false` (also in the visual editor).

### Planner view (a column per person)

Like a printed family planner on the fridge: **days down the side, one column per person**, so you can see who's doing what all week at a glance. Pick **Planner** in the view buttons, or make it the default:

```yaml
default_view: planner
calendars:
  - entity: calendar.family
    name: Family
    planner_column: false   # optional: show family events next to the date instead of in their own column
  - entity: calendar.emma
    person: person.emma
  - entity: calendar.oliver
    person: person.oliver
  - entity: calendar.birthdays
    type: birthday
```

- Every normal calendar (`type: events`) gets a column with the person's photo and name at the top, in the order of your `calendars` list.
- **Tap an empty box** to add an event straight into that person's calendar on that day. Tap an event to open it.
- Birthday, anniversary and name day calendars, bank and school holidays, and calendars with `planner_column: false` show in the date box on the left.
- Today is highlighted and weekends are shaded. The weather for each day sits under the date.
- Hiding a calendar with its button in the calendar bar also hides its column.
- In `fill`/`fullscreen` the 7 days stretch to fill the screen. On a phone the columns scroll sideways while the dates stay in place.
- **Event size** (see *Appearance*) makes the boxes taller and the text bigger.

### Wall display (permanent desktop / tablet)

```yaml
type: custom:home-calendar-card
layout: fullscreen
theme: midnight
browser_fullscreen: true
# ...calendars, weather, todo_entity as usual
```

- **`layout: fullscreen`** – the card covers the entire browser window (HA's header and sidebar are hidden behind it). Month and Week stretch to fill the screen, Agenda flows into columns, and the to-do list becomes a sidebar on screens 1100px and wider.
- **`layout: fill`** – fills the page but keeps HA's top bar. Put the card in a **Panel** view (dashboard view settings → View type → Panel).
- **Auto scaling** – on big screens everything is enlarged so it's readable from across the room. Override with `scale: 1.4`.
- **Keeps the screen awake** using the browser's Wake Lock (needs HTTPS, e.g. Nabu Casa or your own certificate).
- **Editing is safe** – while the dashboard is in edit mode or the card editor is open, the card shows as a normal card so you can still reach everything.
- **Hidden controls** – move the mouse or touch the screen and two buttons appear top-right for 3 seconds: *browser full screen* and *show Home Assistant* (temporarily switches to `fill` until the page is reloaded; a full-screen button in the toolbar switches back).

**Tips for a dedicated screen**
- Set this dashboard as the default on that device (Profile → Dashboard).
- On a PC, run the browser in kiosk mode, e.g. `chrome --kiosk https://your-ha/dashboard-wall/0`.
- On an Android tablet, a kiosk browser such as Fully Kiosk Browser works well.
- On an iPad, add the dashboard to the Home Screen and use Guided Access.

### Night mode & screensaver

Made for wall tablets and screens that are always on. Both cover the whole screen in `layout: fullscreen` (or just the card in a normal dashboard), and both switch themselves off while you edit the dashboard.

| Night mode (clock) | Screensaver |
|---|---|
| ![Night mode](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/night-mode.png) | ![Screensaver](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/screensaver.png) |

**🌙 Night mode** – between the times you choose, the screen goes dark:

```yaml
night_mode:
  start: "22:00"
  end: "06:30"
  style: clock          # clock = black screen with a dim clock, dim = darkened calendar
  brightness: 30        # %
  wake_entity: binary_sensor.hallway_motion   # optional – wake when someone walks past
  wake_seconds: 60
```

- **Clock style** shows the time, date, tomorrow's first events and tomorrow's weather. It moves a little every minute so nothing burns into the screen.
- **Tap** (or the motion sensor) wakes the calendar for `wake_seconds`; it stays awake while someone is using it.
- **Controlled by an automation instead?** Use `when_entity: input_boolean.night` – night mode is on whenever that entity is on (works with `input_boolean`, `binary_sensor`, `switch` or `schedule`). Then `start`/`end` are ignored.
- `night_mode: true` uses the defaults above.

**🖼️ Screensaver** – after a few minutes without anyone touching the screen:

```yaml
screensaver:
  after: 5              # minutes without use
  media: media-source://media_source/local/photos
  interval: 20          # seconds per photo
  shuffle: true
  show_info: true       # clock, weather, next events and countdown on top
```

- **Photos** come from Home Assistant's **Media** library: put them in `/media/photos` (e.g. with the Samba or File editor add-on) and use `media-source://media_source/local/photos`. Sub-folders are included (two levels). You can also list plain URLs with `images: [/local/photos/beach.jpg, ...]`.
- Photos fade into each other with a slow zoom; portrait photos aren't cropped – they sit on a blurred copy of themselves.
- **No photos?** Leave `media` empty for a clean clock screen on a softly moving background.
- **One tap** (or moving the mouse) closes it – the tap never presses anything underneath.
- When it starts, the calendar jumps back to **today** in your default view, so the next person always sees the current week.
- It never starts while someone is adding an event or typing a task. During night hours, night mode takes over.
- `screensaver: true` uses the defaults (5 minutes, clock only).

Both are also in the visual editor under **Night mode** and **Screensaver**.

### Appearance – bigger, clearer day boxes

Give the calendar more room by shrinking or hiding the countdowns and making the days bigger:

```yaml
show_countdowns: true        # false hides the countdown strip completely
countdown_style: compact     # cards (default) or compact one-line pills
countdown_size: 80           # countdown size in %, 50–150
event_size: 130              # day & event text size in %, 80–160 (also makes Month/Week boxes taller)
show_calendar_chips: false   # hide the calendar buttons row
```

![Default vs compact countdowns with 130% day size](images/appearance.png)

- **Compact** countdowns turn the strip into one slim row of pills (`1 day Leo`, `6 days Lake District`) – about 60% less height. Tap or hover a pill to see the date.
- **Event size** enlarges the day numbers, weather and event titles in every view, and makes Month and Week boxes taller to fit.
- In `fill`/`fullscreen` the space you free up goes straight to the day boxes.

All of these are in the visual editor under **Appearance**, with sliders for the two sizes.

### Themes

| Theme | Look |
|---|---|
| `auto` | Follows your Home Assistant theme (default) |
| `nordic` | Light, cool slate with a blue accent |
| `sunset` | Warm cream with a coral accent |
| `forest` | Soft sage with a deep green accent |
| `midnight` | Dark navy with a sky-blue accent |
| `graphite` | Dark charcoal with an amber accent |

Each theme also has a matching calendar colour palette, used for any calendar without its own `color`.

```yaml
theme: midnight
```

### Visual editor

Everything except countdowns and custom event types can be set in the visual editor:

- **Theme** – shows the current theme; tap it to open the preview tiles and pick another
- **Calendars** – each calendar is a compact row showing its colour, name (with the person's photo), entity and type. **Tap a row** to open its settings: pick the entity, give it a **display name**, link a **person** for their photo and set the **calendar type** (Events, Birthdays, Anniversaries, Imieniny, Holidays). Tap the colour dot to change its **colour** without opening the row. Reorder with the arrows, remove with the bin, add more with **Add calendar** (new calendars open straight away). **Expand all / Collapse all** when you have many
- A calendar whose entity no longer exists is shown with its entity in red
- **Display** – title, weather, default view, week start, time format and more

Countdowns and `event_types` are kept when you use the visual editor – edit them in the code editor.

## Using it

- **Tap a day number** (any view) to see that day's events and add one on that date
- **Tap an event** for details: time, location (opens in Maps), calendar, description and that day's forecast
- **Tap the weather pill** to open the weather entity's more-info dialog
- **Tap a calendar chip** to hide/show it

## Getting birthday and holiday calendars

- **Birthdays** – in Google Calendar, add the *Birthdays* calendar (it's built from your Google Contacts); it then appears in the Google Calendar integration. On iCloud, the *Birthdays* calendar can be added via CalDAV.
- **Bank holidays** – add the [Holiday integration](https://www.home-assistant.io/integrations/holiday/) (choose your country), or subscribe to a holidays calendar in Google.
- **School holidays** – most councils publish an iCal feed; subscribe to it in Google Calendar or use the [Remote Calendar integration](https://www.home-assistant.io/integrations/remote_calendar/).

## Languages

The card and its visual editor are available in:

| Language | Code |
|---|---|
| English | `en` |
| Polski | `pl` |
| Español | `es` |

The language follows your Home Assistant profile automatically. Set `language: pl` (or pick it in the visual editor) to force one. Dates, weekdays and month names always use your language's normal format.

**Polish extra – Imieniny 🇵🇱** – in Polish the Type dropdown includes **Imieniny** (name days). They repeat every year, get their own gold countdown colour, and the next two name days appear as countdown cards. Add one from the card, or tag an event in Google/Apple Calendar with `#imieniny`. A whole calendar of name days can be set to *Calendar type: Imieniny* in the editor.

You can also type these tags in Google or Apple Calendar instead of the English ones: `#urodziny`, `#rocznica`, `#wakacje`, `#urlop`, `#praca`, `#imieniny` (Polish) and `#cumpleanos`, `#aniversario`, `#vacaciones`, `#trabajo`, `#onomastica` (Spanish).

Your own `event_types` names, calendar names and `todo_title` are shown exactly as you write them.

## Troubleshooting

- **No weather on days** – your weather entity must support a *daily* forecast. Hourly-only providers will show the current conditions in the header only.
- **"Event" button missing** – none of the configured calendars support creating events. Check the calendar's integration.
- **New event doesn't appear immediately** – some providers (especially iCloud via CalDAV) take a few seconds to sync; the card refreshes again automatically.

## Roadmap

Planned features – ideas and votes are welcome in [Issues](https://github.com/mimikm/Home-Calendar-Card/issues).

- 🎤 **Add events by voice** – a microphone button in the *Add event* window: say *"Dentist for Mia next Tuesday at 3pm"* and the title, date, time, calendar and event type are filled in for you to check and save. Uses Home Assistant's own voice pipeline (HA Cloud or local Whisper), so it works in the Companion app and on wall tablets, in English, Polish and Spanish. The microphone needs HTTPS.
- 🔍 **Calendar filters** – hide events from a calendar by words in the title (e.g. colleagues' *vacation* or *out of office* entries in a work calendar), show only matching events, or hide all-day events. Filtered events stay in Home Assistant for automations.
- 🌐 **Web panel for wall displays** – show a web page (radar map, bus times, school menu, your own dashboard) or a camera next to the calendar. Choose the position, set its size with a slider or by dragging its edge, zoom the page to fit, auto-refresh, rotate several pages, and lock it so taps can't navigate away. Only works with sites that allow being embedded, and over HTTPS only with `https://` pages.
- 🗣️ **Voice assistant tip** – a ready-made script and guide for adding events by talking to Assist or a voice speaker with an AI conversation agent.

## Support

If you like this card, you can [buy me a coffee ☕](https://buymeacoffee.com/mimikm).

## License

MIT
