/**
 * comparator.js - Pure Comparator Physics & Logic Engine
 * Implements inverting/non-inverting logic, anti-flicker boundary handling,
 * Schmitt trigger dual-threshold hysteresis, and ideal vs realistic saturation rails.
 * 
 * PURE FUNCTION: Does not touch the DOM or window.
 */

/**
 * Computes instantaneous output state from inputs
 * 
 * @param {number} vin - Instantaneous input voltage (V)
 * @param {number} vref - Reference voltage (V)
 * @param {number} vcc - Positive power supply rail voltage (V)
 * @param {number} prevLogic - Previous logic level (0 or 1)
 * @param {Object} options - Configuration options (mode, hysteresis, realisticSaturation)
 * @returns {{ vout: number, logic: number, rule: string, vupper: number, vlower: number }}
 */
export function compare(vin, vref, vcc, prevLogic = 1, options = {}) {
  const mode = options.mode || 'inverting';
  const hysteresis = Math.max(0, options.hysteresis || 0);
  const realistic = !!options.realisticSaturation;

  const vupper = vref + hysteresis / 2;
  const vlower = vref - hysteresis / 2;

  let logic = prevLogic;

  if (mode === 'inverting') {
    // Inverting mode: Vin on (-), Vref on (+)
    if (hysteresis > 0.0001) {
      // Schmitt trigger hysteresis
      if (prevLogic === 1) {
        // Output currently HIGH -> only drops LOW when Vin exceeds upper threshold
        if (vin > vupper) {
          logic = 0;
        }
      } else {
        // Output currently LOW -> only jumps HIGH when Vin drops below lower threshold
        if (vin < vlower) {
          logic = 1;
        }
      }
    } else {
      // Standard comparator without hysteresis
      if (vin < vref) {
        logic = 1; // HIGH
      } else if (vin > vref) {
        logic = 0; // LOW
      } else {
        logic = prevLogic; // Equal boundary: preserve previous state to prevent flicker
      }
    }
  } else {
    // Non-inverting mode: Vin on (+), Vref on (-)
    if (hysteresis > 0.0001) {
      if (prevLogic === 1) {
        // Output currently HIGH -> drops LOW when Vin falls below lower threshold
        if (vin < vlower) {
          logic = 0;
        }
      } else {
        // Output currently LOW -> jumps HIGH when Vin exceeds upper threshold
        if (vin > vupper) {
          logic = 1;
        }
      }
    } else {
      if (vin > vref) {
        logic = 1; // HIGH
      } else if (vin < vref) {
        logic = 0; // LOW
      } else {
        logic = prevLogic;
      }
    }
  }

  // Calculate actual output voltage Vout based on saturation model
  let vout;
  if (!realistic) {
    // Ideal Op-Amp: full rail-to-rail swing
    vout = logic === 1 ? vcc : 0.0;
  } else {
    // Realistic saturation: LM358-like drop (~1.5V drop from +VCC, ~0.05V above GND)
    vout = logic === 1 ? Math.max(0.05, vcc - 1.5) : 0.05;
  }

  // Produce descriptive rule string
  let rule;
  if (mode === 'inverting') {
    rule = logic === 1 ? 'Vin < Vref → HIGH' : 'Vin > Vref → LOW';
  } else {
    rule = logic === 1 ? 'Vin > Vref → HIGH' : 'Vin < Vref → LOW';
  }

  return {
    vout,
    logic,
    rule,
    vupper,
    vlower
  };
}
