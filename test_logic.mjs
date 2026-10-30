import { compare } from './js/comparator.js';
import { getVin } from './js/signals.js';

console.log('--- Running Comparator Logic Unit Tests ---');

function assert(cond, name) {
  if (!cond) {
    console.error(`FAIL: ${name}`);
    process.exit(1);
  } else {
    console.log(`PASS: ${name}`);
  }
}

// 1. Inverting mode without hysteresis
let res1 = compare(1.0, 2.5, 5.0, 0, { mode: 'inverting', hysteresis: 0 });
assert(res1.logic === 1 && res1.vout === 5.0, 'Inverting: Vin < Vref -> HIGH (1), Vout = 5.0V');

let res2 = compare(3.0, 2.5, 5.0, 1, { mode: 'inverting', hysteresis: 0 });
assert(res2.logic === 0 && res2.vout === 0.0, 'Inverting: Vin > Vref -> LOW (0), Vout = 0.0V');

let res3 = compare(2.5, 2.5, 5.0, 1, { mode: 'inverting', hysteresis: 0 });
assert(res3.logic === 1, 'Inverting: Vin == Vref preserves previous logic 1');

let res4 = compare(2.5, 2.5, 5.0, 0, { mode: 'inverting', hysteresis: 0 });
assert(res4.logic === 0, 'Inverting: Vin == Vref preserves previous logic 0');

// 2. Realistic saturation
let res5 = compare(1.0, 2.5, 5.0, 0, { mode: 'inverting', hysteresis: 0, realisticSaturation: true });
assert(res5.vout === 3.5, 'Realistic Saturation HIGH: 5.0 - 1.5 = 3.5V');
let res6 = compare(3.0, 2.5, 5.0, 1, { mode: 'inverting', hysteresis: 0, realisticSaturation: true });
assert(res6.vout === 0.05, 'Realistic Saturation LOW: 0.05V');

// 3. Hysteresis (Vref = 2.5, H = 1.0 => Vlower = 2.0, Vupper = 3.0)
const hOpts = { mode: 'inverting', hysteresis: 1.0 };
// Currently HIGH (prev = 1): Vin rising through 2.6V should still stay HIGH
let h1 = compare(2.6, 2.5, 5.0, 1, hOpts);
assert(h1.logic === 1, 'Hysteresis: Rising through Vref (2.6V < 3.0V) stays HIGH');
// Vin crosses Vupper (3.1V): flips to LOW
let h2 = compare(3.1, 2.5, 5.0, 1, hOpts);
assert(h2.logic === 0, 'Hysteresis: Vin > Vupper (3.1V > 3.0V) flips to LOW');
// Currently LOW (prev = 0): Vin falling through 2.4V should stay LOW
let h3 = compare(2.4, 2.5, 5.0, 0, hOpts);
assert(h3.logic === 0, 'Hysteresis: Falling through Vref (2.4V > 2.0V) stays LOW');
// Vin crosses Vlower (1.9V): flips to HIGH
let h4 = compare(1.9, 2.5, 5.0, 0, hOpts);
assert(h4.logic === 1, 'Hysteresis: Vin < Vlower (1.9V < 2.0V) flips to HIGH');

// 4. Non-inverting mode
let ni1 = compare(3.0, 2.5, 5.0, 0, { mode: 'non-inverting', hysteresis: 0 });
assert(ni1.logic === 1, 'Non-inverting: Vin > Vref -> HIGH (1)');
let ni2 = compare(1.0, 2.5, 5.0, 1, { mode: 'non-inverting', hysteresis: 0 });
assert(ni2.logic === 0, 'Non-inverting: Vin < Vref -> LOW (0)');

// 5. Signals test
const testState = {
  vinMode: 'sine',
  amplitude: 2.0,
  offset: 2.5,
  frequency: 1.0,
  noise: 0,
  vcc: 5.0
};
let s0 = getVin(0.0, testState); // sin(0) = 0 -> 2.5
assert(Math.abs(s0 - 2.5) < 1e-4, 'Signals: Sine at t=0 gives offset (2.5V)');
let sQuarter = getVin(0.25, testState); // sin(pi/2) = 1 -> 4.5
assert(Math.abs(sQuarter - 4.5) < 1e-4, 'Signals: Sine peak at t=0.25 gives 4.5V');

console.log('ALL UNIT TESTS PASSED SUCCESSFULLY! ✅');
