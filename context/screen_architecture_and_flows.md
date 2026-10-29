# Screen Architecture & Interaction Flow (Updated: Morning & Evening Check-ins)

```mermaid
flowchart TD
    subgraph S1["Screen 1: Today's Dashboard (Dynamic Context)"]
        A1["Date & Time Context Banner (Morning / Evening Mode)"]
        A2["Check-in Status Bar (Morning Check-in vs Evening Log)"]
        A3["Energy & Pacing Battery Card"]
        A4["Activity & Lag Correlation Insight Card"]
        A5["Sticky Bottom Action: Contextual Check-in Trigger"]
    end

    subgraph S2A["Screen 2A: Morning Baseline Check-in"]
        B1["Sleep Quality & Restfulness (Restored / Disturbed)"]
        B2["Morning Stiffness & Waking Pain (0–10 Gauge)"]
        B3["Initial Energy / Capacity Score ('Starting Spoons')"]
        B4["1-Tap Save Baseline"]
    end

    subgraph S2B["Screen 2B: Afternoon / Evening Reflection Check-in"]
        C1["Day's Exertion & Movement Log (Walk, Stretches, Chores, Rest)"]
        C2["Current Pain & Flare Status (0–10 Gauge)"]
        C3["Fibro Fog & Cognitive Clarity (Clear, Mild, Heavy)"]
        C4["Evening Pacing Reflection ('Battery Burn' Score)"]
        C5["1-Tap Save Evening Summary"]
    end

    subgraph S3["Screen 3: Correlation & Trends Engine"]
        D1["Morning Baseline vs Evening Exertion Impact Curve"]
        D2["Activity ↔ Next-Day Flare Lag Analysis"]
        D3["Weekly Flare & Recovery Distribution"]
    end

    subgraph S4["Screen 4: Activity Log & Flare Calendar"]
        E1["Monthly Calendar with AM/PM Split Badges"]
        E2["Chronological Entry History"]
    end

    S1 -- "Morning (AM)" --> S2A
    S1 -- "Afternoon / Evening (PM)" --> S2B
    S2A -- "Saved" --> S1
    S2B -- "Saved" --> S1
    S1 -- "Tap Trends" --> S3
    S1 -- "Tap Calendar" --> S4
```

---

## Two-Stage Daily Cadence

1. **Morning Baseline Check-in (AM)**
   - **Focus:** Capturing how the body woke up before exertion begins.
   - **Key Inputs:** Sleep quality (restful vs. unrestorative), morning stiffness duration, waking pain score (0–10), and starting energy battery level.
   - **Time to Complete:** ~3–5 seconds.

2. **Afternoon / Evening Reflection Check-in (PM)**
   - **Focus:** Logging physical activities completed, symptom spikes, and pacing toll.
   - **Key Inputs:** Movement activities (walking, mobility, chores, heat therapy), end-of-day pain score (0–10), fibro fog level, and remaining energy battery.
   - **Correlation Value:** Directly matches today's PM exertion against tomorrow's AM baseline to calculate the fibromyalgia pain lag pattern.

---

## Screen Component Inventory

| Screen                    | Core Components Employed                                                       | Primary Goal                                           |
| :------------------------ | :----------------------------------------------------------------------------- | :----------------------------------------------------- |
| **Today's Dashboard**     | AM/PM Dual-Status Indicator, Energy Battery, Insight Banner, Sticky Bottom Bar | Glanceable status under 3 seconds                      |
| **Morning Check-in (AM)** | Sleep Quality Pill, 0–10 Waking Pain Gauge, Starting Spoons Selector           | Establish waking baseline in <5s                       |
| **Evening Check-in (PM)** | 0–10 End-of-Day Pain Gauge, Activity Chips, Fog Severity Toggles               | Log exertion & symptom response in <5s                 |
| **Correlation & Trends**  | Dual-line AM/PM Trend Curve, Lag Discovery Cards                               | Identify how PM activity affects next-day AM stiffness |
| **Log & Calendar**        | Split AM/PM Day Dots on Calendar, Chronological Entries                        | Historical tracking & doctor reporting                 |
