/**
 * main.js - Master Application Orchestrator & Animation Loop
 * Initializes state, circuit SVG view, oscilloscope canvas, and controls.
 * Drives single 60 FPS requestAnimationFrame loop with physics clamping.
 */

import { state, clampParameters } from './state.js';
import { getVin } from './signals.js';
import { compare } from './comparator.js';
import { CircuitView } from './circuitView.js';
import { Controls } from './controls.js';
import { Oscilloscope } from './scope.js';

class SimulatorApp {
  constructor() {
    // Initialize Subsystems
    this.circuitView = new CircuitView();
    this.controls = new Controls(state);
    this.scope = new Oscilloscope('scope-canvas', 'scope-container');

    // Cache Telemetry DOM Elements
    this.teleVin = document.getElementById('tele-vin');
    this.teleVinType = document.getElementById('tele-vin-type');
    this.teleVref = document.getElementById('tele-vref');
    this.teleDiff = document.getElementById('tele-diff');
    this.teleDiffDir = document.getElementById('tele-diff-dir');
    this.teleVout = document.getElementById('tele-vout');
    this.teleVoutDot = document.getElementById('tele-vout-dot');
    this.teleVoutRail = document.getElementById('tele-vout-rail');
    this.teleTransitions = document.getElementById('tele-transitions');
    this.teleLogicPill = document.getElementById('tele-logic-pill');
    this.teleRuleText = document.getElementById('tele-rule-text');

    // Loop timing & transition tracking
    this.lastTime = performance.now();
    this.telemetryCounter = 0;
    this.lastVinMode = state.vinMode;
    this.lastTimeVal = state.time;

    // Fill initial baseline trace for oscilloscope
    this.scope.fillBaseline(state);

    // Start Animation Loop
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  loop(now) {
    // Delta time calculation in seconds
    let dt = (now - this.lastTime) / 1000.0;
    this.lastTime = now;

    // Cap delta time to 100ms (prevents glitch when switching browser tabs)
    if (dt > 0.1) dt = 0.1;
    if (dt <= 0) dt = 0.001;

    // Advance clock if running
    if (!state.paused) {
      state.time += dt;
    }

    // Detect explicit time reset (e.g. Reset button clicked or preset reset)
    if (state.time < this.lastTimeVal - 0.1 || (state.time === 0 && this.lastTimeVal > 0.05)) {
      if (state.vinMode === 'manual') {
        this.scope.fillBaseline(state);
      } else {
        this.scope.clear();
      }
    }
    this.lastTimeVal = state.time;

    // 1. Calculate Instantaneous Input Voltage Vin
    const currentVin = getVin(state.time, state);
    state.vin = currentVin;

    // 2. Compute Comparator Decision and Output Voltage
    const result = compare(
      state.vin,
      state.vref,
      state.vcc,
      state.prevLogic,
      {
        mode: state.mode,
        hysteresis: state.hysteresis,
        realisticSaturation: state.realisticSaturation
      }
    );

    // 3. Track Logic Transitions
    if (result.logic !== state.prevLogic) {
      state.transitions++;
    }

    // 4. Update Current State
    state.vout = result.vout;
    state.logic = result.logic;
    state.prevLogic = result.logic;
    state.rule = result.rule;
    state.vupper = result.vupper;
    state.vlower = result.vlower;
    state.diff = state.vin - state.vref;

    // 5. Push Sample to Oscilloscope
    this.scope.addSample({
      t: state.time,
      vin: state.vin,
      vref: state.vref,
      vout: state.vout,
      vupper: state.vupper,
      vlower: state.vlower,
      logic: state.logic
    });

    // 6. Update Visual Views
    this.circuitView.update(state, dt);
    this.scope.draw(state);

    // 7. Update Telemetry Cards (throttled every 3 frames for DOM efficiency)
    this.telemetryCounter++;
    if (this.telemetryCounter % 3 === 0) {
      this.updateTelemetry();
    }

    // Continue 60 FPS Loop
    requestAnimationFrame(this.loop);
  }

  updateTelemetry() {
    this.teleVin.textContent = state.vin.toFixed(2);
    this.teleVinType.textContent = state.vinMode === 'manual' ? 'Manual Potentiometer' : `${state.vinMode.toUpperCase()} Generator`;

    this.teleVref.textContent = state.vref.toFixed(2);

    const diff = state.diff;
    this.teleDiff.textContent = (diff >= 0 ? '+' : '') + diff.toFixed(2);
    this.teleDiffDir.textContent = diff < 0 ? 'Vin is below threshold' : 'Vin is above threshold';

    this.teleVout.textContent = state.vout.toFixed(2);
    const isHigh = state.logic === 1;

    if (isHigh) {
      this.teleVoutDot.style.color = 'var(--high)';
      this.teleVoutRail.textContent = state.realisticSaturation ? 'Saturated: +VCC − 1.5V' : 'Saturated at +VCC (HIGH)';
      this.teleLogicPill.textContent = 'HIGH (1)';
      this.teleLogicPill.style.background = 'rgba(52, 211, 153, 0.2)';
      this.teleLogicPill.style.color = 'var(--high)';
    } else {
      this.teleVoutDot.style.color = 'var(--low)';
      this.teleVoutRail.textContent = state.realisticSaturation ? 'Saturated: 0.05V rail' : 'Saturated at GND (0V)';
      this.teleLogicPill.textContent = 'LOW (0)';
      this.teleLogicPill.style.background = 'rgba(251, 75, 110, 0.2)';
      this.teleLogicPill.style.color = 'var(--low)';
    }

    this.teleTransitions.textContent = String(state.transitions);
    this.teleRuleText.textContent = `Rule: ${state.rule}`;
  }
}

// Instantiate on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  new SimulatorApp();
});
