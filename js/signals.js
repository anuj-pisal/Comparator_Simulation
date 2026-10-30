/**
 * signals.js - Pure Waveform Generator for Comparator Simulator
 * Computes instantaneous input voltage Vin(t) without touching DOM or side effects.
 */

/**
 * Calculates instantaneous Vin voltage for time t
 * @param {number} t - Time in seconds
 * @param {Object} state - Current simulation state
 * @returns {number} Clamped instantaneous Vin in volts
 */
export function getVin(t, state) {
  let v = 0;
  const A = state.amplitude;
  const off = state.offset;
  const f = state.frequency;

  switch (state.vinMode) {
    case 'manual':
      v = state.vinManual;
      break;

    case 'sine':
      // v(t) = offset + A * sin(2*pi*f*t)
      v = off + A * Math.sin(2 * Math.PI * f * t);
      break;

    case 'triangle': {
      // Linear ramp up/down between offset ± A
      // Period T = 1/f
      const phase = ((t * f) % 1 + 1) % 1; // [0, 1)
      let normalized;
      if (phase < 0.5) {
        // Rises from -1 to +1
        normalized = -1 + 4 * phase;
      } else {
        // Falls from +1 to -1
        normalized = 3 - 4 * phase;
      }
      v = off + A * normalized;
      break;
    }

    case 'ramp': {
      // Sawtooth waveform: rises from offset - A to offset + A
      const phase = ((t * f) % 1 + 1) % 1;
      const normalized = -1 + 2 * phase;
      v = off + A * normalized;
      break;
    }

    case 'square': {
      // 50% duty cycle square wave alternating offset ± A
      const phase = ((t * f) % 1 + 1) % 1;
      v = phase < 0.5 ? (off + A) : (off - A);
      break;
    }

    default:
      v = state.vinManual;
  }

  // Inject signal noise if configured (simulates real physical noise / jitter)
  if (state.noise > 0) {
    const jitter = (Math.random() - 0.5) * 2 * state.noise;
    v += jitter;
  }

  // Clamp within power supply rails [0, VCC]
  return Math.max(0, Math.min(state.vcc, v));
}
