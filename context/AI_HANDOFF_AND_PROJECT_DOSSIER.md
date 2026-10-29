# AI Hand-off & Project Dossier

**Project:** Personal Fibromyalgia Symptom, Activity & Pain Correlation Tracker  
**Date:** October 26, 2026  
**File ID in Paper:** `01M5T4C5F8G0A9JV85S3AZWEHE` ("Tracker" / "Neat island")  
**Primary Page ID:** `p-1-0`

---

## 1. Executive Summary & Core Objectives

- **Target User & Use Case:** Personal use by an individual tracking fibromyalgia (musculoskeletal pain, cognitive fibro fog, fatigue, morning stiffness, and physical pacing).
- **Core Value Proposition:** Low-friction, low-cognitive-load tracking designed specifically for days with high pain, brain fog, or photophobia. Discovers the **delayed pain lag** (typically ~18–24 hours) between physical exertion/activities and next-day flare-ups.
- **Cadence:** Two-stage daily check-in (Morning AM Baseline + Afternoon/Evening PM Reflection).
- **No Onboarding / Accounts:** Personal utility app — launches immediately into the Today Dashboard.

---

## 2. Design System: "Botanical Sanctuary"

- **Aesthetic Tone:** Gentle, organic, non-clinical, restorative. Avoids medical anxiety, clinical sterile white, and alarming high-saturation red alerts.
- **Typography Pairing:**
  - **Headings & Display:** `Young Serif` (Regular) — chunky, warm, distinctive, friendly character.
  - **Numerals, Metrics & Data:** `Plus Jakarta Sans` (Weight 800) — modern, clean, symmetrical numerals with zero eccentricities.
  - **Body, Subtitles & Buttons:** `Plus Jakarta Sans` (Weight 500–700) with generous line-height (`1.4–1.5`).
- **Color Palette & Design Tokens (Registered CSS Variables in Paper):**
  - `--color-canvas-bg`: `#FBF9F5` (Warm linen background)
  - `--color-surface-card`: `#FFFFFF` (Card fill)
  - `--color-surface-subtle`: `#F3EFEA` (Secondary background / unselected track)
  - `--color-border-subtle`: `#EBE5DC` (1px dividers and borders)
  - `--color-brand-sage`: `#2D5A46` (Primary accent, low pain 1–3, checkmarks)
  - `--color-sage-tint`: `#E8F2EC` (Active chip background, status tint)
  - `--color-accent-clay`: `#C47151` (Moderate warning, exertion strain, pain 4–6)
  - `--color-clay-tint`: `#FDF1ED` (Clay badge fill)
  - `--color-flare-plum`: `#8C3B4E` (High pain 7–10, flare alerts, gentle and distinct)
  - `--color-plum-tint`: `#FBECEF` (Flare tag background)
  - `--color-amber-pacing`: `#D97706` (Spoon capacity alert)
  - `--color-text-primary`: `#1E2220` (High-contrast dark espresso)
  - `--color-text-muted`: `#736B63` (Subtitles, units, inactive states)

---

## 3. Approved Core UI Components

1. **AM / PM Cadence Card (Connected Timeline - Variation 1):**
   - Vertical timeline linking the Morning AM Baseline (`✓ 8:15 AM`, `3/10 Pain`, starting capacity) to the Afternoon/Evening PM Reflection (`DUE` action node).
2. **Discrete Whole-Integer Pain Gauge (Channel Fill & Beads - Sub-variation 1A):**
   - 11 physical bead stops (whole numbers 0 to 10; strictly no decimals or halves).
   - Elevated 28px circular handle in brand sage showing the active integer.
   - Range labels: `0 None` • `Mild (1-4)` • `Mod (5-7)` • `Flare (8-10)`.
3. **Pacing & Energy Battery Card:**
   - 40px bold percentage readout (`65%`) + dual-tone progress bar reflecting spoon theory capacity.
4. **Tactile Pill Chips (Activities & Symptoms):**
   - 48px+ touch targets for joint stiffness. Active state with `✓` prefix in Sage or Clay; inactive with `+` in Warm Oat.
5. **Lag Curve / Correlation Card:**
   - Paired daily dual bars (Activity exertion mins in Sage vs. Next-day pain score in Clay/Plum) demonstrating the +18h lag.
6. **Global Bottom Navigation Bar:**
   - Floating pill nav with 4 tabs: `Today` (Home), `Log` (History), `Trends` (Analytics), and `Profile` (Settings).

---

## 4. Canvas Artboard Directory in Paper

The following artboards currently exist in Paper file `01M5T4C5F8G0A9JV85S3AZWEHE` (Page `p-1-0`):

- `NP-0`: **Screen 1 - Today Dashboard** (Includes header, AM/PM Cadence timeline, battery card, discovery banner, bottom nav)
- `NQ-0`: **Screen 2 - Rapid Check-in Sheet** (Modal check-in with 0–10 bead gauge, activity toggles, symptom toggles, 1-tap save)
- `NR-0`: **Screen 3 - Correlation Insights** (Time filters, correlation cards, discovery highlights, bottom nav)
- `ST-0`: **Lag Curve & Correlation Card Explorations** (Refined dual-bar chart and cause-effect row cards)
- `EB-0`: **Design System & Component Library** (Master component sheet)
- `GC-0`: **AM PM Card Explorations** (3 variations of AM/PM flow)
- `J9-0`: **Pain Gauge Explorations** (3 distinct gauge models)
- `LC-0`: **Stepped Pip Track Explorations** (3 bead track variations)
- `7F-0`: **Final Moodboard - Botanical Sanctuary (Young + Jakarta)**
- `4V-0` & `65-0`: **Font Explorations 1 & 2**

---

## 5. Next Steps for Incoming Model / Developer

1. **Extend Screen Flow:**
   - Create **Screen 4: Activity Log & Flare Calendar** (monthly heatmap with AM/PM split dots and chronological log).
   - Create dedicated **Screen 2A: Morning Baseline Check-in** (sleep quality, morning stiffness duration, waking pain, starting spoons).
2. **Interactive States & Edge Cases:**
   - High flare mode / Photophobia toggle (dimmer OLED night mode variant).
   - Doctor Summary Export view (PDF / table generation).
