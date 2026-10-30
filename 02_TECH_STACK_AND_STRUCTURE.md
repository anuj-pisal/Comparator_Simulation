# Tech Stack and Structure

## Decision
**Vanilla HTML + CSS + JavaScript (ES modules). No framework, no bundler.**

Why: the app is one screen with real-time drawing. Plain JS with SVG (circuit) and Canvas (oscilloscope) is the lightest, fastest, and easiest to debug. It opens by double-clicking `index.html` or via any static server.

## Rendering split
| Part | Tech | Reason |
|---|---|---|
| Circuit diagram (op-amp, wires, labels, LED) | **Inline SVG** | Crisp at any size, easy CSS/JS styling and glow filters |
| Oscilloscope (Vin, Vref, Vout traces) | **HTML Canvas 2D** | Fast scrolling waveform at 60 fps |
| Controls and readouts | HTML + CSS | Native sliders, buttons, accessibility |

## Folder layout
```
comparator-sim/
├── index.html
├── css/
│   ├── base.css          # reset, variables, typography
│   ├── layout.css        # grid, panels, responsive rules
│   └── components.css    # sliders, buttons, badges, LED
├── js/
│   ├── main.js           # bootstraps everything, animation loop
│   ├── state.js          # single source of truth (parameters + live values)
│   ├── signals.js        # waveform generators for Vin
│   ├── comparator.js     # pure comparator logic (with hysteresis)
│   ├── circuitView.js    # updates the SVG circuit each frame
│   ├── scope.js          # canvas oscilloscope
│   └── controls.js       # binds UI controls to state
└── README.md
```

## Module responsibilities
- **state.js**: exports a plain object `state` and a `subscribe(fn)` helper. Holds `vcc`, `vref`, `vinMode`, `vinManual`, `amplitude`, `offset`, `frequency`, `hysteresis`, `mode` (inverting/non-inverting), `paused`, `time`, and live `vin`, `vout`, `logic`.
- **signals.js**: `getVin(t, state)` returns the input voltage for the chosen source.
- **comparator.js**: `compare(vin, vref, vcc, prevLogic, state)` returns `{ vout, logic }`. Pure function, no DOM.
- **circuitView.js**: takes `state`, updates SVG classes, text, colours, particle positions.
- **scope.js**: keeps a ring buffer of samples, draws grid, traces, shaded regions, crossing markers.
- **controls.js**: wires sliders and buttons, writes to `state`.
- **main.js**: `requestAnimationFrame` loop: advance time, compute signals, call view updates.

## Constraints
- No external runtime dependencies. Google Fonts allowed (Inter + JetBrains Mono) with system-font fallback.
- No localStorage required.
- Must work in latest Chrome, Edge, Firefox, Safari, and on mobile widths down to 360 px.
