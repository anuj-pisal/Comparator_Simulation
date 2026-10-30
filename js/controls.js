/**
 * controls.js - User Interface Controller & Event Bindings
 * Connects sliders, buttons, segmented tabs, and presets to the simulation state.
 */

import { updateState, clampParameters } from './state.js';

export class Controls {
  constructor(state) {
    this.state = state;
    this.initDOMElements();
    this.bindEvents();
    this.syncAllInputs();
  }

  initDOMElements() {
    // Mode & Actions
    this.modeToggle = document.getElementById('mode-toggle');
    this.modeText = document.getElementById('mode-text');
    this.btnPause = document.getElementById('btn-pause');
    this.iconPause = document.getElementById('icon-pause');
    this.textPause = document.getElementById('text-pause');
    this.btnReset = document.getElementById('btn-reset');
    this.presetSelect = document.getElementById('preset-select');

    // Onboarding & Modal
    this.onboardingBanner = document.getElementById('onboarding-banner');
    this.btnDismissBanner = document.getElementById('btn-dismiss-banner');
    this.btnInfo = document.getElementById('btn-info');
    this.btnSubCloseModal = document.getElementById('btn-close-modal');
    this.infoModal = document.getElementById('info-modal');

    // Source Tabs & Containers
    this.sourceTabs = document.querySelectorAll('#vin-source-tabs .segment-btn');
    this.currentModeTag = document.getElementById('current-mode-tag');
    this.groupVinManual = document.getElementById('group-vin-manual');
    this.waveformControls = document.getElementById('waveform-controls');

    // Sliders & Value Readouts
    this.sliderVin = document.getElementById('slider-vin');
    this.valVin = document.getElementById('val-vin');

    this.sliderVref = document.getElementById('slider-vref');
    this.valVref = document.getElementById('val-vref');

    this.sliderAmp = document.getElementById('slider-amp');
    this.valAmp = document.getElementById('val-amp');

    this.sliderOffset = document.getElementById('slider-offset');
    this.valOffset = document.getElementById('val-offset');

    this.sliderFreq = document.getElementById('slider-freq');
    this.valFreq = document.getElementById('val-freq');

    this.sliderNoise = document.getElementById('slider-noise');
    this.valNoise = document.getElementById('val-noise');

    // Oscilloscope Header Controls
    this.scopeWindowSelect = document.getElementById('scope-window-select');
    this.traceVinToggle = document.getElementById('trace-vin-toggle');
    this.traceVrefToggle = document.getElementById('trace-vref-toggle');
    this.traceVoutToggle = document.getElementById('trace-vout-toggle');
    this.traceShadeToggle = document.getElementById('trace-shade-toggle');
  }

  bindEvents() {
    // Mode Toggle (Inverting vs Non-Inverting)
    this.modeToggle.addEventListener('change', (e) => {
      const mode = e.target.checked ? 'non-inverting' : 'inverting';
      this.modeText.textContent = e.target.checked ? 'Non-Inverting (+)' : 'Inverting (−)';
      this.modeText.style.color = e.target.checked ? 'var(--vref)' : 'var(--accent)';
      updateState({ mode });
    });

    // Pause / Resume
    this.btnPause.addEventListener('click', () => {
      const paused = !this.state.paused;
      this.updatePauseButtonUI(paused);
      updateState({ paused });
    });

    // Reset Counters
    this.btnReset.addEventListener('click', () => {
      updateState({ transitions: 0, time: 0 });
    });

    // Source Tabs (Manual, Sine, Triangle, Ramp, Square)
    this.sourceTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const source = tab.dataset.source;
        this.selectSource(source);
      });
    });

    // Vin Manual Slider
    this.sliderVin.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.valVin.textContent = `${val.toFixed(2)} V`;
      updateState({ vinManual: val });
    });

    // Vref Slider
    this.sliderVref.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.valVref.textContent = `${val.toFixed(2)} V`;
      updateState({ vref: val });
    });

    // Amplitude Slider
    this.sliderAmp.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.valAmp.textContent = `${val.toFixed(2)} V`;
      updateState({ amplitude: val });
    });

    // Offset Slider
    this.sliderOffset.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.valOffset.textContent = `${val.toFixed(2)} V`;
      updateState({ offset: val });
    });

    // Frequency Slider
    this.sliderFreq.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.valFreq.textContent = `${val.toFixed(1)} Hz`;
      updateState({ frequency: val });
    });

    // Noise Slider
    this.sliderNoise.addEventListener('input', (e) => {
      const mV = parseInt(e.target.value, 10);
      this.valNoise.textContent = `${mV} mV`;
      updateState({ noise: mV / 1000.0 });
    });

    // Presets Dropdown
    this.presetSelect.addEventListener('change', (e) => {
      this.loadPreset(e.target.value);
    });

    // Oscilloscope Window Selector
    this.scopeWindowSelect.addEventListener('change', (e) => {
      updateState({ timeWindow: parseFloat(e.target.value) });
    });

    // Trace Toggles
    this.traceVinToggle.addEventListener('change', (e) => {
      updateState({ showVin: e.target.checked });
    });
    this.traceVrefToggle.addEventListener('change', (e) => {
      updateState({ showVref: e.target.checked });
    });
    this.traceVoutToggle.addEventListener('change', (e) => {
      updateState({ showVout: e.target.checked });
    });
    this.traceShadeToggle.addEventListener('change', (e) => {
      updateState({ showShading: e.target.checked });
    });

    // Onboarding Banner Dismiss
    this.btnDismissBanner.addEventListener('click', () => {
      this.onboardingBanner.classList.add('dismissed');
    });

    // Educational Modal
    this.btnInfo.addEventListener('click', () => {
      this.infoModal.classList.add('active');
    });
    this.btnSubCloseModal.addEventListener('click', () => {
      this.infoModal.classList.remove('active');
    });
    this.infoModal.addEventListener('click', (e) => {
      if (e.target === this.infoModal) {
        this.infoModal.classList.remove('active');
      }
    });
  }

  selectSource(source) {
    this.sourceTabs.forEach(t => {
      const active = t.dataset.source === source;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });

    if (source === 'manual') {
      this.groupVinManual.classList.remove('disabled');
      this.waveformControls.style.display = 'none';
      this.currentModeTag.textContent = 'Manual Potentiometer';
    } else {
      this.groupVinManual.classList.add('disabled');
      this.waveformControls.style.display = 'flex';
      this.currentModeTag.textContent = `${source.toUpperCase()} Generator`;
    }

    updateState({ vinMode: source });
  }

  updateDynamicSliderLimits() {
    const vcc = this.state.vcc;
    this.sliderVin.max = String(vcc);
    this.sliderVref.max = String(vcc);
    this.sliderOffset.max = String(vcc);
    this.sliderAmp.max = String((vcc / 2).toFixed(2));

    // Re-sync values if clamped
    this.syncAllInputs();
  }

  updatePauseButtonUI(paused) {
    if (paused) {
      this.textPause.textContent = 'Resume';
      this.btnPause.classList.add('btn-primary');
      this.iconPause.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    } else {
      this.textPause.textContent = 'Pause';
      this.btnPause.classList.remove('btn-primary');
      this.iconPause.innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect>';
    }
  }

  loadPreset(presetKey) {
    switch (presetKey) {
      case 'zero-crossing':
        updateState({
          vcc: 5.0,
          vref: 2.5,
          vinMode: 'sine',
          amplitude: 2.0,
          offset: 2.5,
          frequency: 1.0,
          hysteresis: 0.0,
          noise: 0.0,
          mode: 'inverting',
          transitions: 0
        });
        this.selectSource('sine');
        break;

      case 'light-sensor':
        updateState({
          vcc: 5.0,
          vref: 2.5,
          vinMode: 'manual',
          vinManual: 1.20,
          hysteresis: 0.0,
          noise: 0.0,
          mode: 'inverting',
          transitions: 0
        });
        this.selectSource('manual');
        break;

      case 'noisy-hysteresis':
        updateState({
          vcc: 5.0,
          vref: 2.5,
          vinMode: 'sine',
          amplitude: 1.6,
          offset: 2.5,
          frequency: 0.5,
          noise: 0.12, // 120 mV noise
          hysteresis: 0.60, // 0.60 V Schmitt hysteresis
          mode: 'inverting',
          transitions: 0
        });
        this.selectSource('sine');
        break;

      case 'pwm-generator':
        updateState({
          vcc: 5.0,
          vref: 3.5,
          vinMode: 'triangle',
          amplitude: 2.2,
          offset: 2.5,
          frequency: 1.0,
          hysteresis: 0.0,
          noise: 0.0,
          mode: 'inverting',
          transitions: 0
        });
        this.selectSource('triangle');
        break;

      case 'default':
      default:
        updateState({
          vcc: 5.0,
          vref: 2.5,
          vinMode: 'manual',
          vinManual: 1.0,
          amplitude: 2.0,
          offset: 2.5,
          frequency: 0.5,
          noise: 0.0,
          hysteresis: 0.0,
          mode: 'inverting',
          transitions: 0,
          time: 0
        });
        this.selectSource('manual');
        break;
    }

    this.syncAllInputs();
  }

  syncAllInputs() {
    clampParameters();

    this.sliderVref.value = String(this.state.vref);
    this.valVref.textContent = `${this.state.vref.toFixed(2)} V`;

    this.sliderVin.value = String(this.state.vinManual);
    this.valVin.textContent = `${this.state.vinManual.toFixed(2)} V`;

    this.sliderAmp.value = String(this.state.amplitude);
    this.valAmp.textContent = `${this.state.amplitude.toFixed(2)} V`;

    this.sliderOffset.value = String(this.state.offset);
    this.valOffset.textContent = `${this.state.offset.toFixed(2)} V`;

    this.sliderFreq.value = String(this.state.frequency);
    this.valFreq.textContent = `${this.state.frequency.toFixed(1)} Hz`;

    const noiseMv = Math.round(this.state.noise * 1000);
    this.sliderNoise.value = String(noiseMv);
    this.valNoise.textContent = `${noiseMv} mV`;

    this.modeToggle.checked = this.state.mode === 'non-inverting';
    this.modeText.textContent = this.modeToggle.checked ? 'Non-Inverting (+)' : 'Inverting (−)';
    this.modeText.style.color = this.modeToggle.checked ? 'var(--vref)' : 'var(--accent)';

    this.updatePauseButtonUI(this.state.paused);
  }
}
