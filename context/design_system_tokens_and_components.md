# Design System & Component Library: Botanical Sanctuary

> **Context & Goal:** Personal Fibromyalgia Symptom, Pain & Activity Correlation Tracker.
> **Core Focus:** Low cognitive load, photophobia-friendly, rapid 1-tap logging during flares and brain fog.

---

## 1. Expanded Color Foundation

Building on the approved **Botanical Sanctuary** palette, here are functional roles and extended tints:

| Token Name       | Hex Code  | Role & Usage                                                |
| :--------------- | :-------- | :---------------------------------------------------------- |
| `canvas-bg`      | `#FBF9F5` | Primary app ground (warm unbleached linen)                  |
| `surface-card`   | `#FFFFFF` | Primary card / container fill                               |
| `surface-subtle` | `#F3EFEA` | Secondary container, inactive chips, unselected track       |
| `border-subtle`  | `#EBE5DC` | 1px card boundaries and structural dividers                 |
| `brand-sage`     | `#2D5A46` | Primary brand accent, low pain (1–3), active checkmarks     |
| `sage-tint`      | `#E8F2EC` | Light badge background, pacing balance status               |
| `accent-clay`    | `#C47151` | Moderate warning, exertion strain, moderate pain (4–6)      |
| `clay-tint`      | `#FDF1ED` | Mild warning chips and exertion highlights                  |
| `flare-plum`     | `#8C3B4E` | High pain (7–10) and flare indicator (gentle, non-alarming) |
| `plum-tint`      | `#FBECEF` | Flare banner / high-pain chip fill                          |
| `amber-pacing`   | `#D97706` | Spoon capacity alert, rest reminder                         |
| `text-primary`   | `#1E2220` | High-contrast espresso for headlines, labels, metrics       |
| `text-muted`     | `#736B63` | Subtitles, timestamps, unit labels, inactive icons          |

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
- **States:**
  - **Active:** Sage or Clay fill with `✓` prefix and bold text
  - **Inactive:** Oat fill (`#F3EFEA`) with `+` prefix and muted text

### 4. Correlation Insight Banner (Activity ↔ Symptom Link)

- **Purpose:** Surface discovered patterns between yesterday's activity and today's pain lag.
- **Structure:**
  - 1-card container with subtle tint border
  - Leading status dot or icon
  - Humanized takeaway: _"Gentle walk (+20m) yesterday correlated with 25% lower morning stiffness today."_
  - Action link: _"View trend chart"_

### 5. Sticky Bottom Navigation Bar

- **Purpose:** Global navigation optimized for one-thumb reachability.
- **Tabs:**
  - `Today` (Daily glance & rapid check-in)
  - `Log` (History & timeline)
  - `Insights` (Correlation graphs & trends)
  - `Settings` (Sensors & custom symptoms)

### 6. Rapid Check-in Floating / Fixed Action

- **Purpose:** Available on every screen for instant logging without multi-page transitions.
- **Structure:** Full-width 50px pill button or prominent floating trigger.
