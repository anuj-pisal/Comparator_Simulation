# UI / UX Design Specification

Goal: **visually stunning and instantly clear.** Think "modern electronics lab dashboard": dark, glowing, precise.

## Layout (desktop ≥ 1100 px)
```
┌────────────────────────────────────────────────────────────┐
│ Header: "Comparator Lab"  · mode toggle · pause/reset      │
├───────────────────────────────┬────────────────────────────┤
│                               │  Control panel             │
│   CIRCUIT VIEW (SVG, large)   │  - Vin source tabs         │
│   op-amp, wires, VCC, GND,    │  - Vin / amp / offset /    │
│   output LED, state badge     │    frequency sliders       │
│                               │  - Vref slider             │
│                               │  - VCC slider              │
│                               │  - Hysteresis, realism     │
├───────────────────────────────┴────────────────────────────┤
│   OSCILLOSCOPE (canvas, full width)                        │
│   Vin (cyan) · Vref (amber dashed) · Vout (magenta/green)  │
├────────────────────────────────────────────────────────────┤
│   Readout cards: Vin | Vref | Vout | Vin−Vref | Transitions│
└────────────────────────────────────────────────────────────┘
```
Tablet/mobile: stack vertically: circuit, readouts, scope, controls. Sliders get large touch targets (min 44 px).

## Visual language
- **Background**: deep navy/near-black `#070b14` with a very subtle radial gradient and faint dot grid.
- **Panels**: glassmorphism cards, `rgba(255,255,255,0.04)` fill, 1 px border `rgba(255,255,255,0.08)`, radius 16 px, soft shadow.
- **Colour roles** (CSS variables):
  - `--vin`: cyan `#22d3ee`
  - `--vref`: amber `#fbbf24`
  - `--high`: neon green `#34d399`
  - `--low`: hot red/magenta `#fb4b6e`
  - `--vcc`: orange `#fb923c`
  - `--gnd`: slate `#94a3b8`
  - `--text`: `#e5e9f0`, muted `#8b95a7`
- **Fonts**: Inter for UI, JetBrains Mono for numbers and labels.
- Colour is never the only signal: always pair with text (HIGH/LOW) and icons/shapes.

## Circuit view (SVG) details
Redraw the reference diagram in a clean, modern style:
- Large triangle op-amp centered, outline glows with the current state colour (green when HIGH, red when LOW), with an SVG blur glow filter.
- **(−)** input at top-left connected to **Vin** wire (cyan). **(+)** input at bottom-left connected to **Vref** wire (amber).
- **+VCC** pin on top (orange), **GND** pin on bottom (slate).
- Output wire to the right ending in a node and an **output LED** that lights green (HIGH) or dims red (LOW), with a glow bloom when on.
- Voltage labels floating on each wire with live values, e.g. `Vin 1.20 V`.
- **Animated signal flow**: small dots (particles) travelling along the wires. Speed and brightness scale with voltage. Output wire particles flow only when HIGH.
- **State badge** near the output: big pill reading `Vin < Vref → HIGH` or `Vin > Vref → LOW`, colour matched. On change, it does a quick scale "pop".
- **Comparison mini-gauge**: two vertical bars (Vin cyan, Vref amber) beside the inputs; the bar that is higher is visually obvious, with a small ">" or "<" symbol between them that flips live.
- Mini output pulse graphic (like the red square pulse in the reference): a small `1` / `0` logic icon that moves between high and low positions.
- Moment of crossing: a brief ripple ring expands from the op-amp and the triangle flashes.

## Oscilloscope details
- Canvas with CRT-lab styling: dark grid, minor/major lines, voltage labels on the Y axis (0 to VCC), time labels on X axis.
- Traces: Vin solid cyan with glow, Vref dashed amber, Vout solid green/magenta with glow. Optional hysteresis band drawn as translucent amber strip.
- **Shaded regions**: where `Vin < Vref` shade faint green, where `Vin > Vref` faint red, linking cause and effect.
- Vertical flash line at every crossing.
- Legend with toggle checkboxes for each trace.
- Retina-aware (scale by `devicePixelRatio`), resize with the container.

## Controls
- Vin source: segmented control (Manual · Sine · Triangle · Ramp · Square).
- Sliders: custom-styled, gradient track with filled portion, glowing thumb, numeric value on the right. Keyboard accessible (arrow keys).
- Mode toggle: Inverting / Non-inverting, with the SVG swapping which input the wires go to (animated swap).
- Buttons: Pause/Play, Reset counters, Presets dropdown ("Zero-crossing detector", "Light sensor threshold", "Noisy signal + hysteresis").
- When source is not Manual, the Vin manual slider is disabled and dimmed.

## Motion rules
- Use CSS transitions 150 to 250 ms for colour/scale changes.
- Respect `prefers-reduced-motion`: disable particles, ripples, and pops; keep the clear state text.
- Keep animation at 60 fps; avoid layout thrash (update SVG attributes, not DOM structure, per frame).

## Accessibility
- Labels on all controls, `aria-live="polite"` on the state badge, sufficient contrast (WCAG AA), visible focus rings.

## Onboarding hint
First load shows a small dismissible tooltip pointing to the Vin slider: "Drag me past Vref and watch the output flip."
