/**
 * circuitView.js - Dynamic SVG Circuit Renderer
 * Updates existing SVG elements in place per frame:
 * wire colors, flowing charge particles, glowing op-amp body,
 * output LED with bloom, comparison mini-gauge, and threshold crossing ripples.
 */

class CircuitView {
  constructor() {
    // DOM Elements Cache
    this.svg = document.getElementById('circuit-svg');
    this.opampBody = document.getElementById('opamp-body');
    this.crossingRipple = document.getElementById('crossing-ripple');

    // Wires
    this.wireInTop = document.getElementById('wire-in-top');
    this.wireInBot = document.getElementById('wire-in-bot');
    this.wireOut = document.getElementById('wire-out');
    this.wireVcc = document.getElementById('wire-vcc');
    this.wireGnd = document.getElementById('wire-gnd');

    // Terminal Signs (+ and - indicators)
    this.terminalTopVert = document.getElementById('terminal-top-vert');
    this.terminalBotVert = document.getElementById('terminal-bot-vert');

    // Wire Labels
    this.textInTop = document.getElementById('text-in-top');
    this.textInBot = document.getElementById('text-in-bot');
    this.textOut = document.getElementById('text-out');
    this.svgVccVal = document.getElementById('svg-vcc-val');

    // Output LED
    this.ledBloom = document.getElementById('led-bloom-disc');
    this.ledCore = document.getElementById('led-core');
    this.ledStateText = document.getElementById('led-state-text');

    // Comparison Mini-Gauge
    this.gaugeBarVin = document.getElementById('gauge-bar-vin');
    this.gaugeBarVref = document.getElementById('gauge-bar-vref');
    this.gaugeSymbol = document.getElementById('gauge-symbol');

    // Header State Badge
    this.stateBadge = document.getElementById('circuit-state-badge');
    this.badgeText = document.getElementById('badge-text');

    // Particle Groups
    this.grpParticlesInTop = document.getElementById('particles-in-top');
    this.grpParticlesInBot = document.getElementById('particles-in-bot');
    this.grpParticlesOut = document.getElementById('particles-out');

    // Initialize particles along wire paths
    this.initParticles();

    // Internal state tracking for change animations
    this.lastLogic = null;
    this.rippleProgress = 1.0; // 0 (start) to 1 (done)
    this.badgePopTimer = null;
  }

  initParticles() {
    // Path lengths: Input wires = 260px (90 to 350), Output wire = 180px (530 to 710)
    this.topParticles = this.createParticleSet(this.grpParticlesInTop, 5, '#22d3ee');
    this.botParticles = this.createParticleSet(this.grpParticlesInBot, 5, '#fbbf24');
    this.outParticles = this.createParticleSet(this.grpParticlesOut, 6, '#34d399');
  }

  createParticleSet(container, count, color) {
    const list = [];
    for (let i = 0; i < count; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '2.8');
      circle.setAttribute('fill', color);
      circle.setAttribute('opacity', '0.85');
      container.appendChild(circle);
      list.push({
        el: circle,
        progress: i / count // 0 to 1
      });
    }
    return list;
  }

  triggerRipple() {
    this.rippleProgress = 0.0;
  }

  triggerBadgePop() {
    if (!this.stateBadge) return;
    this.stateBadge.classList.remove('pop');
    void this.stateBadge.offsetWidth; // trigger reflow
    this.stateBadge.classList.add('pop');
    clearTimeout(this.badgePopTimer);
    this.badgePopTimer = setTimeout(() => {
      this.stateBadge.classList.remove('pop');
    }, 220);
  }

  /**
   * Main per-frame update method called from animation loop
   * @param {Object} state - current simulation state
   * @param {number} dt - delta time in seconds
   */
  update(state, dt) {
    const isHigh = state.logic === 1;
    const isInv = state.mode === 'inverting';

    // 1. Detect state flip for animations
    if (this.lastLogic !== null && this.lastLogic !== state.logic) {
      this.triggerRipple();
      this.triggerBadgePop();
    }
    this.lastLogic = state.logic;

    // 2. Terminal signs (+ and -) according to mode
    // Inverting: Top is (-) [terminalTopVert opacity 0], Bot is (+) [terminalBotVert opacity 1]
    // Non-Inverting: Top is (+) [terminalTopVert opacity 1], Bot is (-) [terminalBotVert opacity 0]
    if (isInv) {
      this.terminalTopVert.setAttribute('opacity', '0');
      this.terminalBotVert.setAttribute('opacity', '1');
      
      // Wire colors and labels
      this.wireInTop.setAttribute('stroke', 'var(--vin)');
      this.wireInBot.setAttribute('stroke', 'var(--vref)');
      this.textInTop.textContent = `Vin: ${state.vin.toFixed(2)} V`;
      this.textInBot.textContent = `Vref: ${state.vref.toFixed(2)} V`;
      this.textInTop.setAttribute('fill', 'var(--vin)');
      this.textInBot.setAttribute('fill', 'var(--vref)');
    } else {
      this.terminalTopVert.setAttribute('opacity', '1');
      this.terminalBotVert.setAttribute('opacity', '0');

      this.wireInTop.setAttribute('stroke', 'var(--vin)');
      this.wireInBot.setAttribute('stroke', 'var(--vref)');
      this.textInTop.textContent = `Vin: ${state.vin.toFixed(2)} V`;
      this.textInBot.textContent = `Vref: ${state.vref.toFixed(2)} V`;
      this.textInTop.setAttribute('fill', 'var(--vin)');
      this.textInBot.setAttribute('fill', 'var(--vref)');
    }

    // VCC rail text
    this.svgVccVal.textContent = `${state.vcc.toFixed(1)}V`;

    // Output voltage text & wire color
    this.textOut.textContent = `Vout: ${state.vout.toFixed(2)} V`;
    const outColor = isHigh ? 'var(--high)' : 'var(--low)';
    this.wireOut.setAttribute('stroke', outColor);
    this.textOut.setAttribute('fill', outColor);

    // Op-amp body glow & border
    this.opampBody.setAttribute('stroke', outColor);

    // 3. Output LED styling
    if (isHigh) {
      this.ledBloom.setAttribute('opacity', '0.5');
      this.ledBloom.setAttribute('fill', 'var(--high)');
      this.ledCore.setAttribute('fill', 'var(--high)');
      this.ledStateText.textContent = 'ON (1)';
      this.ledStateText.setAttribute('fill', 'var(--high)');
    } else {
      this.ledBloom.setAttribute('opacity', '0.05');
      this.ledBloom.setAttribute('fill', 'var(--low)');
      this.ledCore.setAttribute('fill', '#991b1b');
      this.ledStateText.textContent = 'OFF (0)';
      this.ledStateText.setAttribute('fill', 'var(--low)');
    }

    // 4. Comparison Mini-Gauge
    // Track height is 48px. Bar fills up from y=72 to (72 - 48 * ratio)
    const vcc = Math.max(3.0, state.vcc);
    const vinRatio = Math.max(0, Math.min(1, state.vin / vcc));
    const vrefRatio = Math.max(0, Math.min(1, state.vref / vcc));
    
    const vinH = Math.round(vinRatio * 48);
    const vrefH = Math.round(vrefRatio * 48);

    this.gaugeBarVin.setAttribute('y', String(72 - vinH));
    this.gaugeBarVin.setAttribute('height', String(vinH));

    this.gaugeBarVref.setAttribute('y', String(72 - vrefH));
    this.gaugeBarVref.setAttribute('height', String(vrefH));

    if (state.vin < state.vref) {
      this.gaugeSymbol.textContent = '<';
      this.gaugeSymbol.setAttribute('fill', isInv ? 'var(--high)' : 'var(--low)');
    } else if (state.vin > state.vref) {
      this.gaugeSymbol.textContent = '>';
      this.gaugeSymbol.setAttribute('fill', isInv ? 'var(--low)' : 'var(--high)');
    } else {
      this.gaugeSymbol.textContent = '=';
      this.gaugeSymbol.setAttribute('fill', '#ffffff');
    }

    // 5. State Badge
    if (isHigh) {
      this.stateBadge.className = 'state-badge state-high';
    } else {
      this.stateBadge.className = 'state-badge state-low';
    }
    this.badgeText.textContent = state.rule;

    // 6. Threshold Crossing Ripple Animation
    if (this.rippleProgress < 1.0) {
      this.rippleProgress += dt / 0.35; // 350ms duration
      if (this.rippleProgress > 1.0) this.rippleProgress = 1.0;
      const radius = 10 + 60 * this.rippleProgress;
      const opacity = (1.0 - this.rippleProgress) * 0.85;
      this.crossingRipple.setAttribute('r', String(radius));
      this.crossingRipple.setAttribute('opacity', String(opacity));
      this.crossingRipple.setAttribute('stroke', outColor);
    } else {
      this.crossingRipple.setAttribute('opacity', '0');
    }

    // 7. Flowing Particle Positions along wires
    if (!state.paused) {
      // Speed scales mildly with signal voltage
      const speedVin = 0.35 + 0.3 * (state.vin / vcc);
      const speedVref = 0.35 + 0.3 * (state.vref / vcc);
      const speedOut = isHigh ? (0.45 + 0.3 * (state.vout / vcc)) : 0.05;

      this.updateParticleGroup(this.topParticles, dt * speedVin, 90, 350, 160);
      this.updateParticleGroup(this.botParticles, dt * speedVref, 90, 350, 280);
      this.updateParticleGroup(this.outParticles, dt * speedOut, 530, 710, 220);

      // Color top and bot particles
      const colorTop = isInv ? 'var(--vin)' : 'var(--vin)';
      const colorBot = isInv ? 'var(--vref)' : 'var(--vref)';
      for (const p of this.topParticles) p.el.setAttribute('fill', colorTop);
      for (const p of this.botParticles) p.el.setAttribute('fill', colorBot);
      for (const p of this.outParticles) {
        p.el.setAttribute('fill', outColor);
        p.el.setAttribute('opacity', isHigh ? '0.85' : '0.15');
      }
    }
  }

  updateParticleGroup(particles, shift, xStart, xEnd, yFixed) {
    const totalDist = xEnd - xStart;
    for (const p of particles) {
      p.progress = (p.progress + shift) % 1.0;
      const currentX = xStart + p.progress * totalDist;
      p.el.setAttribute('cx', currentX.toFixed(1));
      p.el.setAttribute('cy', String(yFixed));
    }
  }
}

export { CircuitView };
