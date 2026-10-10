# Home Calendar Card

A clean, modern calendar card for Home Assistant. Shows your **Google**, **Apple iCloud** (via CalDAV) or any other Home Assistant calendar in **Agenda**, **Week** and **Month** views, with the **daily weather forecast** on every day — and lets you **add events** straight from the dashboard, choosing which calendar they go into.

![Home Calendar Card](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/preview.png)

## Screenshots

| Wall display – Month (Midnight) | Wall display – Week (Sunset) |
|---|---|
| ![Month view on a wall display](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/wall-month.png) | ![Week view on a wall display](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/wall-week.png) |
| **Wall display – Agenda (Forest)** | **Adding an event** |
| ![Agenda view on a wall display](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/wall-agenda.png) | ![Add event dialog](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/add-event.png) |

**Five colour themes**

![Nordic, Sunset, Forest, Midnight and Graphite themes](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/themes.png)

**On a phone (Graphite)**

<img src="https://github.com/mimikm/Home-Calendar-Card/raw/main/images/mobile.png" alt="Phone view" width="320">

<sub>Screenshots use a fictional family – all names, places and events are made up.</sub>

## Features

- 📅 **Three views** – Agenda (grouped by day), Week (7 columns, stacks on phones) and Month (grid, dots on phones)
- 🌦️ **Weather built in** – current conditions in the header, daily icon, high/low and rain chance on each day, forecast shown when you add an event
- ➕ **Add events** – title, **event type** dropdown, **repeat** dropdown, calendar picker (colour-coded chips), all-day toggle, start/end, location, description
- 🏷️ **Event types** – Standard, Holiday, Birthday, Work event and DHS out of the box (fully customisable), each with its own icon and behaviour
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

1. HACS → ⋮ → **Custom repositories**
2. Add `https://github.com/mimikm/Home-Calendar-Card`, type **Dashboard**
3. Install **Home Calendar Card** and reload your browser

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
  - entity: calendar.dom
    person: person.dom
    color: "#EA4335"
  - entity: calendar.kasia_icloud
    person: person.kasia
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
    date: 2026-12-20
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
    date: 2019-06-14
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
| `event_types` | list | built-in five | Types offered in the add-event dropdown – see *Event types* |
| `default_event_type` | string | `standard` | Type pre-selected when adding an event |
| `weather_entity` | string | – | Weather entity for current conditions and daily forecast |
| `todo_entity` | string | – | A `todo.*` entity to show the shared to-do list – see *To-do list* |
| `todo_title` | string | `To-do` | Heading above the to-do list |
| `todo_on_done` | `complete` \| `remove` | `complete` | What ticking a task does: mark it completed (kept in HA's history) or delete it |
| `layout` | `card` \| `fill` \| `fullscreen` | `card` | `fill` fills a Panel view below HA's top bar; `fullscreen` covers the whole window – see *Wall display* |
| `scale` | `auto` \| number | `auto` | Text/UI size in `fill`/`fullscreen` (`auto` grows with the screen, e.g. `1.5` = 150%) |
| `keep_awake` | boolean | `true` in fill/fullscreen | Stop the screen from sleeping while the card is shown |
| `browser_fullscreen` | boolean | `false` | In `fullscreen`, the first tap also switches the browser to true full screen (hides the address bar) |
| `todo_position` | `side` \| `bottom` | `side` | Where the to-do list goes in fill/fullscreen on wide screens |
| `theme` | `auto` \| `nordic` \| `sunset` \| `forest` \| `midnight` \| `graphite` | `auto` | Colour scheme – see *Themes* |
| `title` | string | – | Shown above the date in the header |
| `default_view` | `agenda` \| `week` \| `month` | `agenda` | View shown when the dashboard loads |
| `days_to_show` | number | `7` | Number of days in Agenda view |
| `first_day_of_week` | `monday` \| `sunday` \| `saturday` | `monday` | Start of week in Week and Month views |
| `time_format` | `auto` \| `24h` \| `12h` | `auto` | `auto` follows your HA user profile |
| `show_empty_days` | boolean | `false` | Show days with no events in Agenda view (today is always shown) |
| `show_header` | boolean | `true` | Show the big date and current weather |
| `show_calendar_chips` | boolean | `true` | Show the calendar show/hide chips |
| `allow_add` | boolean | `true` | Show the **+ Event** button |
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
| `type` | `events` (default), `birthday` or `holiday` |

**`type: birthday`** – events show a 🎂 icon and "Birthday". If the event title or description contains a birth year (e.g. *Anna (1990)*), the card shows *turns 36* and hides the year from the title.

**`type: holiday`** – events appear as a coloured banner next to the day (and tint the day in Month view) rather than as an event row.

### Countdowns

Each countdown is either a fixed date or the **next matching event** from a calendar:

| Option | Description |
|---|---|
| `name` | Label (defaults to the event title for calendar countdowns) |
| `date` | Fixed date (`2026-12-20`) or date-time (`2026-12-20 07:30`) |
| `repeat` | `yearly` – for anniversaries and birthdays entered as a fixed date |
| `calendar` | Use the next upcoming event from this calendar instead of a fixed date |
| `match` | Only count down to events whose title matches (case-insensitive, `\|` for "or") |
| `icon` | MDI icon, e.g. `mdi:airplane` |
| `color` | Card colour (defaults to the calendar's colour) |

Countdowns are sorted soonest first and disappear once the date has passed (yearly ones roll over automatically). Tap a calendar countdown to open the event.

Events added with the **Holiday** type get a countdown automatically – no config needed.

### Event types

When adding an event you pick a **Type** from a dropdown. The built-in types are:

| Type | Icon | What it does |
|---|---|---|
| Standard | – | A normal event |
| Holiday | 🏖 `mdi:beach` | All-day by default, shown as a banner on each day of the trip, gets an automatic countdown |
| Birthday | 🎂 `mdi:cake-variant` | All-day, repeats every year, shows *turns X* if you add the birth year to the title, e.g. `Mum (1962)` |
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

### Repeating events

The **Repeat** dropdown offers every day / week / 2 weeks / month / year. Repeating events are created through Home Assistant's calendar API with a recurrence rule. Local Calendar and Google Calendar support this; if a calendar's integration doesn't, the card shows the error and you can save it as a one-off instead.

### To-do list

A shared family to-do list below the calendar, grouped by person.

1. Create a list: **Settings → Devices & services → Add integration → Local To-do**, e.g. *Family*. (Any to-do integration works – Google Tasks, Todoist, etc.)
2. Set it on the card:

```yaml
todo_entity: todo.family
```

- **People come from your calendars** – every calendar of type *Events* is a person you can assign tasks to, using the display name you gave it (e.g. *Dom*, *Kasia*, *Family*). There's also an **Everyone** option.
- **Add a task** – type it, optionally pick a due date, tap the person and press **+** (or Enter). Anyone using the dashboard can add.
- **Tick to finish** – the task is marked done and disappears from the list. An **Undo** button appears for a few seconds.
- **Due dates** – shown as *Today*, *Tomorrow* or the date; overdue tasks turn red.
- **Live** – changes made on another phone or in HA's own To-do page show up instantly.

How it's stored: the person is saved in the task's description as `For: Dom`, so it's readable in HA's To-do page too. Lists that don't support descriptions get a `[Dom]` prefix in the task name instead. If you rename a calendar later, existing tasks stay under the old name until you edit them.

### Deleting events

Tap any event and press **Delete** in its pop-up. You'll be asked to confirm:

- **One-off events** – *Delete* or *Cancel*.
- **Repeating events** – choose **This event**, **This and following** (this date onwards) or **All events** (the whole series).

The Delete button only appears for calendars whose Home Assistant integration supports deleting (Local Calendar and Google Calendar do). For other calendars the pop-up says so. To stop events being deleted from a shared screen, set `allow_delete: false` (also in the visual editor).

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

- **Theme** – tap a preview tile
- **Calendars** – for each calendar pick the entity, then give it a **display name**, tap the colour dot to change its **colour**, link a **person** for their photo, and set the **calendar type** (Events, Birthdays, Holidays). Reorder with the arrows, remove with the bin, add more with **Add calendar**
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

## Troubleshooting

- **No weather on days** – your weather entity must support a *daily* forecast. Hourly-only providers will show the current conditions in the header only.
- **"Event" button missing** – none of the configured calendars support creating events. Check the calendar's integration.
- **New event doesn't appear immediately** – some providers (especially iCloud via CalDAV) take a few seconds to sync; the card refreshes again automatically.

## Support

If you like this card, you can [buy me a coffee ☕](https://buymeacoffee.com/mimikm).

## License

MIT
