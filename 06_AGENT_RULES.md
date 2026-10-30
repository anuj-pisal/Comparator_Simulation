# Agent Rules (for Antigravity)

Read all files `01` to `05` before writing code. Treat them as the source of truth.

## Process
1. Start by posting a short plan, then implement phase by phase as in `05_BUILD_PLAN_AND_TASKS.md`.
2. After each phase, run the app in the browser, test it, and report what you verified (a screenshot of the circuit and scope after Phase 3 and Phase 5 is ideal).
3. If something in the docs is ambiguous, pick the simplest sensible option and note the assumption in `README.md`. Do not stall.

## Code rules
- Vanilla JS ES modules. No frameworks, no bundlers, no npm dependencies.
- Keep logic pure and separate from DOM code: `comparator.js` and `signals.js` must not touch the DOM.
- One `requestAnimationFrame` loop in `main.js`. Never create extra timers for rendering.
- Update existing SVG elements per frame; do not rebuild the SVG every frame.
- Use CSS variables for every colour. No hard-coded colours in JS except via reading CSS variables.
- Small, well-named functions with brief comments explaining the electronics, not the syntax.

## Correctness rules (do not violate)
- Inverting mode: `Vin < Vref → HIGH`, `Vin > Vref → LOW`. Vin on (−), Vref on (+).
- Never show an output voltage outside `[0, VCC]`.
- Labels on the diagram must always match the current mode (swap when non-inverting).

## Quality bar
- Visual polish is a priority: it must look like a premium product, not a classroom demo.
- No console errors, no layout overflow, no flicker at the threshold.
- Test with VCC at both extremes, Vref at 0 and VCC, and amplitude 0.

## Deliverable
A runnable folder `comparator-sim/` that works by opening `index.html` or running `python -m http.server`.
