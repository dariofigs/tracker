# Design System & Component Library: Botanical Sanctuary

> **Context & Goal:** Personal Fibromyalgia Symptom, Pain & Activity Correlation Tracker.
> **Core Focus:** Low cognitive load, photophobia-friendly, rapid 1-tap logging during flares and brain fog.

---

## 1. Expanded Color Foundation

Building on the approved **Botanical Sanctuary** palette, here are functional roles and extended tints:

| Token Name       | Hex Code  | Role & Usage                                                                            |
| :--------------- | :-------- | :-------------------------------------------------------------------------------------- |
| `canvas-bg`      | `#FBF9F5` | Primary app ground (warm unbleached linen)                                              |
| `surface-card`   | `#FFFFFF` | Primary card / container fill                                                           |
| `surface-subtle` | `#F3EFEA` | Secondary container, inactive chips, unselected track                                   |
| `border-subtle`  | `#EBE5DC` | 1px card boundaries and structural dividers                                             |
| `brand-sage`     | `#2D5A46` | Primary brand accent, low pain (1–3), active checkmarks                                 |
| `sage-tint`      | `#E8F2EC` | Light badge background, pacing balance status                                           |
| `accent-clay`    | `#C47151` | Moderate warning, `DUE` tag, moderate pain (4–6)                                        |
| `clay-tint`      | `#FDF1ED` | Mild warning surfaces: offline banner, backup reminder                                  |
| `clay-text`      | `#A85A3C` | Text on `clay-tint` and quiet clay actions (about 4.5:1 on `clay-tint`, 5.0:1 on white) |
| `flare-plum`     | `#8C3B4E` | High pain (7–10) and flare indicator (gentle, non-alarming)                             |
| `plum-tint`      | `#FBECEF` | Flare banner / high-pain chip fill                                                      |
| `amber-pacing`   | `#D97706` | Spoon capacity alert, rest reminder                                                     |
| `text-primary`   | `#1E2220` | High-contrast espresso for headlines, labels, metrics                                   |
| `text-muted`     | `#736B63` | Subtitles, timestamps, unit labels, inactive icons                                      |

---

## 2. Typography Rules

- **Display & Headings:** `Fraunces` (Weight 600), on `h1`–`h3`
  - Screen Titles: `36px` / Line-height `1.2` / Letter-spacing `-0.01em`
  - Section Headers: `24px` / Line-height `1.2`
- **Numerals & Metrics:** `DM Sans` (Weight 600, tabular figures)
  - Key Metrics (e.g. Battery %): `36px`, never larger than Screen Titles
- **Body, Labels & Buttons:** `DM Sans` (Weight 450 body, 500 small emphasis, 600 strong)
  - Item titles: `18px` / Weight 600
  - Body text and form fields: `16px` / Line-height `1.4` (16px is also the iOS no-zoom floor for fields)
  - Caption (secondary text, times, helper copy): `14px` / Line-height `1.4`
  - Micro (chart axes, calendar letters, status chips): `12px`, sentence case
- Weights in use: 450, 500, 600 only. Corners use squircle where supported.

---

## 3. High-Level Component Specifications

### 1. AM / PM Cadence Card (Connected Timeline)

- **Approved Pattern:** **Variation 1 (Connected Timeline)**
- **Structure:**
  - Continuous vertical progress track connecting Morning Baseline to Afternoon/Evening Reflection
  - Morning Node: Completed badge (`✓`) in Sage (`#2D5A46`) with timestamp, waking pain score (`3/10`), and starting capacity
  - Evening Node: Interactive action node with `DUE` tag in Clay (`#C47151`), direct tap target to launch PM Reflection sheet
  - Purpose: Clearly visualizes today's progression from waking baseline to end-of-day recovery

### 2. Pacing & Energy Battery Card

- **Purpose:** At-a-glance visualization of remaining physical capacity ("Spoon theory").
- **Structure:**
  - Header: Section title (`Fraunces`, 16px) + Status chip (`Balanced` / `Low Battery`)
  - Hero Value: Capacity % (`DM Sans 800`, 40px) + descriptor text
  - Dual-tone progress bar: 8px pill track with filled sage/clay progress fill

### 3. Discrete Whole-Integer Pain Gauge (Channel Fill & Beads)

- **Approved Pattern:** **Sub-variation 1A (Channel Fill & Beads)**
- **Structure:**
  - Continuous tactile pill groove (`#F3EFEA`) with a soft tint background channel fill (`#E8F2EC`)
  - 11 physical bead stops (whole numbers 0 to 10) eliminating fractional ambiguity
  - Elevated active handle: 28px circular button in Moss Sage (`#2D5A46`) with white border and subtle drop shadow showing the current integer
  - Inactive beads styled in muted stone (`#D1C9BE`), active beads filled in brand sage
  - Bottom range anchors: `0 None` • `Mild (1-4)` • `Mod (5-7)` • `Flare (8-10)`

### 3. Tactile Pill Chips (Symptom & Activity Toggles)

- **Purpose:** 1-tap selectors with minimum 48px touch clearance.
- **One style for every kind of chip** (pain areas, activities, symptoms). Clay is a warning colour, so it is not used to tell chip kinds apart.
- **States:**
  - **Active:** Sage tint fill and border, sage text, bold, with the Solar Linear check icon before the label
  - **Inactive:** Oat fill (`#F3EFEA`) with the Solar Linear plus icon and muted text

### 4. Correlation Insight Banner (Activity ↔ Symptom Link)

- **Purpose:** Surface discovered patterns between yesterday's activity and today's pain lag.
- **Structure:**
  - 1-card container with subtle tint border
  - Leading status dot or icon
  - Humanized takeaway: _"Gentle walk (+20m) yesterday correlated with 25% lower morning stiffness today."_
  - Action link: _"View trend chart"_

### 5. Floating Bottom Navigation Bar

- **Purpose:** Global navigation optimized for one-thumb reachability.
- **Tabs:**
  - `Today` (Daily glance & rapid check-in)
  - `Insights` (Correlation graphs & trends, plus the calendar)
  - `Settings` (Check-in time, your options, backup, account)
- **Layout:** spans the same column as the page content (max 480px, 16px side padding); tabs share the width equally. The active tab has a sage tint and a Bold Duotone icon.
- **iOS Safari rule:** the fixed wrapper is offset from the bottom with `bottom: max(1.6rem, env(safe-area-inset-bottom))`. A fixed box that touches the bottom edge makes iOS 26+ Safari clip the page above its toolbar and paint a solid strip. The same applies to sticky bars at the top (the Trends range pill, pinned 3.2rem down so it clears the blur): offset them with `top`, never padding inside a box that touches the edge, or Safari skips its scroll blur.

### 6. Rapid Check-in Floating / Fixed Action

- **Purpose:** Available on every screen for instant logging without multi-page transitions.
- **Structure:** Full-width 50px pill button or prominent floating trigger, sharing the nav's column width.

### 7. Backup Reminder

- **Structure:** `clay-tint` card, body text in `clay-text`; a solid sage "Back up now" button (the one affirmative action) and a `clay-text` "Remind me later" link. Offline banner and save-status warnings use the same `clay-tint` and `clay-text` pair.

### 8. Settings Controls

- **Your options tabs:** a row of chips that scrolls sideways when it doesn't fit (`ScrollTabs`). A fade on the edge that still has content hints at more chips. Same radio behaviour as the segmented control.
- **Check-in time:** a 48px oat pill drawn by the app (12-hour time and a clock icon); the native time input sits invisibly on top so a tap opens the device picker.
- **Account:** email form, then password form, a hairline divider, then the `quiet` Sign out button.

---

## 4. Buttons

- **Primary:** sage fill, white text. **Secondary:** sage outline. **Quiet:** no fill or outline, `clay-text`, for low-emphasis actions such as Sign out.
- All buttons are at least 48px high; full-width buttons are 50px.

---

## 5. Icons

- **Set:** Solar by 480 Design (CC BY 4.0), through the shared `Icon` component. Credit is in the README.
- **Weights:** Bold Duotone for the active nav tab; Line Duotone for other icons; plain Linear for check, plus and the calendar arrows so small marks stay crisp.
- **Stroke:** 2 for general icons, 1.5 (the Solar default) in the bottom nav.
- Icons are decorative (`aria-hidden`); a text label carries the meaning.

---

## 6. Layout Notes

- Pages start 16px below the safe-area top so iOS Safari's top blur doesn't soften the first line.
- Today's header and Settings share the same gap to the content below (the empty save-status line adds no space).
