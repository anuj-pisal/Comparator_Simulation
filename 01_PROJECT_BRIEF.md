# Project Brief: Op-Amp Comparator Simulator

## Goal
Build a single-page web app that simulates an **inverting comparator** (op-amp, no feedback) and makes its behaviour visually obvious.

## Core behaviour (from the reference diagrams)
- Op-amp powered by **+VCC** and **GND**.
- **Vin** connects to the **inverting (−)** input.
- **Vref** connects to the **non-inverting (+)** input.
- Output rule:
  - `Vin < Vref`  → Output **HIGH** (≈ VCC), logic `1`
  - `Vin > Vref`  → Output **LOW**  (≈ GND), logic `0`

## Target user
A student learning comparators. They should understand the circuit in 10 seconds just by moving one slider.

## Success criteria
1. Moving the Vin slider instantly flips the output at exactly Vin = Vref.
2. The circuit diagram is animated: wires glow, the output LED lights, a state badge shows "Vin < Vref → HIGH" or "Vin > Vref → LOW".
3. A live oscilloscope shows Vin, Vref and Vout over time, so the user sees the square wave appear when Vin is a sine/triangle wave.
4. Looks polished: dark theme, neon accents, smooth 60 fps animation.
5. Runs by opening `index.html` (no build step, no backend).

## Out of scope
Real transistor-level op-amp modelling, SPICE accuracy, user accounts, backend.

## Files in this documentation set
| File | Purpose |
|---|---|
| 01_PROJECT_BRIEF.md | This file: what and why |
| 02_TECH_STACK_AND_STRUCTURE.md | Stack, folder layout, module responsibilities |
| 03_SIMULATION_SPEC.md | Logic, math, signals, modes |
| 04_UI_UX_DESIGN.md | Layout, colours, animation, visual details |
| 05_BUILD_PLAN_AND_TASKS.md | Step-by-step tasks with acceptance checks |
| 06_AGENT_RULES.md | Rules for the Antigravity agent |
