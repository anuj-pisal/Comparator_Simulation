# Build Plan and Tasks

Work through the phases in order. After each phase, run the app and verify the acceptance checks before moving on.

## Phase 1: Skeleton
- [ ] Create folder structure from `02_TECH_STACK_AND_STRUCTURE.md`.
- [ ] `index.html` with header, circuit container, control panel, scope canvas, readouts, linked CSS and `<script type="module" src="js/main.js">`.
- [ ] CSS variables, dark theme, grid layout, responsive breakpoints.
- **Check:** page loads with styled empty panels, no console errors.

## Phase 2: State and logic
- [ ] `state.js` with defaults from the spec and `subscribe`.
- [ ] `comparator.js` pure function incl. hysteresis, inverting/non-inverting, realistic saturation.
- [ ] `signals.js` for all 5 Vin sources.
- [ ] Small self-test in the console (or `tests.html`) covering: `Vin<Vref → HIGH`, `Vin>Vref → LOW`, equal keeps previous, hysteresis behaves, non-inverting is the mirror.
- **Check:** all tests pass.

## Phase 3: Circuit view
- [ ] Build SVG: op-amp, pins, wires, labels, LED, badge, mini gauge, logic pulse icon.
- [ ] `circuitView.js` updates colours, text, LED, badge, gauge each frame.
- [ ] Particle animation along wires (SVG `<circle>` with positions computed from path length).
- [ ] Crossing ripple + badge pop.
- **Check:** with the manual slider, output flips exactly at Vin = Vref and matches the reference images (Vin<Vref → HIGH, Vin>Vref → LOW).

## Phase 4: Controls
- [ ] `controls.js`: all sliders, source selector, mode toggle, hysteresis, realism, pause/reset.
- [ ] Custom slider styling with filled track and live value.
- [ ] Disable irrelevant controls per source mode.
- **Check:** every control changes the simulation immediately; no stale values after changing VCC.

## Phase 5: Oscilloscope
- [ ] `scope.js` ring buffer, grid, traces, dashed Vref, shaded regions, crossing flashes, hysteresis band.
- [ ] HiDPI + resize handling, trace toggles, time window selector.
- **Check:** sine input produces a clean square wave at the output, edges aligned with Vin/Vref crossings.

## Phase 6: Polish
- [ ] Glow filters, glassmorphism, micro-animations, onboarding tooltip.
- [ ] Presets (Zero-crossing detector: Vref ≈ VCC/2 sine around it; Light sensor: manual slider with label "LDR voltage"; Noisy signal: sine + noise with hysteresis on).
- [ ] Reduced-motion support, accessibility pass, mobile layout.
- [ ] Add optional noise slider (adds random jitter to Vin) to show why hysteresis matters.
- **Check:** looks good at 1920×1080, 1366×768, and 390×844; Lighthouse accessibility ≥ 90.

## Phase 7: Docs
- [ ] `README.md` with how to run, controls explanation, and a short "what is a comparator" section.
- [ ] Short in-app "?" info modal explaining the inverting comparator rule.

## Definition of done
All acceptance checks pass, no console errors or warnings, 60 fps on a mid-range laptop, and the output behaviour matches the two reference images exactly.
