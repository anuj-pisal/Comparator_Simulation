# Simulation Specification

## Units and ranges
| Parameter | Default | Range | Step |
|---|---|---|---|
| VCC (supply) | 5 V | 3 – 15 V | 0.1 |
| Vref | 2.5 V | 0 – VCC | 0.05 |
| Vin (manual) | 1.0 V | 0 – VCC | 0.01 |
| Amplitude (signal modes) | 2 V | 0 – VCC/2 | 0.05 |
| Offset (signal modes) | VCC/2 | 0 – VCC | 0.05 |
| Frequency | 0.5 Hz | 0.1 – 5 Hz | 0.1 |
| Hysteresis width | 0 V (off) | 0 – 1 V | 0.05 |

Clamp Vref, Vin, offset to `[0, VCC]` whenever VCC changes. Amplitude clamps so the waveform stays inside the rails when "Keep in range" is on (default on).

## Vin sources (selector)
1. **Manual**: Vin = slider value (the main learning mode, default).
2. **Sine**: `offset + A·sin(2π f t)`
3. **Triangle**: linear ramp up/down between `offset ± A`
4. **Ramp (sawtooth)**: rises from `offset − A` to `offset + A`, then resets
5. **Square**: alternates `offset ± A`

Time `t` advances in real seconds via the animation loop (use `performance.now()` delta; pause freezes `t`).

## Comparator logic

### Inverting mode (default, matches the images)
```
if Vin < Vref  → Vout = VCC  (HIGH, logic 1)
if Vin > Vref  → Vout = 0    (LOW,  logic 0)
```
Vin connects to (−), Vref to (+).

### Non-inverting mode (toggle, bonus)
Swap roles: Vin to (+), Vref to (−).
```
if Vin > Vref  → HIGH
if Vin < Vref  → LOW
```

### Exactly equal
When `Vin === Vref` keep the previous logic state (avoids flicker).

### Hysteresis (Schmitt trigger option)
When `hysteresis = H > 0`, use two thresholds around Vref:
- `V_upper = Vref + H/2`, `V_lower = Vref − H/2`

Inverting mode:
- If current output is HIGH, switch LOW only when `Vin > V_upper`.
- If current output is LOW, switch HIGH only when `Vin < V_lower`.

Non-inverting mode: mirror the logic. The scope and circuit view must draw the two thresholds as dashed lines so the effect is visible.

### Output voltage
Ideal mode: HIGH = VCC, LOW = 0 V.
Optional "Realistic saturation" toggle: HIGH = VCC − 1.5 V, LOW = 0.05 V (typical LM358-like rail loss). Default off.

### Smooth transition
Logic changes instantly. For display only, animate the displayed output voltage with a very fast ease (about 40 ms) so the edge looks slick, but the scope still records a sharp edge.

## Derived readouts (update every frame)
- `Vin`, `Vref`, `Vout` in volts, 2 decimals
- `Vin − Vref` (differential voltage)
- Logic level (`1` / `0`) and text state: **HIGH** / **LOW**
- Rule text: `Vin < Vref → HIGH` or `Vin > Vref → LOW`
- Number of output transitions since start (counter) and reset button

## Scope sampling
- Sample every frame; keep a ring buffer for the last **8 seconds** (adjustable 2 – 20 s "time window").
- Each sample stores `t, vin, vref, vout, vupper, vlower`.
- Mark each crossing instant with a vertical flash line and small dot on the Vin trace.

## Edge cases
- VCC change while running: re-clamp values, rescale scope Y axis to `[0, VCC]` with 10 % headroom.
- Tab hidden: cap frame delta to 100 ms so the waveform doesn't jump.
- Pause: freeze `t`, keep rendering, allow manual slider moves to update readouts and circuit.
