# ⚡ Op-Amp Comparator Lab

> **Understand an op-amp comparator in 10 seconds flat.**  
> A sleek, cyber-lab dashboard simulating an **open-loop op-amp comparator** in real-time with zero build steps, zero dependencies, and silky-smooth 60 FPS animations.

---

## 🎯 The 10-Second Core Rule

In an **inverting comparator**, the op-amp compares $V_{in}$ at $(-)$ against $V_{ref}$ at $(+)$:

```text
  Vin < Vref  ───►  Output HIGH (≈ +5V)  ───►  LED ON  🟢 (Logic 1)
  Vin > Vref  ───►  Output LOW  (≈  0V)  ───►  LED OFF 🔴 (Logic 0)
```

> **Try it:** Drag the **Vin** slider across **Vref (2.50V)**. The glowing wires flip, the op-amp flashes, and the LED instantly toggles!

---

## ✨ Highlights

- 🧪 **Live SVG Circuit Diagram**:
  - Glowing op-amp body and live voltage badges on every trace.
  - Animated charge particles flowing through wires in real time.
  - Interactive comparison mini-gauge showing live `<` and `>` relationships.
  - Terminal polarity indicator for **Inverting (−)** and **Non-Inverting (+)** modes.
- 📈 **Continuous 60 FPS Oscilloscope**:
  - CRT dark-grid styling with glowing traces: **Vin** (Cyan), **Vref** (Amber dashed), **Vout** (Green square wave).
  - **Full Signal Continuity**: Switch between signals on the fly — the previous waveform scrolls naturally to the left while the new waveform flows in seamlessly.
  - Cause-and-effect colored backgrounds linking input states to output logic levels.
- 🎛️ **Versatile Waveform Generator**:
  - **Manual Potentiometer**: Drag direct DC voltages.
  - **Function Generator**: Sine, Triangle, Sawtooth Ramp, and Square waves.
  - **Signal Noise Jitter**: Inject millivolt electrical noise to observe threshold sensitivity.
- 🔄 **Reliable Deterministic Reset**:
  - Reset timer and counters anytime with clean buffer re-initialization.

---

## 🚀 Quick Start (Zero Install)

No `npm install`, no build tools, no backend. Just pure **HTML5, CSS3, and ES Modules**:

```bash
# In the project directory:
python -m http.server 8080
```

Open **`http://localhost:8080`** in Chrome, Edge, Safari, or Firefox.

*(You can also double-click `index.html` directly in modern browsers).*

---

## 📂 Project Structure

```text
Comparator-Simulator/
├── index.html            # Main dashboard markup & inline SVG circuit
├── css/
│   ├── base.css          # Cyber-lab tokens, color roles & resets
│   ├── layout.css        # Responsive desktop grid & mobile layouts
│   └── components.css    # Custom glowing sliders, tabs & badges
├── js/
│   ├── main.js           # Master 60 FPS requestAnimationFrame loop
│   ├── state.js          # Central reactive simulation state
│   ├── signals.js        # Pure mathematical signal generators
│   ├── comparator.js     # Pure comparator decision engine
│   ├── circuitView.js    # Vector SVG updates, particles & animations
│   ├── scope.js          # Canvas 2D scrolling oscilloscope engine
│   └── controls.js       # UI event bindings & educational presets
├── test_logic.mjs        # Headless unit tests for physical logic
└── README.md
```

---

## 🧪 Testing

Run the automated headless test suite:

```bash
node test_logic.mjs
```

---

*Designed for electronics students, hobbyists, and educators.*
