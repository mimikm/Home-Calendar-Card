# Home Calendar Card

A clean, modern calendar card for Home Assistant. Shows your **Google**, **Apple iCloud** (via CalDAV) or any other Home Assistant calendar in **Agenda**, **Week** and **Month** views, with the **daily weather forecast** on every day — and lets you **add events** straight from the dashboard, choosing which calendar they go into.

![Home Calendar Card](https://github.com/mimikm/Home-Calendar-Card/raw/main/images/preview.png)

## Features

- 📅 **Three views** – Agenda (grouped by day), Week (7 columns, stacks on phones) and Month (grid, dots on phones)
- 🌦️ **Weather built in** – current conditions in the header, daily icon, high/low and rain chance on each day, forecast shown when you add an event
- ➕ **Add events** – title, **event type** dropdown, **repeat** dropdown, calendar picker (colour-coded chips), all-day toggle, start/end, location, description
- 🏷️ **Event types** – Standard, Holiday, Birthday, Work event and DHS out of the box (fully customisable), each with its own icon and behaviour
- 🗑️ **Delete events** – on calendars that support it (tap twice to confirm; recurring events delete only that occurrence)
- 👨‍👩‍👧 **One calendar per person** – link a calendar to a `person` entity to show their profile photo (or initials) on chips and events, plus a shared family calendar
- 🎂 **Birthdays** – birthday calendars get a cake icon and "turns 36" when the birth year is in the event
- 🎉 **Holidays** – bank/school holiday calendars appear as a banner on the day instead of cluttering the event list
- ⏳ **Countdowns** – a strip of cards counting down to holidays, birthdays, trips or any date (one-off or yearly)
- 🎨 **Per-calendar colours** with toggle chips to show/hide calendars (remembered per browser)
- 🔴 **"Now" highlight** for events in progress, past events faded, multi-day events labelled *Day 2/3*
- 📱 **Responsive** – adapts to the card's width, works in Sections and Masonry dashboards
- 🌍 Dates and times follow your HA language and 12/24-hour profile setting
- 🌗 Uses your HA theme, light and dark
- Zero dependencies, one file, visual editor included

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
| `title` | string | – | Shown above the date in the header |
| `default_view` | `agenda` \| `week` \| `month` | `agenda` | View shown when the dashboard loads |
| `days_to_show` | number | `7` | Number of days in Agenda view |
| `first_day_of_week` | `monday` \| `sunday` \| `saturday` | `monday` | Start of week in Week and Month views |
| `time_format` | `auto` \| `24h` \| `12h` | `auto` | `auto` follows your HA user profile |
| `show_empty_days` | boolean | `false` | Show days with no events in Agenda view (today is always shown) |
| `show_header` | boolean | `true` | Show the big date and current weather |
| `show_calendar_chips` | boolean | `true` | Show the calendar show/hide chips |
| `allow_add` | boolean | `true` | Show the **+ Event** button |
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

> The visual editor manages a simple list of calendar entities. For people, colours, birthdays, holidays and countdowns, switch to the code editor and use the object form shown above.

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
