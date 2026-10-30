/**
 * state.js - Single Source of Truth for Comparator Simulator
 * Holds all simulation parameters, live values, and subscription mechanism.
 */

export const state = {
  // Power & Rail Parameters
  vcc: 5.0,
  
  // Reference & Input Voltages
  vref: 2.5,
  vinManual: 1.0,
  vinMode: 'manual', // 'manual' | 'sine' | 'triangle' | 'ramp' | 'square'
  
  // Signal Generator Parameters
  amplitude: 2.0,
  offset: 2.5,
  frequency: 0.5,
  noise: 0.0, // in volts
  keepInRange: true,
  
  // Comparator Architecture & Physics
  mode: 'inverting', // 'inverting' | 'non-inverting'
  hysteresis: 0.0,   // H in volts (0 = disabled)
  realisticSaturation: false, // true = LM358 rails (0.05V to Vcc - 1.5V)
  
  // Simulation Clock & Runtime
  paused: false,
  time: 0.0,
  transitions: 0,
  
  // Instantaneous Live Signals
  vin: 1.0,
  vout: 5.0,
  logic: 1,       // 1 (HIGH) or 0 (LOW)
  prevLogic: 1,
  diff: -1.5,
  vupper: 2.5,
  vlower: 2.5,
  rule: 'Vin < Vref → HIGH',
  
  // Oscilloscope display preferences
  timeWindow: 8.0,
  showVin: true,
  showVref: true,
  showVout: true,
  showShading: true
};

const listeners = new Set();

/**
 * Subscribe a callback to be called when state changes.
 * @param {Function} fn - Callback function (receives state)
 * @returns {Function} Unsubscribe function
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Notify all subscribers of state updates
 */
export function notifySubscribers() {
  for (const fn of listeners) {
    fn(state);
  }
}

/**
 * Updates partial state and guarantees physical rail constraints
 * @param {Object} partial - Partial state object to merge
 */
export function updateState(partial) {
  Object.assign(state, partial);
  clampParameters();
  notifySubscribers();
}

/**
 * Clamps voltages to valid physical boundaries [0, VCC]
 */
export function clampParameters() {
  if (state.vcc < 3.0) state.vcc = 3.0;
  if (state.vcc > 15.0) state.vcc = 15.0;

  // Clamp Vref and VinManual to [0, VCC]
  state.vref = Math.max(0, Math.min(state.vcc, state.vref));
  state.vinManual = Math.max(0, Math.min(state.vcc, state.vinManual));
  
  // Offset clamp
  state.offset = Math.max(0, Math.min(state.vcc, state.offset));

  // Amplitude clamp if keepInRange is on
  if (state.keepInRange) {
    const maxA = Math.min(state.offset, state.vcc - state.offset);
    state.amplitude = Math.max(0.1, Math.min(maxA, state.amplitude));
  } else {
    state.amplitude = Math.max(0.1, Math.min(state.vcc / 2, state.amplitude));
  }

  // Hysteresis clamp
  state.hysteresis = Math.max(0, Math.min(state.vcc * 0.3, state.hysteresis));
  state.vupper = state.vref + state.hysteresis / 2;
  state.vlower = state.vref - state.hysteresis / 2;
}
